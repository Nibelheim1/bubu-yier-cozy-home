"""Generate original, raster game art and cut approved reference-based characters.
No character geometry is reconstructed by code. Character pixels come from the
user's supplied reference art. UI objects are original vector-to-raster drawings.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from scipy import ndimage
import cairosvg, json, hashlib, math
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/assets'; OUT.mkdir(parents=True,exist_ok=True)
INK='#694936'; CREAM='#fff5db'; GREEN='#9bb992'; PINK='#efb0a1'; GOLD='#e8b967'; BLUE='#9dbcb8'
manifest=[]
def record(name,typ,source,extra=None):
 p=OUT/(name+'.png'); manifest.append({'id':name,'path':'assets/'+p.name,'type':typ,'source':source,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),**(extra or {})})
def svg(body,w=256,h=256):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><g stroke="{INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>'
def path(d,fill='none',sw=None): return f'<path d="{d}" fill="{fill}"'+(f' stroke-width="{sw}"' if sw else '')+'/>'
def rect(x,y,w,h,fill,rx=10): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"/>'
def ell(x,y,rx,ry,fill,stroke=True): return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}"'+('' if stroke else ' stroke="none"')+'/>'
def line(x1,y1,x2,y2,sw=5,color=INK): return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{color}" stroke-width="{sw}"/>'
def leaf(x,y,s=1,rot=0):
 return f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">'+path('M0 0Q-42 -8 -31 -41Q0 -40 0 0',GREEN)+path('M0 0Q30 -45 49 -27Q45 1 0 0','#b7cba0')+'</g>'
def flower(x,y,r=16,col=CREAM):
 return ''.join(ell(x+math.cos(a)*r*.82,y+math.sin(a)*r*.82,r*.65,r*.65,col) for a in [i*math.pi/3 for i in range(6)])+ell(x,y,r*.45,r*.45,GOLD)
def pot(x=85,y=140,w=88,h=66,col=PINK):
 return path(f'M{x} {y} L{x+w} {y} L{x+w-12} {y+h} Q{x+w/2} {y+h+10} {x+12} {y+h} Z',col)+rect(x-6,y-8,w+12,18,col,7)
def mug(x=75,y=105,col=CREAM):
 return path(f'M{x+87} {y+10} C{x+135} {y-2} {x+126} {y+70} {x+86} {y+52}',col)+path(f'M{x} {y} Q{x+45} {y+12} {x+90} {y} L{x+84} {y+72} Q{x+45} {y+96} {x+6} {y+72} Z',col)+ell(x+45,y,45,12,'#a67a54')+path(f'M{x+34} {y-22}q-12 -14 0 -28m22 24q-12 -14 0 -28','none',4)
def book(x,y,w=48,h=86,col=GREEN): return rect(x,y,w,h,col,5)+line(x+9,y+4,x+9,y+h-4,3)+line(x+17,y+16,x+w-9,y+16,3)+line(x+17,y+h-16,x+w-9,y+h-16,3)
def bow(x,y): return path(f'M{x} {y}Q{x-40} {y-36} {x-38} {y+2}Q{x-33} {y+26} {x} {y}Q{x+40} {y+30} {x+37} {y-9}Q{x+25} {y-35} {x} {y}',PINK)+ell(x,y,10,11,GOLD)
def sparkle(x,y,s=12):return path(f'M{x} {y-s}Q{x} {y} {x+s} {y}Q{x} {y} {x} {y+s}Q{x} {y} {x-s} {y}Q{x} {y} {x} {y-s}',GOLD,2)
def render(name,body,typ='item',w=256,h=256):
 raw=svg(body,w,h)
 # Raster source is kept for editable illustration production, game uses PNG only.
 (ROOT/'art/source'/f'{name}.svg').write_text(raw)
 cairosvg.svg2png(bytestring=raw.encode(),write_to=str(OUT/f'{name}.png'),output_width=w*2,output_height=h*2)
 im=Image.open(OUT/f'{name}.png'); im.resize((w,h),Image.Resampling.LANCZOS).save(OUT/f'{name}.png',optimize=True)
 record(name,typ,'original hand-authored illustration; scripts/make_art.py')

# ---- Faithful character extraction: background-connected flood, not global white key ----
boxes={
'bubu':{'idle':(29,282,232,548),'turn':(248,285,438,549),'side':(451,281,627,548),'back':(639,282,832,550),'face':(854,320,1086,534),'walk':(43,677,273,943),'joy':(345,651,586,941),'sit':(652,691,857,940),'happy':(50,1061,267,1287),'surprise':(336,1064,539,1287),'sleep':(602,1100,886,1274)},
'yier':{'idle':(44,244,247,510),'turn':(278,235,518,519),'back':(521,244,718,510),'face':(760,271,1068,560),'side':(39,642,258,937),'joy':(305,625,540,934),'paint':(560,650,824,934),'walk':(824,639,1068,934),'happy':(66,1054,295,1284),'surprise':(337,1054,557,1287),'shy':(607,1050,859,1286)}}
for who,bb in boxes.items():
 src=Image.open(ROOT/'art/reference'/f'{who}.png').convert('RGBA')
 for pose,box in bb.items():
  box=tuple(round(v*src.width/1100) for v in box)
  im=src.crop(box); a=np.array(im); rgb=a[:,:,:3].astype(float)
  # Background has low saturation and high lightness. Enclosed white panda body stays opaque.
  near=(rgb.min(2)>221)&((rgb.max(2)-rgb.min(2))<35)
  seed=np.zeros(near.shape,bool);seed[0]=near[0];seed[-1]=near[-1];seed[:,0]|=near[:,0];seed[:,-1]|=near[:,-1]
  bg=ndimage.binary_propagation(seed,mask=near)
  a[bg,3]=0
  # Only keep the character's main connected silhouette; remove music notes and shadows.
  labels,n=ndimage.label(a[:,:,3]>0)
  if n:
   sizes=np.bincount(labels.ravel()); sizes[0]=0; keep=np.argmax(sizes)
   a[labels!=keep,3]=0
  im=Image.fromarray(a); bound=im.getbbox(); im=im.crop(bound)
  size=(384,416) if pose not in ['face','happy','surprise','shy','sleep'] else (384,384)
  canvas=Image.new('RGBA',size)
  im.thumbnail((size[0]-32,size[1]-28),Image.Resampling.LANCZOS)
  canvas.alpha_composite(im,((size[0]-im.width)//2,size[1]-im.height-12))
  name=f'{who}-{pose}'; canvas.save(OUT/f'{name}.png',optimize=True)
  record(name,'character','user supplied generated reference: art/reference/'+who+'.png',{'method':'exact-pixel crop; connected-background removal; no redrawing','reference_box':box})

# ---- 36 distinct item silhouettes; consistent cocoa outline and watercolor palette ----
# clean: cloth, sponge, spray, brush, mop, cleaning trolley
render('clean-1',path('M61 72Q123 88 185 74L198 168Q129 191 54 167Z','#bad0c0')+path('M64 87Q123 102 184 88M70 102Q124 116 188 102','none',3)+path('M67 148Q116 170 182 152','none',3))
render('clean-2',rect(52,91,153,100,GOLD,27)+path('M54 116Q127 137 203 111L203 136Q128 157 53 139Z','#b7cba0')+''.join(ell(x,y,4,3,'#c59751',False) for x,y in [(72,163),(105,174),(151,166),(184,156),(135,183)]))
render('clean-3',path('M99 83L153 83L155 115Q188 128 191 177Q192 206 124 205Q66 204 68 175Q70 128 98 115Z',BLUE)+rect(104,62,45,23,CREAM,5)+path('M101 61L102 47L173 47L184 62L149 66L138 81L119 81L121 65Z',PINK)+rect(88,134,82,45,CREAM,12)+sparkle(129,156,15)+path('M181 46l18 -7m-15 20l20 4','none',4))
render('clean-4',path('M66 125Q63 60 108 55L161 55Q187 73 175 127',GOLD)+path('M91 124Q88 82 113 82L146 82Q158 87 151 124',CREAM)+rect(43,121,171,47,BLUE,15)+''.join(line(x,166,x-6,200,7,'#c0ad85') for x in range(54,210,15)))
render('clean-5',path('M154 33L175 37L126 161L103 153Z',PINK)+rect(68,146,94,30,BLUE,8)+path('M77 177L51 215Q114 231 178 212L153 177Z',CREAM)+''.join(line(x,181,x-5,214,3,'#b5c8bf') for x in range(80,155,14)))
render('clean-6',line(54,71,56,193,8)+line(54,71,96,71,8)+rect(61,124,135,68,BLUE,14)+rect(61,110,136,28,GREEN,8)+ell(85,209,16,16,INK)+ell(174,209,16,16,INK)+rect(104,55,37,67,CREAM,8)+rect(111,44,24,15,PINK,3)+path('M166 110L176 26L188 28L179 112Z',GOLD)+path('M66 145Q123 156 188 143','none',3))
# tools
render('tools-1',path('M103 70L156 90L113 202L72 189Z','#b0bbb5')+path('M104 50L177 77L165 105L90 76Z',BLUE)+line(116,64,151,79,5)+''.join(line(91-i*5,171+i*1,135-i*5,186+i*1,3) for i in range(4)))
render('tools-2',path('M148 26L164 36L113 133L97 123Z','#a7bbb8')+path('M83 124Q101 115 126 143L91 213Q76 224 58 207Q48 197 55 184Z',GOLD)+line(88,149,67,190,4))
render('tools-3',path('M117 89L143 101L88 220L64 207Z','#ca9b6b')+path('M83 61L101 32L191 77L175 112Z',BLUE)+path('M94 54L184 99','none',3)+line(88,167,77,193,3))
render('tools-4',path('M78 117L209 49L192 162L104 186Z','#b8c5bf')+path('M100 172l12 -12l5 12l13 -13l5 10l13 -12l5 8l13 -10l4 7l14 -11','none',4)+path('M49 115Q60 99 80 111L112 160Q114 179 92 193L73 204Q49 207 37 186L27 153Q24 135 49 115Z',GOLD)+path('M51 144L69 134L88 166L65 181Z',CREAM))
render('tools-5',rect(56,67,124,59,BLUE,17)+path('M176 80L205 80L222 94L204 107L176 107Z','#b8c5bf')+path('M88 119L132 125L143 197L77 197Z',GOLD)+rect(65,187,95,26,BLUE,7)+rect(110,129,26,23,INK,4)+line(76,78,103,78,4))
render('tools-6',rect(38,116,183,94,PINK,16)+rect(93,91,72,32,GOLD,8)+path('M105 115V100H152V115',CREAM)+path('M39 143Q128 162 220 142','none',5)+rect(113,144,31,24,GOLD,4)+path('M58 116L48 49L68 41L82 116Z',BLUE)+path('M167 111L185 45L198 51L181 118Z','#b1bfb8')+path('M95 93L89 37L125 35L130 92Z',GREEN))
# baking
render('bake-1',path('M79 41Q130 54 177 40L173 84Q204 140 184 207Q130 224 67 205Q47 146 80 87Z',CREAM)+path('M82 59L174 59M84 76L172 76','none',3)+ell(128,150,35,38,'#e9ca98')+path('M128 179V123M128 140Q108 137 111 126M128 153Q148 146 147 136','none',4))
render('bake-2',ell(128,191,98,24,'#d6ba90')+path('M47 165Q51 94 129 89Q202 90 208 165Q194 200 124 203Q60 196 47 165Z','#edcb94')+path('M76 147Q104 104 157 118M151 119Q178 124 189 146','none',4)+ell(97,170,5,3,CREAM,False)+ell(135,187,6,3,CREAM,False))
render('bake-3',path('M43 132Q57 73 103 63Q150 51 180 80Q219 104 216 147Q195 191 129 204Q73 209 46 177Z','#d8a65e')+path('M81 98Q67 116 88 130M119 83Q102 110 126 126M159 90Q145 114 166 129','none',8)+path('M65 177Q129 194 196 149','none',3))
render('bake-4',path('M70 142L191 142L172 220L89 220Z',PINK)+''.join(line(x,151,x+4,211,3,'#cf8c80') for x in range(87,180,21))+path('M59 140Q46 116 73 105Q73 81 102 79Q104 60 128 63Q162 63 161 87Q195 91 196 112Q222 129 193 150Z',CREAM)+path('M111 58Q117 34 136 37Q156 48 141 72Q125 78 111 58Z','#dc8370')+leaf(128,43,.27,-25))
render('bake-5',ell(128,217,108,17,'#d4b896')+rect(43,117,169,94,'#edc68d',15)+path('M43 133Q59 159 78 142Q88 167 111 145Q132 168 154 145Q176 161 184 141Q199 153 212 132L212 111L43 111Z',CREAM)+rect(73,68,111,55,PINK,12)+path('M72 75Q88 98 103 82Q122 105 140 84Q160 101 184 77L184 63L72 63Z',CREAM)+flower(127,51,17,'#e99789')+ell(72,185,7,7,CREAM)+ell(185,180,7,7,CREAM))
render('bake-6',line(128,50,128,215,9,'#caad72')+ell(128,212,101,14,'#e3c997')+ell(128,151,78,13,'#e3c997')+ell(128,91,50,11,'#e3c997')+''.join(rect(x,y,29,25,CREAM,9)+ell(x+14,y,15,9,PINK) for x,y in [(63,188),(109,182),(159,186),(82,124),(137,124),(113,65)])+ell(128,36,14,14,GOLD))
# tea
render('tea-1',rect(65,76,126,131,BLUE,19)+rect(60,62,137,30,GOLD,9)+rect(87,115,84,57,CREAM,10)+leaf(126,159,.72,-15)+line(84,187,172,187,3))
render('tea-2',mug(61,112,CREAM)+flower(105,153,13,PINK))
render('tea-3',ell(126,201,104,17,CREAM)+mug(52,111,'#cee0d8')+leaf(89,124,.38,100)+path('M123 119L152 183L173 175L143 115Z',GOLD)+rect(146,174,29,27,PINK,4))
render('tea-4',path('M84 103Q13 80 30 140Q45 171 71 166','none',14)+path('M178 117Q214 106 219 87L231 106Q231 146 191 160Z',BLUE)+path('M79 100Q65 130 70 168Q80 204 136 204Q190 201 196 165Q197 131 173 100Z',BLUE)+ell(127,98,52,15,CREAM)+ell(127,77,13,12,GOLD)+flower(131,155,18,CREAM))
render('tea-5',ell(129,191,113,39,'#d3b588')+ell(128,181,104,32,CREAM)+f'<g transform="translate(18 45) scale(.56)">{mug(34,133,BLUE)}</g>'+f'<g transform="translate(126 47) scale(.5)">{mug(14,128,PINK)}</g>'+path('M89 98Q73 150 124 158Q168 154 155 106Z',GREEN)+ell(121,98,35,11,CREAM)+ell(121,82,8,8,GOLD)+path('M154 116L180 94L182 116L163 140Z',GREEN))
render('tea-6',line(51,70,51,205,7)+line(51,70,91,70,7)+rect(47,126,169,18,GOLD,6)+rect(49,190,167,17,GOLD,6)+line(205,139,205,194,6)+ell(74,220,12,12,INK)+ell(190,220,12,12,INK)+f'<g transform="translate(78 5) scale(.52)">{mug(55,112,CREAM)}</g>'+rect(79,157,41,28,BLUE,7)+rect(133,156,44,28,PINK,7)+path('M73 123L66 87L105 87L109 123Z',GREEN))
# craft
render('craft-1',path('M66 187L157 34L185 53L95 206L57 223Z',GOLD)+path('M66 187L57 223L95 206Z',CREAM)+path('M57 223L61 205L73 218Z',INK)+path('M157 34L166 18Q184 14 196 33L185 53Z',PINK)+line(153,51,79,178,3))
render('craft-2',rect(49,111,168,112,BLUE,12)+''.join(path(f'M{x} 123V63L{x+12} 43L{x+24} 63V123Z',c)+line(x+2,89,x+22,89,3) for x,c in [(65,PINK),(99,GOLD),(133,GREEN),(167,'#a6bbd2')])+path('M48 157Q129 175 217 156','none',4)+flower(131,190,18,CREAM))
render('craft-3',path('M204 91Q180 36 105 45Q34 57 39 128Q36 203 118 210Q162 211 165 181Q141 156 160 141Q226 143 204 91Z','#e5c498')+ell(183,104,13,17,CREAM)+''.join(ell(x,y,15,15,c) for x,y,c in [(87,90,BLUE),(123,73,PINK),(73,137,GREEN),(109,178,GOLD)])+path('M181 178L206 199L156 237L142 224Z','#bd906a')+path('M181 178Q199 154 222 162Q215 192 206 199Z',INK))
render('craft-4',rect(48,43,165,174,'#d9ad78',8)+rect(64,59,133,141,CREAM,2)+path('M70 176L111 120L136 154L158 105L192 176Z',GREEN)+ell(101,94,18,18,GOLD)+path('M84 215L178 215','none',8))
render('craft-5',path('M52 128Q76 79 139 100L193 114L218 86L214 123L230 141L193 142Q154 184 98 164Q65 157 52 128Z',BLUE)+path('M58 132Q108 158 151 145L130 165Q79 170 58 132Z',CREAM)+path('M125 111L161 127L139 143Z','#b9d5cd')+ell(82,124,4,4,INK)+line(126,104,127,45,3)+bow(127,40)+line(99,165,99,199,3)+sparkle(99,208,12)+line(162,156,162,191,3)+sparkle(162,202,10))
render('craft-6',path('M79 217L97 32L111 32L94 220Z','#c49b6c')+path('M177 219L155 32L141 32L161 220Z','#c49b6c')+rect(48,64,166,129,CREAM,5)+rect(58,73,146,110,PINK,2)+path('M69 165L109 110L143 147L165 123L193 166Z',GREEN)+ell(167,102,14,14,GOLD)+rect(33,190,191,16,'#d9b887',4)+path('M79 72L113 105L136 84L160 110','none',4))
# garden
render('garden-1',path('M71 49L187 49L195 213L62 213Z',CREAM)+path('M70 60L188 60M66 196L193 196','none',3)+rect(82,94,94,77,GREEN,12)+ell(113,128,10,17,'#ae8053')+ell(142,137,9,15,GOLD)+line(112,120,116,135,2))
render('garden-2',pot(84,151,88,61)+line(129,151,128,100,5)+leaf(126,120,1.1,0)+ell(129,151,32,7,'#98765a',False))
render('garden-3',pot(82,155,93,60,BLUE)+line(128,163,129,53,5)+leaf(128,96,.95,-15)+leaf(127,141,.99,-5)+path('M127 62Q106 25 132 27Q163 40 127 62Z',GREEN))
render('garden-4',pot(75,163,108,54,GOLD)+line(116,163,109,70,5)+line(140,164,155,110,5)+leaf(131,161,.95,0)+flower(108,70,31,CREAM)+flower(158,108,25,CREAM))
render('garden-5',path('M62 129L193 122L159 225L105 223Z',CREAM)+path('M102 152L156 220L195 124Z','#b8ccac')+''.join(line(126,185,x,y,4)+path(f'M{x-20} {y-8}Q{x-23} {y+24} {x} {y+29}Q{x+24} {y+23} {x+19} {y-8}L{x+5} {y+1}L{x} {y-12}L{x-7} {y+1}Z',c) for x,y,c in [(85,93,PINK),(130,62,'#edc67f'),(177,87,'#e59d8c')])+bow(128,185))
render('garden-6',path('M58 220L93 33L106 33L73 221Z','#c8a27a')+path('M202 219L165 33L152 33L186 221Z','#c8a27a')+rect(54,111,146,16,'#d9bb90',4)+rect(32,186,191,16,'#d9bb90',4)+f'<g transform="translate(7 69) scale(.63)">{pot(65,145,100,56,BLUE)}{leaf(115,145,1.1)}</g>'+f'<g transform="translate(73 3) scale(.58)">{pot(45,131,102,57,PINK)}{flower(94,97,24,CREAM)}</g>'+f'<g transform="translate(127 89) scale(.49)">{pot(39,123,100,63,GOLD)}{leaf(91,124,1.1)}</g>')

# Six permanent generators are never sold, each has a unique container/silhouette.
render('gen-clean',path('M48 113Q121 131 211 108L198 221L66 220Z',GREEN)+path('M79 109Q80 49 129 43Q179 42 180 110','none',13)+rect(94,96,62,81,CREAM,10)+rect(101,76,46,23,PINK,6)+path('M44 143Q124 165 209 140','none',6)+line(72,177,193,177,3)+line(79,202,188,202,3),'generator')
render('gen-tools',rect(35,101,190,116,PINK,16)+path('M83 99V69Q125 37 174 69V101','none',13)+path('M37 138Q127 162 223 137','none',6)+rect(111,141,36,29,GOLD,5)+path('M62 102L60 46L91 46L93 102Z',BLUE)+path('M173 103L191 46L204 51L187 112Z',GOLD),'generator')
render('gen-bake',rect(43,58,176,161,CREAM,22)+rect(57,101,148,92,'#bb977b',17)+rect(69,112,124,69,'#ecbd7d',11)+path('M76 153Q88 113 114 130Q147 106 179 150L181 165L78 164Z',GOLD)+ell(83,79,9,9,PINK)+ell(122,79,9,9,GREEN)+rect(157,74,44,12,BLUE,5),'generator')
render('gen-tea',rect(32,143,197,32,'#c39b70',8)+line(54,172,54,221,11)+line(207,172,207,221,11)+f'<g transform="translate(35 -10) scale(.69)">{mug(100,126,BLUE)}</g>'+rect(52,69,50,76,GREEN,9)+rect(49,59,55,17,GOLD,5)+leaf(77,116,.55),'generator')
render('gen-craft',rect(37,133,188,85,BLUE,14)+path('M58 132L61 57L82 57L88 132Z',GOLD)+path('M102 132L114 32L135 32L126 133Z',PINK)+path('M172 133L164 45L189 42L193 134Z',GREEN)+path('M57 59Q52 29 72 20Q89 31 81 58Z',INK)+path('M112 31Q117 5 133 7L135 31Z',INK)+rect(73,158,116,37,CREAM,8)+sparkle(130,176,17),'generator')
render('gen-garden',path('M40 132L221 132L199 218L66 219Z',GOLD)+path('M61 128Q71 71 130 68Q191 74 201 129','none',12)+path('M129 142L144 37L163 40L148 143Z','#c8a27a')+path('M141 40Q132 10 157 15Q187 21 165 46Z',BLUE)+leaf(94,147,1.15)+line(50,156,214,156,3)+line(59,184,204,184,3),'generator')

# Utility icons are also illustrated assets rather than generic emoji.
render('util-energy',path('M126 54C58 0 1 96 128 209C252 106 203 4 126 54Z',PINK)+path('M117 77L96 128L126 125L117 169L162 110L129 114L145 76Z',CREAM),'utility')
render('util-scissors',ell(73,176,28,31,PINK)+ell(164,183,28,30,BLUE)+path('M89 152L175 42L188 47L117 174Z','#bdc9c2')+path('M147 158L64 38L53 45L123 178Z','#bdc9c2')+ell(119,155,9,9,GOLD),'utility')
render('util-gift',rect(43,97,173,121,GREEN,12)+rect(35,82,190,40,CREAM,8)+rect(113,90,32,129,PINK,4)+bow(128,69),'utility')
render('util-coin',ell(128,128,89,91,GOLD)+ell(128,128,65,67,'#f4d99c')+path('M130 81L143 110L176 113L151 135L157 168L128 151L98 166L105 134L82 111L116 108Z','#d7a452',3),'utility')
render('util-star',path('M128 30L154 87L219 93L171 139L183 207L127 176L70 207L81 140L33 94L99 85Z',GOLD)+path('M115 94L128 64L141 94','none',3),'utility')
render('util-crate',rect(38,51,179,162,'#d6bb92',13)+path('M42 89L215 89M42 140L215 140M44 188L212 188','none',3)+path('M54 54L72 53L198 211L177 211Z','#e2c9a1')+path('M201 54L181 53L55 212L77 212Z','#e2c9a1'),'utility')
render('util-storage',rect(42,79,176,131,CREAM,17)+path('M50 82L73 43H187L212 82Z',GREEN)+path('M44 124Q128 147 217 123','none',5)+rect(99,134,61,29,GOLD,6),'utility')

# ---- Home scene: layered 2D comic background, furniture appears through play ----
W,H=1000,1120
b=[]
b.append(rect(0,0,W,H,'#e5ead7',0))
b.append(path('M0 0H1000V240Q880 195 802 215Q649 235 545 184Q397 146 267 211Q126 258 0 216Z','#c6d8be'))
# treetops outside, variation and tiny highlights
for x,y,s in [(32,106,1),(930,130,1.3),(133,43,1.2),(789,32,1.0)]:
 b.append(ell(x,y,111*s,103*s,'#a9c4a2',False));b.append(ell(x+44,y-10,88*s,67*s,'#b8cda8',False))
b.append(path('M90 78L920 78L970 945L25 945Z','#d7b78f'))
b.append(path('M112 106L893 106L924 557L70 557Z','#fbefd9'))
b.append(path('M70 557L924 557L972 990L22 990Z','#e0c6a1'))
# wooden floor perspective with light wood knots
for y in [601,658,725,803,892,982]:b.append(line(72-(y-557)*.12,y,924+(y-557)*.11,y,4,'#cba780'))
for x in range(180,921,143):b.append(line(x,561,500+(x-500)*1.29,992,3,'#d0ae86'))
for x,y in [(213,673),(718,734),(395,893),(852,840),(130,919)]:b.append(path(f'M{x-17} {y}q17 -9 34 0q-17 10 -34 0','none',2))
# wall skirting and house frame
b.append(path('M66 537L928 537L931 563L65 563Z','#cda87d'))
b.append(path('M75 88L105 88L66 946L28 948Z','#ad825b'))
b.append(path('M887 85L919 85L969 946L933 946Z','#ad825b'))
b.append(rect(86,79,826,34,'#b99367',5))
# arched door at left
b.append(path('M137 540V270Q219 177 301 270V540Z','#bb9570'))
b.append(path('M154 523V280Q220 205 284 280V523Z','#cba47b'))
b.append(path('M174 340V282Q219 232 264 282V340Z','#cde0d4'))
b.append(line(220,254,220,341,6));b.append(line(175,308,263,308,6))
b.append(rect(175,364,90,118,'#d7b78f',13));b.append(ell(267,381,7,7,GOLD))
# giant window, curtains will be a separate decor item
b.append(rect(355,164,375,269,'#c5a07b',30));b.append(rect(371,180,343,236,'#d4e6db',22))
b.append(path('M372 344Q436 272 494 306Q567 247 641 309Q681 266 714 300V417H372Z','#a9c49d'))
b.append(path('M378 359Q510 330 714 359V415H376Z','#c1d5b0'))
b.append(ell(651,220,27,27,'#f8d795',False))
b.append(line(540,181,540,417,10,'#c5a07b'));b.append(line(373,299,714,299,8,'#c5a07b'))
b.append(rect(338,417,409,29,'#d5ae83',10))
# right small wall alcove
b.append(rect(782,198,85,142,'#e5d0ae',35));b.append(path('M793 322V245Q823 205 854 245V322Z','#f8ecd6'))
# warm diagonal sunlight on floor
b.append(path('M373 446L712 446L846 782L418 867Z','#f4ddb3',1).replace('stroke-width="1"','stroke="none" opacity=".48"'))
# outside path, foreground flower meadow
b.append(path('M23 988H974L1000 1120H0Z','#b8ccaa'))
b.append(path('M377 984L651 983L782 1120L269 1120Z','#dfcaaa'))
for x,y in [(375,1028),(554,1088),(678,1046)]:b.append(ell(x,y,58,15,'#ecd9bd',False))
for x,y,col in [(50,1044,CREAM),(115,1090,PINK),(879,1045,CREAM),(949,1100,CREAM),(203,1047,GOLD),(820,1085,PINK)]:
 b.append(leaf(x,y,.75));b.append(flower(x-13,y-19,17,col))
# tiny dust, subtle static damage repaired through decorating without a gloomy look
b.append(path('M100 126l26 10m-7 1l-13 15M905 484l-22 12l15 12','none',3))
render('home-background',''.join(b),'environment',W,H)

# ---- 24 freely placeable illustrated home upgrades ----
# Within a 256 tile, furniture shares a soft three-quarter frontal perspective.
decos=[]
decos.append(ell(128,172,111,50,'#c7a17b')+ell(128,163,102,43,BLUE)+path('M69 160Q126 183 187 161','none',3)+flower(126,161,18,CREAM))
decos.append(path('M31 41Q48 61 68 45L98 47Q83 115 102 207L55 210Q54 158 31 41Z',GREEN)+path('M225 41Q207 61 184 45L157 47Q173 115 155 207L203 210Q202 157 225 41Z',GREEN)+line(24,37,232,37,9,'#cda776')+path('M53 80L66 139L86 144M203 80L190 139L170 144','none',3)+bow(78,152)+bow(177,152))
decos.append(path('M71 71L92 51H180L199 70V139H69Z','#dcba8b')+path('M85 82H186M85 117H184','none',3)+line(127,139,127,223,12,'#bd9166')+flower(132,94,18,CREAM)+leaf(82,141,.6))
decos.append(line(128,30,128,71,5)+path('M93 75Q128 47 163 75L181 190Q128 217 75 190Z',GOLD)+rect(99,92,59,81,'#ffedb5',11)+ell(128,193,54,9,'#d19e60')+sparkle(130,130,17))
decos.append(rect(44,65,172,134,'#d5b080',8)+rect(56,77,149,43,CREAM,3)+rect(56,134,149,51,CREAM,3)+''.join(ell(x,104,16,12,GOLD)+path(f'M{x-8} 99l6 -7','none',3) for x in [82,130,177])+rect(80,147,36,23,PINK,6)+rect(145,146,33,25,GREEN,6)+line(56,200,56,221,8)+line(205,200,205,221,8))
decos.append('')
# low table (explicit body avoids helper color overload)
decos[5]=ell(128,99,113,36,'#e4c294')+path('M16 98L18 122Q125 163 240 121L241 99Q131 131 16 98Z','#cba275')+line(54,132,45,218,12,'#b98b61')+line(202,135,212,218,12,'#b98b61')+path('M51 99L150 70L209 102L109 136Z',CREAM)+line(78,94,170,121,6,BLUE)+line(106,86,195,113,6,BLUE)
decos.append(f'<g transform="translate(-8 10) scale(.75)">{mug(31,117,BLUE)}</g><g transform="translate(125 37) scale(.57)">{mug(0,117,PINK)}</g>')
decos.append(path('M29 133Q33 78 83 91L112 123L110 209L32 208Z',GREEN)+path('M128 113Q157 80 204 102Q231 121 215 211L123 211Z',PINK)+path('M44 135Q63 120 90 135M145 139Q164 126 204 142','none',3)+flower(174,171,17,CREAM))
# paint nook
for key in ['craft-6']:
 # An asset can be intentionally shared between a max-level collectible and its placed real-world counterpart.
 im=Image.open(OUT/f'{key}.png'); im.save(OUT/'decor-09.png'); record('decor-09','decoration',f'intentional visual match to {key}; same original illustration')
decos.append(None)
decos.append(ell(128,155,115,66,'#cf9f8f')+ell(128,149,100,54,CREAM)+ell(128,149,76,38,BLUE)+path('M35 144L49 156L42 168M216 141L203 153L214 163','none',4)+flower(128,149,20,CREAM))
decos.append(None)
im=Image.open(OUT/'craft-5.png');im.save(OUT/'decor-11.png');record('decor-11','decoration','intentional visual match to craft-5; original illustration')
decos.append(rect(34,62,83,116,'#cda478',4)+rect(44,74,63,92,CREAM,2)+flower(76,122,20,PINK)+rect(137,77,87,95,'#cda478',4)+rect(147,87,67,73,CREAM,2)+leaf(174,141,.83)+line(23,191,235,191,8,'#cda478'))
# garden
for nm,key in [('decor-13','garden-4')]:
 im=Image.open(OUT/f'{key}.png');im.save(OUT/f'{nm}.png');record(nm,'decoration',f'intentional visual match to {key}; original illustration')
decos.append(None)
decos.append(path('M32 149L227 149L212 219L47 219Z','#b99872')+rect(25,141,210,22,'#d2b489',5)+''.join(leaf(x,144,.8,rot)+flower(x,y,15,col) for x,y,col,rot in [(62,118,PINK,-10),(107,101,CREAM,0),(156,112,GOLD,8),(199,124,CREAM,0)]))
decos.append('')
decos[14]=rect(60,39,137,181,'#ddc29c',8)+''.join(line(x,48,x,213,3,'#b9956e') for x in [80,108,137,164,185])+''.join(line(65,y,192,y,3,'#b9956e') for y in [74,108,142,177])+path('M67 218Q136 200 150 139Q80 96 123 42','none',6)+flower(135,88,23,PINK)+flower(124,161,22,CREAM)+leaf(105,209,.65)
decos.append(line(128,27,69,135,4)+line(128,27,188,135,4)+pot(65,141,126,58,CREAM)+leaf(128,141,1.3)+path('M119 143Q47 158 62 213M154 145Q209 165 193 227','none',5)+leaf(64,204,.5,55)+leaf(193,218,.5,-60))
# evening
for n in range(16,24):decos.append('')
decos[16]=rect(38,27,187,199,'#c6a078',8)+rect(50,42,163,76,CREAM,1)+rect(50,132,163,81,CREAM,1)+''.join(book(x,53,29,63,c) for x,c in [(58,GREEN),(90,PINK),(124,BLUE),(156,GOLD)])+book(70,147,41, 63,BLUE)+rect(135,168,60,41,PINK,5)+bow(166,164)
decos[17]=rect(55,63,146,132,PINK,36)+rect(67,79,122,104,'#f3c3ae',31)+rect(49,154,158,65,PINK,16)+rect(24,128,45,78,'#e9a997',20)+rect(188,128,45,78,'#e9a997',20)+line(52,208,48,230,9)+line(207,208,212,230,9)+rect(90,121,73,64,CREAM,19)+flower(126,155,15,GOLD)
decos[18]=ell(128,220,57,15,'#cba578')+line(128,212,128,81,9,'#cba578')+path('M83 45L173 45L204 124Q126 143 49 124Z',CREAM)+path('M70 122Q131 134 184 123','none',3)+line(186,131,185,157,3)+ell(185,163,5,7,GOLD)
decos[19]=rect(33,113,190,100,BLUE,13)+path('M33 112Q32 62 80 62H180Q224 65 223 112Z','#b8cfc5')+path('M35 127Q129 145 222 126','none',5)+rect(114,125,30,27,GOLD,5)+path('M59 78L98 76L99 114L61 115Z',CREAM)+flower(79,95,10,PINK)+bow(177,84)
decos[20]=path('M21 64Q128 103 237 62','none',4)+''.join(path(f'M{x} {y}L{x+28} {y+3}L{x+11} {y+41}Z',c) for x,y,c in [(31,69,PINK),(73,82,GOLD),(118,88,GREEN),(166,81,BLUE),(203,70,PINK)])+path('M21 149Q128 186 237 147','none',4)+''.join(path(f'M{x} {y}L{x+27} {y+3}L{x+11} {y+37}Z',c) for x,y,c in [(31,152,GREEN),(75,166,PINK),(121,170,GOLD),(166,164,GREEN),(204,153,BLUE)])
decos[21]=path('M39 84L194 61L235 176L65 213L16 151Z',CREAM)+''.join(line(x,95,x+35,184,11,PINK) for x in [42,77,111,147,180])+path('M29 124L208 91M45 160L221 130M59 190L231 162','none',10)+bow(185,177)
decos[22]=ell(128,156,109,32,'#d8b17e')+line(61,171,55,224,11)+line(198,172,206,224,11)+rect(70,98,120,63,PINK,10)+path('M70 108Q93 126 108 109Q128 129 151 110Q169 125 190 108V95H70Z',CREAM)+rect(124,65,11,30,BLUE,2)+path('M129 67Q116 45 129 40Q145 50 129 67Z',GOLD)
decos[23]=path('M19 61Q124 101 237 61','none',4)+''.join(line(x,y,x,y+19,3)+ell(x,y+39,18,24,col)+line(x-13,y+61,x+13,y+61,3) for x,y,col in [(44,68,CREAM),(102, 82,GOLD),(161,81,PINK),(216,67,CREAM)])+sparkle(78,171,17)+sparkle(182,175,15)
for i,d in enumerate(decos):
 if d is not None and d:render(f'decor-{i+1:02}',d,'decoration')
# Build an art overview contact sheet for visual review.
all_icons=[OUT/f'{c}-{l}.png' for c in ['clean','tools','bake','tea','craft','garden'] for l in range(1,7)]
contact=Image.new('RGB',(1200,1200),'#fff9ec')
for i,p in enumerate(all_icons):
 im=Image.open(p).resize((180,180),Image.Resampling.LANCZOS);contact.paste(im,(i%6*200+10,i//6*200+10),im)
contact.save(ROOT/'qa/item-art-contact-sheet.jpg',quality=93)
# Decorative transparent fine-grain paper texture (not loaded remotely).
rng=np.random.default_rng(42); tex=np.zeros((192,192,4),dtype=np.uint8);tex[:,:,:3]=[104,77,49];tex[:,:,3]=rng.integers(0,8,(192,192),dtype=np.uint8)
Image.fromarray(tex).save(OUT/'paper-texture.png'); record('paper-texture','environment','deterministic paper grain')
# An inventory of every runtime asset, with honest provenance.
(ROOT/'art/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('wrote',len(manifest),'assets;',sum(p.stat().st_size for p in OUT.iterdir())//1024,'KiB')
