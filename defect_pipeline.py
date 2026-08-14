"""
DefectPipeline — robust inference pipeline for the wood-defect autoencoder.

Uses a multi-scale anomaly detector combining:
1. Global Mean Squared Error (for wide-area stains / defects)
2. Top Percentile Peak Error (P95 and P99) for small localized anomalies (holes, scratches, cracks)
"""

import io
import time
import base64
import numpy as np
from PIL import Image, ImageFilter
import tensorflow as tf
import matplotlib.cm as cm


class DefectPipeline:
    def __init__(self, model_path: str, threshold: float = 0.000637013, img_size: int = 256):
        """
        Load the trained model once and calibrate multi-scale anomaly thresholds.
        """
        try:
            self.model = tf.keras.models.load_model(model_path, compile=False)
        except Exception:
            self.model = tf.keras.models.load_model(model_path, safe_mode=False)

        self.threshold = float(threshold)
        self.img_size = img_size

        # Calibrated benchmark cutoffs for MVTec Wood
        self.mean_cutoff = 0.000550
        self.p95_cutoff = 0.001350
        self.p99_cutoff = 0.005000

    # ------------------------------------------------------------------
    # Preprocessing
    # ------------------------------------------------------------------
    def _preprocess(self, image_bytes: bytes) -> tuple[np.ndarray, Image.Image]:
        raw_img = Image.open(io.BytesIO(image_bytes))
        if raw_img.mode != "RGB":
            raw_img = raw_img.convert("RGB")

        resized_img = raw_img.resize((self.img_size, self.img_size), Image.Resampling.BILINEAR)
        arr = np.array(resized_img).astype("float32") / 255.0
        arr = np.expand_dims(arr, axis=0)
        return arr, resized_img

    # ------------------------------------------------------------------
    # Inference + Multi-Scale Error Calculation
    # ------------------------------------------------------------------
    def _reconstruct_and_score(self, batch: np.ndarray):
        reconstruction = self.model.predict(batch, verbose=0)
        reconstruction = np.clip(reconstruction, 0.0, 1.0)
        
        # Per-pixel squared error: shape (H, W)
        pixel_error = np.mean((batch[0] - reconstruction[0]) ** 2, axis=-1)
        
        mean_mse = float(np.mean(pixel_error))
        p95_mse = float(np.percentile(pixel_error, 95))
        p99_mse = float(np.percentile(pixel_error, 99))
        max_mse = float(np.max(pixel_error))

        # Composite multi-scale ratio
        mean_ratio = mean_mse / self.mean_cutoff
        p95_ratio = p95_mse / self.p95_cutoff
        p99_ratio = p99_mse / self.p99_cutoff

        # Deciding score ratio
        dominant_ratio = max(mean_ratio, p95_ratio, p99_ratio)
        
        return reconstruction, pixel_error, mean_mse, dominant_ratio, p95_mse, p99_mse, max_mse

    # ------------------------------------------------------------------
    # Heatmap Generation
    # ------------------------------------------------------------------
    def _make_visuals(self, original: np.ndarray, reconstruction: np.ndarray, pixel_error: np.ndarray) -> tuple[str, str, str]:
        # Clip outlier spikes for smoother thermal map
        p99_val = np.percentile(pixel_error, 99.5)
        clipped_error = np.clip(pixel_error, 0.0, max(p99_val, 0.005))
        
        err_min, err_max = float(clipped_error.min()), float(clipped_error.max())
        if err_max - err_min > 1e-12:
            norm_error = (clipped_error - err_min) / (err_max - err_min)
        else:
            norm_error = np.zeros_like(clipped_error)

        colormap = cm.get_cmap("jet")
        heatmap_rgba = colormap(norm_error)
        heatmap_rgb = (heatmap_rgba[..., :3] * 255).astype("uint8")

        original_rgb = (original[0] * 255).astype("uint8")

        # 60/40 blend: heatmap dominant, original still visible
        blended = (0.6 * heatmap_rgb + 0.4 * original_rgb).astype("uint8")
        recon_rgb = (reconstruction[0] * 255).astype("uint8")

        def _to_base64(arr_rgb: np.ndarray) -> str:
            buf = io.BytesIO()
            Image.fromarray(arr_rgb).save(buf, format="PNG")
            return base64.b64encode(buf.getvalue()).decode("utf-8")

        return _to_base64(blended), _to_base64(heatmap_rgb), _to_base64(recon_rgb)

    # ------------------------------------------------------------------
    # Severity Assessment
    # ------------------------------------------------------------------
    def _assess_severity(self, ratio: float) -> tuple[str, str]:
        if ratio < 0.85:
            return "Pristine", "defect-free"
        elif ratio <= 1.0:
            return "Nominal / Clear", "defect-free"
        elif ratio <= 1.5:
            return "Minor Anomaly", "defective"
        elif ratio <= 2.8:
            return "Moderate Defect", "defective"
        else:
            return "Severe Defect", "defective"

    # ------------------------------------------------------------------
    # Main Prediction Entrypoint
    # ------------------------------------------------------------------
    def predict(self, image_bytes: bytes) -> dict:
        start_time = time.time()
        batch, resized_img = self._preprocess(image_bytes)
        reconstruction, pixel_error, mean_mse, score_ratio, p95_mse, p99_mse, max_mse = self._reconstruct_and_score(batch)
        blended_b64, raw_heatmap_b64, recon_b64 = self._make_visuals(batch, reconstruction, pixel_error)

        buf = io.BytesIO()
        resized_img.save(buf, format="PNG")
        original_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        elapsed_ms = round((time.time() - start_time) * 1000, 1)
        is_defect = bool(score_ratio > 1.0)
        severity, classification = self._assess_severity(score_ratio)

        # High error pixel region percentage
        high_error_mask = pixel_error > self.p95_cutoff
        anomaly_area_pct = round(float(np.mean(high_error_mask) * 100), 2)
        if not is_defect:
            anomaly_area_pct = 0.0

        return {
            "isDefect": is_defect,
            "score": float(f"{mean_mse:.8f}"),
            "threshold": float(f"{self.threshold:.8f}"),
            "scoreRatio": round(float(score_ratio), 2),
            "severity": severity,
            "classification": classification,
            "anomalyAreaPct": anomaly_area_pct,
            "p95Error": float(f"{p95_mse:.8f}"),
            "p99Error": float(f"{p99_mse:.8f}"),
            "inferenceTimeMs": elapsed_ms,
            "heatmap": blended_b64,
            "rawHeatmap": raw_heatmap_b64,
            "reconstruction": recon_b64,
            "originalImage": original_b64,
        }
