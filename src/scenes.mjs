/** Shared presentation descriptors. No operation in this module changes a save or pays a reward. */
import {DECOR,REGIONS,TASKS} from './data.mjs';
import {spriteSpec,spriteContentRect,drawSprite} from './visuals.mjs';
import {ambientFrame} from './life.mjs';

const cloneSceneData=v=>JSON.parse(JSON.stringify(v));
const escapeSceneText=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sceneClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sceneMix=(a,b,t)=>a+(b-a)*t;
const sceneSmooth=t=>{t=sceneClamp(t,0,1);return t*t*(3-2*t);};
const SCENE_LAYOUT={0:{x:53,y:34,w:20},1:{x:49,y:18,w:35},4:{x:84,y:46,w:23},5:{x:84,y:72,w:24},6:{x:84,y:66,w:13},7:{x:23,y:67,w:18},9:{x:22,y:67,w:27},11:{x:82,y:22,w:22},13:{x:24,y:36,w:29},14:{x:83,y:43,w:26},15:{x:74,y:19,w:16},16:{x:82,y:91,w:19},17:{x:25,y:86,w:22},18:{x:62,y:86,w:13},19:{x:48,y:94,w:15},20:{x:50,y:22,w:54},21:{x:22,y:86,w:30},22:{x:79,y:86,w:30},23:{x:20,y:84,w:25}};
/** The displayed sprite box, not the source data's obsolete width, bounds a move. */
export function decorBounds(id){
 const d=DECOR[id];if(!Number.isInteger(id)||!d)return null;
 const w=SCENE_LAYOUT[id]?.w??d.w,h=w/1.12;
 return {minX:w/2,maxX:100-w/2,minY:h/2,maxY:100-h/2};
}
/** Shared default, drag preview and saved-layout coordinates, in scene percentages. */
export function decorPlacement(id,position){
 const d=DECOR[id];if(!Number.isInteger(id)||!d)return null;
 const p={...d,...SCENE_LAYOUT[id]},bounds=decorBounds(id);
 return {...p,h:p.w/1.12,bounds,...(position&&Number.isFinite(position.x)&&Number.isFinite(position.y)?{x:sceneClamp(position.x,bounds.minX,bounds.maxX),y:sceneClamp(position.y,bounds.minY,bounds.maxY)}:{})};
}
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
 // Current life is opt-in; historical scenes must never consult a live clock.
 const environment=options.environment&&!result&&!options.replay?cloneSceneData(options.environment):null;
 const night=Boolean(options.night??result?.night??environment?.night??false);
 const styles=cloneSceneData(options.decorStyles??result?.decorStyles??state.decorStyles??{});
 const positions=cloneSceneData(options.decorPositions??(result?(result.decorPositions??{}):stage===state.stage?(state.decorPositions??{}):{}));
 const scene={schema:1,region:info.id,name:info.name,stage,night,environment,background:info.background+(night?'-night':''),aspect:1000/1120,decorStyles:styles,decorPositions:positions,interactive:Boolean(options.interactive),layers:[],result:result?cloneSceneData(result):null};
 for(const d of DECOR.filter(d=>d.id<stage&&d.region===info.id)){
  const p=decorPlacement(d.id,positions[d.id]);scene.layers.push({key:'decor-'+d.id,kind:'decor',decorId:d.id,id:`decor-${String(d.id+1).padStart(2,'0')}`,x:p.x,y:p.y,w:p.w,h:p.h,z:p.z+1,anchor:'center',variant:styles[d.id]===1,label:TASKS[d.id]?.name||'家园布置'});
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
  if(options.ambient&&!result&&!options.poses&&!options.replay&&stage===state.stage){
   scene.ambient=ambientFrame({...state,decorPositions:positions},info.id,environment,options.now??Date.now(),scene.layers.filter(l=>l.kind==='decor'));
   scene.caption=scene.ambient.caption;scene.layers.push(...scene.ambient.actors,...scene.ambient.props);
  }else{
   const poses=options.poses||(night&&info.id==='house'?['bubu-sit','yier-rest']:['bubu-idle','yier-turn']);
   scene.layers.push(makeSceneActor('bubu',scenePoseId(poses[0]),42.5,60.5),makeSceneActor('yier',scenePoseId(poses[1]),60.5,60.5));
  }
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
 const rect=spriteContentRect(spec);
 // Build supplies dimensions for non-square generated sheets; Canvas uses source pixels directly.
 const dims=globalThis.window?.__ASSET_SIZES__?.[spec.asset];
 const ratio=dims?((dims[0]/spec.cols)/(dims[1]/spec.rows)):spec.slotAspect||1;
 const crop=`${rect.x*100*ratio} ${rect.y*100} ${rect.w*100*ratio} ${rect.h*100}`;
 return `<svg viewBox="${crop}" preserveAspectRatio="${spec.grounded?'xMidYMax':'xMidYMid'} meet" overflow="hidden" aria-hidden="true"><svg x="${rect.x*100*ratio}" y="${rect.y*100}" width="${rect.w*100*ratio}" height="${rect.h*100}" viewBox="${crop}" preserveAspectRatio="none" overflow="hidden"><image href="${escapeSceneText(url(spec.asset))}" x="${-spec.col*100*ratio}" y="${-spec.row*100}" width="${spec.cols*100*ratio}" height="${spec.rows*100}" preserveAspectRatio="none"/></svg></svg>`;
}
function sceneLayerStyle(l,scene){return `left:${l.x}%;top:${l.y}%;width:${l.w}%;height:${l.h}%;z-index:${l.z};transform:translate(-50%,-50%) rotate(${l.rotation||0}deg)${l.flip?' scaleX(-1)':''};filter:${l.kind==='actor'?'none':[l.variant?'hue-rotate(24deg) saturate(.85)':'',scene.night?'brightness(.84)':''].filter(Boolean).join(' ')||'none'}`;}
function sceneBackgroundFilter(scene){
 // Night has independent painted art; keep its moonlight and warm windows intact.
 if(scene.night)return 'none';
 const phase=scene.environment?.phase,weather=scene.environment?.weather;
 return [phase==='dusk'?'sepia(.23) brightness(.9)':phase==='morning'?'sepia(.09) brightness(1.03)':'',weather==='rain'?'brightness(.88) saturate(.78)':weather==='cloudy'?'brightness(.94) saturate(.87)':''].filter(Boolean).join(' ')||'none';
}
function sceneFireflies(scene){
 if(!scene.night||scene.environment?.weather==='rain')return [];
 return scene.region==='house'?[[12,62],[34,74],[62,69],[83,83]]:[[7,24],[92,27],[5,43],[95,57],[9,70],[88,77],[13,88],[83,92]];
}
function sceneWeatherHTML(scene){
 const weather=scene.environment?.weather;
 const particles=weather==='rain'?Array.from({length:16},(_,i)=>`<i style="left:${(i*17+5)%100}%;top:${(i*23)%100}%;animation-delay:-${(i*.19).toFixed(2)}s"></i>`).join(''):weather==='wind'?'<i></i><i></i><i></i>':weather==='cloudy'?'<i></i><i></i>':'';
 const fireflies=sceneFireflies(scene).map(([x,y],i)=>`<i style="left:${x}%;top:${y}%;animation-delay:-${i*.7}s;animation-duration:${5+i%3}s"></i>`).join('');
 return `${weather?`<div class="scene-weather scene-weather-${weather} ${scene.region==='house'?'scene-weather-window':''}" aria-hidden="true">${particles}</div>`:''}${['morning','dusk'].includes(scene.environment?.phase)?`<div class="scene-time-tint scene-time-${scene.environment.phase}" aria-hidden="true"></div>`:''}${fireflies?`<div class="scene-weather scene-weather-fireflies ${scene.region==='house'?'scene-weather-window':''}" aria-hidden="true">${fireflies}</div>`:''}`;
}
export function renderSceneHTML(scene,{assetURL=id=>`assets/${id}.png`,interactive=scene.interactive}={}){
 const layers=scene.layers.map(l=>{
  const click=interactive&&['decor','actor','souvenir'].includes(l.kind),tag=click?'button':'div';
  const action=l.kind==='decor'?`data-action="furniture" data-id="${l.decorId}"`:l.kind==='actor'?`data-action="chat" data-who="${l.who}"`:`data-action="souvenirReplay" data-key="${escapeSceneText(l.souvenirKey)}"`;
  return `<${tag} class="scene-layer scene-${l.kind} ${l.who||''}" data-scene-layer="${escapeSceneText(l.key)}" data-sprite="${escapeSceneText(l.id)}" style="${sceneLayerStyle(l,scene)}" ${click?`${action} aria-label="${escapeSceneText(l.label)}"`: 'aria-hidden="true"'}>${l.id?sceneSpriteHTML(l.id,assetURL):l.glyph?escapeSceneText(l.glyph):''}</${tag}>`;
 }).join('');
 return `<img class="scene-background" src="${escapeSceneText(assetURL(scene.background))}" alt="" draggable="false" style="filter:${sceneBackgroundFilter(scene)}">${layers}${sceneWeatherHTML(scene)}`;
}

