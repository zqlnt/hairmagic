import os
import time
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from diffusers import StableDiffusionInpaintPipeline
import torch
import numpy as np
from PIL import Image
from io import BytesIO

app = Flask(__name__)
CORS(app)

device = "cuda" if torch.cuda.is_available() else "cpu"
model_path = "runwayml/stable-diffusion-inpainting"

try:
    pipe = StableDiffusionInpaintPipeline.from_pretrained(
        model_path,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    ).to(device)
except Exception as e:
    print(f"Error loading model: {e}")
    raise e

def download_image(file_path):
    return Image.open(file_path).convert("RGB")

def image_grid(images, rows, cols):
    assert len(images) == rows * cols

    w, h = images[0].size
    grid = Image.new('RGB', size=(cols * w, rows * h))
    
    for i, img in enumerate(images):
        grid.paste(img, box=(i % cols * w, i // cols * h))
    return grid

def generate_hair_images(image, mask_image):
    image = image.resize((512, 512))
    mask_image = mask_image.resize((512, 512))

    prompt = ("Create a realistic image of human hair that best suits the personality of a specific character. "
              "The hair should have natural texture, color, and volume, and be detailed and lifelike, suitable for close-up views or character modeling. "
              "The hair type, color, and style should complement the character's personality and overall appearance. "
              "The character has a confident and sophisticated personality.")  # Shortened the prompt
    guidance_scale = 7.5
    num_samples = 3
    generator = torch.Generator(device=device).manual_seed(0)

    try:
        images = pipe(
            prompt=prompt,
            image=image,
            mask_image=mask_image,
            guidance_scale=guidance_scale,
            generator=generator,
            num_images_per_prompt=num_samples,
        ).images
    except Exception as e:
        print(f"Error generating images: {e}")
        raise e

    images.insert(0, image)
    grid_image = image_grid(images, 1, num_samples + 1)
    
    return images, grid_image

@app.route('/generate', methods=['POST'])
def generate():
    image_file = request.files.get('image')
    mask_image_file = request.files.get('mask_image')
    
    if not image_file or not mask_image_file:
        return jsonify({"error": "Missing image or mask image"}), 400

    try:
        image = Image.open(image_file).convert("RGB")
        mask_image = Image.open(mask_image_file).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Error processing images: {e}"}), 400

    output_dir = "generated_images"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    timestamp = str(int(time.time()))
    original_image_path = os.path.join(output_dir, f"original_{timestamp}.png")
    mask_image_path = os.path.join(output_dir, f"mask_{timestamp}.png")
    image.save(original_image_path)
    mask_image.save(mask_image_path)

    try:
        generated_images, grid_image = generate_hair_images(image, mask_image)
    except Exception as e:
        return jsonify({"error": f"Error generating hair images: {e}"}), 500

    generated_image_paths = []
    for idx, img in enumerate(generated_images[1:], start=1):
        generated_image_path = os.path.join(output_dir, f"generated_{timestamp}_{idx}.png")
        img.save(generated_image_path)
        generated_image_paths.append(generated_image_path)

    grid_image_path = os.path.join(output_dir, f"grid_{timestamp}.png")
    grid_image.save(grid_image_path)

    img_byte_arr = BytesIO()
    grid_image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    return send_file(img_byte_arr, mimetype='image/png')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
