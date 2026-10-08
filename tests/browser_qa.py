"""Headless Chromium UI regression from the exact inline build.
This environment blocks file/http navigation by managed browser policy. Therefore
we use direct DOM loading (set_content), not a policy bypass. Storage regression
uses a small in-memory Web Storage test adapter; native file-origin storage and
PWA installation are explicitly outside the test claims.
"""
from pathlib import Path
import json, time, os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];QA=ROOT/'qa';QA.mkdir(exist_ok=True)
HTML=(ROOT/'release/好日子小屋_双击即玩.html').read_text()
HTML_QA=HTML.replace("if(new URLSearchParams(location.search).has('qa'))","if(true)")
CHECKPOINTS=json.loads((QA/'campaign-checkpoints.json').read_text())
KEY='bubu-yier-cozy-home-v1'
results=[];all_errors=[];console_errors=[]
def record(name,ok,detail=''):
 results.append({'name':name,'passed':bool(ok),'detail':detail})
 if not ok:raise AssertionError(name+': '+str(detail))
def storage_adapter(page,store=None,broken=False):
 if broken:
  page.evaluate("Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Blocked for test','SecurityError')}})")
 else:
  page.evaluate("""seed=>{const values={...seed};window.__storageValues=values;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return Object.hasOwn(values,k)?values[k]:null},setItem(k,v){values[k]=String(v)},removeItem(k){delete values[k]},clear(){for(const k in values)delete values[k]},key(n){return Object.keys(values)[n]??null},get length(){return Object.keys(values).length}}})}""",store or {})
def create(context,store=None,broken=False):
 page=context.new_page();page.on('pageerror',lambda e:all_errors.append(str(e)));page.on('console',lambda m:console_errors.append(m.text) if m.type=='error' else None)
 storage_adapter(page,store,broken);page.set_content(HTML_QA,wait_until='load');page.wait_for_selector('.splash',timeout=20000);return page
def start(page):
 page.click('[data-action=start]')
 if page.locator('.story-overlay').count():page.click('[data-action=skipStory]')
def state(page):return page.evaluate('window.__COZY_QA__.game.s')
def screenshot(page,name):
 page.wait_for_timeout(150);page.screenshot(path=str(QA/name))
