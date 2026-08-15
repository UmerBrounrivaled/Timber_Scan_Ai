"""
FastAPI backend for the Wood Defect Detector.

Endpoints:
  GET  /                          -> health check and model info
  GET  /samples                   -> list available sample images with labels & categories
  GET  /samples/files/{filename}  -> serve a sample image raw file
  POST /predict-sample/{filename} -> run inference on a selected sample image
  POST /predict                   -> run inference on a user-uploaded image

Run locally with:
  uvicorn main:app --reload --port 8000
"""

import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse

from defect_pipeline import DefectPipeline

# ----------------------------------------------------------------------
# Config
# ----------------------------------------------------------------------
MODEL_PATH = "wood_autoencoder.keras"
THRESHOLD = 0.000637013
SAMPLES_DIR = "sample_images"

# ----------------------------------------------------------------------
# App setup
# ----------------------------------------------------------------------
app = FastAPI(
    title="AI Wood Defect Detection API",
    description="Deep Learning Autoencoder Inference Engine for MVTec Wood Anomaly Detection",
    version="1.0.0"
)

# Open CORS configuration for development and local frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = DefectPipeline(MODEL_PATH, threshold=THRESHOLD)

os.makedirs(SAMPLES_DIR, exist_ok=True)
app.mount("/samples/files", StaticFiles(directory=SAMPLES_DIR), name="sample_files")

VALID_EXTENSIONS = (".png", ".jpg", ".jpeg")

# Serve built frontend static files if frontend/dist exists
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(os.path.join(FRONTEND_DIST, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="frontend_assets")

# ----------------------------------------------------------------------
# Sample Categorization Helper
# ----------------------------------------------------------------------
def get_sample_metadata(filename: str) -> dict:
    lower = filename.lower()
    if "knot" in lower:
        category = "Knot"
        desc = "Localized structural wood knot defect"
        expected = "Defective"
    elif "crack" in lower or "split" in lower:
        category = "Crack"
        desc = "Surface longitudinal split or crack"
        expected = "Defective"
    elif "hole" in lower:
        category = "Hole"
        desc = "Perforation or deep void defect"
        expected = "Defective"
    elif "scratch" in lower:
        category = "Scratch"
        desc = "Linear surface abrasion defect"
        expected = "Defective"
    elif "color" in lower or "stain" in lower:
        category = "Discoloration"
        desc = "Chemical or biological wood stain"
        expected = "Defective"
    elif "defect" in lower or "anomaly" in lower:
        category = "Surface Defect"
        desc = "General wood grain anomaly"
        expected = "Defective"
    else:
        category = "Normal / Good"
        desc = "Standard uniform wood grain texture"
        expected = "Defect-Free"

    return {
        "filename": filename,
        "name": filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title(),
        "category": category,
        "description": desc,
        "expected": expected,
        "url": f"/samples/files/{filename}"
    }


# ----------------------------------------------------------------------
# Routes
# ----------------------------------------------------------------------
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Wood Defect Detection API",
        "modelLoaded": True,
        "threshold": THRESHOLD,
        "imgSize": 256,
    }


@app.get("/")
def read_root():
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return health_check()



@app.get("/samples")
def list_samples():
    """
    Returns the list of curated sample images sitting in sample_images/
    along with category labels and metadata.
    """
    if not os.path.exists(SAMPLES_DIR):
        return {"samples": []}

    files = [f for f in os.listdir(SAMPLES_DIR) if f.lower().endswith(VALID_EXTENSIONS)]
    samples = [get_sample_metadata(f) for f in sorted(files)]
    return {"samples": samples, "count": len(samples)}


@app.post("/predict-sample/{filename}")
def predict_sample(filename: str):
    """
    Runs inference on a pre-loaded sample image by filename.
    """
    path = os.path.join(SAMPLES_DIR, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Sample image file not found")

    try:
        with open(path, "rb") as f:
            image_bytes = f.read()
        result = pipeline.predict(image_bytes)
        result["filename"] = filename
        result["metadata"] = get_sample_metadata(filename)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed on sample: {str(e)}")


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Accepts an uploaded image (multipart/form-data), runs it through the
    autoencoder pipeline, and returns complete visual and diagnostic metrics.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image")

    try:
        image_bytes = await file.read()
        result = pipeline.predict(image_bytes)
        result["filename"] = file.filename
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference processing failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
