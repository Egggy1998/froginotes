import math
from PIL import Image, ImageDraw

def create_frog_icon():
    size = 256
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Green frog palette
    BODY_COLOR = (168, 216, 172, 255)       # #A8D8AC
    STROKE_COLOR = (42, 82, 53, 255)        # #2A5235
    EYE_PUPIL = (30, 43, 32, 255)           # #1E2B20
    CHEEK_COLOR = (252, 165, 165, 210)      # #FCA5A5
    MOUTH_TONGUE = (225, 123, 119, 255)     # #E17B77
    WHITE = (255, 255, 255, 255)

    # Left eye bump
    draw.ellipse([50, 45, 110, 105], fill=BODY_COLOR, outline=STROKE_COLOR, width=6)
    # Right eye bump
    draw.ellipse([146, 45, 206, 105], fill=BODY_COLOR, outline=STROKE_COLOR, width=6)

    # Main head / body
    draw.ellipse([25, 70, 231, 235], fill=BODY_COLOR, outline=STROKE_COLOR, width=7)

    # Redraw eye inner fills over head overlap
    draw.ellipse([54, 49, 106, 101], fill=BODY_COLOR)
    draw.ellipse([150, 49, 202, 101], fill=BODY_COLOR)

    # Eye pupils
    # Left eye
    draw.ellipse([67, 62, 97, 92], fill=EYE_PUPIL)
    draw.ellipse([70, 65, 80, 75], fill=WHITE)
    draw.ellipse([86, 80, 91, 85], fill=WHITE)

    # Right eye
    draw.ellipse([159, 62, 189, 92], fill=EYE_PUPIL)
    draw.ellipse([162, 65, 172, 75], fill=WHITE)
    draw.ellipse([178, 80, 183, 85], fill=WHITE)

    # Cheeks
    draw.ellipse([45, 140, 75, 160], fill=CHEEK_COLOR)
    draw.ellipse([181, 140, 211, 160], fill=CHEEK_COLOR)

    # Big open cute smile
    draw.chord([95, 130, 161, 175], start=0, end=180, fill=MOUTH_TONGUE, outline=STROKE_COLOR, width=6)

    # Save PNG and ICO
    img.save('icon.png')
    img.save('icon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print("icon.ico created successfully!")

if __name__ == '__main__':
    create_frog_icon()
