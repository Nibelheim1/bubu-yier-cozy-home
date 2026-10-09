/** Local simulated weather and presentation-only daily life. Never mutates a save. */
import {DECOR} from './data.mjs';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const hash=text=>{let n=2166136261;for(const c of String(text))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
const asTime=now=>now instanceof Date?now.getTime():Number(now);
const pad=n=>String(n).padStart(2,'0');
export function describeEnvironment(now=Date.now(),seed='cozy'){
 const time=asTime(now);if(!Number.isFinite(time))throw new TypeError('Environment time must be finite');
 const d=new Date(time),hour=d.getHours(),dateKey=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
 const phase=hour>=5&&hour<9?'morning':hour>=9&&hour<17?'day':hour>=17&&hour<19?'dusk':'night';
 const segment=Math.floor((hour*60+d.getMinutes())/10);
 const weather=['sunny','cloudy','rain','wind'][hash(`${seed}:${dateKey}:${segment}`)%4];
 return {phase,phaseLabel:{morning:'清晨',day:'白天',dusk:'黄昏',night:'夜晚'}[phase],night:phase==='night',weather,weatherLabel:{sunny:'晴朗',cloudy:'多云',rain:'小雨',wind:'微风'}[weather],clock:`${pad(hour)}:${pad(d.getMinutes())}`,segment,dateKey,simulated:true};
}

function actor(who,id,x,y,activity,flip=false){return {key:who,kind:'actor',who,id,x:clamp(x,11,89),y:clamp(y,14,86),w:22,h:22/1.12*1.2,z:12,anchor:'center',rotation:0,flip,label:who==='bubu'?'布布':'一二',activity};}
/** decorLayers may be supplied by describeScene to use its exact sprite layout. */
export function ambientFrame(state,region,environment,now=Date.now(),decorLayers=[]){
 const time=asTime(now);if(!Number.isFinite(time))throw new TypeError('Ambient time must be finite');
 const stage=Number(state.stage)||0;
 const decor=id=>{
  if(id>=stage||DECOR[id]?.region!==region)return null;
  const actual=decorLayers.find(l=>l.decorId===id);if(actual)return actual;
  return {...DECOR[id],...(state.decorPositions?.[id]||{})};
 };
 const near=(d,side=-1)=>d?[clamp(d.x+side*14,12,88),clamp(d.y+4,18,84)]:null;
 const book=decor(16),painting=decor(8),flowers=decor(23)||decor(12),seat=decor(region==='house'?17:21)||decor(7);
 const readAt=near(book,-1),lookAt=painting||flowers;
 // The existing painting pose contains its own easel. Look at the unlocked
 // scene easel instead, and never mistake the garden flower shelf for one.
 const lookSide=lookAt?.x>70?-1:1;
 const lookPosition=lookAt?[clamp(lookAt.x+lookSide*((lookAt.w||22)/2+12),12,88),clamp(lookAt.y+4,18,84)]:null;
 // Sit on opposite sides of the resting corner, with room for both GIFs.
 const restCenter=seat?clamp(seat.x,25.5,74.5):56.5,restY=seat?clamp(seat.y+4,18,84):72;
 const restPositions=[[restCenter-13.5,restY],[restCenter+13.5,restY]];
 const starts={house:[[35,61],[57,62]],garden:[[35,62],[58,65]],courtyard:[[38,60],[62,63]]}[region]||[[35,61],[57,62]];
 const destinations=[
  [[28,62],[63,70]],
  [readAt||[38,69],lookPosition||[70,58]],
  [[63,59],[37,67]],
  restPositions,
  [[46,63],[58,64]],
  starts,
 ];
 const cycle=90000,slot=15000,local=((time%cycle)+cycle)%cycle,index=Math.floor(local/slot),elapsed=local%slot;
 const previous=destinations[(index+5)%6],target=destinations[index],p=smooth(elapsed/(index===0||index===2?slot:6000));
 const walking=elapsed<(index===0||index===2?slot:6000),activity=walking?'walk':['walk','personal','walk','rest','together','tidy'][index];
 const actors=['bubu','yier'].map((who,i)=>{
  const from=previous[i],to=target[i],x=from[0]+(to[0]-from[0])*p,y=from[1]+(to[1]-from[1])*p;
  let own=activity,id=walking?`${who}-walk${Math.floor(time/180)%4+1}`:`${who}-${who==='bubu'?'idle':'turn'}`;
  if(!walking&&index===1){own=i===0&&book?'read':i===1&&painting?'view-painting':i===1&&flowers?'view-flowers':'look';id=own==='read'?'bubu-sit':`${who}-turn`;}
  if(!walking&&index===3){own=seat?'rest':'look';id=seat?`${who}-${i===0?'sit':'rest'}`:`${who}-turn`;}
  if(!walking&&index===4)id=`${who}-${i===0?'joy':'shy'}`;
  if(!walking&&index===5)id=`${who}-support${i+1}`;
  // Walk atlases face right; yier-turn faces left toward a nearby exhibit.
  const flip=walking?to[0]<from[0]:i===1&&index===1&&lookAt?lookAt.x>x:false;
  return actor(who,id,x,y,own,flip);
 });
 const props=[];
 if(!walking&&index===4)props.push({key:'ambient-heart',kind:'ambient-effect',id:null,glyph:'♡',x:52,y:47,w:8,h:7,z:16,rotation:0});
 if(!walking&&index===5)actors.forEach((a,i)=>props.push({key:`ambient-cloth-${i}`,kind:'prop',id:`clean-${i+1}`,x:a.x+(i? -5:5),y:a.y+6,w:8,h:7,z:13,rotation:Math.sin(time/400)*12}));
 let caption=walking?'布布和一二在家里慢慢走走':index===1?`${book?'布布在喜欢的故事旁歇一会儿':'布布看看这个角落'}，${painting?'一二看看自己的画':flowers?'一二看看新叶和花朵':'一二停下来看看风景'}`:index===3?(seat?'忙完一点点，一起坐下歇一会儿':'两只熊停下来，看看这个角落'):index===4?'走到你身边，今天也想和你贴贴':'一起擦一擦，把日子收拾得软软的';
 if(walking&&region!=='house')caption='两只熊沿着小路，慢慢散步';
 if(environment?.night&&activity==='rest')caption=seat?'夜深了，布布陪一二一起歇一会儿':caption;
 return {actors,props,caption,activity,index,walking};
}
