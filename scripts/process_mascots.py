import os
from PIL import Image

SRC_DIR = r"C:\Users\pc\AppData\Roaming\Hermes\composer-images"
DEST_DIR = r"D:\Dự án làm việc\sticky note\public\mascots"
os.makedirs(DEST_DIR, exist_ok=True)

MAPPINGS = [
    ("ChatGPT_Image_10_13_24_10_thg_9_2026_1_49d6e3.png", "frog-happy.png"),
    ("ChatGPT_Image_10_13_25_10_thg_9_2026_2_f77a9c.png", "frog-wink.png"),
    ("ChatGPT_Image_10_13_26_10_thg_9_2026_3_25425b.png", "frog-sleepy.png"),
    ("ChatGPT_Image_10_13_27_10_thg_9_2026_4_8a0b11.png", "frog-sparkle.png"),
    ("ChatGPT_Image_10_13_27_10_thg_9_2026_5_4f1bab.png", "frog-thinking.png"),
    ("ChatGPT_Image_10_13_29_10_thg_9_2026_6_705e50.png", "frog-surprised.png"),
    ("ChatGPT_Image_10_13_29_10_thg_9_2026_7_dbbd22.png", "frog-love.png"),
    ("ChatGPT_Image_10_13_30_10_thg_9_2026_8_ebe688.png", "frog-confident.png"),
]

def main():
    for src_file, dest_file in MAPPINGS:
        src_path = os.path.join(SRC_DIR, src_file)
        dest_path = os.path.join(DEST_DIR, dest_file)
        if not os.path.exists(src_path):
            print(f"Not found: {src_path}")
            continue

        orig = Image.open(src_path).convert("RGBA")
        # Resize cleanly to 384x384 for sharp high-DPI display while keeping file size light
        resized = orig.resize((384, 384), Image.Resampling.LANCZOS)
        resized.save(dest_path, "PNG")
        print(f"Saved transparent mascot: {dest_file}, size: {resized.size}, corner: {resized.getpixel((0,0))}")

    # Generate app icon.ico and icon.png from frog-happy.png
    happy_path = os.path.join(DEST_DIR, "frog-happy.png")
    if os.path.exists(happy_path):
        happy_img = Image.open(happy_path).convert("RGBA")
        happy_img.resize((256, 256), Image.Resampling.LANCZOS).save("icon.png")
        happy_img.save("icon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
        print("Updated icon.ico and icon.png with genuine transparent frog mascot!")

if __name__ == "__main__":
    main()
