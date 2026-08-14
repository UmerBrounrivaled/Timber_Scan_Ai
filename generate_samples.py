"""
Generate realistic wood samples (Normal and various defects: Knots, Cracks, Holes, Scratches, Discoloration)
for the sample picker gallery in sample_images/.
"""

import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = "sample_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_wood_texture(seed=42, base_color=(198, 142, 85), grain_strength=25.0):
    np.random.seed(seed)
    w, h = 256, 256
    
    # Generate vertical wood grain lines with Perlin-like waves
    x = np.linspace(0, 10, w)
    y = np.linspace(0, 40, h)
    xx, yy = np.meshgrid(x, y)
    
    # Grain rings / stripes
    grain = np.sin(xx * 3.0 + np.sin(yy * 0.2) * 2.0) + 0.5 * np.sin(xx * 6.0)
    noise = np.random.normal(0, 0.15, (h, w))
    grain_map = (grain + noise) * grain_strength
    
    img_arr = np.zeros((h, w, 3), dtype=np.float32)
    for c in range(3):
        channel = base_color[c] + grain_map * (0.8 if c == 0 else 0.6 if c == 1 else 0.4)
        img_arr[..., c] = np.clip(channel, 0, 255)
        
    return Image.fromarray(img_arr.astype(np.uint8))


def make_normal_sample(name, seed, base_col):
    img = generate_wood_texture(seed=seed, base_color=base_col, grain_strength=18.0)
    img = img.filter(ImageFilter.SMOOTH)
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Generated {name}.png")


def make_knot_defect(name, seed=101):
    img = generate_wood_texture(seed=seed, base_color=(190, 135, 80))
    draw = ImageDraw.Draw(img)
    # Knot center
    cx, cy = 135, 120
    for r in range(38, 5, -3):
        shade = int(50 + (38 - r) * 2.5)
        draw.ellipse([cx - r, cy - int(r * 0.8), cx + r, cy + int(r * 0.8)], fill=(shade, int(shade * 0.6), int(shade * 0.3)), outline=(30, 20, 10))
    img = img.filter(ImageFilter.GaussianBlur(radius=0.8))
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Generated {name}.png")


def make_crack_defect(name, seed=202):
    img = generate_wood_texture(seed=seed, base_color=(185, 130, 75))
    draw = ImageDraw.Draw(img)
    # Dark jagged crack line along the grain
    points = [
        (120, 30), (122, 60), (118, 90), (124, 130), (119, 170), (123, 210), (121, 240)
    ]
    draw.line(points, fill=(25, 15, 10), width=4)
    # small branch
    draw.line([(124, 130), (135, 155), (142, 175)], fill=(30, 20, 12), width=3)
    img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Generated {name}.png")


def make_hole_defect(name, seed=303):
    img = generate_wood_texture(seed=seed, base_color=(205, 148, 92))
    draw = ImageDraw.Draw(img)
    # Dark hole with rough edge
    cx, cy = 110, 140
    draw.ellipse([cx - 24, cy - 24, cx + 24, cy + 24], fill=(15, 10, 8), outline=(5, 3, 2))
    draw.ellipse([cx - 18, cy - 18, cx + 18, cy + 18], fill=(5, 4, 3))
    img = img.filter(ImageFilter.GaussianBlur(radius=0.7))
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Generated {name}.png")


def make_scratch_defect(name, seed=404):
    img = generate_wood_texture(seed=seed, base_color=(195, 140, 85))
    draw = ImageDraw.Draw(img)
    # Diagonal bright/white scratched mark across grain
    draw.line([(40, 60), (220, 195)], fill=(245, 235, 220), width=3)
    draw.line([(55, 50), (230, 180)], fill=(240, 228, 210), width=2)
    img = img.filter(ImageFilter.GaussianBlur(radius=0.6))
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Generated {name}.png")


def make_discoloration_defect(name, seed=505):
    img = generate_wood_texture(seed=seed, base_color=(192, 138, 82))
    draw = ImageDraw.Draw(img)
    # Dark wet or chemical stain patch
    draw.ellipse([70, 80, 185, 180], fill=(70, 50, 40))
    img = img.filter(ImageFilter.GaussianBlur(radius=15.0))
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Generated {name}.png")


if __name__ == "__main__":
    make_normal_sample("normal_wood_01", seed=10, base_col=(195, 140, 85))
    make_normal_sample("normal_wood_02", seed=20, base_col=(205, 150, 95))
    make_normal_sample("normal_wood_03", seed=30, base_col=(188, 132, 78))
    make_knot_defect("wood_knot_defect")
    make_crack_defect("wood_crack_defect")
    make_hole_defect("wood_hole_defect")
    make_scratch_defect("wood_scratch_defect")
    make_discoloration_defect("wood_discoloration_defect")
    print(f"Successfully generated {len(os.listdir(OUTPUT_DIR))} sample images.")
