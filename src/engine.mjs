import {VERSION,APP_VERSION,SCHEMA_VERSION,CATS,CHAINS,CFG,TASKS,DECOR,REGIONS,DAILY,SIDE_FLAVOR,MEMORY_GATES,TEA_CONDITIONS,TEA_PLANS,SOUVENIRS,teaResponse,itemKey,needMass,mass,orderXP} from './data.mjs';
import {decorPlacement,decorBounds} from './scenes.mjs';
import {freshResidents,validResidents} from './residents.mjs';
import {CAMPAIGN_CHAPTERS,CAMPAIGN_TASKS,CAMPAIGN_SIDE_MASS,campaignSideTier,campaignSideSpec} from './campaign.mjs';

/** Deterministic, DOM-free game model. Every public mutation validates before spending. */
export const clone = (v)=>JSON.parse(JSON.stringify(v));
export function localDay(t){const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export const levelCost=(level)=>30+12*(level-1)+20*Math.floor((level-1)/10);
export function levelReward(level){return level<=5?{energy:3,coins:20}:level<=10?{energy:4,coins:25}:level<=20?{energy:5,coins:35}:level<=40?{energy:6,coins:45}:{energy:8,coins:60};}
const levelThreshold=(level)=>{let total=0;for(let l=1;l<level;l++)total+=levelCost(l);return total;};
export function levelProgress(s){let level=1,total=0;while(level<CFG.maxPlayerLevel&&s.xp>=total+levelCost(level)){total+=levelCost(level++);}return {level,current:level===CFG.maxPlayerLevel?0:s.xp-total,required:level===CFG.maxPlayerLevel?0:levelCost(level),next:level===CFG.maxPlayerLevel?null:level+1,total};}
export const levelOf=(s)=>levelProgress(s).level;
export function levelGift(level,stage=0){
 if(!Number.isInteger(level)||level<5||level>=CFG.maxPlayerLevel||level%CFG.levelGiftEvery!==0)return null;
 const c=CATS.filter(c=>CHAINS[c].unlock<=stage).at(-1)||'clean',l=Math.min(4,2+Math.floor(level/10));
 return {coins:40+level*8,scissors:Math.min(3,1+Math.floor(level/20)),items:[{k:'item',c,l},{k:'item',c,l}]};
}
export const stockCap=(p)=>CFG.stockBase+(p.level-1)*CFG.stockPerLevel;
const good=(kind,extra={})=>({ok:true,kind,...extra});
const bad=(code,message)=>({ok:false,code,message});
const freshWorld=()=>({region:'house',activities:Object.fromEntries(REGIONS.map(r=>[r.id,{day:'',count:0}])),chapterGifts:[],memoryUnlocked:Object.fromEntries(REGIONS.map(r=>[r.id,false])),souvenirs:{},equipped:Object.fromEntries(REGIONS.map(r=>[r.id,null]))});
const freshTea=()=>({round:0,plan:'warm',firstVisit:'locked',lastResult:null});
// Exact v1.2.0 flavor pairs. Only these known old strings migrate by index;
// Recipe IDs and random state stay unchanged; economy migration below updates rewards.
const previousSideFlavor=[
 ['巷口留言','把小东西准备好，生活就方便一点。'],['下午的约定','不用赶，准备好了再送来就好。'],['邻里小纸条','今天也想分享一点热乎乎的心意。'],['窗边的请求','给平常的一天，添一点小颜色。'],['周末的准备','东西不用很多，合适就好。'],
];
export function firstVisitResponse(participants=['bubu','yier','xiaoli']){
 return [{who:'yier',text:'小栗，你来了！花架和画台都摆好了，这块蛋糕是留给你的。'},{who:'bubu',text:'请坐。一二摆好杯子，我把热茶端过来，慢一点喝。'},{who:'xiaoli',text:'谢谢你们的邀请。我带来了巷口捡到的小叶子，想画进给你们的回信。下次，再一起喝花草茶吧。'}].filter(line=>participants.includes(line.who));
}
export function freshState(now=Date.now(),seed=20261007){
 const board=Array(CFG.boardSize).fill(null);
 CATS.forEach((c,i)=>board[i]={k:'gen',c});
 board[8]={k:'item',c:'clean',l:1}; board[9]={k:'item',c:'clean',l:1,dust:true};
 board[16]={k:'item',c:'clean',l:2,dust:true};
 board[24]={k:'item',c:'tools',l:1,dust:true};
 board[29]={k:'item',c:'bake',l:1,dust:true};
 for(let i=35;i<49;i++)board[i]={k:'crate',openAt:2+Math.floor((i-35)/2)*2};
 return {schema:SCHEMA_VERSION,economyVersion:CFG.economyVersion,levelGiftsClaimed:[],createdAt:now,lastSeen:now,energyAt:now,rng:seed>>>0,stage:0,mainPrepStep:0,producerLessons:Object.fromEntries(CATS.map(c=>[c,c==='clean'])),tea:freshTea(),delivered:false,stars:0,coins:120,energy:100,xp:0,board,
  producers:Object.fromEntries(CATS.map(c=>[c,{level:1,stock:CFG.stockBase,at:now}])),
  storage:[],capacity:8,pending:[],bag:{scissors:3},
  daily:{day:localDay(now),merge:0,produce:0,order:0,claimed:[],gift:false},
  stats:{merge:0,produce:0,order:0,build:0,sold:0,unweb:0},
  seen:{'clean-1':true},decorStyles:Array(24).fill(null),decorPositions:{},sideOrders:[],sideSerial:0,sideRefreshAt:[0,0],sideCompleted:0,campaign:{completed:0,step:0},
  world:freshWorld(),residents:freshResidents(),tutorial:'merge',introSeen:false,finishedSeen:false,settings:{sound:true,music:false,reducedMotion:false}};
}

export class GameEngine{
 constructor(state=null,now=Date.now()){
  this.s=state?clone(validateState(state)):freshState(now);
  this.flushChapterGifts();
  this.checkMemories();
  if(this.s.stage===24&&this.s.tea.firstVisit==='locked')this.s.tea.firstVisit='available';
  if(this.s.sideOrders.length===0){this.s.sideOrders=[this.makeSide(0),this.makeSide(1)];}
  this.tick(now);
 }
 rng(){this.s.rng=(Math.imul(1664525,this.s.rng)+1013904223)>>>0;return this.s.rng/4294967296;}
 unlocked(c){return !!CHAINS[c]&&this.s.stage>=CHAINS[c].unlock;}
 empty(){return this.s.board.findIndex(t=>t===null);}
 free(){return this.s.board.filter(t=>t===null).length;}
 unlockedCats(){return CATS.filter(c=>this.unlocked(c));}
 invalidate(){}
 visitRegion(id){
  const region=REGIONS.find(r=>r.id===id);
  if(!region)return bad('REGION','还没有找到这个地方。');
  if(this.s.stage<region.unlock)return bad('LOCKED','这个地方还没有开放。');
  this.invalidate();this.s.world.region=id;return good('visitRegion',{region:id});
 }
 worldProgress(){
  const regions=REGIONS.map(r=>{const record=this.s.world.activities[r.id];return {...r,...this.activityDetails(r.id),built:DECOR.filter(d=>d.region===r.id&&d.id<this.s.stage).length,total:DECOR.filter(d=>d.region===r.id).length,available:this.s.stage>=r.unlock,activityDone:record.day===this.s.daily.day,visits:record.count};});
  const memories=regions.map(r=>({region:r.id,name:r.memoryName,progress:Math.min(3,r.visits),target:3,conditionStage:MEMORY_GATES[r.id],conditionMet:this.s.stage>=MEMORY_GATES[r.id],conditionLabel:{house:'准备两只杯子',garden:'认领第一盆小生命',courtyard:'做出分享的茶点'}[r.id],unlocked:this.s.world.memoryUnlocked[r.id]}));
  return {region:this.s.world.region,regions,memories,souvenirs:SOUVENIRS.map(s=>({...s,unlocked:!!this.s.world.souvenirs[s.key],equipped:this.s.world.equipped[s.region]===s.key,record:this.s.world.souvenirs[s.key]||null})),equipped:clone(this.s.world.equipped),memoryCount:memories.filter(m=>m.unlocked).length,totalActivities:regions.reduce((n,r)=>n+r.visits,0),nextMemoryAt:3,chapterGiftsWaiting:this.s.world.chapterGifts.length};
 }
 activityDetails(id){
  const ready=this.s.stage>=MEMORY_GATES[id],arrived=this.s.tea.firstVisit==='arrived';
  return id==='house'?(ready?{activityLabel:'一起喝杯茶',activityText:'布布把茶吹凉，一二摆好两只杯子。忙完的两只熊，一起歇一会儿。',activityAction:'share-tea'}:{activityLabel:'整理窗边',activityText:'一二把窗边擦亮，布布留出一个能一起歇脚的位置。',activityAction:'tidy-window'}):id==='garden'?(ready?{activityLabel:'扶苗浇浇水',activityText:'一二扶稳小苗，布布慢慢浇水，叶子又精神了一点。',activityAction:'water-seedling'}:{activityLabel:'扫扫落叶',activityText:'两只熊扫好落叶，一起选一个将来种花的位置。',activityAction:'sweep-leaves'}):(ready?{activityLabel:arrived?'给朋友摆茶点':'准备分享的茶点',activityText:arrived?'小栗来了。一二摆杯，布布端茶，给朋友留一个位置。':'一二摆好点心，布布端稳茶盘，等邀请中的小栗来坐坐。',activityAction:arrived?'welcome-friend':'prepare-tea'}:{activityLabel:'整理门口',activityText:'两只熊把门口整理好，给将来的客人留出位置。',activityAction:'tidy-door'});
 }
 checkMemories(){const unlocked=[];for(const r of REGIONS)if(!this.s.world.memoryUnlocked[r.id]&&this.s.world.activities[r.id].count>=3&&this.s.stage>=MEMORY_GATES[r.id]){this.s.world.memoryUnlocked[r.id]=true;unlocked.push(r.id);}return unlocked;}
 homeActivity(id=this.s.world.region,now=Date.now()){
  this.tick(now);const region=REGIONS.find(r=>r.id===id);
  if(!region)return bad('REGION','还没有找到这个地方。');
  if(this.s.stage<Math.max(1,region.unlock))return bad('TUTORIAL','先铺好第一块门垫，再一起照顾家园吧。');
  const record=this.s.world.activities[id];
  if(record.day>=this.s.daily.day)return bad('CLAIMED','今天已经一起做过啦，明天再来看看。');
  if(['bubu','yier'].some(who=>this.s.residents[who].region!==id))return bad('APART','先把布布和一二带到同一个地方，再一起做小事。');
  this.invalidate();this.s.world.region=id;record.day=this.s.daily.day;record.count++;
  this.s.coins+=region.coins;const unlocked=this.checkMemories(),details=this.activityDetails(id);
  return good('homeActivity',{region:id,message:details.activityText,action:details.activityAction,coins:region.coins,memoryProgress:Math.min(3,record.count),milestone:unlocked.includes(id),memoryName:region.memoryName});
 }
 // Legacy saves may already have all 1000 parcel slots occupied. Hold earned chapter
 // gifts separately until a slot is freed; retrieving a gift immediately refills it.
 flushChapterGifts(){while(this.s.pending.length<1000&&this.s.world.chapterGifts.length)this.s.pending.push(this.s.world.chapterGifts.shift());}
 tick(now=Date.now()){
  if(!Number.isFinite(now)||now<0)return;
  const s=this.s;
  // Moving the system clock backwards must never create a huge negative cooldown.
  if(now<s.lastSeen){const d=now-s.lastSeen;s.energyAt=Math.max(0,s.energyAt+d);s.sideRefreshAt=s.sideRefreshAt.map(t=>Math.max(0,t+d));for(const p of Object.values(s.producers))p.at=Math.max(0,p.at+d);}
  if(s.energy>=CFG.energyCap){s.energy=CFG.energyCap;s.energyAt=now;}
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
 gainXP(n){
  if(!Number.isInteger(n)||n<0)return 0;
  const old=levelOf(this.s);this.s.xp=Math.min(100000000,this.s.xp+n);const next=levelOf(this.s);
  for(let l=old+1;l<=next;l++){const reward=levelReward(l);this.s.coins+=reward.coins;this.s.energy=Math.min(CFG.energyCap,this.s.energy+reward.energy);}
  return next-old;
 }
 claimLevelGift(level){
  const gift=levelGift(level,this.s.stage);
  if(!gift||level>levelOf(this.s))return bad('LEVEL','升到对应等级后才能领取这份礼包。');
  if(this.s.levelGiftsClaimed.includes(level))return bad('CLAIMED','这份升级礼包已经领取了。');
  if(this.s.pending.length+gift.items.length>1000)return bad('QUEUE','待领物品太多，请先取出一些；礼包仍为你保留。');
  this.s.coins+=gift.coins;this.s.bag.scissors+=gift.scissors;this.s.pending.push(...clone(gift.items));this.s.levelGiftsClaimed.push(level);this.s.levelGiftsClaimed.sort((a,b)=>a-b);
  return good('levelGift',{level,...clone(gift)});
 }
 discover(c,l){const k=itemKey(c,l);if(this.s.seen[k])return false;this.s.seen[k]=true;return true;}
 tutorialBlock(){return this.s.stage===0&&['deliver','build'].includes(this.s.tutorial);}
 produce(c,now=Date.now()){
  this.tick(now);
  if(!this.unlocked(c))return bad('LOCKED','这个工作台会随小屋修缮自动解锁。');
  if(this.tutorialBlock())return bad('TUTORIAL','第一份材料已经好了，先交付并布置门垫吧。');
  const idx=this.empty(),p=this.s.producers[c];
  if(idx<0)return bad('FULL','棋盘满啦。先合成、交付，或把物品收进仓库。');
  if(this.s.energy<1)return bad('ENERGY','体力用完了。每 100 秒自然恢复 1 点，升级也会增加少量体力。');
  if(p.stock<1)return bad('STOCK','正在补货，每 6 秒补一件；也可以升级工作台。');
  this.invalidate();
  let l=this.s.tutorial==='done'&&(this.rng()<(0.2+(p.level-1)*0.12))?2:1;
  this.s.energy--;p.stock--;
  this.s.board[idx]={k:'item',c,l};
  this.s.stats.produce++;this.s.daily.produce++;
  if(this.s.tutorial==='produce')this.s.tutorial='done';
  const discovery=this.discover(c,l);
  const lesson=!this.s.producerLessons[c];this.s.producerLessons[c]=true;
  return good('produce',{idx,c,l,discovery,lesson});
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
   this.invalidate();
   const dust=!!b.dust;
   this.s.board[from]=null;this.s.board[to]={k:'item',c:a.c,l:a.l+1};
   this.s.stats.merge++;this.s.daily.merge++;
   if(dust){this.s.stats.unweb++;this.s.coins+=5;}
   const levelUps=0,discovery=this.discover(a.c,a.l+1);
   if(this.s.stage===0&&a.c==='clean'&&a.l===1)this.s.tutorial='deliver';
   return good('merge',{from,to,c:a.c,l:a.l+1,dust,discovery,levelUps});
  }
  return bad('NO_MATCH','拖到同类同级物品上才能合成；物品保持原位。');
 }
 undo(){return bad('REMOVED','撤回功能已取消。');}
 count(c,l){return this.s.board.filter(t=>t?.k==='item'&&!t.dust&&t.c===c&&t.l===l).length+this.s.storage.filter(t=>t.c===c&&t.l===l).length;}
 canFulfill(needs){const grouped={};for(const r of needs){const k=itemKey(r.c,r.l);grouped[k]=(grouped[k]||0)+r.n;}return Object.entries(grouped).every(([k,n])=>{const [c,l]=k.split('-');return this.count(c,+l)>=n;});}
 consume(needs){
  if(!this.canFulfill(needs))return false;
  for(const r of needs){let n=r.n;for(let i=0;i<49&&n;i++){const t=this.s.board[i];if(t?.k==='item'&&!t.dust&&t.c===r.c&&t.l===r.l){this.s.board[i]=null;n--;}}
   for(let i=this.s.storage.length-1;i>=0&&n;i--){const t=this.s.storage[i];if(t.c===r.c&&t.l===r.l){this.s.storage.splice(i,1);n--;}}
  }return true;
 }
 makeSide(slot=0){
  if(this.s.stage>=24)return {...campaignSideSpec({slot,completed:this.s.sideCompleted,level:levelOf(this.s),stage:this.s.stage,random:()=>this.rng()}),id:`side-${++this.s.sideSerial}`};
  const cats=this.unlockedCats();const max=this.s.stage<4?3:this.s.stage<12?4:5;
  const c=cats[Math.floor(this.rng()*cats.length)];const l=2+Math.floor(this.rng()*(max-1));
  const needs=[{c,l,n:1}];
  if(this.s.stage>=8&&this.rng()<0.4){const c2=cats[Math.floor(this.rng()*cats.length)];const l2=2+Math.floor(this.rng()*2);if(c2===c&&l2===l)needs[0].n++;else needs.push({c:c2,l:l2,n:1});}
  const f=SIDE_FLAVOR[Math.floor(this.rng()*SIDE_FLAVOR.length)];
  const m=needMass(needs);
  return {id:`side-${++this.s.sideSerial}`,name:f[0],wish:f[1],needs,coins:8+m*2,xp:orderXP(needs)};
 }
 mainOrder(){
  if(this.s.stage>=24){
   const task=CAMPAIGN_TASKS[this.s.campaign.completed];if(!task)return null;
   const phase=this.s.campaign.step,totalPhases=task.steps.length;
   return {...task,renovation:false,expanded:true,needs:clone(task.steps[phase].needs),fullNeeds:clone(task.needs),remainingNeeds:clone(task.steps.slice(phase).flatMap(step=>step.needs)),phase,totalPhases,phaseLabel:task.steps[phase].label,lesson:null};
  }
  const task=TASKS[this.s.stage];if(!task)return null;
  const totalPhases=task.phases?.length||1,phase=this.s.mainPrepStep;
  const needs=totalPhases>1?(phase<totalPhases?[task.needs[phase]]:[]):task.needs;
  return {...task,renovation:true,needs:clone(needs),fullNeeds:clone(task.needs),remainingNeeds:clone(totalPhases>1?task.needs.slice(phase):task.needs),phase,totalPhases,phaseLabel:task.phases?.[phase]||task.name,lesson:task.needs.find(r=>r.c!=='clean'&&!this.s.producerLessons[r.c])?.c||null};
 }
 progress(){
  const task=this.mainOrder(),completed=this.s.stage+this.s.campaign.completed;
  return {baseDone:this.s.stage,expandedDone:this.s.campaign.completed,completed,total:TASKS.length+CAMPAIGN_TASKS.length,finished:!task,next:task,chapter:task?.expanded?CAMPAIGN_CHAPTERS[task.chapter]:null};
 }
 teaOrder(){
  const {round,plan}=this.s.tea,c=TEA_CONDITIONS[round%3],p=TEA_PLANS[plan];
  return {available:this.s.stage>=13&&CATS.every(cat=>this.s.producerLessons[cat]),id:`tea-${round}-${plan}`,round,plan,condition:c.id,conditionName:c.name,name:p.name,wish:p.wish,needs:clone(c.needs[plan]),coins:16+2*needMass(c.needs[plan]),xp:orderXP(c.needs[plan]),region:p.region,participants:['bubu','yier',...(this.s.tea.firstVisit==='arrived'?['xiaoli']:[])],response:teaResponse(plan,c.id,this.s.tea.firstVisit==='arrived'),souvenirKey:`${c.souvenir}-${plan}`,souvenirName:c.souvenirName,souvenirRegion:c.souvenirRegion};
 }
 chooseTeaPlan(plan){if(!(plan in TEA_PLANS))return bad('PLAN','请选择暖心茶点或花园小聚。');if(!this.teaOrder().available)return bad('LOCKED','先认领小苗，并亲手认识每个工作台。');this.invalidate();this.s.tea.plan=plan;return good('teaPlan',{plan});}
 resultContext(order,kind='tea'){return {kind,id:order.id,round:order.round,plan:order.plan,condition:order.condition,region:order.region,participants:clone(order.participants),response:clone(order.response),stage:this.s.stage,decorStyles:clone(this.s.decorStyles),decorPositions:clone(this.s.decorPositions),equipped:clone(this.s.world.equipped),souvenirKey:order.souvenirKey};}
 beginFirstVisit(){
  if(this.s.tea.firstVisit!=='available')return bad(this.s.tea.firstVisit==='arrived'?'ARRIVED':'LOCKED',this.s.tea.firstVisit==='arrived'?'小栗已经来过啦，可以重看这次回忆。':'等家园准备好，再迎接小栗吧。');
  if(['bubu','yier'].some(who=>this.s.residents[who].region!=='courtyard'))return bad('APART','先把布布和一二都带到庭院，再一起迎接小栗。');
  this.invalidate();this.s.tea.firstVisit='arrived';const order={...this.teaOrder(),id:'firstVisit',region:'courtyard',participants:['bubu','yier','xiaoli'],souvenirKey:null,response:firstVisitResponse()};
  this.s.tea.lastResult=this.resultContext(order,'firstVisit');return good('firstVisit',{result:clone(this.s.tea.lastResult)});
 }
 equipSouvenir(region,key){const spec=SOUVENIRS.find(s=>s.key===key&&s.region===region);if(!spec||!this.s.world.souvenirs[key])return bad('SOUVENIR','先在茶会中收好这件纪念物。');this.invalidate();this.s.world.equipped[region]=key;return good('equipSouvenir',{region,key});}
 submit(kind,id,expectedStep){
  let task,slot=-1;
  if(kind==='main'){
   task=this.mainOrder();
   if(!task)return bad('FINISHED','主线已经完成，邻里委托还会继续。');
   if(id!==task.id||this.s.delivered)return bad('STALE','这张心愿已经更新，请查看现在的任务。');
   if((task.expanded||task.totalPhases>1)&&expectedStep!==task.phase)return bad('STALE','准备阶段已更新，请查看现在需要什么。');
   if(task.lesson)return bad('LESSON',`先从${CHAINS[task.lesson].producer}亲手取出一次材料，再交付这张心愿。`);
  }else if(kind==='side'){
   slot=this.s.sideOrders.findIndex(o=>o.id===id);if(slot<0)return bad('STALE','这张委托已经更新啦。');task=this.s.sideOrders[slot];
   if(this.s.stage===0)return bad('TUTORIAL','先完成第一份小屋心愿吧。');
  }else if(kind==='tea'){
   task=this.teaOrder();if(!task.available)return bad('LOCKED','先认领小苗，并亲手认识每个工作台。');if(id!==task.id)return bad('STALE','本次茶会的轮次或方案已改变。');
  }else return bad('ORDER','找不到这张订单。');
  if(!this.canFulfill(task.needs))return bad('MISSING','材料还差一点，点物品图标可以查看合成路线。');
  if(kind==='tea'&&['bubu','yier'].some(who=>this.s.residents[who].region!==task.region))return bad('APART','先把布布和一二都带到茶会地点，再一起喝茶。');
  this.invalidate();this.consume(task.needs);
  if(kind==='main'&&task.expanded){
   this.s.campaign.step++;
   if(this.s.campaign.step<task.totalPhases)return good('prepare',{expanded:true,orderKind:kind,id,phase:task.phase,totalPhases:task.totalPhases,phaseLabel:task.phaseLabel,region:task.region});
  }else if(kind==='main'&&task.totalPhases>1){this.s.world.region=id===23&&task.phase===0?'garden':'courtyard';this.s.mainPrepStep++;if(this.s.mainPrepStep<task.totalPhases)return good('prepare',{orderKind:kind,id,phase:task.phase,totalPhases:task.totalPhases,phaseLabel:task.phaseLabel,region:this.s.world.region});}
  this.s.coins+=task.coins;
  this.s.stats.order++;this.s.daily.order++;
  const levelUps=this.gainXP(task.xp);
  if(kind==='main'&&task.expanded){
   this.s.campaign.completed++;this.s.campaign.step=0;
   return good('submit',{expanded:true,orderKind:kind,id,coins:task.coins,xp:task.xp,levelUps,phase:task.phase,totalPhases:task.totalPhases,phaseLabel:task.phaseLabel,region:task.region,campaignTask:clone(CAMPAIGN_TASKS[this.s.campaign.completed-1]),chapterDone:this.s.campaign.completed===CAMPAIGN_TASKS.length||CAMPAIGN_TASKS[this.s.campaign.completed].chapter!==task.chapter,finished:this.s.campaign.completed===CAMPAIGN_TASKS.length});
  }else if(kind==='main'){this.s.delivered=true;this.s.stars++;if(this.s.stage===0)this.s.tutorial='build';}
  else if(kind==='side'){this.s.sideCompleted++;this.s.sideOrders[slot]=this.makeSide(slot);}
  else{const first=!this.s.world.souvenirs[task.souvenirKey];if(first&&!this.s.world.equipped[task.souvenirRegion])this.s.world.equipped[task.souvenirRegion]=task.souvenirKey;const result=this.resultContext(task);this.s.tea.lastResult=result;if(first)this.s.world.souvenirs[task.souvenirKey]=clone(result);this.s.tea.round++;return good('submit',{orderKind:kind,id,coins:task.coins,xp:task.xp,levelUps,firstSouvenir:first,result:clone(result)});}
  return good('submit',{orderKind:kind,id,coins:task.coins,xp:task.xp,levelUps,phase:task.phase,totalPhases:task.totalPhases,phaseLabel:task.phaseLabel,region:this.s.world.region});
 }
 build(style=0){
  if(this.s.stage>=24)return bad('FINISHED','小屋已经准备好迎接每一天啦。');
  if(!this.s.delivered||this.s.stars<1)return bad('NEED_ORDER','先完成这一项心愿订单，获得心愿星。');
  if(![0,1].includes(style))return bad('STYLE','请选择一种布置颜色。');
  this.invalidate();const stage=this.s.stage;this.s.decorStyles[stage]=style;this.s.stars--;this.s.delivered=false;this.s.stage++;this.s.mainPrepStep=0;this.s.stats.build++;this.s.world.region=DECOR[stage].region;
  const levelUps=this.gainXP(CFG.buildXP);let opened=0;
  this.s.board=this.s.board.map(t=>{if(t?.k==='crate'&&t.openAt<=this.s.stage){opened++;return null;}return t;});
  const unlocked=CATS.filter(c=>CHAINS[c].unlock===this.s.stage);
  for(const c of unlocked){const p=this.s.producers[c];p.stock=stockCap(p);p.at=this.s.lastSeen;}
  if(stage===0)this.s.tutorial='produce';
  const chapterDone=this.s.stage%4===0;
  if(chapterDone){this.s.coins+=CFG.chapterCoins;this.s.bag.scissors++;const c=this.unlockedCats().at(-1),l=[4,8,12].includes(this.s.stage)?1:2;this.s.world.chapterGifts.push({k:'item',c,l},{k:'item',c,l});this.flushChapterGifts();}
  const memories=this.checkMemories();if(this.s.stage===24)this.s.tea.firstVisit='available';
  return good('build',{stage,region:DECOR[stage].region,unlocked,opened,chapterDone,chapter:Math.floor(stage/4),finished:this.s.stage===24,levelUps,memories});
 }
 redecorate(id,style){
  if(!Number.isInteger(id)||id<0||id>=this.s.stage||![0,1].includes(style))return bad('DECOR','这个角落还没布置好。');
  this.invalidate();this.s.decorStyles[id]=style;return good('redecorate',{id,style});
 }
 moveDecor(id,x,y){
  if(!Number.isInteger(id)||id<0||id>=this.s.stage||!DECOR[id])return bad('DECOR','这个角落还没布置好。');
  if(!Number.isFinite(x)||!Number.isFinite(y))return bad('POSITION','请把家具放在画面里。');
  const p=decorPlacement(id,{x,y});
  this.invalidate();this.s.decorPositions[id]={x:p.x,y:p.y};
  return good('moveDecor',{id,region:p.region,x:p.x,y:p.y});
 }
 resetDecorPosition(id){
  if(!Number.isInteger(id)||id<0||id>=this.s.stage||!DECOR[id])return bad('DECOR','这个角落还没布置好。');
  this.invalidate();delete this.s.decorPositions[id];const p=decorPlacement(id);
  return good('resetDecorPosition',{id,region:p.region,x:p.x,y:p.y});
 }
 store(index){
  if(this.s.stage===0)return bad('TUTORIAL','先完成门垫的小心愿，就能自由整理啦。');
  const t=this.s.board[index];if(t?.k!=='item'||t.dust)return bad('ITEM','只能收纳已经解开的物品。');
  if(this.s.storage.length>=this.s.capacity)return bad('STORAGE_FULL','仓库满啦。可以取出物品，或扩容。');
  this.invalidate();this.s.storage.push(t);this.s.board[index]=null;return good('store');
 }
 retrieve(index,source='storage'){
  if(!['storage','pending'].includes(source))return bad('SOURCE','找不到这个物品。');
  const arr=this.s[source];if(!Number.isInteger(index)||index<0||index>=arr.length)return bad('ITEM','物品已经被取走了。');
  const idx=this.empty();if(idx<0)return bad('FULL','棋盘还没空位，物品会继续安全保存在这里。');
  this.invalidate();const [t]=arr.splice(index,1);this.s.board[idx]=t;if(source==='pending')this.flushChapterGifts();const discovery=this.discover(t.c,t.l);return good('retrieve',{idx,c:t.c,l:t.l,discovery});
 }
 sell(index){
  if(this.s.stage===0)return bad('TUTORIAL','先完成第一张心愿，再来整理物品吧。');
  const t=this.s.board[index];if(t?.k!=='item'||t.dust)return bad('ITEM','工作台、尘封物品和木箱不能出售。');
  this.invalidate();const coins=mass(t);this.s.board[index]=null;this.s.coins+=coins;this.s.stats.sold++;return good('sell',{coins});
 }
 split(index){
  if(this.s.stage===0)return bad('TUTORIAL','先完成门口的小心愿吧。');
  const t=this.s.board[index],idx=this.empty();
  if(t?.k!=='item'||t.dust||t.l<=1)return bad('SPLIT','只能把二级以上的普通物品拆成两个低一级物品。');
  if(this.s.bag.scissors<=0)return bad('SCISSORS','剪刀用完了。小铺和章节奖励里都有。');
  if(idx<0)return bad('FULL','拆分需要多一个空格，剪刀不会被扣除。');
  this.invalidate();this.s.bag.scissors--;this.s.board[index]={k:'item',c:t.c,l:t.l-1};this.s.board[idx]={k:'item',c:t.c,l:t.l-1};const discovery=this.discover(t.c,t.l-1);return good('split',{idx,c:t.c,l:t.l-1,discovery});
 }
 sort(){
  if(this.s.stage===0)return bad('TUTORIAL','先把第一张心愿做好，稍后再整理吧。');
  this.invalidate();const movable=this.s.board.filter(t=>t?.k==='item'&&!t.dust).sort((a,b)=>CATS.indexOf(a.c)-CATS.indexOf(b.c)||a.l-b.l);
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
 resolveTarget(target){
  if(!target||typeof target!=='object')return null;
  if(target.kind==='main'){const o=this.mainOrder();return o&&!this.s.delivered&&target.id===o.id&&(!o.expanded&&o.totalPhases===1||target.step===o.phase)?o:null;}
  if(target.kind==='side')return this.s.sideOrders.find(o=>o.id===target.id)||null;
  if(target.kind==='tea'){const o=this.teaOrder();return o.available&&o.id===target.id?o:null;}
  return null;
 }
 quoteParcel(target,c){
  const task=this.resolveTarget(target);if(!task)return bad('STALE','目标已更新，请重新选择需要补给的订单。');
  const sources=[...new Set(task.needs.filter(r=>this.count(r.c,r.l)<r.n).map(r=>r.c))];if(!sources.length)return bad('READY','这个目标的材料已经备齐，不需要再买补给。');
  if(c===undefined&&sources.length>1)return bad('SOURCE','请选择仍缺材料的来源。');c=c??sources[0];
  if(!sources.includes(c)||!this.unlocked(c))return bad('SOURCE','请选择这张订单仍缺材料的来源。');
  return good('parcelQuote',{target:clone(target),source:c,sources,items:[1,1,1,2].map(l=>({k:'item',c,l})),price:CFG.parcelCost,targetName:task.name});
 }
 buy(key,quote){
  const costs={scissors:CFG.scissorCost,parcel:CFG.parcelCost};
  if(!(key in costs))return bad('SHOP','没有这种商品。');
  let parcel;if(key==='parcel'){
   if(!quote?.ok||quote.kind!=='parcelQuote')return bad('QUOTE','先查看补给的目标、来源和内容，再确认购买。');
   parcel=this.quoteParcel(quote.target,quote.source);if(!parcel.ok)return parcel;
   if(quote.price!==parcel.price||JSON.stringify(quote.items)!==JSON.stringify(parcel.items))return bad('QUOTE','补给预览已改变，请重新查看。');
  }
  if(this.s.coins<costs[key])return bad('COINS','金币不够，可以先完成邻里委托。');
  if(key==='parcel'&&this.s.pending.length>996)return bad('QUEUE','待领物品太多啦，请先取出一些。');
  this.invalidate();this.s.coins-=costs[key];
  if(key==='scissors')this.s.bag.scissors++;
  if(key==='parcel'){
   this.s.pending.push(...clone(parcel.items));
  }
  return good('buy',{key,...(parcel?{target:parcel.target,source:parcel.source,items:parcel.items}:{} )});
 }
 usePack(){return bad('REMOVED','体力点心已取消，仅自然恢复和升级增加体力。');}
 rest(){return bad('REMOVED','体力补充已取消，仅自然恢复和升级增加体力。');}
 refreshSide(slot,now=Date.now()){
  this.tick(now);
  if(![0,1].includes(slot)||this.s.stage===0)return bad('ORDER','先完成第一项小屋心愿。');
  if(now<this.s.sideRefreshAt[slot])return bad('COOLDOWN','刚刚换过纸条，稍等一小会儿。');
  this.invalidate();this.s.sideOrders[slot]=this.makeSide(slot);this.s.sideRefreshAt[slot]=now+CFG.sideCooldown;return good('refresh');
 }
 dailyGift(now=Date.now()){
  this.tick(now);if(this.s.daily.gift)return bad('CLAIMED','今天的小礼物已经收好啦。');
  this.invalidate();this.s.daily.gift=true;this.s.coins+=CFG.dailyGiftCoins;this.s.bag.scissors++;return good('dailyGift');
 }
 claimDaily(key,now=Date.now()){
  this.tick(now);const d=DAILY.find(x=>x.key===key);if(!d)return bad('DAILY','没有找到这个小目标。');
  if(this.s.daily.claimed.includes(key))return bad('CLAIMED','这份奖励已经领取了。');
  if(this.s.daily[key]<d.target)return bad('INCOMPLETE','小目标还没完成，不用着急。');
  this.invalidate();this.s.daily.claimed.push(key);this.s.coins+=d.coins;return good('dailyReward',{key});
 }
 setting(key,value){
  if(!['sound','music','reducedMotion'].includes(key)||typeof value!=='boolean')return bad('SETTING','无法更改这项设置。');
  this.invalidate();this.s.settings[key]=value;return good('setting',{key,value});
 }
 markIntro(){this.invalidate();this.s.introSeen=true;return good('intro');}
 markFinished(){this.invalidate();this.s.finishedSeen=true;return good('finished');}
 hint(orderMode='main'){
  const tea=orderMode==='tea',side=!tea&&(orderMode==='side'||!this.mainOrder());
  if(!side&&!tea&&this.s.delivered)return {kind:'build'};
  const orders=tea?(this.teaOrder().available?[this.teaOrder()]:[]):side?this.s.sideOrders:[this.mainOrder()].filter(Boolean);
  if(!side&&!tea&&orders[0]?.lesson){const c=orders[0].lesson;return {kind:'produce',c,idx:CATS.indexOf(c),lesson:true};}
  if(tea&&!orders.length)return {kind:'locked',message:'先认领小苗，并亲手认识每个工作台。'};
  const ready=orders.find(o=>this.canFulfill(o.needs));
  if(ready)return {kind:'submit',orderKind:tea?'tea':side?'side':'main',id:ready.id,...(!side&&!tea&&(ready.expanded||ready.totalPhases>1)?{step:ready.phase}:{})};
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
 export(){return JSON.stringify({game:'bubu-yier-cozy-home',version:APP_VERSION,exportedAt:new Date().toISOString(),state:this.s},null,2);}
}

/** Reject malformed imports before replacing the live state. Keep strict, bounded data shapes. */
export function validateState(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('存档不是有效对象。');
 const s=clone(raw.game==='bubu-yier-cozy-home'?raw.state:raw);
 if(!s||![1,SCHEMA_VERSION].includes(s.schema))throw Error('不支持的存档版本。');
 const legacy=s.schema===1;
 // Repair the old chapter-award overflow without touching the caller's save object.
 if(s.world===undefined){s.world=freshWorld();if(Array.isArray(s.pending)&&s.pending.length>1000&&s.pending.length<=1012)s.world.chapterGifts=s.pending.splice(1000);}
 if(legacy){
  s.schema=SCHEMA_VERSION;
  s.producerLessons=Object.fromEntries(CATS.map(c=>[c,c==='clean'||CHAINS[c].unlock<=s.stage]));
  s.mainPrepStep=s.delivered?(TASKS[s.stage]?.phases?.length||0):0;
  s.tea={...freshTea(),firstVisit:s.stage===24?'available':'locked'};
  if(s.world&&typeof s.world==='object'){
   s.world.memoryUnlocked=Object.fromEntries(REGIONS.map(r=>[r.id,(s.world.activities?.[r.id]?.count||0)>=3]));
   s.world.souvenirs={};s.world.equipped=Object.fromEntries(REGIONS.map(r=>[r.id,null]));
  }
 }
 const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
 const check=(ok,msg)=>{if(!ok)throw Error(msg);};
 if(s.campaign===undefined)s.campaign={completed:0,step:0};
 if(s.sideCompleted===undefined)s.sideCompleted=0;
 check(s.campaign&&typeof s.campaign==='object'&&!Array.isArray(s.campaign)&&Object.keys(s.campaign).length===2&&integer(s.campaign.completed,0,CAMPAIGN_TASKS.length)&&integer(s.campaign.step,0,2),'扩展主线进度无效。');
 check(s.stage===24?(s.campaign.completed===CAMPAIGN_TASKS.length?s.campaign.step===0:s.campaign.step<CAMPAIGN_TASKS[s.campaign.completed].steps.length):s.campaign.completed===0&&s.campaign.step===0,'扩展主线阶段无效。');
 check(integer(s.sideCompleted,0,100000000),'循环委托完成记录无效。');
 if(s.residents===undefined)s.residents=freshResidents();
 check(validResidents(s.residents),'角色位置记录无效。');
 for(const k of ['createdAt','lastSeen','energyAt'])check(integer(s[k],0,9007199254740000),`时间字段 ${k} 无效。`);
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
 check(s.bag&&integer(s.bag.scissors,0,100000),'道具数量无效。');
 check(s.stats&&['merge','produce','order','build','sold','unweb'].every(k=>integer(s.stats[k],0,100000000)),'累计记录无效。');
 check(s.stats.build===s.stage,'修缮次数不一致。');
 check(s.producerLessons&&CATS.every(c=>typeof s.producerLessons[c]==='boolean')&&s.producerLessons.clean,'来源教学记录无效。');
 const phaseCount=TASKS[s.stage]?.phases?.length||0;
 check(integer(s.mainPrepStep,0,phaseCount)&&(!phaseCount?s.mainPrepStep===0:(s.delivered?s.mainPrepStep===phaseCount:s.mainPrepStep<phaseCount)),'准备阶段记录无效。');
 check(s.daily&&/^\d{4}-\d{2}-\d{2}$/.test(s.daily.day)&&['merge','produce','order'].every(k=>integer(s.daily[k],0,100000000))&&typeof s.daily.gift==='boolean','每日记录无效。');
 check(Array.isArray(s.daily.claimed)&&new Set(s.daily.claimed).size===s.daily.claimed.length&&s.daily.claimed.every(k=>DAILY.some(d=>d.key===k)),'每日奖励无效。');
 check(Array.isArray(s.decorStyles)&&s.decorStyles.length===24&&s.decorStyles.every((v,i)=>i<s.stage?[0,1].includes(v):v===null),'布置记录无效。');
 const positions=(p,stage)=>p&&typeof p==='object'&&!Array.isArray(p)&&Object.entries(p).length<=stage&&Object.entries(p).every(([key,v])=>{
  const id=Number(key),b=decorBounds(id);
  return String(id)===key&&integer(id,0,stage-1)&&b&&v&&typeof v==='object'&&!Array.isArray(v)&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.x>=b.minX&&v.x<=b.maxX&&v.y>=b.minY&&v.y<=b.maxY&&Object.keys(v).every(k=>k==='x'||k==='y');
 });
 if(s.decorPositions===undefined)s.decorPositions={};
 check(positions(s.decorPositions,s.stage),'家具位置记录无效。');
 check(s.seen&&typeof s.seen==='object'&&!Array.isArray(s.seen)&&Object.entries(s.seen).every(([k,v])=>{const[c,l]=k.split('-');return v===true&&CATS.includes(c)&&integer(+l,1,6);}), '图鉴记录无效。');
 check(Array.isArray(s.sideOrders)&&[0,2].includes(s.sideOrders.length),'邻里订单数量无效。');
 check(s.sideOrders.every(o=>o&&typeof o.id==='string'&&o.id.length<40&&typeof o.name==='string'&&o.name.length<60&&typeof o.wish==='string'&&o.wish.length<200&&integer(o.coins,1,1000)&&Array.isArray(o.needs)&&o.needs.length>=1&&o.needs.length<=('loop'in o?9:3)&&o.needs.every(r=>CATS.includes(r.c)&&CHAINS[r.c].unlock<=s.stage&&integer(r.l,1,6)&&integer(r.n,1,3))),'邻里订单内容无效。');
 s.sideOrders.forEach((o,slot)=>{
  if(!('loop'in o)){
   check(['slot','tier','completedAt','levelAt','mass'].every(k=>!(k in o)),'邻里订单附加记录无效。');
   return;
  }
  check(s.stage===24&&o.slot===slot&&integer(o.completedAt,0,s.sideCompleted)&&integer(o.levelAt,1,CFG.maxPlayerLevel)&&o.levelAt<=levelOf(s)&&o.tier===campaignSideTier(o.levelAt)&&o.loop===Math.floor(o.completedAt/12)+1,'循环委托难度记录无效。');
  const expectedMass=CAMPAIGN_SIDE_MASS[o.tier][slot]+(slot===0?4:8)*(o.completedAt%3);
  check(o.mass===expectedMass&&needMass(o.needs)===expectedMass&&o.needs.every(r=>r.l>=3)&&new Set(o.needs.map(r=>itemKey(r.c,r.l))).size===o.needs.length,'循环委托材料预算无效。');
 });
 check(new Set(s.sideOrders.map(o=>o.id)).size===s.sideOrders.length,'邻里订单编号重复。');
 check(Array.isArray(s.sideRefreshAt)&&s.sideRefreshAt.length===2&&s.sideRefreshAt.every(t=>integer(t,0,9007199254740000)),'刷新时间无效。');
 check(s.settings&&['sound','music','reducedMotion'].every(k=>typeof s.settings[k]==='boolean'),'设置无效。');
 check(['merge','deliver','build','produce','done'].includes(s.tutorial)&&typeof s.introSeen==='boolean'&&typeof s.finishedSeen==='boolean','教学记录无效。');
 // Economic release version is independent of the storage schema and application name.
 const migrateSideRewards=s.economyVersion===undefined;
 if(migrateSideRewards){
  const oldLevel=Math.min(CFG.maxPlayerLevel,Math.floor(s.xp/60)+1),fraction=(s.xp%60)/60;
  s.xp=levelThreshold(oldLevel)+(oldLevel===CFG.maxPlayerLevel?0:Math.floor(fraction*levelCost(oldLevel)));
  if(s.bag.energyPacks!==undefined){check(integer(s.bag.energyPacks,0,100000),'旧体力点心数量无效。');s.coins=Math.min(100000000,s.coins+s.bag.energyPacks*CFG.legacyPackCoins);}
  s.economyVersion=CFG.economyVersion;
 }
 check(s.economyVersion===CFG.economyVersion,'不支持的经济版本。');
 s.energy=Math.min(CFG.energyCap,s.energy);delete s.bag.energyPacks;delete s.settings.calm;delete s.restAt;
 if(s.levelGiftsClaimed===undefined)s.levelGiftsClaimed=[];
 check(Array.isArray(s.levelGiftsClaimed)&&new Set(s.levelGiftsClaimed).size===s.levelGiftsClaimed.length&&s.levelGiftsClaimed.every(l=>levelGift(l,s.stage)&&l<=levelOf(s)),'升级礼包领取记录无效。');
 for(const o of s.sideOrders){
  if(migrateSideRewards){o.coins=8+2*needMass(o.needs);o.xp=orderXP(o.needs);}
  check(o.coins===8+2*needMass(o.needs)&&o.xp===orderXP(o.needs),'邻里订单奖励无效。');delete o.energy;
 }
 const result=clone(s);
 const w=result.world;
 check(w&&typeof w==='object'&&!Array.isArray(w)&&REGIONS.some(r=>r.id===w.region),'家园区域记录无效。');
 check(w.activities&&typeof w.activities==='object'&&!Array.isArray(w.activities)&&REGIONS.every(r=>{const a=w.activities[r.id];return a&&integer(a.count,0,100000000)&&typeof a.day==='string'&&(a.day===''||/^\d{4}-\d{2}-\d{2}$/.test(a.day))&&a.day<=s.daily.day&&(a.count===0?a.day==='':a.day!=='');}),'家园互动记录无效。');
 check(Array.isArray(w.chapterGifts)&&w.chapterGifts.length<=Math.floor(s.stage/4)*2&&w.chapterGifts.every(t=>item(t)&&!t.dust),'章节礼物记录无效。');
 check(w.memoryUnlocked&&REGIONS.every(r=>typeof w.memoryUnlocked[r.id]==='boolean'),'生活回忆记录无效。');
 const tea=result.tea;
 check(tea&&integer(tea.round,0,100000000)&&Object.hasOwn(TEA_PLANS,tea.plan)&&['locked','available','arrived'].includes(tea.firstVisit)&&(s.stage===24?tea.firstVisit!=='locked':tea.firstVisit==='locked'),'茶会记录无效。');
 const context=(r)=>r&&['tea','firstVisit'].includes(r.kind)&&typeof r.id==='string'&&r.id.length<60&&integer(r.round,0,100000000)&&Object.hasOwn(TEA_PLANS,r.plan)&&TEA_CONDITIONS.some(c=>c.id===r.condition)&&REGIONS.some(a=>a.id===r.region)&&Array.isArray(r.participants)&&r.participants.length>=2&&r.participants.length<=3&&r.participants[0]==='bubu'&&r.participants[1]==='yier'&&(r.participants.length===2||r.participants[2]==='xiaoli')&&integer(r.stage,13,24)&&Array.isArray(r.decorStyles)&&r.decorStyles.length===24&&r.decorStyles.every((v,i)=>i<r.stage?[0,1].includes(v):v===null)&&(r.kind==='firstVisit'?r.stage===24&&r.souvenirKey===null:SOUVENIRS.some(a=>a.key===r.souvenirKey&&a.plan===r.plan&&a.condition===r.condition));
 check(tea.lastResult===null||context(tea.lastResult),'茶会展示记录无效。');
 check(w.souvenirs&&typeof w.souvenirs==='object'&&!Array.isArray(w.souvenirs)&&Object.entries(w.souvenirs).length<=6&&Object.entries(w.souvenirs).every(([key,r])=>SOUVENIRS.some(a=>a.key===key)&&r.kind==='tea'&&r.souvenirKey===key&&context(r)),'纪念物收藏无效。');
 check(w.equipped&&REGIONS.every(region=>{const key=w.equipped[region.id];return key===null||!!w.souvenirs[key]&&SOUVENIRS.some(a=>a.key===key&&a.region===region.id);}),'纪念物摆放无效。');
 // Older result snapshots did not record display slots. Show empty slots rather
 // than borrowing decorations the player equipped after the remembered event.
 for(const record of [tea.lastResult,...Object.values(w.souvenirs)].filter(Boolean)){
  if(record.decorPositions===undefined)record.decorPositions={};
  check(positions(record.decorPositions,record.stage),'家具位置展示快照无效。');
  if(record.equipped===undefined)record.equipped=Object.fromEntries(REGIONS.map(r=>[r.id,null]));
  check(record.equipped&&REGIONS.every(region=>{const key=record.equipped[region.id];return key===null||SOUVENIRS.some(a=>a.key===key&&a.region===region.id);}),'纪念位展示快照无效。');
 }
 // Refresh text from the remembered event, never from today's guests or layout.
 for(const record of [tea.lastResult,...Object.values(w.souvenirs)].filter(Boolean))record.response=record.kind==='firstVisit'?firstVisitResponse(record.participants):teaResponse(record.plan,record.condition,record.participants.includes('xiaoli'));
 for(const order of result.sideOrders){
  const index=previousSideFlavor.findIndex(([name,wish])=>order.name===name&&order.wish===wish);
  if(index>=0){[order.name,order.wish]=SIDE_FLAVOR[index];}
 }
 return result;
}
