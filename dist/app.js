/* 2026-10-08T02:43:00.257Z | locally built; no network dependencies */
window.__ASSET_IDS__=["app-icon","atlas-bake","atlas-clean","atlas-craft","atlas-decor-a","atlas-decor-b","atlas-decor-c","atlas-decor-d","atlas-garden","atlas-generators","atlas-tea","atlas-tools","bubu-back","bubu-face","bubu-happy","bubu-idle","bubu-joy","bubu-side","bubu-sit","bubu-sleep","bubu-surprise","bubu-turn","bubu-walk","cozy-loop","paper-texture","party-memory","region-courtyard","region-garden","region-house","story-companion","story-garden","story-night","story-rest","util-coin","util-crate","util-energy","util-gift","util-scissors","util-star","util-storage","world-map","yier-back","yier-face","yier-happy","yier-idle","yier-joy","yier-paint","yier-rest","yier-shy","yier-side","yier-surprise","yier-turn","yier-walk"];
(function(){'use strict';
/** All story, progression, art coordinates, and economy data. No UI state here. */
const VERSION = 1;
const TITLE = '布布一二 · 好日子小屋';
const CATS = ['clean','tools','bake','tea','craft','garden'];
const CHAINS = {
  clean:{name:'把家擦亮',producer:'清洁篮',unlock:0,color:'#c6d7ba',items:['小方巾','软海绵','清洁喷雾','小刷子','轻巧拖把','清洁推车'],desc:'从手边的小方巾，到能照顾整间屋子的清洁工具。'},
  tools:{name:'修修补补',producer:'修理箱',unlock:2,color:'#e8b5a6',items:['小螺丝','螺丝刀','小木锤','手锯','电钻','全套工具箱'],desc:'布布的拿手事：松掉的地方，慢慢修好。'},
  bake:{name:'甜甜一口',producer:'小烤箱',unlock:4,color:'#ecd2a4',items:['面粉袋','软面团','暖面包','草莓纸杯糕','双层小蛋糕','三层点心塔'],desc:'备料、揉面、烘焙，把今天的快乐分成几份。'},
  tea:{name:'一起喝杯茶',producer:'泡茶台',unlock:6,color:'#c1d7d0',items:['茶叶罐','花纹瓷杯','一杯花草茶','圆肚茶壶','双人茶盘','茶点推车'],desc:'杯子要两只；忙的时候也记得坐一会儿。'},
  craft:{name:'画点小心思',producer:'画画箱',unlock:8,color:'#e2c0b7',items:['铅笔','蜡笔盒','调色盘','小风景画','纸鲸风铃','绘画工作台'],desc:'一二的想象，从一根铅笔开始长大。'},
  garden:{name:'花园会开花',producer:'园艺篮',unlock:12,color:'#c7d7af',items:['种子包','小幼苗','绿叶盆栽','雏菊盆栽','郁金香花束','双层花架'],desc:'照顾一颗种子，也照顾慢慢长出来的期待。'},
};
const CFG={boardSize:49,cols:7,maxLevel:6,energyCap:100,energyEvery:15000,stockEvery:6000,stockBase:18,stockPerLevel:6,storageBase:8,storageMax:24,restAmount:30,restCooldown:60000,upgradeCosts:[140,400],scissorCost:45,energyCost:60,parcelCost:65,sideCooldown:15000,levelEnergy:5,levelCoins:20,chapterEnergy:10,chapterCoins:60,dailyGiftEnergy:20};
const CHAPTERS = [
 {name:'先把门打开',short:'迎着光',sub:'一束阳光，两双脚印。',memory:'门垫是软的',text:'门垫铺好的时候，一二特意踩了两下。布布没有催她进屋，只把第二双拖鞋放在旁边。',pose:['bubu-idle','yier-joy']},
 {name:'热乎乎的下午',short:'甜一口',sub:'面包刚好，茶也刚好。',memory:'留给你的那一口',text:'布布说只尝一小口。小蛋糕少了半边。一二瞪了他一会儿，把自己那半边也往中间推了推。',pose:['bubu-sit','yier-happy']},
 {name:'给想象留个角',short:'画晴天',sub:'画歪一点，也很可爱。',memory:'会飞的纸鲸',text:'纸鲸不会游泳，却能在花园里飞。风来的时候，布布伸手扶了一下线；一二说，让它自己试试嘛。',pose:['bubu-turn','yier-paint']},
 {name:'花园会开花',short:'等花开',sub:'慢一点的事，一起等。',memory:'今天也长高了一点',text:'一二每天量小苗的身高，布布每天悄悄把尺子扶正。花开那天，两只都说，早就知道你能行。',pose:['bubu-joy','yier-turn']},
 {name:'不赶时间的晚上',short:'慢慢读',sub:'灯暖着，故事慢慢讲。',memory:'没有收完的今天',text:'相册没有排整齐，茶杯也还没洗。一二已经靠着软垫睡着了。布布把灯调暗：留一点明天再做。',pose:['bubu-sit','yier-rest']},
 {name:'今天请你来坐坐',short:'来做客',sub:'原来，好日子可以分给别人。',memory:'把好日子分给大家',text:'第一次庭院聚会，没有一件东西完全照着计划来。可茶是热的，灯是亮的，身边的那只熊，一直都在。',pose:['bubu-joy','yier-joy']},
];
const INTRO = [
 {who:'yier',pose:'turn',title:'一间空屋，两个小小的愿望',text:'臭布布，你看！窗边这一块，晒太阳一定很舒服。',aside:'午后，巷子尽头。旧屋的门被轻轻推开。'},
 {who:'bubu',pose:'idle',title:'先不急着变得很厉害',text:'嗯……就是门口有一点灰。我先擦擦，一二宝别把脚弄脏了。',aside:'旧家具和纸箱还在。布布从里面翻出了一条小方巾。'},
 {who:'yier',pose:'joy',title:'把喜欢的日子装进来',text:'这里喝茶，那里画画！等花开了，还可以请大家来坐坐。',aside:'一二说得很快，布布一件一件记下来。'},
 {who:'bubu',pose:'happy',title:'那就，从这一小块开始',text:'好。我们慢慢来，把小小的愿望，一个一个变成真的。',aside:'先把两块相同的小方巾合在一起吧。'},
];
const R=(c,l,n=1)=>({c,l,n});
// Stage = number of completed renovations. Every source is unlocked before its first requirement.
const TASKS = [
 {name:'铺一块软软的门垫',who:'bubu',wish:'先擦干净门口，不然脚印会排着队进屋。',needs:[R('clean',2)],after:[['yier','joy','我试过了，踩起来软乎乎！'],['bubu','idle','那把另一边留给我，我们一起进门。']]},
 {name:'让窗帘接住阳光',who:'yier',wish:'把窗边擦亮吧。我想给阳光留个位置。',needs:[R('clean',3)],after:[['yier','turn','光真的落进来了，像一块暖暖的小饼干。'],['bubu','happy','这个不能吃。一二宝可以先晒一会儿。']]},
 {name:'立起第一块小屋牌',who:'bubu',wish:'牌子有点松。找到螺丝刀，再把木板擦一擦。',needs:[R('tools',2),R('clean',2)],after:[['yier','happy','写什么好呢？豪华超级大……'],['bubu','turn','写“好日子小屋”吧。我们住得开心，就算豪华。']]},
 {name:'点亮门边的小灯',who:'yier',wish:'门边少一盏灯。天黑回来的时候，也要被好好迎接。',needs:[R('tools',3)],after:[['bubu','idle','装好了。站远一点看看，歪不歪？'],['yier','joy','不歪！以后晚归的臭布布，就不会找错门啦。']]},
 {name:'收拾香香的烘焙架',who:'yier',wish:'第一团面，要留给我们的第一炉小面包。',needs:[R('bake',2)],after:[['yier','happy','面团有一点点像你的肚子。'],['bubu','surprise','那……揉的时候轻一点。']]},
 {name:'把小圆桌修稳',who:'bubu',wish:'垫稳桌脚，再放一只热面包。它就不是空桌子了。',needs:[R('tools',3),R('bake',3)],after:[['bubu','idle','这回放几杯茶都不会晃。'],['yier','turn','我还没说你刚才一直扶着桌子呢。']]},
 {name:'准备两只杯子',who:'bubu',wish:'杯子要两只；热面包，一人一半。',needs:[R('tea',2,2),R('bake',3)],after:[['yier','happy','你的杯子比我的满一点。'],['bubu','happy','因为你刚才喝了一口呀。']]},
 {name:'把下午过得软一点',who:'yier',wish:'煮一壶茶，做一个小蛋糕，坐垫也要摆成两份。',needs:[R('tea',4),R('bake',4)],after:[['bubu','sit','我就尝一小口。'],['yier','surprise','臭布布！你的“一小口”怎么还会长大呀！']]},
 {name:'给一二支起小画架',who:'bubu',wish:'蜡笔先放好。一二宝的想象，得有个稳稳的地方落下。',needs:[R('craft',2)],after:[['yier','paint','我的第一张画，要画小屋和你。'],['bubu','turn','那把我画在离你近一点的地方。']]},
 {name:'铺开颜料小地毯',who:'yier',wish:'修好毯边，调一点喜欢的颜色。滴出来也没关系。',needs:[R('craft',3),R('tools',3)],after:[['yier','happy','这块地毯可以接住失手的颜料。'],['bubu','happy','那也帮我接住一点紧张，我怕踩到你的画。']]},
 {name:'为纸鲸画一片天空',who:'yier',wish:'先画一张晴天，再让纸鲸从画里飞出来。',needs:[R('craft',4)],after:[['bubu','surprise','鲸鱼不是应该在水里吗？'],['yier','joy','这只是爱晒太阳的鲸鱼。和我们一样！']]},
 {name:'把小风景挂上墙',who:'bubu',wish:'风铃和花草茶都备好，挂完画就歇一歇。',needs:[R('craft',5),R('tea',3)],after:[['yier','turn','画里的屋子，好像比真的还整齐。'],['bubu','happy','真的这间多了你，我更喜欢真的。']]},
 {name:'认领第一盆小生命',who:'yier',wish:'挑一株精神的小幼苗。我们会好好照顾它。',needs:[R('garden',2)],after:[['yier','joy','它以后会长得比你还高吗？'],['bubu','idle','会吧。到时候换它替你挡太阳。']]},
 {name:'装好花园小花箱',who:'bubu',wish:'把花园边的花箱洗干净，再把绿叶安稳放进去。',needs:[R('garden',3),R('clean',3)],after:[['bubu','turn','这里有阳光，也不会挡住散步的小路。'],['yier','happy','还给它留了看风景的位置，你想得好细。']]},
 {name:'搭一面会开花的墙',who:'yier',wish:'木架的长度要正好，让雏菊靠一靠。',needs:[R('garden',4),R('tools',4)],after:[['yier','turn','我想快一点看到整面花墙。'],['bubu','idle','我也是。不过今天有这两朵，就已经很好看了。']]},
 {name:'把绿意挂得高一点',who:'bubu',wish:'备好花束，喝一口茶，再慢慢固定吊盆。',needs:[R('garden',5),R('tea',3)],after:[['yier','happy','风一吹，叶子就在和我们招手。'],['bubu','joy','那也和它打个招呼。你好呀，小邻居。']]},
 {name:'给喜欢的故事一个家',who:'bubu',wish:'锯好书架隔板，给书脊挑一点温柔的颜色。',needs:[R('tools',4),R('craft',3)],after:[['yier','turn','这里怎么故意空了一格？'],['bubu','happy','留给还没一起读过的故事。']]},
 {name:'准备不赶时间的软椅',who:'yier',wish:'泡好茶，留一块蛋糕。今晚不急着做下一件事。',needs:[R('tea',4),R('bake',4)],after:[['yier','shy','我们什么都不做，也算好好过一天吗？'],['bubu','sit','算。和你一起歇着，也是很重要的一件事。']]},
 {name:'调一盏刚刚好的灯',who:'bubu',wish:'固定灯座，别让刺眼的光打扰一二宝看书。',needs:[R('tools',5)],after:[['yier','happy','再暗一点点。对，就是现在这样。'],['bubu','turn','记住了。下次不用你再说。']]},
 {name:'收好今天的小回忆',who:'yier',wish:'把纸鲸和雏菊的样子记下来。它们也在陪我们长大。',needs:[R('craft',5),R('garden',4)],after:[['bubu','turn','有一张照片拍糊了，要不要重拍？'],['yier','shy','不要。那张里面，你刚好笑得最开心。']]},
 {name:'写一张小小邀请',who:'yier',wish:'给庭院挂起小旗，告诉路过的人：这里可以坐坐。',needs:[R('craft',5),R('tools',4)],after:[['bubu','surprise','要是来的客人很多，怎么办？'],['yier','happy','就把庭院里的长桌也摆出来嘛。']]},
 {name:'把春天铺到门外',who:'bubu',wish:'摆好花束和茶盘，野餐垫就在门前的树影下。',needs:[R('garden',5),R('tea',4)],after:[['yier','turn','这不是我们之前量好的地方。'],['bubu','happy','这里有阴凉。一二宝晒久了会眯眼睛。']]},
 {name:'做一桌可以分享的甜',who:'yier',wish:'今天多做一点。点心塔和茶盘，要够大家一起分。',needs:[R('bake',6),R('tea',5)],after:[['bubu','sit','这一次，我真的只尝了一小口。'],['yier','happy','我看见啦。所以这块最大的，奖励给你。']]},
 {name:'好日子小屋，开门啦',who:'bubu',wish:'摆好花架和画，端上蛋糕。最后这一步，我们一起。',needs:[R('garden',6),R('craft',6),R('bake',5)],after:[['yier','joy','布布，我们真的把它变成家了！'],['bubu','happy','嗯。一二宝，明天也一起慢慢过吧。']]},
].map((t,i)=>({...t,id:i,chapter:Math.floor(i/4),decor:`decor-${String(i+1).padStart(2,'0')}`,coins:18+t.needs.reduce((a,r)=>a+2**(r.l-1)*r.n*3,0),energy:2+Math.floor(i/8)}));
// Each near view has its own coordinates. Keep the central walkway clear for both characters.
const REGIONS = [
 {id:'house',name:'暖暖小屋',subtitle:'烤面包、喝茶，给故事留一个角落',unlock:0,background:'region-house',activityLabel:'一起喝杯茶',activityText:'布布把茶吹凉，一二把最后一块饼干掰成两半。',coins:8,energy:5,memoryName:'留下热乎乎的一口'},
 {id:'garden',name:'晴天小花园',subtitle:'花圃、纸鲸和慢慢长大的期待',unlock:0,background:'region-garden',activityLabel:'给花浇浇水',activityText:'一二扶住小苗，布布慢慢浇水。今天的叶子又精神了一点。',coins:8,energy:5,memoryName:'看见新叶的早晨'},
 {id:'courtyard',name:'门前小庭院',subtitle:'摆好点心，让好日子可以分给别人',unlock:0,background:'region-courtyard',activityLabel:'准备来客茶点',activityText:'两只熊一起擦好桌子，留出两只干净杯子，等朋友来坐坐。',coins:8,energy:5,memoryName:'给朋友留一个位置'},
];
const DECOR = [
 ['courtyard',53,47,22,1],['house',49,27,39,1],['courtyard',20,37,18,3],['courtyard',81,29,13,3],
 ['house',83,47,24,3],['house',74,73,30,6],['house',74,67,15,7],['house',26,67,21,6],
 ['house',18,45,22,4],['house',22,64,29,0],['garden',52,23,20,3],['house',78,23,23,1],
 ['garden',22,57,17,5],['garden',33,43,30,3],['garden',80,50,28,3],['garden',74,26,19,2],
 ['house',82,86,24,8],['house',28,85,26,8],['house',48,82,18,7],['house',73,86,18,9],
 ['courtyard',50,18,67,4],['courtyard',23,77,36,0],['courtyard',74,78,29,8],['garden',22,82,28,8],
].map(([region,x,y,w,z],i)=>({region,x,y,w,z,id:i}));
const DAILY = [
 {key:'merge',title:'合一合，松口气',target:15,coins:30,energy:8,desc:'完成 15 次合成'},
 {key:'order',title:'把小心愿送出去',target:3,coins:45,energy:10,desc:'完成 3 张主线或邻里订单'},
 {key:'produce',title:'今天也有新点子',target:25,coins:35,energy:8,desc:'从工作台取出 25 件物品'},
];
const SIDE_FLAVOR = [
 ['巷口留言','把小东西准备好，生活就方便一点。'],['下午的约定','不用赶，准备好了再送来就好。'],['邻里小纸条','今天也想分享一点热乎乎的心意。'],['窗边的请求','给平常的一天，添一点小颜色。'],['周末的准备','东西不用很多，合适就好。'],
];
const HOME_CHAT = [
 ['yier','joy','臭布布，我想再挪一下坐垫。就一点点。'],['bubu','happy','一二宝，忙完记得喝水。杯子给你放好了。'],['yier','shy','这里的东西，怎么每一件都有我们的故事呀。'],['bubu','turn','今天不用把所有事情都做完。我们还会有明天。'],['yier','happy','小屋又变可爱一点点啦！'],['bubu','sit','你看风，我看着茶。各自都有很重要的工作。'],
];
function itemName(c,l){return CHAINS[c]?.items[l-1]??'未知物品';}
function itemKey(c,l){return `${c}-${l}`;}
function mass(t){return t?.k==='item'?2**(t.l-1):0;}
function needMass(needs){return needs.reduce((n,r)=>n+2**(r.l-1)*r.n,0);}



/** Deterministic, DOM-free game model. Every public mutation validates before spending. */
const clone = (v)=>JSON.parse(JSON.stringify(v));
function localDay(t){const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
const levelOf=(s)=>Math.min(99,Math.floor(s.xp/60)+1);
const stockCap=(p)=>CFG.stockBase+(p.level-1)*CFG.stockPerLevel;
const good=(kind,extra={})=>({ok:true,kind,...extra});
const bad=(code,message)=>({ok:false,code,message});
const freshWorld=()=>({region:'house',activities:Object.fromEntries(REGIONS.map(r=>[r.id,{day:'',count:0}])),chapterGifts:[]});
function freshState(now=Date.now(),seed=20261007){
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

class GameEngine{
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
function validateState(raw){
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


/** Atlas lookup preserves the gameplay's item IDs. Each sheet has six square slots. */
const SPRITE_CATEGORIES = ['clean','tools','bake','tea','craft','garden'];
const atlasSlot = (asset, index) => ({asset, cols:3, rows:2, col:index%3, row:Math.floor(index/3), slotAspect:1, fit:'contain', inset:['atlas-tea','atlas-decor-b'].includes(asset)?0.125:0});

function spriteSpec(id) {
  if (typeof id !== 'string') return null;
  const item = /^(clean|tools|bake|tea|craft|garden)-([1-6])$/.exec(id);
  if (item) return atlasSlot(`atlas-${item[1]}`, Number(item[2])-1);
  const generator = /^gen-(clean|tools|bake|tea|craft|garden)$/.exec(id);
  if (generator) return atlasSlot('atlas-generators', SPRITE_CATEGORIES.indexOf(generator[1]));
  const decor = /^decor-?(\d{2})$/.exec(id);
  if (decor) {
    const index = Number(decor[1])-1;
    if (index >= 0 && index < 24) return atlasSlot(`atlas-decor-${'abcd'[Math.floor(index/6)]}`, index%6);
  }
  return null;
}

/** Display a slot's center, omitting specified transparent margins without editing PNGs. */
function drawSprite(ctx, image, spec, x, y, w, h) {
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  if (!iw || !ih || w <= 0 || h <= 0) return;
  const cols = spec?.cols || 1, rows = spec?.rows || 1;
  const slotW = iw / cols, slotH = ih / rows, inset = spec?.inset || 0;
  const sw = slotW * (1-2*inset), sh = slotH * (1-2*inset);
  const ratio = Math.min(w / sw, h / sh);
  const dw = sw * ratio, dh = sh * ratio;
  ctx.drawImage(image, ((spec?.col || 0)+inset)*slotW, ((spec?.row || 0)+inset)*slotH, sw, sh,
    x+(w-dw)/2, y+(h-dh)/2, dw, dh);
}

const SPRITE_ATLAS_IDS = [
  ...SPRITE_CATEGORIES.map(c=>`atlas-${c}`), 'atlas-generators',
  ...Array.from('abcd', letter=>`atlas-decor-${letter}`),
];
const WORLD_ASSET_IDS = ['region-house','region-garden','region-courtyard','world-map','party-memory','yier-rest'];





const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const esc=(v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=(id)=>window.__ASSETS__?.[id]||`assets/${id}.${id==='cozy-loop'?'wav':'png'}`;
const picture=(id,cls='',alt='')=>{
 const p=spriteSpec(id);
 if(!p)return `<img src="${asset(id)}" class="${cls}" alt="${esc(alt)}" draggable="false">`;
 const inset=p.inset||0,size=(1-2*inset)*100;
 return `<span class="sprite-shell ${cls}" role="img" aria-label="${esc(alt)}"><svg class="sprite-frame" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><svg width="100" height="100" viewBox="${inset*100} ${inset*100} ${size} ${size}" overflow="hidden"><image href="${asset(p.asset)}" x="${-p.col*100}" y="${-p.row*100}" width="${p.cols*100}" height="${p.rows*100}" preserveAspectRatio="none"/></svg></svg></span>`;
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
const STORE='bubu-yier-cozy-home-v1',BACKUP=STORE+'-backup';
let saveWarning='',lastValid='',storageFailed=false;
function load(){
 try{
  for(const key of [STORE,BACKUP]){
   const v=localStorage.getItem(key);if(!v)continue;
   try{const s=validateState(JSON.parse(v));lastValid=JSON.stringify(s);if(key===BACKUP)saveWarning='上次存档损坏，已恢复最近的安全备份。';return s;}catch{saveWarning='检测到无效存档，未载入错误内容。新进度可在设置里导出。';}
  }
 }catch{storageFailed=true;saveWarning='浏览器暂时不允许本地保存，请用“导出存档”保管进度。';}
 return null;
}
let game=new GameEngine(load());
const ui={tab:game.s.stage===0?'merge':'home',homeMode:'map',mapScroll:0,orderMode:'main',bookMode:'memories',selected:null,highlight:[],modal:null,story:null,splash:true,styleChoice:0,storageTab:'storage',night:game.s.stage>=16&&game.s.stage<20,newDecor:null};
const app=$('#app'),main=$('#main'),modalRoot=$('#modal-root'),overlayRoot=$('#overlay-root');
let toastTimer=0,highlightTimer=0,chatTimer=0,drag=null,ignoreClickUntil=0,hasStarted=false;
let imageCache=new Map();
function persist(){
 try{const raw=JSON.stringify(game.s);if(raw===lastValid)return;if(lastValid)localStorage.setItem(BACKUP,lastValid);localStorage.setItem(STORE,raw);lastValid=raw;storageFailed=false;}
 catch{if(!storageFailed){storageFailed=true;saveWarning='本地保存失败。请在设置里导出存档，避免关闭后丢失。';toast(saveWarning,5000);}}
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
 else if(r.kind==='submit'){sounds.play('success');if(r.orderKind==='main')openModal({type:'submitted',result:r});else{toast(`委托送达 · 金币 +${r.coins} · 体力 +${r.energy}`);burst(null);}}
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
 else if(r.kind==='homeActivity'){sounds.play('success');playHomeActivity(r);toast(`${r.message} · 金币 +${r.coins} · 体力 +${r.energy}`,4000);burst(null);if(r.milestone)setTimeout(()=>openModal({type:'worldMemory',result:r}),2200);}
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
function orderCard(task,kind='main',slot=0){
 const delivered=kind==='main'&&game.s.delivered,ready=game.canFulfill(task.needs),who=kind==='main'?task.who:(slot===0?'yier':'bubu');
 return `<article class="order-card ${kind==='side'?'side-order':''} ${ready||delivered?'fulfilled':''}"><div class="order-top"><div class="order-avatar">${picture(who+'-face')}</div><div class="order-text"><h3>${esc(task.name)}</h3><p>${delivered?'材料都备齐啦，带心愿星回小屋。':esc(task.wish)}</p></div>${kind==='side'?`<button class="refresh-order" data-action="refreshSide" data-slot="${slot}" aria-label="免费更换这张邻里委托">${icon('refresh')}</button>`:''}</div><div class="order-bottom"><div class="requirements">${task.needs.map(requirement).join('')}</div><div class="order-action">${rewardLine(task,kind==='main')}${delivered?btn('回家布置','home','small'):btn(ready?'交付心愿':'还差一点','submit','small',`data-kind="${kind}" data-id="${task.id}" ${ready?'':'disabled'}`)}</div></div></article>`;
}
function renderMerge(){
 const s=game.s,task=TASKS[s.stage],compact=window.innerHeight<=710;
 const card=ui.orderMode==='main'?(task?orderCard(task):`<article class="order-card fulfilled"><div class="order-top"><div class="order-avatar">${picture('yier-happy')}</div><div class="order-text"><h3>小屋已经装满好日子</h3><p>继续邻里委托、收集图鉴，让每一天都有新发现。</p></div></div><div class="row between" style="margin-top:9px"><span class="tag">六章故事已完成</span>${btn('看看邻里委托','orderSide','small')}</div></article>`):s.sideOrders.map((o,i)=>orderCard(o,'side',i)).join('');
 return `<section class="merge-view ${compact?'compact-view':''}">${compact?compactOrderCard():`<div class="order-tabs"><div class="segmented"><button data-action="orderMain" class="${ui.orderMode==='main'?'active':''}">小屋心愿</button><button data-action="orderSide" class="${ui.orderMode==='side'?'active':''}" ${s.stage===0?'disabled':''}>邻里委托</button></div><span class="chapter-counter">${s.stage===24?'好日子，继续中':`第 ${Math.floor(s.stage/4)+1} 章 · ${s.stage%4+1}/4`}</span></div><div class="order-strip">${card}</div>`}<div class="board-header"><div class="board-title">合成工作台<span class="board-free">空位 ${game.free()}</span></div><div class="board-tools"><button data-action="storage">${icon('box')}仓库${s.pending.length?`<i class="parcel-count">${s.pending.length}</i>`:''}</button><button data-action="sort" aria-label="整理棋盘">${icon('sort')}</button><button data-action="hint">${icon('light')}提示</button></div></div>${compact&&s.tutorial==='done'?'':tutorialLine()}<div class="board-frame"><div class="board" role="grid" aria-label="7乘7合成棋盘，点选后点目标或拖动合成">${Array.from({length:7},(_,row)=>`<div role="row" class="board-row">${s.board.slice(row*7,row*7+7).map((t,col)=>renderCell(t,row*7+col)).join('')}</div>`).join('')}</div></div>${detailBar()}</section>`;
}
function compactOrderCard(){
 const s=game.s,t=ui.orderMode==='main'?TASKS[s.stage]:s.sideOrders[0];
 if(!t)return `<div class="compact-orders"><button class="compact-name" data-action="compactOrder"><small>点击查看全部委托</small><strong>好日子，继续中</strong></button>${btn('邻里委托','orderSide','small')}</div>`;
 const mainOrder=ui.orderMode==='main',delivered=mainOrder&&s.delivered,ready=game.canFulfill(t.needs);
 return `<div class="compact-orders"><button class="compact-name" data-action="compactOrder"><small>${mainOrder?'小屋心愿':'邻里委托'} · 点开看全部</small><strong>${esc(t.name)}</strong></button><div class="requirements">${t.needs.map(requirement).join('')}</div>${delivered?btn('布置','home','small'):ready?btn('交付','submit','small',`data-kind="${mainOrder?'main':'side'}" data-id="${t.id}"`):btn('查看','compactOrder','small alt')}</div>`;
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
  if(TASKS[s.stage]?.needs.some(r=>r.c===t.c&&r.l===t.l)&&!t.dust)classes.push('ready-item');
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
  const hint=game.hint();line=hint.kind==='build'?'材料备齐啦，一二在小屋等你一起布置。':hint.kind==='submit'?'这一份心愿已经合好了，交付后就可以回家。':game.free()<4?'桌子有点满啦。仓库、订单、出售都能帮你腾出空位。':`${CHAPTERS[Math.min(5,Math.floor(s.stage/4))].sub} 点物品图标可以查看完整合成路线。`;
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
 return `<div class="detail-bar">${picture(itemKey(t.c,t.l),'detail-art')}<div class="detail-content"><h4>${itemName(t.c,t.l)} · ${t.l} 级</h4><p>${t.dust?'用同类同级物品合入，解开尘封。':t.l===6?'最高级 · 可以交付或收藏':`下一阶：${itemName(t.c,t.l+1)}`}</p></div><div class="detail-actions">${ib('info','item','查看物品路线',`data-cat="${t.c}" data-level="${t.l}"`)}${!t.dust?`${ib('box','store','收进仓库')}${ib('scissors','split','使用剪刀拆分')}${ib('trash','sell','出售物品')}`:''}${ib('undo','undo','撤销上一步')}</div></div>`;
}
function homeScene(progress=game.s.stage,{interactive=false,characters=true,mini=false,night=false,poses=null,region=game.s.world?.region||'house'}={}){
 const info=REGIONS.find(r=>r.id===region)||REGIONS[0];
 const objects=DECOR.filter(d=>d.id<progress&&d.region===info.id).map(decorPlacement).sort((a,b)=>a.z-b.z);
 const art=objects.map(d=>`<${interactive?'button':'div'} class="decor-anchor ${game.s.decorStyles[d.id]===1?'variant':''} ${d.id===ui.newDecor&&!mini?'new':''}" style="left:${d.x}%;top:${d.y}%;width:${d.w}%;z-index:${d.z+1}" ${interactive?`data-action="furniture" data-id="${d.id}" aria-label="看看${esc(TASKS[d.id].name)}"`:''}>${picture(`decor-${String(d.id+1).padStart(2,'0')}`,'home-decor')}</${interactive?'button':'div'}>`).join('');
 const pairs=(poses||(info.id==='house'&&night?['bubu-sit','yier-rest']:['bubu-idle','yier-turn'])).map(id=>id.replace(/-happy$/, '-joy').replace(/-surprise$/, '-idle').replace(/-shy$/, '-turn'));
 const people=characters?`<${interactive?'button':'div'} class="home-char bubu" ${interactive?'data-action="chat" data-who="bubu" aria-label="和布布说说话"':''}>${picture(pairs[0])}</${interactive?'button':'div'}><${interactive?'button':'div'} class="home-char yier" ${interactive?'data-action="chat" data-who="yier" aria-label="和一二说说话"':''}>${picture(pairs[1])}</${interactive?'button':'div'}>`:'';
 const target=decorPlacement(DECOR[Math.min(progress,23)]),canBuild=progress<24&&target.region===info.id;
 return `<div class="home-scene region-${info.id} ${night?'night':''}" data-region-scene="${info.id}">${picture(info.background,'home-bg')}${art}${people}${!mini?'<div class="sun-motes"></div>':''}${interactive?`<div class="room-number">${info.name} · ${objects.length}/${DECOR.filter(d=>d.region===info.id).length} 处心愿</div>${progress>=16?`<div class="room-day"><button data-action="dayNight" aria-label="切换白天夜晚">${icon(night?'sun':'moon')}</button></div>`:''}${canBuild?`<button class="build-pin ${game.s.delivered?'ready':''}" data-action="build" style="left:${Math.max(18,Math.min(82,target.x))}%;top:${Math.max(25,Math.min(83,target.y))}%">${icon('plus')}${game.s.delivered?'可以布置啦':'下一个小愿望'}</button>`:''}`:''}</div>`;
}
function worldMap(){
 const progress=game.worldProgress(),coords={house:[25,41],garden:[54,61],courtyard:[82,44]};
 return `<div class="world-map-shell"><div class="map-hint">${icon('home')}拖动看看整个家园 · 点地标走近</div><div class="world-viewport" aria-label="可拖动的家园全景"><div class="world-canvas">${picture('world-map','world-bg')}${progress.regions.map(r=>{const [x,y]=coords[r.id];return `<button class="region-marker ${DECOR[game.s.stage]?.region===r.id?'next-region':''}" data-action="visitRegion" data-region="${r.id}" style="left:${x}%;top:${y}%"><span>${r.id==='house'?'⌂':r.id==='garden'?'✿':'☀'}</span><b>${r.name}</b><small>${r.built}/${r.total} 处布置${r.activityDone?' · 已陪伴':''}</small>${game.s.delivered&&DECOR[game.s.stage]?.region===r.id?'<i>心愿星到了</i>':''}</button>`;}).join('')}</div></div><div class="region-shortcuts">${REGIONS.map(r=>`<button data-action="visitRegion" data-region="${r.id}">${r.name}${icon('arrow')}</button>`).join('')}</div></div>`;
}
function renderWorldMemories(){
 const p=game.worldProgress();
 return `<div class="section-title">家园日常 · ${p.memoryCount}/3 张回忆</div><div class="world-memory-cards">${p.memories.map(m=>`<button data-action="${m.unlocked?'worldMemory':'visitRegion'}" data-region="${m.region}" class="${m.unlocked?'collected':''}">${icon(m.unlocked?'heart':'sun')}<b>${m.name}</b><small>${m.unlocked?'已收进手帐 · 点击重温':`累计陪伴 ${m.progress}/${m.target} 天 · 去看看`}</small></button>`).join('')}</div>`;
}
function renderHome(){
 const s=game.s,ch=Math.min(5,Math.floor(s.stage/4)),chapter=CHAPTERS[ch],t=TASKS[s.stage];
 const region=REGIONS.find(r=>r.id===s.world.region)||REGIONS[0],p=game.worldProgress(),r=p.regions.find(r=>r.id===region.id),nextRegion=REGIONS.find(r=>r.id===DECOR[s.stage]?.region);
 return `<section class="home-view"><div class="page-heading"><div><span class="eyebrow">OUR HAPPY PLACE · CHAPTER ${String(ch+1).padStart(2,'0')}</span><h2>${ui.homeMode==='map'?'小屋外，还有好日子':region.name}</h2><p>${ui.homeMode==='map'?'小屋 · 花园 · 庭院，把生活慢慢铺开':region.subtitle}</p><div class="chapter-progress">${Array.from({length:6},(_,i)=>`<i class="${s.stage>=i*4+4?'done':''}"></i>`).join('')}</div></div>${ib('book','book','翻开回忆手帐')}</div><div class="home-toolbar">${ui.homeMode==='region'?btn(icon('back')+'家园全景','worldMap','small alt'):''}${btn(icon('merge')+'回合成台','merge','small')}</div>${ui.homeMode==='map'?worldMap():`<div class="region-tabs">${REGIONS.map(v=>`<button class="${v.id===region.id?'active':''}" data-action="visitRegion" data-region="${v.id}">${v.name}</button>`).join('')}</div><div class="home-scene-shell">${homeScene(s.stage,{interactive:true,night:ui.night})}</div><div class="home-actions"><button data-action="photo">${icon('camera')}拍张合照</button><button data-action="decorate">${icon('palette')}换个配色</button><button data-action="rest">${icon('heart')}免费茶歇</button></div><article class="region-activity"><span class="activity-flower">${region.id==='garden'?'✿':region.id==='courtyard'?'☀':'♡'}</span><div><h3>${region.activityLabel}</h3><p>${s.stage===0?'先铺好第一块门垫，再一起做今天的小事。':r.activityDone?'今天的小事已经一起做过，明天再来。':region.activityText}</p></div>${btn(r.activityDone?'明天再来':'一起做','homeActivity','small',`data-region="${region.id}" ${r.activityDone||s.stage===0?'disabled':''}`)}</article>`}<div class="world-memory-track">${icon('book')}家园回忆 ${p.memoryCount} / 3 张<span>各区域每天一次陪伴，收集新的日常</span></div>${t?`<article class="home-quest">${picture(t.decor,'home-quest-thumb')}<span class="eyebrow">下一处心愿 · ${nextRegion?.name||'小屋'} · ${s.stage+1}/24</span><h3>${t.name}</h3><p>${s.delivered?'心愿星已经备好。走到对应区域，亲手布置新角落。':t.wish}</p><div class="home-quest-row"><span class="tag ${s.delivered?'':'coral'}">${icon(s.delivered?'star':'merge')}${s.delivered?'心愿星 ×1 已就绪':'先准备合成物品'}</span>${btn(s.delivered?'前往布置':'去合成','build',s.delivered?'':'alt')}</div></article>`:`<article class="home-quest"><span class="eyebrow">GOOD DAYS NEVER END</span><h3>家园变大了，陪伴也更多了。</h3><p>去花园照顾花草，回小屋准备点心，再到庭院招待朋友。每天都有一件可以一起做的小事。</p><div class="home-quest-row">${btn('继续合成','merge')}${btn('重温庭院聚会','ending','alt')}</div></article>`}</section>`;
}
function renderBook(){
 const s=game.s;let content='';
 if(ui.bookMode==='memories'){
  content=`${renderWorldMemories()}<div class="section-title">六章生活 · 永久收藏</div><div class="memory-grid">${CHAPTERS.map((c,i)=>{const ok=s.stage>=(i+1)*4;return `<button class="memory-card" data-action="memory" data-chapter="${i}" ${ok?'':'disabled'}><div class="memory-art ${ok?'':'locked'}">${ok&&i===5?picture('party-memory','party-memory'):homeScene(Math.min(s.stage,(i+1)*4),{mini:true,poses:c.pose,region:DECOR[(i+1)*4-1].region})}${ok?'':icon('lock')}</div><h3>${String(i+1).padStart(2,'0')} · ${ok?c.memory:c.name}</h3><p>${ok?'轻轻翻开这一天':`完成第 ${i+1} 章后收进手帐`}</p></button>`;}).join('')}</div>${s.stage?`<div class="past-stories"><div class="companion-illustration">${picture('story-companion')}<span>和你一起，平凡也很可爱。</span></div><div class="section-title">已经发生的小故事</div>${TASKS.slice(0,s.stage).map(t=>`<button data-action="replayTask" data-id="${t.id}">${picture(t.decor)}${t.name}${icon('play')}</button>`).join('')}</div>`:''}`;
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
 ['energy','util-energy','口袋小点心','收入道具，使用后 +30 体力',CFG.energyCost],['scissors','util-scissors','小小剪刀','高阶物品拆成两个低一阶',CFG.scissorCost],['parcel','util-gift','心愿补给包','当前所需来源的四件材料',CFG.parcelCost]
 ].map(([key,id,name,desc,price])=>`<article class="shop-product">${picture(id)}<h3>${name}</h3><p>${desc}</p>${btn(picture('util-coin')+price,'buy','small',`data-key="${key}"`)}</article>`).join('')}</div><div class="section-title">把工作台照顾得更好</div><div class="stock-list">${CATS.map(c=>{const p=s.producers[c],on=game.unlocked(c);return `<article class="producer-card ${on?'':'locked'}"><div class="row">${picture('gen-'+c)}<div><h3>${CHAINS[c].producer}</h3><p>${on?`Lv.${p.level} · 库存 ${stockCap(p)}`:`第 ${CHAINS[c].unlock+1} 处心愿开启`}</p></div></div><p style="margin-top:7px">${on?`二阶概率 ${Math.round((.2+(p.level-1)*.12)*100)}% → ${p.level<3?Math.round((.2+p.level*.12)*100)+'%':'已满级'}`:'完成对应修缮后自动解锁'}</p>${btn(on?(p.level>=3?'已经很好啦':`升级 · ${CFG.upgradeCosts[p.level-1]} 金币`):'还没解锁','upgrade','small alt',`data-cat="${c}" ${on&&p.level<3?'':'disabled'}`)}</article>`;}).join('')}</div><div class="section-title">累了，就先休息一下</div><div class="shop-banner">${picture('tea-4')}<div><h3>和布布一二喝杯茶</h3><p>免费补充 30 体力 · 每分钟一次</p></div>${btn('坐一会儿','rest','small')}</div><p class="shop-note">工作台库存自然补充，体力每 15 秒恢复 1 点。<br>只想专心合成和看故事时，设置里可开启“轻松模式”。</p></section>`;
}
function dailyContent(){
 const s=game.s;return DAILY.map(d=>{const n=s.daily[d.key],claimed=s.daily.claimed.includes(d.key),ready=n>=d.target;return `<div class="daily-item"><div class="row between"><h3>${d.title}</h3><small class="muted">${Math.min(n,d.target)} / ${d.target}</small></div><p>${d.desc} · 奖励 ${d.coins} 金币、${d.energy} 体力</p><div class="row"><div class="progress-track"><i style="width:${Math.min(100,n/d.target*100)}%"></i></div>${btn(claimed?'已收好':ready?'领取奖励':'慢慢来','claimDaily','small',`data-key="${d.key}" ${ready&&!claimed?'':'disabled'}`)}</div></div>`;}).join('');
}

// ------- Sheets -------
function openModal(m){cancelDrag();ui.modal=m;renderModal();setTimeout(()=>$('.modal [data-action="closeModal"]')?.focus({preventScroll:true}),30);}
function closeModal(){ui.modal=null;modalRoot.innerHTML='';}
function sheet(title,body){return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-handle"></div><div class="modal-title"><h2>${title}</h2>${ib('close','closeModal','关闭')}</div>${body}</section></div>`;}
function renderModal(){
 const m=ui.modal;if(!m){modalRoot.innerHTML='';return;}const s=game.s;let title='',body='';
 if(m.type==='orders'){
  title='今天的小心愿';body=`<div class="segmented" style="margin-bottom:12px"><button data-action="orderMain" class="${ui.orderMode==='main'?'active':''}">小屋心愿</button><button data-action="orderSide" class="${ui.orderMode==='side'?'active':''}" ${s.stage===0?'disabled':''}>邻里委托</button></div><div class="order-strip">${ui.orderMode==='main'?(TASKS[s.stage]?orderCard(TASKS[s.stage]):'<p class="description">主线已经完成，看看邻里的小纸条吧。</p>'):s.sideOrders.map((o,i)=>orderCard(o,'side',i)).join('')}</div><p class="note">小屏模式将心愿收在这张纸条里，让棋盘有更完整的空间。</p>`;
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
   ['sound','小物件的声音','合成、交付和点击时的轻轻回应。'],['music','暖暖的背景音乐','原创玩具钢琴小调，默认关闭。'],['calm','轻松模式','取物不消耗体力与库存；故事、订单与合成照常推进。'],['reducedMotion','减少动态效果','关闭飘动、粒子、呼吸和弹跳动画。']
  ].map(([key,name,desc])=>`<div class="setting-row"><div><h3>${name}</h3><p>${desc}</p></div><button class="toggle ${s.settings[key]?'on':''}" data-action="setting" data-key="${key}" role="switch" aria-checked="${s.settings[key]}" aria-label="${name}"><i></i></button></div>`).join('')}<div class="section-title">把好日子保管好</div><p class="description">进度保存在当前浏览器，没有云账号。换设备或清理浏览器前，请先导出存档。${storageFailed?'<br><b>当前浏览器不允许保存，请务必导出。</b>':''}</p><div class="settings-grid">${btn(icon('download')+'导出存档','export','alt')}${btn(icon('upload')+'导入存档','import','alt')}${btn(icon('play')+'重看开场','replayIntro','alt')}${btn(icon('info')+'玩法说明','help','alt')}</div><div class="actions">${btn('重新开始这间小屋','resetAsk','danger')}</div><p class="note">单机 H5 v1.1 · 3 区域家园 · 6 章故事<br>本作品为布布一二主题单机游戏；商业发行需另行取得角色 IP 授权。<br>没有广告、内购、排行榜或数据上传。</p>`;
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
  body=`<div class="memory-full">${m.chapter===5?picture('party-memory','party-memory'):homeScene((m.chapter+1)*4,{mini:true,poses:c.pose,region:DECOR[(m.chapter+1)*4-1].region})}</div><p class="eyebrow center">CHAPTER ${String(m.chapter+1).padStart(2,'0')} · ${c.memory}</p><p class="memory-text">${c.text}</p>${m.reward?`<div class="reward-tray"><span>${picture('util-coin')}+60</span><span>${picture('util-energy')}+${CFG.chapterEnergy}</span><span>${picture('util-scissors')}+1</span></div><p class="note">章节奖励已到账，两件材料已放入“待领礼物”。</p>`:''}<div class="actions">${btn(m.reward&&m.chapter===5?'翻到最后一页':'把这一天收好','memoryDone','wide')}</div>`;
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
 modalRoot.innerHTML=sheet(title,body);
}

// ------- Launch and comic dialogue -------
function renderSplash(){
 overlayRoot.innerHTML=`<section class="splash" aria-label="游戏启动页"><div class="splash-scene">${homeScene(game.s.stage,{characters:false,mini:true})}</div><i class="splash-leaf one"></i><i class="splash-leaf two"></i><i class="splash-leaf three"></i><div class="splash-top"><div class="eyebrow">GOOD DAYS, TOGETHER</div><h1><span class="bear-title">布布一二</span>好日子小屋</h1><p class="splash-sub">把小小的心愿，慢慢合成家</p><span class="splash-pill">合成 · 布置 · 陪伴 · 收藏</span></div><div class="splash-bears">${picture('bubu-sit')}${picture('yier-turn')}</div><div class="splash-ribbon">“和你一起，就是最开心的事。”</div><div class="splash-bottom">${btn(game.s.introSeen?'回到我们的好日子':'开始我们的好日子','start')}${game.s.introSeen?'<button class="text-button" data-action="replayIntro">再看一遍初次见面</button>':''}<p>不用登录 · 单机本地保存 · 没有付费广告<br>建议先导出存档，再切换浏览器或设备。</p></div></section>`;
}
function showStory(lines,onFinish=()=>{}){
 cancelDrag();closeModal();ui.splash=false;ui.story={lines,index:0,onFinish};renderStory();
}
function renderStory(){
 const q=ui.story;if(!q)return;const line=q.lines[q.index],who=line.who,pose=line.pose||'idle';
 const fullPose={happy:'joy',surprise:'idle',shy:'turn'}[pose]||pose;
 const left=who==='bubu'?`bubu-${fullPose}`:'bubu-turn';const right=who==='yier'?`yier-${fullPose}`:'yier-turn';
 overlayRoot.innerHTML=`<section class="story-overlay" aria-label="剧情对话"><div class="story-scene">${homeScene(game.s.stage,{characters:false,mini:true,night:ui.night})}</div><div class="story-header"><span class="eyebrow">${game.s.stage===0?'PROLOGUE · 推开这扇门':`OUR LITTLE STORY · 第 ${Math.min(6,Math.ceil(game.s.stage/4))} 章`}</span><button class="story-skip" data-action="skipStory">跳过 ${icon('arrow')}</button></div><h2 class="story-title">${esc(line.title||'今天，又多了一点点可爱')}</h2><p class="story-aside">${esc(line.aside||'小小的事情，两个人一起做，就变得不一样。')}</p><div class="story-characters">${picture(left,`story-character ${who==='bubu'?'speaking':''}`)}${picture(right,`story-character ${who==='yier'?'speaking':''}`)}</div><div class="dialogue-box"><span class="speaker-name ${who}">${who==='bubu'?'布布':'一二'}</span><p class="dialogue-text">${esc(line.text)}</p><div class="dialogue-footer"><div class="story-dots">${q.lines.map((_,i)=>`<i class="${i===q.index?'active':''}"></i>`).join('')}</div>${btn(q.index===q.lines.length-1?'一起开始吧':'下一句','nextStory')}</div></div></section>`;
 sounds.play(who==='bubu'?'talk':'yier');
}
function finishStory(){const q=ui.story;if(!q)return;ui.story=null;overlayRoot.innerHTML='';q.onFinish();}
function nextStory(){if(!ui.story)return;if(++ui.story.index>=ui.story.lines.length)finishStory();else renderStory();}
function playIntro(){ui.splash=false;showStory(INTRO,()=>{game.markIntro();persist();navigate(game.s.stage===0?'merge':'home');if(game.s.stage===0){highlight([8,9]);toast('从这两块相同的小方巾开始。',2800);}if(saveWarning)toast(saveWarning,5000);});}
function replayTask(id,onFinish=()=>{}){const t=TASKS[id];showStory(t.after.map(([who,pose,text])=>({who,pose,text,title:t.name,aside:CHAPTERS[t.chapter].sub})),onFinish);}
function afterBuild(r){
 ui.newDecor=r.stage;ui.homeMode='region';ui.night=game.s.stage>=16&&game.s.stage<20;ui.tab='home';ui.selected=null;render();main.scrollTop=0;sounds.play('place');burst(null,true);
 setTimeout(()=>{ui.newDecor=null;replayTask(r.stage,()=>{if(r.chapterDone)openModal({type:'memory',chapter:r.chapter,reward:true});else if(r.unlocked.length)toast(`新工作台开启：${r.unlocked.map(c=>CHAINS[c].producer).join('、')}`);else if(r.stage===0)toast('门垫铺好了！回合成台，试试点击带闪电的清洁篮。',3200);});},620);
}
function highlight(indices){ui.highlight=indices;clearTimeout(highlightTimer);render();highlightTimer=setTimeout(()=>{ui.highlight=[];if(ui.tab==='merge')render();},6000);}
function showHint(){const h=game.hint(ui.orderMode);if(h.kind==='build'){navigate('home');toast('材料已经交好啦，点“开始布置”。');return;}if(h.kind==='submit'){ui.orderMode=h.orderKind||ui.orderMode;navigate('merge');toast(ui.orderMode==='side'?'邻里委托已经备齐，点开委托即可交付。':'上方心愿已经备齐，可以交付啦。');return;}navigate('merge');if(h.kind==='merge'){highlight([h.from,h.to]);toast(`把发亮的两个${itemName(h.c,h.l)}合在一起。`);}else if(h.idx!==undefined){highlight([h.idx]);ui.selected=h.idx;render();toast(`点带闪电的${CHAINS[h.c].producer}，继续准备材料。`);}else toast(h.message||'看看订单里还需要哪些物品。');}
function chat(who){
 if(ui.tab!=='home')return;clearTimeout(chatTimer);$('.room-chat')?.remove();const lines=HOME_CHAT.filter(l=>l[0]===who),[,pose,text]=lines[Math.floor(Math.random()*lines.length)];const el=document.createElement('div');el.className='room-chat';el.textContent=text;$('.home-scene').append(el);const im=$(`.home-char.${who} img`);if(im)im.src=asset(`${who}-${({happy:'joy',surprise:'idle',shy:'turn'}[pose]||pose)}`);sounds.play(who==='yier'?'yier':'talk');chatTimer=setTimeout(()=>{el.remove();if(im)im.src=asset(`${who}-${who==='bubu'?'idle':'turn'}`);},3500);
}
function playHomeActivity(r){
 const scene=$('[data-region-scene]');if(!scene)return;
 const poses=r.region==='house'?['bubu-sit','yier-joy']:r.region==='garden'?['bubu-turn','yier-happy']:['bubu-walk','yier-joy'];
 for(const [i,who] of ['bubu','yier'].entries()){const im=$(`.home-char.${who} img`,scene);if(im){im.src=asset(poses[i]);setTimeout(()=>{if(im.isConnected)im.src=asset(`${who}-${who==='bubu'?'idle':'turn'}`);},3200);}}
 const bubble=document.createElement('div');bubble.className='room-chat activity-chat';bubble.textContent=r.region==='garden'?'今天的小苗，精神一点点！':r.region==='courtyard'?'朋友来了，先喝一口甜甜的茶。':'这一半饼干，留给你。';scene.append(bubble);
 if(!game.s.settings.reducedMotion){const fx=document.createElement('div');fx.className=`activity-fx ${r.region}`;fx.setAttribute('aria-hidden','true');fx.innerHTML=Array.from({length:8},(_,i)=>`<i style="--a:${i};left:${23+i*7}%">${r.region==='garden'?'':r.region==='house'?'♡':'✦'}</i>`).join('');scene.append(fx);setTimeout(()=>fx.remove(),2800);}
 setTimeout(()=>bubble.remove(),3200);
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
  case 'start':hasStarted=true;ui.splash=false;overlayRoot.innerHTML='';sounds.syncMusic();if(!game.s.introSeen)playIntro();else{render();if(game.s.stage===24&&!game.s.finishedSeen)openModal({type:'ending'});if(saveWarning)toast(saveWarning,5000);}break;
  case 'home':case 'merge':case 'book':case 'shop':closeModal();navigate(a);break;
  case 'compactOrder':openModal({type:'orders'});break;
  case 'orderMain':ui.orderMode='main';render();break;
  case 'orderSide':if(game.s.stage===0){toast('先把门垫铺好，邻里委托就会开启。');break;}ui.orderMode='side';render();break;
  case 'bookMode':ui.bookMode=d.mode;render();main.scrollTop=0;break;
  case 'item':openModal({type:'item',c:d.cat,l:+d.level});break;
  case 'chain':openModal({type:'chain',c:d.cat,l:1});break;
  case 'source':closeModal();navigate('merge');ui.selected=CATS.indexOf(d.cat);highlight([ui.selected]);if(!game.unlocked(d.cat))toast(`修好前 ${CHAINS[d.cat].unlock} 处后，${CHAINS[d.cat].producer}会自动解锁。`);break;
  case 'hint':showHint();break;
  case 'submit':run(game.submit(d.kind,d.kind==='main'?+d.id:d.id));break;
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
  case 'split':run(game.split(ui.selected));break;
  case 'sell':{const t=game.s.board[ui.selected];if(t?.k==='item'&&!t.dust&&(TASKS[game.s.stage]?.needs.some(r=>r.c===t.c&&r.l===t.l)||game.s.sideOrders.some(o=>o.needs.some(r=>r.c===t.c&&r.l===t.l))))openModal({type:'confirmSell',index:ui.selected});else run(game.sell(ui.selected));break;}
  case 'confirmSell':closeModal();run(game.sell(+d.index));break;
  case 'sort':run(game.sort());break;
  case 'undo':run(game.undo());break;
  case 'expand':run(game.expand());break;
  case 'upgrade':run(game.upgrade(d.cat));break;
  case 'buy':run(game.buy(d.key));break;
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
  case 'export':downloadBlob(new Blob([game.export()],{type:'application/json'}),`好日子小屋_存档_${new Date().toISOString().slice(0,10)}.json`);toast('存档已导出。请把 JSON 文件收好。');break;
  case 'import':$('#import-file').click();break;
  case 'importConfirm':{const state=ui.modal.state;game=new GameEngine(state);closeModal();ui.selected=null;ui.highlight=[];ui.tab=game.s.stage===0?'merge':'home';ui.night=game.s.stage>=16&&game.s.stage<20;persist();render();sounds.syncMusic();toast('小屋已经搬过来了，继续好日子吧。');break;}
  case 'resetAsk':openModal({type:'reset'});break;
  case 'resetConfirm':{try{localStorage.removeItem(STORE);localStorage.removeItem(BACKUP);}catch{}lastValid='';game=new GameEngine();ui.tab='merge';ui.homeMode='map';ui.selected=null;ui.modal=null;ui.highlight=[];ui.night=false;closeModal();persist();render();playIntro();break;}
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
  const focusable=$$('.modal button:not(:disabled),.modal input');if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
 const current=document.activeElement?.closest('[data-cell]');
 if(current&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
  e.preventDefault();let i=+current.dataset.cell,delta={ArrowUp:-7,ArrowDown:7,ArrowLeft:-1,ArrowRight:1}[e.key];const j=i+delta;if(j>=0&&j<49)$(`[data-cell="${j}"]`)?.focus();
 }
});
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function capturePhoto(){
 try{
  const region=REGIONS.find(r=>r.id===game.s.world.region)||REGIONS[0];
  const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1300;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fff8ef';ctx.fillRect(0,0,1000,1300);ctx.fillStyle='#74513f';ctx.font='bold 37px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.fillText('布布一二 · '+region.name,500,64);ctx.fillStyle='#947863';ctx.font='18px sans-serif';ctx.fillText('每一处小愿望，都是一起过的好日子',500,103);
  const get=async(id)=>{const key=spriteSpec(id)?.asset||id;if(imageCache.has(key))return imageCache.get(key);const im=new Image();im.src=asset(key);await im.decode();imageCache.set(key,im);return im;};
  const draw=async(id,x,y,w,h)=>drawSprite(ctx,await get(id),spriteSpec(id),x,y,w,h);
  ctx.save();ctx.translate(45,137);ctx.scale(.91,.91);ctx.beginPath();ctx.rect(0,0,1000,1120);ctx.clip();ctx.filter=ui.night?'brightness(.64) saturate(.7)':'none';ctx.drawImage(await get(region.background),0,0,1000,1120);ctx.filter='none';
  const draws=DECOR.filter(d=>d.id<game.s.stage&&d.region===region.id).map(decorPlacement).map(d=>({...d,type:'decor',z:d.z+1}));
  const poses=region.id==='house'&&ui.night?['bubu-sit','yier-rest']:['bubu-idle','yier-turn'];
  draws.push({type:'char',id:poses[0],image:$('.home-scene-shell .home-char.bubu img'),x:31,y:47,w:23,h:27,z:11},{type:'char',id:poses[1],image:$('.home-scene-shell .home-char.yier img'),x:49,y:47,w:23,h:27,z:11});draws.sort((a,b)=>a.z-b.z);
  for(const d of draws){ctx.save();if(d.type==='decor'){ctx.filter=[game.s.decorStyles[d.id]===1?'hue-rotate(18deg)':'',ui.night?'brightness(.84)':''].filter(Boolean).join(' ')||'none';const w=d.w*10;await draw(`decor-${String(d.id+1).padStart(2,'0')}`,d.x*10-w/2,d.y*11.2-w/2,w,w);}else if(d.image?.complete)drawSprite(ctx,d.image,null,d.x*10,d.y*11.2,d.w*10,d.h*11.2);else await draw(d.id,d.x*10,d.y*11.2,d.w*10,d.h*11.2);ctx.restore();}
  if(ui.night){for(const [x,y,r,color] of [[820,313.6,246,'rgba(255,217,122,.267)'],[600,873.6,280,'rgba(255,207,102,.333)']]){const glow=ctx.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,color);glow.addColorStop(1,'rgba(255,217,122,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,1000,1120);}}
  ctx.restore();ctx.fillStyle='#947863';ctx.font='20px sans-serif';ctx.fillText(`已经布置 ${draws.filter(d=>d.type==='decor').length} 处心愿 · ${region.name}`,500,1217);ctx.font='15px sans-serif';ctx.fillText(new Date().toLocaleDateString('zh-CN'),500,1259);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('无法生成图片')),'image/png'));downloadBlob(blob,`布布一二_${region.name}_合照.png`);toast('合照拍好啦，当前区域的布置都收进照片了。');
 }catch(err){toast('当前浏览器限制图片导出。请使用单文件离线版，或通过本地服务启动。',4500);}
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
 app.style.setProperty('--grain',`url("${asset('paper-texture')}")`);
 render();
 const ids=window.__ASSET_IDS__||['region-house','region-garden','region-courtyard','world-map','party-memory','yier-rest','bubu-idle','bubu-sit','bubu-joy','bubu-face','bubu-happy','bubu-turn','yier-idle','yier-turn','yier-face','yier-happy','yier-joy','yier-shy',...CATS.flatMap(c=>['gen-'+c,...Array.from({length:6},(_,i)=>`${c}-${i+1}`)]),...Array.from({length:24},(_,i)=>`decor-${String(i+1).padStart(2,'0')}`),'util-energy','util-coin','util-star','util-crate','util-gift','util-scissors','util-storage'];
 let loaded=0;const failed=[];
 const imageIds=[...new Set(ids.filter(id=>id!=='cozy-loop').map(id=>spriteSpec(id)?.asset||id))];
 await Promise.all(imageIds.map(id=>new Promise(resolve=>{
  const im=new Image();im.onload=()=>{imageCache.set(id,im);loaded++;$('#load-bar').style.width=`${loaded/imageIds.length*100}%`;resolve();};im.onerror=()=>{failed.push(id);loaded++;resolve();};im.src=asset(id);
 })));
 if(failed.length){$('#loading-text').innerHTML=`<span class="load-failed">有 ${failed.length} 件素材没能打开。请确认 assets 文件夹和游戏入口在一起，或使用单文件离线版。<br>${esc(failed.slice(0,3).join('、'))}</span>`;const retry=document.createElement('button');retry.className='button';retry.style.marginTop='18px';retry.textContent='重新整理素材';retry.onclick=()=>location.reload();$('#loading').append(retry);return;}
 $('#loading').remove();renderSplash();
 // Diagnostic access is available only in explicit QA mode; normal gameplay has no cheat controls.
 if(new URLSearchParams(location.search).has('qa'))window.__COZY_QA__={get game(){return game;},render,navigate,openModal,ui,validateState};
 if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)&&!window.__OFFLINE_SINGLE__)navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
boot().catch(err=>{const loading=$('#loading-text');if(loading)loading.textContent='小屋启动遇到问题：'+err.message;console.error(err);});

})();