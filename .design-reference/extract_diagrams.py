from pathlib import Path
from pypdf import PdfReader
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent
reader = PdfReader('/Users/arya/Downloads/Updated_Software_Requirements_Specification.pdf')
for group, pages in enumerate(([6, 8, 11, 12], [13, 14, 15, 17]), 1):
    board = Image.new('RGB', (1800, 1400), 'white')
    draw = ImageDraw.Draw(board)
    for position, page_index in enumerate(pages):
        picture = reader.pages[page_index].images[0].image.convert('RGB')
        picture.thumbnail((890, 650))
        x, y = (position % 2) * 900, (position // 2) * 700
        draw.text((x + 12, y + 10), f'SRS physical page {page_index + 1}', fill='black')
        board.paste(picture, (x, y + 35))
    board.save(root / f'diagrams-{group}.png')
