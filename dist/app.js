/* 1.4.2 | 2026-10-09T17:53:29.682Z | locally built; no network dependencies */
window.__ASSET_IDS__=["activity-courtyard-early","activity-courtyard-ready","activity-garden-early","activity-garden-ready","activity-house-early","activity-house-ready","ambient-bubu-guitar-motion","ambient-bubu-guitar","ambient-cuddle-motion","ambient-cuddle","ambient-kiss-motion","ambient-kiss","ambient-yier-tea-motion","ambient-yier-tea","app-icon","atlas-bake","atlas-bubu-motion","atlas-clean","atlas-craft","atlas-decor-a","atlas-decor-b","atlas-decor-c","atlas-decor-d","atlas-garden","atlas-generators","atlas-tea-props","atlas-tea","atlas-tools","atlas-xiaoli","atlas-yier-motion","bubu-back","bubu-face","bubu-happy","bubu-idle","bubu-joy","bubu-side","bubu-sit","bubu-sleep","bubu-surprise","bubu-turn","bubu-walk","cozy-loop","paper-texture","party-memory","region-courtyard-night","region-courtyard","region-garden-night","region-garden","region-house-night","region-house","story-companion","story-garden","story-night","story-rest","util-coin","util-crate","util-energy","util-gift","util-scissors","util-star","util-storage","world-map","yier-back","yier-face","yier-happy","yier-idle","yier-joy","yier-paint","yier-rest","yier-shy","yier-side","yier-surprise","yier-turn","yier-walk"];
window.__ASSET_SIZES__={"activity-courtyard-early":[1448,1086],"activity-courtyard-ready":[1448,1086],"activity-garden-early":[1448,1086],"activity-garden-ready":[1448,1086],"activity-house-early":[1448,1086],"activity-house-ready":[1448,1086],"ambient-bubu-guitar":[450,450],"ambient-cuddle":[200,200],"ambient-kiss":[240,240],"ambient-yier-tea":[240,240],"app-icon":[512,512],"atlas-bake":[1536,1024],"atlas-bubu-motion":[1254,1254],"atlas-clean":[1536,1024],"atlas-craft":[1536,1024],"atlas-decor-a":[1536,1024],"atlas-decor-b":[1536,1024],"atlas-decor-c":[1536,1024],"atlas-decor-d":[1536,1024],"atlas-garden":[1536,1024],"atlas-generators":[1536,1024],"atlas-tea-props":[1536,1024],"atlas-tea":[1536,1024],"atlas-tools":[1536,1024],"atlas-xiaoli":[1254,1254],"atlas-yier-motion":[1230,1278],"bubu-back":[384,416],"bubu-face":[384,384],"bubu-happy":[384,384],"bubu-idle":[384,416],"bubu-joy":[384,416],"bubu-side":[384,416],"bubu-sit":[384,416],"bubu-sleep":[384,384],"bubu-surprise":[384,384],"bubu-turn":[384,416],"bubu-walk":[384,416],"paper-texture":[192,192],"party-memory":[1536,1024],"region-courtyard-night":[1182,1330],"region-courtyard":[1182,1330],"region-garden-night":[1182,1330],"region-garden":[1182,1330],"region-house-night":[1183,1330],"region-house":[1182,1330],"story-companion":[409,247],"story-garden":[278,96],"story-night":[278,95],"story-rest":[278,99],"util-coin":[256,256],"util-crate":[256,256],"util-energy":[256,256],"util-gift":[256,256],"util-scissors":[256,256],"util-star":[256,256],"util-storage":[256,256],"world-map":[1536,1024],"yier-back":[384,416],"yier-face":[384,384],"yier-happy":[384,384],"yier-idle":[384,416],"yier-joy":[384,416],"yier-paint":[384,416],"yier-rest":[1254,1254],"yier-shy":[384,384],"yier-side":[384,416],"yier-surprise":[384,384],"yier-turn":[384,416],"yier-walk":[384,416]};
(function(){'use strict';
/** All story, progression, art coordinates, and economy data. No UI state here. */
const VERSION = '1.4.2';
// App releases and storage migrations have different lifetimes.
const APP_VERSION = VERSION;
const SCHEMA_VERSION = 2;
const TITLE = '熊熊之家';
const CATS = ['clean','tools','bake','tea','craft','garden'];
const CHAINS = {
  clean:{name:'把家擦亮',producer:'清洁篮',unlock:0,color:'#c6d7ba',items:['小方巾','软海绵','清洁喷雾','小刷子','轻巧拖把','清洁推车'],desc:'从手边的小方巾，到能照顾整间屋子的清洁工具。'},
  tools:{name:'修修补补',producer:'修理箱',unlock:2,color:'#e8b5a6',items:['小螺丝','螺丝刀','小木锤','手锯','电钻','全套工具箱'],desc:'布布的拿手事：松掉的地方，慢慢修好。'},
  bake:{name:'甜甜一口',producer:'小烤箱',unlock:4,color:'#ecd2a4',items:['面粉袋','软面团','暖面包','草莓纸杯糕','双层小蛋糕','三层点心塔'],desc:'备料、揉面、烘焙，把今天的快乐分成几份。'},
  tea:{name:'一起喝杯茶',producer:'泡茶台',unlock:6,color:'#c1d7d0',items:['茶叶罐','花纹瓷杯','一杯花草茶','圆肚茶壶','双人茶盘','茶点推车'],desc:'杯子要两只；忙的时候也记得坐一会儿。'},
  craft:{name:'画点小心思',producer:'画画箱',unlock:8,color:'#e2c0b7',items:['铅笔','蜡笔盒','调色盘','小风景画','纸鲸风铃','绘画工作台'],desc:'一二的想象，从一根铅笔开始长大。'},
  garden:{name:'花园会开花',producer:'园艺篮',unlock:12,color:'#c7d7af',items:['种子包','小幼苗','绿叶盆栽','雏菊盆栽','郁金香花束','双层花架'],desc:'照顾一颗种子，也照顾慢慢长出来的期待。'},
};
const CFG={boardSize:49,cols:7,maxLevel:6,maxPlayerLevel:99,economyVersion:1,energyCap:100,energyEvery:100000,stockEvery:6000,stockBase:18,stockPerLevel:6,storageBase:8,storageMax:24,upgradeCosts:[140,400],scissorCost:45,parcelCost:65,sideCooldown:15000,chapterCoins:60,dailyGiftCoins:40,buildXP:15,levelGiftEvery:5,legacyPackCoins:20};
const CHAPTERS = [
 {name:'先把门打开',short:'迎着光',sub:'一束阳光，两双脚印。',memory:'门垫是软的',text:'门垫铺好的时候，一二特意踩了两下。布布没有催她进屋，只把第二双拖鞋放在旁边。',pose:['bubu-idle','yier-joy']},
 {name:'热乎乎的下午',short:'甜一口',sub:'面包刚好，茶也刚好。',memory:'留给你的那一口',text:'布布说只尝一小口。纸杯糕少了半边。一二瞪了他一会儿，把自己那半边也往中间推了推。',pose:['bubu-sit','yier-happy']},
 {name:'给想象留个角',short:'画晴天',sub:'画歪一点，也很可爱。',memory:'会飞的纸鲸',text:'纸鲸不会游泳，却能在花园里飞。风来的时候，布布伸手扶了一下线；一二说，让它自己试试嘛。',pose:['bubu-turn','yier-paint']},
 {name:'花园会开花',short:'等花开',sub:'慢一点的事，一起等。',memory:'今天也长高了一点',text:'一二每天量小苗的身高，布布每天悄悄把尺子扶正。花开那天，两只都说，早就知道你能行。',pose:['bubu-joy','yier-turn']},
 {name:'不赶时间的晚上',short:'慢慢读',sub:'灯暖着，故事慢慢讲。',memory:'没有收完的今天',text:'相册没有排整齐，茶杯也还没洗。一二已经靠着软垫睡着了。布布把灯调暗：留一点明天再做。',pose:['bubu-sit','yier-rest']},
 {name:'今天请你来坐坐',short:'来做客',sub:'原来，好日子可以分给别人。',memory:'给朋友留一个位置',text:'邀请信送出去了，花架、画台和蛋糕也备好了。一二又检查了一遍杯子，布布把茶壶端稳：等小栗来了，就请她坐在我们旁边。',pose:['bubu-joy','yier-joy']},
];
const INTRO = [
 {who:'yier',pose:'turn',title:'一间旧屋，两个小小的愿望',text:'臭布布，你看！窗边这一块，晒太阳一定很舒服。',aside:'午后，巷子尽头。旧屋的门被轻轻推开。'},
 {who:'bubu',pose:'idle',title:'先不急着变得很厉害',text:'嗯……就是门口有一点灰。我先擦擦，一二宝别把脚弄脏了。',aside:'旧家具和纸箱还在。布布从里面翻出了一条小方巾。'},
 {who:'yier',pose:'joy',title:'把喜欢的日子装进来',text:'这里喝茶，那里画画！等花开了，还可以请大家来坐坐。',aside:'一二说得很快，布布一件一件记下来。'},
 {who:'bubu',pose:'happy',title:'那就，从这一小块开始',text:'好。我们慢慢来，把小小的愿望，一个一个变成真的。',aside:'先把两块相同的小方巾合在一起吧。'},
];
const R=(c,l,n=1)=>({c,l,n});
// Stage = number of completed renovations. Every source is unlocked before its first requirement.
const TASKS = [
 {name:'铺一块软软的门垫',who:'bubu',wish:'先擦干净门口，不然脚印会排着队进屋。',needs:[R('clean',2)],after:[['yier','joy','我试过了，踩起来软乎乎！'],['bubu','idle','那把另一边留给我，我们一起进门。']]},
 {name:'让窗帘接住阳光',who:'yier',wish:'把窗边擦亮吧。我想给阳光留个位置。',needs:[R('clean',3)],after:[['yier','turn','光真的落进来了，像一块暖暖的小饼干。'],['bubu','happy','这个不能吃。一二宝可以先晒一会儿。']]},
 {name:'立起第一块小屋牌',who:'bubu',wish:'牌子有点松。找到螺丝刀，再把木板擦一擦。',needs:[R('tools',2),R('clean',2)],after:[['yier','happy','写什么好呢？豪华超级大……'],['bubu','turn','写“熊熊之家”吧。我们住得开心，就算豪华。']]},
 {name:'点亮门边的小灯',who:'yier',wish:'门边少一盏灯。天黑回来的时候，也要被好好迎接。',needs:[R('tools',3)],after:[['bubu','idle','装好了。站远一点看看，歪不歪？'],['yier','joy','不歪！以后晚归的臭布布，就不会找错门啦。']]},
 {name:'收拾香香的烘焙架',who:'yier',wish:'第一团面，要留给我们的第一炉小面包。',needs:[R('bake',2)],after:[['yier','happy','面团有一点点像你的肚子。'],['bubu','surprise','那……揉的时候轻一点。']]},
 {name:'把小圆桌修稳',who:'bubu',wish:'垫稳桌脚，再放一只热面包。它就不是空桌子了。',needs:[R('tools',3),R('bake',3)],after:[['bubu','idle','这回放几杯茶都不会晃。'],['yier','turn','我还没说你刚才一直扶着桌子呢。']]},
 {name:'准备两只杯子',who:'bubu',wish:'杯子要两只；热面包，一人一半。',needs:[R('tea',2,2),R('bake',3)],after:[['yier','happy','你的杯子比我的满一点。'],['bubu','happy','因为你刚才喝了一口呀。']]},
 {name:'把下午过得软一点',who:'yier',wish:'煮一壶茶，做一个草莓纸杯糕，坐垫也要摆成两份。',needs:[R('tea',4),R('bake',4)],after:[['bubu','sit','我就尝一小口。'],['yier','surprise','臭布布！你的“一小口”怎么还会长大呀！']]},
 {name:'给一二支起小画架',who:'bubu',wish:'蜡笔先放好。一二宝的想象，得有个稳稳的地方落下。',needs:[R('craft',2)],after:[['yier','paint','我的第一张画，要画小屋和你。'],['bubu','turn','那把我画在离你近一点的地方。']]},
 {name:'铺开颜料小地毯',who:'yier',wish:'用小木锤固定好毯边的小木条，再调一点喜欢的颜色。滴出来也没关系。',needs:[R('craft',3),R('tools',3)],after:[['yier','happy','这块地毯可以接住失手的颜料。'],['bubu','happy','那也帮我接住一点紧张，我怕踩到你的画。']]},
 {name:'为纸鲸画一片天空',who:'yier',wish:'先画一张晴天，再让纸鲸从画里飞出来。',needs:[R('craft',4)],after:[['bubu','surprise','鲸鱼不是应该在水里吗？'],['yier','joy','这只是爱晒太阳的鲸鱼。和我们一样！']]},
 {name:'把小风景挂上墙',who:'bubu',wish:'风铃和花草茶都备好，挂完画就歇一歇。',needs:[R('craft',5),R('tea',3)],after:[['yier','turn','画里的屋子，好像比真的还整齐。'],['bubu','happy','真的这间多了你，我更喜欢真的。']]},
 {name:'认领第一盆小生命',who:'yier',wish:'挑一株精神的小幼苗。我们会好好照顾它。',needs:[R('garden',2)],after:[['yier','joy','它以后会长得比你还高吗？'],['bubu','idle','会吧。到时候换它替你挡太阳。']]},
 {name:'装好花园小花箱',who:'bubu',wish:'把花园边的花箱洗干净，再把绿叶安稳放进去。',needs:[R('garden',3),R('clean',3)],after:[['bubu','turn','这里有阳光，也不会挡住散步的小路。'],['yier','happy','还给它留了看风景的位置，你想得好细。']]},
 {name:'搭一面会开花的墙',who:'yier',wish:'木架的长度要正好，让雏菊靠一靠。',needs:[R('garden',4),R('tools',4)],after:[['yier','turn','我想快一点看到整面花墙。'],['bubu','idle','我也是。不过今天有这两朵，就已经很好看了。']]},
 {name:'把绿意挂得高一点',who:'bubu',wish:'备好花束，喝一口茶，再慢慢固定吊盆。',needs:[R('garden',5),R('tea',3)],after:[['yier','happy','风一吹，叶子就在和我们招手。'],['bubu','joy','那也和它打个招呼。你好呀，小邻居。']]},
 {name:'给喜欢的故事一个家',who:'bubu',wish:'锯好书架隔板，给书脊挑一点温柔的颜色。',needs:[R('tools',4),R('craft',3)],after:[['yier','turn','这里怎么故意空了一格？'],['bubu','happy','留给还没一起读过的故事。']]},
 {name:'准备不赶时间的软椅',who:'yier',wish:'泡好茶，留一个草莓纸杯糕。今晚不急着做下一件事。',needs:[R('tea',4),R('bake',4)],after:[['yier','shy','我们什么都不做，也算好好过一天吗？'],['bubu','sit','算。和你一起歇着，也是很重要的一件事。']]},
 {name:'调一盏刚刚好的灯',who:'bubu',wish:'固定灯座，别让刺眼的光打扰一二宝看书。',needs:[R('tools',5)],after:[['yier','happy','再暗一点点。对，就是现在这样。'],['bubu','turn','记住了。下次不用你再说。']]},
 {name:'收好今天的小回忆',who:'yier',wish:'把纸鲸和雏菊的样子记下来。它们也在陪我们长大。',needs:[R('craft',5),R('garden',4)],after:[['bubu','turn','有一张照片拍糊了，要不要重拍？'],['yier','shy','不要。那张里面，你刚好笑得最开心。']]},
 {name:'写一张小小邀请',who:'yier',wish:'给巷口的松鼠小栗写一张邀请，再挂起庭院小旗。',needs:[R('craft',5),R('tools',4)],after:[['yier','paint','小栗：花草茶准备好时，来我们家坐坐吧。'],['bubu','happy','我把纸条送到巷口了。她回信说，会带一件路上发现的小东西。']]},
 {name:'把春天铺到门外',who:'bubu',wish:'摆好花束和圆肚茶壶，野餐垫就在门前的树影下。',needs:[R('garden',5),R('tea',4)],after:[['yier','turn','这不是我们之前量好的地方。'],['bubu','happy','这里有阴凉。一二宝晒久了会眯眼睛。']]},
 {name:'做一桌可以分享的甜',who:'yier',wish:'先把点心塔摆好，再准备茶盘。小栗来时，茶和甜点都刚刚好。',needs:[R('bake',6),R('tea',5)],phases:['点心塔上桌','双人茶盘到位'],after:[['yier','happy','点心我来摆。臭布布，帮我拿稳茶盘。'],['bubu','happy','拿稳了。最大的一块，留给第一次来的小栗。']]},
 {name:'熊熊之家，开门啦',who:'bubu',wish:'把双层花架摆到花园，在庭院备好绘画工作台，再端上双层小蛋糕。都备好后，我们去门口迎接小栗。',needs:[R('garden',6),R('craft',6),R('bake',5)],phases:['花园双层花架','备好绘画工作台','端上双层小蛋糕'],after:[['yier','joy','花架、画台和蛋糕都好了！布布，我们去门口迎接小栗吧。'],['bubu','happy','杯子你来摆，茶壶我来端。今天的好日子，也分给她。']]},
].map((t,i)=>({...t,id:i,chapter:Math.floor(i/4),decor:`decor-${String(i+1).padStart(2,'0')}`,coins:18+t.needs.reduce((a,r)=>a+2**(r.l-1)*r.n*3,0),xp:orderXP(t.needs)}));
// Each near view has its own coordinates. Keep the central walkway clear for both characters.
const REGIONS = [
 {id:'house',name:'暖暖小屋',subtitle:'烤面包、喝茶，给故事留一个角落',unlock:0,background:'region-house',activityLabel:'一起喝杯茶',activityText:'布布把茶吹凉，一二摆好两只杯子。忙完的两只熊，一起歇一会儿。',coins:8,memoryName:'一起喝茶的下午'},
 {id:'garden',name:'晴天小花园',subtitle:'花圃、纸鲸和慢慢长大的期待',unlock:0,background:'region-garden',activityLabel:'给花浇浇水',activityText:'一二扶住小苗，布布慢慢浇水。今天的叶子又精神了一点。',coins:8,memoryName:'看见新叶的一天'},
 {id:'courtyard',name:'门前小庭院',subtitle:'摆好点心，让好日子可以分给别人',unlock:0,background:'region-courtyard',activityLabel:'准备来客茶点',activityText:'两只熊一起擦好桌子，摆好干净杯子，等朋友来坐坐。',coins:8,memoryName:'给朋友留一个位置'},
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
 {key:'merge',title:'合一合，松口气',target:15,coins:30,desc:'完成 15 次合成'},
 {key:'order',title:'把小心愿送出去',target:3,coins:45,desc:'完成 3 张主线、邻里或茶会订单'},
 {key:'produce',title:'今天也有新点子',target:25,coins:35,desc:'从工作台取出 25 件物品'},
];
const SIDE_FLAVOR = [
 ['巷口留言','把小东西准备好，生活就方便一点。'],['邻里的约定','不用赶，准备好了再送来就好。'],['邻里小纸条','今天也想分享一点小小的心意。'],['窗边的请求','给平常的一天，添一点心意。'],['下一次的准备','东西不用很多，合适就好。'],
];
const HOME_CHAT = [
 ['yier','joy','臭布布，这里我想再收拾一下。就一点点。'],['bubu','happy','一二宝，忙完记得歇一会儿。我陪着你。'],['yier','shy','这里的东西，怎么每一件都有我们的故事呀。'],['bubu','turn','今天不用把所有事情都做完。我们还会有明天。'],['yier','happy','小屋又变可爱一点点啦！'],['bubu','sit','你看看风，我陪你歇一会儿。各自都有很重要的工作。'],
];
const MEMORY_GATES={house:7,garden:13,courtyard:23};
const TEA_CONDITIONS=[
 {id:'sunny',name:'晴日来坐坐',souvenir:'coaster',souvenirName:'两熊选的杯垫',souvenirRegion:'house',needs:{warm:[R('tea',3),R('bake',3)],garden:[R('tea',2),R('garden',3),R('craft',2)]}},
 {id:'memory',name:'想留一份纪念',souvenir:'card',souvenirName:'手绘小卡',souvenirRegion:'courtyard',needs:{warm:[R('tea',3),R('bake',2),R('craft',2)],garden:[R('tea',2),R('garden',2),R('craft',3)]}},
 {id:'wind',name:'今天有点风',souvenir:'chime',souvenirName:'小风铃',souvenirRegion:'garden',needs:{warm:[R('tea',3),R('bake',2),R('tools',2)],garden:[R('tea',2),R('garden',2),R('craft',2),R('tools',2)]}},
];
const TEA_PLANS={warm:{name:'暖心茶点',region:'house',wish:'备齐这一场的茶点材料，一二摆杯，布布端茶，再一起坐到小圆桌旁。'},garden:{name:'花园小聚',region:'garden',wish:'备齐这一场的花园茶会材料，在树荫下铺好临时茶布，再一起喝茶。'}};
const SOUVENIRS=TEA_CONDITIONS.flatMap(c=>Object.keys(TEA_PLANS).map(plan=>({key:`${c.souvenir}-${plan}`,condition:c.id,plan,name:`${c.souvenirName} · ${TEA_PLANS[plan].name}`,region:c.souvenirRegion,type:c.souvenir})));
function teaResponse(plan,condition,hasGuest=false){
 const lines={
  'sunny-warm':[['yier','这次面包留了一整块。臭布布，你先坐，我来摆杯子。'],['bubu','茶吹凉一点了。今天选的杯垫也收好了，下次可以摆在小圆桌旁。'],['xiaoli','面包还热着，杯垫的颜色也像这间小屋。下次我带果酱来。']],
  'sunny-garden':[['yier','临时茶布铺在树荫下，刚好能看见新叶。浇完小苗，我们就一起喝茶。'],['bubu','这株叶子长精神了。今天选的杯垫收好了，回屋里喝茶还会记得这里。'],['xiaoli','在树荫下闻到花草茶，连赶路的心情都慢下来了。']],
  'memory-warm':[['yier','我用蜡笔画了你端茶的样子。这张小卡，先送给你。'],['bubu','杯子摆好了。小卡也收好，想看时可以摆在庭院的纪念位，记住今天的下午。'],['xiaoli','这张小卡也记下了我们一起喝茶的下午！我会回一张巷口的明信片。']],
  'memory-garden':[['yier','把小苗和茶杯的颜色调在一起，画成今天的花园小卡。'],['bubu','我扶着茶布，画纸就不会滑走。画完把卡收好，不怕风把今天带走。'],['xiaoli','原来同一株小苗，可以画出这么多绿。我想把这张小卡的故事写进回信。']],
  'wind-warm':[['yier','桌边有一点风。一角用杯垫压稳，另一角也夹好了，茶巾终于不乱跑了。'],['bubu','两边都稳住了。小风铃也收好，之后可以摆在花园纪念位，记住今天的风。'],['xiaoli','你们把茶巾固定好，我的茶一滴也没洒。下次有风的时候，我还想来坐坐。']],
  'wind-garden':[['yier','树荫下的茶布刚才飘起来了。现在一角压稳，一角夹好，可以安心坐下啦。'],['bubu','两边都好了。先一起喝茶，再把小风铃收好，留给花园的纪念位。'],['xiaoli','两只熊一前一后把茶布稳住了。原来有风的下午，也能安心喝完一杯茶。']],
 }[`${condition}-${plan}`];
 return lines.slice(0,hasGuest?3:2).map(([who,text])=>({who,text}));
}
function itemName(c,l){return CHAINS[c]?.items[l-1]??'未知物品';}
function itemKey(c,l){return `${c}-${l}`;}
function mass(t){return t?.k==='item'?2**(t.l-1):0;}
function needMass(needs){return needs.reduce((n,r)=>n+2**(r.l-1)*r.n,0);}

// Delivery experience scales with the quantity of base materials committed.
function orderXP(needs){return 10+Math.floor(needMass(needs)/3);}




/** Deterministic, DOM-free game model. Every public mutation validates before spending. */
const clone = (v)=>JSON.parse(JSON.stringify(v));
function localDay(t){const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
const levelCost=(level)=>30+12*(level-1)+20*Math.floor((level-1)/10);
function levelReward(level){return level<=5?{energy:3,coins:20}:level<=10?{energy:4,coins:25}:level<=20?{energy:5,coins:35}:level<=40?{energy:6,coins:45}:{energy:8,coins:60};}
const levelThreshold=(level)=>{let total=0;for(let l=1;l<level;l++)total+=levelCost(l);return total;};
function levelProgress(s){let level=1,total=0;while(level<CFG.maxPlayerLevel&&s.xp>=total+levelCost(level)){total+=levelCost(level++);}return {level,current:level===CFG.maxPlayerLevel?0:s.xp-total,required:level===CFG.maxPlayerLevel?0:levelCost(level),next:level===CFG.maxPlayerLevel?null:level+1,total};}
const levelOf=(s)=>levelProgress(s).level;
function levelGift(level,stage=0){
 if(!Number.isInteger(level)||level<5||level>=CFG.maxPlayerLevel||level%CFG.levelGiftEvery!==0)return null;
 const c=CATS.filter(c=>CHAINS[c].unlock<=stage).at(-1)||'clean',l=Math.min(4,2+Math.floor(level/10));
 return {coins:40+level*8,scissors:Math.min(3,1+Math.floor(level/20)),items:[{k:'item',c,l},{k:'item',c,l}]};
}
const stockCap=(p)=>CFG.stockBase+(p.level-1)*CFG.stockPerLevel;
const good=(kind,extra={})=>({ok:true,kind,...extra});
const bad=(code,message)=>({ok:false,code,message});
const freshWorld=()=>({region:'house',activities:Object.fromEntries(REGIONS.map(r=>[r.id,{day:'',count:0}])),chapterGifts:[],memoryUnlocked:Object.fromEntries(REGIONS.map(r=>[r.id,false])),souvenirs:{},equipped:Object.fromEntries(REGIONS.map(r=>[r.id,null]))});
const freshTea=()=>({round:0,plan:'warm',firstVisit:'locked',lastResult:null});
// Exact v1.2.0 flavor pairs. Only these known old strings migrate by index;
// Recipe IDs and random state stay unchanged; economy migration below updates rewards.
const previousSideFlavor=[
 ['巷口留言','把小东西准备好，生活就方便一点。'],['下午的约定','不用赶，准备好了再送来就好。'],['邻里小纸条','今天也想分享一点热乎乎的心意。'],['窗边的请求','给平常的一天，添一点小颜色。'],['周末的准备','东西不用很多，合适就好。'],
];
function firstVisitResponse(participants=['bubu','yier','xiaoli']){
 return [{who:'yier',text:'小栗，你来了！花架和画台都摆好了，这块蛋糕是留给你的。'},{who:'bubu',text:'请坐。一二摆好杯子，我把热茶端过来，慢一点喝。'},{who:'xiaoli',text:'谢谢你们的邀请。我带来了巷口捡到的小叶子，想画进给你们的回信。下次，再一起喝花草茶吧。'}].filter(line=>participants.includes(line.who));
}
function freshState(now=Date.now(),seed=20261007){
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
  seen:{'clean-1':true},decorStyles:Array(24).fill(null),decorPositions:{},sideOrders:[],sideSerial:0,sideRefreshAt:[0,0],
  world:freshWorld(),tutorial:'merge',introSeen:false,finishedSeen:false,settings:{sound:true,music:false,reducedMotion:false}};
}

class GameEngine{
 constructor(state=null,now=Date.now()){
  this.s=state?clone(validateState(state)):freshState(now);
  this.flushChapterGifts();
  this.checkMemories();
  if(this.s.stage===24&&this.s.tea.firstVisit==='locked')this.s.tea.firstVisit='available';
  if(this.s.sideOrders.length===0){this.s.sideOrders=[this.makeSide(),this.makeSide()];}
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
 makeSide(){
  const cats=this.unlockedCats();const max=this.s.stage<4?3:this.s.stage<12?4:5;
  const c=cats[Math.floor(this.rng()*cats.length)];const l=2+Math.floor(this.rng()*(max-1));
  const needs=[{c,l,n:1}];
  if(this.s.stage>=8&&this.rng()<0.4){const c2=cats[Math.floor(this.rng()*cats.length)];const l2=2+Math.floor(this.rng()*2);if(c2===c&&l2===l)needs[0].n++;else needs.push({c:c2,l:l2,n:1});}
  const f=SIDE_FLAVOR[Math.floor(this.rng()*SIDE_FLAVOR.length)];
  const m=needMass(needs);
  return {id:`side-${++this.s.sideSerial}`,name:f[0],wish:f[1],needs,coins:8+m*2,xp:orderXP(needs)};
 }
 mainOrder(){
  const task=TASKS[this.s.stage];if(!task)return null;
  const totalPhases=task.phases?.length||1,phase=this.s.mainPrepStep;
  const needs=totalPhases>1?(phase<totalPhases?[task.needs[phase]]:[]):task.needs;
  return {...task,needs:clone(needs),fullNeeds:clone(task.needs),remainingNeeds:clone(totalPhases>1?task.needs.slice(phase):task.needs),phase,totalPhases,phaseLabel:task.phases?.[phase]||task.name,lesson:task.needs.find(r=>r.c!=='clean'&&!this.s.producerLessons[r.c])?.c||null};
 }
 teaOrder(){
  const {round,plan}=this.s.tea,c=TEA_CONDITIONS[round%3],p=TEA_PLANS[plan];
  return {available:this.s.stage>=13&&CATS.every(cat=>this.s.producerLessons[cat]),id:`tea-${round}-${plan}`,round,plan,condition:c.id,conditionName:c.name,name:p.name,wish:p.wish,needs:clone(c.needs[plan]),coins:16+2*needMass(c.needs[plan]),xp:orderXP(c.needs[plan]),region:p.region,participants:['bubu','yier',...(this.s.tea.firstVisit==='arrived'?['xiaoli']:[])],response:teaResponse(plan,c.id,this.s.tea.firstVisit==='arrived'),souvenirKey:`${c.souvenir}-${plan}`,souvenirName:c.souvenirName,souvenirRegion:c.souvenirRegion};
 }
 chooseTeaPlan(plan){if(!(plan in TEA_PLANS))return bad('PLAN','请选择暖心茶点或花园小聚。');if(!this.teaOrder().available)return bad('LOCKED','先认领小苗，并亲手认识每个工作台。');this.invalidate();this.s.tea.plan=plan;return good('teaPlan',{plan});}
 resultContext(order,kind='tea'){return {kind,id:order.id,round:order.round,plan:order.plan,condition:order.condition,region:order.region,participants:clone(order.participants),response:clone(order.response),stage:this.s.stage,decorStyles:clone(this.s.decorStyles),decorPositions:clone(this.s.decorPositions),equipped:clone(this.s.world.equipped),souvenirKey:order.souvenirKey};}
 beginFirstVisit(){
  if(this.s.tea.firstVisit!=='available')return bad(this.s.tea.firstVisit==='arrived'?'ARRIVED':'LOCKED',this.s.tea.firstVisit==='arrived'?'小栗已经来过啦，可以重看这次回忆。':'等家园准备好，再迎接小栗吧。');
  this.invalidate();this.s.tea.firstVisit='arrived';const order={...this.teaOrder(),id:'firstVisit',region:'courtyard',participants:['bubu','yier','xiaoli'],souvenirKey:null,response:firstVisitResponse()};
  this.s.tea.lastResult=this.resultContext(order,'firstVisit');return good('firstVisit',{result:clone(this.s.tea.lastResult)});
 }
 equipSouvenir(region,key){const spec=SOUVENIRS.find(s=>s.key===key&&s.region===region);if(!spec||!this.s.world.souvenirs[key])return bad('SOUVENIR','先在茶会中收好这件纪念物。');this.invalidate();this.s.world.equipped[region]=key;return good('equipSouvenir',{region,key});}
 submit(kind,id,expectedStep){
  let task,slot=-1;
  if(kind==='main'){
   if(this.s.stage>=24)return bad('FINISHED','主线已经完成，邻里委托还会继续。');
   if(id!==this.s.stage||this.s.delivered)return bad('STALE','这张心愿已经交付了，回小屋布置吧。');
   task=this.mainOrder();
   if(task.totalPhases>1&&expectedStep!==task.phase)return bad('STALE','准备阶段已更新，请查看现在需要什么。');
   if(task.lesson)return bad('LESSON',`先从${CHAINS[task.lesson].producer}亲手取出一次材料，再交付这张心愿。`);
  }else if(kind==='side'){
   slot=this.s.sideOrders.findIndex(o=>o.id===id);if(slot<0)return bad('STALE','这张委托已经更新啦。');task=this.s.sideOrders[slot];
   if(this.s.stage===0)return bad('TUTORIAL','先完成第一份小屋心愿吧。');
  }else if(kind==='tea'){
   task=this.teaOrder();if(!task.available)return bad('LOCKED','先认领小苗，并亲手认识每个工作台。');if(id!==task.id)return bad('STALE','本次茶会的轮次或方案已改变。');
  }else return bad('ORDER','找不到这张订单。');
  if(!this.canFulfill(task.needs))return bad('MISSING','材料还差一点，点物品图标可以查看合成路线。');
  this.invalidate();this.consume(task.needs);
  if(kind==='main'&&task.totalPhases>1){this.s.world.region=id===23&&task.phase===0?'garden':'courtyard';this.s.mainPrepStep++;if(this.s.mainPrepStep<task.totalPhases)return good('prepare',{orderKind:kind,id,phase:task.phase,totalPhases:task.totalPhases,phaseLabel:task.phaseLabel,region:this.s.world.region});}
  this.s.coins+=task.coins;
  this.s.stats.order++;this.s.daily.order++;
  const levelUps=this.gainXP(task.xp);
  if(kind==='main'){this.s.delivered=true;this.s.stars++;if(this.s.stage===0)this.s.tutorial='build';}
  else if(kind==='side'){this.s.sideOrders[slot]=this.makeSide();}
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
  if(target.kind==='main'){const o=this.mainOrder();return o&&!this.s.delivered&&target.id===o.id&&(o.totalPhases===1||target.step===o.phase)?o:null;}
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
  this.invalidate();this.s.sideOrders[slot]=this.makeSide();this.s.sideRefreshAt[slot]=now+CFG.sideCooldown;return good('refresh');
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
  const tea=orderMode==='tea',side=!tea&&(orderMode==='side'||this.s.stage>=24);
  if(!side&&!tea&&this.s.delivered)return {kind:'build'};
  const orders=tea?(this.teaOrder().available?[this.teaOrder()]:[]):side?this.s.sideOrders:[this.mainOrder()].filter(Boolean);
  if(!side&&!tea&&orders[0]?.lesson){const c=orders[0].lesson;return {kind:'produce',c,idx:CATS.indexOf(c),lesson:true};}
  if(tea&&!orders.length)return {kind:'locked',message:'先认领小苗，并亲手认识每个工作台。'};
  const ready=orders.find(o=>this.canFulfill(o.needs));
  if(ready)return {kind:'submit',orderKind:tea?'tea':side?'side':'main',id:ready.id,...(!side&&!tea&&ready.totalPhases>1?{step:ready.phase}:{})};
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
function validateState(raw){
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
 check(s.sideOrders.every(o=>o&&typeof o.id==='string'&&o.id.length<40&&typeof o.name==='string'&&o.name.length<60&&typeof o.wish==='string'&&o.wish.length<200&&integer(o.coins,1,1000)&&Array.isArray(o.needs)&&o.needs.length>=1&&o.needs.length<=3&&o.needs.every(r=>CATS.includes(r.c)&&CHAINS[r.c].unlock<=s.stage&&integer(r.l,1,6)&&integer(r.n,1,3))),'邻里订单内容无效。');
 check(new Set(s.sideOrders.map(o=>o.id)).size===s.sideOrders.length,'邻里订单编号重复。');
 check(Array.isArray(s.sideRefreshAt)&&s.sideRefreshAt.length===2&&s.sideRefreshAt.every(t=>integer(t,0,9007199254740000)),'刷新时间无效。');
 check(s.settings&&['sound','music','reducedMotion'].every(k=>typeof s.settings[k]==='boolean'),'设置无效。');
 check(['merge','deliver','build','produce','done'].includes(s.tutorial)&&typeof s.introSeen==='boolean'&&typeof s.finishedSeen==='boolean','教学记录无效。');
 // Economic release version is independent of the storage schema and application name.
 if(s.economyVersion===undefined){
  const oldLevel=Math.min(CFG.maxPlayerLevel,Math.floor(s.xp/60)+1),fraction=(s.xp%60)/60;
  s.xp=levelThreshold(oldLevel)+(oldLevel===CFG.maxPlayerLevel?0:Math.floor(fraction*levelCost(oldLevel)));
  if(s.bag.energyPacks!==undefined){check(integer(s.bag.energyPacks,0,100000),'旧体力点心数量无效。');s.coins=Math.min(100000000,s.coins+s.bag.energyPacks*CFG.legacyPackCoins);}
  s.economyVersion=CFG.economyVersion;
 }
 check(s.economyVersion===CFG.economyVersion,'不支持的经济版本。');
 s.energy=Math.min(CFG.energyCap,s.energy);delete s.bag.energyPacks;delete s.settings.calm;delete s.restAt;
 if(s.levelGiftsClaimed===undefined)s.levelGiftsClaimed=[];
 check(Array.isArray(s.levelGiftsClaimed)&&new Set(s.levelGiftsClaimed).size===s.levelGiftsClaimed.length&&s.levelGiftsClaimed.every(l=>levelGift(l,s.stage)&&l<=levelOf(s)),'升级礼包领取记录无效。');
 for(const o of s.sideOrders){delete o.energy;o.coins=8+2*needMass(o.needs);o.xp=orderXP(o.needs);}
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


/** Measured actor body bounds; presentation only. GIF bounds unite all frames. Atlas bodies may cross nominal cells. Source art is unchanged. */
const ACTOR_BOUNDS = {"ambient-bubu-guitar":{"bounds":[0.111111111,0.115555556,0.708888889,0.833333333],"slotAspect":1.0},"ambient-cuddle":{"bounds":[0.035,0.15,0.955,0.85],"slotAspect":1.0},"ambient-kiss":{"bounds":[0.020833333,0.266666667,0.979166667,0.733333333],"slotAspect":1.0},"ambient-yier-tea":{"bounds":[0.191666667,0.1375,0.658333333,0.85],"slotAspect":1.0},"bubu-back":{"bounds":[0.25,0.326923077,0.5,0.644230769],"slotAspect":0.923076923},"bubu-face":{"bounds":[0.203125,0.4140625,0.59375,0.5546875],"slotAspect":1.0},"bubu-happy":{"bounds":[0.236979167,0.3828125,0.5234375,0.5859375],"slotAspect":1.0},"bubu-idle":{"bounds":[0.236979167,0.322115385,0.526041667,0.649038462],"slotAspect":0.923076923},"bubu-joy":{"bounds":[0.205729167,0.271634615,0.588541667,0.699519231],"slotAspect":0.923076923},"bubu-side":{"bounds":[0.2734375,0.326923077,0.453125,0.644230769],"slotAspect":0.923076923},"bubu-sit":{"bounds":[0.234375,0.375,0.53125,0.596153846],"slotAspect":0.923076923},"bubu-sleep":{"bounds":[0.122395833,0.533854167,0.752604167,0.434895833],"slotAspect":1.0},"bubu-surprise":{"bounds":[0.236979167,0.380208333,0.5234375,0.588541667],"slotAspect":1.0},"bubu-turn":{"bounds":[0.25,0.324519231,0.5,0.646634615],"slotAspect":0.923076923},"bubu-walk":{"bounds":[0.231770833,0.324519231,0.536458333,0.646634615],"slotAspect":0.923076923},"yier-back":{"bounds":[0.2421875,0.326923077,0.515625,0.644230769],"slotAspect":0.923076923},"yier-face":{"bounds":[0.111979167,0.21875,0.7734375,0.75],"slotAspect":1.0},"yier-happy":{"bounds":[0.203125,0.4140625,0.591145833,0.5546875],"slotAspect":1.0},"yier-idle":{"bounds":[0.234375,0.331730769,0.528645833,0.639423077],"slotAspect":0.923076923},"yier-joy":{"bounds":[0.205729167,0.300480769,0.588541667,0.670673077],"slotAspect":0.923076923},"yier-paint":{"bounds":[0.166666667,0.283653846,0.666666667,0.6875],"slotAspect":0.923076923},"yier-rest":{"bounds":[0.177830941,0.119617225,0.632376396,0.772727273],"slotAspect":1.0},"yier-shy":{"bounds":[0.208333333,0.380208333,0.580729167,0.588541667],"slotAspect":1.0},"yier-side":{"bounds":[0.229166667,0.259615385,0.5390625,0.711538462],"slotAspect":0.923076923},"yier-surprise":{"bounds":[0.208333333,0.4140625,0.583333333,0.5546875],"slotAspect":1.0},"yier-turn":{"bounds":[0.236979167,0.300480769,0.526041667,0.670673077],"slotAspect":0.923076923},"yier-walk":{"bounds":[0.203125,0.252403846,0.591145833,0.71875],"slotAspect":0.923076923},"bubu-walk1":{"bounds":[0.179425837,0.131578947,0.672248804,0.866028708],"slotAspect":1.0},"bubu-walk2":{"bounds":[0.181818182,0.133971292,0.674641148,0.868421053],"slotAspect":1.0},"bubu-walk3":{"bounds":[0.19138756,0.141148325,0.672248804,0.858851675],"slotAspect":1.0},"bubu-walk4":{"bounds":[0.186602871,0.102870813,0.674641148,0.866028708],"slotAspect":1.0},"bubu-handover1":{"bounds":[0.160287081,0.100478469,0.679425837,0.868421053],"slotAspect":1.0},"bubu-handover2":{"bounds":[0.181818182,0.09569378,0.700956938,0.877990431],"slotAspect":1.0},"bubu-handover3":{"bounds":[0.177033493,0.040669856,0.73923445,0.861244019],"slotAspect":1.0},"bubu-support1":{"bounds":[0.196172249,0.074162679,0.674641148,0.830143541],"slotAspect":1.0},"bubu-support2":{"bounds":[0.177033493,0.141148325,0.677033493,0.763157895],"slotAspect":1.0},"yier-walk1":{"bounds":[0.209756098,0.145539906,0.675609756,0.856807512],"slotAspect":0.962441315},"yier-walk2":{"bounds":[0.175609756,0.15258216,0.665853659,0.854460094],"slotAspect":0.962441315},"yier-walk3":{"bounds":[0.143902439,0.145539906,0.673170732,0.861502347],"slotAspect":0.962441315},"yier-walk4":{"bounds":[0.207317073,0.105633803,0.680487805,0.840375587],"slotAspect":0.962441315},"yier-handover1":{"bounds":[0.180487805,0.098591549,0.709756098,0.84741784],"slotAspect":0.962441315},"yier-handover2":{"bounds":[0.146341463,0.098591549,0.731707317,0.845070423],"slotAspect":0.962441315},"yier-handover3":{"bounds":[0.224390244,0.098591549,0.670731707,0.762910798],"slotAspect":0.962441315},"yier-support1":{"bounds":[0.202439024,0.145539906,0.67804878,0.711267606],"slotAspect":0.962441315},"yier-support2":{"bounds":[0.158536585,0.178403756,0.668292683,0.680751174],"slotAspect":0.962441315},"xiaoli-idle":{"bounds":[0.277511962,0.043062201,0.698564593,0.947368421],"slotAspect":1.0},"xiaoli-wave":{"bounds":[0.184210526,0.040669856,0.729665072,0.947368421],"slotAspect":1.0},"xiaoli-walk1":{"bounds":[0.086124402,0.043062201,0.772727273,0.944976077],"slotAspect":1.0},"xiaoli-walk2":{"bounds":[0.198564593,0.043062201,0.755980861,0.918660287],"slotAspect":1.0},"xiaoli-walk3":{"bounds":[0.141148325,0.035885167,0.772727273,0.923444976],"slotAspect":1.0},"xiaoli-walk4":{"bounds":[0.133971292,0.043062201,0.753588517,0.923444976],"slotAspect":1.0},"xiaoli-sit":{"bounds":[0.181818182,0.0215311,0.775119617,0.923444976],"slotAspect":1.0},"xiaoli-receive":{"bounds":[0.136363636,0.028708134,0.803827751,0.916267943],"slotAspect":1.0},"xiaoli-hold":{"bounds":[0.155502392,0.0215311,0.729665072,0.928229665],"slotAspect":1.0},"ambient-bubu-guitar-motion":{"bounds":[0.111111111,0.115555556,0.708888889,0.833333333],"slotAspect":1.0},"ambient-cuddle-motion":{"bounds":[0.01,0.14,0.98,0.86],"slotAspect":1.0},"ambient-kiss-motion":{"bounds":[0.0,0.0375,1.0,0.9625],"slotAspect":1.0},"ambient-yier-tea-motion":{"bounds":[0.129166667,0.133333333,0.720833333,0.854166667],"slotAspect":1.0}};



/** Atlas lookup preserves the gameplay's item IDs. Each sheet has six square slots. */
const SPRITE_CATEGORIES = ['clean','tools','bake','tea','craft','garden'];
const atlasSlot = (asset, index) => ({asset, cols:3, rows:2, col:index%3, row:Math.floor(index/3), slotAspect:1, fit:'contain', inset:['atlas-tea','atlas-decor-b'].includes(asset)?0.125:0});

function spriteSpec(id) {
  if (typeof id !== 'string') return null;
  const actorBounds=ACTOR_BOUNDS[id];
  if(actorBounds){
    const motion=/^(bubu|yier)-(walk[1-4]|handover[1-3]|support[1-2])$/.exec(id),guest=/^xiaoli-(idle|wave|walk[1-4]|sit|receive|hold)$/.exec(id);
    const spec=motion?motionSlot(`atlas-${motion[1]}-motion`,['walk1','walk2','walk3','walk4','handover1','handover2','handover3','support1','support2'].indexOf(motion[2])):guest?motionSlot('atlas-xiaoli',['idle','wave','walk1','walk2','walk3','walk4','sit','receive','hold'].indexOf(guest[1])):{asset:id,cols:1,rows:1,col:0,row:0,slotAspect:actorBounds.slotAspect};
    return {...spec,slotAspect:actorBounds.slotAspect,bounds:actorBounds.bounds,grounded:true};
  }
  const motion = /^(bubu|yier)-(walk[1-4]|handover[1-3]|support[1-2])$/.exec(id);
  if (motion) return motionSlot(`atlas-${motion[1]}-motion`, ['walk1','walk2','walk3','walk4','handover1','handover2','handover3','support1','support2'].indexOf(motion[2]));
  const guest = /^xiaoli-(idle|wave|walk[1-4]|sit|receive|hold)$/.exec(id);
  if (guest) return motionSlot('atlas-xiaoli', ['idle','wave','walk1','walk2','walk3','walk4','sit','receive','hold'].indexOf(guest[1]));
  const prop = /^prop-(watering-can|clip|tea-cloth|coaster|postcard|wind-chime)$/.exec(id);
  if (prop) return atlasSlot('atlas-tea-props', ['watering-can','clip','tea-cloth','coaster','postcard','wind-chime'].indexOf(prop[1]));
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

const motionSlot = (asset,index) => ({asset,cols:3,rows:3,col:index%3,row:Math.floor(index/3),slotAspect:1,fit:'contain',inset:0});

function spriteContentRect(spec){const inset=spec?.inset||0;const [x,y,w,h]=spec?.bounds||[inset,inset,1-2*inset,1-2*inset];return {x,y,w,h};}

/** Display a slot's center, omitting specified transparent margins without editing PNGs. */
function drawSprite(ctx, image, spec, x, y, w, h) {
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  if (!iw || !ih || w <= 0 || h <= 0) return;
  const cols = spec?.cols || 1, rows = spec?.rows || 1;
  const slotW = iw / cols, slotH = ih / rows, content=spriteContentRect(spec);
  const sw = slotW * content.w, sh = slotH * content.h;
  const ratio = Math.min(w / sw, h / sh);
  const dw = sw * ratio, dh = sh * ratio;
  ctx.drawImage(image, ((spec?.col || 0)+content.x)*slotW, ((spec?.row || 0)+content.y)*slotH, sw, sh,
    x+(w-dw)/2, y+(spec?.grounded?h-dh:(h-dh)/2), dw, dh);
}

const SPRITE_ATLAS_IDS = [
  ...SPRITE_CATEGORIES.map(c=>`atlas-${c}`), 'atlas-generators',
  ...Array.from('abcd', letter=>`atlas-decor-${letter}`),
  'atlas-bubu-motion','atlas-yier-motion','atlas-xiaoli','atlas-tea-props',
];
const WORLD_ASSET_IDS = ['region-house','region-garden','region-courtyard','region-house-night','region-garden-night','region-courtyard-night','world-map','party-memory','yier-rest'];



/** Local simulated weather and presentation-only daily life. Never mutates a save. */

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const hash=text=>{let n=2166136261;for(const c of String(text))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
const asTime=now=>now instanceof Date?now.getTime():Number(now);
const pad=n=>String(n).padStart(2,'0');
function describeEnvironment(now=Date.now(),seed='cozy'){
 const time=asTime(now);if(!Number.isFinite(time))throw new TypeError('Environment time must be finite');
 const d=new Date(time),hour=d.getHours(),dateKey=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
 const phase=hour>=5&&hour<9?'morning':hour>=9&&hour<17?'day':hour>=17&&hour<19?'dusk':'night';
 const segment=Math.floor((hour*60+d.getMinutes())/10);
 const weather=['sunny','cloudy','rain','wind'][hash(`${seed}:${dateKey}:${segment}`)%4];
 return {phase,phaseLabel:{morning:'清晨',day:'白天',dusk:'黄昏',night:'夜晚'}[phase],night:phase==='night',weather,weatherLabel:{sunny:'晴朗',cloudy:'多云',rain:'小雨',wind:'微风'}[weather],clock:`${pad(hour)}:${pad(d.getMinutes())}`,segment,dateKey,simulated:true};
}

function actor(who,id,x,y,activity,flip=false){return {key:who,kind:'actor',who,id,x:clamp(x,11,89),y:clamp(y,14,86),w:22,h:22/1.12*1.2,z:12,anchor:'center',rotation:0,flip,label:who==='bubu'?'布布':'一二',activity};}
/** decorLayers may be supplied by describeScene to use its exact sprite layout. */
function ambientFrame(state,region,environment,now=Date.now(),decorLayers=[]){
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
 const walking=elapsed<(index===0||index===2?slot:6000),activity=walking?'walk':['walk','personal','walk','rest','together','look'][index];
 const actors=['bubu','yier'].map((who,i)=>{
  const from=previous[i],to=target[i],x=from[0]+(to[0]-from[0])*p,y=from[1]+(to[1]-from[1])*p;
  let own=activity,id=walking?`${who}-walk${Math.floor(time/180)%4+1}`:`${who}-${who==='bubu'?'idle':'turn'}`;
  if(!walking&&index===1){own=i===0&&book?'read':i===1&&painting?'view-painting':i===1&&flowers?'view-flowers':'look';id=own==='read'?'bubu-sit':`${who}-turn`;}
  if(!walking&&index===3){own=seat?'rest':'look';id=seat?`${who}-${i===0?'sit':'rest'}`:`${who}-turn`;}
  if(!walking&&index===4)id=`${who}-${i===0?'joy':'shy'}`;
  // Walk atlases face right; yier-turn faces left toward a nearby exhibit.
  const flip=walking?to[0]<from[0]:i===1&&index===1&&lookAt?lookAt.x>x:false;
  return actor(who,id,x,y,own,flip);
 });
 const props=[];
 if(!walking&&index===4)props.push({key:'ambient-heart',kind:'ambient-effect',id:null,glyph:'♡',x:52,y:47,w:8,h:7,z:16,rotation:0});
 let caption=walking?'布布和一二在家里慢慢走走':index===1?`${book?'布布在喜欢的故事旁歇一会儿':'布布看看这个角落'}，${painting?'一二看看自己的画':flowers?'一二看看新叶和花朵':'一二停下来看看风景'}`:index===3?(seat?'忙完一点点，一起坐下歇一会儿':'两只熊停下来，看看这个角落'):index===4?'走到你身边，今天也想和你贴贴':'两只熊停下来，享受刚刚好的安静';
 if(walking&&region!=='house')caption='两只熊沿着小路，慢慢散步';
 if(environment?.night&&activity==='rest')caption=seat?'夜深了，布布陪一二一起歇一会儿':caption;
 return {actors,props,caption,activity,index,walking};
}


/** Shared presentation descriptors. No operation in this module changes a save or pays a reward. */



const cloneSceneData=v=>JSON.parse(JSON.stringify(v));
const escapeSceneText=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sceneClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sceneMix=(a,b,t)=>a+(b-a)*t;
const sceneSmooth=t=>{t=sceneClamp(t,0,1);return t*t*(3-2*t);};
const SCENE_LAYOUT={0:{x:53,y:34,w:20},1:{x:49,y:18,w:35},4:{x:84,y:46,w:23},5:{x:84,y:72,w:24},6:{x:84,y:66,w:13},7:{x:23,y:67,w:18},9:{x:22,y:67,w:27},11:{x:82,y:22,w:22},13:{x:24,y:36,w:29},14:{x:83,y:43,w:26},15:{x:74,y:19,w:16},16:{x:82,y:91,w:19},17:{x:25,y:86,w:22},18:{x:62,y:86,w:13},19:{x:48,y:94,w:15},20:{x:50,y:22,w:54},21:{x:22,y:86,w:30},22:{x:79,y:86,w:30},23:{x:20,y:84,w:25}};
/** The displayed sprite box, not the source data's obsolete width, bounds a move. */
function decorBounds(id){
 const d=DECOR[id];if(!Number.isInteger(id)||!d)return null;
 const w=SCENE_LAYOUT[id]?.w??d.w,h=w/1.12;
 return {minX:w/2,maxX:100-w/2,minY:h/2,maxY:100-h/2};
}
/** Shared default, drag preview and saved-layout coordinates, in scene percentages. */
function decorPlacement(id,position){
 const d=DECOR[id];if(!Number.isInteger(id)||!d)return null;
 const p={...d,...SCENE_LAYOUT[id]},bounds=decorBounds(id);
 return {...p,h:p.w/1.12,bounds,...(position&&Number.isFinite(position.x)&&Number.isFinite(position.y)?{x:sceneClamp(position.x,bounds.minX,bounds.maxX),y:sceneClamp(position.y,bounds.minY,bounds.maxY)}:{})};
}
const SCENE_SOUVENIR_LAYOUT={coaster:{id:'prop-coaster',region:'house',x:72,y:70,w:10,label:'一起选的杯垫'},card:{id:'prop-postcard',region:'courtyard',x:68,y:39,w:13,label:'手绘小卡'},chime:{id:'prop-wind-chime',region:'garden',x:72,y:23,w:12,label:'小风铃'}};
const SCENE_WORLD_COORDS={house:[25,41],garden:[54,61],courtyard:[82,44]};
const freezeScene=scene=>cloneSceneData(scene);
function makeSceneActor(who,id,x,y,w=22){return {key:who,kind:'actor',who,id,x,y,w,h:w/1.12*1.2,z:12,anchor:'center',rotation:0,flip:false,label:{bubu:'布布',yier:'一二',xiaoli:'小栗'}[who]};}
function makeSceneProp(key,id,x,y,w=12,z=14,extra={}){return {key,kind:'prop',id,x,y,w,h:w/1.12,z,anchor:'center',rotation:0,...extra};}
function scenePoseId(id){return String(id).replace(/-happy$/,'-joy').replace(/^bubu-shy$/,'bubu-face');}
function sceneSouvenirType(key){return Object.keys(SCENE_SOUVENIR_LAYOUT).find(t=>key?.startsWith(t+'-')||key?.startsWith(t+':'));}

/** Percent coordinates are the same in DOM and exported photographs. */
function describeScene(state,options={}){
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
function renderSceneHTML(scene,{assetURL=id=>`assets/${id}.png`,interactive=scene.interactive}={}){
 const layers=scene.layers.map(l=>{
  const click=interactive&&['decor','actor','souvenir'].includes(l.kind),tag=click?'button':'div';
  const action=l.kind==='decor'?`data-action="furniture" data-id="${l.decorId}"`:l.kind==='actor'?`data-action="chat" data-who="${l.who}"`:`data-action="souvenirReplay" data-key="${escapeSceneText(l.souvenirKey)}"`;
  return `<${tag} class="scene-layer scene-${l.kind} ${l.who||''}" data-scene-layer="${escapeSceneText(l.key)}" data-sprite="${escapeSceneText(l.id)}" style="${sceneLayerStyle(l,scene)}" ${click?`${action} aria-label="${escapeSceneText(l.label)}"`: 'aria-hidden="true"'}>${l.id?sceneSpriteHTML(l.id,assetURL):l.glyph?escapeSceneText(l.glyph):''}</${tag}>`;
 }).join('');
 return `<img class="scene-background" src="${escapeSceneText(assetURL(scene.background))}" alt="" draggable="false" style="filter:${sceneBackgroundFilter(scene)}">${layers}${sceneWeatherHTML(scene)}`;
}

/** Snapshot before awaiting any image. Photos cannot drift to a new region/tea round. */
async function drawSceneCanvas(ctx,input,{loadImage,width=1000,height=1120}={}){
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

function describeWorldMap(state){
 const layers=[];
 for(const [region,threshold,id] of [['house',7,'tea-2'],['garden',13,'garden-2'],['courtyard',21,'decor-21']]){
  const [x,y]=SCENE_WORLD_COORDS[region];if(state.stage>=threshold)layers.push(makeSceneProp('map-'+region,id,x-5,y+10,region==='courtyard'?17:9,1));
  const key=state.world?.equipped?.[region],s=SCENE_SOUVENIR_LAYOUT[sceneSouvenirType(key)];if(s)layers.push(makeSceneProp('map-souvenir-'+region,s.id,x+9,y-6,8,2,{variant:key.endsWith('garden')}));
 }
 return {layers};
}
function renderWorldOverlays(state,options={}){return renderSceneHTML({...describeWorldMap(state),background:'world-map',night:false,interactive:false},options).replace(/^<img[^>]+>/,'');}

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
function createScenePlayer({event='tea',scene,onFrame=()=>{},onComplete=()=>{},onStep=()=>{},reducedMotion=false,choice='anchor',clock=()=>globalThis.performance?.now?.()??Date.now(),schedule=fn=>setTimeout(fn,80),cancel=id=>clearTimeout(id)}={}){
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

const SCENE_STYLES=`
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


/** Tap and drop share exact matching rules; non-matching drops keep the source in place. */
function boardDropIntent(board,from,to){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from===to)return {kind:'none'};
 const source=board[from],target=board[to];
 return source?.k==='item'&&!source.dust&&target?.k==='item'&&source.c===target.c&&source.l===target.l&&source.l<6?{kind:'merge',from,to}:{kind:'none'};
}
function boardTapIntent(board,selected,index){
 if(!Number.isInteger(index)||index<0||index>=board.length)return {kind:'none'};
 const target=board[index];
 if(target?.k==='gen')return {kind:'produce',index,c:target.c};
 const drop=boardDropIntent(board,selected,index);if(drop.kind==='merge')return drop;
 return {kind:'select',index:target?index:null};
}

/** Crossing the movement threshold starts dragging immediately; a stationary hold also arms it. */
function createPressHold({x,y,delay=360,threshold=8,onArm=()=>{},schedule=setTimeout,cancel=clearTimeout}={}){
 let armed=false,cancelled=false,ended=false;
 let timer=schedule(()=>{timer=null;if(!ended&&!cancelled&&!armed){armed=true;onArm();}},delay);
 const clear=()=>{if(timer!==null)cancel(timer);timer=null;};
 return {
  move(nextX,nextY){if(!armed&&!cancelled&&!ended&&Math.hypot(nextX-x,nextY-y)>threshold){clear();armed=true;onArm();}return armed&&!ended;},
  release(){clear();const result=ended||cancelled?'cancel':armed?'hold':'tap';ended=true;return result;},
  cancel(){clear();ended=true;cancelled=true;},
  get armed(){return armed&&!ended;},get cancelled(){return cancelled;}
 };
}







const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const esc=(v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=(id)=>window.__ASSETS__?.[id]||`assets/${id}.${id==='cozy-loop'?'wav':id.startsWith('ambient-')&&id.endsWith('-motion')?'gif':'png'}`;
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
ui.decorSelected=null;
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
 else if(r.kind==='prepare'){sounds.play('place');playEvent('prep',{result:r});}
 else if(r.kind==='firstVisit'){sounds.play('talk');playEvent('firstVisit',{teaResult:r.result});}
 else if(r.kind==='submit'){sounds.play('success');if(r.orderKind==='tea'){playEvent('tea',{teaResult:r.result||r.teaResult||game.s.tea.lastResult,reward:r});}else if(r.orderKind==='main'){if(r.totalPhases>1)playEvent('prep',{result:r,after:()=>openModal({type:'submitted',result:r})});else openModal({type:'submitted',result:r});}else{toast(`委托送达 · 金币 +${r.coins} · 经验 +${r.xp}`);burst(null);}}
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
 if(furnitureDrag)cancelFurnitureDrag();
 const scroll=main.scrollTop,orderScroll=$('.order-row')?.scrollLeft||0,viewport=$('.world-viewport');if(viewport)ui.mapScroll=viewport.scrollLeft;app.classList.toggle('reduced-motion',game.s.settings.reducedMotion);renderHeader();renderNav();
 main.innerHTML=ui.tab==='home'?renderHome():ui.tab==='book'?renderBook():ui.tab==='shop'?renderShop():renderMerge();
 main.scrollTop=scroll;const orders=$('.order-row',main);if(orders)orders.scrollLeft=orderScroll;
 const map=$('.world-viewport');if(map)map.scrollLeft=ui.mapScroll;
 if(ui.modal)renderModal();
 syncInert();
}
function navigate(tab){cancelDrag();cancelFurnitureDrag();ui.decorSelected=null;if(tab==='home'&&game.s.delivered)focusBuildRegion();ui.tab=tab;ui.selected=null;ui.highlight=[];render();main.scrollTop=0;}
function focusBuildRegion(){const region=DECOR[game.s.stage]?.region;if(region){game.visitRegion(region);persist();ui.homeMode='region';}}
function renderHeader(){
 const s=game.s,chapter=CHAPTERS[Math.min(5,Math.floor(s.stage/4))];
 $('#header').innerHTML=`<div class="brand-line"><span class="brand-mark">${icon('home')}</span><div><div class="brand">${esc(TITLE)}</div><div class="brand-sub">${s.stage===24?'每一天，继续可爱':'布布一二 · '+chapter.short}</div></div><div class="header-tools"><button class="icon-button" data-action="daily" aria-label="每日小目标" title="每日小目标" style="position:relative">${icon('calendar')}${!s.daily.gift||DAILY.some(d=>s.daily[d.key]>=d.target&&!s.daily.claimed.includes(d.key))?'<i class="badge-dot"></i>':''}</button>${ib('settings','settings','设置与存档')}</div></div>
 <div class="resources"><button class="level-badge" data-action="growth" aria-label="查看成长进度与每5级礼包"><small>Lv.</small><span id="level-count">${levelOf(s)}</span>${Array.from({length:Math.min(19,Math.floor(levelOf(s)/5))},(_,i)=>(i+1)*5).some(l=>!s.levelGiftsClaimed.includes(l))?'<i class="badge-dot"></i>':''}</button><button class="resource energy" data-action="energy" aria-label="查看体力恢复规则">${picture('util-energy')}<span id="energy-count">${s.energy}</span><small>/100</small></button><button class="resource" data-action="shop" aria-label="金币与小铺">${picture('util-coin')}<span id="coin-count">${s.coins}</span><span class="plus">+</span></button><button class="resource star" data-action="home" aria-label="心愿星，用于布置小屋">${picture('util-star')}<span>${s.stars}</span></button></div>${storageFailed?'<div class="save-notice">本地保存受限 · 请导出存档</div>':''}`;
}
function renderNav(){
 $('#nav').innerHTML=[['home','home','家园'],['merge','merge','合成'],['book','book','手帐'],['shop','shop','小铺']].map(([tab,ic,label])=>`<button data-tab="${tab}" aria-current="${ui.tab===tab?'page':'false'}" class="${ui.tab===tab?'active':''}">${icon(ic)}<span>${label}</span>${tab==='home'&&game.s.delivered?'<i class="nav-star">!</i>':''}</button>`).join('');
}
function rewardLine(task,star=false){return `<div class="reward-line">${star?`<span>${picture('util-star')}1</span>`:''}<span>${picture('util-coin')}${task.coins}</span>${task.xp?`<span class="xp-reward">XP +${task.xp}</span>`:''}</div>`;}
function requirement(r){const n=game.count(r.c,r.l);return `<button class="required-item ${n>=r.n?'ready':''}" data-action="item" data-cat="${r.c}" data-level="${r.l}" aria-label="需要${r.n}个${itemName(r.c,r.l)}，${r.l}级，当前有${n}个">${picture(itemKey(r.c,r.l),'',itemName(r.c,r.l))}<span class="need-level">${r.l}级</span><span class="count">${Math.min(n,r.n)} / ${r.n}</span>${n>=r.n?icon('check'):''}</button>`;}
function activeOrders(){const mainOrder=game.mainOrder(),tea=game.teaOrder();return [...(mainOrder?[{task:mainOrder,kind:'main',slot:0}]:[]),...(game.s.stage>0?game.s.sideOrders.map((task,slot)=>({task,kind:'side',slot})):[]),...(tea.available?[{task:tea,kind:'tea',slot:0}]:[])];}
function allOrderCards(){const list=activeOrders(),tea=game.teaOrder(),neighbors=game.s.stage===0?[1,2].map(n=>`<article class="order-card order-mini locked-order"><span class="order-kind">邻里 ${n}</span><h3>巷口的小委托</h3><p>铺好第一块门垫后开放。帮邻里整备物品，收获金币与经验。</p></article>`).join(''):'';return list.map(({task,kind,slot})=>orderCard(task,kind,slot)).join('')+neighbors+(!tea.available?`<article class="order-card order-mini locked-order"><span class="order-kind">茶会</span><h3>留一张茶会邀请</h3><p>完成第13处布置，并亲手认识已开启的工作台后开放。</p>${btn('了解茶会','openTea','small alt')}</article>`:'');}
function teaContent(){
 const t=game.teaOrder();if(!t.available)return `<article class="tea-intro"><h3>在花园认识小苗之后，一起喝茶吧。</h3><p>完成第13处布置，亲手试过每个已开启的工作台，就可以准备两熊茶会。每场都可自由换方案，错过一天不会失去进度。</p>${game.mainOrder()?.lesson?btn('认识新工作台','source','small',`data-cat="${game.mainOrder().lesson}"`):''}</article>`;
 return `<div class="tea-condition"><span class="tag">第 ${t.round+1} 场 · ${esc(t.conditionName)}</span><p>${t.condition==='sunny'?'今天放晴了，选一个喜欢的地方坐坐。':t.condition==='memory'?'想留下今天，一起做一张小小纪念吧。':'有点风，用夹子固定茶布，再把杯子放稳。'} ${t.participants.includes('xiaoli')?'小栗也来坐坐。':'这一场，先留给布布和一二。'}</p></div><div class="tea-plans">${Object.entries(TEA_PLANS).map(([key,p])=>`<button data-action="teaPlan" data-plan="${key}" class="${t.plan===key?'active':''}" aria-pressed="${t.plan===key}"><b>${p.name}</b><span>${p.wish}</span></button>`).join('')}</div>${orderCard(t,'tea')}<p class="note">交付前可免费换方案，物品保持原样。完成后出现动作与不同回应，纪念物永久收藏，不要求连续登录。</p>`;
}
function teaHomeCard(){
 const t=game.teaOrder(),first=game.s.tea.firstVisit;
 return `<article class="tea-home-card"><h3>${first==='available'?'邀请小栗来坐坐':t.available?'今天，想怎样喝茶？':'留出一个一起坐下的位置'}</h3><p>${first==='available'?'邀请中的日子到了，布布一二准备好迎接小栗。':t.available?`选暖心茶点或花园小聚，准备材料，让${first==='arrived'?'三位朋友':'布布一二'}一起坐坐，留下今天的纪念。`:'认领第一株小苗，并亲手认识各工作台后，两熊茶会就会开放。'}</p><div class="actions">${first==='available'?btn('迎接小栗首访','firstVisit'):btn(t.available?'准备茶会':'看看茶会','openTea','alt')}${game.s.tea.lastResult?btn('重看最近一次','teaReplay','alt'):''}</div></article>`;
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
function orderCard(task,kind='main',slot=0){
 const delivered=kind==='main'&&game.s.delivered,lesson=kind==='main'&&task.lesson,ready=game.canFulfill(task.needs)&&!lesson,who=kind==='main'?task.who:(slot===0?'yier':'bubu');
 return `<article class="order-card order-mini ${kind==='side'?'side-order':''} ${ready||delivered?'fulfilled':''}" data-order-kind="${kind}" data-order-id="${task.id}"><div class="order-top"><span class="order-kind">${kind==='main'?'小屋心愿':kind==='tea'?'一起茶会':`邻里 ${slot+1}`}</span>${kind==='side'?`<button class="refresh-order" data-action="refreshSide" data-slot="${slot}" aria-label="免费更换第${slot+1}张邻里委托">${icon('refresh')}</button>`:''}</div><button class="order-name" data-action="orderDetails" data-kind="${kind}" data-id="${task.id}">${esc(task.phaseLabel||task.name)}</button>${task.totalPhases>1?`<span class="phase-line">准备 ${task.phase+1}/${task.totalPhases}</span>`:''}${lesson?`<button class="lesson-line" data-action="source" data-cat="${lesson}">${picture('gen-'+lesson)}认识来源</button>`:''}<div class="requirements">${task.needs.map(requirement).join('')}</div>${rewardLine(task,kind==='main')}<div class="order-action">${delivered?btn('前往布置','goBuild','small'):btn(ready?(kind==='tea'?'开始茶会':'交付'):'准备中','submit','small',`data-kind="${kind}" data-id="${task.id}" data-step="${task.phase||0}" ${ready?'':'disabled'}`)}${kind==='tea'?btn('换方案','openTea','small alt'):''}</div></article>`;
}
function renderMerge(){
 const s=game.s,compact=window.innerHeight<=710;
 return `<section class="merge-view ${compact?'compact-view':''}"><div class="order-strip order-row" aria-label="订单横排，可左右滑动查看其他订单">${allOrderCards()}</div><div class="board-header"><div class="board-title">合成工作台<span class="board-free">空位 ${game.free()}</span></div><div class="board-tools"><button data-action="storage">${icon('box')}仓库${s.pending.length?`<i class="parcel-count">${s.pending.length}</i>`:''}</button><button data-action="sort" aria-label="整理棋盘">${icon('sort')}</button><button data-action="hint">${icon('light')}提示</button></div></div>${tutorialLine()}<div class="board-frame"><div class="board" role="grid" aria-label="7乘7合成棋盘；点击或拖动同类同级合成，拖到其他格返回原位">${Array.from({length:7},(_,row)=>`<div role="row" class="board-row">${s.board.slice(row*7,row*7+7).map((t,col)=>renderCell(t,row*7+col)).join('')}</div>`).join('')}</div></div>${detailBar()}</section>`;
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
function tutorialLine(){
 const s=game.s;let line='同类同级合在一起，小小的物品也会慢慢长大。',who='bubu-idle';
 if(s.tutorial==='merge')line='先点发亮的小方巾，再点右边尘封的小方巾。也可直接把小方巾拖到相同物品上。';
 if(s.tutorial==='deliver')line='软海绵准备好了！点上面的“交付心愿”。';
 if(s.tutorial==='build')line='带上这颗心愿星，去“小屋”亲手铺好门垫吧。';
 if(s.tutorial==='produce')line='接下来，点左上角带闪电的清洁篮，取出新材料。';
 if(s.tutorial==='done'){
  const lesson=game.mainOrder()?.lesson;if(lesson)return `<button class="tutorial-line lesson-line" data-action="source" data-cat="${lesson}">${picture('gen-'+lesson)}<span>先点一次${CHAINS[lesson].producer}，试试新来源。</span></button>`;
  const hint=game.hint('main');line=hint.kind==='build'?`材料备齐啦，去${REGIONS.find(r=>r.id===DECOR[s.stage]?.region)?.name||'家园'}一起布置。`:hint.kind==='submit'?'这一份小屋心愿已经备齐，交付后带心愿星去布置。':game.free()<4?'桌子有点满啦。仓库、订单、出售都能帮你腾出空位。':`${CHAPTERS[Math.min(5,Math.floor(s.stage/4))].sub} 选中物品后，点下方信息按钮查看合成路线。`;
 }
 return `<div class="tutorial-line">${picture(who)}<span>${line}</span></div>`;
}
function detailBar(){
 const t=game.s.board[ui.selected];
 if(!t)return `<div class="detail-bar"><div class="detail-hint">${icon('heart')}<div>合成一点小心愿<small>拖动合成，也支持“点选 → 点目标”</small></div></div>${ib('info','help','玩法说明','',true)}</div>`;
 if(t.k==='gen'){
  const p=game.s.producers[t.c],unlocked=game.unlocked(t.c);
  return `<div class="detail-bar">${picture('gen-'+t.c,'detail-art')}<div class="detail-content"><h4>${CHAINS[t.c].producer} · Lv.${p.level}</h4><p>${unlocked?`每次 1 体力 · 二阶产出率 ${Math.round((.2+(p.level-1)*.12)*100)}%`:`完成第 ${CHAINS[t.c].unlock} 处修缮后自动解锁`}</p><p>${unlocked?'库存每 6 秒恢复 1 件 · 可升级':''}</p></div>${ib('info','chain','查看产出路线',`data-cat="${t.c}"`,true)}${unlocked&&p.level<3?btn(`升级 ${CFG.upgradeCosts[p.level-1]}`,'upgrade','small',`data-cat="${t.c}"`):''}</div>`;
 }
 if(t.k==='crate')return `<div class="detail-bar">${picture('util-crate','detail-art')}<div class="detail-content"><h4>还没整理的纸箱</h4><p>完成第 ${t.openAt} 处小屋布置后，自动腾出空间。</p><p>不需要金币，不会丢失已收好的物品。</p></div>${ib('home','home','回小屋')}</div>`;
 return `<div class="detail-bar">${picture(itemKey(t.c,t.l),'detail-art')}<div class="detail-content"><h4>${itemName(t.c,t.l)} · ${t.l} 级</h4><p>${t.dust?'用同类同级物品合入，解开尘封。':t.l===6?'最高级 · 可以交付或收藏':`下一阶：${itemName(t.c,t.l+1)}`}</p></div><div class="detail-actions">${ib('info','item','查看物品路线',`data-cat="${t.c}" data-level="${t.l}"`)}${!t.dust?`${ib('box','store','收进仓库')}${ib('info','itemActions','出售或拆分此物品')}`:''}</div></div>`;
}
let liveHomeScene=null,liveWeatherKey='';
const PHASES=['morning','day','dusk','night'],WEATHERS=['sunny','cloudy','rain','wind'];
function homeEnvironment(now=Date.now()){
 const env=describeEnvironment(now,game.s.createdAt);
 if(ui.environmentPhase){env.phase=ui.environmentPhase;env.phaseLabel={morning:'清晨',day:'白天',dusk:'黄昏',night:'夜晚'}[env.phase];env.night=env.phase==='night';}
 if(ui.environmentWeather){env.weather=ui.environmentWeather;env.weatherLabel={sunny:'晴朗',cloudy:'多云',rain:'小雨',wind:'微风'}[env.weather];}
 env.preview=!!(ui.environmentPhase||ui.environmentWeather);return env;
}
function decorateLivingScene(scene,now){
 const a=scene.ambient;if(!a||a.walking)return scene;
 if(scene.region!=='garden'&&a.activity==='rest'&&a.actors.some(actor=>actor.activity==='rest')){
  for(const actor of scene.layers.filter(l=>l.kind==='actor')){const original=actor.h;actor.id=actor.who==='bubu'?'ambient-bubu-guitar':'ambient-yier-tea';actor.w=actor.who==='bubu'?25:24;actor.h=actor.w/1.12;actor.y+=original/2-actor.h/2;actor.flip=false;}
  scene.caption='布布拨几下琴弦，一二捧着热茶，慢慢歇一会儿';
 }
 if(a.activity==='together'){
  const id=Math.floor(now/90000)%2?'ambient-kiss':'ambient-cuddle';
  const feet=Math.max(...a.actors.map(actor=>actor.y+actor.h/2));
  scene.layers=scene.layers.filter(l=>l.kind!=='actor'&&l.key!=='ambient-heart');
  scene.layers.push({key:'ambient-pair-moment',kind:'actor',who:'yier',id,x:52,y:feet-40/1.12/2,w:40,h:40/1.12,z:12,rotation:0,label:'布布和一二贴贴，点击聊聊'});
 }
 return scene;
}
function livingScene(region=game.s.world.region,now=Date.now()){
 return decorateLivingScene(describeScene(game.s,{region,environment:homeEnvironment(now),ambient:!game.s.settings.reducedMotion,now,interactive:true}),now);
}
function livingAsset(id){return asset(id.startsWith('ambient-')&&!id.endsWith('-motion')&&!game.s.settings.reducedMotion?id+'-motion':id);}
function environmentSettings(){const env=homeEnvironment();return `<div class="section-title">家园环境预览</div><p class="description">${env.phaseLabel} · ${env.weatherLabel} · ${env.preview?'正在预览':'跟随本地时间，游戏内模拟天气'}</p><div class="actions">${btn('切换时段','cycleTime','small alt')}${btn('切换天气','cycleWeather','small alt')}${env.preview?btn('跟随时间','environmentAuto','small alt'):''}</div>`;}
function homeScene(progress=game.s.stage,{interactive=false,characters=true,mini=false,night=false,poses=null,region=game.s.world?.region||'house',teaResult=null,scene=null,historical=false}={}){
 const info=REGIONS.find(r=>r.id===region)||REGIONS[0];
 const live=interactive&&!scene&&!historical&&!teaResult;
 const frozen=scene||(live?livingScene(info.id):describeScene(game.s,{stage:progress,region:info.id,night,poses,characters,teaResult,...(historical?{decorPositions:{},equipped:{house:null,garden:null,courtyard:null},replay:true}:{})}));
 if(live){liveHomeScene=clone(frozen);liveWeatherKey=frozen.environment.phase+':'+frozen.environment.weather;}
 const target=decorPlacement(Math.min(progress,23)),canBuild=progress<24&&target.region===info.id;
 return `<div class="home-scene region-${info.id}" data-region-scene="${info.id}"><div class="scene-layers">${renderSceneHTML(frozen,{assetURL:live?livingAsset:asset,interactive})}</div>${interactive?`<div class="room-number">${info.name} · ${DECOR.filter(d=>d.id<progress&&d.region===info.id).length} 处心愿</div>${canBuild?`<button type="button" class="build-pin ${game.s.delivered?'ready':''}" data-action="goBuild" aria-label="${game.s.delivered?'可以布置啦，前往布置':'查看下一项布置'}" style="left:${Math.max(18,Math.min(82,target.x))}%;top:${Math.max(25,Math.min(83,target.y))}%">${icon('plus')}${game.s.delivered?'可以布置啦':'下一个小愿望'}</button>`:''}${furnitureControlMarkup(frozen)}`:''}</div>${interactive?furnitureToolsMarkup(frozen):''}`;
}
function refreshLivingScene(now=Date.now()){
 if(document.hidden||ui.tab!=='home'||ui.homeMode!=='region'||ui.modal||ui.story||ui.splash||drag||furnitureDrag||ui.decorSelected!==null||$('.room-chat'))return;
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
 if(!game.s.delivered){navigate('merge');showHint();return;}
 cancelDrag();cancelFurnitureDrag();ui.decorSelected=null;focusBuildRegion();ui.tab='home';ui.styleChoice=0;render();main.scrollTop=0;openModal({type:'build'});
}
function speakerPortrait(who){return picture(who==='xiaoli'?'xiaoli-idle':who+'-face','speaker-avatar',who==='bubu'?'布布头像':who==='yier'?'一二头像':'小栗头像');}
function speechRow(who,text){const name={bubu:'布布',yier:'一二',xiaoli:'小栗'}[who]||'';return `<div class="speech-row">${speakerPortrait(who)}<div><b>${name}</b><p>${esc(text)}</p></div></div>`;}
function eventReplyMarkup(record){return Array.isArray(record.response)?record.response.map(line=>typeof line==='string'?`<p>${esc(line)}</p>`:speechRow(line.who,line.text)).join(''):esc(eventReply(record));}
function furnitureControlMarkup(scene){
 const layer=scene.layers.find(l=>l.kind==='decor'&&l.decorId===ui.decorSelected);if(!layer)return '';
 return `<div class="furniture-move-handle" style="left:${layer.x}%;top:${Math.max(7,layer.y-layer.h/2-6)}%"><button data-action="decorMoveHandle" data-id="${layer.decorId}" aria-label="移动${esc(layer.label)}；按住拖动或用方向键调整">${icon('sort')}移动</button></div>`;
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
function renderHome(){
 const s=game.s,ch=Math.min(5,Math.floor(s.stage/4)),chapter=CHAPTERS[ch],t=TASKS[s.stage];
 const region=REGIONS.find(r=>r.id===s.world.region)||REGIONS[0],p=game.worldProgress(),r=p.regions.find(r=>r.id===region.id),nextRegion=REGIONS.find(r=>r.id===DECOR[s.stage]?.region);
 return `<section class="home-view"><div class="page-heading"><div><span class="eyebrow">BEARS AT HOME · CHAPTER ${String(ch+1).padStart(2,'0')}</span><h2>${ui.homeMode==='map'?'熊熊之家，逛逛我们的家':region.name}</h2><p>${ui.homeMode==='map'?'小屋 · 花园 · 庭院，把生活慢慢铺开':region.subtitle}</p><div class="chapter-progress">${Array.from({length:6},(_,i)=>`<i class="${s.stage>=i*4+4?'done':''}"></i>`).join('')}</div></div>${ib('book','book','翻开回忆手帐')}</div><div class="home-toolbar">${ui.homeMode==='region'?btn(icon('back')+'家园全景','worldMap','small alt'):''}${btn(icon('merge')+'回合成台','merge','small')}</div>${ui.homeMode==='map'?worldMap():`<div class="region-tabs">${REGIONS.map(v=>`<button class="${v.id===region.id?'active':''}" data-action="visitRegion" data-region="${v.id}">${v.name}</button>`).join('')}</div><div class="home-scene-shell">${homeScene(s.stage,{interactive:true,night:ui.night})}</div><div class="home-actions"><button data-action="photo">${icon('camera')}拍张合照</button><button data-action="decorate">${icon('palette')}换个配色</button></div><article class="region-activity"><span class="activity-flower">${region.id==='garden'?'✿':region.id==='courtyard'?'☀':'♡'}</span><div><h3>${r.activityLabel||region.activityLabel}</h3><p>${s.stage===0?'先铺好第一块门垫，再一起做今天的小事。':r.activityDone?'今天的小事已经一起做过，明天再来。':r.activityText||region.activityText}</p></div>${btn(r.activityDone?'明天再来':'一起做','homeActivity','small',`data-region="${region.id}" ${r.activityDone||s.stage===0?'disabled':''}`)}</article>`}${teaHomeCard()}<div class="world-memory-track">${icon('book')}家园回忆 ${p.memoryCount} / 3 张<span>各区域每天一次陪伴，收集新的日常</span></div>${t?`<article class="home-quest">${picture(t.decor,'home-quest-thumb')}<span class="eyebrow">下一处心愿 · ${nextRegion?.name||'小屋'} · ${s.stage+1}/24</span><h3>${t.name}</h3><p>${s.delivered?'心愿星已经备好。走到对应区域，亲手布置新角落。':t.wish}</p><div class="home-quest-row"><span class="tag ${s.delivered?'':'coral'}">${icon(s.delivered?'star':'merge')}${s.delivered?'心愿星 ×1 已就绪':'先准备合成物品'}</span>${btn(s.delivered?'前往布置':'去合成','build',s.delivered?'':'alt')}</div></article>`:`<article class="home-quest"><span class="eyebrow">BEARS AT HOME</span><h3>家园变大了，陪伴也更多了。</h3><p>${s.tea.firstVisit==='arrived'?'去花园照顾花草，回小屋准备点心，再与小栗一起喝茶。':'家园和茶点都准备好了，去迎接受邀的小栗吧。'}每天都有一件可以一起做的小事。</p><div class="home-quest-row">${btn('继续合成','merge')}${btn(s.tea.firstVisit==='arrived'?'重温待客准备':'看看待客准备','ending','alt')}</div></article>`}</section>`;
}
function renderBook(){
 const s=game.s;let content='';
 if(ui.bookMode==='memories'){
  content=`${renderSouvenirs()}${renderWorldMemories()}<div class="section-title">六章生活 · 永久收藏</div><div class="memory-grid">${CHAPTERS.map((c,i)=>{const ok=s.stage>=(i+1)*4;return `<button class="memory-card" data-action="memory" data-chapter="${i}" ${ok?'':'disabled'}><div class="memory-art ${ok?'':'locked'}">${ok&&i===5?picture('party-memory','party-memory'):homeScene(Math.min(s.stage,(i+1)*4),{mini:true,poses:c.pose,night:i===4,region:DECOR[(i+1)*4-1].region,historical:true})}${ok?'':icon('lock')}</div><h3>${String(i+1).padStart(2,'0')} · ${ok?c.memory:c.name}</h3><p>${ok?'轻轻翻开这一天':`完成第 ${i+1} 章后收进手帐`}</p></button>`;}).join('')}</div>${s.stage?`<div class="past-stories"><div class="companion-illustration">${picture('story-companion')}<span>和你一起，平凡也很可爱。</span></div><div class="section-title">已经发生的小故事</div>${TASKS.slice(0,s.stage).map(t=>`<button data-action="replayTask" data-id="${t.id}">${picture(t.decor)}${t.name}${icon('play')}</button>`).join('')}</div>`:''}`;
 }else if(ui.bookMode==='collection'){
  content=`<div class="collection-count"><span>物品图鉴 · 每一种都有名字</span><b>${Object.keys(s.seen).length} / 36</b></div>${CATS.map(c=>`<section class="chain-section"><div class="chain-head">${picture('gen-'+c)}<div><h3>${CHAINS[c].name}</h3><p>来源：${CHAINS[c].producer}</p></div>${ib('arrow','source','前往这个工作台',`data-cat="${c}"`,true)}</div><div class="collection-grid">${CHAINS[c].items.map((name,i)=>{const seen=s.seen[itemKey(c,i+1)],count=game.count(c,i+1);return `<button class="collection-item ${seen?'':'unseen'}" data-action="item" data-cat="${c}" data-level="${i+1}"><small>${i+1} 级</small>${picture(itemKey(c,i+1),'',name)}<span>${name}</span>${count?`<span class="mini-count">持有 ${count}</span>`:''}</button>`;}).join('')}</div></section>`).join('')}`;
 }else{
  content=`<div class="stats-grid"><div class="stat"><strong>${s.stats.merge}</strong><span>次小小合成</span></div><div class="stat"><strong>${s.stats.order}</strong><span>个心愿送达</span></div><div class="stat"><strong>${s.stage}</strong><span>处温暖角落</span></div></div>${dailyContent()}<div class="section-title">一起玩的小约定</div><p class="description muted" style="font-size:11px">不着急、不比快。每天的小目标不是必须完成的功课；错过一天，也不会失去已经建好的小屋。</p>`;
 }
 return `<section class="book-view"><div class="book-hero"><span class="eyebrow">OUR DAYS, IN LITTLE PAGES</span><h2>我们的生活手帐</h2><p>合过的小东西，和舍不得忘记的今天。</p>${icon('book')}</div><div class="book-controls"><div class="segmented"><button class="${ui.bookMode==='memories'?'active':''}" data-action="bookMode" data-mode="memories">回忆明信片</button><button class="${ui.bookMode==='collection'?'active':''}" data-action="bookMode" data-mode="collection">物品图鉴</button><button class="${ui.bookMode==='daily'?'active':''}" data-action="bookMode" data-mode="daily">今日小目标</button></div></div>${content}</section>`;
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
 else if(m.type==='itemActions'){const t=s.board[m.index];title='收好、拆分或出售';body=t?.k==='item'?`${picture(itemKey(t.c,t.l),'hero-img')}<h3 class="center">${itemName(t.c,t.l)}</h3><p class="description">拆分会消耗一把剪刀，并需要一个额外空位；出售得到 ${mass(t)} 金币。出售会直接移除物品，无法撤回。</p><div class="actions">${btn('用剪刀拆分','split','alt')}${btn('出售此物品','sell','danger')}</div>`:'<p>先选择棋盘上的物品。</p>';}
 else if(m.type==='event'){title=m.title;body=`<div class="event-scene">${homeScene(m.scene.stage,{mini:true,scene:ui.sceneSnapshot||m.scene,region:m.scene.region,night:m.scene.night})}</div>${m.scene.result?.condition==='wind'?`<div class="wind-choices"><span>风来了，先把茶布固定好：</span>${btn('夹子夹好','sceneChoice','small alt','data-choice="clip"')}${btn('杯垫压稳','sceneChoice','small alt','data-choice="anchor"')}</div>`:''}<div class="event-caption" aria-live="polite">${m.reply?eventReplyMarkup(m.reply):esc(m.caption||'两只熊一起把今天准备好。')}</div>${m.reward?`<p class="event-reward">已收好 ${m.reward.coins} 金币 · ${m.reward.xp||0} 经验${m.reward.firstSouvenir?' · 新纪念物已入手帐':''}</p>`:''}<div class="actions">${btn('下一步动作','sceneAdvance','alt','disabled')}${btn('跳到结果','sceneSkip','alt')}${btn('再看一次','sceneReplay','alt')}${btn(icon('camera')+'合照','photo','alt')}</div><p class="note">回放与拍照不会再次消耗材料，也不会重复发奖。</p>`;}
 else if(m.type==='orders'){
  title='今天的小心愿';body=`<div class="order-strip order-row">${allOrderCards()}</div>`;
 }else if(m.type==='teaPlans'){
  title='准备怎样的茶会？';body=teaContent();
 }else if(m.type==='orderDetails'){
  const task=activeOrders().find(v=>v.kind===m.kind&&String(v.task.id)===String(m.id))?.task;title=task?.name||'这份心愿已完成';body=task?`<p class="description">${esc(task.wish)}</p>${task.totalPhases>1?`<p class="description">准备 ${task.phase+1}/${task.totalPhases} · ${esc(task.phaseLabel)}<br>各步骤交付后摆到现场，整单完成才领取金币与经验。</p>`:''}${orderCard(task,m.kind,m.kind==='side'?s.sideOrders.findIndex(v=>String(v.id)===String(m.id)):0)}`:'<p class="description">这张心愿已更新，请回合成台查看新的订单。</p>';
 }else if(m.type==='item'||m.type==='chain'){
  const c=m.c,l=m.l||1;title=m.type==='chain'?CHAINS[c].name:itemName(c,l);
  body=`<div class="item-detail">${picture(itemKey(c,l))}<div><h3>${itemName(c,l)} <span class="tag">${l} 级</span></h3><p>棋盘与仓库共持有 ${game.count(c,l)} 件<br>${l===6?'这是本条合成链的最高阶。':`两个相同的 ${l} 级物品 → 一个 ${l+1} 级物品。`}</p></div></div><p class="description">${CHAINS[c].desc}</p><div class="route">${CHAINS[c].items.map((name,i)=>`${i?'<span class="route-arrow">›</span>':''}<button class="route-step ${l===i+1?'current':''}" data-action="item" data-cat="${c}" data-level="${i+1}">${picture(itemKey(c,i+1))}<small>${i+1}</small><span>${name}</span></button>`).join('')}</div><div class="route-source">${picture('gen-'+c)}<div><b style="font-size:12px">来自 ${CHAINS[c].producer}</b><p>${game.unlocked(c)?'点击工作台，以 1 体力取出一件材料。':`完成前 ${CHAINS[c].unlock} 处布置后开启。`}</p></div>${btn('去看看','source','small',`data-cat="${c}"`)}</div><p class="note">合成表示把同类生活用品逐步整备升级，不是现实中的物理配方。订单只接收指定阶数，不自动折算高阶物品。</p>`;
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
  ].map(([key,name,desc])=>`<div class="setting-row"><div><h3>${name}</h3><p>${desc}</p></div><button class="toggle ${s.settings[key]?'on':''}" data-action="setting" data-key="${key}" role="switch" aria-checked="${s.settings[key]}" aria-label="${name}"><i></i></button></div>`).join('')}${environmentSettings()}<div class="section-title">保管好熊熊之家的回忆</div><p class="description">进度保存在当前浏览器，没有云账号。换设备或清理浏览器前，请先导出存档。${storageFailed?'<br><b>当前浏览器不允许保存，请务必导出。</b>':''}</p><div class="settings-grid">${btn(icon('download')+'导出存档','export','alt')}${btn(icon('upload')+'导入存档','import','alt')}${btn(icon('play')+'重看开场','replayIntro','alt')}${btn(icon('info')+'玩法说明','help','alt')}</div><div class="actions">${btn('重新开始这间小屋','resetAsk','danger')}</div><p class="note">单机 H5 v${VERSION} · 3 区域家园 · 6 章故事<br>本作品为布布一二主题单机游戏；商业发行需另行取得角色 IP 授权。<br>没有广告、内购、排行榜或数据上传。</p>`;
 }else if(m.type==='submitted'){
  title='这份小心愿，备好啦';const r=m.result;
  body=`${picture('yier-happy','reward-art')}<h3 class="celebration-title">现在，回家变一点点更好</h3><p class="description center">材料已经收进修缮包。<br>心愿星只用于当前这处布置，不会被小铺花掉。</p><div class="reward-tray"><span>${picture('util-star')}+1</span><span>${picture('util-coin')}+${r.coins}</span>${r.xp?`<span>XP +${r.xp}</span>`:''}</div>${btn('带心愿星回小屋','afterSubmit','wide')}`;
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
  const arrived=s.tea.firstVisit==='arrived';title=arrived?'熊熊之家，继续一起过':'熊熊之家，等你来坐坐';body=`${picture('party-memory','ending-party')}<div class="warm-text">${speechRow('yier','布布，我们真的把它变成家了。')}${speechRow('bubu','嗯。花园和庭院，也都是我们的家。')}</div><div class="stats-grid" style="margin-top:18px"><div class="stat"><strong>24</strong><span>个愿望变成真的</span></div><div class="stat"><strong>${s.stats.merge}</strong><span>次小小合成</span></div><div class="stat"><strong>${Object.keys(s.seen).length}</strong><span>件可爱收藏</span></div></div><p class="description center">${arrived?'六章故事已经收好。去花园照顾花草，回小屋准备点心，再与小栗一起喝茶，继续积累家园回忆。':'六章待客准备已经收好。点心和杯子都备齐了，去迎接受邀的小栗，再一起喝杯茶吧。'}</p>${arrived?'':btn('迎接小栗首访','firstVisit','wide alt')}${btn(arrived?'明天，也一起可爱':'把家园收好','endingDone','wide')}`;
 }else if(m.type==='confirmSell'){
  const t=s.board[m.index];if(!t||t.k!=='item'){closeModal();return;}title='这件物品，心愿里也需要';body=`${picture(itemKey(t.c,t.l),'hero-img')}<p class="description center">${itemName(t.c,t.l)} 正被当前订单需要。<br>出售可得到 ${mass(t)} 金币，但之后需要重新合成。</p><div class="actions">${btn('留给小心愿','closeModal','alt')}${btn('还是出售','confirmSell','danger',`data-index="${m.index}"`)}</div>`;
 }else if(m.type==='reset'){
  title='重新开始之前';body=`<p class="description">这会清空当前浏览器中这间小屋的进度和自动备份，包括章节、物品与金币。建议先导出一份存档。</p>${btn('先导出现在的存档','export','wide alt')}<div class="actions">${btn('保留小屋','closeModal','alt')}${btn('确认重新开始','resetConfirm','danger')}</div>`;
 }else if(m.type==='importConfirm'){
  title='要搬进这份存档吗？';body=`<p class="description">将载入一间已经完成 ${m.state.stage} / 24 处布置的小屋。当前进度会被替换，建议先导出。</p><div class="actions">${btn('取消','closeModal','alt')}${btn('确认载入','importConfirm')}</div>`;
 }else if(m.type==='growth'){
  const p=levelProgress(s),next=p.level<99?levelReward(p.level+1):null,upcoming=Math.min(95,Math.ceil((p.level+1)/5)*5),giftLevels=Array.from({length:Math.floor(p.level/5)},(_,i)=>(i+1)*5).filter(v=>v<=95);
  title='一点点，也算长大';body=`${picture('bubu-joy','hero-img')}<h3 class="center">成长等级 Lv.${p.level}</h3><p class="description center" style="margin-top:10px">交付订单与布置增加经验，合成负责准备材料。<br>${next?`下一次升级还需 ${p.required-p.current} 经验；奖励 ${next.coins} 金币和 ${next.energy} 体力。`:'已经达到最高99级，茶会与邻里委托仍可继续。'}<br>等级越高，所需经验越多，升级奖励随梯度增加。</p><div class="row"><div class="progress-track"><i style="width:${p.required?Math.min(100,p.current/p.required*100):100}%"></i></div><small class="muted">${p.required?`${p.current} / ${p.required}`:'已满级'}</small></div><div class="section-title">每5级，一份成长礼包</div>${giftLevels.map(level=>{const gift=levelGift(level,s.stage),claimed=s.levelGiftsClaimed.includes(level);return `<div class="level-gift"><div><h3>Lv.${level} 成长礼包</h3><p>${gift.coins} 金币 · ${gift.scissors} 把剪刀 · ${gift.items.length} 件合成材料</p></div>${btn(claimed?'已领取':'领取','claimLevelGift','small',`data-level="${level}" ${claimed?'disabled':''}`)}</div>`;}).join('')}${p.level<95?`<p class="description">下一份礼包：Lv.${upcoming}。交付订单、完成布置继续成长。</p>`:''}<p class="note">礼包每档只可领一次；材料放入待领礼物，不含体力。<br>升级奖励自动到账，体力最多存100点。</p>`;
 }else if(m.type==='help'){
  title='一起把日子合成家';body=`${[
   ['01 · 每件小东西都有来处','带闪电的是固定工作台。点击它，花 1 体力取出本条链的一阶或二阶物品；库存每 6 秒补 1 件。随小屋修缮，会有新的工作台解锁。'],
   ['02 · 点击或拖动合成','先点一件物品，再点同类同级物品即可合成；也可直接拖到同类同级物品上。拖到空格或其他物品上，会返回原位。尘封物品只接受同类同级合入，不能拖走；最高六级。'],
   ['03 · 先看看小心愿','订单只接收指定等级与数量。合好后交付，获得心愿星；回小屋选择配色并布置，才能推进下一项故事。邻里委托提供金币与经验，不跳过主线。'],
   ['04 · 桌子满了，也有办法','收进仓库、交付、出售都能腾空间。仓库物品可直接交付；待领礼物不会因满盘丢失。剪刀把二级以上物品拆成两个低一级物品，使用前需要一个额外空格。'],
   ['05 · 先核对，再整备','合成和出售无法撤回。物品超过订单所需等级时，可使用剪刀拆成两个低一级物品；剪刀来自日常奖励、成长礼包和小铺。'],
   ['06 · 一起慢慢积累','体力每100秒自然恢复1点，上限100；只有升级会额外增加少量体力，满额部分不溢出。每5级可领取一次成长礼包，礼包不含体力。金币用于升级工作台、扩展仓库和购买合成材料或剪刀。'],
   ['07 · 记得保管熊熊之家','这是单机游戏，只保存在当前浏览器。换设备前导出 JSON 存档，再到新设备导入。浏览器无痕模式和直接打开文件时的保存能力，取决于浏览器本身。'],
   ['08 · 自己摆放喜欢的家','在小屋、花园或庭院点击已布置家具，会显示“移动”按钮。按住按钮拖动，松手保存位置；可恢复原位。也可聚焦移动按钮，用方向键微调，位置随存档和照片保留。'],
   ['09 · 看看窗外的天气','家园会跟随本地时间改变晨昼暮夜，天气是游戏内模拟。在设置中可预览时段和天气，点“跟随时间”恢复自动，不影响订单与奖励。'],
   ['10 · 两只熊也有自己的小日常','布布和一二会散步、看看风景、在已摆好的家具旁歇一会儿，偶尔走到一起贴贴。“一起做”的小事直接展示结果图。移动家具、聊天和读剧情时会暂停；设置中的“减少动态”可让家园安静下来。']
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
 overlayRoot.innerHTML=`<section class="story-overlay" aria-label="剧情对话"><div class="story-scene">${homeScene(q.context?.stage??game.s.stage,{characters:false,mini:true,night:q.context?.night??ui.night,region:q.context?.region||game.s.world.region,historical:!!q.context?.replay})}</div><div class="story-header"><span class="eyebrow">${q.context?.replay?'回忆重温 · 原始摆放与区域 · 配色使用当前选择':game.s.stage===0?'PROLOGUE · 推开这扇门':`OUR LITTLE STORY · 第 ${Math.min(6,Math.ceil(game.s.stage/4))} 章`}</span><button class="story-skip" data-action="skipStory">跳过 ${icon('arrow')}</button></div><h2 class="story-title">${esc(line.title||'今天，又多了一点点可爱')}</h2><p class="story-aside">${esc(line.aside||'小小的事情，两个人一起做，就变得不一样。')}</p><div class="story-characters">${picture(left,`story-character ${who==='bubu'?'speaking':''}`)}${picture(right,`story-character ${who==='yier'?'speaking':''}`)}</div><div class="dialogue-box"><div class="dialogue-speech">${speakerPortrait(who)}<div><span class="speaker-name ${who}">${who==='bubu'?'布布':'一二'}</span><p class="dialogue-text">${esc(line.text)}</p></div></div><div class="dialogue-footer"><div class="story-dots">${q.lines.map((_,i)=>`<i class="${i===q.index?'active':''}"></i>`).join('')}</div>${btn(q.index===q.lines.length-1?(q.context?.intro?'一起开始吧':'收好这一刻'):'下一句','nextStory')}</div></div></section>`;
 sounds.play(who==='bubu'?'talk':'yier');
}
function finishStory(){const q=ui.story;if(!q)return;ui.story=null;overlayRoot.innerHTML='';syncInert();q.onFinish();}
function nextStory(){if(!ui.story)return;if(++ui.story.index>=ui.story.lines.length)finishStory();else renderStory();}
function playIntro(){ui.splash=false;showStory(INTRO,()=>{game.markIntro();persist();navigate(game.s.stage===0?'merge':'home');if(game.s.stage===0){highlight([8,9]);toast('从这两块相同的小方巾开始。',2800);}if(saveWarning)toast(saveWarning,5000);},{stage:0,region:'house',night:false,replay:game.s.stage>0,intro:true});}
function replayTask(id,onFinish=()=>{},replay=true){
 const t=TASKS[id];if(!t||id>=game.s.stage)return;showStory(t.after.map(([who,pose,text])=>({who,pose,text,title:t.name,aside:CHAPTERS[t.chapter].sub})),onFinish,{stage:id+1,region:DECOR[id].region,night:t.chapter===4,replay});
}
function afterBuild(r){
 ui.newDecor=r.stage;ui.homeMode='region';ui.night=game.s.stage>=16&&game.s.stage<20;ui.tab='home';ui.selected=null;render();main.scrollTop=0;sounds.play('place');burst(null,true);
 setTimeout(()=>{ui.newDecor=null;replayTask(r.stage,()=>{if(r.chapterDone)openModal({type:'memory',chapter:r.chapter,reward:true});else if(r.unlocked.length)toast(`新工作台开启：${r.unlocked.map(c=>CHAINS[c].producer).join('、')}`);else if(r.stage===0)toast('门垫铺好了！回合成台，试试点击带闪电的清洁篮。',3200);},false);},620);
}
function highlight(indices){ui.highlight=indices;clearTimeout(highlightTimer);render();highlightTimer=setTimeout(()=>{ui.highlight=[];if(ui.tab==='merge')render();},6000);}
function showHint(){const h=game.hint('main');if(h.kind==='lesson'){navigate('merge');const idx=CATS.indexOf(h.c);ui.selected=idx;highlight([idx]);toast(`亲手点一次${CHAINS[h.c].producer}，认识新来源。`);return;}if(h.kind==='build'){openBuildPlacement();return;}if(h.kind==='submit'){navigate('merge');toast(h.orderKind==='tea'?'茶会材料已经备齐，找到茶会卡片开始小聚。':h.orderKind==='side'?'邻里委托已经备齐，在对应卡片交付。':'上方小屋心愿已经备齐，可以交付啦。');return;}navigate('merge');if(h.kind==='merge'){highlight([h.from,h.to]);toast(`把发亮的两个${itemName(h.c,h.l)}合在一起。`);}else if(h.idx!==undefined){highlight([h.idx]);ui.selected=h.idx;render();toast(`点带闪电的${CHAINS[h.c].producer}，继续准备材料。`);}else toast(h.message||'看看订单里还需要哪些物品。');}
function chat(who){
 if(ui.tab!=='home')return;clearTimeout(chatTimer);$('.room-chat')?.remove();const lines=HOME_CHAT.filter(l=>l[0]===who);if(!lines.length)return;const [,pose,text]=lines[Math.floor(Math.random()*lines.length)];const scene=$('.home-view .home-scene');if(!scene)return;const el=document.createElement('div');el.className='room-chat';el.innerHTML=speechRow(who,text);scene.append(el);sounds.play(who==='yier'?'yier':'talk');chatTimer=setTimeout(()=>{el.remove();refreshLivingScene();},3500);
}
function playHomeActivity(r){
 clearTimeout(toastTimer);$('#toast').className='';
 openModal({type:'activityResult',result:r});
}
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
app.addEventListener('contextmenu',e=>{if(e.target.closest('[data-cell],[data-action="decorMoveHandle"]'))e.preventDefault();});
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
  case 'submit':run(game.submit(d.kind,d.kind==='main'?+d.id:d.id,d.kind==='main'?+d.step:undefined));break;
  case 'afterSubmit':closeModal();navigate('home');break;
  case 'goBuild':case 'build':openBuildPlacement();break;
  case 'worldMap':ui.homeMode='map';render();main.scrollTop=0;break;
  case 'visitRegion':{cancelFurnitureDrag();ui.decorSelected=null;const r=game.visitRegion(d.region);if(r.ok){persist();ui.homeMode='region';ui.tab='home';render();main.scrollTop=0;sounds.play('tap');}else run(r);break;}
  case 'homeActivity':run(game.homeActivity(d.region));break;
  case 'worldMemory':{const m=game.worldProgress().memories.find(v=>v.region===d.region);if(m?.unlocked)openModal({type:'activityResult',replay:true,result:{region:d.region,memoryName:m.name}});break;}
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
  case 'split':closeModal();run(game.split(ui.selected));break;
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
  case 'refreshSide':run(game.refreshSide(+d.slot));break;
  case 'growth':openModal({type:'growth'});break;
  case 'claimLevelGift':run(game.claimLevelGift(+d.level));break;
  case 'orderDetails':openModal({type:'orderDetails',kind:d.kind,id:d.id});break;
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
  case 'chat':{const rect=b.getBoundingClientRect(),left=e.clientX<rect.left+rect.width/2;chat(d.sceneLayer==='ambient-pair-moment'&&e.detail!==0?((left!==(d.sprite==='ambient-kiss'))?'bubu':'yier'):d.who);break;}
  case 'dayNight':ui.environmentPhase=homeEnvironment().night?'day':'night';render();break;
  case 'cycleTime':ui.environmentPhase=PHASES[(PHASES.indexOf(homeEnvironment().phase)+1)%PHASES.length];render();break;
  case 'cycleWeather':ui.environmentWeather=WEATHERS[(WEATHERS.indexOf(homeEnvironment().weather)+1)%WEATHERS.length];render();break;
  case 'environmentAuto':ui.environmentPhase=null;ui.environmentWeather=null;render();break;
  case 'photo':await capturePhoto();break;
  case 'export':try{downloadBlob(new Blob([game.export()],{type:'application/json'}),`熊熊之家_存档_${new Date().toISOString().slice(0,10)}.json`);toast('已请求下载存档。请确认下载列表中的 JSON 文件并收好。');}catch(err){toast('存档下载未成功，请检查浏览器下载权限：'+err.message,5000);}break;
  case 'import':$('#import-file').click();break;
  case 'importConfirm':{const state=ui.modal.state;game=new GameEngine(state);closeModal();ui.selected=null;ui.highlight=[];ui.tab=game.s.stage===0?'merge':'home';ui.night=game.s.stage>=16&&game.s.stage<20;persist();render();sounds.syncMusic();toast('存档已搬进熊熊之家，继续一起生活吧。');break;}
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
 if(e.key==='Escape'){cancelFurnitureDrag();if(ui.decorSelected!==null){ui.decorSelected=null;render();}if(ui.story)finishStory();else closeModal();cancelDrag();return;}
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
setInterval(()=>refreshLivingScene(),200);
// Resource ticks do not recreate the board during a drag.
setInterval(()=>{
 if(document.hidden)return;const day=game.s.daily.day;game.tick();
 const e=$('#energy-count');if(e)e.textContent=game.s.energy;
 $$('[data-stock]').forEach(el=>{const p=game.s.producers[el.dataset.stock];el.textContent=`${p.stock}/${stockCap(p)}`;});
 if(day!==game.s.daily.day&&!drag&&!furnitureDrag){render();persist();}
},1000);
setInterval(persist,15000);
document.addEventListener('visibilitychange',()=>{cancelDrag();cancelFurnitureDrag();if(document.hidden){ui.scenePlayer?.pause();game.tick();persist();}else{game.tick();render();ui.scenePlayer?.resume();}sounds.syncMusic();});
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
 if(new URLSearchParams(location.search).has('qa'))window.__COZY_QA__={get game(){return game;},render,navigate,openModal,closeModal,ui,validateState,capturePhoto,livingScene,refreshLivingScene,playEvent,describeScene,drawSceneCanvas,renderSceneHTML,createScenePlayer};
 if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)&&!window.__OFFLINE_SINGLE__)navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
}
boot().catch(err=>{const loading=$('#loading-text');if(loading)loading.textContent=TITLE+'启动遇到问题：'+err.message;console.error(err);});

})();