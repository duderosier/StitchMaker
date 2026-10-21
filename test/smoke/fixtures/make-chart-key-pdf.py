# Builds chart-key.pdf: chart.png on a Letter page above a typed key (real PDF text), for the key-numbers smoke check.
# Run from the repo root: python3 test/smoke/fixtures/make-chart-key-pdf.py
import io
from PIL import Image

im = Image.open('test/smoke/fixtures/chart.png').convert('RGB')
buf = io.BytesIO(); im.save(buf, 'JPEG', quality=92); jpg = buf.getvalue()
w, h = im.size
iw = 500; ih = iw * h / w
lines = [  # x, y, size, text; a title with sizes, a gridline ruler and a page number are distractors
  (56, 300, 14, 'Sunny Day  -  Design size 24 x 20 stitches, 14 count Aida'),
  (56, 270, 11, '10      20      30'),
  (56, 240, 12, 'Key   Symbol   DMC   Name'),
  (56, 222, 12, 'O   745   Yellow Pale Light'),
  (56, 204, 12, '+   3752   Antique Blue Very Light'),
  (56, 186, 12, 'X   Blanc   White'),
  (56, 150, 10, 'Page 1 of 1'),
]
def esc(t): return t.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
content = 'q %d 0 0 %.2f 56 %.2f cm /Im1 Do Q\n' % (iw, ih, 762 - ih)
content += 'BT\n' + ''.join('/F1 %d Tf 1 0 0 1 %d %d Tm (%s) Tj\n' % (s, x, y, esc(t)) for x, y, s, t in lines) + 'ET\n'
c = content.encode()
objs = [
  b'<< /Type /Catalog /Pages 2 0 R >>',
  b'<< /Type /Pages /Count 1 /Kids [3 0 R] >>',
  b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 4 0 R >> /Font << /F1 5 0 R >> >> /Contents 6 0 R >>',
  b'<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length %d >>\nstream\n' % (w, h, len(jpg)) + jpg + b'\nendstream',
  b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  b'<< /Length %d >>\nstream\n' % len(c) + c + b'endstream',
]
out = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'); offs = []
for i, o in enumerate(objs):
  offs.append(len(out)); out += b'%d 0 obj\n' % (i + 1) + o + b'\nendobj\n'
xref = len(out)
out += b'xref\n0 %d\n0000000000 65535 f \n' % (len(objs) + 1) + b''.join(b'%010d 00000 n \n' % o for o in offs)
out += b'trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n' % (len(objs) + 1, xref)
open('test/smoke/fixtures/chart-key.pdf', 'wb').write(out)
