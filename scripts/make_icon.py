#!/usr/bin/env python3
"""Gera os ícones do app: quadrado verde com 'R$' branco."""
from PIL import Image, ImageDraw, ImageFont

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SIZE = 1024
TOP = (0x28, 0xC7, 0x6F)     # verde claro
BOTTOM = (0x0B, 0x8C, 0x48)  # verde escuro
WHITE = (255, 255, 255, 255)
TEXT = "R$"


def gradient_bg(size=SIZE):
    img = Image.new("RGBA", (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        r = round(TOP[0] + (BOTTOM[0] - TOP[0]) * t)
        g = round(TOP[1] + (BOTTOM[1] - TOP[1]) * t)
        b = round(TOP[2] + (BOTTOM[2] - TOP[2]) * t)
        for x in range(size):
            px[x, y] = (r, g, b, 255)
    return img


def draw_text(img, font_size, fill=WHITE):
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT, font_size)
    draw.text((SIZE / 2, SIZE / 2 - 20), TEXT, font=font, fill=fill, anchor="mm")
    return img


def save(img, path):
    img.save(path)
    print("gerado:", path)


base = "assets/images"

# 1) Ícone principal (iOS/legado): fundo verde + R$ branco
icon = gradient_bg()
draw_text(icon, 560)
save(icon, f"{base}/icon.png")

# 2) Adaptive background: só o verde
save(gradient_bg(), f"{base}/android-icon-background.png")

# 3) Adaptive foreground: R$ branco na zona segura (transparente)
fg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw_text(fg, 430)
save(fg, f"{base}/android-icon-foreground.png")

# 4) Monochrome (ícone temático): R$ branco em transparente
mono = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw_text(mono, 430)
save(mono, f"{base}/android-icon-monochrome.png")

# 5) Splash: R$ branco em transparente
splash = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw_text(splash, 430)
save(splash, f"{base}/splash-icon.png")

print("OK")
