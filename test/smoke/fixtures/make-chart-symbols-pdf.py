# Builds chart-symbols.pdf: a black-and-white vector chart whose symbols and key are real PDF text, the way
# shop charts are printed, for the symbol-to-key smoke check. Run from the repo root:
#   python3 test/smoke/fixtures/make-chart-symbols-pdf.py
COLS, ROWS, CELL, X0, TOP = 24, 20, 18, 90, 720
WIDTH = {'O': 0.778, '+': 0.584, 'X': 0.667}

def symbol(x, y):  # the same layout as chart.png: dots of one thread, blocks of another, crosses of a third
  x, y = x % 12, y % 10
  if y < 4: return 'O' if x < 6 else '+'
  if y < 7 and 3 <= x < 9: return 'X'
  return None

ops = []
def line(x1, y1, x2, y2): ops.append('%.2f %.2f m %.2f %.2f l S' % (x1, y1, x2, y2))
def text(size, x, y, s): ops.append('BT /F1 %d Tf 1 0 0 1 %.2f %.2f Tm (%s) Tj ET' % (size, x, y, s.replace('(', '\\(').replace(')', '\\)')))

ops.append('0 g')
for y in range(ROWS):
  for x in range(COLS):
    s = symbol(x, y)
    if s:
      cx, cy = X0 + (x + 0.5) * CELL, TOP - (y + 0.5) * CELL
      text(12, cx - WIDTH[s] * 6, cy - 4.2, s)
ops.append('0.5 w 0.6 G')
for i in range(COLS + 1): line(X0 + i * CELL, TOP, X0 + i * CELL, TOP - ROWS * CELL)
for j in range(ROWS + 1): line(X0, TOP - j * CELL, X0 + COLS * CELL, TOP - j * CELL)
ops.append('1.5 w 0 G')
for i in range(0, COLS + 1, 10): line(X0 + i * CELL, TOP, X0 + i * CELL, TOP - ROWS * CELL)
for j in range(0, ROWS + 1, 10): line(X0, TOP - j * CELL, X0 + COLS * CELL, TOP - j * CELL)
line(X0 + COLS * CELL, TOP, X0 + COLS * CELL, TOP - ROWS * CELL); line(X0, TOP - ROWS * CELL, X0 + COLS * CELL, TOP - ROWS * CELL)
ops.append('0 g')
text(8, X0 + 10 * CELL - 4, TOP + 4, '10'); text(8, X0 + 20 * CELL - 4, TOP + 4, '20')
for k, l in enumerate(['Key   Symbol   DMC   Name', 'O   745   Yellow Pale Light', '+   3752   Antique Blue Very Light', 'X   310   Black']):
  text(12, X0, TOP - ROWS * CELL - 40 - 18 * k, l)
text(10, X0, 60, 'Page 1 of 1')

c = '\n'.join(ops).encode()
objs = [
  b'<< /Type /Catalog /Pages 2 0 R >>',
  b'<< /Type /Pages /Count 1 /Kids [3 0 R] >>',
  b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  b'<< /Length %d >>\nstream\n' % len(c) + c + b'\nendstream',
]
out = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'); offs = []
for i, o in enumerate(objs):
  offs.append(len(out)); out += b'%d 0 obj\n' % (i + 1) + o + b'\nendobj\n'
xref = len(out)
out += b'xref\n0 %d\n0000000000 65535 f \n' % (len(objs) + 1) + b''.join(b'%010d 00000 n \n' % o for o in offs)
out += b'trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n' % (len(objs) + 1, xref)
open('test/smoke/fixtures/chart-symbols.pdf', 'wb').write(out)
