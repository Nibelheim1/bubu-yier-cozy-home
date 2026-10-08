import {VERSION,CATS,CHAINS,CFG,TASKS,DECOR,REGIONS,DAILY,SIDE_FLAVOR,itemKey,needMass,mass} from './data.mjs';

/** Deterministic, DOM-free game model. Every public mutation validates before spending. */
export const clone = (v)=>JSON.parse(JSON.stringify(v));
export function localDay(t){const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export const levelOf=(s)=>Math.min(99,Math.floor(s.xp/60)+1);
export const stockCap=(p)=>CFG.stockBase+(p.level-1)*CFG.stockPerLevel;
const good=(kind,extra={})=>({ok:true,kind,...extra});
const bad=(code,message)=>({ok:false,code,message});
const freshWorld=()=>({region:'house',activities:Object.fromEntries(REGIONS.map(r=>[r.id,{day:'',count:0}])),chapterGifts:[]});
export function freshState(now=Date.now(),seed=20261007){
 const board=Array(CFG.boardSize).fill(null);
 CATS.forEach((c,i)=>board[i]={k:'gen',c});
 board[8]={k:'item',c:'clean',l:1}; board[9]={k:'item',c:'clean',l:1,dust:true};
 board[16]={k:'item',c:'clean',l:2,dust:true};
 board[24]={k:'item',c:'tools',l:1,dust:true};
 board[29]={k:'item',c:'bake',l:1,dust:true};
 for(let i=35;i<49;i++)board[i]={k:'crate',openAt:2+Math.floor((i-35)/2)*2};
 return {schema:VERSION,createdAt:now,lastSeen:now,energyAt:now,rng:seed>>>0,stage:0,delivered:false,stars:0,coins:120,energy:100,xp:0,board,
  producers:Object.fromEntries(CATS.map(c=>[c,{level:1,stock:CFG.stockBase,at:now}])),
  storage:[],capacity:8,pending:[],bag:{scissors:3,energyPacks:2},
  daily:{day:localDay(now),merge:0,produce:0,order:0,claimed:[],gift:false},
  stats:{merge:0,produce:0,order:0,build:0,sold:0,unweb:0},
  seen:{'clean-1':true},decorStyles:Array(24).fill(null),sideOrders:[],sideSerial:0,sideRefreshAt:[0,0],restAt:0,
  world:freshWorld(),tutorial:'merge',introSeen:false,finishedSeen:false,settings:{sound:true,music:false,calm:false,reducedMotion:false}};
}

export class GameEngine{
 constructor(state=null,now=Date.now()){
  this.s=state?clone(validateState(state)):freshState(now);
  this.undoState=null;
  this.flushChapterGifts();
  if(this.s.sideOrders.length===0){this.s.sideOrders=[this.makeSide(),this.makeSide()];}
  this.tick(now);
 }
 rng(){this.s.rng=(Math.imul(1664525,this.s.rng)+1013904223)>>>0;return this.s.rng/4294967296;}
 unlocked(c){return !!CHAINS[c]&&this.s.stage>=CHAINS[c].unlock;}
 empty(){return this.s.board.findIndex(t=>t===null);}
 free(){return this.s.board.filter(t=>t===null).length;}
 unlockedCats(){return CATS.filter(c=>this.unlocked(c));}
 snapshot(){this.undoState=clone(this.s);}
 invalidate(){this.undoState=null;}
 visitRegion(id){
  const region=REGIONS.find(r=>r.id===id);
  if(!region)return bad('REGION','还没有找到这个地方。');
  if(this.s.stage<region.unlock)return bad('LOCKED','这个地方还没有开放。');
  this.invalidate();this.s.world.region=id;return good('visitRegion',{region:id});
 }
 worldProgress(){
  const regions=REGIONS.map(r=>{const record=this.s.world.activities[r.id];return {...r,built:DECOR.filter(d=>d.region===r.id&&d.id<this.s.stage).length,total:DECOR.filter(d=>d.region===r.id).length,available:this.s.stage>=r.unlock,activityDone:record.day===this.s.daily.day,visits:record.count};});
  const memories=regions.map(r=>({region:r.id,name:r.memoryName,progress:Math.min(3,r.visits),target:3,unlocked:r.visits>=3}));
  return {region:this.s.world.region,regions,memories,memoryCount:memories.filter(m=>m.unlocked).length,totalActivities:regions.reduce((n,r)=>n+r.visits,0),nextMemoryAt:3,chapterGiftsWaiting:this.s.world.chapterGifts.length};
 }
 homeActivity(id=this.s.world.region,now=Date.now()){
  this.tick(now);const region=REGIONS.find(r=>r.id===id);
  if(!region)return bad('REGION','还没有找到这个地方。');
  if(this.s.stage<Math.max(1,region.unlock))return bad('TUTORIAL','先铺好第一块门垫，再一起照顾家园吧。');
  const record=this.s.world.activities[id];
  if(record.day>=this.s.daily.day)return bad('CLAIMED','今天已经一起做过啦，明天再来看看。');
  this.invalidate();this.s.world.region=id;record.day=this.s.daily.day;record.count++;
  this.s.coins+=region.coins;this.addEnergy(region.energy);
  return good('homeActivity',{region:id,message:region.activityText,coins:region.coins,energy:region.energy,memoryProgress:Math.min(3,record.count),milestone:record.count===3,memoryName:region.memoryName});
 }
 // Legacy saves may already have all 1000 parcel slots occupied. Hold earned chapter
 // gifts separately until a slot is freed; retrieving a gift immediately refills it.
 flushChapterGifts(){while(this.s.pending.length<1000&&this.s.world.chapterGifts.length)this.s.pending.push(this.s.world.chapterGifts.shift());}
 tick(now=Date.now()){
  if(!Number.isFinite(now)||now<0)return;
  const s=this.s;
  // Moving the system clock backwards must never create a huge negative cooldown.
  if(now<s.lastSeen){const d=now-s.lastSeen;s.energyAt=Math.max(0,s.energyAt+d);s.restAt=Math.max(0,s.restAt+d);s.sideRefreshAt=s.sideRefreshAt.map(t=>Math.max(0,t+d));for(const p of Object.values(s.producers))p.at=Math.max(0,p.at+d);}
  if(s.energy>=CFG.energyCap){s.energyAt=now;}
  else {const n=Math.max(0,Math.floor((now-s.energyAt)/CFG.energyEvery));if(n){s.energy=Math.min(CFG.energyCap,s.energy+n);s.energyAt=s.energy>=CFG.energyCap?now:s.energyAt+n*CFG.energyEvery;}}
  for(const p of Object.values(s.producers)){
   const cap=stockCap(p);if(p.stock>=cap){p.at=now;}else{const n=Math.max(0,Math.floor((now-p.at)/CFG.stockEvery));if(n){p.stock=Math.min(cap,p.stock+n);p.at=p.stock>=cap?now:p.at+n*CFG.stockEvery;}}
  }
  const day=localDay(now);
  // A backwards date change cannot repeatedly reset daily gifts. Local saves are not a secure anti-cheat system.
  if(day>s.daily.day){s.daily={day,merge:0,produce:0,order:0,claimed:[],gift:false};this.invalidate();}
  s.lastSeen=now;
 }
 energyWait(now=Date.now()){return this.s.energy>=CFG.energyCap?0:Math.max(0,Math.ceil((this.s.energyAt+CFG.energyEvery-now)/1000));}
 addEnergy(n){this.s.energy=Math.min(10000,this.s.energy+n);}
 gainXP(n){const old=levelOf(this.s);this.s.xp+=n;const up=levelOf(this.s)-old;if(up){this.s.coins+=CFG.levelCoins*up;this.addEnergy(CFG.levelEnergy*up);}return up;}
 discover(c,l){const k=itemKey(c,l);if(this.s.seen[k])return false;this.s.seen[k]=true;return true;}
 tutorialBlock(){return this.s.stage===0&&['deliver','build'].includes(this.s.tutorial);}
 produce(c,now=Date.now()){
  this.tick(now);
  if(!this.unlocked(c))return bad('LOCKED','这个工作台会随小屋修缮自动解锁。');
  if(this.tutorialBlock())return bad('TUTORIAL','第一份材料已经好了，先交付并布置门垫吧。');
  const idx=this.empty(),p=this.s.producers[c];
  if(idx<0)return bad('FULL','棋盘满啦。先合成、交付，或把物品收进仓库。');
  if(!this.s.settings.calm&&this.s.energy<1)return bad('ENERGY','体力用完了。可以用点心补充，或免费喝杯茶。');
  if(!this.s.settings.calm&&p.stock<1)return bad('STOCK','正在补货，每 6 秒补一件；也可以升级工作台。');
  this.invalidate();
  let l=this.s.tutorial==='done'&&(this.rng()<(0.2+(p.level-1)*0.12))?2:1;
  if(!this.s.settings.calm){this.s.energy--;p.stock--;}
  this.s.board[idx]={k:'item',c,l};
  this.s.stats.produce++;this.s.daily.produce++;
  if(this.s.tutorial==='produce')this.s.tutorial='done';
  const discovery=this.discover(c,l);
  return good('produce',{idx,c,l,discovery});
 }
 move(from,to){
  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=49||to>=49||from===to)return bad('POSITION','请把物品放到另一个格子。');
  if(this.tutorialBlock())return bad('TUTORIAL','材料准备好啦，先完成第一张心愿吧。');
  const a=this.s.board[from],b=this.s.board[to];
  if(a?.k!=='item'||a.dust)return bad('FIXED','尘封物品和工作台不能拖走。');
  if(b?.k==='gen'||b?.k==='crate')return bad('BLOCKED','这里还不能放东西。');
  if(b?.dust&&!(b.c===a.c&&b.l===a.l))return bad('DUST','把同类同级的物品合过来，就能解开尘封。');
  if(b?.k==='item'&&a.c===b.c&&a.l===b.l){
   if(a.l>=CFG.maxLevel)return bad('MAX','已经是最高级啦，可以交付、收藏或收进仓库。');
   this.snapshot();
   const dust=!!b.dust;
   this.s.board[from]=null;this.s.board[to]={k:'item',c:a.c,l:a.l+1};
   this.s.stats.merge++;this.s.daily.merge++;
   if(dust){this.s.stats.unweb++;this.s.coins+=5;}
   const levelUps=this.gainXP(1),discovery=this.discover(a.c,a.l+1);
   if(this.s.stage===0&&a.c==='clean'&&a.l===1)this.s.tutorial='deliver';
   return good('merge',{from,to,c:a.c,l:a.l+1,dust,discovery,levelUps});
  }
  this.snapshot();this.s.board[from]=b??null;this.s.board[to]=a;
  return good('move',{from,to});
 }
 undo(now=Date.now()){
  if(!this.undoState)return bad('NO_UNDO','现在没有可以撤销的操作。');
  const back=this.undoState;this.undoState=null;this.s=back;this.tick(now);return good('undo');
 }
 count(c,l){return this.s.board.filter(t=>t?.k==='item'&&!t.dust&&t.c===c&&t.l===l).length+this.s.storage.filter(t=>t.c===c&&t.l===l).length;}
 canFulfill(needs){const grouped={};for(const r of needs){const k=itemKey(r.c,r.l);grouped[k]=(grouped[k]||0)+r.n;}return Object.entries(grouped).every(([k,n])=>{const [c,l]=k.split('-');return this.count(c,+l)>=n;});}
 consume(needs){
  if(!this.canFulfill(needs))return false;
  for(const r of needs){let n=r.n;for(let i=0;i<49&&n;i++){const t=this.s.board[i];if(t?.k==='item'&&!t.dust&&t.c===r.c&&t.l===r.l){this.s.board[i]=null;n--;}}
   for(let i=this.s.storage.length-1;i>=0&&n;i--){const t=this.s.storage[i];if(t.c===r.c&&t.l===r.l){this.s.storage.splice(i,1);n--;}}
  }return true;
 }
 makeSide(){
  const cats=this.unlockedCats();const max=this.s.stage<4?3:this.s.stage<12?4:5;
  const c=cats[Math.floor(this.rng()*cats.length)];const l=2+Math.floor(this.rng()*(max-1));
  const needs=[{c,l,n:1}];
  if(this.s.stage>=8&&this.rng()<0.4){const c2=cats[Math.floor(this.rng()*cats.length)];const l2=2+Math.floor(this.rng()*2);if(c2===c&&l2===l)needs[0].n++;else needs.push({c:c2,l:l2,n:1});}
  const f=SIDE_FLAVOR[Math.floor(this.rng()*SIDE_FLAVOR.length)];
  const m=needMass(needs);
  return {id:`side-${++this.s.sideSerial}`,name:f[0],wish:f[1],needs,coins:12+m*2,energy:2+Math.floor(m/8)};
 }
 submit(kind,id){
  let task,slot=-1;
  if(kind==='main'){
   if(this.s.stage>=24)return bad('FINISHED','主线已经完成，邻里委托还会继续。');
   if(id!==this.s.stage||this.s.delivered)return bad('STALE','这张心愿已经交付了，回小屋布置吧。');
   task=TASKS[this.s.stage];
  }else if(kind==='side'){
   slot=this.s.sideOrders.findIndex(o=>o.id===id);if(slot<0)return bad('STALE','这张委托已经更新啦。');task=this.s.sideOrders[slot];
   if(this.s.stage===0)return bad('TUTORIAL','先完成第一份小屋心愿吧。');
  }else return bad('ORDER','找不到这张订单。');
  if(!this.canFulfill(task.needs))return bad('MISSING','材料还差一点，点物品图标可以查看合成路线。');
  this.invalidate();this.consume(task.needs);
  this.s.coins+=task.coins;this.addEnergy(task.energy);
  this.s.stats.order++;this.s.daily.order++;
  const levelUps=this.gainXP(10+Math.floor(needMass(task.needs)/3));
  if(kind==='main'){this.s.delivered=true;this.s.stars++;if(this.s.stage===0)this.s.tutorial='build';}
  else{this.s.sideOrders[slot]=this.makeSide();}
  return good('submit',{orderKind:kind,id,coins:task.coins,energy:task.energy,levelUps});
 }
 build(style=0){
  if(this.s.stage>=24)return bad('FINISHED','小屋已经准备好迎接每一天啦。');
  if(!this.s.delivered||this.s.stars<1)return bad('NEED_ORDER','先完成这一项心愿订单，获得心愿星。');
  if(![0,1].includes(style))return bad('STYLE','请选择一种布置颜色。');
  this.invalidate();const stage=this.s.stage;this.s.decorStyles[stage]=style;this.s.stars--;this.s.delivered=false;this.s.stage++;this.s.stats.build++;this.s.world.region=DECOR[stage].region;
  const levelUps=this.gainXP(15);let opened=0;
  this.s.board=this.s.board.map(t=>{if(t?.k==='crate'&&t.openAt<=this.s.stage){opened++;return null;}return t;});
  const unlocked=CATS.filter(c=>CHAINS[c].unlock===this.s.stage);
  for(const c of unlocked){const p=this.s.producers[c];p.stock=stockCap(p);p.at=this.s.lastSeen;}
  if(stage===0)this.s.tutorial='produce';
  const chapterDone=this.s.stage%4===0;
  if(chapterDone){this.s.coins+=CFG.chapterCoins;this.addEnergy(CFG.chapterEnergy);this.s.bag.scissors++;const c=this.unlockedCats().at(-1),l=[4,8,12].includes(this.s.stage)?1:2;this.s.world.chapterGifts.push({k:'item',c,l},{k:'item',c,l});this.flushChapterGifts();}
  return good('build',{stage,region:DECOR[stage].region,unlocked,opened,chapterDone,chapter:Math.floor(stage/4),finished:this.s.stage===24,levelUps});
 }
 redecorate(id,style){
  if(!Number.isInteger(id)||id<0||id>=this.s.stage||![0,1].includes(style))return bad('DECOR','这个角落还没布置好。');
  this.invalidate();this.s.decorStyles[id]=style;return good('redecorate',{id,style});
 }
 store(index){
  if(this.s.stage===0)return bad('TUTORIAL','先完成门垫的小心愿，就能自由整理啦。');
  const t=this.s.board[index];if(t?.k!=='item'||t.dust)return bad('ITEM','只能收纳已经解开的物品。');
  if(this.s.storage.length>=this.s.capacity)return bad('STORAGE_FULL','仓库满啦。可以取出物品，或扩容。');
  this.snapshot();this.s.storage.push(t);this.s.board[index]=null;return good('store');
 }
 retrieve(index,source='storage'){
  if(!['storage','pending'].includes(source))return bad('SOURCE','找不到这个物品。');
  const arr=this.s[source];if(!Number.isInteger(index)||index<0||index>=arr.length)return bad('ITEM','物品已经被取走了。');
  const idx=this.empty();if(idx<0)return bad('FULL','棋盘还没空位，物品会继续安全保存在这里。');
  this.snapshot();const [t]=arr.splice(index,1);this.s.board[idx]=t;if(source==='pending')this.flushChapterGifts();const discovery=this.discover(t.c,t.l);return good('retrieve',{idx,c:t.c,l:t.l,discovery});
 }
 sell(index){
  if(this.s.stage===0)return bad('TUTORIAL','先完成第一张心愿，再来整理物品吧。');
  const t=this.s.board[index];if(t?.k!=='item'||t.dust)return bad('ITEM','工作台、尘封物品和木箱不能出售。');
  this.snapshot();const coins=mass(t);this.s.board[index]=null;this.s.coins+=coins;this.s.stats.sold++;return good('sell',{coins});
 }
 split(index){
  if(this.s.stage===0)return bad('TUTORIAL','先完成门口的小心愿吧。');
  const t=this.s.board[index],idx=this.empty();
  if(t?.k!=='item'||t.dust||t.l<=1)return bad('SPLIT','只能把二级以上的普通物品拆成两个低一级物品。');
  if(this.s.bag.scissors<=0)return bad('SCISSORS','剪刀用完了。小铺和章节奖励里都有。');
  if(idx<0)return bad('FULL','拆分需要多一个空格，剪刀不会被扣除。');
  this.snapshot();this.s.bag.scissors--;this.s.board[index]={k:'item',c:t.c,l:t.l-1};this.s.board[idx]={k:'item',c:t.c,l:t.l-1};const discovery=this.discover(t.c,t.l-1);return good('split',{idx,c:t.c,l:t.l-1,discovery});
 }
 sort(){
  if(this.s.stage===0)return bad('TUTORIAL','先把第一张心愿做好，稍后再整理吧。');
  this.snapshot();const movable=this.s.board.filter(t=>t?.k==='item'&&!t.dust).sort((a,b)=>CATS.indexOf(a.c)-CATS.indexOf(b.c)||a.l-b.l);
  let j=0;this.s.board=this.s.board.map(t=>(!t||(t.k==='item'&&!t.dust))?(movable[j++]??null):t);return good('sort');
 }
 upgrade(c){
  if(!this.unlocked(c))return bad('LOCKED','先解锁这个工作台。');
  const p=this.s.producers[c];if(p.level>=3)return bad('MAX','工作台已经升满了。');
  const cost=CFG.upgradeCosts[p.level-1];if(this.s.coins<cost)return bad('COINS','金币不够，邻里委托可以赚取更多金币。');
  this.invalidate();this.s.coins-=cost;p.level++;p.stock=stockCap(p);p.at=this.s.lastSeen;return good('upgrade',{c});
 }
 expansionCost(){return 80+(this.s.capacity-8)*20;}
 expand(){
  if(this.s.capacity>=CFG.storageMax)return bad('MAX','仓库已经扩到最大。');
  const cost=this.expansionCost();if(this.s.coins<cost)return bad('COINS','金币还差一点。');
  this.invalidate();this.s.coins-=cost;this.s.capacity+=4;return good('expand');
 }
 buy(key){
  const costs={energy:CFG.energyCost,scissors:CFG.scissorCost,parcel:CFG.parcelCost};
  if(!(key in costs))return bad('SHOP','没有这种商品。');
  if(this.s.coins<costs[key])return bad('COINS','金币不够，可以先完成邻里委托。');
  if(key==='parcel'&&this.s.pending.length>996)return bad('QUEUE','待领物品太多啦，请先取出一些。');
  this.invalidate();this.s.coins-=costs[key];
  if(key==='energy')this.s.bag.energyPacks++;
  if(key==='scissors')this.s.bag.scissors++;
  if(key==='parcel'){
   const c=TASKS[this.s.stage]?.needs.find(r=>this.count(r.c,r.l)<r.n)?.c||this.unlockedCats().at(-1);
   for(const l of [1,1,1,2])this.s.pending.push({k:'item',c,l});
  }
  return good('buy',{key});
 }
 usePack(){
  if(this.s.bag.energyPacks<=0)return bad('PACK','没有点心了，免费茶歇也能补充体力。');
  if(this.s.energy>=CFG.energyCap)return bad('ENOUGH','体力已经足够，点心先留着吧。');
  this.invalidate();this.s.bag.energyPacks--;this.addEnergy(30);return good('energy',{amount:30});
 }
 rest(now=Date.now()){
  this.tick(now);if(now<this.s.restAt)return bad('COOLDOWN',`茶还在泡，${Math.ceil((this.s.restAt-now)/1000)} 秒后再来。`);
  this.invalidate();this.s.restAt=now+CFG.restCooldown;this.addEnergy(CFG.restAmount);return good('rest',{amount:CFG.restAmount});
 }
 refreshSide(slot,now=Date.now()){
  this.tick(now);
  if(![0,1].includes(slot)||this.s.stage===0)return bad('ORDER','先完成第一项小屋心愿。');
  if(now<this.s.sideRefreshAt[slot])return bad('COOLDOWN','刚刚换过纸条，稍等一小会儿。');
  this.invalidate();this.s.sideOrders[slot]=this.makeSide();this.s.sideRefreshAt[slot]=now+CFG.sideCooldown;return good('refresh');
 }
 dailyGift(now=Date.now()){
  this.tick(now);if(this.s.daily.gift)return bad('CLAIMED','今天的小礼物已经收好啦。');
  this.invalidate();this.s.daily.gift=true;this.s.coins+=40;this.addEnergy(CFG.dailyGiftEnergy);this.s.bag.scissors++;return good('dailyGift');
 }
 claimDaily(key,now=Date.now()){
  this.tick(now);const d=DAILY.find(x=>x.key===key);if(!d)return bad('DAILY','没有找到这个小目标。');
  if(this.s.daily.claimed.includes(key))return bad('CLAIMED','这份奖励已经领取了。');
  if(this.s.daily[key]<d.target)return bad('INCOMPLETE','小目标还没完成，不用着急。');
  this.invalidate();this.s.daily.claimed.push(key);this.s.coins+=d.coins;this.addEnergy(d.energy);return good('dailyReward',{key});
 }
 setting(key,value){
  if(!(key in this.s.settings)||typeof value!=='boolean')return bad('SETTING','无法更改这项设置。');
  this.invalidate();this.s.settings[key]=value;return good('setting',{key,value});
 }
 markIntro(){this.invalidate();this.s.introSeen=true;return good('intro');}
 markFinished(){this.invalidate();this.s.finishedSeen=true;return good('finished');}
 hint(orderMode='main'){
  const side=orderMode==='side'||this.s.stage>=24;
  if(!side&&this.s.delivered)return {kind:'build'};
  const orders=side?this.s.sideOrders:[TASKS[this.s.stage]].filter(Boolean);
  const ready=orders.find(o=>this.canFulfill(o.needs));
  if(ready)return {kind:'submit',orderKind:side?'side':'main',id:ready.id};
  const current=orders.slice().sort((a,b)=>needMass(a.needs.filter(r=>this.count(r.c,r.l)<r.n))-needMass(b.needs.filter(r=>this.count(r.c,r.l)<r.n)))[0];
  const missing=current?.needs.filter(r=>this.count(r.c,r.l)<r.n)||[];
  const b=this.s.board;
  const pairs=[];
  for(let i=0;i<49;i++){const a=b[i];if(a?.k!=='item'||a.dust||a.l>=6)continue;for(let j=0;j<49;j++){if(i===j)continue;const t=b[j];if(t?.k==='item'&&t.c===a.c&&t.l===a.l)pairs.push({kind:'merge',from:i,to:j,c:a.c,l:a.l,dust:!!t.dust});}}
  const useful=pairs.filter(p=>missing.some(r=>r.c===p.c&&p.l<r.l));
  useful.sort((a,b)=>Number(b.dust)-Number(a.dust)||b.l-a.l);
  if(useful.length)return useful[0];
  if(missing.length)return {kind:'produce',c:missing[0].c,idx:CATS.indexOf(missing[0].c)};
  if(pairs.length)return pairs[0];
  return {kind:'produce',c:'clean',idx:0};
 }
 export(){return JSON.stringify({game:'bubu-yier-cozy-home',version:VERSION,exportedAt:new Date().toISOString(),state:this.s},null,2);}
}

