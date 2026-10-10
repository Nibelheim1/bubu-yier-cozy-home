import {VERSION,TITLE,CATS,CHAINS,CFG,CHAPTERS,INTRO,TASKS,DECOR,REGIONS,DAILY,HOME_CHAT,TEA_PLANS,SOUVENIRS,MEMORY_GATES,itemName,itemKey,mass} from './data.mjs';
import {GameEngine,validateState,freshState,levelOf,levelReward,levelProgress,levelGift,stockCap,clone} from './engine.mjs';
import {spriteSpec,spriteContentRect,drawSprite,describeScene,renderSceneHTML,drawSceneCanvas,createScenePlayer,SCENE_STYLES,renderWorldOverlays,decorPlacement} from './visuals.mjs';
import {boardTapIntent,boardDropIntent,createPressHold} from './interaction.mjs';
import {describeEnvironment} from './life.mjs';
import {ResidentController,RESIDENT_EXITS,residentExitAt} from './residents.mjs';
import {ACTOR_ACTION_ASSET_IDS} from './actor-actions.mjs';
import {CAMPAIGN_CHAPTERS,CAMPAIGN_TASKS} from './campaign.mjs';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const esc=(v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=(id)=>window.__ASSETS__?.[id]||`assets/${id}.${id==='cozy-loop'?'wav':id.startsWith('actor-motion-')||id.startsWith('ambient-')&&id.endsWith('-motion')?'gif':'png'}`;
const picture=(id,cls='',alt='')=>{
 const p=spriteSpec(id);
 if(!p)return `<img src="${asset(id)}" class="${cls}" alt="${esc(alt)}" draggable="false">`;
 const content=spriteContentRect(p),dims=window.__ASSET_SIZES__?.[p.asset],ratio=dims?(dims[0]/p.cols)/(dims[1]/p.rows):(p.slotAspect||1);
 const crop=`${content.x*100*ratio} ${content.y*100} ${content.w*100*ratio} ${content.h*100}`;
 return `<span class="sprite-shell ${cls}" role="img" aria-label="${esc(alt)}"><svg class="sprite-frame" viewBox="${crop}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><svg x="${content.x*100*ratio}" y="${content.y*100}" width="${content.w*100*ratio}" height="${content.h*100}" viewBox="${crop}" preserveAspectRatio="none" overflow="hidden"><image href="${asset(p.asset)}" x="${-p.col*100*ratio}" y="${-p.row*100}" width="${p.cols*100*ratio}" height="${p.rows*100}" preserveAspectRatio="none"/></svg></svg></span>`;
};
const PATHS={
 home:'M3 11 12 3l9 8M5 10v11h14V10M9 21v-7h6v7',
 merge:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17.5 13v9M13 17.5h9',
 book:'M3 4c4-1 7 0 9 2 2-2 5-3 9-2v16c-4-1-7 0-9 2-2-2-5-3-9-2zM12 6v16M6 8h3M15 8h3',
 shop:'M4 10v11h16V10M3 10l2-7h14l2 7M3 10q2 4 5 0 4 4 8 0 3 4 5 0M9 21v-7h6v7',
 close:'m6 6 12 12M18 6 6 18',arrow:'m9 5 7 7-7 7',back:'m15 5-7 7 7 7',plus:'M12 5v14M5 12h14',
 star:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
 energy:'m14 2-9 12h7l-2 8 9-13h-7z',
 settings:'m9 3 6 0 1 3 3 1 2 5-2 2 0 4-5 3-2-2-4 0-3-5 2-2 0-4zM15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0',
 calendar:'M4 5h16v16H4zM8 2v6M16 2v6M4 10h16M8 14h2M14 14h2M8 17h2M14 17h2',
 check:'m5 12 4 4L19 6',lock:'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4M12 14v3',
 info:'M12 16v-5M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
 sort:'M4 5h12M4 10h8M4 15h4M17 10v11m-3-3 3 3 3-3',
 box:'m3 7 9-4 9 4v13H3zM3 7l9 4 9-4M12 11v9',
 gift:'M3 9h18v4H3zM5 13v8h14v-8M12 9v12M12 9c-11-1-7-9-3-5l3 5c11-1 7-9 3-5z',
 trash:'M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M9 10v7M15 10v7',
 scissors:'M9 17 19 3M15 17 5 3M10 18a4 4 0 1 1-8 0 4 4 0 0 1 8 0M22 18a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 camera:'M3 7h5l2-3h4l2 3h5v14H3zM16 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M20 4l-2 2M6 18l-2 2',
 moon:'M19 15A8 8 0 0 1 9 5a9 9 0 1 0 10 10',
 palette:'M21 10C20 1 6 0 3 9c-3 8 6 14 12 11 3-2-2-4 0-6 1-2 7 0 6-4M7 8h.01M11 5h.01M16 7h.01M6 13h.01',
 refresh:'M20 3v6h-6M4 21v-6h6M20 9C17 0 4 2 3 11M4 15c3 9 16 7 17-2',
 light:'M8 16C-1 5 7 1 12 2c9 0 12 8 4 14v3H8zM9 22h6M8 16h8',
 heart:'M12 21C-6 9 3-4 12 5c9-9 18 4 0 16',
 download:'M12 2v13m-5-5 5 5 5-5M4 16v5h16v-5',
 upload:'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
 play:'m8 4 12 8-12 8z',sound:'M3 9h4l5-5v16l-5-5H3zM16 8q5 4 0 8M19 4q9 8 0 16',
};
const icon=(id,cls='')=>`<svg viewBox="0 0 24 24" class="icon ${cls}" aria-hidden="true"><path d="${PATHS[id]||PATHS.heart}"/></svg>`;
const btn=(text,action,cls='',extra='')=>`<button class="button ${cls}" data-action="${action}" ${extra}>${text}</button>`;
const ib=(id,action,label,extra='',small=false)=>`<button class="icon-button ${small?'small':''}" data-action="${action}" aria-label="${label}" title="${label}" ${extra}>${icon(id)}</button>`;
const STORE='bubu-yier-cozy-home-v1.2',BACKUP=STORE+'-backup',INITIALIZED=STORE+'-initialized',LEGACY_STORE='bubu-yier-cozy-home-v1';
let saveWarning='',lastValid='',storageFailed=false;
function load(){
 try{
  const keys=localStorage.getItem(STORE)===null&&!localStorage.getItem(INITIALIZED)?[STORE,BACKUP,LEGACY_STORE,LEGACY_STORE+'-backup']:[STORE,BACKUP];
  for(const key of keys){
   const v=localStorage.getItem(key);if(!v)continue;
   try{const s=validateState(JSON.parse(v));lastValid=key===LEGACY_STORE||key===LEGACY_STORE+'-backup'?'':JSON.stringify(s);if(key===LEGACY_STORE||key===LEGACY_STORE+'-backup')saveWarning='已复制旧版进度。新版独立保存，原版存档保留。';if(key===BACKUP)saveWarning='上次存档损坏，已恢复最近的安全备份。';return s;}catch{saveWarning='检测到无效存档，未载入错误内容。新进度可在设置里导出。';}
  }
 }catch{storageFailed=true;saveWarning='浏览器暂时不允许本地保存，请用“导出存档”保管进度。';}
 return null;
}
let game=new GameEngine(load());
const ui={tab:game.s.stage===0?'merge':'home',homeMode:'map',mapScroll:0,bookMode:'memories',selected:null,highlight:[],modal:null,story:null,splash:true,styleChoice:0,storageTab:'storage',night:game.s.stage>=16&&game.s.stage<20,newDecor:null,scenePlayer:null,sceneSnapshot:null,parcelTarget:null,parcelSource:null,photoBusy:false};
const app=$('#app'),main=$('#main'),modalRoot=$('#modal-root'),overlayRoot=$('#overlay-root');
let toastTimer=0,highlightTimer=0,chatTimer=0,drag=null,furnitureDrag=null,ignoreClickUntil=0,hasStarted=false;
let actorDrag=null,residentLife=null,residentSaveRef=null;
ui.decorSelected=null;
let imageCache=new Map(),modalReturnFocus=null;
const sceneStyle=document.createElement('style');sceneStyle.textContent=SCENE_STYLES;document.head.append(sceneStyle);
function persist(){
 try{const saved=clone(game.s);if(actorDrag?.armed)saved.residents[actorDrag.who]={region:actorDrag.base.region,x:actorDrag.base.x,y:actorDrag.base.y};const raw=JSON.stringify(saved);if(raw===lastValid)return true;if(lastValid)localStorage.setItem(BACKUP,lastValid);localStorage.setItem(STORE,raw);lastValid=raw;storageFailed=false;try{localStorage.setItem(INITIALIZED,'1');}catch{}return true;}
 catch{if(!storageFailed){storageFailed=true;saveWarning='本地保存失败。请在设置里导出存档，避免关闭后丢失。';toast(saveWarning,5000);}return false;}
}

class Sounds{
 constructor(){this.ctx=null;this.music=null;}
 unlock(){try{if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}catch{}this.syncMusic();}
 syncMusic(){if(!hasStarted)return;if(game.s.settings.music&&!document.hidden){if(!this.music){this.music=new Audio(asset('cozy-loop'));this.music.loop=true;this.music.volume=.36;}this.music.play().catch(()=>{});}else this.music?.pause();}
 play(kind){
  if(!game.s.settings.sound||document.hidden||!this.ctx)return;
  const patterns={tap:[560],produce:[520,690],merge:[523.25,659.25,783.99],success:[523.25,659.25,783.99,1046.5],place:[659.25,783.99,1046.5],error:[260],talk:[420,480],yier:[580,670]};
  const notes=patterns[kind]||patterns.tap;
  notes.forEach((f,i)=>{const t=this.ctx.currentTime+i*.055;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=kind==='error'?'sine':'triangle';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.036,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+.19);});
 }
}
const sounds=new Sounds();
function toast(text,ms=2300,html=false){const el=$('#toast');clearTimeout(toastTimer);el.className='visible';if(html){el.className+=' discovery';el.innerHTML=text;}else el.textContent=text;toastTimer=setTimeout(()=>el.className='',ms);}
function discoveryToast(c,l){
 if(l>=4){openModal({type:'discovery',c,l});burst(null,true);}
 else toast(`${picture(itemKey(c,l))}<div><span>又发现一件可爱的小东西</span><b>${itemName(c,l)}</b> · ${l} 级</div>`,2600,true);
}
function burst(index,huge=false){
 if(game.s.settings.reducedMotion)return;
 const rect=index===null?app.getBoundingClientRect():$(`[data-cell="${index}"]`)?.getBoundingClientRect();if(!rect)return;
 const ar=app.getBoundingClientRect(),x=rect.left-ar.left+rect.width/2,y=rect.top-ar.top+(index===null?rect.height*.5:rect.height/2);
 for(let i=0;i<(huge?32:11);i++){const p=document.createElement('i');p.className='particle';const a=Math.PI*2*i/(huge?32:11),r=huge?80+Math.random()*90:25+Math.random()*30;p.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r}px`;$('#particles').append(p);setTimeout(()=>p.remove(),800);}
}
function pop(index){const c=$(`[data-cell="${index}"]`);if(c){c.classList.add('pop');setTimeout(()=>c.classList.remove('pop'),400);}}
function mergeFlight(r){
 if(game.s.settings.reducedMotion)return;
 const from=$(`[data-cell="${r.from}"]`)?.getBoundingClientRect(),to=$(`[data-cell="${r.to}"]`)?.getBoundingClientRect();if(!from||!to)return;
 const el=document.createElement('div');el.className='merge-flight';el.innerHTML=picture(itemKey(r.c,r.l-1));el.style.cssText=`left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;--mx:${to.left-from.left}px;--my:${to.top-from.top}px`;document.body.append(el);setTimeout(()=>el.remove(),360);
}
function run(r,{quiet=false}={}){
 if(!r.ok){sounds.play('error');toast(r.message);return r;}
 if(['move','merge'].includes(r.kind))ui.selected=r.to;
 if(['store','sell','sort'].includes(r.kind))ui.selected=null;
 persist();render();
 if(r.kind==='produce'){sounds.play('produce');pop(r.idx);if(r.discovery)discoveryToast(r.c,r.l);}
 else if(r.kind==='merge'){sounds.play('merge');mergeFlight(r);pop(r.to);burst(r.to);if(r.discovery)setTimeout(()=>discoveryToast(r.c,r.l),370);else if(r.dust)toast('尘封解开了 · 金币 +5');}
 else if(r.kind==='prepare'){sounds.play('place');if(r.expanded)toast(`第 ${r.phase+1}/${r.totalPhases} 份物资已收好，继续下一步；整单完成后领取奖励。`,3200);else playEvent('prep',{result:r});}
 else if(r.kind==='firstVisit'){sounds.play('talk');playEvent('firstVisit',{teaResult:r.result});}
 else if(r.kind==='submit'){sounds.play('success');if(r.orderKind==='tea'){playEvent('tea',{teaResult:r.result||r.teaResult||game.s.tea.lastResult,reward:r});}else if(r.orderKind==='main'){if(r.expanded)openModal({type:'campaignResult',result:r});else if(r.totalPhases>1)playEvent('prep',{result:r,after:()=>openModal({type:'submitted',result:r})});else openModal({type:'submitted',result:r});}else{toast(`委托送达 · 金币 +${r.coins} · 经验 +${r.xp}`);burst(null);}}
 else if(r.kind==='sell'){sounds.play('tap');toast(`已换成 ${r.coins} 金币`);}
 else if(r.kind==='store'){sounds.play('tap');toast('收好了，仓库物品也能直接用于交付。');}
 else if(r.kind==='retrieve'){sounds.play('produce');pop(r.idx);if(r.discovery)discoveryToast(r.c,r.l);}
 else if(r.kind==='split'){sounds.play('merge');pop(r.idx);toast('拆成两个低一级物品 · 剪刀 −1');}
 else if(r.kind==='upgrade'){sounds.play('success');toast(`${CHAINS[r.c].producer}升级了，存货已补满。`);}
 else if(r.kind==='expand'){sounds.play('success');toast('又能多收好四件小东西啦。');}
 else if(r.kind==='buy'){sounds.play('tap');toast(r.key==='parcel'?'四件补给已放进“待领礼物”，满盘也不会丢失。':'已经放进随身道具。');}
 else if(['dailyGift','dailyReward'].includes(r.kind)){sounds.play('success');toast('今天的小奖励，收好啦！');burst(null);}
 else if(r.kind==='homeActivity'){sounds.play('success');playHomeActivity(r);}
 else if(r.kind==='levelGift'){sounds.play('success');toast(`Lv.${r.level} 成长礼包已收好，材料在待领礼物。`);burst(null);}
 else if(r.kind==='refresh'){toast('换了一张新纸条。原来的物品都还在。');}
 else if(r.kind==='sort'){toast('按类别和等级整理好了，没有自动合成。');}
 else if(!quiet)sounds.play('tap');
 if(r.levelUps>0)setTimeout(()=>toast(`成长到 Lv.${levelOf(game.s)} · 升级奖励已入账${levelOf(game.s)%5===0?'，成长礼包可领取':''}`),1100);
 return r;
}
function render(){
 cancelActorDrag();
 if(furnitureDrag)cancelFurnitureDrag();
 const scroll=main.scrollTop,orderScroll=$('.order-row')?.scrollLeft||0,viewport=$('.world-viewport');if(viewport)ui.mapScroll=viewport.scrollLeft;app.classList.toggle('reduced-motion',game.s.settings.reducedMotion);renderHeader();renderNav();
 main.innerHTML=ui.tab==='home'?renderHome():ui.tab==='book'?renderBook():ui.tab==='shop'?renderShop():renderMerge();
 fitOrderSummaryTitles();
 main.scrollTop=scroll;const orders=$('.order-row',main);if(orders)orders.scrollLeft=orderScroll;
 const map=$('.world-viewport');if(map)map.scrollLeft=ui.mapScroll;
 if(ui.modal)renderModal();
 syncInert();
}
function navigate(tab){cancelActorDrag();cancelDrag();cancelFurnitureDrag();ui.decorSelected=null;if(tab==='home'&&game.s.delivered)focusBuildRegion();ui.tab=tab;ui.selected=null;ui.highlight=[];render();main.scrollTop=0;}
function focusBuildRegion(){const region=DECOR[game.s.stage]?.region;if(region){game.visitRegion(region);persist();ui.homeMode='region';}}
function journeyChapter(s=game.s){return s.stage<24?CHAPTERS[Math.min(5,Math.floor(s.stage/4))]:CAMPAIGN_CHAPTERS[Math.min(8,Math.floor((s.campaign?.completed||0)/8))];}
function journeyCount(s=game.s){return s.stage+(s.campaign?.completed||0);}
function orderThumbnail(task,cls=''){const r=task.needs?.[0]||task.fullNeeds?.[0];return task.decor?picture(task.decor,cls):r?picture(itemKey(r.c,r.l),cls,task.name):picture('util-gift',cls);}
function campaignPoseId(id){return id==='bubu-happy'?'bubu-joy':id;}
function renderHeader(){
 const s=game.s,chapter=journeyChapter(s);
 $('#header').innerHTML=`<div class="brand-line"><span class="brand-mark">${icon('home')}</span><div><div class="brand">${esc(TITLE)}</div><div class="brand-sub">${journeyCount(s)===96?'每一天，继续可爱':'布布一二 · '+chapter.short}</div></div><div class="header-tools"><button class="icon-button" data-action="daily" aria-label="每日小目标" title="每日小目标" style="position:relative">${icon('calendar')}${!s.daily.gift||DAILY.some(d=>s.daily[d.key]>=d.target&&!s.daily.claimed.includes(d.key))?'<i class="badge-dot"></i>':''}</button>${ib('settings','settings','设置与存档')}</div></div>
 <div class="resources"><button class="level-badge" data-action="growth" aria-label="查看成长进度与每5级礼包"><small>Lv.</small><span id="level-count">${levelOf(s)}</span>${Array.from({length:Math.min(19,Math.floor(levelOf(s)/5))},(_,i)=>(i+1)*5).some(l=>!s.levelGiftsClaimed.includes(l))?'<i class="badge-dot"></i>':''}</button><button class="resource energy" data-action="energy" aria-label="查看体力恢复规则">${picture('util-energy')}<span id="energy-count">${s.energy}</span><small>/100</small></button><button class="resource" data-action="shop" aria-label="金币与小铺">${picture('util-coin')}<span id="coin-count">${s.coins}</span><span class="plus">+</span></button><button class="resource star" data-action="home" aria-label="心愿星，用于布置小屋">${picture('util-star')}<span>${s.stars}</span></button></div>${storageFailed?'<div class="save-notice">本地保存受限 · 请导出存档</div>':''}`;
}
function renderNav(){
 $('#nav').innerHTML=[['home','home','家园'],['merge','merge','合成'],['book','book','手帐'],['shop','shop','小铺']].map(([tab,ic,label])=>`<button data-tab="${tab}" aria-current="${ui.tab===tab?'page':'false'}" class="${ui.tab===tab?'active':''}">${icon(ic)}<span>${label}</span>${tab==='home'&&game.s.delivered?'<i class="nav-star">!</i>':''}</button>`).join('');
}
function rewardLine(task,star=false){return `<div class="reward-line">${star?`<span>${picture('util-star')}1</span>`:''}<span>${picture('util-coin')}${task.coins}</span>${task.xp?`<span class="xp-reward">EXP +${task.xp}</span>`:''}</div>`;}
function requirement(r,{summary=false}={}){const n=game.count(r.c,r.l),tag=summary?'span':'button';return `<${tag} class="required-item ${n>=r.n?'ready':''}" ${summary?'':`data-action="item" data-cat="${r.c}" data-level="${r.l}"`} aria-label="需要${r.n}个${itemName(r.c,r.l)}，${r.l}级，当前有${n}个">${picture(itemKey(r.c,r.l),'',itemName(r.c,r.l))}${summary?'':`<span class="need-level">${r.l}级</span>`}<span class="count">${Math.min(n,r.n)} / ${r.n}</span>${n>=r.n?icon('check'):''}</${tag}>`;}
function activeOrders(){const mainOrder=game.mainOrder(),tea=game.teaOrder();return [...(mainOrder?[{task:mainOrder,kind:'main',slot:0}]:[]),...(game.s.stage>0?game.s.sideOrders.map((task,slot)=>({task,kind:'side',slot})):[]),...(tea.available?[{task:tea,kind:'tea',slot:0}]:[])];}
function allOrderCards(){return activeOrders().map(({task,kind,slot})=>orderCard(task,kind,slot)).join('');}
function teaContent(){
 const t=game.teaOrder();if(!t.available)return `<article class="tea-intro"><h3>在花园认识小苗之后，一起喝茶吧。</h3><p>完成第13处布置，亲手试过每个已开启的工作台，就可以准备两熊茶会。每场都可自由换方案，错过一天不会失去进度。</p>${game.mainOrder()?.lesson?btn('认识新工作台','source','small',`data-cat="${game.mainOrder().lesson}"`):''}</article>`;
 return `<div class="tea-condition"><span class="tag">第 ${t.round+1} 场 · ${esc(t.conditionName)}</span><p>${t.condition==='sunny'?'今天放晴了，选一个喜欢的地方坐坐。':t.condition==='memory'?'想留下今天，一起做一张小小纪念吧。':'有点风，用夹子固定茶布，再把杯子放稳。'} ${t.participants.includes('xiaoli')?'小栗也来坐坐。':'这一场，先留给布布和一二。'}</p></div><div class="tea-plans">${Object.entries(TEA_PLANS).map(([key,p])=>`<button data-action="teaPlan" data-plan="${key}" class="${t.plan===key?'active':''}" aria-pressed="${t.plan===key}"><b>${p.name}</b><span>${p.wish}</span></button>`).join('')}</div>${orderCard(t,'tea',0,{full:true})}<p class="note">交付前可免费换方案，物品保持原样。两只熊先到${esc(REGIONS.find(r=>r.id===t.region).name)}才能开始茶会。完成后出现动作与不同回应，纪念物永久收藏，不要求连续登录。</p>`;
}
function teaHomeCard(){
 const t=game.teaOrder(),first=game.s.tea.firstVisit;
 return `<article class="tea-home-card"><h3>${first==='available'?'邀请小栗来坐坐':t.available?'今天，想怎样喝茶？':'留出一个一起坐下的位置'}</h3><p>${first==='available'?'邀请中的日子到了，请先把布布和一二都带到庭院，再迎接小栗。':t.available?`选暖心茶点或花园小聚，准备材料，让${first==='arrived'?'三位朋友':'布布一二'}一起坐坐，留下今天的纪念。`:'认领第一株小苗，并亲手认识各工作台后，两熊茶会就会开放。'}</p><div class="actions">${first==='available'?btn(residentsTogether('courtyard')?'迎接小栗首访':'请带两熊到庭院','firstVisit','',residentsTogether('courtyard')?'':'disabled'):btn(t.available?'准备茶会':'看看茶会','openTea','alt')}${game.s.tea.lastResult?btn('重看最近一次','teaReplay','alt'):''}</div></article>`;
}
function souvenirEntries(){return game.worldProgress().souvenirs.map(v=>({...v,snapshot:v.record}));}
function renderSouvenirs(){
 const entries=souvenirEntries();return `<div class="section-title">茶会留下的小纪念 · ${entries.filter(v=>v.unlocked).length}/6 款</div><div class="souvenir-list">${entries.map(v=>`<article class="souvenir-card ${v.unlocked?'owned':''}"><span class="souvenir-sign">${v.type==='coaster'?'◉':v.type==='card'?'✉':'♧'}</span><div><b>${v.name}</b><small>${REGIONS.find(r=>r.id===v.region)?.name}固定纪念位 · ${v.unlocked?'永久收藏':'对应状况与方案完成后取得'}</small></div>${v.unlocked?`<div class="souvenir-actions">${btn(v.equipped?'已摆好':'摆到家园','equipSouvenir','small',`data-region="${v.region}" data-key="${v.key}" ${v.equipped?'disabled':''}`)}${btn('重温首次','souvenirReplay','small alt',`data-key="${v.key}" data-plan="${v.plan}"`)}</div>`:''}</article>`).join('')}</div>`;
}

function parcelTargets(){
 const main=game.mainOrder(),tea=game.teaOrder(),list=[];
 if(main&&!game.s.delivered)list.push({target:{kind:'main',id:main.id,step:main.phase},order:main,label:(main.expanded?'生活主线 · ':'家园布置 · ')+(main.phaseLabel||main.name)});
 game.s.sideOrders.forEach((o,slot)=>{if(game.s.stage>0)list.push({target:{kind:'side',id:o.id},order:o,label:(o.loop?slot===0?'轻委托 · ':'长委托 · ':'邻里 · ')+o.name});});
 if(tea.available)list.push({target:{kind:'tea',id:tea.id},order:tea,label:'茶会 · '+tea.name});return list;
}
function parcelContent(m){
 const list=parcelTargets();if(!list.length)return '<p class="description">先铺好门垫，再查看补给。</p>';
 if(!ui.parcelTarget){const selected=list[0];ui.parcelTarget=selected.target;}
 const selected=list.find(v=>JSON.stringify(v.target)===JSON.stringify(ui.parcelTarget));
 const sources=selected?[...new Set(selected.order.needs.filter(r=>game.count(r.c,r.l)<r.n).map(r=>r.c))]:[];
 if(!ui.parcelSource&&sources.length===1)ui.parcelSource=sources[0];
 m.quote=game.quoteParcel(ui.parcelTarget,ui.parcelSource||undefined);
 return `<p class="description">选择需要补给的订单和仍缺材料的来源。65金币买三件1级与一件2级材料，不直接完成高阶需求。</p><div class="parcel-targets">${list.map(v=>`<button data-action="parcelTarget" data-target="${esc(JSON.stringify(v.target))}" class="${selected===v?'active':''}">${esc(v.label)}</button>`).join('')}</div><div class="parcel-sources">${sources.map(c=>`<button data-action="parcelSource" data-cat="${c}" class="${ui.parcelSource===c?'active':''}">${picture('gen-'+c)}${CHAINS[c].producer}</button>`).join('')}</div>${m.quote.ok?`<h3>这次会收到</h3><div class="parcel-preview">${m.quote.items.map(t=>`<div>${picture(itemKey(t.c,t.l))}<span>${itemName(t.c,t.l)} · ${t.l}级</span></div>`).join('')}</div>${btn(`确认购买 · ${m.quote.price} 金币`,'confirmParcel','wide')}<p class="note">四件物品送到待领礼物。取消不会扣金币；订单或材料需求更新后，需要重新查看预览。</p>`:`<p class="parcel-status" role="status">${esc(m.quote.message)}</p>`}`;
}
function focusKey(el){
 if(!el||el===document.body||!el.dataset)return null;return {tag:el.tagName,action:el.dataset.action,tab:el.dataset.tab,cell:el.dataset.cell,cat:el.dataset.cat,level:el.dataset.level,key:el.dataset.key,source:el.dataset.source,region:el.dataset.region,index:el.dataset.index,plan:el.dataset.plan,style:el.dataset.style,target:el.dataset.target,id:el.dataset.id};
}
function findFocus(key,root=document){if(!key)return null;return $$('button,input,[tabindex]',root).find(el=>el.tagName===key.tag&&Object.entries(key).every(([k,v])=>k==='tag'||v===undefined||el.dataset[k]===v)&&!el.disabled);}
function syncInert(){
 const blocked=!!(ui.modal||ui.story||ui.splash||ui.newDecor!==null||$('#loading'));for(const id of ['header','main','nav'])$('#'+id).inert=blocked;
 modalRoot.inert=!!(ui.story||ui.splash);overlayRoot.inert=!!ui.modal;
}
function eventReply(r){
 if(Array.isArray(r.response))return r.response.map(v=>typeof v==='string'?v:(v.who==='bubu'?'布布':v.who==='xiaoli'?'小栗':'一二')+'：'+v.text).join(' ');
 if(typeof r.response==='string')return r.response;
 if(r.kind==='firstVisit')return '小栗：“邀请信我收到了，这杯茶好暖。” 一二：“下回也来坐坐。” 布布：“你的座位，留好啦。”';
 const warm=r.plan==='warm',line=r.condition==='memory'?(warm?'布布把甜点放稳，一二画下这一桌暖茶。':'一二在树荫下画小卡，布布把新叶也画了进去。'):r.condition==='wind'?'布布和一二用杯垫和夹子固定好茶布，杯子不晃了。':(warm?'一二摆好的杯子，刚好接住布布端来的热茶。':'布布浇完小苗，一二拉着他坐到树荫下。');return line+(r.participants?.includes('xiaoli')?' 小栗：“这一次的准备，我也想记住。”':' 两只熊把今天的小纪念收进手帐。');
}
function syncEventControls(){
 const status=ui.scenePlayer?.status,record=ui.modal?.scene?.result,choice=record?.displayChoice||ui.sceneSnapshot?.action?.choice;
 const next=$('[data-action="sceneAdvance"]',modalRoot),skip=$('[data-action="sceneSkip"]',modalRoot);if(next)next.disabled=!status?.waiting;if(skip)skip.disabled=!!status?.done;
 $$('[data-action="sceneChoice"]',modalRoot).forEach(b=>{b.disabled=!ui.sceneAwaitChoice;b.setAttribute('aria-pressed',String(choice===b.dataset.choice));});
}
function rememberSceneChoice(choice='anchor'){
 if(!ui.sceneAwaitChoice)return;
 const record=ui.modal?.scene?.result;if(!record)return;choice=choice==='clip'?'clip':'anchor';record.displayChoice=choice;
 if(ui.sceneSnapshot?.result)ui.sceneSnapshot.result.displayChoice=choice;
 if(game.s.tea.lastResult?.id===record.id)game.s.tea.lastResult.displayChoice=choice;
 const first=game.s.world.souvenirs[record.souvenirKey];if(first?.id===record.id&&!first.displayChoice)first.displayChoice=choice;
 persist();ui.scenePlayer?.setChoice(choice);ui.sceneAwaitChoice=false;syncEventControls();
}
function openTeaReplay(record){if(!record){toast('完成一场茶会后，这里就会留下一次回忆。');return;}playEvent(record.kind==='firstVisit'?'firstVisit':'tea',{teaResult:record});}
function playEvent(event,{teaResult=null,result=null,reward=null,after=null}={}){
 const region=teaResult?.region||result?.region||game.s.world.region;
 const frozen=teaResult?{...clone(game.s),stage:teaResult.stage,decorStyles:clone(teaResult.decorStyles)}:clone(game.s);if(teaResult)frozen.world.equipped=clone(teaResult.equipped||{house:null,garden:null,courtyard:null});
 const scene=describeScene(frozen,{region,stage:frozen.stage,teaResult,...(!teaResult?{environment:homeEnvironment()}:{}),prepStep:game.s.mainPrepStep});
 const title=event==='firstVisit'?'小栗来坐坐':event==='tea'?'这场茶会，收好啦':event==='prep'?(result.phaseLabel||'这一份准备，摆好了'):'今天，一起做的小事';
 openModal({type:'event',title,scene,caption:'',reward});ui.sceneSnapshot=scene;
 const eventName=event==='prep'?`prep-${result.id}-${result.phase}`:event;
 ui.scenePlayer=createScenePlayer({event:eventName,scene,reducedMotion:game.s.settings.reducedMotion,onFrame:frame=>{
  ui.sceneSnapshot=clone(frame);const host=$('.event-scene .scene-layers');if(host)host.innerHTML=renderSceneHTML(frame,{assetURL:asset});
  const caption=$('.event-caption');if(caption)caption.textContent=frame.caption||frame.text||title;ui.modal&&(ui.modal.caption=frame.caption||frame.text||title);
 },onStep:({label,waiting})=>{const next=$('[data-action="sceneAdvance"]',modalRoot);if(next)next.disabled=!waiting;const caption=$('.event-caption');if(caption)caption.textContent=label;ui.modal&&(ui.modal.caption=label);},onComplete:finalScene=>{ui.sceneSnapshot=clone(finalScene);const host=$('.event-scene .scene-layers');if(host)host.innerHTML=renderSceneHTML(finalScene,{assetURL:asset});const skip=$('[data-action="sceneSkip"]',modalRoot);if(skip)skip.disabled=true;const next=$('[data-action="sceneAdvance"]',modalRoot);if(next)next.disabled=true;if(teaResult){if(game.s.tea.lastResult?.id===teaResult.id){game.s.tea.lastResult.seen=true;persist();}const caption=$('.event-caption');if(caption)caption.innerHTML=eventReplyMarkup(teaResult);if(ui.modal){ui.modal.caption=eventReply(teaResult);ui.modal.reply=teaResult;}}if(after){closeModal();after();}}});
 ui.sceneSnapshot=clone(ui.scenePlayer.initialScene);const initialHost=$('.event-scene .scene-layers');if(initialHost)initialHost.innerHTML=renderSceneHTML(ui.sceneSnapshot,{assetURL:asset});
 ui.sceneAwaitChoice=event==='tea'&&teaResult?.condition==='wind'&&!teaResult.displayChoice;if(teaResult?.displayChoice){ui.scenePlayer.setChoice(teaResult.displayChoice);$$('[data-action="sceneChoice"]',modalRoot).forEach(b=>{b.disabled=true;b.setAttribute('aria-pressed',String(b.dataset.choice===teaResult.displayChoice));});}if(!ui.sceneAwaitChoice)ui.scenePlayer.start();else{const caption=$('.event-caption');if(caption)caption.textContent='风吹起茶布了，先选一种固定方式。';}syncEventControls();
}
function orderCard(task,kind='main',slot=0,{full=false}={}){
 const summaryTitle=task.loop&&task.name.includes('：')?task.name.slice(task.name.indexOf('：')+1):task.name;
 if(!full)return `<button class="order-card order-mini order-summary" data-action="orderDetails" data-kind="${kind}" data-id="${task.id}" data-order-kind="${kind}" data-order-id="${task.id}" aria-label="展开${esc(task.name)}的任务详情" aria-haspopup="dialog"><span class="order-summary-title">${esc(summaryTitle)}</span><span class="requirements">${task.needs.map(r=>requirement(r,{summary:true})).join('')}</span>${orderRewardThumbnails(task,kind)}</button>`;
 const delivered=kind==='main'&&!task.expanded&&game.s.delivered,lesson=kind==='main'&&task.lesson,ready=game.canFulfill(task.needs)&&!lesson,actorsReady=kind!=='tea'||residentsTogether(task.region),label=kind==='main'?task.expanded?'生活主线':'家园布置':kind==='tea'?'一起茶会':task.loop?slot===0?'循环 · 轻委托':'循环 · 长委托':`邻里 ${slot+1}`;
 const visibleNeeds=full?task.needs:task.needs.slice(0,3),remaining=task.needs.length-visibleNeeds.length;
 return `<article class="order-card order-mini ${kind==='side'?'side-order':''} ${ready||delivered?'fulfilled':''}" data-order-kind="${kind}" data-order-id="${task.id}"><div class="order-top"><span class="order-kind">${label}</span>${kind==='side'?`<button class="refresh-order" data-action="refreshSide" data-slot="${slot}" aria-label="免费更换第${slot+1}张邻里委托">${icon('refresh')}</button>`:''}</div><button class="order-name" data-action="orderDetails" data-kind="${kind}" data-id="${task.id}">${esc(task.name)}</button>${task.totalPhases>1?`<span class="phase-line">准备 ${task.phase+1}/${task.totalPhases} · ${esc(task.phaseLabel)}</span>`:''}${task.loop?`<span class="phase-line">第 ${task.loop} 轮 · 难度 ${task.tier+1}</span>`:''}${lesson?`<button class="lesson-line" data-action="source" data-cat="${lesson}">${picture('gen-'+lesson)}认识来源</button>`:''}<div class="requirements">${visibleNeeds.map(requirement).join('')}</div>${remaining?`<button class="order-material-more" data-action="orderDetails" data-kind="${kind}" data-id="${task.id}">共 ${task.needs.length} 种 · 还有 ${remaining} 种</button>`:''}${kind==='main'&&task.totalPhases>1&&task.phase<task.totalPhases-1?'<span class="order-reward-note">整单完成后获得</span>':''}${rewardLine(task,kind==='main'&&!task.expanded)}<div class="order-action">${delivered?btn('前往布置','goBuild','small'):btn(!actorsReady?'等两熊到齐':ready?(kind==='tea'?'开始茶会':task.totalPhases>1&&task.phase<task.totalPhases-1?'交这一份':'交付'):'准备中','submit','small',`data-kind="${kind}" data-id="${task.id}" data-step="${task.phase||0}" ${ready&&actorsReady?'':'disabled'}`)}${kind==='tea'?btn('换方案','openTea','small alt'):''}</div></article>`;
}
function orderRewardThumbnails(task,kind){
 const star=kind==='main'&&!task.expanded,label=task.totalPhases>1?'整单完成奖励':'任务奖励';
 const badge=(id,count,name)=>`<span class="order-reward-thumb" title="${name} ${count}" aria-label="${name} ${count}">${id==='xp'?'<span class="reward-xp-icon">EXP</span>':picture(id)}<small>${count}</small></span>`;
 return `<span class="order-reward-thumbnails" role="group" aria-label="${label}">${star?badge('util-star',1,'心愿星'):''}${badge('util-coin',task.coins,'金币')}${task.xp?badge('xp',task.xp,'经验'):''}</span>`;
}
function fitOrderSummaryTitles(){
 for(const title of $$('.order-summary-title',main)){
  title.style.fontSize='12px';const width=title.clientWidth;if(!width)continue;
  if(title.scrollWidth>width){let size=Math.max(1,Math.floor(120*width/title.scrollWidth)/10);title.style.fontSize=size+'px';while(title.scrollWidth>width&&size>1){size=Math.max(1,Math.round((size-.1)*10)/10);title.style.fontSize=size+'px';}}
 }
}
new ResizeObserver(fitOrderSummaryTitles).observe(app);
document.fonts?.ready.then(fitOrderSummaryTitles);
function renderMerge(){
 const s=game.s,compact=window.innerHeight<=710;
 return `<section class="merge-view ${compact?'compact-view':''}"><div class="order-strip order-row" aria-label="订单横排，可左右滑动查看其他订单">${allOrderCards()}</div><div class="board-header"><div class="board-title">合成工作台<span class="board-free">空位 ${game.free()}</span></div><div class="board-tools"><button data-action="storage">${icon('box')}仓库${s.pending.length?`<i class="parcel-count">${s.pending.length}</i>`:''}</button><button data-action="sort" aria-label="整理棋盘">${icon('sort')}</button><button data-action="hint">${icon('light')}提示</button></div></div><div class="board-frame"><div class="board" role="grid" aria-label="7乘7合成棋盘；点击或拖动同类同级合成，拖到其他格返回原位">${Array.from({length:7},(_,row)=>`<div role="row" class="board-row">${s.board.slice(row*7,row*7+7).map((t,col)=>renderCell(t,row*7+col)).join('')}</div>`).join('')}</div></div>${detailBar()}</section>`;
}
function renderCell(t,i){
 const s=game.s;let classes=['cell'],body='',label=`空格，第${i+1}格`;
 if(i===ui.selected)classes.push('selected');if(ui.highlight.includes(i))classes.push('hint');
 if(!t)classes.push('empty');
 else if(t.k==='gen'){
  const unlocked=game.unlocked(t.c),p=s.producers[t.c];classes.push('gen');if(!unlocked)classes.push('locked');
  body=picture('gen-'+t.c,'',CHAINS[t.c].producer)+(unlocked?`<span class="bolt">${icon('energy')}</span><span class="stock" data-stock="${t.c}">${p.stock}/${stockCap(p)}</span>`:`<span class="lock-sign">${icon('lock')}完成${CHAINS[t.c].unlock}处后</span>`);
  label=unlocked?`${CHAINS[t.c].producer}，点击消耗1体力产出物品，库存${p.stock}`:`${CHAINS[t.c].producer}，修好${CHAINS[t.c].unlock}处后自动解锁`;
 }else if(t.k==='crate'){
  classes.push('crate');body=picture('util-crate')+`<span class="lock-sign">${icon('lock')}修缮${t.openAt}</span>`;label=`纸箱，修好第${t.openAt}处后自动腾出空间`;
 }else{
  classes.push('item');const selected=s.board[ui.selected];if(t.dust)classes.push('dust');
  if(selected?.k==='item'&&ui.selected!==i&&!selected.dust&&selected.c===t.c&&selected.l===t.l&&t.l<6)classes.push('match');
  if(activeOrders().some(({task})=>task.needs.some(r=>r.c===t.c&&r.l===t.l))&&!t.dust)classes.push('ready-item');
  body=picture(itemKey(t.c,t.l),'',itemName(t.c,t.l))+`<span class="level">${t.l}</span>`;label=`${itemName(t.c,t.l)}，${t.l}级${t.dust?'，尘封，需同级物品合入解锁':''}`;
 }
 return `<button class="${classes.join(' ')}" data-cell="${i}" role="gridcell" aria-label="${esc(label)}" aria-selected="${i===ui.selected}">${body}</button>`;
}
function detailBar(){
 const t=game.s.board[ui.selected];
 if(!t)return '';
 if(t.k==='gen'){
  const p=game.s.producers[t.c],unlocked=game.unlocked(t.c);
  return `<div class="detail-bar">${picture('gen-'+t.c,'detail-art')}<div class="detail-content"><h4>${CHAINS[t.c].producer} · Lv.${p.level}</h4><p>${unlocked?`每次 1 体力 · 二阶产出率 ${Math.round((.2+(p.level-1)*.12)*100)}%`:`完成第 ${CHAINS[t.c].unlock} 处修缮后自动解锁`}</p><p>${unlocked?'库存每 6 秒恢复 1 件 · 可升级':''}</p></div>${ib('info','chain','查看产出路线',`data-cat="${t.c}"`,true)}${unlocked&&p.level<3?btn(`升级 ${CFG.upgradeCosts[p.level-1]}`,'upgrade','small',`data-cat="${t.c}"`):''}</div>`;
 }
 if(t.k==='crate')return `<div class="detail-bar">${picture('util-crate','detail-art')}<div class="detail-content"><h4>还没整理的纸箱</h4><p>完成第 ${t.openAt} 处小屋布置后，自动腾出空间。</p><p>不需要金币，不会丢失已收好的物品。</p></div>${ib('home','home','回小屋')}</div>`;
 return `<div class="detail-bar">${picture(itemKey(t.c,t.l),'detail-art')}<div class="detail-content"><h4>${itemName(t.c,t.l)} · ${t.l} 级</h4><p>${t.dust?'用同类同级物品合入，解开尘封。':t.l===6?'最高级 · 可以交付或收藏':`下一阶：${itemName(t.c,t.l+1)}`}</p></div><div class="detail-actions">${ib('info','item','查看物品路线',`data-cat="${t.c}" data-level="${t.l}"`)}${!t.dust?`${ib('box','store','收进仓库')}${btn(icon('scissors')+'剪刀 ×'+game.s.bag.scissors,'itemActions','small alt','aria-label="使用剪刀或出售物品，剩余'+game.s.bag.scissors+'把剪刀"')}`:''}</div></div>`;
}
let liveHomeScene=null,liveWeatherKey='';
const PHASES=['morning','day','dusk','night'],WEATHERS=['sunny','cloudy','rain','wind'];
function homeEnvironment(now=Date.now()){
 const env=describeEnvironment(now,game.s.createdAt);
 if(ui.environmentPhase){env.phase=ui.environmentPhase;env.phaseLabel={morning:'清晨',day:'白天',dusk:'黄昏',night:'夜晚'}[env.phase];env.night=env.phase==='night';}
 if(ui.environmentWeather){env.weather=ui.environmentWeather;env.weatherLabel={sunny:'晴朗',cloudy:'多云',rain:'小雨',wind:'微风'}[env.weather];}
 env.preview=!!(ui.environmentPhase||ui.environmentWeather);return env;
}
function getResidentLife(){
 if(residentSaveRef!==game.s.residents){residentLife?.cancelAll();residentSaveRef=game.s.residents;residentLife=new ResidentController(residentSaveRef);}
 return residentLife;
}
function residentsTogether(region){return ['bubu','yier'].every(w=>game.s.residents[w].region===region);}
function residentLocations(){return ['bubu','yier'].map(w=>`${w==='bubu'?'布布':'一二'}在${REGIONS.find(r=>r.id===game.s.residents[w].region).name}`).join(' · ');}
function residentDoorMarkup(region){return `<div class="resident-exits">${RESIDENT_EXITS.filter(e=>e.region===region).map(e=>`<div class="resident-exit" data-resident-exit="${e.id}" style="left:${e.x}%;top:${e.y}%;width:${e.rx*2}%;height:${e.ry*2}%"><button type="button" data-action="visitRegion" data-region="${e.destination}" aria-label="${esc(e.label)}">${esc(e.label)}</button></div>`).join('')}</div>`;}
function tickResidents(now=Date.now()){
 const paused=document.hidden||ui.tab!=='home'||ui.modal||ui.story||ui.splash||drag||furnitureDrag||actorDrag||ui.decorSelected!==null||$('.room-chat');
 const decorByRegion=Object.fromEntries(REGIONS.map(r=>[r.id,DECOR.filter(d=>d.id<game.s.stage&&!game.s.hiddenDecor.includes(d.id)&&d.region===r.id).map(d=>({...decorPlacement(d.id,game.s.decorPositions[d.id]),decorId:d.id}))]));
 const life=getResidentLife(),before=['bubu','yier'].map(w=>life.residents[w].region);
 life.tick(now,{paused:!!paused,reducedMotion:game.s.settings.reducedMotion,decorByRegion});
 if(before.some((region,i)=>region!==life.residents[['bubu','yier'][i]].region)){persist();syncResidentPresence();}
}
function syncResidentPresence(){
 const status=$('.resident-status');if(status)status.textContent=residentLocations();
 const region=game.s.world.region,both=residentsTogether(region),record=game.worldProgress().regions.find(r=>r.id===region),activity=$('[data-action="homeActivity"]',main);
 if(activity&&record){activity.disabled=record.activityDone||game.s.stage===0||!both;activity.textContent=record.activityDone?'明天再来':both?'一起做':'等两熊到齐';const text=$('.region-activity p');if(text)text.textContent=game.s.stage===0?'先铺好第一块门垫，再一起做今天的小事。':record.activityDone?'今天的小事已经一起做过，明天再来。':!both?'先把两只熊带到这里，再一起做今天的小事。':record.activityText;}
 const visit=$('[data-action="firstVisit"]',main);if(visit){const ready=residentsTogether('courtyard');visit.disabled=!ready;visit.textContent=ready?'迎接小栗首访':'请带两熊到庭院';}
}
function livingScene(region=game.s.world.region,now=Date.now()){
 const scene=describeScene(game.s,{region,environment:homeEnvironment(now),characters:false,now,interactive:true});
 scene.layers.push(...getResidentLife().frame(region,now));return scene;
}
function livingAsset(id){return asset(id);}
function environmentSettings(){const env=homeEnvironment();return `<div class="section-title">家园环境预览</div><p class="description">${env.phaseLabel} · ${env.weatherLabel} · ${env.preview?'正在预览':'跟随本地时间，游戏内模拟天气'}</p><div class="actions">${btn('切换时段','cycleTime','small alt')}${btn('切换天气','cycleWeather','small alt')}${env.preview?btn('跟随时间','environmentAuto','small alt'):''}</div>`;}
function homeScene(progress=game.s.stage,{interactive=false,characters=true,mini=false,night=false,poses=null,region=game.s.world?.region||'house',teaResult=null,scene=null,historical=false}={}){
 const info=REGIONS.find(r=>r.id===region)||REGIONS[0];
 const live=interactive&&!scene&&!historical&&!teaResult;
 const frozen=scene||(live?livingScene(info.id):describeScene(game.s,{stage:progress,region:info.id,night,poses,characters,teaResult,...(historical?{decorPositions:{},hiddenDecor:[],equipped:{house:null,garden:null,courtyard:null},replay:true}:{})}));
 if(live){liveHomeScene=clone(frozen);liveWeatherKey=frozen.environment.phase+':'+frozen.environment.weather;}
 const target=decorPlacement(Math.min(progress,23)),canBuild=progress<24&&target.region===info.id;
 return `<div class="home-scene region-${info.id}" data-region-scene="${info.id}"><div class="scene-layers">${renderSceneHTML(frozen,{assetURL:live?livingAsset:asset,interactive})}</div>${interactive?`<div class="room-number">${info.name} · ${DECOR.filter(d=>d.id<progress&&d.region===info.id).length} 处心愿</div>${canBuild?`<button type="button" class="build-pin ${game.s.delivered?'ready':''}" data-action="goBuild" aria-label="${game.s.delivered?'可以布置啦，前往布置':'查看下一项布置'}" style="left:${Math.max(18,Math.min(82,target.x))}%;top:${Math.max(25,Math.min(83,target.y))}%">${icon('plus')}${game.s.delivered?'可以布置啦':'下一个小愿望'}</button>`:''}${furnitureControlMarkup(frozen)}${residentDoorMarkup(info.id)}`:''}</div>${interactive?furnitureToolsMarkup(frozen):''}`;
}
function refreshLivingScene(now=Date.now()){
 if(document.hidden||ui.tab!=='home'||ui.homeMode!=='region'||ui.modal||ui.story||ui.splash||drag||furnitureDrag||actorDrag&&!actorDrag.armed||ui.decorSelected!==null||$('.room-chat'))return;
 const host=$('.home-view .scene-layers');if(!host)return;
 const scene=livingScene(game.s.world.region,now);liveHomeScene=clone(scene);
 const dynamic=scene.layers.filter(l=>l.kind==='actor'||l.key.startsWith('ambient-'));
 const wanted=new Set(dynamic.map(l=>l.key));
 host.querySelectorAll('.scene-actor,[data-scene-layer^="ambient-"]').forEach(el=>{if(!wanted.has(el.dataset.sceneLayer))el.remove();});
 const changes=dynamic.filter(l=>host.querySelector(`[data-scene-layer="${l.key}"]`)?.dataset.sprite!==String(l.id));
 if(changes.length){const temp=document.createElement('template');temp.innerHTML=renderSceneHTML({...scene,layers:changes},{assetURL:livingAsset,interactive:true});for(const layer of changes){const node=temp.content.querySelector(`[data-scene-layer="${layer.key}"]`);const old=host.querySelector(`[data-scene-layer="${layer.key}"]`);if(node){if(old)old.replaceWith(node);else host.append(node);}}}
 for(const layer of dynamic){const node=host.querySelector(`[data-scene-layer="${layer.key}"]`);if(!node)continue;node.style.left=layer.x+'%';node.style.top=layer.y+'%';node.style.width=layer.w+'%';node.style.height=layer.h+'%';node.style.transform=`translate(-50%,-50%) rotate(${layer.rotation||0}deg)${layer.flip?' scaleX(-1)':''}`;}
 const key=scene.environment.phase+':'+scene.environment.weather;
 if(key!==liveWeatherKey){const temp=document.createElement('template');temp.innerHTML=renderSceneHTML({...scene,layers:[]},{assetURL:asset});const background=host.querySelector('.scene-background');background.src=asset(scene.background);background.style.filter=temp.content.querySelector('.scene-background').style.filter;host.querySelectorAll('.scene-weather,.scene-time-tint,.scene-night-glow').forEach(n=>n.remove());temp.content.querySelectorAll('.scene-weather,.scene-time-tint,.scene-night-glow').forEach(n=>host.append(n));liveWeatherKey=key;for(const node of host.querySelectorAll('.scene-decor,.scene-souvenir,.scene-prop')){const layer=scene.layers.find(l=>l.key===node.dataset.sceneLayer);node.style.filter=[layer?.variant?'hue-rotate(24deg) saturate(.85)':'',scene.night?'brightness(.84)':''].filter(Boolean).join(' ')||'none';}}
}
function openBuildPlacement(){
 if(!game.s.delivered){const task=game.mainOrder();navigate('merge');if(task)openModal({type:'orderDetails',kind:'main',id:task.id});return;}
 cancelDrag();cancelFurnitureDrag();ui.decorSelected=null;focusBuildRegion();ui.tab='home';ui.styleChoice=0;render();main.scrollTop=0;openModal({type:'build'});
}
function speakerPortrait(who){return picture(who==='xiaoli'?'xiaoli-idle':who+'-face','speaker-avatar',who==='bubu'?'布布头像':who==='yier'?'一二头像':'小栗头像');}
function speechRow(who,text){const name={bubu:'布布',yier:'一二',xiaoli:'小栗'}[who]||'';return `<div class="speech-row">${speakerPortrait(who)}<div><b>${name}</b><p>${esc(text)}</p></div></div>`;}
function eventReplyMarkup(record){return Array.isArray(record.response)?record.response.map(line=>typeof line==='string'?`<p>${esc(line)}</p>`:speechRow(line.who,line.text)).join(''):esc(eventReply(record));}
function furnitureControlMarkup(scene){
 const layer=scene.layers.find(l=>l.kind==='decor'&&l.decorId===ui.decorSelected);if(!layer)return '';
 return `<div class="furniture-move-handle" style="left:${layer.x}%;top:${Math.max(7,layer.y-layer.h/2-6)}%"><button data-action="decorMoveHandle" data-id="${layer.decorId}" aria-label="移动${esc(layer.label)}；按住拖动或用方向键调整">${icon('sort')}移动</button>${btn(icon('box')+'收纳','storeDecor','small alt',`data-id="${layer.decorId}"`)}</div>`;
}
function furnitureToolsMarkup(scene){
 const layer=scene.layers.find(l=>l.kind==='decor'&&l.decorId===ui.decorSelected);if(!layer)return '';
 return `<div class="furniture-placement-tools"><span><b>${esc(layer.label)}</b><small>按住“移动”拖到喜欢的位置，松手保存</small></span>${btn('详情','furnitureDetails','small alt',`data-id="${layer.decorId}"`)}${btn('恢复原位','resetDecorPosition','small alt',`data-id="${layer.decorId}"`)}${btn('完成','finishPlacement','small')}</div>`;
}
function worldMap(){
 const progress=game.worldProgress(),coords={house:[25,41],garden:[54,61],courtyard:[82,44]};
 return `<div class="world-map-shell"><div class="map-hint">${icon('home')}拖动看看整个家园 · 点地标走近</div><div class="world-viewport" aria-label="可拖动的家园全景"><div class="world-canvas">${picture('world-map','world-bg')}${renderWorldOverlays(game.s,{assetURL:asset})}${progress.regions.map(r=>{const [x,y]=coords[r.id];return `<button class="region-marker ${DECOR[game.s.stage]?.region===r.id?'next-region':''}" data-action="visitRegion" data-region="${r.id}" style="left:${x}%;top:${y}%"><span>${r.id==='house'?'⌂':r.id==='garden'?'✿':'☀'}</span><b>${r.name}</b><small>${r.built}/${r.total} 处布置${r.activityDone?' · 已陪伴':''}</small>${game.s.delivered&&DECOR[game.s.stage]?.region===r.id?'<i>心愿星到了</i>':''}</button>`;}).join('')}</div></div><div class="region-shortcuts">${REGIONS.map(r=>`<button data-action="visitRegion" data-region="${r.id}">${r.name}${icon('arrow')}</button>`).join('')}</div></div>`;
}
function renderWorldMemories(){
 const p=game.worldProgress();
 return `<div class="section-title">家园日常 · ${p.memoryCount}/3 张回忆</div><div class="world-memory-cards">${p.memories.map(m=>`<button data-action="${m.unlocked?'worldMemory':'visitRegion'}" data-region="${m.region}" class="${m.unlocked?'collected':''}">${icon(m.unlocked?'heart':'sun')}<b>${m.name}</b><small>${m.unlocked?'已收进手帐 · 点击重温':`累计陪伴 ${m.progress}/${m.target} 天${m.conditionMet?'':` · 还需${m.conditionLabel}`} · 去看看`}</small></button>`).join('')}</div>`;
}
function pendingBuildCard(task){
 if(!task||!game.s.delivered)return '';
 const region=REGIONS.find(r=>r.id===DECOR[game.s.stage]?.region);
 return `<article class="home-quest pending-build" aria-label="新家具待布置">${orderThumbnail(task,'home-quest-thumb')}<span class="eyebrow">新家具待布置 · ${esc(region?.name||'小屋')}</span><h3>${esc(task.name)}</h3><div class="home-quest-row"><span class="tag">${icon('star')}心愿星已就绪</span>${btn('布置新家具','goBuild','small')}</div></article>`;
}
function renderHome(){
 const s=game.s,expanded=s.stage===24,ch=expanded?Math.min(8,Math.floor(s.campaign.completed/8)):Math.min(5,Math.floor(s.stage/4)),chapter=journeyChapter(s),t=game.mainOrder();
 const region=REGIONS.find(r=>r.id===s.world.region)||REGIONS[0],p=game.worldProgress(),r=p.regions.find(r=>r.id===region.id),nextRegion=REGIONS.find(r=>r.id===(t?.region||DECOR[s.stage]?.region)),bothHere=residentsTogether(region.id);
 const quest=t?`<article class="home-quest">${orderThumbnail(t,'home-quest-thumb')}<span class="eyebrow">${t.expanded?'生活主线':'下一处布置'} · ${nextRegion?.name||'小屋'} · ${journeyCount(s)+1}/96</span><h3>${t.name}</h3><p>${s.delivered?'心愿星已经备好。走到对应区域，亲手布置新角落。':esc(t.wish)}</p>${t.expanded?`<p class="note">${esc(chapter.name)} · 准备 ${t.phase+1}/${t.totalPhases}：${esc(t.phaseLabel)}<br>分批交付、进度保留；这一项不新增家具。</p>`:''}<div class="home-quest-row"><span class="tag ${s.delivered?'':'coral'}">${icon(s.delivered?'star':'merge')}${s.delivered?'心愿星 ×1 已就绪':'先准备合成物品'}</span>${btn(s.delivered?'前往布置':'去合成',s.delivered?'build':'merge',s.delivered?'':'alt')}${t.expanded?btn('看看故事地点','visitRegion','small alt',`data-region="${t.region}"`):''}</div></article>`:`<article class="home-quest"><span class="eyebrow">BEARS AT HOME</span><h3>96项主线收好啦，日子继续。</h3><p>家园布置与九章生活故事已经完成。邻里轻委托、长委托会循环更新；茶会、回忆和每天的小事都可以继续。</p><div class="home-quest-row">${btn('继续合成','merge')}${btn(s.tea.firstVisit==='arrived'?'重温待客准备':'看看待客准备','ending','alt')}</div></article>`;
 return `<section class="home-view"><div class="page-heading"><div><span class="eyebrow">BEARS AT HOME · ${expanded?'LIFE':'HOME'} CHAPTER ${String(ch+1).padStart(2,'0')}</span><h2>${ui.homeMode==='map'?'熊熊之家，逛逛我们的家':region.name}</h2><p>${ui.homeMode==='map'?'小屋 · 花园 · 庭院，把生活慢慢铺开':region.subtitle}</p><div class="chapter-progress">${Array.from({length:expanded?9:6},(_,i)=>`<i class="${expanded?s.campaign.completed>=i*8+8?'done':'':s.stage>=i*4+4?'done':''}"></i>`).join('')}</div></div>${ib('book','book','翻开回忆手帐')}</div>${s.delivered?pendingBuildCard(t):''}<div class="home-toolbar">${ui.homeMode==='region'?btn(icon('back')+'家园全景','worldMap','small alt'):''}${btn(icon('box')+'家具收纳'+(s.hiddenDecor.length?' · '+s.hiddenDecor.length:''),'decorStorage','small alt')}${btn(icon('merge')+'回合成台','merge','small')}</div>${ui.homeMode==='map'?worldMap():`<div class="region-tabs">${REGIONS.map(v=>`<button class="${v.id===region.id?'active':''}" data-action="visitRegion" data-region="${v.id}">${v.name}</button>`).join('')}</div><div class="home-scene-shell">${homeScene(s.stage,{interactive:true,night:ui.night})}</div><div class="home-actions"><button data-action="photo">${icon('camera')}拍张合照</button><button data-action="decorate">${icon('palette')}换个配色</button></div><p class="resident-guide"><span class="resident-status">${esc(residentLocations())}</span>点门边按钮切换场景 · 角色自行串门，也可长按拖过门</p><article class="region-activity"><span class="activity-flower">${region.id==='garden'?'✿':region.id==='courtyard'?'☀':'♡'}</span><div><h3>${r.activityLabel||region.activityLabel}</h3><p>${s.stage===0?'先铺好第一块门垫，再一起做今天的小事。':r.activityDone?'今天的小事已经一起做过，明天再来。':!bothHere?'先把两只熊带到这里，再一起做今天的小事。':r.activityText||region.activityText}</p></div>${btn(r.activityDone?'明天再来':bothHere?'一起做':'等两熊到齐','homeActivity','small',`data-region="${region.id}" ${r.activityDone||s.stage===0||!bothHere?'disabled':''}`)}</article>`}${teaHomeCard()}<div class="world-memory-track">${icon('book')}家园回忆 ${p.memoryCount} / 3 张<span>各区域每天一次陪伴，收集新的日常</span></div>${s.delivered?'':quest}</section>`;
}
function renderBook(){
 const s=game.s;let content='';
 if(ui.bookMode==='memories'){
  content=`${renderSouvenirs()}${renderWorldMemories()}<div class="section-title">家园布置篇 · 六章永久收藏</div><div class="memory-grid">${CHAPTERS.map((c,i)=>{const ok=s.stage>=(i+1)*4;return `<button class="memory-card" data-action="memory" data-chapter="${i}" ${ok?'':'disabled'}><div class="memory-art ${ok?'':'locked'}">${ok&&i===5?picture('party-memory','party-memory'):homeScene(Math.min(s.stage,(i+1)*4),{mini:true,poses:c.pose,night:i===4,region:DECOR[(i+1)*4-1].region,historical:true})}${ok?'':icon('lock')}</div><h3>${String(i+1).padStart(2,'0')} · ${ok?c.memory:c.name}</h3><p>${ok?'轻轻翻开这一天':`完成第 ${i+1} 章后收进手帐`}</p></button>`;}).join('')}</div>${s.stage?`<div class="past-stories"><div class="companion-illustration">${picture('story-companion')}<span>和你一起，平凡也很可爱。</span></div><div class="section-title">已经发生的小故事</div>${TASKS.slice(0,s.stage).map(t=>`<button data-action="replayTask" data-id="${t.id}">${picture(t.decor)}${t.name}${icon('play')}</button>`).join('')}${CAMPAIGN_TASKS.slice(0,s.campaign.completed).map(t=>`<button data-action="replayCampaign" data-id="${t.id}">${orderThumbnail(t)}${esc(t.name)}${icon('play')}</button>`).join('')}</div>`:''}`;
  if(s.stage===24)content=renderCampaignMemories()+content;
 }else if(ui.bookMode==='collection'){
  content=`<div class="collection-count"><span>物品图鉴 · 每一种都有名字</span><b>${Object.keys(s.seen).length} / 36</b></div>${CATS.map(c=>`<section class="chain-section"><div class="chain-head">${picture('gen-'+c)}<div><h3>${CHAINS[c].name}</h3><p>来源：${CHAINS[c].producer}</p></div>${ib('arrow','source','前往这个工作台',`data-cat="${c}"`,true)}</div><div class="collection-grid">${CHAINS[c].items.map((name,i)=>{const seen=s.seen[itemKey(c,i+1)],count=game.count(c,i+1);return `<button class="collection-item ${seen?'':'unseen'}" data-action="item" data-cat="${c}" data-level="${i+1}"><small>${i+1} 级</small>${picture(itemKey(c,i+1),'',name)}<span>${name}</span>${count?`<span class="mini-count">持有 ${count}</span>`:''}</button>`;}).join('')}</div></section>`).join('')}`;
 }else{
  content=`<div class="stats-grid"><div class="stat"><strong>${s.stats.merge}</strong><span>次小小合成</span></div><div class="stat"><strong>${s.stats.order}</strong><span>个心愿送达</span></div><div class="stat"><strong>${s.stage}</strong><span>处温暖角落</span></div></div>${dailyContent()}<div class="section-title">一起玩的小约定</div><p class="description muted" style="font-size:11px">不着急、不比快。每天的小目标不是必须完成的功课；错过一天，也不会失去已经建好的小屋。</p>`;
 }
 return `<section class="book-view"><div class="book-hero"><span class="eyebrow">OUR DAYS, IN LITTLE PAGES</span><h2>我们的生活手帐</h2><p>合过的小东西，和舍不得忘记的今天。</p>${icon('book')}</div><div class="book-controls"><div class="segmented"><button class="${ui.bookMode==='memories'?'active':''}" data-action="bookMode" data-mode="memories">回忆明信片</button><button class="${ui.bookMode==='collection'?'active':''}" data-action="bookMode" data-mode="collection">物品图鉴</button><button class="${ui.bookMode==='daily'?'active':''}" data-action="bookMode" data-mode="daily">今日小目标</button></div></div>${content}</section>`;
}
function renderCampaignMemories(){
 const completed=game.s.campaign.completed;
 return `<div class="section-title">生活主线 · 九章回忆 · ${completed}/72 项</div><div class="memory-grid campaign-memory-grid">${CAMPAIGN_CHAPTERS.map((c,i)=>{const n=Math.min(8,Math.max(0,completed-i*8)),ok=n===8;return `<button class="memory-card campaign-memory-card" data-action="campaignMemory" data-chapter="${i}" ${ok?'':'disabled'}><div class="campaign-memory-art">${picture(campaignPoseId(c.pose?.[0]||'bubu-idle'))}${picture(campaignPoseId(c.pose?.[1]||'yier-turn'))}${ok?'':icon('lock')}</div><h3>${String(i+1).padStart(2,'0')} · ${esc(ok?c.memory:c.name)}</h3><p>${ok?'这一章，永久收进手帐':`${n}/8 项 · 完成后留下回忆`}</p></button>`;}).join('')}</div><p class="note">生活主线的物资分批交付会保留进度。回放故事与章节回忆不重复发奖。</p>`;
}
function campaignDialogueMarkup(task){
 return `<div class="campaign-result-dialogues">${task.after.map(([who,pose,text])=>`<div class="campaign-result-line">${picture(`${who}-${pose==='happy'?'joy':pose}`, 'campaign-result-portrait',who==='bubu'?'布布':'一二')}<div><b>${who==='bubu'?'布布':'一二'}</b><p>${esc(text)}</p></div></div>`).join('')}</div>`;
}
function campaignPreparationMarkup(task){
 if(!task.expanded||!Array.isArray(task.steps))return '';
 return `<div class="campaign-preparation"><h3>整项物资计划</h3><p class="note">当前只交付高亮步骤。已完成步骤不重复消耗，剩余步骤可分多次体力恢复慢慢准备；整单完成后再领取奖励。</p>${task.steps.map((step,i)=>`<section class="campaign-preparation-step ${i<task.phase?'done':i===task.phase?'current':''}"><h4>${i<task.phase?'✓ 已收好':i===task.phase?'当前准备':'稍后准备'} · ${i+1}. ${esc(step.label)}</h4><div class="campaign-material-summary">${step.needs.map(r=>`<span>${picture(itemKey(r.c,r.l))}${esc(itemName(r.c,r.l))} ×${r.n}</span>`).join('')}</div></section>`).join('')}</div>`;
}
function renderShop(){
 const s=game.s;
 return `<section class="shop-view"><div class="page-heading"><div><span class="eyebrow">A LITTLE HELP, A LITTLE SWEET</span><h2>巷口的小铺</h2><p>金币来自合成订单 · 没有真实付费或广告</p></div>${picture('util-coin','', '金币')}</div><div class="shop-banner">${picture('util-gift')}<div><h3>今日小礼物</h3><p>40 金币 · 1 剪刀</p></div>${btn(s.daily.gift?'已收好':'免费领取','dailyGift','small',s.daily.gift?'disabled':'')}</div><div class="shop-grid">${[
 ['scissors','util-scissors','小小剪刀','高阶物品拆成两个低一阶',CFG.scissorCost],['parcel','util-gift','心愿补给包','先选订单和来源，再确认四件内容',CFG.parcelCost]
 ].map(([key,id,name,desc,price])=>`<article class="shop-product">${picture(id)}<h3>${name}</h3><p>${desc}</p>${btn(picture('util-coin')+price,'buy','small',`data-key="${key}"`)}</article>`).join('')}</div><div class="section-title">把工作台照顾得更好</div><div class="stock-list">${CATS.map(c=>{const p=s.producers[c],on=game.unlocked(c);return `<article class="producer-card ${on?'':'locked'}"><div class="row">${picture('gen-'+c)}<div><h3>${CHAINS[c].producer}</h3><p>${on?`Lv.${p.level} · 库存 ${stockCap(p)}`:`完成第 ${CHAINS[c].unlock} 处布置后开启`}</p></div></div><p style="margin-top:7px">${on?`二阶概率 ${Math.round((.2+(p.level-1)*.12)*100)}% → ${p.level<3?Math.round((.2+p.level*.12)*100)+'%':'已满级'}`:'完成对应修缮后自动解锁'}</p>${btn(on?(p.level>=3?'已经很好啦':`升级 · ${CFG.upgradeCosts[p.level-1]} 金币`):'还没解锁','upgrade','small alt',`data-cat="${c}" ${on&&p.level<3?'':'disabled'}`)}</article>`;}).join('')}</div><p class="shop-note">工作台库存自然补充，体力每100秒恢复1点，最多存100点。<br>金币用于工作台、仓库与合成工具；升级可增加少量体力。</p></section>`;
}
function dailyContent(){
 const s=game.s;return DAILY.map(d=>{const n=s.daily[d.key],claimed=s.daily.claimed.includes(d.key),ready=n>=d.target;return `<div class="daily-item"><div class="row between"><h3>${d.title}</h3><small class="muted">${Math.min(n,d.target)} / ${d.target}</small></div><p>${d.desc} · 奖励 ${d.coins} 金币</p><div class="row"><div class="progress-track"><i style="width:${Math.min(100,n/d.target*100)}%"></i></div>${btn(claimed?'已收好':ready?'领取奖励':'慢慢来','claimDaily','small',`data-key="${d.key}" ${ready&&!claimed?'':'disabled'}`)}</div></div>`;}).join('');
}

// ------- Sheets -------
function openModal(m){
 cancelActorDrag();
 if(m.type==='activityResult'||m.type==='worldMemory'){ui.scenePlayer?.destroy();ui.scenePlayer=null;ui.sceneSnapshot=null;ui.sceneAwaitChoice=false;}
 cancelDrag();cancelFurnitureDrag();if(!ui.modal)modalReturnFocus=focusKey(document.activeElement);ui.modal=m;renderModal();syncInert();$('.modal [data-action="closeModal"]')?.focus({preventScroll:true});
}
function closeModal(){
 ui.scenePlayer?.destroy();ui.scenePlayer=null;ui.sceneSnapshot=null;ui.sceneAwaitChoice=false;ui.modal=null;modalRoot.innerHTML='';syncInert();findFocus(modalReturnFocus)?.focus({preventScroll:true});modalReturnFocus=null;
}
function sheet(title,body,staticResult=false){return `<div class="modal-backdrop${staticResult?' activity-result-backdrop':''}"><section class="modal${staticResult?' activity-result-modal':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-handle"></div><div class="modal-title"><h2>${title}</h2>${ib('close','closeModal','关闭')}</div>${body}</section></div>`;}
function renderModal(){
 const focus=focusKey(document.activeElement),m=ui.modal;if(!m){modalRoot.innerHTML='';return;}const s=game.s;let title='',body='';
 if(m.type==='parcel'){title='给哪一份心愿补给？';body=parcelContent(m);}
 else if(m.type==='itemActions'){
  const t=s.board[m.index],reason=s.stage===0?'先完成门口的小心愿':!t||t.k!=='item'||t.dust||t.l<=1?'仅能拆分2级以上的普通物品':s.bag.scissors<=0?'剪刀已用完':game.free()===0?'棋盘需要至少一个空位':'';
  title='收好、拆分或出售';body=t?.k==='item'?`${picture(itemKey(t.c,t.l),'hero-img')}<h3 class="center">${itemName(t.c,t.l)}</h3><p class="description">剪刀剩余 ${s.bag.scissors} 把。使用1把，将物品拆成两个低一级物品，并需要一个额外空位。${reason?`<br>${reason}。`:''}<br>出售得到 ${mass(t)} 金币，无法撤回。</p><div class="actions">${btn(icon('scissors')+'使用剪刀 · 剩余 '+s.bag.scissors+' 把','split','alt',`data-index="${m.index}" ${reason?'disabled':''}`)}${btn('出售此物品','sell','danger')}</div>`:'<p>先选择棋盘上的物品。</p>';
 }
 else if(m.type==='event'){title=m.title;body=`<div class="event-scene">${homeScene(m.scene.stage,{mini:true,scene:ui.sceneSnapshot||m.scene,region:m.scene.region,night:m.scene.night})}</div>${m.scene.result?.condition==='wind'?`<div class="wind-choices"><span>风来了，先把茶布固定好：</span>${btn('夹子夹好','sceneChoice','small alt','data-choice="clip"')}${btn('杯垫压稳','sceneChoice','small alt','data-choice="anchor"')}</div>`:''}<div class="event-caption" aria-live="polite">${m.reply?eventReplyMarkup(m.reply):esc(m.caption||'两只熊一起把今天准备好。')}</div>${m.reward?`<p class="event-reward">已收好 ${m.reward.coins} 金币 · ${m.reward.xp||0} 经验${m.reward.firstSouvenir?' · 新纪念物已入手帐':''}</p>`:''}<div class="actions">${btn('下一步动作','sceneAdvance','alt','disabled')}${btn('跳到结果','sceneSkip','alt')}${btn('再看一次','sceneReplay','alt')}${btn(icon('camera')+'合照','photo','alt')}</div><p class="note">回放与拍照不会再次消耗材料，也不会重复发奖。</p>`;}
 else if(m.type==='orders'){
  title='今天的小心愿';body=`<div class="order-strip order-row">${allOrderCards()}</div>`;
 }else if(m.type==='teaPlans'){
  title='准备怎样的茶会？';body=teaContent();
 }else if(m.type==='orderDetails'){
  const task=activeOrders().find(v=>v.kind===m.kind&&String(v.task.id)===String(m.id))?.task;title=task?.name||'这份心愿已完成';body=task?`<p class="description">${esc(task.wish)}</p>${task.totalPhases>1?`<p class="description">准备 ${task.phase+1}/${task.totalPhases} · ${esc(task.phaseLabel)}<br>${task.expanded?'交付后保留物资进度，整单完成才领取金币与经验，不新增家具。':'各步骤交付后摆到现场，整单完成才领取金币与经验。'}</p>`:''}${task.loop?`<p class="note">${task.slot===0?'轻委托':'长委托'} · 第 ${task.loop} 轮 · 难度 ${task.tier+1}（接单时 Lv.${task.levelAt}）<br>完成后补上新委托；每12单进入下一轮，更换委托不会增加完成数。</p>`:''}${orderCard(task,m.kind,m.kind==='side'?s.sideOrders.findIndex(v=>String(v.id)===String(m.id)):0,{full:true})}${campaignPreparationMarkup(task)}`:'<p class="description">这张心愿已更新，请回合成台查看新的订单。</p>';
 }else if(m.type==='item'||m.type==='chain'){
  const c=m.c,l=m.l||1;title=m.type==='chain'?CHAINS[c].name:itemName(c,l);
  body=`<div class="item-detail">${picture(itemKey(c,l))}<div><h3>${itemName(c,l)} <span class="tag">${l} 级</span></h3><p>棋盘与仓库共持有 ${game.count(c,l)} 件<br>${l===6?'这是本条合成链的最高阶。':`两个相同的 ${l} 级物品 → 一个 ${l+1} 级物品。`}</p></div></div><p class="description">${CHAINS[c].desc}</p><div class="route">${CHAINS[c].items.map((name,i)=>`${i?'<span class="route-arrow">›</span>':''}<button class="route-step ${l===i+1?'current':''}" data-action="item" data-cat="${c}" data-level="${i+1}">${picture(itemKey(c,i+1))}<small>${i+1}</small><span>${name}</span></button>`).join('')}</div><div class="route-source">${picture('gen-'+c)}<div><b style="font-size:12px">来自 ${CHAINS[c].producer}</b><p>${game.unlocked(c)?'点击工作台，以 1 体力取出一件材料。':`完成前 ${CHAINS[c].unlock} 处布置后开启。`}</p></div>${btn('去看看','source','small',`data-cat="${c}"`)}</div><p class="note">合成表示把同类生活用品逐步整备升级，不是现实中的物理配方。订单只接收指定阶数，不自动折算高阶物品。</p>`;
 }else if(m.type==='decorStorage'){
  title='家具收纳';body=`<p class="description">收起来的家具保留位置和配色。点击恢复，回到它原来的场景；不占棋盘仓库空间。</p>${s.hiddenDecor.length?`<div class="decor-storage-list">${s.hiddenDecor.map(id=>`<article>${picture(TASKS[id].decor,'art')}<div><b>${esc(TASKS[id].name)}</b><small>${REGIONS.find(r=>r.id===DECOR[id].region).name}</small></div>${btn('恢复摆放','restoreDecor','small',`data-id="${id}"`)}</article>`).join('')}</div>`:'<div class="inventory-empty">还没有收起来的家具。<br>点击场景里的家具，再点“收纳”。</div>'}`;
 }else if(m.type==='storage'){
  title='把小东西收好';const source=ui.storageTab,arr=s[source];
  body=`<div class="storage-tabs segmented"><button class="${source==='storage'?'active':''}" data-action="storageTab" data-source="storage">仓库 ${s.storage.length}/${s.capacity}</button><button class="${source==='pending'?'active':''}" data-action="storageTab" data-source="pending">待领礼物 ${s.pending.length}</button></div><p class="description">${source==='storage'?'点一下物品即可取回棋盘。仓库内的物品也可以直接交付订单。':'满盘时礼物会留在这里，不会消失。取到棋盘后才能合成或交付。'}</p>${arr.length||source==='storage'?`<div class="inventory-grid">${Array.from({length:source==='storage'?s.capacity:arr.length},(_,i)=>{const t=arr[i];return t?`<button class="inventory-slot" data-action="retrieve" data-source="${source}" data-index="${i}" aria-label="取出${itemName(t.c,t.l)}">${picture(itemKey(t.c,t.l))}<span class="level">${t.l}</span><small>${itemName(t.c,t.l)}</small></button>`:'<div class="inventory-slot">空位</div>';}).join('')}</div>`:'<div class="inventory-empty">这里暂时没有待领物品。<br>章节奖励和补给包会送到这里。</div>'}<div class="bag-line"><div>${picture('util-scissors')}剪刀 ×${s.bag.scissors}</div></div>${source==='storage'&&s.capacity<24?btn(`再添 4 个空位 · ${game.expansionCost()} 金币`,'expand','wide alt'):''}<p class="note">工作台不会进入仓库，也不会被出售。手动收纳：在棋盘选中物品后，点下方的收纳盒图标。</p>`;
 }else if(m.type==='energy'){
  title='体力与慢慢积累';const p=levelProgress(s),next=p.level<99?levelReward(p.level+1):null;
  body=`${picture('bubu-sit','hero-img')}<div class="reward-tray"><span>${picture('util-energy')}${s.energy} / 100</span></div><p class="description center">体力每100秒自然恢复1点，上限100点。<br>只有升级会额外增加体力，达到上限的部分不再存储。${next?`<br>升到 Lv.${p.level+1} 可增加 ${next.energy} 点体力。`:''}</p><p class="note">合成、整理、布置和回家陪伴不消耗体力。<br>体力用于从工作台取出新材料，订单与礼包不补充体力。</p>${btn('看看成长进度','growth','wide alt')}`;
 }else if(m.type==='daily'){
  title='今天，也有小小收获';body=`<div class="shop-banner">${picture('util-gift')}<div><h3>今天的小礼物</h3><p>40 金币 · 1 剪刀</p></div>${btn(s.daily.gift?'已收好':'免费领','dailyGift','small',s.daily.gift?'disabled':'')}</div>${dailyContent()}<p class="note">按设备本地日期更新；不强制连续签到。<br>今天没做完，也不会影响主线故事。</p>`;
 }else if(m.type==='settings'){
  title=TITLE+'的使用说明';body=`${[
   ['sound','小物件的声音','合成、交付和点击时的轻轻回应。'],['music','暖暖的背景音乐','原创玩具钢琴小调，默认关闭。'],['reducedMotion','减少动态效果','用关键动作画面展示结果，关闭飘动、粒子和弹跳；奖励保持一致。']
  ].map(([key,name,desc])=>`<div class="setting-row"><div><h3>${name}</h3><p>${desc}</p></div><button class="toggle ${s.settings[key]?'on':''}" data-action="setting" data-key="${key}" role="switch" aria-checked="${s.settings[key]}" aria-label="${name}"><i></i></button></div>`).join('')}${environmentSettings()}<div class="section-title">保管好熊熊之家的回忆</div><p class="description">进度保存在当前浏览器，没有云账号。换设备或清理浏览器前，请先导出存档。${storageFailed?'<br><b>当前浏览器不允许保存，请务必导出。</b>':''}</p><div class="settings-grid">${btn(icon('download')+'导出存档','export','alt')}${btn(icon('upload')+'导入存档','import','alt')}${btn(icon('play')+'重看开场','replayIntro','alt')}${btn(icon('info')+'玩法说明','help','alt')}</div><div class="actions">${btn('重新开始这间小屋','resetAsk','danger')}</div><p class="note">单机 H5 v${VERSION} · 3 区域家园 · 96 项主线<br>6 章布置 + 9 章生活故事 · 循环邻里委托<br>本作品为布布一二主题单机游戏；商业发行需另行取得角色 IP 授权。<br>没有广告、内购、排行榜或数据上传。</p>`;
 }else if(m.type==='campaignResult'){
  const r=m.result,t=r.campaignTask||CAMPAIGN_TASKS.find(t=>t.id===r.id),c=CAMPAIGN_CHAPTERS[t.chapter];title=t.name;
  body=`<p class="eyebrow center">生活主线 · ${esc(c.name)} · ${journeyCount(s)}/96</p>${campaignDialogueMarkup(t)}<div class="reward-tray"><span>${picture('util-coin')}+${r.coins}</span><span>EXP +${r.xp}</span></div><p class="description center">所有物资已经收好，金币与经验已到账。${r.chapterDone?`<br>“${esc(c.memory)}”已永久收进生活手帐。`:''}${r.finished?'<br>96项主线已经完成，邻里循环委托仍会不断更新。':''}</p><div class="actions">${btn('继续合成','merge','wide')}${btn(r.finished?'翻开生活手帐':'看看下一项主线',r.finished?'book':'campaignNext','wide alt')}</div>`;
 }else if(m.type==='campaignMemory'){
  const c=CAMPAIGN_CHAPTERS[m.chapter];title=c.memory;
  body=`<div class="campaign-memory-art memory-full">${picture(campaignPoseId(c.pose?.[0]||'bubu-idle'))}${picture(campaignPoseId(c.pose?.[1]||'yier-turn'))}</div><p class="eyebrow center">生活主线 · 第 ${m.chapter+1} 章 · ${esc(c.name)}</p><p class="memory-text">${esc(c.text)}</p><p class="note">八项生活准备已经完成。这份回忆永久保留，重温不重复发奖。</p>${btn('把这一天收好','closeModal','wide')}`;
 }else if(m.type==='submitted'){
  title='这份小心愿，备好啦';const r=m.result;
  body=`${picture('yier-happy','reward-art')}<h3 class="celebration-title">现在，回家变一点点更好</h3><p class="description center">材料已经收进修缮包。<br>心愿星只用于当前这处布置，不会被小铺花掉。</p><div class="reward-tray"><span>${picture('util-star')}+1</span><span>${picture('util-coin')}+${r.coins}</span>${r.xp?`<span>EXP +${r.xp}</span>`:''}</div>${btn('带心愿星回小屋','afterSubmit','wide')}`;
 }else if(m.type==='build'){
  const t=TASKS[s.stage];if(!t){closeModal();return;}title=t.name;
  body=`<p class="description">一二挑颜色，布布负责放稳。两种风格随时可以免费更换。</p><div class="style-options">${[0,1].map(i=>`<button class="style-option ${i?'variant':''} ${ui.styleChoice===i?'selected':''}" data-action="chooseStyle" data-style="${i}" aria-pressed="${ui.styleChoice===i}">${picture(t.decor)}<span class="swatch"></span>${i?'薄荷来信':'奶油晴天'}</button>`).join('')}</div>${btn(picture('util-star')+' 用 1 颗心愿星布置','confirmBuild','wide')}<p class="note">已交付本次材料 · 布置完成后开启下一张心愿</p>`;
 }else if(m.type==='decorate'){
  title='换一个喜欢的颜色';body=s.stage?`<p class="description">点已经摆好的小东西，切换它的两种配色。不花金币，也不影响进度。</p><div class="decor-picker">${TASKS.slice(0,s.stage).map(t=>`<button class="decor-choice ${s.decorStyles[t.id]?'variant':''}" data-action="redecorate" data-id="${t.id}" aria-label="切换${t.name}配色">${picture(t.decor,'',t.name)}<small>${s.decorStyles[t.id]?'薄荷':'奶油'}</small></button>`).join('')}</div>`:'<div class="inventory-empty">先合出软海绵、交付心愿，<br>为小屋铺好第一块门垫吧。</div>';
 }else if(m.type==='memory'){
  const c=CHAPTERS[m.chapter];title=m.reward?'把今天收进手帐':c.memory;
  body=`<div class="memory-full">${m.chapter===5?picture('party-memory','party-memory'):homeScene((m.chapter+1)*4,{mini:true,poses:c.pose,night:m.chapter===4,region:DECOR[(m.chapter+1)*4-1].region,historical:true})}</div><p class="eyebrow center">CHAPTER ${String(m.chapter+1).padStart(2,'0')} · ${c.memory}</p><p class="memory-text">${c.text}</p>${m.reward?`<div class="reward-tray"><span>${picture('util-coin')}+60</span><span>${picture('util-scissors')}+1</span></div><p class="note">章节奖励已到账，两件材料已放入“待领礼物”。</p>`:''}<div class="actions">${btn(m.reward&&m.chapter===5?'翻到最后一页':'把这一天收好','memoryDone','wide')}</div>`;
 }else if(m.type==='discovery'){
  title=m.l===6?'最高阶收藏，合出来啦！':'新的可爱，闪亮登场';
  body=`<div class="discovery-stage">${picture(itemKey(m.c,m.l),'discovery-art')}<span class="discovery-level">LEVEL ${m.l}</span></div><h3 class="center">${itemName(m.c,m.l)}</h3><p class="description center">从小小材料到精致成品，<br>这件新发现已永久收进物品图鉴。</p>${btn('继续布置熊熊之家','closeModal','wide')}`;
 }else if(m.type==='furniture'){
  const t=TASKS[m.id],region=REGIONS.find(r=>r.id===DECOR[m.id].region);title=t.name;
  body=`<div class="furniture-detail">${picture(t.decor)}</div><p class="description center">${region.name}里的第 ${DECOR.filter(d=>d.region===region.id&&d.id<=m.id).length} 个小愿望。<br>${esc(t.wish)}</p><div class="actions">${btn('重温这段故事','replayTask','alt',`data-id="${m.id}"`)}${btn('换个配色','redecorate','',`data-id="${m.id}"`)}${btn('回到场景移动','editFurniture','alt',`data-id="${m.id}"`)}</div><p class="note">点击家具可显示“移动”；按住拖动，松手保存。位置和配色都会保留。</p>`;
 }else if(m.type==='activityResult'||m.type==='worldMemory'){
  const r=m.result||{},region=REGIONS.find(v=>v.id===r.region)||REGIONS[0],details=game.activityDetails(region.id),ready=s.stage>=MEMORY_GATES[region.id],replay=m.replay||m.type==='worldMemory';
  title=replay?(r.memoryName||region.memoryName):details.activityLabel;
  body=`<img class="activity-result-art" src="${asset(`activity-${region.id}-${ready?'ready':'early'}`)}" alt="${esc(region.name+' · '+details.activityLabel+'的结果图')}" draggable="false"><p class="activity-result-message">${esc(r.message||details.activityText)}</p>${!replay&&r.coins?`<p class="activity-result-reward">已收好 ${r.coins} 金币${r.xp?' · '+r.xp+' 经验':''}</p>`:''}${r.milestone?'<p class="description center">新的家园回忆已收进手帐。</p>':''}<p class="note">${replay?'重温回忆不会重复发放奖励。':'今天的小事已完成，奖励已到账，明天还能一起做新的小事。'}</p>${btn(replay?'收好这份回忆':'把今天收好','closeModal','wide')}`;
 }else if(m.type==='ending'){
  const arrived=s.tea.firstVisit==='arrived';title='家园布置篇，收好啦';body=`${picture('party-memory','ending-party')}<div class="warm-text">${speechRow('yier','布布，我们真的把它变成家了。')}${speechRow('bubu','嗯。花园和庭院，也都是我们的家。')}</div><div class="stats-grid" style="margin-top:18px"><div class="stat"><strong>24</strong><span>处家园布置完成</span></div><div class="stat"><strong>${s.stats.merge}</strong><span>次小小合成</span></div><div class="stat"><strong>${Object.keys(s.seen).length}</strong><span>件可爱收藏</span></div></div><p class="description center">六章家园布置篇完成，接下来还有72项生活主线与九章故事。物资准备逐渐变大，可以分批交付，把日子继续过下去。${arrived?'也可以与小栗喝茶，收集新的家园回忆。':'点心和杯子已经备齐，小栗首访也在等你。'}</p>${arrived?'':btn('迎接小栗首访','firstVisit','wide alt')}${btn(journeyCount(s)<96?'继续生活主线':'继续我们的日子','endingDone','wide')}`;
 }else if(m.type==='confirmSell'){
  const t=s.board[m.index];if(!t||t.k!=='item'){closeModal();return;}title='这件物品，心愿里也需要';body=`${picture(itemKey(t.c,t.l),'hero-img')}<p class="description center">${itemName(t.c,t.l)} 正被当前订单需要。<br>出售可得到 ${mass(t)} 金币，但之后需要重新合成。</p><div class="actions">${btn('留给小心愿','closeModal','alt')}${btn('还是出售','confirmSell','danger',`data-index="${m.index}"`)}</div>`;
 }else if(m.type==='reset'){
  title='重新开始之前';body=`<p class="description">这会清空当前浏览器中这间小屋的进度和自动备份，包括章节、物品与金币。建议先导出一份存档。</p>${btn('先导出现在的存档','export','wide alt')}<div class="actions">${btn('保留小屋','closeModal','alt')}${btn('确认重新开始','resetConfirm','danger')}</div>`;
 }else if(m.type==='importConfirm'){
  title='要搬进这份存档吗？';body=`<p class="description">将载入一间已经完成 ${m.state.stage} / 24 处布置、${m.state.campaign.completed} / 72 项生活主线的小屋（Lv.${levelOf(m.state)}）。当前进度会被替换，建议先导出。</p><div class="actions">${btn('取消','closeModal','alt')}${btn('确认载入','importConfirm')}</div>`;
 }else if(m.type==='growth'){
  const p=levelProgress(s),next=p.level<99?levelReward(p.level+1):null,upcoming=Math.min(95,Math.ceil((p.level+1)/5)*5),giftLevels=Array.from({length:Math.floor(p.level/5)},(_,i)=>(i+1)*5).filter(v=>v<=95);
  title='一点点，也算长大';body=`${picture('bubu-joy','hero-img')}<h3 class="center">成长等级 Lv.${p.level}</h3><p class="description center" style="margin-top:10px">交付订单与布置增加经验，合成负责准备材料。<br>${next?`下一次升级还需 ${p.required-p.current} 经验；奖励 ${next.coins} 金币和 ${next.energy} 体力。`:'已经达到最高99级，茶会与邻里委托仍可继续。'}<br>等级越高，所需经验越多，升级奖励随梯度增加。</p><div class="row"><div class="progress-track"><i style="width:${p.required?Math.min(100,p.current/p.required*100):100}%"></i></div><small class="muted">${p.required?`${p.current} / ${p.required}`:'已满级'}</small></div><div class="section-title">每5级，一份成长礼包</div>${giftLevels.map(level=>{const gift=levelGift(level,s.stage),claimed=s.levelGiftsClaimed.includes(level);return `<div class="level-gift"><div><h3>Lv.${level} 成长礼包</h3><p>${gift.coins} 金币 · ${gift.scissors} 把剪刀 · ${gift.items.length} 件合成材料</p></div>${btn(claimed?'已领取':'领取','claimLevelGift','small',`data-level="${level}" ${claimed?'disabled':''}`)}</div>`;}).join('')}${p.level<95?`<p class="description">下一份礼包：Lv.${upcoming}。交付订单、完成布置继续成长。</p>`:''}<p class="note">礼包每档只可领一次；材料放入待领礼物，不含体力。<br>升级奖励自动到账，体力最多存100点。</p>`;
 }else if(m.type==='help'){
  title='一起把日子合成家';body=`${[
   ['01 · 每件小东西都有来处','带闪电的是固定工作台。点击它，花 1 体力取出本条链的一阶或二阶物品；库存每 6 秒补 1 件。随小屋修缮，会有新的工作台解锁。'],
   ['02 · 点击或拖动合成','先点一件物品，再点同类同级物品即可合成；也可直接拖到同类同级物品上。拖到空格或其他物品上，会返回原位。尘封物品只接受同类同级合入，不能拖走；最高六级。'],
   ['03 · 96项主线，继续过日子','前24项交付后获得心愿星，亲手布置推进；之后72项生活主线分九章展开，不新增家具。大任务分批准备，已交部分会保存，整单完成才发金币与经验。后期一整单需要跨多次体力恢复准备，不必一次备齐全部物资。'],
   ['03a · 邻里委托可以一直做','布置完成后，邻里栏变成固定轻委托与长委托。交付后立即补上新委托，每完成12单进入下一轮；难度随成长等级提升，物资组合轮换。更换委托不发奖、不推进轮次。支线提供金币与经验，不跳过主线。'],
   ['04 · 桌子满了，也有办法','收进仓库、交付、出售都能腾空间。仓库物品可直接交付；待领礼物不会因满盘丢失。剪刀把二级以上物品拆成两个低一级物品，使用前需要一个额外空格。'],
   ['05 · 先核对，再整备','合成和出售无法撤回。物品超过订单所需等级时，可使用剪刀拆成两个低一级物品；剪刀来自日常奖励、成长礼包和小铺。'],
   ['06 · 一起慢慢积累','体力每100秒自然恢复1点，上限100；只有升级会额外增加少量体力，满额部分不溢出。每5级可领取一次成长礼包，礼包不含体力。金币用于升级工作台、扩展仓库和购买合成材料或剪刀。'],
   ['07 · 记得保管熊熊之家','这是单机游戏，只保存在当前浏览器。换设备前导出 JSON 存档，再到新设备导入。浏览器无痕模式和直接打开文件时的保存能力，取决于浏览器本身。'],
   ['08 · 自己摆放喜欢的家','在小屋、花园或庭院点击已布置家具，会显示“移动”和“收纳”按钮。收起来的家具可在家园“家具收纳”恢复。按住移动按钮拖动，松手保存位置；可恢复原位。也可聚焦移动按钮，用方向键微调，位置随存档和照片保留。'],
   ['09 · 看看窗外的天气','家园会跟随本地时间改变晨昼暮夜，天气是游戏内模拟。在设置中可预览时段和天气，点“跟随时间”恢复自动，不影响订单与奖励。'],
   ['10 · 两只熊也有自己的小日常','布布和一二各自在自己的场景随机散步、做小动作，靠近时可能亲亲或抱抱。长按420毫秒后拖动，门口松手可带角色过门；切换场景只移动视角。分开时一二经常找布布，两熊到齐才能一起做小事或喝茶。小事仍直接展示结果图。移动家具、聊天和读剧情时会暂停；设置中的“减少动态”可让家园安静下来。']
  ].map(([h,p])=>`<div class="help-section"><h3>${h}</h3><p>${p}</p></div>`).join('')}`;
 }
 modalRoot.innerHTML=sheet(title,body,m.type==='activityResult'||m.type==='worldMemory');syncInert();if(m.type==='event')syncEventControls();const restored=findFocus(focus,modalRoot);(restored||$('.modal [data-action="closeModal"]'))?.focus({preventScroll:true});
}

// ------- Launch and comic dialogue -------
function renderSplash(){
 overlayRoot.innerHTML=`<section class="splash" aria-label="游戏启动页"><div class="splash-scene">${homeScene(game.s.stage,{characters:false,mini:true})}</div><i class="splash-leaf one"></i><i class="splash-leaf two"></i><i class="splash-leaf three"></i><div class="splash-top"><div class="eyebrow">BEARS AT HOME</div><h1><span class="bear-title">布布一二</span>${esc(TITLE)}</h1><p class="splash-sub">把小小的心愿，慢慢合成家</p><span class="splash-pill">合成 · 布置 · 陪伴 · 收藏</span></div><div class="splash-bears">${picture('bubu-sit')}${picture('yier-turn')}</div><div class="splash-ribbon">“和你一起，就是最开心的事。”</div><div class="splash-bottom">${btn(game.s.introSeen?'回到熊熊之家':'一起布置熊熊之家','start')}${game.s.introSeen?'<button class="text-button" data-action="replayIntro">再看一遍搬进小屋</button>':''}<p>不用登录 · 单机本地保存 · 没有付费广告<br>建议先导出存档，再切换浏览器或设备。</p></div></section>`;
}
function showStory(lines,onFinish=()=>{},context=null){
 cancelDrag();closeModal();ui.splash=false;ui.story={lines,index:0,onFinish,context};renderStory();syncInert();$('.story-overlay [data-action="nextStory"]')?.focus({preventScroll:true});
}
function renderStory(){
 const q=ui.story;if(!q)return;const line=q.lines[q.index],who=line.who,pose=line.pose||'idle';
 const fullPose={happy:'joy'}[pose]||pose;
 const left=who==='bubu'?`bubu-${fullPose}`:'bubu-turn';const right=who==='yier'?`yier-${fullPose}`:'yier-turn';
 overlayRoot.innerHTML=`<section class="story-overlay" aria-label="剧情对话"><div class="story-scene">${homeScene(q.context?.stage??game.s.stage,{characters:false,mini:true,night:q.context?.night??ui.night,region:q.context?.region||game.s.world.region,historical:!!q.context?.replay})}</div><div class="story-header"><span class="eyebrow">${q.context?.chapterLabel?esc(q.context.chapterLabel):q.context?.replay?'回忆重温 · 原始摆放与区域 · 配色使用当前选择':game.s.stage===0?'PROLOGUE · 推开这扇门':`OUR LITTLE STORY · 第 ${Math.min(6,Math.ceil(game.s.stage/4))} 章`}</span><button class="story-skip" data-action="skipStory">跳过 ${icon('arrow')}</button></div><h2 class="story-title">${esc(line.title||'今天，又多了一点点可爱')}</h2><p class="story-aside">${esc(line.aside||'小小的事情，两个人一起做，就变得不一样。')}</p><div class="story-characters">${picture(left,`story-character ${who==='bubu'?'speaking':''}`)}${picture(right,`story-character ${who==='yier'?'speaking':''}`)}</div><div class="dialogue-box"><div class="dialogue-speech">${speakerPortrait(who)}<div><span class="speaker-name ${who}">${who==='bubu'?'布布':'一二'}</span><p class="dialogue-text">${esc(line.text)}</p></div></div><div class="dialogue-footer"><div class="story-dots">${q.lines.map((_,i)=>`<i class="${i===q.index?'active':''}"></i>`).join('')}</div>${btn(q.index===q.lines.length-1?(q.context?.intro?'一起开始吧':'收好这一刻'):'下一句','nextStory')}</div></div></section>`;
 sounds.play(who==='bubu'?'talk':'yier');
}
function finishStory(){const q=ui.story;if(!q)return;ui.story=null;overlayRoot.innerHTML='';syncInert();q.onFinish();}
function nextStory(){if(!ui.story)return;if(++ui.story.index>=ui.story.lines.length)finishStory();else renderStory();}
function playIntro(){ui.splash=false;showStory(INTRO,()=>{game.markIntro();persist();navigate(game.s.stage===0?'merge':'home');if(game.s.stage===0){highlight([8,9]);toast('从这两块相同的小方巾开始。',2800);}if(saveWarning)toast(saveWarning,5000);},{stage:0,region:'house',night:false,replay:game.s.stage>0,intro:true});}
function replayTask(id,onFinish=()=>{},replay=true){
 const t=TASKS[id];if(!t||id>=game.s.stage)return;showStory(t.after.map(([who,pose,text])=>({who,pose,text,title:t.name,aside:CHAPTERS[t.chapter].sub})),onFinish,{stage:id+1,region:DECOR[id].region,night:t.chapter===4,replay});
}
function replayCampaignTask(id){
 const t=CAMPAIGN_TASKS.find(t=>t.id===id);if(!t||id-24>=game.s.campaign.completed)return;
 const c=CAMPAIGN_CHAPTERS[t.chapter];showStory(t.after.map(([who,pose,text])=>({who,pose,text,title:t.name,aside:c.sub})),()=>{}, {stage:24,region:t.region,replay:true,chapterLabel:`生活主线回忆 · 第 ${t.chapter+1} 章 · ${c.name}`});
}
function afterBuild(r){
 ui.newDecor=r.stage;ui.homeMode='region';ui.night=game.s.stage>=16&&game.s.stage<20;ui.tab='home';ui.selected=null;render();main.scrollTop=0;sounds.play('place');burst(null,true);
 setTimeout(()=>{ui.newDecor=null;replayTask(r.stage,()=>{if(r.chapterDone)openModal({type:'memory',chapter:r.chapter,reward:true});else if(r.unlocked.length)toast(`新工作台开启：${r.unlocked.map(c=>CHAINS[c].producer).join('、')}`);else if(r.stage===0)toast('门垫铺好了！回合成台，试试点击带闪电的清洁篮。',3200);},false);},620);
}
function highlight(indices){ui.highlight=indices;clearTimeout(highlightTimer);render();highlightTimer=setTimeout(()=>{ui.highlight=[];if(ui.tab==='merge')render();},6000);}
function showHint(){const h=game.hint('main');if(h.kind==='lesson'){navigate('merge');const idx=CATS.indexOf(h.c);ui.selected=idx;highlight([idx]);toast(`亲手点一次${CHAINS[h.c].producer}，认识新来源。`);return;}if(h.kind==='build'){openBuildPlacement();return;}if(h.kind==='submit'){navigate('merge');toast(h.orderKind==='tea'?'茶会材料已经备齐，点击茶会物品卡，展开后开始小聚。':h.orderKind==='side'?'邻里委托已经备齐，点击对应物品卡，展开后交付。':game.mainOrder()?.expanded?`上方生活主线第 ${game.mainOrder().phase+1}/${game.mainOrder().totalPhases} 份已备齐，点击物品卡展开后交付。`:'上方小屋心愿已经备齐，点击物品卡展开后交付。');return;}navigate('merge');if(h.kind==='merge'){highlight([h.from,h.to]);toast(`把发亮的两个${itemName(h.c,h.l)}合在一起。`);}else if(h.idx!==undefined){highlight([h.idx]);ui.selected=h.idx;render();toast(`点带闪电的${CHAINS[h.c].producer}，继续准备材料。`);}else toast(h.message||'看看订单里还需要哪些物品。');}
function chat(who){
 if(ui.tab!=='home')return;clearTimeout(chatTimer);$('.room-chat')?.remove();const lines=HOME_CHAT.filter(l=>l[0]===who);if(!lines.length)return;const [,pose,text]=lines[Math.floor(Math.random()*lines.length)];const scene=$('.home-view .home-scene');if(!scene)return;const el=document.createElement('div');el.className='room-chat';el.innerHTML=speechRow(who,text);scene.append(el);sounds.play(who==='yier'?'yier':'talk');chatTimer=setTimeout(()=>{el.remove();refreshLivingScene();},3500);
}
function playHomeActivity(r){
 clearTimeout(toastTimer);$('#toast').className='';
 openModal({type:'activityResult',result:r});
}

// Residents need a stationary hold; moving early cancels instead of arming a drag.
function startActorDrag(e){
 const button=e.target.closest('.home-view .scene-actor[data-action="chat"]'),who=button?.dataset.who;
 if(!button||!['bubu','yier'].includes(who)||e.button!==0||!e.isPrimary||ui.modal||ui.story||ui.splash||actorDrag)return;
 const scene=button.closest('.home-scene');if(!scene)return;
 e.preventDefault();cancelDrag();cancelFurnitureDrag();sounds.unlock();
 const controller=getResidentLife(),base=controller.state(who);
 if(base.region!==game.s.world.region)return;
 const d=actorDrag={who,controller,base,scene,button,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,rect:scene.getBoundingClientRect(),armed:false,timer:null};
 button.classList.add('resident-hold-pending');try{scene.setPointerCapture(e.pointerId);}catch{}
 d.timer=setTimeout(()=>{
  if(actorDrag!==d||!scene.isConnected||!controller.beginDrag(who))return;
  d.armed=true;ui.decorSelected=null;button.classList.remove('resident-hold-pending');scene.classList.add('resident-dragging');
  refreshLivingScene();scene.querySelector('[data-scene-layer="'+who+'"]')?.classList.add('resident-being-dragged');
 },420);
}
function moveActorDrag(e){
 const d=actorDrag;if(!d||e.pointerId!==d.pointerId)return;e.preventDefault();d.lastX=e.clientX;d.lastY=e.clientY;
 if(!d.armed){if(Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>8){ignoreClickUntil=Date.now()+400;cancelActorDrag();}return;}
 d.controller.dragTo(d.who,d.base.x+(e.clientX-d.startX)/d.rect.width*100,d.base.y+(e.clientY-d.startY)/d.rect.height*100);
 refreshLivingScene();
 const exit=residentExitAt(d.base.region,(e.clientX-d.rect.left)/d.rect.width*100,(e.clientY-d.rect.top)/d.rect.height*100);
 d.scene.querySelectorAll('[data-resident-exit]').forEach(n=>n.classList.toggle('resident-exit-ready',n.dataset.residentExit===exit?.id));
}
function releaseActorCapture(d){
 clearTimeout(d.timer);d.button.classList.remove('resident-hold-pending');d.scene.classList.remove('resident-dragging');
 d.scene.querySelectorAll('.resident-exit-ready,.resident-being-dragged').forEach(n=>n.classList.remove('resident-exit-ready','resident-being-dragged'));
 try{d.scene.releasePointerCapture(d.pointerId);}catch{}
}
function cancelActorDrag(repaint=true){
 const d=actorDrag;if(!d)return;actorDrag=null;releaseActorCapture(d);if(d.armed)d.controller.endDrag(d.who,Date.now(),{cancel:true});
 ignoreClickUntil=Date.now()+350;if(repaint)refreshLivingScene();
}
function finishActorDrag(e){
 const d=actorDrag;if(!d||e.pointerId!==d.pointerId)return;e.preventDefault();actorDrag=null;releaseActorCapture(d);ignoreClickUntil=Date.now()+400;
 if(!d.armed){chat(d.who);return;}
 const exit=residentExitAt(d.base.region,(e.clientX-d.rect.left)/d.rect.width*100,(e.clientY-d.rect.top)/d.rect.height*100);
 d.controller.endDrag(d.who);
 if(exit){d.controller.transfer(d.who,exit.destination,exit.spawn.x,exit.spawn.y);game.visitRegion(exit.destination);ui.homeMode='region';ui.decorSelected=null;}
 persist();render();if(exit)toast((d.who==='bubu'?'布布':'一二')+'已经'+exit.label+'啦。');
}
app.addEventListener('pointerdown',startActorDrag);
document.addEventListener('pointermove',moveActorDrag,{passive:false});document.addEventListener('pointerup',finishActorDrag);
document.addEventListener('pointercancel',()=>cancelActorDrag());document.addEventListener('lostpointercapture',e=>{if(actorDrag?.pointerId===e.pointerId)cancelActorDrag();});
window.addEventListener('blur',()=>cancelActorDrag());

// ------- Board pointer handling: primary pointer only; cancellations never move items -------
function selectCell(index){
 const intent=boardTapIntent(game.s.board,ui.selected,index);
 if(intent.kind==='produce'){ui.selected=index;const r=run(game.produce(intent.c));if(!r.ok)render();return;}
 if(intent.kind==='merge'){const r=run(game.move(intent.from,intent.to));if(!r.ok){ui.selected=index;render();}return;}
 if(intent.kind==='select'){ui.selected=intent.index;sounds.play('tap');render();}
}
function startDrag(e){
 const cell=e.target.closest('[data-cell]');if(!cell||e.button!==0||!e.isPrimary||ui.modal||ui.story||ui.splash)return;
 cancelDrag();sounds.unlock();const from=+cell.dataset.cell,t=game.s.board[from];
 const d=drag={from,x:e.clientX,y:e.clientY,lastY:e.clientY,pointerId:e.pointerId,pointerType:e.pointerType,cell,moving:false,ghost:null,canMove:t?.k==='item'&&!t.dust,hold:null,cancelled:false};
 if(d.canMove)d.hold=createPressHold({x:d.x,y:d.y,onArm:()=>{
  if(drag!==d||!cell.isConnected)return;
  d.moving=true;ui.selected=from;cell.classList.add('source');const im=document.createElement('div');im.className='drag-ghost';im.innerHTML=picture(itemKey(t.c,t.l));im.style.left=(d.x-30)+'px';im.style.top=(d.y-38)+'px';document.body.append(im);d.ghost=im;
 }});
 try{cell.setPointerCapture(e.pointerId);}catch{}if(e.pointerType!=='touch')e.preventDefault();
}
function dragMove(e){
 if(!drag||e.pointerId!==drag.pointerId)return;
 const d=drag;d.hold?.move(e.clientX,e.clientY);
 if(!d.moving&&(d.hold?.cancelled||Math.hypot(e.clientX-d.x,e.clientY-d.y)>8))d.cancelled=true;
 if(d.cancelled&&d.pointerType==='touch'){main.scrollTop+=d.lastY-e.clientY;e.preventDefault();}
 d.lastY=e.clientY;
 if(d.moving){e.preventDefault();d.ghost.style.left=(e.clientX-30)+'px';d.ghost.style.top=(e.clientY-38)+'px';$$('.cell.target').forEach(c=>c.classList.remove('target'));const to=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]');if(to&&boardDropIntent(game.s.board,d.from,+to.dataset.cell).kind==='merge')to.classList.add('target');}
}
function endDrag(e){
 if(!drag||e.pointerId!==drag.pointerId)return;const d=drag,phase=d.hold?.release()||(d.cancelled?'cancel':'tap');const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]');cancelDrag();ignoreClickUntil=Date.now()+300;
 if(d.moving){const intent=boardDropIntent(game.s.board,d.from,target?+target.dataset.cell:null);if(intent.kind==='merge'){const r=run(game.move(intent.from,intent.to));if(!r.ok)render();}else{ui.selected=d.from;render();}}
 else if(phase==='tap'&&!d.cancelled)selectCell(d.from);
}
function cancelDrag(){if(drag){drag.hold?.cancel();drag.ghost?.remove();drag.cell?.classList.remove('source');try{drag.cell?.releasePointerCapture(drag.pointerId);}catch{}}drag=null;$$('.cell.target').forEach(c=>c.classList.remove('target'));}
app.addEventListener('pointerdown',startDrag);document.addEventListener('pointermove',dragMove,{passive:false});document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',cancelDrag);window.addEventListener('blur',cancelDrag);
document.addEventListener('lostpointercapture',e=>{if(drag?.pointerId===e.pointerId)cancelDrag();});
app.addEventListener('contextmenu',e=>{if(e.target.closest('[data-cell],[data-action="decorMoveHandle"],.scene-actor[data-who]'))e.preventDefault();});
// A furniture handle moves the actual scene layer; only a completed release changes the save.
function paintFurniturePosition(d,p){
 d.layer.style.left=p.x+'%';d.layer.style.top=p.y+'%';
 const handle=d.button.parentElement;handle.style.left=p.x+'%';handle.style.top=Math.max(7,p.y-p.h/2-6)+'%';
}
function startFurnitureDrag(e){
 const button=e.target.closest('[data-action="decorMoveHandle"]');if(!button||e.button!==0||!e.isPrimary||ui.modal||ui.story||ui.splash)return;
 const id=+button.dataset.id,scene=button.closest('.home-scene'),layer=scene?.querySelector(`[data-id="${id}"]`);if(!layer||id>=game.s.stage)return;
 e.preventDefault();cancelFurnitureDrag();const base=decorPlacement(id,game.s.decorPositions[id]);
 furnitureDrag={id,pointerId:e.pointerId,button,layer,scene,rect:scene.getBoundingClientRect(),base,position:base,startX:e.clientX,startY:e.clientY,moved:false};
 layer.classList.add('furniture-moving');try{button.setPointerCapture(e.pointerId);}catch{}
}
function moveFurnitureDrag(e){
 const d=furnitureDrag;if(!d||e.pointerId!==d.pointerId)return;e.preventDefault();
 const dx=e.clientX-d.startX,dy=e.clientY-d.startY;if(!d.moved&&Math.hypot(dx,dy)<4)return;d.moved=true;
 d.position=decorPlacement(d.id,{x:d.base.x+dx/d.rect.width*100,y:d.base.y+dy/d.rect.height*100});paintFurniturePosition(d,d.position);
}
function cancelFurnitureDrag(){
 const d=furnitureDrag;if(!d)return;furnitureDrag=null;paintFurniturePosition(d,d.base);d.layer.classList.remove('furniture-moving');try{d.button.releasePointerCapture(d.pointerId);}catch{}
}
function finishFurnitureDrag(e){
 const d=furnitureDrag;if(!d||e.pointerId!==d.pointerId)return;
 const position=d.position;cancelFurnitureDrag();ignoreClickUntil=Date.now()+300;
 if(!d.moved)return;
 const r=game.moveDecor(d.id,position.x,position.y);if(!r.ok){run(r);render();return;}
 const saved=persist();render();toast(saved?'摆放位置已保存。':'位置已调整，本地保存失败，请导出存档保管。',saved?2300:5000);
}
app.addEventListener('pointerdown',startFurnitureDrag);document.addEventListener('pointermove',moveFurnitureDrag,{passive:false});document.addEventListener('pointerup',finishFurnitureDrag);
document.addEventListener('pointercancel',e=>{if(furnitureDrag?.pointerId===e.pointerId)cancelFurnitureDrag();});
document.addEventListener('lostpointercapture',e=>{if(furnitureDrag?.pointerId===e.pointerId)cancelFurnitureDrag();});window.addEventListener('blur',cancelFurnitureDrag);
// A map drag scrolls the landscape; a short tap still activates a landmark.
let mapDrag=null;
app.addEventListener('pointerdown',e=>{
 const viewport=e.target.closest('.world-viewport');if(!viewport||!e.isPrimary||e.button!==0)return;
 mapDrag={viewport,id:e.pointerId,x:e.clientX,y:e.clientY,left:viewport.scrollLeft,moving:false};
});
document.addEventListener('pointermove',e=>{
 if(!mapDrag||e.pointerId!==mapDrag.id)return;
 const dx=e.clientX-mapDrag.x,dy=e.clientY-mapDrag.y;
 if(!mapDrag.moving&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){mapDrag.moving=true;mapDrag.viewport.classList.add('dragging');try{mapDrag.viewport.setPointerCapture(e.pointerId);}catch{}}
 if(mapDrag.moving){e.preventDefault();mapDrag.viewport.scrollLeft=mapDrag.left-dx;ui.mapScroll=mapDrag.viewport.scrollLeft;}
},{passive:false});
function cancelMapDrag(e){if(!mapDrag||e?.pointerId!==undefined&&e.pointerId!==mapDrag.id)return;if(mapDrag.moving)ignoreClickUntil=Date.now()+350;mapDrag.viewport.classList.remove('dragging');try{mapDrag.viewport.releasePointerCapture(mapDrag.id);}catch{}mapDrag=null;}
document.addEventListener('pointerup',cancelMapDrag);document.addEventListener('pointercancel',cancelMapDrag);window.addEventListener('blur',()=>cancelMapDrag());

// ------- Unified click actions -------
// A fresh press is intentional; suppress only the click generated by the previous drag/release.
app.addEventListener('pointerdown',()=>{ignoreClickUntil=0;});
app.addEventListener('click',async(e)=>{
 const cell=e.target.closest('[data-cell]');
 if(cell){if(e.detail===0){const index=+cell.dataset.cell;selectCell(index);$(`[data-cell="${index}"]`)?.focus({preventScroll:true});}return;}
 const nav=e.target.closest('[data-tab]');if(nav){sounds.unlock();sounds.play('tap');navigate(nav.dataset.tab);return;}
 const b=e.target.closest('[data-action]');if(!b||b.disabled)return;
 if(Date.now()<ignoreClickUntil&&e.detail!==0)return;
 sounds.unlock();const a=b.dataset.action,d=b.dataset;
 switch(a){
  case 'start':hasStarted=true;ui.splash=false;overlayRoot.innerHTML='';syncInert();sounds.syncMusic();if(!game.s.introSeen)playIntro();else{render();if(game.s.stage===24&&!game.s.finishedSeen)openModal({type:'ending'});if(saveWarning)toast(saveWarning,5000);}break;
  case 'home':case 'merge':case 'book':case 'shop':closeModal();navigate(a);break;
  case 'compactOrder':openModal({type:'orders'});break;
  
  case 'openTea':openModal({type:'teaPlans'});break;
  
  case 'teaPlan':run(game.chooseTeaPlan(d.plan),{quiet:true});break;
  case 'firstVisit':run(game.beginFirstVisit());break;
  case 'teaReplay':openTeaReplay(game.s.tea.lastResult);break;
  case 'souvenirReplay':{const entry=souvenirEntries().find(v=>v.key===d.key&&(!d.plan||v.plan===d.plan));if(entry?.snapshot)openTeaReplay(entry.snapshot);break;}
  case 'equipSouvenir':run(game.equipSouvenir(d.region,d.key),{quiet:true});break;
  case 'sceneAdvance':ui.scenePlayer?.advance();break;
  case 'sceneChoice':if(ui.sceneAwaitChoice){rememberSceneChoice(d.choice);ui.scenePlayer?.start();syncEventControls();}break;
  case 'sceneSkip':rememberSceneChoice('anchor');ui.scenePlayer?.skip();syncEventControls();break;
  case 'sceneReplay':rememberSceneChoice('anchor');if(ui.modal)delete ui.modal.reply;ui.scenePlayer?.replay();syncEventControls();break;
  case 'itemActions':openModal({type:'itemActions',index:ui.selected});break;
  case 'parcelTarget':ui.parcelTarget=JSON.parse(d.target);ui.parcelSource=null;renderModal();break;
  case 'parcelSource':ui.parcelSource=d.cat;renderModal();break;
  case 'confirmParcel':{const quote=ui.modal?.quote;if(!quote)break;const r=run(game.buy('parcel',quote));if(r.ok)closeModal();break;}
  
  case 'bookMode':ui.bookMode=d.mode;render();main.scrollTop=0;break;
  case 'item':openModal({type:'item',c:d.cat,l:+d.level});break;
  case 'chain':openModal({type:'chain',c:d.cat,l:1});break;
  case 'source':closeModal();navigate('merge');ui.selected=CATS.indexOf(d.cat);highlight([ui.selected]);if(!game.unlocked(d.cat))toast(`修好前 ${CHAINS[d.cat].unlock} 处后，${CHAINS[d.cat].producer}会自动解锁。`);else if(!game.s.producerLessons[d.cat])toast(`点发亮、带闪电的${CHAINS[d.cat].producer}，亲手取出一件材料。`,3500);break;
  case 'hint':showHint();break;
  case 'submit':{const r=run(game.submit(d.kind,d.kind==='main'?+d.id:d.id,d.kind==='main'?+d.step:undefined));if(r.ok&&r.orderKind==='side'&&ui.modal?.type==='orderDetails')closeModal();break;}
  case 'afterSubmit':closeModal();navigate('home');break;
  case 'goBuild':case 'build':openBuildPlacement();break;
  case 'worldMap':ui.homeMode='map';render();main.scrollTop=0;break;
  case 'visitRegion':{cancelFurnitureDrag();ui.decorSelected=null;const r=game.visitRegion(d.region);if(r.ok){persist();ui.homeMode='region';ui.tab='home';render();main.scrollTop=0;sounds.play('tap');}else run(r);break;}
  case 'homeActivity':run(game.homeActivity(d.region));break;
  case 'worldMemory':{const m=game.worldProgress().memories.find(v=>v.region===d.region);if(m?.unlocked)openModal({type:'activityResult',replay:true,result:{region:d.region,memoryName:m.name}});break;}
  case 'decorStorage':openModal({type:'decorStorage'});break;
  case 'storeDecor':{cancelFurnitureDrag();const r=game.storeDecor(+d.id);if(r.ok){ui.decorSelected=null;persist();render();toast('家具已收好，可在“家具收纳”恢复。');}else toast(r.message);break;}
  case 'restoreDecor':{const r=game.restoreDecor(+d.id);if(r.ok){game.visitRegion(r.region);ui.tab='home';ui.homeMode='region';ui.decorSelected=null;persist();closeModal();render();main.scrollTop=0;toast('家具已恢复原来的位置和配色。');}else toast(r.message);break;}
  case 'furniture':if(+d.id<game.s.stage){ui.decorSelected=+d.id;render();$('.furniture-move-handle button')?.focus({preventScroll:true});}break;
  case 'furnitureDetails':if(+d.id<game.s.stage)openModal({type:'furniture',id:+d.id});break;
  case 'editFurniture':{const id=+d.id;if(id>=game.s.stage)break;closeModal();game.visitRegion(DECOR[id].region);ui.homeMode='region';ui.tab='home';ui.decorSelected=id;persist();render();main.scrollTop=0;$('.furniture-move-handle button')?.focus({preventScroll:true});break;}
  case 'decorMoveHandle':toast('按住“移动”拖动；也可用方向键微调，回车完成。');break;
  case 'resetDecorPosition':{const r=run(game.resetDecorPosition(+d.id),{quiet:true});if(r.ok&&!storageFailed)toast('已恢复原来的摆放位置。');break;}
  case 'finishPlacement':ui.decorSelected=null;render();break;
  case 'chooseStyle':ui.styleChoice=+d.style;renderModal();break;
  case 'confirmBuild':{const r=game.build(ui.styleChoice);if(r.ok){closeModal();persist();afterBuild(r);}else run(r);break;}
  case 'decorate':openModal({type:'decorate'});break;
  case 'redecorate':run(game.redecorate(+d.id,game.s.decorStyles[+d.id]===0?1:0),{quiet:true});toast('这个角落换好了新配色。');break;
  case 'storage':ui.storageTab=game.s.pending.length?'pending':'storage';openModal({type:'storage'});break;
  case 'storageTab':ui.storageTab=d.source;renderModal();break;
  case 'retrieve':run(game.retrieve(+d.index,d.source));break;
  case 'store':run(game.store(ui.selected));break;
  case 'split':{const index=d.index!==undefined?+d.index:ui.modal?.index??ui.selected,r=game.split(index);if(r.ok)closeModal();run(r);break;}
  case 'sell':{if(ui.modal?.type==='itemActions')closeModal();const t=game.s.board[ui.selected];if(t?.k==='item'&&!t.dust&&(game.mainOrder()?.needs.some(r=>r.c===t.c&&r.l===t.l)||game.s.sideOrders.some(o=>o.needs.some(r=>r.c===t.c&&r.l===t.l))))openModal({type:'confirmSell',index:ui.selected});else run(game.sell(ui.selected));break;}
  case 'confirmSell':closeModal();run(game.sell(+d.index));break;
  case 'sort':run(game.sort());break;
  case 'expand':run(game.expand());break;
  case 'upgrade':run(game.upgrade(d.cat));break;
  case 'buy':if(d.key==='parcel'){ui.parcelTarget=null;ui.parcelSource=null;openModal({type:'parcel'});}else run(game.buy(d.key));break;
  case 'energy':openModal({type:'energy'});break;
  case 'daily':openModal({type:'daily'});break;
  case 'dailyGift':run(game.dailyGift());break;
  case 'claimDaily':run(game.claimDaily(d.key));break;
  case 'refreshSide':{const r=run(game.refreshSide(+d.slot));if(r.ok&&ui.modal?.type==='orderDetails'&&ui.modal.kind==='side'){ui.modal.id=game.s.sideOrders[+d.slot].id;renderModal();}break;}
  case 'growth':openModal({type:'growth'});break;
  case 'claimLevelGift':run(game.claimLevelGift(+d.level));break;
  case 'orderDetails':openModal({type:'orderDetails',kind:d.kind,id:d.id});break;
  case 'campaignNext':{closeModal();const task=game.mainOrder();if(task)openModal({type:'orderDetails',kind:'main',id:task.id});else navigate('merge');break;}
  case 'settings':openModal({type:'settings'});break;
  case 'setting':run(game.setting(d.key,!game.s.settings[d.key]),{quiet:true});sounds.syncMusic();break;
  case 'help':openModal({type:'help'});break;
  case 'closeModal':closeModal();break;
  case 'memory':if(game.s.stage>=(+d.chapter+1)*4)openModal({type:'memory',chapter:+d.chapter});break;
  case 'campaignMemory':if(+d.chapter>=0&&+d.chapter<CAMPAIGN_CHAPTERS.length&&game.s.campaign.completed>=(+d.chapter+1)*8)openModal({type:'campaignMemory',chapter:+d.chapter});break;
  case 'memoryDone':{const finish=ui.modal?.reward&&ui.modal?.chapter===5;closeModal();if(finish)openModal({type:'ending'});break;}
  case 'ending':openModal({type:'ending'});break;
  case 'endingDone':game.markFinished();persist();closeModal();navigate('home');break;
  case 'replayIntro':hasStarted=true;sounds.syncMusic();playIntro();break;
  case 'replayTask':replayTask(+d.id);break;
  case 'replayCampaign':replayCampaignTask(+d.id);break;
  case 'nextStory':nextStory();break;
  case 'skipStory':finishStory();break;
  case 'chat':chat(d.who);break;
  case 'dayNight':ui.environmentPhase=homeEnvironment().night?'day':'night';render();break;
  case 'cycleTime':ui.environmentPhase=PHASES[(PHASES.indexOf(homeEnvironment().phase)+1)%PHASES.length];render();break;
  case 'cycleWeather':ui.environmentWeather=WEATHERS[(WEATHERS.indexOf(homeEnvironment().weather)+1)%WEATHERS.length];render();break;
  case 'environmentAuto':ui.environmentPhase=null;ui.environmentWeather=null;render();break;
  case 'photo':await capturePhoto();break;
  case 'export':try{downloadBlob(new Blob([game.export()],{type:'application/json'}),`熊熊之家_存档_${new Date().toISOString().slice(0,10)}.json`);toast('已请求下载存档。请确认下载列表中的 JSON 文件并收好。');}catch(err){toast('存档下载未成功，请检查浏览器下载权限：'+err.message,5000);}break;
  case 'import':$('#import-file').click();break;
  case 'importConfirm':{const state=ui.modal.state;cancelActorDrag(false);residentLife?.cancelAll();game=new GameEngine(state);getResidentLife();closeModal();ui.selected=null;ui.highlight=[];ui.tab=game.s.stage===0?'merge':'home';ui.night=game.s.stage>=16&&game.s.stage<20;persist();render();sounds.syncMusic();toast('存档已搬进熊熊之家，继续一起生活吧。');break;}
  case 'resetAsk':openModal({type:'reset'});break;
  case 'resetConfirm':{
   const next=new GameEngine(),raw=JSON.stringify(next.s);try{localStorage.setItem(STORE,raw);}catch{toast('重新开始未能保存，原进度已保留。请先导出存档并检查本地保存权限。',5000);break;}
   let backupWarning=false;try{localStorage.setItem(INITIALIZED,'1');localStorage.removeItem(BACKUP);}catch{backupWarning=true;}
   lastValid=raw;storageFailed=false;cancelActorDrag(false);residentLife?.cancelAll();game=next;getResidentLife();ui.tab='merge';ui.homeMode='map';ui.selected=null;ui.highlight=[];ui.night=false;closeModal();render();playIntro();if(backupWarning)toast('新小屋已保存，但浏览器未能清理旧版备份。',5000);break;
  }
 }
});
modalRoot.addEventListener('click',e=>{if(e.target.classList.contains('modal-backdrop'))closeModal();});
$('#import-file').addEventListener('change',async(e)=>{
 const file=e.target.files?.[0];e.target.value='';if(!file)return;
 if(file.size>1500000){toast('存档文件过大，未替换任何进度。');return;}
 try{const raw=JSON.parse(await file.text());const s=validateState(raw);openModal({type:'importConfirm',state:s});}
 catch(err){toast(`没有载入这份存档：${err.message}`,5000);}
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){cancelActorDrag();cancelFurnitureDrag();if(ui.decorSelected!==null){ui.decorSelected=null;render();}if(ui.story)finishStory();else closeModal();cancelDrag();return;}
 if(ui.story&&[' ','Enter','ArrowRight'].includes(e.key)){e.preventDefault();nextStory();return;}
 if(ui.modal&&e.key==='Tab'){
  const focusable=$$('.modal button:not(:disabled),.modal input');if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(!$('.modal')?.contains(document.activeElement)){e.preventDefault();first.focus();}else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
 const furnitureHandle=document.activeElement?.closest('[data-action="decorMoveHandle"]');
 if(furnitureHandle&&!ui.modal&&!ui.story){
  if(e.key==='Enter'){e.preventDefault();ui.decorSelected=null;render();return;}
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
   e.preventDefault();const id=+furnitureHandle.dataset.id,p=decorPlacement(id,game.s.decorPositions[id]),step=e.shiftKey?5:2;
   const dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0,dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;
   run(game.moveDecor(id,p.x+dx,p.y+dy),{quiet:true});$('.furniture-move-handle button')?.focus({preventScroll:true});return;
  }
 }
 const current=document.activeElement?.closest('[data-cell]');
 if(current&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
  e.preventDefault();let i=+current.dataset.cell,delta={ArrowUp:-7,ArrowDown:7,ArrowLeft:-1,ArrowRight:1}[e.key];const j=i+delta;if(j>=0&&j<49)$(`[data-cell="${j}"]`)?.focus();
 }
});
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function capturePhoto(){
 if(ui.photoBusy)return;ui.photoBusy=true;
 // Freeze before the first image decode; later navigation cannot change this photo.
 const live=ui.sceneSnapshot||(ui.tab==='home'&&ui.homeMode==='region'&&liveHomeScene?.region===game.s.world.region?liveHomeScene:livingScene(game.s.world.region));
 const scene=clone(live),region=REGIONS.find(r=>r.id===scene.region)||REGIONS[0];
 try{
  const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1300;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fff8ef';ctx.fillRect(0,0,1000,1300);ctx.fillStyle='#74513f';ctx.font='bold 37px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.fillText(TITLE+' · '+region.name,500,64);ctx.fillStyle='#947863';ctx.font='18px sans-serif';ctx.fillText('每一处小愿望，都是一起过的好日子',500,103);
  ctx.save();ctx.translate(45,137);ctx.scale(.91,.91);await drawSceneCanvas(ctx,scene,{loadImage:loadImage,width:1000,height:1120});ctx.restore();
  ctx.fillStyle='#947863';ctx.font='20px sans-serif';ctx.fillText('把今天的布置、纪念物和陪伴一起收好',500,1217);ctx.font='15px sans-serif';ctx.fillText(new Date().toLocaleDateString('zh-CN'),500,1259);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('无法生成图片')),'image/png'));downloadBlob(blob,`熊熊之家_${region.name}_合照.png`);toast('合照已请求下载，请在下载列表中查看 PNG。');
 }catch(err){toast('照片未能导出：'+err.message+'。请检查图片与下载权限。',5000);}finally{ui.photoBusy=false;}
}
async function loadImage(id){
 const key=spriteSpec(id)?.asset||id;if(imageCache.has(key))return imageCache.get(key);const im=new Image();im.src=asset(key);await im.decode();imageCache.set(key,im);return im;
}

// Only visible home actors move; board and furniture DOM stay untouched.
setInterval(()=>{tickResidents();refreshLivingScene();},200);
// Resource ticks do not recreate the board during a drag.
setInterval(()=>{
 if(document.hidden)return;const day=game.s.daily.day;game.tick();
 const e=$('#energy-count');if(e)e.textContent=game.s.energy;
 $$('[data-stock]').forEach(el=>{const p=game.s.producers[el.dataset.stock];el.textContent=`${p.stock}/${stockCap(p)}`;});
 if(day!==game.s.daily.day&&!drag&&!furnitureDrag&&!actorDrag){render();persist();}
},1000);
setInterval(persist,15000);
document.addEventListener('visibilitychange',()=>{cancelActorDrag();tickResidents();cancelDrag();cancelFurnitureDrag();if(document.hidden){ui.scenePlayer?.pause();game.tick();persist();}else{game.tick();render();ui.scenePlayer?.resume();}sounds.syncMusic();});
window.addEventListener('pagehide',()=>{cancelActorDrag(false);game.tick();persist();});
window.addEventListener('beforeunload',()=>{cancelActorDrag(false);persist();});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{cancelDrag();render();},120);});

async function boot(){
 app.style.setProperty('--grain',`url("${asset('paper-texture')}")`);render();
 const ids=[...ACTOR_ACTION_ASSET_IDS.filter(id=>id.includes('-drag-')||id.endsWith('-search')),'region-house','bubu-idle','bubu-sit','bubu-turn','bubu-face','bubu-happy','yier-turn','yier-face','yier-happy','bubu-surprise','yier-surprise','util-energy','util-coin','util-star','util-crate','atlas-clean','atlas-generators'];
 // Resume page needs its region/decor now; later chapters never block the launch button.
 if(game.s.stage){ids.push('world-map',...REGIONS.filter(r=>r.id===game.s.world.region).map(r=>r.background),...DECOR.filter(d=>d.id<game.s.stage&&d.region===game.s.world.region).map(d=>d.image||`decor-${String(d.id+1).padStart(2,'0')}`));}
 ids.push(...game.s.board.filter(t=>t?.k==='item').map(t=>itemKey(t.c,t.l)));
 const keys=[...new Set(ids.map(id=>spriteSpec(id)?.asset||id))];let loaded=0,failed=[];
 await Promise.all(keys.map(async id=>{try{await loadImage(id);}catch{failed.push(id);}loaded++;const bar=$('#load-bar');if(bar)bar.style.width=`${loaded/keys.length*100}%`;}));
 if(failed.length){$('#loading-text').textContent=`有 ${failed.length} 件当前页面素材未能打开，请确认 assets 与入口在一起。`;const retry=document.createElement('button');retry.className='button';retry.textContent='重新打开素材';retry.onclick=()=>location.reload();$('#loading').append(retry);return;}
 $('#loading').remove();renderSplash();syncInert();
 for(const id of ACTOR_ACTION_ASSET_IDS)loadImage(id).catch(()=>{});
 if(new URLSearchParams(location.search).has('qa'))window.__COZY_QA__={get game(){return game;},render,navigate,openModal,closeModal,ui,validateState,capturePhoto,livingScene,refreshLivingScene,tickResidents,get residentLife(){return getResidentLife();},get actorDrag(){return actorDrag?{who:actorDrag.who,armed:actorDrag.armed}:null;},cancelActorDrag,playEvent,describeScene,drawSceneCanvas,renderSceneHTML,createScenePlayer};
 if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)&&!window.__OFFLINE_SINGLE__)navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
}
boot().catch(err=>{const loading=$('#loading-text');if(loading)loading.textContent=TITLE+'启动遇到问题：'+err.message;console.error(err);});
