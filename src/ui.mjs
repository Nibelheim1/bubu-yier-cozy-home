import {VERSION,TITLE,CATS,CHAINS,CFG,CHAPTERS,INTRO,TASKS,DECOR,REGIONS,DAILY,HOME_CHAT,TEA_PLANS,SOUVENIRS,itemName,itemKey,mass} from './data.mjs';
import {GameEngine,validateState,freshState,levelOf,stockCap,clone} from './engine.mjs';
import {spriteSpec,drawSprite,describeScene,renderSceneHTML,drawSceneCanvas,createScenePlayer,SCENE_STYLES,renderWorldOverlays} from './visuals.mjs';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const esc=(v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=(id)=>window.__ASSETS__?.[id]||`assets/${id}.${id==='cozy-loop'?'wav':'png'}`;
const picture=(id,cls='',alt='')=>{
 const p=spriteSpec(id);
 if(!p)return `<img src="${asset(id)}" class="${cls}" alt="${esc(alt)}" draggable="false">`;
 const inset=p.inset||0,size=(1-2*inset)*100,dims=window.__ASSET_SIZES__?.[p.asset],ratio=dims?(dims[0]/p.cols)/(dims[1]/p.rows):(p.slotAspect||1);
 return `<span class="sprite-shell ${cls}" role="img" aria-label="${esc(alt)}"><svg class="sprite-frame" viewBox="0 0 ${100*ratio} 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><svg width="${100*ratio}" height="100" viewBox="${inset*100*ratio} ${inset*100} ${size*ratio} ${size}" overflow="hidden"><image href="${asset(p.asset)}" x="${-p.col*100*ratio}" y="${-p.row*100}" width="${p.cols*100*ratio}" height="${p.rows*100}" preserveAspectRatio="none"/></svg></svg></span>`;
};
// Presentation-only positions: keep the middle clear and arrange furniture along the edges.
// Cups on the table and cushions on the rug are the only deliberate layered groups.
const DECOR_LAYOUT={
 0:{x:53,y:34,w:20},1:{x:49,y:18,w:35},
 4:{x:84,y:46,w:23},5:{x:84,y:72,w:24},6:{x:84,y:66,w:13},
 7:{x:23,y:67,w:18},9:{x:22,y:67,w:27},
 11:{x:82,y:22,w:22},13:{x:24,y:36,w:29},14:{x:83,y:43,w:26},15:{x:74,y:19,w:16},
 16:{x:82,y:91,w:19},17:{x:25,y:86,w:22},18:{x:62,y:86,w:13},19:{x:48,y:94,w:15},
 20:{x:50,y:22,w:54},21:{x:22,y:86,w:30},22:{x:79,y:86,w:30},23:{x:20,y:84,w:25},
};
const decorPlacement=d=>({...d,...DECOR_LAYOUT[d.id]});
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
 undo:'M4 4v7h7M4 11q3-9 12-6c7 3 6 15-3 15',
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
const ui={tab:game.s.stage===0?'merge':'home',homeMode:'map',mapScroll:0,orderMode:'main',bookMode:'memories',selected:null,highlight:[],modal:null,story:null,splash:true,styleChoice:0,storageTab:'storage',night:game.s.stage>=16&&game.s.stage<20,newDecor:null,scenePlayer:null,sceneSnapshot:null,parcelTarget:null,parcelSource:null,photoBusy:false};
const app=$('#app'),main=$('#main'),modalRoot=$('#modal-root'),overlayRoot=$('#overlay-root');
let toastTimer=0,highlightTimer=0,chatTimer=0,drag=null,ignoreClickUntil=0,hasStarted=false;
let imageCache=new Map(),modalReturnFocus=null;
const sceneStyle=document.createElement('style');sceneStyle.textContent=SCENE_STYLES;document.head.append(sceneStyle);
function persist(){
 try{const raw=JSON.stringify(game.s);if(raw===lastValid)return true;if(lastValid)localStorage.setItem(BACKUP,lastValid);localStorage.setItem(STORE,raw);lastValid=raw;storageFailed=false;try{localStorage.setItem(INITIALIZED,'1');}catch{}return true;}
 catch{if(!storageFailed){storageFailed=true;saveWarning='本地保存失败。请在设置里导出存档，避免关闭后丢失。';toast(saveWarning,5000);}return false;}
}

class Sounds{
 constructor(){this.ctx=null;this.music=null;}
 unlock(){try{if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}catch{}this.syncMusic();}
 syncMusic(){if(!hasStarted)return;if(game.s.settings.music&&!document.hidden){if(!this.music){this.music=new Audio(asset('cozy-loop'));this.music.loop=true;this.music.volume=.36;}this.music.play().catch(()=>{});}else this.music?.pause();}
 play(kind){
  if(!game.s.settings.sound||document.hidden||!this.ctx)return;
  const patterns={tap:[560],produce:[520,690],merge:[523.25,659.25,783.99],success:[523.25,659.25,783.99,1046.5],place:[659.25,783.99,1046.5],error:[260],undo:[420,320],talk:[420,480],yier:[580,670]};
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
 else if(r.kind==='prepare'){sounds.play('place');playEvent('prep',{result:r});}
 else if(r.kind==='firstVisit'){sounds.play('talk');playEvent('firstVisit',{teaResult:r.result});}
 else if(r.kind==='submit'){sounds.play('success');if(r.orderKind==='tea'){playEvent('tea',{teaResult:r.result||r.teaResult||game.s.tea.lastResult,reward:r});}else if(r.orderKind==='main'){if(r.totalPhases>1)playEvent('prep',{result:r,after:()=>openModal({type:'submitted',result:r})});else openModal({type:'submitted',result:r});}else{toast(`委托送达 · 金币 +${r.coins} · 体力 +${r.energy}`);burst(null);}}
 else if(r.kind==='sell'){sounds.play('tap');toast(`已换成 ${r.coins} 金币 · 下一步操作前可撤销`);}
 else if(r.kind==='store'){sounds.play('tap');toast('收好了，仓库物品也能直接用于交付。');}
 else if(r.kind==='retrieve'){sounds.play('produce');pop(r.idx);if(r.discovery)discoveryToast(r.c,r.l);}
 else if(r.kind==='split'){sounds.play('merge');pop(r.idx);toast('拆成两个低一级物品 · 剪刀 −1');}
 else if(r.kind==='undo'){sounds.play('undo');toast('已经撤回上一步。');}
 else if(r.kind==='rest'){sounds.play('success');toast('坐一会儿，心也轻一点 · 体力 +30');}
 else if(r.kind==='energy'){sounds.play('success');toast('点心吃好啦 · 体力 +30');}
 else if(r.kind==='upgrade'){sounds.play('success');toast(`${CHAINS[r.c].producer}升级了，存货已补满。`);}
 else if(r.kind==='expand'){sounds.play('success');toast('又能多收好四件小东西啦。');}
 else if(r.kind==='buy'){sounds.play('tap');toast(r.key==='parcel'?'四件补给已放进“待领礼物”，满盘也不会丢失。':'已经放进随身道具。');}
 else if(['dailyGift','dailyReward'].includes(r.kind)){sounds.play('success');toast('今天的小奖励，收好啦！');burst(null);}
 else if(r.kind==='homeActivity'){sounds.play('success');playHomeActivity(r);toast(`${r.message} · 金币 +${r.coins} · 体力 +${r.energy}`,4000);burst(null);if(r.milestone)toast('新的家园回忆已经收进手帐。',4500);}
 else if(r.kind==='refresh'){toast('换了一张新纸条。原来的物品都还在。');}
 else if(r.kind==='sort'){toast('按类别和等级整理好了，没有自动合成。');}
 else if(!quiet)sounds.play('tap');
 if(r.levelUps>0&&!['submit','build'].includes(r.kind))setTimeout(()=>toast(`成长到 Lv.${levelOf(game.s)} · 每级奖励 ${CFG.levelCoins} 金币和 ${CFG.levelEnergy} 体力`),1100);
 return r;
}
function render(){
 const scroll=main.scrollTop,viewport=$('.world-viewport');if(viewport)ui.mapScroll=viewport.scrollLeft;app.classList.toggle('reduced-motion',game.s.settings.reducedMotion);renderHeader();renderNav();
 main.innerHTML=ui.tab==='home'?renderHome():ui.tab==='book'?renderBook():ui.tab==='shop'?renderShop():renderMerge();
 main.scrollTop=scroll;
 const map=$('.world-viewport');if(map)map.scrollLeft=ui.mapScroll;
 if(ui.modal)renderModal();
 syncInert();
}
function navigate(tab){if(tab==='home'&&game.s.delivered)focusBuildRegion();ui.tab=tab;ui.selected=null;ui.highlight=[];render();main.scrollTop=0;}
function focusBuildRegion(){const region=DECOR[game.s.stage]?.region;if(region){game.visitRegion(region);persist();ui.homeMode='region';}}
function renderHeader(){
 const s=game.s,chapter=CHAPTERS[Math.min(5,Math.floor(s.stage/4))];
 $('#header').innerHTML=`<div class="brand-line"><span class="brand-mark">${icon('home')}</span><div><div class="brand">好日子小屋</div><div class="brand-sub">${s.stage===24?'每一天，继续可爱':'布布一二 · '+chapter.short}</div></div><div class="header-tools"><button class="icon-button" data-action="daily" aria-label="每日小目标" title="每日小目标" style="position:relative">${icon('calendar')}${!s.daily.gift||DAILY.some(d=>s.daily[d.key]>=d.target&&!s.daily.claimed.includes(d.key))?'<i class="badge-dot"></i>':''}</button>${ib('settings','settings','设置与存档')}</div></div>
 <div class="resources"><button class="level-badge" data-action="growth" aria-label="查看成长奖励"><small>Lv.</small><span id="level-count">${levelOf(s)}</span></button><button class="resource energy" data-action="energy" aria-label="补充体力">${picture('util-energy')}<span id="energy-count">${s.settings.calm?'∞':s.energy}</span>${s.settings.calm?'<small>轻松</small>':s.energy>100?'<small>储备</small>':'<small>/100</small>'}<span class="plus">+</span></button><button class="resource" data-action="shop" aria-label="金币与小铺">${picture('util-coin')}<span id="coin-count">${s.coins}</span><span class="plus">+</span></button><button class="resource star" data-action="home" aria-label="心愿星，用于布置小屋">${picture('util-star')}<span>${s.stars}</span></button></div>${storageFailed?'<div class="save-notice">本地保存受限 · 请导出存档</div>':''}`;
}
function renderNav(){
 $('#nav').innerHTML=[['home','home','家园'],['merge','merge','合成'],['book','book','手帐'],['shop','shop','小铺']].map(([tab,ic,label])=>`<button data-tab="${tab}" aria-current="${ui.tab===tab?'page':'false'}" class="${ui.tab===tab?'active':''}">${icon(ic)}<span>${label}</span>${tab==='home'&&game.s.delivered?'<i class="nav-star">!</i>':''}</button>`).join('');
}
function rewardLine(task,star=false){return `<div class="reward-line">${star?`<span>${picture('util-star')}1</span>`:''}<span>${picture('util-coin')}${task.coins}</span><span>${picture('util-energy')}${task.energy}</span></div>`;}
function requirement(r){const n=game.count(r.c,r.l);return `<button class="required-item ${n>=r.n?'ready':''}" data-action="item" data-cat="${r.c}" data-level="${r.l}" aria-label="需要${r.n}个${itemName(r.c,r.l)}，当前有${n}个">${picture(itemKey(r.c,r.l),'',itemName(r.c,r.l))}<span class="count">${Math.min(n,r.n)} / ${r.n}</span>${n>=r.n?icon('check'):''}</button>`;}
function currentOrder(){return ui.orderMode==='tea'?game.teaOrder():ui.orderMode==='side'?game.s.sideOrders[0]:game.mainOrder();}
function orderTabs(){
 return `<div class="order-tabs"><div class="segmented"><button data-action="orderMain" class="${ui.orderMode==='main'?'active':''}">小屋心愿</button><button data-action="orderSide" class="${ui.orderMode==='side'?'active':''}" ${game.s.stage===0?'disabled':''}>邻里委托</button><button data-action="orderTea" class="${ui.orderMode==='tea'?'active':''}">一起茶会</button></div></div>`;
}
function teaContent(){
 const t=game.teaOrder();if(!t.available)return `<article class="tea-intro"><h3>在花园认识小苗之后，一起喝茶吧。</h3><p>完成第13处布置，亲手试过每个已开启的工作台，就可以准备两熊茶会。每场都可自由换方案，错过一天不会失去进度。</p>${game.mainOrder()?.lesson?btn('认识新工作台','source','small',`data-cat="${game.mainOrder().lesson}"`):''}</article>`;
 return `<div class="tea-condition"><span class="tag">第 ${t.round+1} 场 · ${esc(t.conditionName)}</span><p>${t.condition==='sunny'?'今天放晴了，选一个喜欢的地方坐坐。':t.condition==='memory'?'想留下今天，一起做一张小小纪念吧。':'有点风，用夹子固定茶布，再把杯子放稳。'} ${t.participants.includes('xiaoli')?'小栗也来坐坐。':'这一场，先留给布布和一二。'}</p></div><div class="tea-plans">${Object.entries(TEA_PLANS).map(([key,p])=>`<button data-action="teaPlan" data-plan="${key}" class="${t.plan===key?'active':''}" aria-pressed="${t.plan===key}"><b>${p.name}</b><span>${p.wish}</span></button>`).join('')}</div>${orderCard(t,'tea')}<p class="note">交付前可免费换方案，物品保持原样。完成后出现动作与不同回应，纪念物永久收藏，不要求连续登录。</p>`;
}
function teaHomeCard(){
 const t=game.teaOrder(),first=game.s.tea.firstVisit;
 return `<article class="tea-home-card"><h3>${first==='available'?'邀请小栗来坐坐':t.available?'今天，想怎样喝茶？':'留出一个一起坐下的位置'}</h3><p>${first==='available'?'邀请中的日子到了，布布一二准备好迎接小栗。':t.available?'暖心茶点或花园小聚，准备材料，让两熊一起端茶、扶苗，留下今天的纪念。':'花园建好、认识新工作台后，两熊茶会会开放。'}</p><div class="actions">${first==='available'?btn('迎接小栗首访','firstVisit'):btn(t.available?'准备茶会':'看看茶会','openTea','alt')}${game.s.tea.lastResult?btn('重看最近一次','teaReplay','alt'):''}</div></article>`;
}
function souvenirEntries(){return game.worldProgress().souvenirs.map(v=>({...v,snapshot:v.record}));}
function renderSouvenirs(){
 const entries=souvenirEntries();return `<div class="section-title">茶会留下的小纪念 · ${entries.filter(v=>v.unlocked).length}/6 款</div><div class="souvenir-list">${entries.map(v=>`<article class="souvenir-card ${v.unlocked?'owned':''}"><span class="souvenir-sign">${v.type==='coaster'?'◉':v.type==='card'?'✉':'♧'}</span><div><b>${v.name}</b><small>${REGIONS.find(r=>r.id===v.region)?.name}固定纪念位 · ${v.unlocked?'永久收藏':'对应状况与方案完成后取得'}</small></div>${v.unlocked?`<div class="souvenir-actions">${btn(v.equipped?'已摆好':'摆到家园','equipSouvenir','small',`data-region="${v.region}" data-key="${v.key}" ${v.equipped?'disabled':''}`)}${btn('重温首次','souvenirReplay','small alt',`data-key="${v.key}" data-plan="${v.plan}"`)}</div>`:''}</article>`).join('')}</div>`;
}

function parcelTargets(){
 const main=game.mainOrder(),tea=game.teaOrder(),list=[];
 if(main&&!game.s.delivered)list.push({target:{kind:'main',id:main.id,step:main.phase},order:main,label:'小屋 · '+main.phaseLabel});
 game.s.sideOrders.forEach(o=>{if(game.s.stage>0)list.push({target:{kind:'side',id:o.id},order:o,label:'邻里 · '+o.name});});
 if(tea.available)list.push({target:{kind:'tea',id:tea.id},order:tea,label:'茶会 · '+tea.name});return list;
}
function parcelContent(m){
 const list=parcelTargets();if(!list.length)return '<p class="description">先铺好门垫，再查看补给。</p>';
 if(!ui.parcelTarget){const selected=list.find(v=>v.target.kind===ui.orderMode)||list[0];ui.parcelTarget=selected.target;}
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
 const blocked=!!(ui.modal||ui.story||ui.splash||$('#loading'));for(const id of ['header','main','nav'])$('#'+id).inert=blocked;
 modalRoot.inert=!!(ui.story||ui.splash);overlayRoot.inert=!!ui.modal;
}
function eventReply(r){
 if(Array.isArray(r.response))return r.response.map(v=>typeof v==='string'?v:(v.who==='bubu'?'布布':v.who==='xiaoli'?'小栗':'一二')+'：'+v.text).join(' ');
 if(typeof r.response==='string')return r.response;
 if(r.kind==='firstVisit')return '小栗：“邀请信我收到了，这杯茶好暖。” 一二：“下回也来坐坐。” 布布：“你的座位，留好啦。”';
 const warm=r.plan==='warm',line=r.condition==='memory'?(warm?'布布把甜点放稳，一二画下这一桌暖茶。':'一二在树荫下画小卡，布布把新叶也画了进去。'):r.condition==='wind'?(warm?'布布压稳茶布，一二把边角夹好，杯子不晃了。':'一二扶稳风里的茶布，布布固定好一角，花园小聚继续。'):(warm?'一二摆好的杯子，刚好接住布布端来的热茶。':'布布浇完小苗，一二拉着他坐到树荫下。');return line+(r.participants?.includes('xiaoli')?' 小栗：“这一次的准备，我也想记住。”':' 两只熊把今天的小纪念收进了家园。');
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
 const scene=describeScene(frozen,{region,stage:frozen.stage,night:false,teaResult,prepStep:game.s.mainPrepStep});
 const title=event==='firstVisit'?'小栗来坐坐':event==='tea'?'这场茶会，收好啦':event==='prep'?(result.phaseLabel||'这一份准备，摆好了'):'今天，一起做的小事';
 openModal({type:'event',title,scene,caption:'',reward});ui.sceneSnapshot=scene;
 const eventName=event==='prep'?`prep-${result.id}-${result.phase}`:event;
 ui.scenePlayer=createScenePlayer({event:eventName,scene,reducedMotion:game.s.settings.reducedMotion,onFrame:frame=>{
  ui.sceneSnapshot=clone(frame);const host=$('.event-scene .scene-layers');if(host)host.innerHTML=renderSceneHTML(frame,{assetURL:asset});
  const caption=$('.event-caption');if(caption)caption.textContent=frame.caption||frame.text||title;ui.modal&&(ui.modal.caption=frame.caption||frame.text||title);
 },onStep:({label,waiting})=>{const next=$('[data-action="sceneAdvance"]',modalRoot);if(next)next.disabled=!waiting;const caption=$('.event-caption');if(caption)caption.textContent=label;ui.modal&&(ui.modal.caption=label);},onComplete:finalScene=>{ui.sceneSnapshot=clone(finalScene);const host=$('.event-scene .scene-layers');if(host)host.innerHTML=renderSceneHTML(finalScene,{assetURL:asset});const skip=$('[data-action="sceneSkip"]',modalRoot);if(skip)skip.disabled=true;const next=$('[data-action="sceneAdvance"]',modalRoot);if(next)next.disabled=true;if(teaResult){if(game.s.tea.lastResult?.id===teaResult.id){game.s.tea.lastResult.seen=true;persist();}const caption=$('.event-caption');if(caption)caption.textContent=eventReply(teaResult);if(ui.modal)ui.modal.caption=eventReply(teaResult);}if(after){closeModal();after();}}});
 ui.sceneSnapshot=clone(ui.scenePlayer.initialScene);const initialHost=$('.event-scene .scene-layers');if(initialHost)initialHost.innerHTML=renderSceneHTML(ui.sceneSnapshot,{assetURL:asset});
 ui.sceneAwaitChoice=event==='tea'&&teaResult?.condition==='wind'&&!teaResult.displayChoice;if(teaResult?.displayChoice){ui.scenePlayer.setChoice(teaResult.displayChoice);$$('[data-action="sceneChoice"]',modalRoot).forEach(b=>{b.disabled=true;b.setAttribute('aria-pressed',String(b.dataset.choice===teaResult.displayChoice));});}if(!ui.sceneAwaitChoice)ui.scenePlayer.start();else{const caption=$('.event-caption');if(caption)caption.textContent='风吹起茶布了，先选一种固定方式。';}syncEventControls();
}
function orderCard(task,kind='main',slot=0){
 const delivered=kind==='main'&&game.s.delivered,lesson=kind==='main'&&task.lesson,ready=game.canFulfill(task.needs)&&!lesson,who=kind==='main'?task.who:(slot===0?'yier':'bubu');
 return `<article class="order-card ${kind==='side'?'side-order':''} ${ready||delivered?'fulfilled':''}"><div class="order-top"><div class="order-avatar">${picture((who||'yier')+'-face')}</div><div class="order-text"><h3>${esc(task.name)}</h3><p>${delivered?'材料都备齐啦，带心愿星回小屋。':esc(task.wish)}</p></div>${kind==='side'?`<button class="refresh-order" data-action="refreshSide" data-slot="${slot}" aria-label="免费更换这张邻里委托">${icon('refresh')}</button>`:''}</div>${task.totalPhases>1?`<p class="phase-line">准备 ${task.phase+1}/${task.totalPhases} · ${esc(task.phaseLabel)}<small>每一步都会摆到现场，整单完成后统一领取奖励。</small></p>`:''}${lesson?`<button class="lesson-line" data-action="source" data-cat="${lesson}">${picture('gen-'+lesson)}先亲手点一次${CHAINS[lesson].producer}${icon('arrow')}</button>`:''}<div class="order-bottom"><div class="requirements">${task.needs.map(requirement).join('')}</div><div class="order-action">${rewardLine(task,kind==='main')}${delivered?btn('回家布置','home','small'):btn(ready?(kind==='tea'?'开始茶会':task.totalPhases>1?'交付这一步':'交付心愿'):'还差一点','submit','small',`data-kind="${kind}" data-id="${task.id}" data-step="${task.phase||0}" ${ready?'':'disabled'}`)}</div></div></article>`;
}
function renderMerge(){
 const s=game.s,task=game.mainOrder(),compact=window.innerHeight<=710;
 const card=ui.orderMode==='tea'?teaContent():ui.orderMode==='main'?(task?orderCard(task):`<article class="order-card fulfilled"><div class="order-top"><div class="order-avatar">${picture('yier-happy')}</div><div class="order-text"><h3>小屋已经装满好日子</h3><p>摆一场茶会，换一种准备，让生活继续留下纪念。</p></div></div>${btn('准备下一场茶会','orderTea','small')}</article>`):s.sideOrders.map((o,i)=>orderCard(o,'side',i)).join('');
 return `<section class="merge-view ${compact?'compact-view':''}">${compact?compactOrderCard():`${orderTabs()}<div class="order-strip">${card}</div>`}<div class="board-header"><div class="board-title">合成工作台<span class="board-free">空位 ${game.free()}</span></div><div class="board-tools"><button data-action="storage">${icon('box')}仓库${s.pending.length?`<i class="parcel-count">${s.pending.length}</i>`:''}</button><button data-action="sort" aria-label="整理棋盘">${icon('sort')}</button><button data-action="hint">${icon('light')}提示</button></div></div>${tutorialLine()}<div class="board-frame"><div class="board" role="grid" aria-label="7乘7合成棋盘，点选后点目标或拖动合成">${Array.from({length:7},(_,row)=>`<div role="row" class="board-row">${s.board.slice(row*7,row*7+7).map((t,col)=>renderCell(t,row*7+col)).join('')}</div>`).join('')}</div></div>${detailBar()}</section>`;
}
function compactOrderCard(){
 const s=game.s,t=ui.orderMode==='main'?game.mainOrder():ui.orderMode==='tea'?game.teaOrder():s.sideOrders[0];
 if(!t||t.available===false)return `<div class="compact-orders"><button class="compact-name" data-action="compactOrder"><small>点击切换或查看全部</small><strong>好日子，继续中</strong></button>${btn('查看','compactOrder','small')}</div>`;
 const mainOrder=ui.orderMode==='main',delivered=mainOrder&&s.delivered,ready=game.canFulfill(t.needs)&&!t.lesson;
 return `<div class="compact-orders"><button class="compact-name" data-action="compactOrder"><small>${mainOrder?'小屋心愿':ui.orderMode==='tea'?'茶会':'邻里委托'} · 点开切换</small><strong>${esc(t.phaseLabel||t.name)}</strong></button><div class="requirements">${t.needs.map(requirement).join('')}</div>${delivered?btn('布置','home','small'):ready?btn('交付','submit','small',`data-kind="${ui.orderMode}" data-id="${t.id}" data-step="${t.phase||0}"`):btn('查看','compactOrder','small alt')}</div>`;
}
function renderCell(t,i){
 const s=game.s;let classes=['cell'],body='',label=`空格，第${i+1}格`;
 if(i===ui.selected)classes.push('selected');if(ui.highlight.includes(i))classes.push('hint');
 if(!t)classes.push('empty');
 else if(t.k==='gen'){
  const unlocked=game.unlocked(t.c),p=s.producers[t.c];classes.push('gen');if(!unlocked)classes.push('locked');
  body=picture('gen-'+t.c,'',CHAINS[t.c].producer)+(unlocked?`<span class="bolt">${icon('energy')}</span><span class="stock" data-stock="${t.c}">${s.settings.calm?'不限':`${p.stock}/${stockCap(p)}`}</span>`:`<span class="lock-sign">${icon('lock')}第${CHAINS[t.c].unlock+1}处</span>`);
  label=unlocked?`${CHAINS[t.c].producer}，点击消耗1体力产出物品，库存${p.stock}`:`${CHAINS[t.c].producer}，修好${CHAINS[t.c].unlock}处后自动解锁`;
 }else if(t.k==='crate'){
  classes.push('crate');body=picture('util-crate')+`<span class="lock-sign">${icon('lock')}修缮${t.openAt}</span>`;label=`纸箱，修好第${t.openAt}处后自动腾出空间`;
 }else{
  classes.push('item');const selected=s.board[ui.selected];if(t.dust)classes.push('dust');
  if(selected?.k==='item'&&ui.selected!==i&&!selected.dust&&selected.c===t.c&&selected.l===t.l&&t.l<6)classes.push('match');
  if(currentOrder()?.needs.some(r=>r.c===t.c&&r.l===t.l)&&!t.dust)classes.push('ready-item');
  body=picture(itemKey(t.c,t.l),'',itemName(t.c,t.l))+`<span class="level">${t.l}</span>`;label=`${itemName(t.c,t.l)}，${t.l}级${t.dust?'，尘封，需同级物品合入解锁':''}`;
 }
 return `<button class="${classes.join(' ')}" data-cell="${i}" role="gridcell" aria-label="${esc(label)}" aria-selected="${i===ui.selected}">${body}</button>`;
}
function tutorialLine(){
 const s=game.s;let line='同类同级合在一起，小小的物品也会慢慢长大。',who='bubu-idle';
 if(s.tutorial==='merge')line='先点发亮的小方巾，再点右边尘封的小方巾。也可以直接拖过去。';
 if(s.tutorial==='deliver')line='软海绵准备好了！点上面的“交付心愿”。';
 if(s.tutorial==='build')line='带上这颗心愿星，去“小屋”亲手铺好门垫吧。';
 if(s.tutorial==='produce')line='接下来，点左上角带闪电的清洁篮，取出新材料。';
 if(s.tutorial==='done'){
  const lesson=ui.orderMode==='main'&&game.mainOrder()?.lesson;if(lesson)return `<button class="tutorial-line lesson-line" data-action="source" data-cat="${lesson}">${picture('gen-'+lesson)}<span>先点一次${CHAINS[lesson].producer}，试试新来源。</span></button>`;
  const hint=game.hint(ui.orderMode);line=hint.kind==='build'?'材料备齐啦，一二在小屋等你一起布置。':hint.kind==='submit'?'这一份心愿已经合好了，交付后就可以回家。':game.free()<4?'桌子有点满啦。仓库、订单、出售都能帮你腾出空位。':`${CHAPTERS[Math.min(5,Math.floor(s.stage/4))].sub} 点物品图标可以查看完整合成路线。`;
 }
 return `<div class="tutorial-line">${picture(who)}<span>${line}</span></div>`;
}
function detailBar(){
 const t=game.s.board[ui.selected];
 if(!t)return `<div class="detail-bar"><div class="detail-hint">${icon('heart')}<div>合成一点小心愿<small>拖动合成，也支持“点选 → 点目标”</small></div></div>${ib('undo','undo','撤销上一步','',true)}${ib('info','help','玩法说明','',true)}</div>`;
 if(t.k==='gen'){
  const p=game.s.producers[t.c],unlocked=game.unlocked(t.c);
  return `<div class="detail-bar">${picture('gen-'+t.c,'detail-art')}<div class="detail-content"><h4>${CHAINS[t.c].producer} · Lv.${p.level}</h4><p>${unlocked?`每次 1 体力 · 二阶产出率 ${Math.round((.2+(p.level-1)*.12)*100)}%`:`完成第 ${CHAINS[t.c].unlock} 处修缮后自动解锁`}</p><p>${unlocked?'库存每 6 秒恢复 1 件 · 可升级':''}</p></div>${ib('info','chain','查看产出路线',`data-cat="${t.c}"`,true)}${unlocked&&p.level<3?btn(`升级 ${CFG.upgradeCosts[p.level-1]}`,'upgrade','small',`data-cat="${t.c}"`):''}</div>`;
 }
 if(t.k==='crate')return `<div class="detail-bar">${picture('util-crate','detail-art')}<div class="detail-content"><h4>还没整理的纸箱</h4><p>完成第 ${t.openAt} 处小屋布置后，自动腾出空间。</p><p>不需要金币，不会丢失已收好的物品。</p></div>${ib('home','home','回小屋')}</div>`;
 return `<div class="detail-bar">${picture(itemKey(t.c,t.l),'detail-art')}<div class="detail-content"><h4>${itemName(t.c,t.l)} · ${t.l} 级</h4><p>${t.dust?'用同类同级物品合入，解开尘封。':t.l===6?'最高级 · 可以交付或收藏':`下一阶：${itemName(t.c,t.l+1)}`}</p></div><div class="detail-actions">${ib('info','item','查看物品路线',`data-cat="${t.c}" data-level="${t.l}"`)}${!t.dust?`${ib('box','store','收进仓库')}${ib('info','itemActions','出售或拆分此物品')}`:''}${ib('undo','undo','撤销上一步')}</div></div>`;
}
function homeScene(progress=game.s.stage,{interactive=false,characters=true,mini=false,night=false,poses=null,region=game.s.world?.region||'house',teaResult=null,scene=null}={}){
 const info=REGIONS.find(r=>r.id===region)||REGIONS[0];
 const frozen=scene||describeScene(game.s,{stage:progress,region:info.id,night,poses,characters,teaResult});
 const target=decorPlacement(DECOR[Math.min(progress,23)]),canBuild=progress<24&&target.region===info.id;
 return `<div class="home-scene region-${info.id} ${night?'night':''}" data-region-scene="${info.id}"><div class="scene-layers">${renderSceneHTML(frozen,{assetURL:asset,interactive})}</div>${interactive?`<div class="room-number">${info.name} · ${DECOR.filter(d=>d.id<progress&&d.region===info.id).length} 处心愿</div>${progress>=16?`<div class="room-day"><button data-action="dayNight" aria-label="切换白天夜晚">${icon(night?'sun':'moon')}</button></div>`:''}${canBuild?`<button class="build-pin ${game.s.delivered?'ready':''}" data-action="build" style="left:${Math.max(18,Math.min(82,target.x))}%;top:${Math.max(25,Math.min(83,target.y))}%">${icon('plus')}${game.s.delivered?'可以布置啦':'下一个小愿望'}</button>`:''}`:''}</div>`;
}
function worldMap(){
 const progress=game.worldProgress(),coords={house:[25,41],garden:[54,61],courtyard:[82,44]};
 return `<div class="world-map-shell"><div class="map-hint">${icon('home')}拖动看看整个家园 · 点地标走近</div><div class="world-viewport" aria-label="可拖动的家园全景"><div class="world-canvas">${picture('world-map','world-bg')}${renderWorldOverlays(game.s,{assetURL:asset})}${progress.regions.map(r=>{const [x,y]=coords[r.id];return `<button class="region-marker ${DECOR[game.s.stage]?.region===r.id?'next-region':''}" data-action="visitRegion" data-region="${r.id}" style="left:${x}%;top:${y}%"><span>${r.id==='house'?'⌂':r.id==='garden'?'✿':'☀'}</span><b>${r.name}</b><small>${r.built}/${r.total} 处布置${r.activityDone?' · 已陪伴':''}</small>${game.s.delivered&&DECOR[game.s.stage]?.region===r.id?'<i>心愿星到了</i>':''}</button>`;}).join('')}</div></div><div class="region-shortcuts">${REGIONS.map(r=>`<button data-action="visitRegion" data-region="${r.id}">${r.name}${icon('arrow')}</button>`).join('')}</div></div>`;
}
function renderWorldMemories(){
 const p=game.worldProgress();
 return `<div class="section-title">家园日常 · ${p.memoryCount}/3 张回忆</div><div class="world-memory-cards">${p.memories.map(m=>`<button data-action="${m.unlocked?'worldMemory':'visitRegion'}" data-region="${m.region}" class="${m.unlocked?'collected':''}">${icon(m.unlocked?'heart':'sun')}<b>${m.name}</b><small>${m.unlocked?'已收进手帐 · 点击重温':`累计陪伴 ${m.progress}/${m.target} 天${m.conditionMet?'':` · 还需${m.conditionLabel}`} · 去看看`}</small></button>`).join('')}</div>`;
}
function renderHome(){
 const s=game.s,ch=Math.min(5,Math.floor(s.stage/4)),chapter=CHAPTERS[ch],t=TASKS[s.stage];
 const region=REGIONS.find(r=>r.id===s.world.region)||REGIONS[0],p=game.worldProgress(),r=p.regions.find(r=>r.id===region.id),nextRegion=REGIONS.find(r=>r.id===DECOR[s.stage]?.region);
 return `<section class="home-view"><div class="page-heading"><div><span class="eyebrow">OUR HAPPY PLACE · CHAPTER ${String(ch+1).padStart(2,'0')}</span><h2>${ui.homeMode==='map'?'小屋外，还有好日子':region.name}</h2><p>${ui.homeMode==='map'?'小屋 · 花园 · 庭院，把生活慢慢铺开':region.subtitle}</p><div class="chapter-progress">${Array.from({length:6},(_,i)=>`<i class="${s.stage>=i*4+4?'done':''}"></i>`).join('')}</div></div>${ib('book','book','翻开回忆手帐')}</div><div class="home-toolbar">${ui.homeMode==='region'?btn(icon('back')+'家园全景','worldMap','small alt'):''}${btn(icon('merge')+'回合成台','merge','small')}</div>${ui.homeMode==='map'?worldMap():`<div class="region-tabs">${REGIONS.map(v=>`<button class="${v.id===region.id?'active':''}" data-action="visitRegion" data-region="${v.id}">${v.name}</button>`).join('')}</div><div class="home-scene-shell">${homeScene(s.stage,{interactive:true,night:ui.night})}</div><div class="home-actions"><button data-action="photo">${icon('camera')}拍张合照</button><button data-action="decorate">${icon('palette')}换个配色</button><button data-action="rest">${icon('heart')}免费茶歇</button></div><article class="region-activity"><span class="activity-flower">${region.id==='garden'?'✿':region.id==='courtyard'?'☀':'♡'}</span><div><h3>${r.activityLabel||region.activityLabel}</h3><p>${s.stage===0?'先铺好第一块门垫，再一起做今天的小事。':r.activityDone?'今天的小事已经一起做过，明天再来。':r.activityText||region.activityText}</p></div>${btn(r.activityDone?'明天再来':'一起做','homeActivity','small',`data-region="${region.id}" ${r.activityDone||s.stage===0?'disabled':''}`)}</article>`}${teaHomeCard()}<div class="world-memory-track">${icon('book')}家园回忆 ${p.memoryCount} / 3 张<span>各区域每天一次陪伴，收集新的日常</span></div>${t?`<article class="home-quest">${picture(t.decor,'home-quest-thumb')}<span class="eyebrow">下一处心愿 · ${nextRegion?.name||'小屋'} · ${s.stage+1}/24</span><h3>${t.name}</h3><p>${s.delivered?'心愿星已经备好。走到对应区域，亲手布置新角落。':t.wish}</p><div class="home-quest-row"><span class="tag ${s.delivered?'':'coral'}">${icon(s.delivered?'star':'merge')}${s.delivered?'心愿星 ×1 已就绪':'先准备合成物品'}</span>${btn(s.delivered?'前往布置':'去合成','build',s.delivered?'':'alt')}</div></article>`:`<article class="home-quest"><span class="eyebrow">GOOD DAYS NEVER END</span><h3>家园变大了，陪伴也更多了。</h3><p>去花园照顾花草，回小屋准备点心，再到庭院招待朋友。每天都有一件可以一起做的小事。</p><div class="home-quest-row">${btn('继续合成','merge')}${btn('重温庭院聚会','ending','alt')}</div></article>`}</section>`;
}
function renderBook(){
 const s=game.s;let content='';
 if(ui.bookMode==='memories'){
  content=`${renderSouvenirs()}${renderWorldMemories()}<div class="section-title">六章生活 · 永久收藏</div><div class="memory-grid">${CHAPTERS.map((c,i)=>{const ok=s.stage>=(i+1)*4;return `<button class="memory-card" data-action="memory" data-chapter="${i}" ${ok?'':'disabled'}><div class="memory-art ${ok?'':'locked'}">${ok&&i===5?picture('party-memory','party-memory'):homeScene(Math.min(s.stage,(i+1)*4),{mini:true,poses:c.pose,night:i===4,region:DECOR[(i+1)*4-1].region})}${ok?'':icon('lock')}</div><h3>${String(i+1).padStart(2,'0')} · ${ok?c.memory:c.name}</h3><p>${ok?'轻轻翻开这一天':`完成第 ${i+1} 章后收进手帐`}</p></button>`;}).join('')}</div>${s.stage?`<div class="past-stories"><div class="companion-illustration">${picture('story-companion')}<span>和你一起，平凡也很可爱。</span></div><div class="section-title">已经发生的小故事</div>${TASKS.slice(0,s.stage).map(t=>`<button data-action="replayTask" data-id="${t.id}">${picture(t.decor)}${t.name}${icon('play')}</button>`).join('')}</div>`:''}`;
 }else if(ui.bookMode==='collection'){
  content=`<div class="collection-count"><span>物品图鉴 · 每一种都有名字</span><b>${Object.keys(s.seen).length} / 36</b></div>${CATS.map(c=>`<section class="chain-section"><div class="chain-head">${picture('gen-'+c)}<div><h3>${CHAINS[c].name}</h3><p>来源：${CHAINS[c].producer}</p></div>${ib('arrow','source','前往这个工作台',`data-cat="${c}"`,true)}</div><div class="collection-grid">${CHAINS[c].items.map((name,i)=>{const seen=s.seen[itemKey(c,i+1)],count=game.count(c,i+1);return `<button class="collection-item ${seen?'':'unseen'}" data-action="item" data-cat="${c}" data-level="${i+1}"><small>${i+1} 级</small>${picture(itemKey(c,i+1),'',name)}<span>${name}</span>${count?`<span class="mini-count">持有 ${count}</span>`:''}</button>`;}).join('')}</div></section>`).join('')}`;
 }else{
  content=`<div class="stats-grid"><div class="stat"><strong>${s.stats.merge}</strong><span>次小小合成</span></div><div class="stat"><strong>${s.stats.order}</strong><span>个心愿送达</span></div><div class="stat"><strong>${s.stage}</strong><span>处温暖角落</span></div></div>${dailyContent()}<div class="section-title">一起玩的小约定</div><p class="description muted" style="font-size:11px">不着急、不比快。每天的小目标不是必须完成的功课；错过一天，也不会失去已经建好的小屋。</p>`;
 }
 return `<section class="book-view"><div class="book-hero"><span class="eyebrow">OUR DAYS, IN LITTLE PAGES</span><h2>我们的生活手帐</h2><p>合过的小东西，和舍不得忘记的今天。</p>${icon('book')}</div><div class="book-controls"><div class="segmented"><button class="${ui.bookMode==='memories'?'active':''}" data-action="bookMode" data-mode="memories">回忆明信片</button><button class="${ui.bookMode==='collection'?'active':''}" data-action="bookMode" data-mode="collection">物品图鉴</button><button class="${ui.bookMode==='daily'?'active':''}" data-action="bookMode" data-mode="daily">今日小目标</button></div></div>${content}</section>`;
}
function renderShop(){
 const s=game.s;
 return `<section class="shop-view"><div class="page-heading"><div><span class="eyebrow">A LITTLE HELP, A LITTLE SWEET</span><h2>巷口的小铺</h2><p>金币来自合成订单 · 没有真实付费或广告</p></div>${picture('util-coin','', '金币')}</div><div class="shop-banner">${picture('util-gift')}<div><h3>今日小礼物</h3><p>40 金币 · ${CFG.dailyGiftEnergy} 体力 · 1 剪刀</p></div>${btn(s.daily.gift?'已收好':'免费领取','dailyGift','small',s.daily.gift?'disabled':'')}</div><div class="shop-grid">${[
 ['energy','util-energy','口袋小点心','收入道具，使用后 +30 体力',CFG.energyCost],['scissors','util-scissors','小小剪刀','高阶物品拆成两个低一阶',CFG.scissorCost],['parcel','util-gift','心愿补给包','先选订单和来源，再确认四件内容',CFG.parcelCost]
 ].map(([key,id,name,desc,price])=>`<article class="shop-product">${picture(id)}<h3>${name}</h3><p>${desc}</p>${btn(picture('util-coin')+price,'buy','small',`data-key="${key}"`)}</article>`).join('')}</div><div class="section-title">把工作台照顾得更好</div><div class="stock-list">${CATS.map(c=>{const p=s.producers[c],on=game.unlocked(c);return `<article class="producer-card ${on?'':'locked'}"><div class="row">${picture('gen-'+c)}<div><h3>${CHAINS[c].producer}</h3><p>${on?`Lv.${p.level} · 库存 ${stockCap(p)}`:`第 ${CHAINS[c].unlock+1} 处心愿开启`}</p></div></div><p style="margin-top:7px">${on?`二阶概率 ${Math.round((.2+(p.level-1)*.12)*100)}% → ${p.level<3?Math.round((.2+p.level*.12)*100)+'%':'已满级'}`:'完成对应修缮后自动解锁'}</p>${btn(on?(p.level>=3?'已经很好啦':`升级 · ${CFG.upgradeCosts[p.level-1]} 金币`):'还没解锁','upgrade','small alt',`data-cat="${c}" ${on&&p.level<3?'':'disabled'}`)}</article>`;}).join('')}</div><div class="section-title">累了，就先休息一下</div><div class="shop-banner">${picture('tea-4')}<div><h3>和布布一二喝杯茶</h3><p>免费补充 30 体力 · 每分钟一次</p></div>${btn('坐一会儿','rest','small')}</div><p class="shop-note">工作台库存自然补充，体力每 15 秒恢复 1 点。<br>只想专心合成和看故事时，设置里可开启“轻松模式”。</p></section>`;
}
function dailyContent(){
 const s=game.s;return DAILY.map(d=>{const n=s.daily[d.key],claimed=s.daily.claimed.includes(d.key),ready=n>=d.target;return `<div class="daily-item"><div class="row between"><h3>${d.title}</h3><small class="muted">${Math.min(n,d.target)} / ${d.target}</small></div><p>${d.desc} · 奖励 ${d.coins} 金币、${d.energy} 体力</p><div class="row"><div class="progress-track"><i style="width:${Math.min(100,n/d.target*100)}%"></i></div>${btn(claimed?'已收好':ready?'领取奖励':'慢慢来','claimDaily','small',`data-key="${d.key}" ${ready&&!claimed?'':'disabled'}`)}</div></div>`;}).join('');
}

// ------- Sheets -------
function openModal(m){
 cancelDrag();if(!ui.modal)modalReturnFocus=focusKey(document.activeElement);ui.modal=m;renderModal();syncInert();$('.modal [data-action="closeModal"]')?.focus({preventScroll:true});
}
function closeModal(){
 ui.scenePlayer?.destroy();ui.scenePlayer=null;ui.sceneSnapshot=null;ui.sceneAwaitChoice=false;ui.modal=null;modalRoot.innerHTML='';syncInert();findFocus(modalReturnFocus)?.focus({preventScroll:true});modalReturnFocus=null;
}
function sheet(title,body){return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-handle"></div><div class="modal-title"><h2>${title}</h2>${ib('close','closeModal','关闭')}</div>${body}</section></div>`;}
function renderModal(){
 const focus=focusKey(document.activeElement),m=ui.modal;if(!m){modalRoot.innerHTML='';return;}const s=game.s;let title='',body='';
 if(m.type==='parcel'){title='给哪一份心愿补给？';body=parcelContent(m);}
 else if(m.type==='itemActions'){const t=s.board[m.index];title='收好、拆分或出售';body=t?.k==='item'?`${picture(itemKey(t.c,t.l),'hero-img')}<h3 class="center">${itemName(t.c,t.l)}</h3><p class="description">拆分会消耗一把剪刀，并需要一个额外空位；出售得到 ${mass(t)} 金币。下一次其他操作前可撤销。</p><div class="actions">${btn('用剪刀拆分','split','alt')}${btn('出售此物品','sell','danger')}</div>`:'<p>先选择棋盘上的物品。</p>';}
 else if(m.type==='event'){title=m.title;body=`<div class="event-scene">${homeScene(m.scene.stage,{mini:true,scene:ui.sceneSnapshot||m.scene,region:m.scene.region,night:m.scene.night})}</div>${m.scene.result?.condition==='wind'?`<div class="wind-choices"><span>风来了，先把茶布固定好：</span>${btn('夹子夹好','sceneChoice','small alt','data-choice="clip"')}${btn('杯垫压稳','sceneChoice','small alt','data-choice="anchor"')}</div>`:''}<p class="event-caption" aria-live="polite">${esc(m.caption||'两只熊一起把今天准备好。')}</p>${m.reward?`<p class="event-reward">已收好 ${m.reward.coins} 金币 · ${m.reward.energy} 体力${m.reward.firstSouvenir?' · 新纪念物已入手帐':''}</p>`:''}<div class="actions">${btn('下一步动作','sceneAdvance','alt','disabled')}${btn('跳到结果','sceneSkip','alt')}${btn('再看一次','sceneReplay','alt')}${btn(icon('camera')+'合照','photo','alt')}</div><p class="note">回放与拍照不会再次消耗材料，也不会重复发奖。</p>`;}
 else if(m.type==='orders'){
  title='今天的小心愿';body=`${orderTabs()}<div class="order-strip">${ui.orderMode==='tea'?teaContent():ui.orderMode==='main'?(game.mainOrder()?orderCard(game.mainOrder()):'<p class="description">主线已完成，茶会和邻里委托继续开放。</p>'):s.sideOrders.map((o,i)=>orderCard(o,'side',i)).join('')}</div>`;
 }else if(m.type==='item'||m.type==='chain'){
  const c=m.c,l=m.l||1;title=m.type==='chain'?CHAINS[c].name:itemName(c,l);
  body=`<div class="item-detail">${picture(itemKey(c,l))}<div><h3>${itemName(c,l)} <span class="tag">${l} 级</span></h3><p>棋盘与仓库共持有 ${game.count(c,l)} 件<br>${l===6?'这是本条合成链的最高阶。':`两个相同的 ${l} 级物品 → 一个 ${l+1} 级物品。`}</p></div></div><p class="description">${CHAINS[c].desc}</p><div class="route">${CHAINS[c].items.map((name,i)=>`${i?'<span class="route-arrow">›</span>':''}<button class="route-step ${l===i+1?'current':''}" data-action="item" data-cat="${c}" data-level="${i+1}">${picture(itemKey(c,i+1))}<small>${i+1}</small><span>${name}</span></button>`).join('')}</div><div class="route-source">${picture('gen-'+c)}<div><b style="font-size:12px">来自 ${CHAINS[c].producer}</b><p>${game.unlocked(c)?'点击工作台，以 1 体力取出一件材料。':`完成前 ${CHAINS[c].unlock} 处布置后开启。`}</p></div>${btn('去看看','source','small',`data-cat="${c}"`)}</div><p class="note">合成表示把同类生活用品逐步整备升级，不是现实中的物理配方。订单只接收指定阶数，不自动折算高阶物品。</p>`;
 }else if(m.type==='storage'){
  title='把小东西收好';const source=ui.storageTab,arr=s[source];
  body=`<div class="storage-tabs segmented"><button class="${source==='storage'?'active':''}" data-action="storageTab" data-source="storage">仓库 ${s.storage.length}/${s.capacity}</button><button class="${source==='pending'?'active':''}" data-action="storageTab" data-source="pending">待领礼物 ${s.pending.length}</button></div><p class="description">${source==='storage'?'点一下物品即可取回棋盘。仓库内的物品也可以直接交付订单。':'满盘时礼物会留在这里，不会消失。取到棋盘后才能合成或交付。'}</p>${arr.length||source==='storage'?`<div class="inventory-grid">${Array.from({length:source==='storage'?s.capacity:arr.length},(_,i)=>{const t=arr[i];return t?`<button class="inventory-slot" data-action="retrieve" data-source="${source}" data-index="${i}" aria-label="取出${itemName(t.c,t.l)}">${picture(itemKey(t.c,t.l))}<span class="level">${t.l}</span><small>${itemName(t.c,t.l)}</small></button>`:'<div class="inventory-slot">空位</div>';}).join('')}</div>`:'<div class="inventory-empty">这里暂时没有待领物品。<br>章节奖励和补给包会送到这里。</div>'}<div class="bag-line"><div>${picture('util-scissors')}剪刀 ×${s.bag.scissors}</div><div>${picture('util-energy')}点心 ×${s.bag.energyPacks}<button data-action="usePack">使用</button></div></div>${source==='storage'&&s.capacity<24?btn(`再添 4 个空位 · ${game.expansionCost()} 金币`,'expand','wide alt'):''}<p class="note">工作台不会进入仓库，也不会被出售。手动收纳：在棋盘选中物品后，点下方的收纳盒图标。</p>`;
 }else if(m.type==='energy'){
  title='累了，就坐一会儿';const wait=Math.max(0,Math.ceil((s.restAt-Date.now())/1000));
  body=`${picture('bubu-sit','hero-img')}<p class="warm-text">不赶时间。<br>吃点甜的，再一起慢慢来。</p><div class="reward-tray"><span>${picture('util-energy')}${s.settings.calm?'∞ · 轻松模式':s.energy+' / 100'}</span></div><p class="description center">自然恢复：每 15 秒 1 点，恢复到 100 点停止。<br>订单和奖励得到的体力可以暂存超过 100 点。</p><div class="actions">${btn(`吃点心 +30（${s.bag.energyPacks}）`,'usePack','alt')}${btn(wait?`泡茶中 ${wait}s`:'免费茶歇 +30','rest','',`data-rest-button ${wait?'disabled':''}`)}</div><p class="note">每分钟可以免费喝一次茶，不需要看广告。<br>设置中的轻松模式可关闭体力与库存消耗。</p>`;
 }else if(m.type==='daily'){
  title='今天，也有小小收获';body=`<div class="shop-banner">${picture('util-gift')}<div><h3>今天的小礼物</h3><p>40 金币 · ${CFG.dailyGiftEnergy} 体力 · 1 剪刀</p></div>${btn(s.daily.gift?'已收好':'免费领','dailyGift','small',s.daily.gift?'disabled':'')}</div>${dailyContent()}<p class="note">按设备本地日期更新；不强制连续签到。<br>今天没做完，也不会影响主线故事。</p>`;
 }else if(m.type==='settings'){
  title='小屋的使用说明';body=`${[
   ['sound','小物件的声音','合成、交付和点击时的轻轻回应。'],['music','暖暖的背景音乐','原创玩具钢琴小调，默认关闭。'],['calm','轻松模式','取物不消耗体力与库存；故事、订单与合成照常推进。'],['reducedMotion','减少动态效果','用关键动作画面展示结果，关闭飘动、粒子和弹跳；奖励保持一致。']
  ].map(([key,name,desc])=>`<div class="setting-row"><div><h3>${name}</h3><p>${desc}</p></div><button class="toggle ${s.settings[key]?'on':''}" data-action="setting" data-key="${key}" role="switch" aria-checked="${s.settings[key]}" aria-label="${name}"><i></i></button></div>`).join('')}<div class="section-title">把好日子保管好</div><p class="description">进度保存在当前浏览器，没有云账号。换设备或清理浏览器前，请先导出存档。${storageFailed?'<br><b>当前浏览器不允许保存，请务必导出。</b>':''}</p><div class="settings-grid">${btn(icon('download')+'导出存档','export','alt')}${btn(icon('upload')+'导入存档','import','alt')}${btn(icon('play')+'重看开场','replayIntro','alt')}${btn(icon('info')+'玩法说明','help','alt')}</div><div class="actions">${btn('重新开始这间小屋','resetAsk','danger')}</div><p class="note">单机 H5 v1.2 · 3 区域家园 · 6 章故事<br>本作品为布布一二主题单机游戏；商业发行需另行取得角色 IP 授权。<br>没有广告、内购、排行榜或数据上传。</p>`;
 }else if(m.type==='submitted'){
  title='这份小心愿，备好啦';const r=m.result;
  body=`${picture('yier-happy','reward-art')}<h3 class="celebration-title">现在，回家变一点点更好</h3><p class="description center">材料已经收进修缮包。<br>心愿星只用于当前这处布置，不会被小铺花掉。</p><div class="reward-tray"><span>${picture('util-star')}+1</span><span>${picture('util-coin')}+${r.coins}</span><span>${picture('util-energy')}+${r.energy}</span></div>${btn('带心愿星回小屋','afterSubmit','wide')}`;
 }else if(m.type==='build'){
  const t=TASKS[s.stage];if(!t){closeModal();return;}title=t.name;
  body=`<p class="description">一二挑颜色，布布负责放稳。两种风格随时可以免费更换。</p><div class="style-options">${[0,1].map(i=>`<button class="style-option ${i?'variant':''} ${ui.styleChoice===i?'selected':''}" data-action="chooseStyle" data-style="${i}" aria-pressed="${ui.styleChoice===i}">${picture(t.decor)}<span class="swatch"></span>${i?'薄荷来信':'奶油晴天'}</button>`).join('')}</div>${btn(picture('util-star')+' 用 1 颗心愿星布置','confirmBuild','wide')}<p class="note">已交付本次材料 · 布置完成后开启下一张心愿</p>`;
 }else if(m.type==='decorate'){
  title='换一个喜欢的颜色';body=s.stage?`<p class="description">点已经摆好的小东西，切换它的两种配色。不花金币，也不影响进度。</p><div class="decor-picker">${TASKS.slice(0,s.stage).map(t=>`<button class="decor-choice ${s.decorStyles[t.id]?'variant':''}" data-action="redecorate" data-id="${t.id}" aria-label="切换${t.name}配色">${picture(t.decor,'',t.name)}<small>${s.decorStyles[t.id]?'薄荷':'奶油'}</small></button>`).join('')}</div>`:'<div class="inventory-empty">先合出软海绵、交付心愿，<br>为小屋铺好第一块门垫吧。</div>';
 }else if(m.type==='memory'){
  const c=CHAPTERS[m.chapter];title=m.reward?'把今天收进手帐':c.memory;
  body=`<div class="memory-full">${m.chapter===5?picture('party-memory','party-memory'):homeScene((m.chapter+1)*4,{mini:true,poses:c.pose,night:m.chapter===4,region:DECOR[(m.chapter+1)*4-1].region})}</div><p class="eyebrow center">CHAPTER ${String(m.chapter+1).padStart(2,'0')} · ${c.memory}</p><p class="memory-text">${c.text}</p>${m.reward?`<div class="reward-tray"><span>${picture('util-coin')}+60</span><span>${picture('util-energy')}+${CFG.chapterEnergy}</span><span>${picture('util-scissors')}+1</span></div><p class="note">章节奖励已到账，两件材料已放入“待领礼物”。</p>`:''}<div class="actions">${btn(m.reward&&m.chapter===5?'翻到最后一页':'把这一天收好','memoryDone','wide')}</div>`;
 }else if(m.type==='discovery'){
  title=m.l===6?'最高阶收藏，合出来啦！':'新的可爱，闪亮登场';
  body=`<div class="discovery-stage">${picture(itemKey(m.c,m.l),'discovery-art')}<span class="discovery-level">LEVEL ${m.l}</span></div><h3 class="center">${itemName(m.c,m.l)}</h3><p class="description center">从小小材料到精致成品，<br>这件新发现已永久收进物品图鉴。</p>${btn('继续合出好日子','closeModal','wide')}`;
 }else if(m.type==='furniture'){
  const t=TASKS[m.id],region=REGIONS.find(r=>r.id===DECOR[m.id].region);title=t.name;
  body=`<div class="furniture-detail">${picture(t.decor)}</div><p class="description center">${region.name}里的第 ${DECOR.filter(d=>d.region===region.id&&d.id<=m.id).length} 个小愿望。<br>${esc(t.wish)}</p><div class="actions">${btn('重温这段故事','replayTask','alt',`data-id="${m.id}"`)}${btn('换个配色','redecorate','',`data-id="${m.id}"`)}</div><p class="note">已布置的小物可以随时重温和换色。</p>`;
 }else if(m.type==='worldMemory'){
  title=m.result?.memoryName||'家园的日常回忆';body=`<div class="activity-memory-scene">${homeScene(s.stage,{mini:true,region:m.result?.region||s.world.region})}</div><p class="warm-text">花开过，茶喝过，<br>每一天都多一点共同的记忆。</p><p class="description center">在同一片家园，累计三天陪伴。<br>回忆已收进手帐，明天还能一起做新的小事。</p>${btn('把今天收好','closeModal','wide')}`;
 }else if(m.type==='ending'){
  title='庭院聚会，开场啦';body=`${picture('party-memory','ending-party')}<p class="warm-text">“布布，我们真的把它变成家了。”<br>“嗯。花园和庭院，也都是我们的家。”</p><div class="stats-grid" style="margin-top:18px"><div class="stat"><strong>24</strong><span>个愿望变成真的</span></div><div class="stat"><strong>${s.stats.merge}</strong><span>次小小合成</span></div><div class="stat"><strong>${Object.keys(s.seen).length}</strong><span>件可爱收藏</span></div></div><p class="description center">六章故事已经收好。明天去花园照顾花草，回小屋准备点心，再到庭院招待朋友，继续积累家园回忆。</p>${btn('明天，也一起可爱','endingDone','wide')}`;
 }else if(m.type==='confirmSell'){
  const t=s.board[m.index];if(!t||t.k!=='item'){closeModal();return;}title='这件物品，心愿里也需要';body=`${picture(itemKey(t.c,t.l),'hero-img')}<p class="description center">${itemName(t.c,t.l)} 正被当前订单需要。<br>出售可得到 ${mass(t)} 金币，但之后需要重新合成。</p><div class="actions">${btn('留给小心愿','closeModal','alt')}${btn('还是出售','confirmSell','danger',`data-index="${m.index}"`)}</div>`;
 }else if(m.type==='reset'){
  title='重新开始之前';body=`<p class="description">这会清空当前浏览器中这间小屋的进度和自动备份，包括章节、物品与金币。建议先导出一份存档。</p>${btn('先导出现在的存档','export','wide alt')}<div class="actions">${btn('保留小屋','closeModal','alt')}${btn('确认重新开始','resetConfirm','danger')}</div>`;
 }else if(m.type==='importConfirm'){
  title='要搬进这份存档吗？';body=`<p class="description">将载入一间已经完成 ${m.state.stage} / 24 处布置的小屋。当前进度会被替换，建议先导出。</p><div class="actions">${btn('取消','closeModal','alt')}${btn('确认载入','importConfirm')}</div>`;
 }else if(m.type==='growth'){
  title='一点点，也算长大';body=`${picture('bubu-joy','hero-img')}<h3 class="center">成长等级 Lv.${levelOf(s)}</h3><p class="description center" style="margin-top:10px">合成、交付、布置都会增加成长经验。<br>每获得 60 经验升一级，自动奖励 ${CFG.levelCoins} 金币与 ${CFG.levelEnergy} 体力，最高 99 级。</p><div class="row"><div class="progress-track"><i style="width:${(s.xp%60)/60*100}%"></i></div><small class="muted">${s.xp%60} / 60</small></div><div class="stats-grid"><div class="stat"><strong>${s.stats.produce}</strong><span>次材料整备</span></div><div class="stat"><strong>${s.stats.unweb}</strong><span>处尘封解开</span></div><div class="stat"><strong>${s.stage}</strong><span>处小屋布置</span></div></div><p class="note">成长奖励已经自动到账，无需额外领取。</p>`;
 }else if(m.type==='help'){
  title='一起把日子合成家';body=`${[
   ['01 · 每件小东西都有来处','带闪电的是固定工作台。点击它，花 1 体力取出本条链的一阶或二阶物品；库存每 6 秒补 1 件。随小屋修缮，会有新的工作台解锁。'],
   ['02 · 拖过来，或点两下','两个同类同级物品合成高一级；也可先点一个，再点另一个。把普通物品合进相同的尘封物品，可以解锁尘封。不同的普通物品会交换位置。'],
   ['03 · 先看看小心愿','订单只接收指定等级与数量。合好后交付，获得心愿星；回小屋选择配色并布置，才能推进下一项故事。邻里委托提供金币和体力，不跳过主线。'],
   ['04 · 桌子满了，也有办法','收进仓库、交付、出售都能腾空间。仓库物品可直接交付；待领礼物不会因满盘丢失。剪刀把二级以上物品拆成两个低一级物品，使用前需要一个额外空格。'],
   ['05 · 合过头了，可以后悔','下方回转箭头可撤销最近一次移动、合成、出售、收纳、取回、拆分或整理。进行其他有产出或奖励的操作后，就不能再撤销更早的操作。最高级为六级。'],
   ['06 · 好日子没有付费门槛','体力自然恢复，也有每分钟一次的免费茶歇。设置可开启轻松模式；开启后取物不耗体力与库存，其余玩法不变。'],
   ['07 · 记得保管小屋','这是单机游戏，只保存在当前浏览器。换设备前导出 JSON 存档，再到新设备导入。浏览器无痕模式和直接打开文件时的保存能力，取决于浏览器本身。']
  ].map(([h,p])=>`<div class="help-section"><h3>${h}</h3><p>${p}</p></div>`).join('')}`;
 }
 modalRoot.innerHTML=sheet(title,body);syncInert();if(m.type==='event')syncEventControls();const restored=findFocus(focus,modalRoot);(restored||$('.modal [data-action="closeModal"]'))?.focus({preventScroll:true});
}

// ------- Launch and comic dialogue -------
function renderSplash(){
 overlayRoot.innerHTML=`<section class="splash" aria-label="游戏启动页"><div class="splash-scene">${homeScene(game.s.stage,{characters:false,mini:true})}</div><i class="splash-leaf one"></i><i class="splash-leaf two"></i><i class="splash-leaf three"></i><div class="splash-top"><div class="eyebrow">GOOD DAYS, TOGETHER</div><h1><span class="bear-title">布布一二</span>好日子小屋</h1><p class="splash-sub">把小小的心愿，慢慢合成家</p><span class="splash-pill">合成 · 布置 · 陪伴 · 收藏</span></div><div class="splash-bears">${picture('bubu-sit')}${picture('yier-turn')}</div><div class="splash-ribbon">“和你一起，就是最开心的事。”</div><div class="splash-bottom">${btn(game.s.introSeen?'回到我们的好日子':'开始我们的好日子','start')}${game.s.introSeen?'<button class="text-button" data-action="replayIntro">再看一遍初次见面</button>':''}<p>不用登录 · 单机本地保存 · 没有付费广告<br>建议先导出存档，再切换浏览器或设备。</p></div></section>`;
}
function showStory(lines,onFinish=()=>{},context=null){
 cancelDrag();closeModal();ui.splash=false;ui.story={lines,index:0,onFinish,context};renderStory();syncInert();$('.story-overlay [data-action="nextStory"]')?.focus({preventScroll:true});
}
function renderStory(){
 const q=ui.story;if(!q)return;const line=q.lines[q.index],who=line.who,pose=line.pose||'idle';
 const fullPose={happy:'joy'}[pose]||pose;
 const left=who==='bubu'?`bubu-${fullPose}`:'bubu-turn';const right=who==='yier'?`yier-${fullPose}`:'yier-turn';
 overlayRoot.innerHTML=`<section class="story-overlay" aria-label="剧情对话"><div class="story-scene">${homeScene(q.context?.stage??game.s.stage,{characters:false,mini:true,night:q.context?.night??ui.night,region:q.context?.region||game.s.world.region})}</div><div class="story-header"><span class="eyebrow">${q.context?.replay?'回忆重温 · 当时布置与区域 · 配色使用当前选择':game.s.stage===0?'PROLOGUE · 推开这扇门':`OUR LITTLE STORY · 第 ${Math.min(6,Math.ceil(game.s.stage/4))} 章`}</span><button class="story-skip" data-action="skipStory">跳过 ${icon('arrow')}</button></div><h2 class="story-title">${esc(line.title||'今天，又多了一点点可爱')}</h2><p class="story-aside">${esc(line.aside||'小小的事情，两个人一起做，就变得不一样。')}</p><div class="story-characters">${picture(left,`story-character ${who==='bubu'?'speaking':''}`)}${picture(right,`story-character ${who==='yier'?'speaking':''}`)}</div><div class="dialogue-box"><span class="speaker-name ${who}">${who==='bubu'?'布布':'一二'}</span><p class="dialogue-text">${esc(line.text)}</p><div class="dialogue-footer"><div class="story-dots">${q.lines.map((_,i)=>`<i class="${i===q.index?'active':''}"></i>`).join('')}</div>${btn(q.index===q.lines.length-1?'一起开始吧':'下一句','nextStory')}</div></div></section>`;
 sounds.play(who==='bubu'?'talk':'yier');
}
function finishStory(){const q=ui.story;if(!q)return;ui.story=null;overlayRoot.innerHTML='';syncInert();q.onFinish();}
function nextStory(){if(!ui.story)return;if(++ui.story.index>=ui.story.lines.length)finishStory();else renderStory();}
function playIntro(){ui.splash=false;showStory(INTRO,()=>{game.markIntro();persist();navigate(game.s.stage===0?'merge':'home');if(game.s.stage===0){highlight([8,9]);toast('从这两块相同的小方巾开始。',2800);}if(saveWarning)toast(saveWarning,5000);});}
function replayTask(id,onFinish=()=>{},replay=true){
 const t=TASKS[id];if(!t||id>=game.s.stage)return;showStory(t.after.map(([who,pose,text])=>({who,pose,text,title:t.name,aside:CHAPTERS[t.chapter].sub})),onFinish,{stage:id+1,region:DECOR[id].region,night:t.chapter===4,replay});
}
function afterBuild(r){
 ui.newDecor=r.stage;ui.homeMode='region';ui.night=game.s.stage>=16&&game.s.stage<20;ui.tab='home';ui.selected=null;render();main.scrollTop=0;sounds.play('place');burst(null,true);
 setTimeout(()=>{ui.newDecor=null;replayTask(r.stage,()=>{if(r.chapterDone)openModal({type:'memory',chapter:r.chapter,reward:true});else if(r.unlocked.length)toast(`新工作台开启：${r.unlocked.map(c=>CHAINS[c].producer).join('、')}`);else if(r.stage===0)toast('门垫铺好了！回合成台，试试点击带闪电的清洁篮。',3200);},false);},620);
}
function highlight(indices){ui.highlight=indices;clearTimeout(highlightTimer);render();highlightTimer=setTimeout(()=>{ui.highlight=[];if(ui.tab==='merge')render();},6000);}
function showHint(){const h=game.hint(ui.orderMode);if(h.kind==='lesson'){navigate('merge');const idx=CATS.indexOf(h.c);ui.selected=idx;highlight([idx]);toast(`亲手点一次${CHAINS[h.c].producer}，认识新来源。`);return;}if(h.kind==='build'){navigate('home');toast('材料已经交好啦，点“开始布置”。');return;}if(h.kind==='submit'){ui.orderMode=h.orderKind||ui.orderMode;navigate('merge');toast(ui.orderMode==='tea'?'茶会材料已经备齐，点开订单开始茶会。':ui.orderMode==='side'?'邻里委托已经备齐，点开委托即可交付。':'上方心愿已经备齐，可以交付啦。');return;}navigate('merge');if(h.kind==='merge'){highlight([h.from,h.to]);toast(`把发亮的两个${itemName(h.c,h.l)}合在一起。`);}else if(h.idx!==undefined){highlight([h.idx]);ui.selected=h.idx;render();toast(`点带闪电的${CHAINS[h.c].producer}，继续准备材料。`);}else toast(h.message||'看看订单里还需要哪些物品。');}
function chat(who){
 if(ui.tab!=='home')return;clearTimeout(chatTimer);$('.room-chat')?.remove();const lines=HOME_CHAT.filter(l=>l[0]===who);if(!lines.length)return;const [,pose,text]=lines[Math.floor(Math.random()*lines.length)];const scene=$('.home-scene');if(!scene)return;const el=document.createElement('div');el.className='room-chat';el.textContent=text;scene.append(el);
 const poses=['bubu-idle','yier-turn'];poses[who==='bubu'?0:1]=`${who}-${pose==='happy'?'joy':pose}`;const host=$('.scene-layers',scene);if(host)host.innerHTML=renderSceneHTML(describeScene(game.s,{region:game.s.world.region,night:ui.night,poses}),{assetURL:asset,interactive:true});sounds.play(who==='yier'?'yier':'talk');chatTimer=setTimeout(()=>{el.remove();if(host.isConnected)host.innerHTML=renderSceneHTML(describeScene(game.s,{region:game.s.world.region,night:ui.night}),{assetURL:asset,interactive:true});},3500);
}
function playHomeActivity(r){
 playEvent('homeActivity-'+r.region,{result:r});
}
// ------- Board pointer handling: primary pointer only; cancellations never move items -------
function selectCell(index){
 const t=game.s.board[index];
 if(t?.k==='gen'){ui.selected=index;const r=run(game.produce(t.c));if(!r.ok)render();return;}
 if(ui.selected!==null&&ui.selected!==index){const a=game.s.board[ui.selected];if(a?.k==='item'&&!a.dust&&t?.k!=='crate'){
  const r=game.move(ui.selected,index);if(r.ok){run(r);return;}if(t?.k==='item'&&!t.dust&&r.code!=='MAX'&&r.code!=='TUTORIAL'){ui.selected=index;render();return;}run(r);return;
 }}
 ui.selected=index;sounds.play('tap');render();
}
function startDrag(e){
 const cell=e.target.closest('[data-cell]');if(!cell||e.button!==0||!e.isPrimary||ui.modal||ui.story||ui.splash)return;
 const from=+cell.dataset.cell;const t=game.s.board[from];drag={from,x:e.clientX,y:e.clientY,pointerId:e.pointerId,cell,moving:false,ghost:null,canMove:t?.k==='item'&&!t.dust};
 try{cell.setPointerCapture(e.pointerId);}catch{}if(drag.canMove||e.pointerType!=='touch')e.preventDefault();
}
function dragMove(e){
 if(!drag||e.pointerId!==drag.pointerId)return;
 if(drag.canMove&&!drag.moving&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){
  drag.moving=true;const t=game.s.board[drag.from];const im=document.createElement('div');im.className='drag-ghost';im.innerHTML=picture(itemKey(t.c,t.l));document.body.append(im);drag.ghost=im;drag.cell.classList.add('source');
 }
 if(drag.moving){drag.ghost.style.left=(e.clientX-30)+'px';drag.ghost.style.top=(e.clientY-38)+'px';$$('.cell.target').forEach(c=>c.classList.remove('target'));const to=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]');if(to&&+to.dataset.cell!==drag.from)to.classList.add('target');}
}
function endDrag(e){
 if(!drag||e.pointerId!==drag.pointerId)return;const d=drag;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]');cancelDrag();ignoreClickUntil=Date.now()+300;
 if(d.moving){if(target&&+target.dataset.cell!==d.from)run(game.move(d.from,+target.dataset.cell));else{ui.selected=d.from;render();}}
 else selectCell(d.from);
}
function cancelDrag(){if(drag){drag.ghost?.remove();drag.cell?.classList.remove('source');try{drag.cell?.releasePointerCapture(drag.pointerId);}catch{}}drag=null;$$('.cell.target').forEach(c=>c.classList.remove('target'));}
app.addEventListener('pointerdown',startDrag);document.addEventListener('pointermove',dragMove);document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',cancelDrag);window.addEventListener('blur',cancelDrag);
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
  case 'orderMain':ui.orderMode='main';render();break;
  case 'openTea':closeModal();ui.orderMode='tea';navigate('merge');break;
  case 'orderTea':ui.orderMode='tea';render();break;
  case 'teaPlan':run(game.chooseTeaPlan(d.plan),{quiet:true});break;
  case 'firstVisit':run(game.beginFirstVisit());break;
  case 'teaReplay':openTeaReplay(game.s.tea.lastResult);break;
  case 'souvenirReplay':{const entry=souvenirEntries().find(v=>v.key===d.key&&(!d.plan||v.plan===d.plan));if(entry?.snapshot)openTeaReplay(entry.snapshot);break;}
  case 'equipSouvenir':run(game.equipSouvenir(d.region,d.key),{quiet:true});break;
  case 'sceneAdvance':ui.scenePlayer?.advance();break;
  case 'sceneChoice':if(ui.sceneAwaitChoice){rememberSceneChoice(d.choice);ui.scenePlayer?.start();syncEventControls();}break;
  case 'sceneSkip':rememberSceneChoice('anchor');ui.scenePlayer?.skip();syncEventControls();break;
  case 'sceneReplay':rememberSceneChoice('anchor');ui.scenePlayer?.replay();syncEventControls();break;
  case 'itemActions':openModal({type:'itemActions',index:ui.selected});break;
  case 'parcelTarget':ui.parcelTarget=JSON.parse(d.target);ui.parcelSource=null;renderModal();break;
  case 'parcelSource':ui.parcelSource=d.cat;renderModal();break;
  case 'confirmParcel':{const quote=ui.modal?.quote;if(!quote)break;const r=run(game.buy('parcel',quote));if(r.ok)closeModal();break;}
  case 'orderSide':if(game.s.stage===0){toast('先把门垫铺好，邻里委托就会开启。');break;}ui.orderMode='side';render();break;
  case 'bookMode':ui.bookMode=d.mode;render();main.scrollTop=0;break;
  case 'item':openModal({type:'item',c:d.cat,l:+d.level});break;
  case 'chain':openModal({type:'chain',c:d.cat,l:1});break;
  case 'source':closeModal();navigate('merge');ui.selected=CATS.indexOf(d.cat);highlight([ui.selected]);if(!game.unlocked(d.cat))toast(`修好前 ${CHAINS[d.cat].unlock} 处后，${CHAINS[d.cat].producer}会自动解锁。`);else if(!game.s.producerLessons[d.cat])toast(`点发亮、带闪电的${CHAINS[d.cat].producer}，亲手取出一件材料。`,3500);break;
  case 'hint':showHint();break;
  case 'submit':run(game.submit(d.kind,d.kind==='main'?+d.id:d.id,d.kind==='main'?+d.step:undefined));break;
  case 'afterSubmit':closeModal();navigate('home');break;
  case 'build':if(!game.s.delivered){ui.orderMode='main';navigate('merge');showHint();}else{focusBuildRegion();ui.tab='home';render();ui.styleChoice=0;openModal({type:'build'});}break;
  case 'worldMap':ui.homeMode='map';render();main.scrollTop=0;break;
  case 'visitRegion':{const r=game.visitRegion(d.region);if(r.ok){persist();ui.homeMode='region';ui.tab='home';render();main.scrollTop=0;sounds.play('tap');}else run(r);break;}
  case 'homeActivity':run(game.homeActivity(d.region));break;
  case 'worldMemory':{const m=game.worldProgress().memories.find(v=>v.region===d.region);if(m?.unlocked)openModal({type:'worldMemory',result:{region:d.region,memoryName:m.name}});break;}
  case 'furniture':if(+d.id<game.s.stage)openModal({type:'furniture',id:+d.id});break;
  case 'chooseStyle':ui.styleChoice=+d.style;renderModal();break;
  case 'confirmBuild':{const r=game.build(ui.styleChoice);if(r.ok){closeModal();persist();afterBuild(r);}else run(r);break;}
  case 'decorate':openModal({type:'decorate'});break;
  case 'redecorate':run(game.redecorate(+d.id,game.s.decorStyles[+d.id]===0?1:0),{quiet:true});toast('这个角落换好了新配色。');break;
  case 'storage':ui.storageTab=game.s.pending.length?'pending':'storage';openModal({type:'storage'});break;
  case 'storageTab':ui.storageTab=d.source;renderModal();break;
  case 'retrieve':run(game.retrieve(+d.index,d.source));break;
  case 'store':run(game.store(ui.selected));break;
  case 'split':closeModal();run(game.split(ui.selected));break;
  case 'sell':{if(ui.modal?.type==='itemActions')closeModal();const t=game.s.board[ui.selected];if(t?.k==='item'&&!t.dust&&(game.mainOrder()?.needs.some(r=>r.c===t.c&&r.l===t.l)||game.s.sideOrders.some(o=>o.needs.some(r=>r.c===t.c&&r.l===t.l))))openModal({type:'confirmSell',index:ui.selected});else run(game.sell(ui.selected));break;}
  case 'confirmSell':closeModal();run(game.sell(+d.index));break;
  case 'sort':run(game.sort());break;
  case 'undo':run(game.undo());break;
  case 'expand':run(game.expand());break;
  case 'upgrade':run(game.upgrade(d.cat));break;
  case 'buy':if(d.key==='parcel'){ui.parcelTarget=null;ui.parcelSource=null;openModal({type:'parcel'});}else run(game.buy(d.key));break;
  case 'energy':openModal({type:'energy'});break;
  case 'usePack':run(game.usePack());break;
  case 'rest':run(game.rest());break;
  case 'daily':openModal({type:'daily'});break;
  case 'dailyGift':run(game.dailyGift());break;
  case 'claimDaily':run(game.claimDaily(d.key));break;
  case 'refreshSide':run(game.refreshSide(+d.slot));break;
  case 'growth':openModal({type:'growth'});break;
  case 'settings':openModal({type:'settings'});break;
  case 'setting':run(game.setting(d.key,!game.s.settings[d.key]),{quiet:true});sounds.syncMusic();break;
  case 'help':openModal({type:'help'});break;
  case 'closeModal':closeModal();break;
  case 'memory':if(game.s.stage>=(+d.chapter+1)*4)openModal({type:'memory',chapter:+d.chapter});break;
  case 'memoryDone':{const finish=ui.modal?.reward&&ui.modal?.chapter===5;closeModal();if(finish)openModal({type:'ending'});break;}
  case 'ending':openModal({type:'ending'});break;
  case 'endingDone':game.markFinished();persist();closeModal();navigate('home');break;
  case 'replayIntro':hasStarted=true;sounds.syncMusic();playIntro();break;
  case 'replayTask':replayTask(+d.id);break;
  case 'nextStory':nextStory();break;
  case 'skipStory':finishStory();break;
  case 'chat':chat(d.who);break;
  case 'dayNight':ui.night=!ui.night;render();break;
  case 'photo':await capturePhoto();break;
  case 'export':try{downloadBlob(new Blob([game.export()],{type:'application/json'}),`好日子小屋_存档_${new Date().toISOString().slice(0,10)}.json`);toast('已请求下载存档。请确认下载列表中的 JSON 文件并收好。');}catch(err){toast('存档下载未成功，请检查浏览器下载权限：'+err.message,5000);}break;
  case 'import':$('#import-file').click();break;
  case 'importConfirm':{const state=ui.modal.state;game=new GameEngine(state);closeModal();ui.selected=null;ui.highlight=[];ui.tab=game.s.stage===0?'merge':'home';ui.night=game.s.stage>=16&&game.s.stage<20;persist();render();sounds.syncMusic();toast('小屋已经搬过来了，继续好日子吧。');break;}
  case 'resetAsk':openModal({type:'reset'});break;
  case 'resetConfirm':{
   const next=new GameEngine(),raw=JSON.stringify(next.s);try{localStorage.setItem(STORE,raw);}catch{toast('重新开始未能保存，原进度已保留。请先导出存档并检查本地保存权限。',5000);break;}
   let backupWarning=false;try{localStorage.setItem(INITIALIZED,'1');localStorage.removeItem(BACKUP);}catch{backupWarning=true;}
   lastValid=raw;storageFailed=false;game=next;ui.tab='merge';ui.homeMode='map';ui.selected=null;ui.highlight=[];ui.night=false;closeModal();render();playIntro();if(backupWarning)toast('新小屋已保存，但浏览器未能清理旧版备份。',5000);break;
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
 if(e.key==='Escape'){if(ui.story)finishStory();else closeModal();cancelDrag();return;}
 if(ui.story&&[' ','Enter','ArrowRight'].includes(e.key)){e.preventDefault();nextStory();return;}
 if(ui.modal&&e.key==='Tab'){
  const focusable=$$('.modal button:not(:disabled),.modal input');if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(!$('.modal')?.contains(document.activeElement)){e.preventDefault();first.focus();}else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
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
 const live=ui.sceneSnapshot||describeScene(game.s,{region:game.s.world.region,night:ui.night});
 const scene=clone(live),region=REGIONS.find(r=>r.id===scene.region)||REGIONS[0];
 try{
  const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1300;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fff8ef';ctx.fillRect(0,0,1000,1300);ctx.fillStyle='#74513f';ctx.font='bold 37px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.fillText('布布一二 · '+region.name,500,64);ctx.fillStyle='#947863';ctx.font='18px sans-serif';ctx.fillText('每一处小愿望，都是一起过的好日子',500,103);
  ctx.save();ctx.translate(45,137);ctx.scale(.91,.91);await drawSceneCanvas(ctx,scene,{loadImage:loadImage,width:1000,height:1120});ctx.restore();
  ctx.fillStyle='#947863';ctx.font='20px sans-serif';ctx.fillText('把今天的布置、纪念物和陪伴一起收好',500,1217);ctx.font='15px sans-serif';ctx.fillText(new Date().toLocaleDateString('zh-CN'),500,1259);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('无法生成图片')),'image/png'));downloadBlob(blob,`布布一二_${region.name}_合照.png`);toast('合照已请求下载，请在下载列表中查看 PNG。');
 }catch(err){toast('照片未能导出：'+err.message+'。请检查图片与下载权限。',5000);}finally{ui.photoBusy=false;}
}
async function loadImage(id){
 const key=spriteSpec(id)?.asset||id;if(imageCache.has(key))return imageCache.get(key);const im=new Image();im.src=asset(key);await im.decode();imageCache.set(key,im);return im;
}

