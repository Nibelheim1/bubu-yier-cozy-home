import {ACTOR_ACTIONS} from './actor-actions.mjs';

const RESIDENT_WHO=['bubu','yier'],RESIDENT_REGIONS=['house','garden','courtyard'];
const residentClamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const RESIDENT_BASE_HEIGHT=22/1.12*1.2;
// The rounded body excludes GIF props and transparent margins. A one-point overlap is allowed.
export const RESIDENT_BOUNDARY=Object.freeze({x:21,y:RESIDENT_BASE_HEIGHT*.9});
const RESIDENT_PAIR_DISTANCE=29;
const residentDistance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const freshResidents=()=>({bubu:{region:'house',x:28,y:65},yier:{region:'house',x:74,y:70}});
export function validResidents(value){
 return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===2&&RESIDENT_WHO.every(who=>{
  const r=value[who];return !!r&&typeof r==='object'&&!Array.isArray(r)&&Object.keys(r).length===3&&Object.keys(r).every(k=>['region','x','y'].includes(k))&&RESIDENT_REGIONS.includes(r.region)&&Number.isFinite(r.x)&&r.x>=8&&r.x<=92&&Number.isFinite(r.y)&&r.y>=12&&r.y<=88;
 });
}

export const RESIDENT_EXITS=[
 {id:'house-door',region:'house',x:8,y:34,rx:11,ry:10,destination:'courtyard',spawn:{x:49,y:37},label:'去庭院'},
 {id:'courtyard-house',region:'courtyard',x:49,y:23,rx:11,ry:10,destination:'house',spawn:{x:19,y:51},label:'进小屋'},
 {id:'courtyard-garden',region:'courtyard',x:88,y:43,rx:11,ry:10,destination:'garden',spawn:{x:82,y:40},label:'去花园'},
 {id:'garden-gate',region:'garden',x:92,y:27,rx:11,ry:10,destination:'courtyard',spawn:{x:77,y:48},label:'去庭院'},
];
export function residentExitAt(region,x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;
 return RESIDENT_EXITS.find(e=>e.region===region&&((x-e.x)/e.rx)**2+((y-e.y)/e.ry)**2<=1)||null;
}

