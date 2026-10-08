from pathlib import Path
from PIL import Image
import json,hashlib,re,subprocess
ROOT=Path(__file__).resolve().parents[1]
a=ROOT/'public/assets';manifest=json.loads((ROOT/'art/manifest.json').read_text());records=[]
for m in manifest:
 p=a/(m.get('path',m.get('file','')).split('/')[-1])
 assert p.exists(),str(p)
 h=hashlib.sha256(p.read_bytes()).hexdigest();assert h==m['sha256'],p.name
 d=ROOT/'dist/assets'/p.name;assert d.exists() and d.read_bytes()==p.read_bytes(),p.name
 if p.suffix=='.png':
  with Image.open(p) as im:im.verify()
 records.append({'id':m['id'],'file':p.name,'sha256':h,'valid':True})
assert len(set(m['id'] for m in manifest))==len(manifest)
assert len(list(a.iterdir()))==len(manifest)==103
html=(ROOT/'release/好日子小屋_双击即玩.html').read_text();scripts=re.findall(r'<script>(.*?)</script>',html,re.S)
assert len(scripts)==2
assert scripts[1]==(ROOT/'dist/app.js').read_text(),'Offline and deployed JS differ'
assert 'const $$=' in scripts[1]
assert '<!--SCRIPT-->' not in html and '<!--STYLE-->' not in html
assert 'window.__OFFLINE_SINGLE__=true' in scripts[0]
assert len(list(a.glob('*.png')))==102
for ext in ['*.ttf','*.otf','*.ttc','*.woff','*.woff2']:
 assert not list(ROOT.rglob(ext)),'Font file unexpectedly bundled'
sw=(ROOT/'dist/sw.js').read_text();paths=json.loads(re.search(r'const FILES=(\[.*?\]);',sw).group(1))
for p in paths:assert (ROOT/'dist'/p.removeprefix('./')).exists(),p
report={'runtimeAssets':len(records),'png':102,'wav':1,'manifestMatchesFiles':True,'distAssetsMatchSource':True,'offlineJavaScriptMatchesDist':True,'allPrecachePathsExist':True,'fontFilesBundled':0,'records':records}
(ROOT/'qa/asset-package-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print({k:v for k,v in report.items() if k!='records'})
