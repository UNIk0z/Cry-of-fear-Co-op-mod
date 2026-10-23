"""v0.5.2: the "Join Simon's Story" box, drawn on the game's own computer screen.

  python -I scripts/menu/make-joinbox.py <game>/gfx/vgui/puzzle/computer/computer_logon.tga <out.tga>

Katz (2026-10-23): the v0.5.1 box was a black picture with a small panel in
the middle. The join box is the game's computer login panel (client-menu.hpp
join_box_patches), so it now shows that panel's own monitor and login window
with the co-op texts: title "Join Simon's Story", Host IP and Port instead of
user name and password, Join instead of OK; the "Log on to" row, the two
inactive buttons and the sticky note are painted over with the window's own
background. The panel's fields and buttons stay where the game puts them:
fields at (160,204) and (160,231), 239 x 16; Join (157,320) and Cancel
(238,320), 75 x 23; the red power button (478,447) closes it.
The result is the game's picture changed, so the package ships only an XOR
delta and Install rebuilds it from the player's own file (like sc_logo.tga).
Needs Pillow (on the packaging PC only).
"""
import sys

from PIL import Image, ImageDraw, ImageFont

FONTS = 'C:/Windows/Fonts/'


def read_tga(path):
    data = open(path, 'rb').read()
    if data[2] != 2 or data[16] != 24 or data[0] or data[1]:
        raise SystemExit('expected an uncompressed 24-bit TGA')
    w, h = int.from_bytes(data[12:14], 'little'), int.from_bytes(data[14:16], 'little')
    img = Image.frombytes('RGB', (w, h), data[18:18 + w * h * 3], 'raw', 'BGR')
    if not data[17] & 0x20:
        img = img.transpose(Image.FLIP_TOP_BOTTOM)
    return data[:18], img, data[18 + w * h * 3:]


def write_tga(path, header, img, tail):
    if not header[17] & 0x20:
        img = img.transpose(Image.FLIP_TOP_BOTTOM)
    open(path, 'wb').write(header + img.tobytes('raw', 'BGR') + tail)


def fill_rows(px, x0, y0, x1, y1):
    """Paint a box with each row blended between the pixels just left and right of it."""
    for y in range(y0, y1 + 1):
        a, b = px[x0 - 1, y], px[x1 + 1, y]
        for x in range(x0, x1 + 1):
            t = (x - x0 + 1) / (x1 - x0 + 2)
            px[x, y] = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def fill_columns(px, x0, y0, x1, y1):
    """Paint a box with each column blended between the pixels just above and below it."""
    for x in range(x0, x1 + 1):
        a, b = px[x, y0 - 1], px[x, y1 + 1]
        for y in range(y0, y1 + 1):
            t = (y - y0 + 1) / (y1 - y0 + 2)
            px[x, y] = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def text(draw, xy, s, font, fill, shadow=None, anchor='la'):
    if shadow:
        draw.text((xy[0] + 1, xy[1] + 1), s, font=font, fill=shadow, anchor=anchor)
    draw.text(xy, s, font=font, fill=fill, anchor=anchor)


def main(source, target):
    header, img, tail = read_tga(source)
    if img.size != (554, 480):
        raise SystemExit('unexpected computer_logon.tga size')
    px = img.load()
    # Title bar, banner texts and logo, copyright line, the "Dorrar" mark.
    fill_rows(px, 75, 72, 200, 87)
    fill_columns(px, 132, 98, 418, 160)
    fill_columns(px, 74, 161, 232, 174)
    fill_columns(px, 432, 161, 482, 175)
    # Form: the two labels, the "Log on to" row, OK's text, Shut Down and Options.
    fill_columns(px, 77, 203, 150, 248)
    fill_columns(px, 77, 255, 403, 280)
    fill_rows(px, 183, 324, 208, 339)
    fill_columns(px, 318, 317, 476, 345)
    # The café's sticky note on the monitor.
    fill_rows(px, 12, 430, 60, 478)
    draw = ImageDraw.Draw(img)
    bold = lambda size: ImageFont.truetype(FONTS + 'tahomabd.ttf', size)
    plain = lambda size: ImageFont.truetype(FONTS + 'tahoma.ttf', size)
    text(draw, (79, 73), "Join Simon's Story", bold(13), (126, 120, 132))
    text(draw, (277, 122), 'CRY OF FEAR', ImageFont.truetype(FONTS + 'arialbd.ttf', 30), (250, 246, 248), (92, 66, 62), 'mm')
    text(draw, (277, 147), 'Co-op', plain(16), (238, 226, 226), (92, 66, 62), 'mm')
    text(draw, (78, 164), 'Connect to a friend who hosts the story.', plain(10), (238, 228, 228))
    dark = (40, 26, 22)
    text(draw, (81, 205), 'Host IP:', plain(12), dark)
    text(draw, (81, 232), 'Port:', plain(12), dark)
    text(draw, (161, 258), 'Leave the port empty for 27015.', plain(11), (96, 70, 60))
    text(draw, (194, 331), 'Join', plain(12), dark, anchor='mm')
    write_tga(target, header, img, tail)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
