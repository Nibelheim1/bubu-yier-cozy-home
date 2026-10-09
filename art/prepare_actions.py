# -*- coding: utf-8 -*-
from pathlib import Path
from PIL import Image
import json, shutil

root=Path(__file__).resolve().parents[1]
source=Path('E:/Desktop/布布一二动作包')
assets=root/'public/assets'
selection=[
 ('ambient-cuddle','976e6a999562a8c9.gif','布布与一二贴脸依偎','pair',['house','courtyard'],26),
 ('ambient-kiss','c03f3fdac4806739.gif','布布亲吻一二的脸颊','pair',['house','courtyard'],27),
 ('ambient-bubu-guitar','92356d7861b66cc3.gif','布布弹吉他','bubu',['house','courtyard'],18),
 ('ambient-yier-tea','9669783560b66bd2.gif','一二坐着喝茶','yier',['house','courtyard'],18),
]
records=[]
for name, filename, description, character, regions, width in selection:
    path=source/filename
    im=Image.open(path)
    duration=[]; bounds=None; alpha_counts=[]
    for i in range(im.n_frames):
        im.seek(i)
        frame=im.convert('RGBA')
        box=frame.getchannel('A').getbbox()
        if box:
            bounds=box if bounds is None else (min(bounds[0],box[0]),min(bounds[1],box[1]),max(bounds[2],box[2]),max(bounds[3],box[3]))
        alpha_counts.append(sum(v==0 for v in frame.getchannel('A').getdata()))
        duration.append(im.info.get('duration',0))
    im.seek(0)
    frame=im.convert('RGBA')
    frame.save(assets/(name+'.png'))
    shutil.copy2(path,assets/(name+'-motion.gif'))
    records.append({
        'id':name,'description':description,'character':character,
        'sourceDirectory':str(source),'sourceFilename':filename,
        'gif':'assets/'+name+'-motion.gif','still':'assets/'+name+'.png',
        'originalGifUnmodified':True,'stillFrameIndex':0,
        'width':im.width,'height':im.height,'frames':im.n_frames,
        'durationMs':sum(duration),'frameDurationsMs':duration,
        'loop':im.info.get('loop',None),'transparent':all(v>0 for v in alpha_counts),
        'firstFrameContentBounds':list(frame.getchannel('A').getbbox()),
        'allFramesContentBounds':list(bounds),
        'normalizedContentBounds':[round(bounds[0]/im.width,4),round(bounds[1]/im.height,4),round(bounds[2]/im.width,4),round(bounds[3]/im.height,4)],
        'recommendedRegions':regions,'recommendedSceneWidthPercent':width,
        'notes':'平面原始动作，透明背景，无文字；场景插图不含音频。'
    })
manifest={'version':'1.3','selectionDate':'2026-10-09','reviewedGifCount':92,
 'reviewEvidence':'art/action-contact-sheets/selected-frames.jpg',
 'selectionRule':'保持平面角色形象，选择家庭日常和温馨撒糖，无文字、无不相关工作或爆炸剧情。',
 'items':records}
(root/'art/actions-v1.3.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(records,ensure_ascii=False,indent=2))
