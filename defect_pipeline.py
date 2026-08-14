"""
DefectPipeline — inference pipeline for the wood-defect autoencoder.

Encapsulates preprocessing, model inference, heatmap generation, and
JSON-serializable output in one class, so a FastAPI route (or anything
else) just does:

    pipeline = DefectPipeline("wood_autoencoder.keras", threshold=0.000637013)
    result = pipeline.predict(image_bytes)
"""

import io
import time
import base64
import numpy as np
from PIL import Image
import tensorflow as tf
import matplotlib.cm as cm


class DefectPipeline:
    def __init__(self, model_path: str, threshold: float = 0.000637013, img_size: int = 256):
        """
        Load the trained model once and store the anomaly threshold.
        """
        try:
            self.model = tf.keras.models.load_model(model_path, compile=False)
        except Exception:
            self.model = tf.keras.models.load_model(model_path, safe_mode=False)
        self.threshold = float(threshold)
        self.img_size = img_size

    # ------------------------------------------------------------------
    # Preprocessing
    # ------------------------------------------------------------------
    def _preprocess(self, image_bytes: bytes) -> tuple[np.ndarray, Image.Image]:
        """
        Turn raw uploaded bytes into a (1, H, W, 3) float32 array in [0, 1],
        matching exactly what the model saw during training.
        """
        raw_img = Image.open(io.BytesIO(image_bytes))
        if raw_img.mode != "RGB":
            raw_img = raw_img.convert("RGB")

        resized_img = raw_img.resize((self.img_size, self.img_size), Image.Resampling.BILINEAR)
        arr = np.array(resized_img).astype("float32") / 255.0
        arr = np.expand_dims(arr, axis=0)  # add batch dimension
        return arr, resized_img

    # ------------------------------------------------------------------
    # Inference + error calculation
    # ------------------------------------------------------------------
    def _reconstruct_and_score(self, batch: np.ndarray):
        """
        Run the batch through the model, get the reconstruction, and
        compute the whole-image MSE.
        """
        reconstruction = self.model.predict(batch, verbose=0)
        reconstruction = np.clip(reconstruction, 0.0, 1.0)
        mse = float(np.mean((batch - reconstruction) ** 2))
        return reconstruction, mse

    # ------------------------------------------------------------------
    # Heatmap & Visual Generation
    # ------------------------------------------------------------------
    def _make_visuals(self, original: np.ndarray, reconstruction: np.ndarray) -> tuple[str, str, str]:
        """
        Build blended heatmap, raw thermal colormap, and reconstructed image as base64 PNGs.
        """
        # per-pixel squared error, averaged over channels -> (H, W)
        pixel_error = np.mean((original[0] - reconstruction[0]) ** 2, axis=-1)

        err_min, err_max = float(pixel_error.min()), float(pixel_error.max())
        if err_max - err_min > 1e-12:
            norm_error = (pixel_error - err_min) / (err_max - err_min)
        else:
            norm_error = np.zeros_like(pixel_error)

        colormap = cm.get_cmap("jet")
        heatmap_rgba = colormap(norm_error)  # (H, W, 4)
        heatmap_rgb = (heatmap_rgba[..., :3] * 255).astype("uint8")

        original_rgb = (original[0] * 255).astype("uint8")

        # 60/40 blend: heatmap dominant, original still visible underneath
        blended = (0.6 * heatmap_rgb + 0.4 * original_rgb).astype("uint8")

        # Reconstructed image
        recon_rgb = (reconstruction[0] * 255).astype("uint8")

        def _to_base64(arr_rgb: np.ndarray) -> str:
            buf = io.BytesIO()
            Image.fromarray(arr_rgb).save(buf, format="PNG")
            return base64.b64encode(buf.getvalue()).decode("utf-8")

        blended_b64 = _to_base64(blended)
        raw_heatmap_b64 = _to_base64(heatmap_rgb)
        recon_b64 = _to_base64(recon_rgb)

        return blended_b64, raw_heatmap_b64, recon_b64

    # ------------------------------------------------------------------
    # Severity assessment
    # ------------------------------------------------------------------
    def _assess_severity(self, score: float) -> tuple[str, str]:
        ratio = score / self.threshold if self.threshold > 0 else 1.0
        if ratio < 0.85:
            return "Pristine", "defect-free"
        elif ratio <= 1.0:
            return "Nominal / Clear", "defect-free"
        elif ratio <= 1.5:
            return "Minor Anomaly", "defective"
        elif ratio <= 3.0:
            return "Moderate Defect", "defective"
        else:
            return "Severe Defect", "defective"

    # ------------------------------------------------------------------
    # Main entry point
    # ------------------------------------------------------------------
    def predict(self, image_bytes: bytes) -> dict:
        """
        Full pipeline: bytes in -> JSON-compatible dict out.
        """
        start_time = time.time()
        batch, resized_img = self._preprocess(image_bytes)
        reconstruction, score = self._reconstruct_and_score(batch)
        blended_b64, raw_heatmap_b64, recon_b64 = self._make_visuals(batch, reconstruction)
        
        # Original resized base64
        buf = io.BytesIO()
        resized_img.save(buf, format="PNG")
        original_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        elapsed_ms = round((time.time() - start_time) * 1000, 1)
        is_defect = bool(score > self.threshold)
        ratio = round(score / self.threshold, 3) if self.threshold > 0 else 1.0
        severity, classification = self._assess_severity(score)
        
        # Calculate approximate anomaly percentage (> 2x mean error in defective pixels)
        pixel_error = np.mean((batch[0] - reconstruction[0]) ** 2, axis=-1)
        high_error_mask = pixel_error > (self.threshold * 1.5)
        anomaly_area_pct = round(float(np.mean(high_error_mask) * 100), 2)

        return {
            "isDefect": is_defect,
            "score": float(f"{score:.8f}"),
            "threshold": float(f"{self.threshold:.8f}"),
            "scoreRatio": ratio,
            "severity": severity,
            "classification": classification,
            "anomalyAreaPct": anomaly_area_pct,
            "inferenceTimeMs": elapsed_ms,
            "heatmap": blended_b64,
            "rawHeatmap": raw_heatmap_b64,
            "reconstruction": recon_b64,
            "originalImage": original_b64,
        }
