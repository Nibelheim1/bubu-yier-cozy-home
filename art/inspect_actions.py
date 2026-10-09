# -*- coding: utf-8 -*-
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

src = Path('E:/Desktop/布布一二动作包')
out = Path(__file__).parent / 'action-contact-sheets'
out.mkdir(exist_ok=True)
font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 13)
files = sorted(src.glob('*.gif'))
records=[]
for page in range((len(files)+23)//24):
    canvas=Image.new('RGB',(1200,6*170),(225,235,219))
    draw=ImageDraw.Draw(canvas)
    for slot, p in enumerate(files[page*24:(page+1)*24]):
        im=Image.open(p)
        durations=[]
        for i in range(im.n_frames):
            im.seek(i); durations.append(im.info.get('duration',0))
        im.seek(0)
        record={'index':page*24+slot,'source':str(p),'size':list(im.size),'frames':im.n_frames,'durationMs':sum(durations),'transparent': 'transparency' in im.info}
        records.append(record)
        x=(slot%4)*300; y=(slot//4)*170
        for sub, frame in enumerate([0,im.n_frames//2]):
            im.seek(frame); pic=im.convert('RGBA'); pic.thumbnail((142,140))
            canvas.paste(pic,(x+sub*150+(142-pic.width)//2,y),pic)
        draw.text((x+3,y+140),f"{record['index']:02d} {p.stem}",fill='black',font=font)
        draw.text((x+3,y+156),f"{im.width}x{im.height}  {im.n_frames}f  {sum(durations)}ms  T:{record['transparent']}",fill='black',font=font)
    canvas.save(out/f'page-{page+1}.jpg')
(out/'inventory.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'files':len(files),'pages':(len(files)+23)//24,'output':str(out)},ensure_ascii=False))