/** Reject malformed imports before replacing the live state. Keep strict, bounded data shapes. */
export function validateState(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('存档不是有效对象。');
 const s=clone(raw.game==='bubu-yier-cozy-home'?raw.state:raw);
 if(!s||s.schema!==VERSION)throw Error('不支持的存档版本。');
 // Repair the old chapter-award overflow without touching the caller's save object.
 if(s.world===undefined){s.world=freshWorld();if(Array.isArray(s.pending)&&s.pending.length>1000&&s.pending.length<=1012)s.world.chapterGifts=s.pending.splice(1000);}
 const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
 const check=(ok,msg)=>{if(!ok)throw Error(msg);};
 for(const k of ['createdAt','lastSeen','energyAt','restAt'])check(integer(s[k],0,9007199254740000),`时间字段 ${k} 无效。`);
 for(const [k,max] of [['rng',4294967295],['coins',100000000],['xp',100000000],['energy',10000],['sideSerial',100000000]])check(integer(s[k],0,max),`${k} 超出合理范围。`);
 check(integer(s.stage,0,24)&&typeof s.delivered==='boolean','章节数据无效。');
 check(s.stars===Number(s.delivered)&&!(s.stage===24&&s.delivered),'心愿星与交付状态不一致。');
 const item=(t)=>t&&t.k==='item'&&CATS.includes(t.c)&&integer(t.l,1,6)&&(!('dust'in t)||typeof t.dust==='boolean');
 check(Array.isArray(s.board)&&s.board.length===49,'棋盘必须有 49 格。');
 s.board.forEach((t,i)=>{
  if(i<6){check(t?.k==='gen'&&t.c===CATS[i],'工作台位置异常。');return;}
  check(t===null||item(t)||(t?.k==='crate'&&i>=35&&t.openAt===2+Math.floor((i-35)/2)*2&&t.openAt>s.stage),'棋盘物品无效。');
  if(i>=35&&2+Math.floor((i-35)/2)*2>s.stage)check(t?.k==='crate','未解锁格子异常。');
 });
 check(integer(s.capacity,8,24)&&(s.capacity-8)%4===0,'仓库容量无效。');
 for(const [key,max] of [['storage',s.capacity],['pending',1000]])check(Array.isArray(s[key])&&s[key].length<=max&&s[key].every(t=>item(t)&&!t.dust),`${key} 内容无效。`);
 check(s.producers&&CATS.every(c=>{const p=s.producers[c];return p&&integer(p.level,1,3)&&integer(p.stock,0,stockCap(p))&&integer(p.at,0,9007199254740000);}),'工作台存货数据无效。');
 check(s.bag&&['scissors','energyPacks'].every(k=>integer(s.bag[k],0,100000)),'道具数量无效。');
 check(s.stats&&['merge','produce','order','build','sold','unweb'].every(k=>integer(s.stats[k],0,100000000)),'累计记录无效。');
 check(s.stats.build===s.stage,'修缮次数不一致。');
 check(s.daily&&/^\d{4}-\d{2}-\d{2}$/.test(s.daily.day)&&['merge','produce','order'].every(k=>integer(s.daily[k],0,100000000))&&typeof s.daily.gift==='boolean','每日记录无效。');
 check(Array.isArray(s.daily.claimed)&&new Set(s.daily.claimed).size===s.daily.claimed.length&&s.daily.claimed.every(k=>DAILY.some(d=>d.key===k)),'每日奖励无效。');
 check(Array.isArray(s.decorStyles)&&s.decorStyles.length===24&&s.decorStyles.every((v,i)=>i<s.stage?[0,1].includes(v):v===null),'布置记录无效。');
 check(s.seen&&typeof s.seen==='object'&&!Array.isArray(s.seen)&&Object.entries(s.seen).every(([k,v])=>{const[c,l]=k.split('-');return v===true&&CATS.includes(c)&&integer(+l,1,6);}), '图鉴记录无效。');
 check(Array.isArray(s.sideOrders)&&[0,2].includes(s.sideOrders.length),'邻里订单数量无效。');
 check(s.sideOrders.every(o=>o&&typeof o.id==='string'&&o.id.length<40&&typeof o.name==='string'&&o.name.length<60&&typeof o.wish==='string'&&o.wish.length<200&&integer(o.coins,1,1000)&&integer(o.energy,1,100)&&Array.isArray(o.needs)&&o.needs.length>=1&&o.needs.length<=3&&o.needs.every(r=>CATS.includes(r.c)&&CHAINS[r.c].unlock<=s.stage&&integer(r.l,1,6)&&integer(r.n,1,3))),'邻里订单内容无效。');
 check(new Set(s.sideOrders.map(o=>o.id)).size===s.sideOrders.length,'邻里订单编号重复。');
 check(Array.isArray(s.sideRefreshAt)&&s.sideRefreshAt.length===2&&s.sideRefreshAt.every(t=>integer(t,0,9007199254740000)),'刷新时间无效。');
 check(s.settings&&['sound','music','calm','reducedMotion'].every(k=>typeof s.settings[k]==='boolean'),'设置无效。');
 check(['merge','deliver','build','produce','done'].includes(s.tutorial)&&typeof s.introSeen==='boolean'&&typeof s.finishedSeen==='boolean','教学记录无效。');
 const result=clone(s);
 const w=result.world;
 check(w&&typeof w==='object'&&!Array.isArray(w)&&REGIONS.some(r=>r.id===w.region),'家园区域记录无效。');
 check(w.activities&&typeof w.activities==='object'&&!Array.isArray(w.activities)&&REGIONS.every(r=>{const a=w.activities[r.id];return a&&integer(a.count,0,100000000)&&typeof a.day==='string'&&(a.day===''||/^\d{4}-\d{2}-\d{2}$/.test(a.day))&&a.day<=s.daily.day&&(a.count===0?a.day==='':a.day!=='');}),'家园互动记录无效。');
 check(Array.isArray(w.chapterGifts)&&w.chapterGifts.length<=Math.floor(s.stage/4)*2&&w.chapterGifts.every(t=>item(t)&&!t.dust),'章节礼物记录无效。');
 return result;
}
