/** Shared presentation descriptors. No operation in this module changes a save or pays a reward. */
import {DECOR,REGIONS,TASKS} from './data.mjs';
import {spriteSpec,drawSprite} from './visuals.mjs';

const cloneSceneData=v=>JSON.parse(JSON.stringify(v));
const escapeSceneText=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sceneClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sceneMix=(a,b,t)=>a+(b-a)*t;
const sceneSmooth=t=>{t=sceneClamp(t,0,1);return t*t*(3-2*t);};
const SCENE_LAYOUT={0:{x:53,y:34,w:20},1:{x:49,y:18,w:35},4:{x:84,y:46,w:23},5:{x:84,y:72,w:24},6:{x:84,y:66,w:13},7:{x:23,y:67,w:18},9:{x:22,y:67,w:27},11:{x:82,y:22,w:22},13:{x:24,y:36,w:29},14:{x:83,y:43,w:26},15:{x:74,y:19,w:16},16:{x:82,y:91,w:19},17:{x:25,y:86,w:22},18:{x:62,y:86,w:13},19:{x:48,y:94,w:15},20:{x:50,y:22,w:54},21:{x:22,y:86,w:30},22:{x:79,y:86,w:30},23:{x:20,y:84,w:25}};
const SCENE_SOUVENIR_LAYOUT={coaster:{id:'prop-coaster',region:'house',x:72,y:70,w:10,label:'一起选的杯垫'},card:{id:'prop-postcard',region:'courtyard',x:68,y:39,w:13,label:'手绘小卡'},chime:{id:'prop-wind-chime',region:'garden',x:72,y:23,w:12,label:'小风铃'}};
const SCENE_WORLD_COORDS={house:[25,41],garden:[54,61],courtyard:[82,44]};
export const freezeScene=scene=>cloneSceneData(scene);
function makeSceneActor(who,id,x,y,w=22){return {key:who,kind:'actor',who,id,x,y,w,h:w/1.12*1.2,z:12,anchor:'center',rotation:0,flip:false,label:{bubu:'布布',yier:'一二',xiaoli:'小栗'}[who]};}
function makeSceneProp(key,id,x,y,w=12,z=14,extra={}){return {key,kind:'prop',id,x,y,w,h:w/1.12,z,anchor:'center',rotation:0,...extra};}
function scenePoseId(id){return String(id).replace(/-happy$/,'-joy').replace(/^bubu-shy$/,'bubu-face');}
function sceneSouvenirType(key){return Object.keys(SCENE_SOUVENIR_LAYOUT).find(t=>key?.startsWith(t+'-')||key?.startsWith(t+':'));}

