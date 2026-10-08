"""Crop reference-conditioned illustrations, produce the app icon, and update provenance."""
from PIL import Image, ImageDraw
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1];a=root/'public/assets'
p=Image.open(root/'art/source/concept-poster.png');p.crop((0,0,409,247)).save(a/'story-companion.png')
p=Image.open(root/'art/source/concept-poster-02.png')
for name,b in [('garden',(739,1115,1017,1211)),('night',(739,1215,1017,1310)),('rest',(739,1313,1017,1412))]:p.crop(b).save(a/f'story-{name}.png')
icon=Image.new('RGBA',(512,512),'#e8ecd8');d=ImageDraw.Draw(icon)
d.rounded_rectangle((16,16,496,496),radius=120,fill='#faf3df',outline='#bdc9a8',width=9)
for who,x in [('bubu',-10),('yier',216)]:
 im=Image.open(a/f'{who}-face.png');im=im.crop(im.getbbox());im.thumbnail((303,320),Image.Resampling.LANCZOS);icon.alpha_composite(im,(x,150))
d.ellipse((227,94,254,121),fill='#e8b1a0');d.ellipse((250,94,277,121),fill='#e8b1a0');d.polygon([(228,110),(276,110),(253,139)],fill='#e8b1a0')
icon.convert('RGB').save(a/'app-icon.png',optimize=True)
manifest=json.loads((root/'art/manifest.json').read_text())
extra={'story-companion':'reference-conditioned image generation, concept-poster.png crop (0,0,409,247)','story-garden':'reference-conditioned image generation, concept-poster-02.png crop (739,1115,1017,1211)','story-night':'reference-conditioned image generation, concept-poster-02.png crop (739,1215,1017,1310)','story-rest':'reference-conditioned image generation, concept-poster-02.png crop (739,1313,1017,1412)','app-icon':'composite of exact user-reference character crops, no character redraw','cozy-loop':'original synthesis, scripts/make_audio.py; 24.62 seconds, mono 22050 Hz PCM'}
manifest=[m for m in manifest if m['id'] not in extra]
for id,src in extra.items():
 f=a/(id+('.wav' if id=='cozy-loop' else '.png'))
 manifest.append({'id':id,'path':'assets/'+f.name,'type':'audio' if id=='cozy-loop' else 'reference-derived illustration','source':src,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
(root/'art/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
# Visual audit sheets use the same actual runtime files.
files=sorted([p for p in a.glob('*.png') if p.stem.startswith(('bubu-','yier-'))]);sheet=Image.new('RGB',(1200,1000),'#dbdcc5');d=ImageDraw.Draw(sheet)
for i,p in enumerate(files):
 im=Image.open(p);im.thumbnail((195,208));x=i%6*200;y=i//6*250;sheet.paste(im,(x,y),im);d.text((x+10,y+213),p.stem,fill='#604a37')
sheet.save(root/'qa/character-contact-sheet.jpg',quality=94)
print('finalized',len(manifest),'runtime assets')