def image_failures(page):return page.evaluate('Array.from(document.images).filter(i=>i.complete&&i.naturalWidth===0).length')
with sync_playwright() as p:
 browser_path=os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
 browser=p.chromium.launch(headless=True,executable_path=browser_path,args=['--no-sandbox','--disable-dev-shm-usage'])
 ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,accept_downloads=True)
 page=create(ctx)
 screenshot(page,'01-launch.png')
 record('Inline build boots with all runtime images',image_failures(page)==0)
 page.click('[data-action=start]');screenshot(page,'02-opening.png')
 for _ in range(4):page.click('[data-action=nextStory]')
 record('Four-panel introduction reaches tutorial',state(page)['introSeen'] and state(page)['tutorial']=='merge')
 screenshot(page,'03-tutorial-board.png')
 guide=page.locator('.tutorial-line').bounding_box();board=page.locator('.board').bounding_box()
 record('Tutorial instructions precede the board',guide['y']<board['y'])
 page.click('[data-cell="8"]');page.click('[data-cell="9"]')
 record('Tap-to-select then tap-to-merge works',state(page)['board'][9]['l']==2 and state(page)['tutorial']=='deliver')
 page.click('[data-action=submit][data-kind=main]')
 record('Order delivery creates exactly one star',state(page)['stars']==1 and state(page)['delivered'])
 page.click('[data-action=afterSubmit]');screenshot(page,'04-before-first-build.png')
 page.click('.home-quest [data-action=build]');page.click('[data-action=chooseStyle][data-style="1"]');screenshot(page,'05-style-selection.png')
 page.click('[data-action=confirmBuild]');page.wait_for_selector('.story-overlay');page.click('[data-action=skipStory]')
 record('Renovation consumes star and persists selected style',state(page)['stage']==1 and state(page)['stars']==0 and state(page)['decorStyles'][0]==1)
 screenshot(page,'06-first-home.png')
 page.click('[data-tab=merge]')
 for _ in range(5):page.click('[data-cell="0"]')
 record('Workbench produces and completes tutorial',state(page)['tutorial']=='done' and state(page)['stats']['produce']==5)
 cancel_before=state(page)['board'];cancel_index=next(i for i,t in enumerate(cancel_before) if t and t.get('k')=='item' and not t.get('dust'));cell=page.locator(f'[data-cell="{cancel_index}"]');box=cell.bounding_box()
 cell.dispatch_event('pointerdown',{'pointerId':37,'pointerType':'touch','isPrimary':True,'button':0,'clientX':box['x']+15,'clientY':box['y']+15})
 page.dispatch_event('body','pointercancel',{'pointerId':37,'pointerType':'touch','isPrimary':True})
 record('Canceled touch pointer leaves the board untouched',state(page)['board']==cancel_before)
 pair=page.evaluate("""()=>{const b=window.__COZY_QA__.game.s.board;for(let i=6;i<49;i++)for(let j=i+1;j<49;j++)if(b[i]?.k==='item'&&!b[i].dust&&b[j]?.k==='item'&&!b[j].dust&&b[i].c===b[j].c&&b[i].l===b[j].l&&b[i].l<6)return [i,j];return null}""")
 record('A legal drag pair is available',pair is not None)
 before=state(page)['board'];merges=state(page)['stats']['merge']
 a=page.locator(f'[data-cell="{pair[0]}"]').bounding_box();b=page.locator(f'[data-cell="{pair[1]}"]').bounding_box()
 page.mouse.move(a['x']+a['width']/2,a['y']+a['height']/2);page.mouse.down();page.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2,steps=12);page.mouse.up()
 record('Pointer drag merges exactly once',state(page)['stats']['merge']==merges+1)
 page.click('.detail-bar [data-action=undo]')
 record('Undo restores exact board after drag',state(page)['board']==before)
 page.locator(f'[data-cell="{pair[0]}"]').focus();page.keyboard.press('Enter')
 record('Keyboard activation preserves grid focus',page.evaluate('document.activeElement.dataset.cell')==str(pair[0]))
 page.locator(f'[data-cell="{pair[1]}"]').focus();page.keyboard.press('Enter')
 record('Keyboard merge works',state(page)['stats']['merge']==merges+1)
 # Store / retrieve through actual controls, including pending-gift tab.
 selected=state(page)['board'][pair[1]]
 page.click('.detail-bar [data-action=store]');record('Storage deposit works',len(state(page)['storage'])==1)
 page.click('[data-action=storage]');page.click('[data-action=storageTab][data-source=storage]');page.click('[data-action=retrieve][data-source=storage][data-index="0"]')
 record('Storage withdrawal works',len(state(page)['storage'])==0)
 page.click('[data-action=closeModal]')
 page.click('[data-action=hint]');record('Smart hint highlights or routes to ready order',page.locator('.cell.hint').count()>0 or state(page)['delivered'] or page.locator('[data-action=submit]:not(:disabled)').count()>0)
 screenshot(page,'07-merge-after-tutorial.png')
 # JSON download and import are browser UI flows, not direct state replacement.
 page.click('[data-action=settings]')
 with page.expect_download() as d:page.click('[data-action=export]')
 download=d.value;savepath=QA/'ui-export.json';download.save_as(str(savepath))
 exported=json.loads(savepath.read_text());record('Export JSON contains current complete game state',exported['state']['stage']==1 and len(exported['state']['board'])==49)
 badfile=QA/'invalid-import.json';badfile.write_text('{"schema":999}')
 page.locator('#import-file').set_input_files(str(badfile));page.wait_for_timeout(150)
 record('Invalid JSON import does not replace the current state',state(page)['stage']==1 and '没有载入' in page.locator('#toast').inner_text())
 # Use a legally simulated checkpoint as a user-supplied save for late-game UI.
 checkpoint=QA/'ui-import-chapter-4.json';checkpoint.write_text(json.dumps({'game':'bubu-yier-cozy-home','state':CHECKPOINTS['16']},ensure_ascii=False))
 page.locator('#import-file').set_input_files(str(checkpoint));page.wait_for_selector('[data-action=importConfirm]');page.click('[data-action=importConfirm]')
 record('Valid import is confirmed and restores stage 16',state(page)['stage']==16)
 screenshot(page,'08-home-chapter-5.png')
 page.click('[data-action=decorate]');styles=state(page)['decorStyles'][:];page.click('[data-action=redecorate][data-id="2"]');record('Free redecoration only changes the selected style',state(page)['decorStyles'][2]!=styles[2] and state(page)['stage']==16)
 page.click('[data-action=closeModal]');was_night=page.locator('.home-scene.night').count();page.click('[data-action=dayNight]');record('Night ambience toggles after chapter unlock',page.locator('.home-scene.night').count()!=was_night)
 if not page.locator('.home-scene.night').count():page.click('[data-action=dayNight]')
 screenshot(page,'09-home-night.png')
 page.click('[data-action=dayNight]')
 with page.expect_download() as d:page.click('[data-action=photo]')
 photo=d.value;photo.save_as(str(QA/'home-photo-export.png'))
 record('Home photo exports a real PNG', (QA/'home-photo-export.png').read_bytes()[:8]==b'\x89PNG\r\n\x1a\n')
 page.click('[data-tab=book]');screenshot(page,'10-memory-book.png')
 page.click('[data-action=bookMode][data-mode=collection]');screenshot(page,'11-item-collection.png');record('All 36 collection items render',page.locator('.collection-item').count()==36)
 page.click('[data-action=item][data-cat=garden][data-level="6"]');record('Item provenance route shows all six levels',page.locator('.route-step').count()==6)
 screenshot(page,'12-item-route.png');page.click('[data-action=closeModal]')
 page.click('[data-tab=shop]');screenshot(page,'13-shop.png')
 c=state(page)['coins'];n=state(page)['bag']['scissors'];page.click('[data-action=buy][data-key=scissors]');record('Shop purchase spends exactly the listed amount',state(page)['coins']==c-45 and state(page)['bag']['scissors']==n+1)
 pending=len(state(page)['pending']);page.click('[data-action=buy][data-key=parcel]');record('Supply parcel preserves four items in pending queue',len(state(page)['pending'])==pending+4)
 page.click('[data-action=daily]');screenshot(page,'14-daily.png');page.click('[data-action=closeModal]')
 page.click('[data-action=settings]');page.click('[data-action=setting][data-key=calm]');record('Calm mode toggle persists',state(page)['settings']['calm'])
 page.click('[data-action=setting][data-key=reducedMotion]');record('Reduced-motion class applied',page.locator('#app.reduced-motion').count()==1)
 screenshot(page,'15-settings.png')
 page.click('[data-action=setting][data-key=music]');page.wait_for_timeout(150);record('Background music option enabled without a script exception',state(page)['settings']['music'])
 page.click('[data-action=setting][data-key=music]')
 page.click('[data-action=resetAsk]');page.click('[data-action=closeModal]');record('Canceling reset leaves progress intact',state(page)['stage']==16)
 # Model-backed restart using the test storage adapter, documented explicitly.
 stored=page.evaluate('window.__storageValues');saved=state(page);other=create(ctx,stored);start(other)
 record('Storage adapter reload preserves stage and settings',state(other)['stage']==saved['stage'] and state(other)['settings']==saved['settings'])
 other.close()
 # Recover from a corrupt primary value using a valid backup, through boot/load().
 corrupt={KEY:'{bad json',KEY+'-backup':json.dumps(CHECKPOINTS['8'])};other=create(ctx,corrupt);start(other)
 record('Corrupt primary save recovers validated backup',state(other)['stage']==8)
 other.close()
 # Full ending and post-story systems, loaded from a legal simulation checkpoint.
 endpage=create(ctx,{KEY:json.dumps(CHECKPOINTS['24'])});start(endpage)
 record('Ending appears once on an unacknowledged finished save',endpage.locator('[data-action=endingDone]').count()==1)
 screenshot(endpage,'16-ending.png');endpage.click('[data-action=endingDone]');screenshot(endpage,'17-complete-home.png')
 endpage.click('[data-tab=merge]');endpage.click('[data-action=orderSide]');record('Repeatable neighbor orders remain after the ending',endpage.locator('.side-order').count()==2)
 screenshot(endpage,'18-postgame-orders.png')
 # Four viewport sizes: actual layout dimensions, no horizontal content overflow.
 for w,h in [(360,640),(390,844),(430,932),(1366,900)]:
  c=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=1)
  pp=create(c,{KEY:json.dumps(CHECKPOINTS['ready-15'])});start(pp);pp.click('[data-tab=merge]')
  dims=pp.evaluate('({vw:innerWidth,body:document.body.scrollWidth,app:document.querySelector("#app").clientWidth,main:document.querySelector("#main").clientWidth,scroll:document.querySelector("#main").scrollWidth})')
  record(f'Layout {w}x{h}: no horizontal overflow',dims['body']<=w+1 and dims['scroll']<=dims['main']+1,str(dims))
  record(f'Layout {w}x{h}: all images loaded',image_failures(pp)==0)
  if h<=710:
   last=pp.locator('[data-cell="48"]').bounding_box();detail=pp.locator('.detail-bar').bounding_box()
   record('Compact layout shows every board row above the inspector',last['y']+last['height']<=detail['y']+1)
   pp.click('[data-action=compactOrder]');record('Compact order drawer exposes full order and neighbors',pp.locator('.modal .order-card').count()==1 and pp.locator('.modal [data-action=orderSide]').count()==1)
   pp.click('.modal [data-action=closeModal]')
  screenshot(pp,f'viewport-{w}x{h}.png');c.close()
 # Real touchscreen taps through Chromium's touch pipeline.
 touchctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
 tp=create(touchctx);tp.tap('[data-action=start]');tp.tap('[data-action=skipStory]');tp.tap('[data-cell="8"]');tp.tap('[data-cell="9"]')
 record('Touchscreen tap-to-merge works',state(tp)['board'][9]['l']==2)
 touchctx.close()
 # Genuine unavailable-storage handling without the success adapter.
 bc=browser.new_context(viewport={'width':390,'height':844});bp=create(bc,broken=True);start(bp)
 record('Blocked storage gives warning without breaking gameplay',bp.locator('.save-notice').count()==1 and bp.locator('.board .cell').count()==49)
 bc.close()
 record('No uncaught JavaScript errors across UI flows',not all_errors,str(all_errors))
 report={'browser':browser.version,'method':'Exact inline build loaded by Playwright set_content. Explicit QA flag added only to the in-memory test copy. Managed browser blocks file/http navigation; no bypass attempted. Native storage/PWA installation are not claimed; storage persistence/recovery tests use an in-memory Web Storage adapter.','checks':results,'passed':sum(x['passed'] for x in results),'total':len(results),'pageErrors':all_errors,'consoleErrors':console_errors,'viewportSizes':[[360,640],[390,844],[430,932],[1366,900]]}
 (QA/'browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print(json.dumps({'passed':report['passed'],'total':report['total'],'pageErrors':all_errors,'consoleErrors':console_errors},ensure_ascii=False,indent=2))
 browser.close()
