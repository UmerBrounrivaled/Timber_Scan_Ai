import os
from defect_pipeline import DefectPipeline

def run_tests():
    pipeline = DefectPipeline("wood_autoencoder.keras", threshold=0.000637013)
    samples = os.listdir("sample_images")
    print(f"Testing {len(samples)} sample images against Autoencoder threshold: {pipeline.threshold}")
    print("-" * 75)
    
    for filename in sorted(samples):
        path = os.path.join("sample_images", filename)
        with open(path, "rb") as f:
            data = f.read()
        res = pipeline.predict(data)
        verdict = "DEFECT DETECTED" if res["isDefect"] else "DEFECT FREE"
        print(f"{filename:<30} | {verdict:<15} | MSE: {res['score']:.8f} | Ratio: {res['scoreRatio']:.2f}x | {res['severity']}")

if __name__ == "__main__":
    run_tests()
