import os
import urllib.request
from PIL import Image

BASE_URL = "https://huggingface.co/datasets/foersben/mvtec-ad/resolve/main/wood"
OUTPUT_DIR = "sample_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLES_TO_DOWNLOAD = [
    ("normal_wood_01.png", f"{BASE_URL}/train/good/000.png"),
    ("normal_wood_02.png", f"{BASE_URL}/train/good/001.png"),
    ("normal_wood_03.png", f"{BASE_URL}/train/good/002.png"),
    ("normal_wood_04.png", f"{BASE_URL}/train/good/003.png"),
    ("wood_hole_defect.png", f"{BASE_URL}/test/hole/000.png"),
    ("wood_scratch_defect.png", f"{BASE_URL}/test/scratch/000.png"),
    ("wood_combined_defect.png", f"{BASE_URL}/test/combined/000.png"),
    ("wood_color_defect.png", f"{BASE_URL}/test/color/000.png"),
    ("wood_liquid_stain_defect.png", f"{BASE_URL}/test/liquid/000.png"),
]

def download_and_resize():
    print("Downloading genuine MVTec Wood benchmark images...")
    for filename, url in SAMPLES_TO_DOWNLOAD:
        target_path = os.path.join(OUTPUT_DIR, filename)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
            with open(target_path, "wb") as f:
                f.write(data)
            
            # Ensure proper 256x256 format for web preview
            img = Image.open(target_path).convert("RGB")
            img = img.resize((256, 256), Image.Resampling.LANCZOS)
            img.save(target_path, format="PNG")
            print(f"  [OK] Successfully saved: {filename}")
        except Exception as e:
            print(f"  [FAIL] Failed {filename} from {url}: {e}")

if __name__ == "__main__":
    download_and_resize()