/** Percent coordinates are the same in DOM and exported photographs. */
export function describeScene(state,options={}){
 const result=options.teaResult;
 const stage=sceneClamp(Number(options.stage??result?.stage??state.stage??0),0,24);
 const region=options.region??result?.region??state.world?.region??'house';
 const info=REGIONS.find(r=>r.id===region)||REGIONS[0];
 const night=Boolean(options.night??result?.night??false);
 const styles=cloneSceneData(options.decorStyles??result?.decorStyles??state.decorStyles??{});
 const scene={schema:1,region:info.id,name:info.name,stage,night,background:info.background,aspect:1000/1120,decorStyles:styles,interactive:Boolean(options.interactive),layers:[],result:result?cloneSceneData(result):null};
 for(const d of DECOR.filter(d=>d.id<stage&&d.region===info.id)){
  const p={...d,...SCENE_LAYOUT[d.id]};scene.layers.push({key:'decor-'+d.id,kind:'decor',decorId:d.id,id:`decor-${String(d.id+1).padStart(2,'0')}`,x:p.x,y:p.y,w:p.w,h:p.w/1.12,z:p.z+1,anchor:'center',variant:styles[d.id]===1,label:TASKS[d.id]?.name||'家园布置'});
 }
 // Historic replays do not invent souvenirs that had not yet been earned.
 if(stage===state.stage||result||options.includeSouvenirs){
  const equipped=options.equipped??(result?(result.equipped??{}):state.world?.equipped);
  const key=equipped?.[info.id],type=sceneSouvenirType(key),s=SCENE_SOUVENIR_LAYOUT[type];
  if(s)scene.layers.push(makeSceneProp('souvenir-'+key,s.id,s.x,s.y,s.w,15,{kind:'souvenir',souvenirKey:key,variant:key.endsWith('garden'),rotation:key.endsWith('garden')?-9:5,label:s.label}));
 }
 const prep=Number(options.prepStep??(stage===state.stage?state.mainPrepStep:0)??0);
 if(stage===22&&info.id==='courtyard'){
  if(prep>=1)scene.layers.push(makeSceneProp('prep-sweets','bake-6',72,81,18,10));
  if(prep>=2)scene.layers.push(makeSceneProp('prep-tea','tea-5',78,75,15,11));
 }
 if(stage===23&&info.id==='garden'&&prep>=1)scene.layers.push(makeSceneProp('prep-flower','garden-6',23,79,24,10));
 if(stage===23&&prep>=2&&info.id==='courtyard')scene.layers.push(makeSceneProp('prep-picture','craft-6',24,76,20,10));
 if(stage===23&&prep>=3&&info.id==='courtyard')scene.layers.push(makeSceneProp('prep-cake','bake-5',71,80,17,10));
 if(options.characters!==false){
  const poses=options.poses||(night&&info.id==='house'?['bubu-sit','yier-rest']:['bubu-idle','yier-turn']);
  scene.layers.push(makeSceneActor('bubu',scenePoseId(poses[0]),42.5,60.5),makeSceneActor('yier',scenePoseId(poses[1]),60.5,60.5));
 }
 if(result){
  scene.layers=scene.layers.filter(l=>l.kind!=='actor');
  const garden=result.plan==='garden';
  scene.layers.push(makeSceneProp('tea-cloth','prop-tea-cloth',garden?50:65,garden?78:73,garden?37:26,9,{rotation: garden? -5:0,variant:garden}));
  scene.layers.push(makeSceneProp('tea-snack',garden?'garden-3':'bake-3',garden?54:68,garden?76:70,13,10));
  scene.layers.push(makeSceneActor('bubu','bubu-handover3',garden?34:44,63),makeSceneActor('yier','yier-handover3',garden?57:66,64));
  scene.layers.push(makeSceneProp('cup-one','tea-2',garden?46:61,72,8),makeSceneProp('cup-two','tea-2',garden?56:71,73,8),makeSceneProp('teapot','tea-4',garden?37:49,69,12));
  if(result.participants?.includes('xiaoli')){scene.layers.push(makeSceneActor('xiaoli','xiaoli-hold',garden?73:81,65,18),makeSceneProp('guest-cup','tea-2',garden?68:76,69,7));}
  if(result.condition==='memory')scene.layers.push(makeSceneProp('tea-card','prop-postcard',garden?49:62,78,11,15,{rotation:garden?-12:8}));
  if(result.condition==='wind')scene.layers.push(makeSceneProp('tea-clip','prop-clip',garden?66:74,garden?77:73,6,16));
 }
 return freezeScene(scene);
}

function sceneSpriteHTML(id,url){
 const spec=spriteSpec(id);if(!spec)return `<img src="${escapeSceneText(url(id))}" draggable="false" alt="">`;
 const inset=spec.inset||0,size=(1-2*inset)*100;
 // Build supplies dimensions for non-square generated sheets; Canvas uses source pixels directly.
 const dims=globalThis.window?.__ASSET_SIZES__?.[spec.asset];
 const ratio=dims?((dims[0]/spec.cols)/(dims[1]/spec.rows)):spec.slotAspect||1;
 return `<svg viewBox="0 0 ${100*ratio} 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><svg width="${100*ratio}" height="100" viewBox="${inset*100*ratio} ${inset*100} ${size*ratio} ${size}" overflow="hidden"><image href="${escapeSceneText(url(spec.asset))}" x="${-spec.col*100*ratio}" y="${-spec.row*100}" width="${spec.cols*100*ratio}" height="${spec.rows*100}" preserveAspectRatio="none"/></svg></svg>`;
}
function sceneLayerStyle(l,scene){return `left:${l.x}%;top:${l.y}%;width:${l.w}%;height:${l.h}%;z-index:${l.z};transform:translate(-50%,-50%) rotate(${l.rotation||0}deg)${l.flip?' scaleX(-1)':''};filter:${l.kind==='actor'?'none':[l.variant?'hue-rotate(24deg) saturate(.85)':'',scene.night?'brightness(.84)':''].filter(Boolean).join(' ')||'none'}`;}
export function renderSceneHTML(scene,{assetURL=id=>`assets/${id}.png`,interactive=scene.interactive}={}){
 const layers=scene.layers.map(l=>{
  const click=interactive&&['decor','actor','souvenir'].includes(l.kind),tag=click?'button':'div';
  const action=l.kind==='decor'?`data-action="furniture" data-id="${l.decorId}"`:l.kind==='actor'?`data-action="chat" data-who="${l.who}"`:`data-action="souvenirReplay" data-key="${escapeSceneText(l.souvenirKey)}"`;
  return `<${tag} class="scene-layer scene-${l.kind} ${l.who||''}" data-scene-layer="${escapeSceneText(l.key)}" data-sprite="${escapeSceneText(l.id)}" style="${sceneLayerStyle(l,scene)}" ${click?`${action} aria-label="${escapeSceneText(l.label)}"`: 'aria-hidden="true"'}>${l.id?sceneSpriteHTML(l.id,assetURL):''}</${tag}>`;
 }).join('');
 return `<img class="scene-background" src="${escapeSceneText(assetURL(scene.background))}" alt="" draggable="false" style="filter:${scene.night?'brightness(.64) saturate(.7)':'none'}">${layers}${scene.night?'<div class="scene-night-glow" aria-hidden="true"></div>':''}`;
}