/** Only region/x/y are persistent. Runtime clocks advance once per tick, never per render. */
export class ResidentController{
 constructor(residents,{random=Math.random,clock=Date.now}={}){
  if(!validResidents(residents))throw Error('角色位置记录无效。');
  this.residents=residents;this.random=random;this.clock=clock;this.lastAt=clock();this.elapsed=0;this.pair=null;this.pairCooldown=0;this.pairBag=[];this.reducedMotion=false;
  this.runtime=Object.fromEntries(RESIDENT_WHO.map(who=>[who,{mode:'idle',action:null,remaining:2800+this.roll()*3500,target:null,flip:false,dragOrigin:null,bags:{},doorCooldown:0,journeyRegion:null}]));
  this.separate('yier');
 }
 separate(who){
  const r=this.residents[who],peer=this.residents[who==='bubu'?'yier':'bubu'];
  if(r.region!==peer.region)return false;
  const dx=r.x-peer.x,dy=r.y-peer.y,b=RESIDENT_BOUNDARY,scaled=Math.hypot(dx/b.x,dy/b.y);
  if(scaled>=1-1e-9)return false;
  // Keep the other bear still, including during a drag. At an edge choose a valid alternative.
  const candidates=[{x:peer.x+b.x,y:peer.y},{x:peer.x-b.x,y:peer.y},{x:peer.x,y:peer.y+b.y},{x:peer.x,y:peer.y-b.y}];
  if(scaled>1e-9)candidates.unshift({x:peer.x+dx/scaled,y:peer.y+dy/scaled});
  const valid=candidates.filter(p=>p.x>=8&&p.x<=92&&p.y>=12&&p.y<=88);
  valid.sort((a,b)=>residentDistance(a,r)-residentDistance(b,r));
  Object.assign(r,valid[0]);return true;
 }
 roll(){const value=this.random();return Number.isFinite(value)?residentClamp(value,0,.999999999):.5;}
 shuffle(values){const list=[...values];for(let i=list.length-1;i>0;i--){const j=Math.floor(this.roll()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
 stopPair(){
  if(!this.pair)return;
  this.pair=null;this.pairCooldown=12000;
  for(const who of RESIDENT_WHO){const rt=this.runtime[who];if(rt.mode!=='drag'){rt.mode='idle';rt.action=null;rt.target=null;rt.remaining=1500+this.roll()*1300;}}
  this.separate('yier');
 }
 wait(who,remaining=1500){const r=this.runtime[who];r.mode='idle';r.action=null;r.target=null;r.remaining=remaining;}
 chooseAction(who,decor){
  const resident=this.residents[who],rt=this.runtime[who];
  if(who==='yier'&&resident.region!==this.residents.bubu.region&&this.roll()<.7)return ACTOR_ACTIONS.find(a=>a.kind==='search');
  const region=resident.region;
  if(!rt.bags[region]?.length)rt.bags[region]=this.shuffle(ACTOR_ACTIONS.filter(a=>a.who===who&&a.kind==='random'&&a.regions.includes(region)));
  const bag=rt.bags[region];
  // Nearby furniture changes which remaining action plays first, never removes an action.
  const near=(decor||[]).filter(d=>Number.isFinite(d.x)&&Number.isFinite(d.y)&&residentDistance(resident,d)<24).map(d=>typeof d.id==='string'&&d.id.startsWith('decor-')?d.id:`decor-${String((d.decorId??d.id)+1).padStart(2,'0')}`);
  const anchored=bag.findIndex(a=>a.furnitureIds?.some(id=>near.includes(id)));
  return bag.splice(anchored>=0&&this.roll()<.6?anchored:0,1)[0]||null;
 }
 startNext(who,decor){
  const r=this.residents[who],rt=this.runtime[who];
  if(this.roll()<.45){
   const minY=r.region==='house'?52:45;
   const other=who==='bubu'?'yier':'bubu',peer=this.residents[other],peerRuntime=this.runtime[other],apart=peer.region!==r.region;
   // One bear leads a reunion journey; the other waits rather than crossing past it.
   const peerComing=apart&&peerRuntime.journeyRegion===r.region;
   let door=null;
   if(rt.doorCooldown<=0&&!peerComing&&this.roll()<(apart?.75:.3)){
    const exits=RESIDENT_EXITS.filter(e=>e.region===r.region);
    door=apart?(exits.find(e=>e.destination===peer.region)||exits.find(e=>e.destination==='courtyard')):exits[Math.floor(this.roll()*exits.length)];
   }
   rt.journeyRegion=apart&&(door||rt.doorCooldown>0)?peer.region:null;
   rt.target=door?{x:door.x,y:door.y}:{x:18+this.roll()*66,y:minY+this.roll()*(80-minY)};rt.flip=rt.target.x<r.x;rt.mode='walk';rt.action=null;rt.remaining=0;
  }else{
   const action=this.chooseAction(who,decor);
   if(!action){this.wait(who,3000);return;}
   rt.mode='action';rt.action=action;rt.target=null;rt.remaining=Math.max(2600,Math.min(6500,action.durationMs*2));
  }
 }
 tryPair(){
  if(this.pair||this.pairCooldown>0)return;
  const [a,b]=RESIDENT_WHO.map(w=>this.residents[w]);
  if(a.region!==b.region||residentDistance(a,b)>=RESIDENT_PAIR_DISTANCE||RESIDENT_WHO.some(w=>!['idle','walk'].includes(this.runtime[w].mode))||this.roll()>=.35)return;
  const eligible=ACTOR_ACTIONS.filter(a=>a.kind==='interaction'&&a.regions.includes(this.residents.bubu.region));
  this.pairBag=this.pairBag.filter(a=>eligible.includes(a));if(!this.pairBag.length)this.pairBag=this.shuffle(eligible);
  this.pair={action:this.pairBag.shift(),region:a.region,remaining:5000};
  for(const who of RESIDENT_WHO){this.runtime[who].target=null;this.runtime[who].mode='pair';}
 }
 tick(now=this.clock(),{paused=false,reducedMotion=false,decorByRegion={}}={}){
  if(!Number.isFinite(now))return;
  const delta=residentClamp(now-this.lastAt,0,500);this.lastAt=now;
  this.reducedMotion=Boolean(reducedMotion);
  if(paused||reducedMotion)return;
  this.elapsed+=delta;this.pairCooldown=Math.max(0,this.pairCooldown-delta);
  if(this.pair){
   const [a,b]=RESIDENT_WHO.map(w=>this.residents[w]);
   this.pair.remaining-=delta;
   if(a.region!==b.region||a.region!==this.pair.region||residentDistance(a,b)>=RESIDENT_PAIR_DISTANCE||this.pair.remaining<=0)this.stopPair();
   else return;
  }
  for(const who of RESIDENT_WHO){
   const rt=this.runtime[who],r=this.residents[who];rt.doorCooldown=Math.max(0,rt.doorCooldown-delta);if(rt.mode==='drag')continue;
   if(rt.mode==='walk'){
    const d=residentDistance(r,rt.target),step=delta*.0085;
    if(d<=step){r.x=rt.target.x;r.y=rt.target.y;this.wait(who,1600+this.roll()*2600);}
    else if(d>0){r.x+=(rt.target.x-r.x)*step/d;r.y+=(rt.target.y-r.y)*step/d;}
    if(this.separate(who))this.wait(who,800+this.roll()*1200);
    const door=rt.doorCooldown<=0?residentExitAt(r.region,r.x,r.y):null;
    if(door){const journey=rt.journeyRegion;this.transfer(who,door.destination,door.spawn.x,door.spawn.y,now);rt.journeyRegion=journey===door.destination?null:journey;this.wait(who,4000+this.roll()*2000);}
   }else{
    rt.remaining-=delta;
    if(rt.remaining<=0){if(rt.mode==='action')this.wait(who,1400+this.roll()*2400);else this.startNext(who,decorByRegion[r.region]);}
   }
  }
  this.tryPair();
 }
 state(who){
  if(!RESIDENT_WHO.includes(who))return null;
  const r=this.residents[who],rt=this.runtime[who];
  return Object.freeze({...r,mode:rt.mode,dragging:rt.mode==='drag',action:rt.action?.id||this.pair?.action.id||null,id:rt.action?.asset||null,remaining:rt.remaining,pair:!!this.pair,target:rt.target?Object.freeze({...rt.target}):null});
 }
 frame(region,now=this.clock()){
  const present=RESIDENT_WHO.filter(w=>this.residents[w].region===region);
  const actor=(who,id,x,y,w,h,extra={})=>({key:who,kind:'actor',who,id,x,y,w,h,z:12,anchor:'center',rotation:0,flip:false,label:who==='bubu'?'布布':'一二',...extra});
  if(!this.reducedMotion&&this.pair&&this.pair.region===region){
   const a=this.residents.bubu,b=this.residents.yier,action=this.pair.action,w=38,h=w/1.12*(action.height/action.width),x=(a.x+b.x)/2,feet=(a.y+b.y)/2+RESIDENT_BASE_HEIGHT/2,y=feet-h/2;
   const stacked=action.asset==='actor-motion-pair-bonk';
   const handles=RESIDENT_WHO.map((who,i)=>stacked
    ?actor(who,null,x,y+(i?-1:1)*h/4,w,h/2,{z:13,hitOnly:true,pairHit:true})
    :actor(who,null,x+(i?1:-1)*w/4,y,w/2,h,{z:13,hitOnly:true,pairHit:true}));
   return [actor('pair',action.asset,x,y,w,h,{key:'resident-pair',label:action.label}),...handles];
  }
  return present.map(who=>{
   const r=this.residents[who],rt=this.runtime[who],action=(!this.reducedMotion||rt.mode==='drag')?rt.action:null;
   const w=action?28:22,h=action?w/1.12*(action.height/action.width):RESIDENT_BASE_HEIGHT;
   const id=action?.asset||(!this.reducedMotion&&rt.mode==='walk'?`${who}-walk${Math.floor(this.elapsed/180)%4+1}`:who==='bubu'?'bubu-idle':'yier-turn');
   return actor(who,id,r.x,r.y+RESIDENT_BASE_HEIGHT/2-h/2,w,h,{flip:rt.mode==='walk'&&rt.flip,label:action?`${who==='bubu'?'布布':'一二'}：${action.label}`:who==='bubu'?'布布':'一二'});
  });
 }
 beginDrag(who,now=this.clock()){
  if(!RESIDENT_WHO.includes(who)||this.runtime[who].mode==='drag'||RESIDENT_WHO.some(w=>this.runtime[w].mode==='drag'))return false;
  this.stopPair();const rt=this.runtime[who];rt.journeyRegion=null;rt.dragOrigin={...this.residents[who]};rt.mode='drag';rt.target=null;
  const choices=ACTOR_ACTIONS.filter(a=>a.who===who&&a.kind==='drag');rt.action=choices[Math.floor(this.roll()*choices.length)];rt.remaining=0;this.lastAt=now;return true;
 }
 dragTo(who,x,y){
  if(!RESIDENT_WHO.includes(who)||this.runtime[who].mode!=='drag'||!Number.isFinite(x)||!Number.isFinite(y))return false;
  Object.assign(this.residents[who],{x:residentClamp(x,8,92),y:residentClamp(y,12,88)});this.separate(who);return true;
 }
 endDrag(who,now=this.clock(),{cancel=false}={}){
  if(!RESIDENT_WHO.includes(who)||this.runtime[who].mode!=='drag')return false;
  const rt=this.runtime[who];if(cancel&&rt.dragOrigin)Object.assign(this.residents[who],rt.dragOrigin);
  this.separate(who);
  rt.dragOrigin=null;this.wait(who,1500);this.lastAt=now;return true;
 }
 transfer(who,destination,x,y,now=this.clock()){
  if(!RESIDENT_WHO.includes(who)||!RESIDENT_REGIONS.includes(destination)||!Number.isFinite(x)||!Number.isFinite(y)||this.residents[who].region===destination)return false;
  this.stopPair();const rt=this.runtime[who];rt.dragOrigin=null;rt.journeyRegion=null;rt.doorCooldown=18000;
  Object.assign(this.residents[who],{region:destination,x:residentClamp(x,8,92),y:residentClamp(y,12,88)});this.separate(who);this.wait(who,1500);this.lastAt=now;return true;
 }
 cancelAll(now=this.clock()){
  this.stopPair();for(const who of RESIDENT_WHO){const rt=this.runtime[who];if(rt.dragOrigin)Object.assign(this.residents[who],rt.dragOrigin);rt.dragOrigin=null;rt.journeyRegion=null;this.wait(who,1800+this.roll()*1800);}this.separate('yier');this.lastAt=now;
 }
}