// Resource ticks do not recreate the board during a drag.
setInterval(()=>{
 if(document.hidden)return;const day=game.s.daily.day;game.tick();
 const e=$('#energy-count');if(e)e.textContent=game.s.settings.calm?'∞':game.s.energy;
 $$('[data-stock]').forEach(el=>{const p=game.s.producers[el.dataset.stock];el.textContent=game.s.settings.calm?'不限':`${p.stock}/${stockCap(p)}`;});
 $$('[data-rest-button]').forEach(el=>{const n=Math.max(0,Math.ceil((game.s.restAt-Date.now())/1000));el.disabled=n>0;el.textContent=n?`泡茶中 ${n}s`:'免费茶歇 +30';});
 if(day!==game.s.daily.day&&!drag){render();persist();}
},1000);
setInterval(persist,15000);
document.addEventListener('visibilitychange',()=>{cancelDrag();if(document.hidden){game.tick();persist();}else{game.tick();render();}sounds.syncMusic();});
window.addEventListener('pagehide',()=>{game.tick();persist();});
window.addEventListener('beforeunload',persist);
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{cancelDrag();render();},120);});

async function boot(){
 app.style.setProperty('--grain',`url("${asset('paper-texture')}")`);render();
 const ids=['region-house','bubu-idle','bubu-sit','bubu-turn','bubu-face','bubu-happy','yier-turn','yier-face','yier-happy','bubu-surprise','yier-surprise','util-energy','util-coin','util-star','util-crate','atlas-clean','atlas-generators'];
 // Resume page needs its region/decor now; later chapters never block the launch button.
 if(game.s.stage){ids.push('world-map',...REGIONS.filter(r=>r.id===game.s.world.region).map(r=>r.background),...DECOR.filter(d=>d.id<game.s.stage&&d.region===game.s.world.region).map(d=>d.image||`decor-${String(d.id+1).padStart(2,'0')}`));}
 ids.push(...game.s.board.filter(t=>t?.k==='item').map(t=>itemKey(t.c,t.l)));
 const keys=[...new Set(ids.map(id=>spriteSpec(id)?.asset||id))];let loaded=0,failed=[];
 await Promise.all(keys.map(async id=>{try{await loadImage(id);}catch{failed.push(id);}loaded++;const bar=$('#load-bar');if(bar)bar.style.width=`${loaded/keys.length*100}%`;}));
 if(failed.length){$('#loading-text').textContent=`有 ${failed.length} 件当前页面素材未能打开，请确认 assets 与入口在一起。`;const retry=document.createElement('button');retry.className='button';retry.textContent='重新打开素材';retry.onclick=()=>location.reload();$('#loading').append(retry);return;}
 $('#loading').remove();renderSplash();syncInert();
 if(new URLSearchParams(location.search).has('qa'))window.__COZY_QA__={get game(){return game;},render,navigate,openModal,ui,validateState,capturePhoto};
 if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)&&!window.__OFFLINE_SINGLE__)navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
boot().catch(err=>{const loading=$('#loading-text');if(loading)loading.textContent='小屋启动遇到问题：'+err.message;console.error(err);});