/** Snapshot before awaiting any image. Photos cannot drift to a new region/tea round. */
export async function drawSceneCanvas(ctx,input,{loadImage,width=1000,height=1120}={}){
 if(typeof loadImage!=='function')throw new TypeError('drawSceneCanvas requires loadImage(assetId)');
 const scene=freezeScene(input);
 const ids=[...new Set([scene.background,...scene.layers.filter(l=>l.id).map(l=>spriteSpec(l.id)?.asset||l.id)])];
 const images=new Map(await Promise.all(ids.map(async id=>[id,await loadImage(id)])));
 ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();ctx.filter=sceneBackgroundFilter(scene);ctx.drawImage(images.get(scene.background),0,0,width,height);ctx.filter='none';
 for(const l of [...scene.layers].sort((a,b)=>a.z-b.z)){
  ctx.save();ctx.translate(l.x/100*width,l.y/100*height);ctx.rotate((l.rotation||0)*Math.PI/180);if(l.flip)ctx.scale(-1,1);
  ctx.filter=l.kind==='actor'?'none':[l.variant?'hue-rotate(24deg) saturate(.85)':'',scene.night?'brightness(.84)':''].filter(Boolean).join(' ')||'none';
  const w=l.w/100*width,h=l.h/100*height;
  if(l.kind==='water'){ctx.fillStyle='#7cd5ef';ctx.beginPath();ctx.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);ctx.fill();}
  else if(l.glyph){ctx.fillStyle='#e37e98';ctx.font=`${h}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(l.glyph,0,0);}
  else drawSprite(ctx,images.get(spriteSpec(l.id)?.asset||l.id),spriteSpec(l.id),-w/2,-h/2,w,h);ctx.restore();
 }
 if(scene.environment){
  const {weather,phase}=scene.environment;
  if(phase==='morning'||phase==='dusk'){ctx.fillStyle=phase==='dusk'?'rgba(235,149,104,.16)':'rgba(255,224,155,.07)';ctx.fillRect(0,0,width,height);}
  ctx.save();if(scene.region==='house'){ctx.beginPath();ctx.rect(width*.34,height*.06,width*.32,height*.28);ctx.clip();}
  if(weather==='rain'){
   ctx.strokeStyle='rgba(157,200,223,.8)';ctx.lineWidth=width*.002;
   for(let i=0;i<36;i++){const x=((i*17+5)%100)/100*width,y=((i*23)%100)/100*height;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-width*.009,y+height*.035);ctx.stroke();}
  }else if(weather==='wind'){
   ctx.strokeStyle='rgba(224,241,230,.75)';ctx.lineWidth=width*.002;
   for(const [x,y] of [[.1,.17],[.48,.36],[.73,.22]]){ctx.beginPath();ctx.moveTo(x*width,y*height);ctx.bezierCurveTo((x+.08)*width,(y-.02)*height,(x+.14)*width,(y+.02)*height,(x+.23)*width,y*height);ctx.stroke();}
  }else if(weather==='cloudy'){ctx.fillStyle='rgba(211,218,225,.18)';ctx.fillRect(0,0,width,height*.4);}
  ctx.restore();
 }
 // Export a still of the same fireflies, in the same window/edge coordinates.
 for(const [x,y] of sceneFireflies(scene)){
  const px=(scene.region==='house'?.34+x*.0032:x/100)*width,py=(scene.region==='house'?.06+y*.0028:y/100)*height;
  const glow=ctx.createRadialGradient(px,py,0,px,py,width*.009);glow.addColorStop(0,'rgba(246,255,157,.88)');glow.addColorStop(1,'rgba(225,255,116,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(px,py,width*.009,0,Math.PI*2);ctx.fill();
 }
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
function sceneHand(scene,who,id,key,dx=6,dy=5,w=11,rotation=0,extra={}){const a=getSceneActor(scene,who);if(a){dx*=a.flip?-1:1;setSceneProp(scene,makeSceneProp(key,id,a.x+dx,a.y+dy,w,a.z+1,{rotation,heldBy:who,handOffset:[dx,dy],...extra}));}}
function sceneFace(scene,who,x){const a=getSceneActor(scene,who);if(a&&Math.abs(x-a.x)>.05)a.flip=who==='xiaoli'?x>a.x:x<a.x;}
// The walk reaches its destination before an interaction pose begins.
function sceneApproach(scene,who,from,to,t,until,pose='hold',targetX=to[0]){
 moveSceneActor(scene,who,from,to,sceneClamp(t/until,0,1),t<until?'walk':pose);
 if(t>=until)sceneFace(scene,who,targetX);
}
function scenePlace(scene,key,from,to,t){
 const p=sceneSmooth(sceneClamp(t,0,1));setSceneProp(scene,makeSceneProp(key,from.id,sceneMix(from.x,to.x,p),sceneMix(from.y,to.y,p),from.w,to.z??from.z,{rotation:sceneMix(from.rotation||0,to.rotation||0,p),flip:from.flip||false}));
}
// A stream joins the rotated spout to the actual receiving object.
function sceneStream(scene,key,from,to,w=.6){
 const dx=(to.x-from.x)*scene.aspect,dy=to.y-from.y;
 setSceneProp(scene,{key,kind:'water',id:null,x:(from.x+to.x)/2,y:(from.y+to.y)/2,w,h:Math.hypot(dx,dy),z:16,rotation:Math.atan2(-dx,dy)*180/Math.PI});
}
function sceneSpout(prop,aspect){const dx=(prop.flip?1:-1)*prop.w*.36*aspect,dy=-prop.h*.12,angle=(prop.rotation||0)*Math.PI/180;return {x:prop.x+(dx*Math.cos(angle)-dy*Math.sin(angle))/aspect,y:prop.y+dx*Math.sin(angle)+dy*Math.cos(angle)};}
function moveSceneActor(scene,who,from,to,t,pose='walk'){
 const a=getSceneActor(scene,who);if(!a)return;
 a.x=sceneMix(from[0],to[0],sceneSmooth(t));a.y=sceneMix(from[1],to[1],sceneSmooth(t));
 a.id=pose==='walk'?sceneWalkFrame(who,t):pose==='hold'?sceneHoldFrame(who,t):`${who}-${pose}`;
 if(Math.abs(to[0]-from[0])>.05)a.flip=who==='xiaoli'?to[0]>from[0]:to[0]<from[0];
}
function sceneMotionSteps(event,scene){
 const c=scene.result?.condition,region=scene.region;
 const guestStep=scene.result?.participants?.includes('xiaoli')?[{label:'小栗接过这一杯',kind:'guest-cup',duration:800}]:[];
 if(event==='firstVisit')return [{label:'两熊让出位置，在入口迎接小栗',kind:'enter',duration:1200},{label:'一二走到桌边，摆好三只杯子',kind:'cups',duration:1200},{label:'布布拿稳茶壶，走到桌边倒茶',kind:'pour',duration:1800},{label:'一二递出杯子，小栗坐好接住',kind:'guest-cup',duration:1600}];
 if(event==='tea'&&scene.result?.plan==='garden'&&c!=='wind')return [{label:'一二先扶稳小苗',kind:'support',duration:1700},{label:'布布拿水壶，慢慢浇水',kind:'water',duration:2000},{label:'放下水壶，端茶回树荫下',kind:'garden-tea',duration:1400},...guestStep];
 if(event==='tea'&&c==='wind')return [{label:'选好先压稳还是先固定一角',kind:'wind',duration:1800},{label:'另一只熊接着把茶巾夹好',kind:'clip',duration:2100},...guestStep];
 if(/^prep-/.test(event))return [{label:event.includes('22')?'把准备好的茶点摆到桌上':'把这份准备亲手放好',kind:'prep',duration:2400}];
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
  sceneApproach(s,'yier',startOf('yier'),[yx,64],t,.55,'hold',tx);
  sceneHand(s,'yier','tea-2','cup-one',6,6,8);
  if(t>=.62){const held=s.layers.find(l=>l.key==='cup-one');scenePlace(s,'cup-one',held,{x:tx-5,y:ty-2,z:14},(t-.62)/.26);}
  if(t>=.88)setSceneProp(s,makeSceneProp('cup-two','tea-2',tx+5,ty-1,8));
  if(t>=.94&&getSceneActor(s,'xiaoli'))setSceneProp(s,makeSceneProp('cup-three','tea-2',tx+11,ty+1,7));b.id='bubu-idle';
 }else if(k==='pour'||k==='garden-tea'){
  const oldCan=base.layers.find(l=>l.key==='watering-can');
  if(oldCan)scenePlace(s,'watering-can',oldCan,{x:oldCan.x-9,y:oldCan.y+7,z:10,rotation:0},t/.2);
  const staged=base.layers.find(l=>l.key==='teapot'),pickup=staged?[staged.x-6,staged.y-7]:startOf('bubu');
  const pickEnd=k==='garden-tea'?.38:.2,moveEnd=k==='garden-tea'?.78:.62;
  if(t<pickEnd)moveSceneActor(s,'bubu',startOf('bubu'),pickup,t/pickEnd,'walk');
  else sceneApproach(s,'bubu',pickup,[bx,62],(t-pickEnd)/(1-pickEnd),(moveEnd-pickEnd)/(1-pickEnd),'hold',tx-5);
  if(k==='garden-tea')sceneApproach(s,'yier',startOf('yier'),[yx,64],t,.65,'hold',tx);
  else {y.id='yier-handover3';sceneFace(s,'yier',tx);}
  if(t>=pickEnd){
   const tiltStart=moveEnd,tilt=sceneSmooth(sceneClamp((t-tiltStart)/.14,0,1));
   // Both original kettle sheets have a left-facing spout.
   const right=tx-5>b.x;sceneHand(s,'bubu','tea-4','teapot',6,7,12,(right?28:-28)*tilt,{flip:right});
  }
  setSceneProp(s,makeSceneProp('cup-one','tea-2',tx-5,ty-2,8));setSceneProp(s,makeSceneProp('cup-two','tea-2',tx+5,ty-1,8));
  if(getSceneActor(s,'xiaoli'))setSceneProp(s,makeSceneProp('cup-three','tea-2',tx+11,ty+1,7));
  const pot=s.layers.find(l=>l.key==='teapot');
  if(t>=moveEnd+.14&&pot)sceneStream(s,'tea-stream',sceneSpout(pot,s.aspect),{x:tx-5,y:ty-3});
 }else if(k==='support'||k==='water'){
  // Follow the actual saved seedling, including after a furniture drag.
  const seed=s.layers.find(l=>l.decorId===12),sx=seed?.x??22,sy=seed?.y??57,side=sx>60?-1:1;
  sceneApproach(s,'yier',startOf('yier'),[sceneClamp(sx+12*side,11,89),sceneClamp(sy,14,86)],t,k==='support'?.6:.25,'support2',sx);
  if(k==='support')sceneApproach(s,'bubu',startOf('bubu'),[sceneClamp(sx+34*side,11,89),sceneClamp(sy-2,14,86)],t,.6,'hold',sx);
  if(k==='water'){
   sceneApproach(s,'bubu',startOf('bubu'),[sceneClamp(sx+34*side,11,89),sceneClamp(sy-2,14,86)],t,.6,'support1',sx);
   const tilt=sceneSmooth(sceneClamp((t-.6)/.16,0,1)),right=sx>b.x;
   sceneHand(s,'bubu','prop-watering-can','watering-can',6*side*(b.flip?1:-1),5,13,(right?25:-25)*tilt,{flip:right});
   if(t>=.76){const can=s.layers.find(l=>l.key==='watering-can');sceneStream(s,'water-stream',sceneSpout(can,s.aspect),{x:sx,y:sy+2},.55);}
  }
 }else if(k==='wind'||k==='clip'){
  const cloth=s.layers.find(l=>l.key==='tea-cloth');cloth.x=tx+(k==='wind'?(1-t)*5*Math.sin(t*10):0);cloth.rotation=(garden?-5:0)+(k==='wind'?(1-t)*14*Math.sin(t*13):0);
  const first=choice==='clip'?'bubu':'yier',second=first==='bubu'?'yier':'bubu',who=k==='wind'?first:second;
  sceneApproach(s,who,startOf(who),[tx+(who==='bubu'?-22:-3),66],t,.55,'support2',tx);
  const placingClip=(k==='wind')===(choice==='clip'),id=placingClip?'prop-clip':'prop-coaster',key=placingClip?'tea-clip':'tea-anchor';
  const corner=k==='wind'?-1:1;
  sceneHand(s,who,id,key,7,8,placingClip?7:9);
  if(t>=.62){const held=s.layers.find(l=>l.key===key);scenePlace(s,key,held,{x:tx+corner*12,y:ty+(placingClip?-1:1),z:16,rotation:placingClip?(choice==='clip'?-12:12):0},(t-.62)/.32);}
  if(k==='clip')getSceneActor(s,first).id=`${first}-support2`;
 }else if(k==='enter'){
  s.layers=s.layers.filter(l=>l.who!=='xiaoli'&&l.key!=='guest-cup');s.layers.push(makeSceneActor('xiaoli',t>=.86?'xiaoli-sit':sceneWalkFrame('xiaoli',t),sceneMix(108,79,sceneSmooth(sceneClamp(t/.86,0,1))),sceneMix(54,65,sceneSmooth(sceneClamp(t/.86,0,1))),18));
  getSceneActor(s,'xiaoli').flip=false;
  sceneApproach(s,'bubu',startOf('bubu'),[37,62],t,.75,'hold',79);sceneApproach(s,'yier',startOf('yier'),[59,64],t,.75,'hold',79);
 }else if(k==='guest-cup'){
  if(!getSceneActor(s,'xiaoli'))s.layers.push(makeSceneActor('xiaoli','xiaoli-sit',garden?73:79,65,18));
  const guest=getSceneActor(s,'xiaoli');guest.id=t<.62?'xiaoli-sit':t<.9?'xiaoli-receive':'xiaoli-hold';sceneFace(s,'xiaoli',guest.x-14);
  const spare=base.layers.find(l=>l.key==='cup-three'),pickup=spare?[spare.x-6,spare.y-6]:startOf('yier');
  if(t<.28)moveSceneActor(s,'yier',startOf('yier'),pickup,t/.28,'walk');
  else sceneApproach(s,'yier',pickup,[guest.x-14,64],(t-.28)/.72,.34/.72,'hold',guest.x);
  if(t>=.28){sceneFace(s,'yier',guest.x);s.layers=s.layers.filter(l=>l.key!=='cup-three');sceneHand(s,'yier','tea-2','guest-cup',6,6,7);
   if(t>=.62){const held=s.layers.find(l=>l.key==='guest-cup');scenePlace(s,'guest-cup',held,{x:guest.x-4,y:guest.y+5,z:15},(t-.62)/.28);}}
 }else if(k==='prep'){
  const item=s.layers.filter(l=>l.key.startsWith('prep-')).at(-1);
  sceneApproach(s,'yier',startOf('yier'),[item?sceneClamp(item.x-13,20,76):65,item?sceneClamp(item.y-12,43,70):65],t,.65,'hold',item?.x??75);
  if(item){s.layers=s.layers.filter(l=>l.key!==item.key);sceneHand(s,'yier',item.id,item.key,7,7,item.w);
   if(t>=.7){const held=s.layers.find(l=>l.key===item.key);scenePlace(s,item.key,held,item,(t-.7)/.25);}}
  b.id='bubu-support1';
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
 let stepBase=freezeScene(initial),step=0,playing=false,paused=false,elapsed=0,timer=null,startAt=0,destroyed=false,done=false,started=false;
 const updateLabels=()=>{if(event==='tea'&&base.result?.condition==='wind'){steps[0].label=choice==='clip'?'布布先夹住茶巾的一角':'一二先把杯垫压在茶巾上';steps[1].label=choice==='clip'?'一二接着用杯垫压住另一角':'布布接着夹好另一角';}};
 updateLabels();
 const emit=(t)=>onFrame(animatedSceneFrame(stepBase,steps[step],t,step,{choice}));
 const stop=()=>{if(timer!==null)cancel(timer);timer=null;playing=false;};
 const finalScene=()=>{const end=animatedSceneFrame(stepBase,steps[step],1,step,{choice});end.layers=end.layers.filter(l=>l.kind!=='water'&&l.key!=='tea-stream');return end;};
 const finishStep=()=>{stop();paused=false;elapsed=0;stepBase=finalScene();onFrame(freezeScene(stepBase));if(step===steps.length-1){done=true;onComplete(freezeScene(stepBase));}else onStep({index:step+1,label:steps[step+1].label,waiting:true});};
 const tick=()=>{if(destroyed||!playing)return;const t=sceneClamp((clock()-startAt)/steps[step].duration,0,1);emit(t);if(t>=1)finishStep();else timer=schedule(tick);};
 function play(resuming=false){if(destroyed||done||playing||paused&&!resuming)return;started=true;playing=true;paused=false;if(!resuming)elapsed=0;startAt=clock()-elapsed;onStep({index:step,label:steps[step].label,waiting:false});if(reducedMotion){emit(0);timer=schedule(()=>{if(!destroyed&&playing)finishStep();});}else tick();}
 return {get steps(){return steps.map(s=>({...s}));},get initialScene(){return freezeScene(initial);},start:()=>play(),advance(){if(destroyed||playing||paused||done||!started)return;if(step<steps.length-1)step++;play();},pause(){if(destroyed||done||!playing)return;elapsed=sceneClamp(clock()-startAt,0,steps[step].duration);stop();paused=true;},resume(){if(paused&&!destroyed&&!done)play(true);},setChoice(value){if(!started){choice=value==='clip'?'clip':'anchor';updateLabels();}},skip(){if(destroyed||done)return;stop();paused=false;for(;step<steps.length;step++)stepBase=finalScene();step=steps.length-1;onFrame(freezeScene(stepBase));done=true;onComplete(freezeScene(stepBase));},replay(){if(destroyed)return;stop();paused=false;elapsed=0;step=0;stepBase=freezeScene(initial);done=false;started=false;play();},destroy(){destroyed=true;paused=false;stop();},get status(){return {step,playing,paused,done,waiting:started&&!playing&&!paused&&!done};}};
}

export const SCENE_STYLES=`
.scene-layers{position:absolute;inset:0;overflow:hidden;isolation:isolate}
.scene-background{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;z-index:0}
.scene-layer{position:absolute;display:block;padding:0;border:0;background:none;min-height:0;line-height:0;transform-origin:center;will-change:transform}
.scene-layer>img,.scene-layer>svg{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}
button.scene-layer{cursor:pointer;border-radius:10px}button.scene-layer:focus-visible{outline:3px solid #678b53;outline-offset:2px}
.scene-water{background:#7cd5ef;border-radius:70% 30% 70% 30%;opacity:.85}
.scene-weather-fireflies>i{position:absolute;width:4px;height:4px;border-radius:50%;background:#f5ff9e;box-shadow:0 0 5px 2px #dcff7b88;animation:scene-firefly-drift 6s ease-in-out infinite}
@keyframes scene-firefly-drift{0%,100%{opacity:.2;transform:translate(0,0)}35%{opacity:.9;transform:translate(6px,-10px)}70%{opacity:.45;transform:translate(-4px,-5px)}}
.world-canvas>.scene-layer{pointer-events:none}
.scene-weather{position:absolute;inset:0;z-index:17;pointer-events:none;overflow:hidden}.scene-weather-window{inset:6% 34% 66% 34%;border-radius:10%}
.scene-weather-rain>i{position:absolute;width:2px;height:5%;background:#a9ccdfb0;border-radius:50%;animation:scene-rain-fall 1.3s linear infinite}
.scene-weather-wind>i{position:absolute;top:20%;left:-30%;width:24%;height:3%;border-top:2px solid #e0f1e5b0;border-radius:50%;animation:scene-wind-blow 5s linear infinite}.scene-weather-wind>i:nth-child(2){top:35%;animation-delay:-2s}.scene-weather-wind>i:nth-child(3){top:14%;animation-delay:-3.5s}
.scene-weather-cloudy{background:linear-gradient(#b2c5cf33,transparent 48%)}.scene-weather-cloudy>i{position:absolute;width:65%;height:12%;left:-15%;top:5%;background:#e1e4e63d;border-radius:50%;filter:blur(8px);animation:scene-cloud-drift 30s ease-in-out infinite alternate}.scene-weather-cloudy>i:nth-child(2){left:48%;top:12%;animation-delay:-10s}
.scene-time-tint{position:absolute;inset:0;z-index:17;pointer-events:none}.scene-time-morning{background:#ffe09b12}.scene-time-dusk{background:#eb956829}
.scene-ambient-effect{display:flex;align-items:center;justify-content:center;color:#e37e98;font-size:clamp(18px,5vw,30px);line-height:1;pointer-events:none;animation:scene-heart-breathe 2s ease-in-out infinite}
@keyframes scene-rain-fall{from{translate:0 -80%}to{translate:-20px 500%}}@keyframes scene-wind-blow{from{translate:0 0;opacity:0}20%{opacity:1}80%{opacity:1}to{translate:600% 0;opacity:0}}@keyframes scene-cloud-drift{to{translate:24% 0}}@keyframes scene-heart-breathe{50%{opacity:.6;scale:1.12}}
@media(prefers-reduced-motion:reduce){.scene-weather>i,.scene-ambient-effect{animation:none}}
`;
