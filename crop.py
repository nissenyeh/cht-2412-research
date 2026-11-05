# 把照片裁成指定長寬比（officeknife 的 fit:"cover" 預覽不裁切），deck.mjs 渲染時呼叫
import sys
from PIL import Image
src, dst, w, h = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
im = Image.open(src).convert("RGB")
W, H = im.size
r = w / h
if W / H > r:
    nw = int(H * r); x = (W - nw) // 2; im = im.crop((x, 0, x + nw, H))
else:
    nh = int(W / r); y = max(0, int((H - nh) * 0.35)); im = im.crop((0, y, W, y + nh))
im.save(dst, quality=90)
