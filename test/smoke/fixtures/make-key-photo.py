# Builds key-photo.jpg: a slightly tilted, unevenly lit phone photo of a printed key, for the key-from-a-photo
# smoke check. Run from the repo root: python3 test/smoke/fixtures/make-key-photo.py
from PIL import Image, ImageDraw, ImageFont, ImageFilter
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 34)
page = Image.new('RGB', (900, 520), (250, 248, 240))
d = ImageDraw.Draw(page)
for k, line in enumerate(['KEY       DMC    Name', 'O         745    Yellow Pale Light', '+         3752   Antique Blue Very Light', 'X         Blanc  White', 'Design size 24 x 20 stitches']):
  d.text((60, 50 + 80 * k), line, fill=(30, 30, 35), font=font)
page = page.rotate(-2.5, expand=True, fillcolor=(120, 110, 100), resample=Image.BICUBIC)
w, h = page.size
shade = Image.linear_gradient('L').resize((w, h)).point(lambda v: 255 - v // 5)  # darker toward the bottom
page = Image.composite(page, Image.new('RGB', (w, h), (0, 0, 0)), shade).filter(ImageFilter.GaussianBlur(0.8))
page.save('test/smoke/fixtures/key-photo.jpg', quality=85)