/** Snapshot before awaiting any image. Photos cannot drift to a new region/tea round. */
export async function drawSceneCanvas(ctx,input,{loadImage,width=1000,height=1120}={}){
 if(typeof loadImage!=='function')throw new TypeError('drawSceneCanvas requires loadImage(assetId)');
 const scene=freezeScene(input);
 const ids=[...new Set([scene.background,...scene.layers.filter(l=>l.id).map(l=>spriteSpec(l.id)?.asset||l.id)])];
 const images=new Map(await Promise.all(ids.map(async id=>[id,await loadImage(id)])));
 ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();ctx.filter=scene.night?'brightness(.64) saturate(.7)':'none';ctx.drawImage(images.get(scene.background),0,0,width,height);ctx.filter='none';
 for(const l of [...scene.layers].sort((a,b)=>a.z-b.z)){
  ctx.save();ctx.translate(l.x/100*width,l.y/100*height);ctx.rotate((l.rotation||0)*Math.PI/180);if(l.flip)ctx.scale(-1,1);
  ctx.filter=l.kind==='actor'?'none':[l.variant?'hue-rotate(24deg) saturate(.85)':'',scene.night?'brightness(.84)':''].filter(Boolean).join(' ')||'none';
  const w=l.w/100*width,h=l.h/100*height;
  if(l.kind==='water'){ctx.fillStyle='#7cd5ef';ctx.beginPath();ctx.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);ctx.fill();}
  else drawSprite(ctx,images.get(spriteSpec(l.id)?.asset||l.id),spriteSpec(l.id),-w/2,-h/2,w,h);ctx.restore();
 }
 if(scene.night){for(const [x,y,r,color] of [[.82,.28,.24,'rgba(255,217,122,.267)'],[.6,.78,.28,'rgba(255,207,102,.333)']]){const glow=ctx.createRadialGradient(x*width,y*height,0,x*width,y*height,r*width);glow.addColorStop(0,color);glow.addColorStop(1,'rgba(255,217,122,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);}}
 ctx.restore();return scene;
}

export function describeWorldMap(state){
 const layers=[];
 for(const [region,threshold,id] of [['house',7,'tea-2'],['garden',13,'garden-2'],['courtyard',21,'decor-21']]){
  const [x,y]=SCENE_WORLD_COORDS[region];if(state.stage>=threshold)layers.push(makeSceneProp('map-'+region,id,x-5,y+10,region==='courtyard'?17:9,1));
  const key=state.world?.equipped?.[region],s=SCENE_SOUVENIR_LAYOUT[sceneSouvenirType(key)];if(s)layers.push(makeSceneProp('map-souvenir-'+region,s.id,x+9,y-6,8,2,{variant:key.endsWith('garden')}));
 }
 return {layers};
}
export function renderWorldOverlays(state,options={}){return renderSceneHTML({...describeWorldMap(state),background:'world-map',night:false,interactive:false},options).replace(/^<img[^>]+>/,'');}

const sceneWalkFrame=(who,t)=>`${who}-walk${Math.floor(t*9)%4+1}`;
const sceneHoldFrame=(who,t)=>`${who}-handover${Math.min(3,1+Math.floor(t*3))}`;
const getSceneActor=(scene,who)=>scene.layers.find(l=>l.who===who);
const setSceneProp=(scene,l)=>{const idx=scene.layers.findIndex(p=>p.key===l.key);if(idx>=0)scene.layers[idx]=l;else scene.layers.push(l);};
function sceneHand(scene,who,id,key,dx=-5,dy=5,w=11,rotation=0){const a=getSceneActor(scene,who);if(a)setSceneProp(scene,makeSceneProp(key,id,a.x+dx,a.y+dy,w,a.z+1,{rotation,heldBy:who,handOffset:[dx,dy]}));}
function moveSceneActor(scene,who,from,to,t,pose='walk'){
 const a=getSceneActor(scene,who);if(!a)return;
 a.x=sceneMix(from[0],to[0],sceneSmooth(t));a.y=sceneMix(from[1],to[1],sceneSmooth(t));
 a.id=pose==='walk'?sceneWalkFrame(who,t):pose==='hold'?sceneHoldFrame(who,t):`${who}-${pose}`;
 a.flip=to[0]<from[0];
}
function sceneMotionSteps(event,scene){
 const c=scene.result?.condition,region=scene.region;
 const guestStep=scene.result?.participants?.includes('xiaoli')?[{label:'小栗接过这一杯',kind:'guest-cup',duration:800}]:[];
 if((event==='homeActivity-house'&&scene.stage<7)||(event==='homeActivity-garden'&&scene.stage<13)||(event==='homeActivity-courtyard'&&scene.stage<23))return [{label:'两只熊一起整理这个角落',kind:'tidy',duration:2700}];
 if(event==='firstVisit')return [{label:'两熊让出位置，在入口迎接小栗',kind:'enter',duration:1200},{label:'一二走到桌边，摆好三只杯子',kind:'cups',duration:1200},{label:'布布拿稳茶壶，走到桌边倒茶',kind:'pour',duration:1800},{label:'一二递出杯子，小栗坐好接住',kind:'guest-cup',duration:1600}];
 if(event==='homeActivity-garden'||(event==='tea'&&scene.result?.plan==='garden'&&c!=='wind'))return [{label:'一二先扶稳小苗',kind:'support',duration:1700},{label:'布布拿水壶，慢慢浇水',kind:'water',duration:2000},{label:'放下水壶，端茶回树荫下',kind:'garden-tea',duration:1400},...guestStep];
 if(event==='tea'&&c==='wind')return [{label:'选好先压稳还是先固定一角',kind:'wind',duration:1800},{label:'另一只熊接着把茶巾夹好',kind:'clip',duration:2100},...guestStep];
 if(/^prep-/.test(event))return [{label:event.includes('22')?'把准备好的茶点摆到桌上':'把这份准备亲手放好',kind:'prep',duration:2400}];
 if(event==='homeActivity-garden-tidy'||event==='homeActivity-house-tidy'||event==='homeActivity-courtyard-tidy')return [{label:'两只熊一起整理这个角落',kind:'tidy',duration:2700}];
 return [{label:'一二走到桌边，放好杯子',kind:'cups',duration:1800},{label:'布布拿稳茶壶，走过来倒茶',kind:'pour',duration:2300},...(scene.result?.participants?.includes('xiaoli')?[{label:'小栗接过这一杯',kind:'guest-cup',duration:900}]:[])];
}

function animatedSceneFrame(base,step,t,index,{choice='anchor'}={}){
 const s=freezeScene(base),garden=s.region==='garden';
 if(!getSceneActor(s,'bubu'))s.layers.push(makeSceneActor('bubu','bubu-idle',40,60));
 if(!getSceneActor(s,'yier'))s.layers.push(makeSceneActor('yier','yier-turn',61,60));
 const bx=garden?34:43,yx=garden?57:66,tx=garden?50:66,ty=garden?77:73;
 // Tea work happens in the clear central route; temporary cloth is not a permanent unlock.
 if(['cups','pour','garden-tea','wind','clip','enter','guest-cup'].includes(step.kind))setSceneProp(s,makeSceneProp('tea-cloth','prop-tea-cloth',tx,ty,garden?37:27,9,{rotation:garden?-5:0}));
 const b=getSceneActor(s,'bubu'),y=getSceneActor(s,'yier');
 const startOf=who=>{const a=getSceneActor(base,who)||getSceneActor(s,who);return [a.x,a.y];};
 const k=step.kind;
 if(k!=='guest-cup'&&k!=='enter'){
  const guest=getSceneActor(s,'xiaoli');if(guest)guest.id='xiaoli-sit';
  s.layers=s.layers.filter(l=>l.key!=='guest-cup');
 }
 if(k==='cups'){
  s.layers=s.layers.filter(l=>!['cup-one','cup-two','cup-three'].includes(l.key));
  moveSceneActor(s,'yier',startOf('yier'),[yx,64],t,t<.7?'walk':'hold');
  if(t<.82)sceneHand(s,'yier','tea-2','cup-one',-5,6,8);else setSceneProp(s,makeSceneProp('cup-one','tea-2',tx-5,ty-2,8));
  if(t>.7)setSceneProp(s,makeSceneProp('cup-two','tea-2',tx+5,ty-1,8));
  if(t>.84&&getSceneActor(s,'xiaoli'))setSceneProp(s,makeSceneProp('cup-three','tea-2',tx+11,ty+1,7));b.id='bubu-idle';
 }else if(k==='pour'||k==='garden-tea'){
  const oldCan=base.layers.find(l=>l.key==='watering-can');
  if(oldCan){const p=sceneSmooth(sceneClamp(t/.22,0,1));setSceneProp(s,makeSceneProp('watering-can','prop-watering-can',sceneMix(oldCan.x,oldCan.x-9,p),sceneMix(oldCan.y,oldCan.y+7,p),13,10));}
  if(k==='garden-tea'){
   const staged=base.layers.find(l=>l.key==='teapot'),pickup=staged?[staged.x-6,staged.y-7]:startOf('bubu');
   if(t<.55)moveSceneActor(s,'bubu',startOf('bubu'),pickup,sceneClamp((t-.22)/.33,0,1),'walk');
   else moveSceneActor(s,'bubu',pickup,[bx,62],sceneClamp((t-.55)/.35,0,1),t<.9?'walk':'hold');
   moveSceneActor(s,'yier',startOf('yier'),[yx,64],t,t<.75?'walk':'hold');
  }else{
   const staged=base.layers.find(l=>l.key==='teapot'),pickup=staged?[staged.x-6,staged.y-7]:startOf('bubu');
   if(t<.25)moveSceneActor(s,'bubu',startOf('bubu'),pickup,t/.25,'walk');
   else moveSceneActor(s,'bubu',pickup,[bx,62],sceneClamp((t-.25)/.5,0,1),t<.75?'walk':'hold');
   y.id='yier-handover3';
  }
  if(t>=(k==='garden-tea'?.55:.25))sceneHand(s,'bubu','tea-4','teapot',6,7,12,t>.9?sceneMix(0,28,sceneSmooth((t-.9)/.1)):0);
  setSceneProp(s,makeSceneProp('cup-one','tea-2',tx-5,ty-2,8));setSceneProp(s,makeSceneProp('cup-two','tea-2',tx+5,ty-1,8));
  if(getSceneActor(s,'xiaoli'))setSceneProp(s,makeSceneProp('cup-three','tea-2',tx+11,ty+1,7));
  if(t>.82)setSceneProp(s,{key:'tea-stream',kind:'water',id:null,x:(bx+6+tx-5)/2+2,y:70,w:.65,h:7,z:16,rotation:-65});
 }else if(k==='support'||k==='water'){
  // The actual seedling is at the same position as its scene decor, never floating elsewhere.
  const seed=s.layers.find(l=>l.decorId===12),sx=seed?.x??22,sy=seed?.y??57;
  moveSceneActor(s,'yier',startOf('yier'),[sx+12,sy],t,k==='support'&&t<.72?'walk':'support2');
  y.id=t>.45||k==='water'?'yier-support2':'yier-walk'+(Math.floor(t*9)%4+1);
  if(k==='water'){
   moveSceneActor(s,'bubu',startOf('bubu'),[sx+25,sy-2],t,t<.64?'walk':'support1');
   sceneHand(s,'bubu','prop-watering-can','watering-can',-6,5,13,t>.65?-25:0);
   if(t>.7)for(let j=0;j<3;j++)setSceneProp(s,{key:'water-'+j,kind:'water',id:null,x:sx+4+j*2,y:sy-3+(t*18+j*3)%9,w:1,h:1.6,z:16,rotation:-20});
  }
 }else if(k==='wind'||k==='clip'){
  const cloth=s.layers.find(l=>l.key==='tea-cloth');cloth.x=tx+(k==='wind'?(1-t)*5*Math.sin(t*10):0);cloth.rotation=(garden?-5:0)+(k==='wind'?(1-t)*14*Math.sin(t*13):0);
  const first=choice==='clip'?'bubu':'yier',second=first==='bubu'?'yier':'bubu',who=k==='wind'?first:second;
  moveSceneActor(s,who,startOf(who),[tx+(who==='bubu'?-15:13),66],t,t<.6?'walk':'support2');
  const placingClip=(k==='wind')===(choice==='clip'),id=placingClip?'prop-clip':'prop-coaster',key=placingClip?'tea-clip':'tea-anchor';
  const corner=k==='wind'?-1:1;
  if(t<.78)sceneHand(s,who,id,key,who==='bubu'?7:-6,8,placingClip?7:9);
  else setSceneProp(s,makeSceneProp(key,id,tx+corner*12,ty+(placingClip?-1:1),placingClip?7:9,16,{rotation:placingClip?(choice==='clip'?-12:12):0}));
  if(k==='clip')getSceneActor(s,first).id=`${first}-support2`;
 }else if(k==='enter'){
  s.layers=s.layers.filter(l=>l.who!=='xiaoli'&&l.key!=='guest-cup');s.layers.push(makeSceneActor('xiaoli',t<.2?'xiaoli-wave':t>.92?'xiaoli-sit':sceneWalkFrame('xiaoli',t),sceneMix(108,79,sceneSmooth(t)),sceneMix(54,65,sceneSmooth(t)),18));
  moveSceneActor(s,'bubu',startOf('bubu'),[37,62],t,t<.75?'walk':'hold');moveSceneActor(s,'yier',startOf('yier'),[59,64],t,t<.75?'walk':'hold');
 }else if(k==='guest-cup'){
  if(!getSceneActor(s,'xiaoli'))s.layers.push(makeSceneActor('xiaoli','xiaoli-sit',garden?73:79,65,18));
  const guest=getSceneActor(s,'xiaoli');guest.id=t<.34?'xiaoli-sit':t<.8?'xiaoli-receive':'xiaoli-hold';
  moveSceneActor(s,'yier',startOf('yier'),[guest.x-14,64],t,t<.4?'walk':'hold');
  const spare=base.layers.find(l=>l.key==='cup-three'),start=getSceneActor(s,'yier');s.layers=s.layers.filter(l=>l.key!=='cup-three');
  const cupT=sceneSmooth(sceneClamp((t-.35)/.65,0,1));setSceneProp(s,makeSceneProp('guest-cup','tea-2',sceneMix(spare?.x??start.x+5,guest.x-4,cupT),sceneMix(spare?.y??start.y+6,guest.y+5,cupT),7,15));
 }else if(k==='prep'){
  const item=s.layers.filter(l=>l.key.startsWith('prep-')).at(-1);
  moveSceneActor(s,'yier',startOf('yier'),[item?sceneClamp(item.x-13,20,76):65,item?sceneClamp(item.y-12,43,70):65],t,t<.75?'walk':'hold');
  if(item&&t<.8){s.layers=s.layers.filter(l=>l.key!==item.key);sceneHand(s,'yier',item.id,item.key,7,7,Math.min(item.w,16));}
  b.id='bubu-support1';
 }else if(k==='tidy'){
  moveSceneActor(s,'bubu',startOf('bubu'),[27,65],t,t<.65?'walk':'support1');moveSceneActor(s,'yier',startOf('yier'),[47,66],t,t<.65?'walk':'support2');sceneHand(s,'bubu','clean-2','tidy-cloth',5,6,9);sceneHand(s,'yier','clean-1','tidy-sponge',-5,6,8);
 }
 for(const l of s.layers.filter(l=>l.heldBy)){const a=getSceneActor(s,l.heldBy);if(a){l.x=a.x+l.handOffset[0];l.y=a.y+l.handOffset[1];}}
 s.action={kind:k,step:index,progress:t,choice};s.caption=step.label;return s;
}

/** Two explicit steps normally make one 3–6 second sequence. advance() is the player action. */
export function createScenePlayer({event='tea',scene,onFrame=()=>{},onComplete=()=>{},onStep=()=>{},reducedMotion=false,choice='anchor',clock=()=>globalThis.performance?.now?.()??Date.now(),schedule=fn=>setTimeout(fn,80),cancel=id=>clearTimeout(id)}={}){
 const base=freezeScene(scene),steps=sceneMotionSteps(event,base);
 const initial=freezeScene(base);
 initial.layers=initial.layers.filter(l=>!['cup-one','cup-two','cup-three','guest-cup','tea-stream','tea-clip','tea-anchor'].includes(l.key)&&l.kind!=='water');
 for(const a of initial.layers.filter(l=>l.kind==='actor')){a.id=a.who==='xiaoli'?'xiaoli-sit':`${a.who}-${a.who==='bubu'?'idle':'turn'}`;}
 if(event==='firstVisit')initial.layers=initial.layers.filter(l=>l.who!=='xiaoli');
 if(steps.some(s=>s.kind==='cups'||s.kind==='garden-tea'))setSceneProp(initial,makeSceneProp('teapot','tea-4',29,65,12,10));
 let stepBase=freezeScene(initial),step=0,playing=false,timer=null,startAt=0,destroyed=false,done=false,started=false;
 const updateLabels=()=>{if(event==='tea'&&base.result?.condition==='wind'){steps[0].label=choice==='clip'?'布布先夹住茶巾的一角':'一二先把杯垫压在茶巾上';steps[1].label=choice==='clip'?'一二接着用杯垫压住另一角':'布布接着夹好另一角';}};
 updateLabels();
 const emit=(t)=>onFrame(animatedSceneFrame(stepBase,steps[step],t,step,{choice}));
 const stop=()=>{if(timer!==null)cancel(timer);timer=null;playing=false;};
 const finalScene=()=>{const end=animatedSceneFrame(stepBase,steps[step],1,step,{choice});end.layers=end.layers.filter(l=>l.kind!=='water'&&l.key!=='tea-stream');return end;};
 const finishStep=()=>{stop();stepBase=finalScene();onFrame(freezeScene(stepBase));if(step===steps.length-1){done=true;onComplete(freezeScene(stepBase));}else onStep({index:step+1,label:steps[step+1].label,waiting:true});};
 const tick=()=>{if(destroyed||!playing)return;const t=sceneClamp((clock()-startAt)/steps[step].duration,0,1);emit(t);if(t>=1)finishStep();else timer=schedule(tick);};
 function play(){if(destroyed||done||playing)return;started=true;playing=true;startAt=clock();onStep({index:step,label:steps[step].label,waiting:false});if(reducedMotion){emit(0);timer=schedule(()=>{if(!destroyed)finishStep();});}else tick();}
 return {get steps(){return steps.map(s=>({...s}));},get initialScene(){return freezeScene(initial);},start:play,advance(){if(destroyed||playing||done||!started)return;if(step<steps.length-1)step++;play();},setChoice(value){if(!started){choice=value==='clip'?'clip':'anchor';updateLabels();}},skip(){if(destroyed||done)return;stop();for(;step<steps.length;step++)stepBase=finalScene();step=steps.length-1;onFrame(freezeScene(stepBase));done=true;onComplete(freezeScene(stepBase));},replay(){if(destroyed)return;stop();step=0;stepBase=freezeScene(initial);done=false;started=false;play();},destroy(){destroyed=true;stop();},get status(){return {step,playing,done,waiting:started&&!playing&&!done};}};
}

export const SCENE_STYLES=`
.scene-layers{position:absolute;inset:0;overflow:hidden;isolation:isolate}
.scene-background{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;z-index:0}
.scene-layer{position:absolute;display:block;padding:0;border:0;background:none;min-height:0;line-height:0;transform-origin:center;will-change:transform}
.scene-layer>img,.scene-layer>svg{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}
button.scene-layer{cursor:pointer;border-radius:10px}button.scene-layer:focus-visible{outline:3px solid #678b53;outline-offset:2px}
.scene-water{background:#7cd5ef;border-radius:70% 30% 70% 30%;opacity:.85}
.scene-night-glow{position:absolute;inset:0;pointer-events:none;z-index:18;background:radial-gradient(circle at 82% 28%,#ffd97a44,transparent 22%),radial-gradient(circle at 60% 78%,#ffcf6655,transparent 25%)}
.world-canvas>.scene-layer{pointer-events:none}
`;
