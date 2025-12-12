import os
from PIL import Image

INPUT_DIR = "images"
MAX_WIDTH = 800
QUALITY = 75

def compress_and_convert(path):
    try:
        img = Image.open(path).convert("RGB")
    except:
        print("Skipping (not an image):", path)
        return

    # Resize
    w, h = img.size
    if w > MAX_WIDTH:
        ratio = MAX_WIDTH / float(w)
        new_size = (MAX_WIDTH, int(h * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    # Convert to .webp
    new_path = os.path.splitext(path)[0] + ".webp"
    img.save(new_path, "webp", quality=QUALITY)

    # Remove old file if extension changed
    if new_path != path:
        os.remove(path)

    print("Optimized:", new_path)


def process_folder():
    if not os.path.exists(INPUT_DIR):
        print("Images folder not found.")
        return

    for filename in os.listdir(INPUT_DIR):
        full_path = os.path.join(INPUT_DIR, filename)

        if os.path.isfile(full_path):
            compress_and_convert(full_path)

    print("\nDone. All images optimized.")


if __name__ == "__main__":
    process_folder()
