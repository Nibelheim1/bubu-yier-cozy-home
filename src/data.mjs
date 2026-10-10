/** All story, progression, art coordinates, and economy data. No UI state here. */
export const VERSION = '1.6.3';
// App releases and storage migrations have different lifetimes.
export const APP_VERSION = VERSION;
export const SCHEMA_VERSION = 2;
export const TITLE = '熊熊之家';
export const CATS = ['clean','tools','bake','tea','craft','garden'];
export const CHAINS = {
  clean:{name:'把家擦亮',producer:'清洁篮',unlock:0,color:'#c6d7ba',items:['小方巾','软海绵','清洁喷雾','小刷子','轻巧拖把','清洁推车'],desc:'从手边的小方巾，到能照顾整间屋子的清洁工具。'},
  tools:{name:'修修补补',producer:'修理箱',unlock:2,color:'#e8b5a6',items:['小螺丝','螺丝刀','小木锤','手锯','电钻','全套工具箱'],desc:'布布的拿手事：松掉的地方，慢慢修好。'},
  bake:{name:'甜甜一口',producer:'小烤箱',unlock:4,color:'#ecd2a4',items:['面粉袋','软面团','暖面包','草莓纸杯糕','双层小蛋糕','三层点心塔'],desc:'备料、揉面、烘焙，把今天的快乐分成几份。'},
  tea:{name:'一起喝杯茶',producer:'泡茶台',unlock:6,color:'#c1d7d0',items:['茶叶罐','花纹瓷杯','一杯花草茶','圆肚茶壶','双人茶盘','茶点推车'],desc:'杯子要两只；忙的时候也记得坐一会儿。'},
  craft:{name:'画点小心思',producer:'画画箱',unlock:8,color:'#e2c0b7',items:['铅笔','蜡笔盒','调色盘','小风景画','纸鲸风铃','绘画工作台'],desc:'一二的想象，从一根铅笔开始长大。'},
  garden:{name:'花园会开花',producer:'园艺篮',unlock:12,color:'#c7d7af',items:['种子包','小幼苗','绿叶盆栽','雏菊盆栽','郁金香花束','双层花架'],desc:'照顾一颗种子，也照顾慢慢长出来的期待。'},
};
export const CFG={boardSize:49,cols:7,maxLevel:6,maxPlayerLevel:99,economyVersion:1,energyCap:100,energyEvery:100000,stockEvery:6000,stockBase:18,stockPerLevel:6,storageBase:8,storageMax:24,upgradeCosts:[140,400],scissorCost:45,parcelCost:65,sideCooldown:15000,chapterCoins:60,dailyGiftCoins:40,buildXP:15,levelGiftEvery:5,legacyPackCoins:20};
export const CHAPTERS = [
 {name:'先把门打开',short:'迎着光',sub:'一束阳光，两双脚印。',memory:'门垫是软的',text:'门垫铺好的时候，一二特意踩了两下。布布没有催她进屋，只把第二双拖鞋放在旁边。',pose:['bubu-idle','yier-joy']},
 {name:'热乎乎的下午',short:'甜一口',sub:'面包刚好，茶也刚好。',memory:'留给你的那一口',text:'布布说只尝一小口。纸杯糕少了半边。一二瞪了他一会儿，把自己那半边也往中间推了推。',pose:['bubu-sit','yier-happy']},
 {name:'给想象留个角',short:'画晴天',sub:'画歪一点，也很可爱。',memory:'会飞的纸鲸',text:'纸鲸不会游泳，却能在花园里飞。风来的时候，布布伸手扶了一下线；一二说，让它自己试试嘛。',pose:['bubu-turn','yier-paint']},
 {name:'花园会开花',short:'等花开',sub:'慢一点的事，一起等。',memory:'今天也长高了一点',text:'一二每天量小苗的身高，布布每天悄悄把尺子扶正。花开那天，两只都说，早就知道你能行。',pose:['bubu-joy','yier-turn']},
 {name:'不赶时间的晚上',short:'慢慢读',sub:'灯暖着，故事慢慢讲。',memory:'没有收完的今天',text:'相册没有排整齐，茶杯也还没洗。一二已经靠着软垫睡着了。布布把灯调暗：留一点明天再做。',pose:['bubu-sit','yier-rest']},
 {name:'今天请你来坐坐',short:'来做客',sub:'原来，好日子可以分给别人。',memory:'给朋友留一个位置',text:'邀请信送出去了，花架、画台和蛋糕也备好了。一二又检查了一遍杯子，布布把茶壶端稳：等小栗来了，就请她坐在我们旁边。',pose:['bubu-joy','yier-joy']},
];
export const INTRO = [
 {who:'yier',pose:'turn',title:'一间旧屋，两个小小的愿望',text:'臭布布，你看！窗边这一块，晒太阳一定很舒服。',aside:'午后，巷子尽头。旧屋的门被轻轻推开。'},
 {who:'bubu',pose:'idle',title:'先不急着变得很厉害',text:'嗯……就是门口有一点灰。我先擦擦，一二宝别把脚弄脏了。',aside:'旧家具和纸箱还在。布布从里面翻出了一条小方巾。'},
 {who:'yier',pose:'joy',title:'把喜欢的日子装进来',text:'这里喝茶，那里画画！等花开了，还可以请大家来坐坐。',aside:'一二说得很快，布布一件一件记下来。'},
 {who:'bubu',pose:'happy',title:'那就，从这一小块开始',text:'好。我们慢慢来，把小小的愿望，一个一个变成真的。',aside:'先把两块相同的小方巾合在一起吧。'},
];
const R=(c,l,n=1)=>({c,l,n});
// Stage = number of completed renovations. Every source is unlocked before its first requirement.
export const TASKS = [
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
export const REGIONS = [
 {id:'house',name:'暖暖小屋',subtitle:'烤面包、喝茶，给故事留一个角落',unlock:0,background:'region-house',activityLabel:'一起喝杯茶',activityText:'布布把茶吹凉，一二摆好两只杯子。忙完的两只熊，一起歇一会儿。',coins:8,memoryName:'一起喝茶的下午'},
 {id:'garden',name:'晴天小花园',subtitle:'花圃、纸鲸和慢慢长大的期待',unlock:0,background:'region-garden',activityLabel:'给花浇浇水',activityText:'一二扶住小苗，布布慢慢浇水。今天的叶子又精神了一点。',coins:8,memoryName:'看见新叶的一天'},
 {id:'courtyard',name:'门前小庭院',subtitle:'摆好点心，让好日子可以分给别人',unlock:0,background:'region-courtyard',activityLabel:'准备来客茶点',activityText:'两只熊一起擦好桌子，摆好干净杯子，等朋友来坐坐。',coins:8,memoryName:'给朋友留一个位置'},
];
export const DECOR = [
 ['courtyard',53,47,22,1],['house',49,27,39,1],['courtyard',20,37,18,3],['courtyard',81,29,13,3],
 ['house',83,47,24,3],['house',74,73,30,6],['house',74,67,15,7],['house',26,67,21,6],
 ['house',18,45,22,4],['house',22,64,29,0],['garden',52,23,20,3],['house',78,23,23,1],
 ['garden',22,57,17,5],['garden',33,43,30,3],['garden',80,50,28,3],['garden',74,26,19,2],
 ['house',82,86,24,8],['house',28,85,26,8],['house',48,82,18,7],['house',73,86,18,9],
 ['courtyard',50,18,67,4],['courtyard',23,77,36,0],['courtyard',74,78,29,8],['garden',22,82,28,8],
].map(([region,x,y,w,z],i)=>({region,x,y,w,z,id:i}));
export const DAILY = [
 {key:'merge',title:'合一合，松口气',target:15,coins:30,desc:'完成 15 次合成'},
 {key:'order',title:'把小心愿送出去',target:3,coins:45,desc:'完成 3 张主线、邻里或茶会订单'},
 {key:'produce',title:'今天也有新点子',target:25,coins:35,desc:'从工作台取出 25 件物品'},
];
export const SIDE_FLAVOR = [
 ['巷口留言','把小东西准备好，生活就方便一点。'],['邻里的约定','不用赶，准备好了再送来就好。'],['邻里小纸条','今天也想分享一点小小的心意。'],['窗边的请求','给平常的一天，添一点心意。'],['下一次的准备','东西不用很多，合适就好。'],
];
export const HOME_CHAT = [
 ['yier','joy','臭布布，这里我想再收拾一下。就一点点。'],['bubu','happy','一二宝，忙完记得歇一会儿。我陪着你。'],['yier','shy','这里的东西，怎么每一件都有我们的故事呀。'],['bubu','turn','今天不用把所有事情都做完。我们还会有明天。'],['yier','happy','小屋又变可爱一点点啦！'],['bubu','sit','你看看风，我陪你歇一会儿。各自都有很重要的工作。'],
];
export const MEMORY_GATES={house:7,garden:13,courtyard:23};
export const TEA_CONDITIONS=[
 {id:'sunny',name:'晴日来坐坐',souvenir:'coaster',souvenirName:'两熊选的杯垫',souvenirRegion:'house',needs:{warm:[R('tea',3),R('bake',3)],garden:[R('tea',2),R('garden',3),R('craft',2)]}},
 {id:'memory',name:'想留一份纪念',souvenir:'card',souvenirName:'手绘小卡',souvenirRegion:'courtyard',needs:{warm:[R('tea',3),R('bake',2),R('craft',2)],garden:[R('tea',2),R('garden',2),R('craft',3)]}},
 {id:'wind',name:'今天有点风',souvenir:'chime',souvenirName:'小风铃',souvenirRegion:'garden',needs:{warm:[R('tea',3),R('bake',2),R('tools',2)],garden:[R('tea',2),R('garden',2),R('craft',2),R('tools',2)]}},
];
export const TEA_PLANS={warm:{name:'暖心茶点',region:'house',wish:'备齐这一场的茶点材料，一二摆杯，布布端茶，再一起坐到小圆桌旁。'},garden:{name:'花园小聚',region:'garden',wish:'备齐这一场的花园茶会材料，在树荫下铺好临时茶布，再一起喝茶。'}};
export const SOUVENIRS=TEA_CONDITIONS.flatMap(c=>Object.keys(TEA_PLANS).map(plan=>({key:`${c.souvenir}-${plan}`,condition:c.id,plan,name:`${c.souvenirName} · ${TEA_PLANS[plan].name}`,region:c.souvenirRegion,type:c.souvenir})));
export function teaResponse(plan,condition,hasGuest=false){
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
export function itemName(c,l){return CHAINS[c]?.items[l-1]??'未知物品';}
export function itemKey(c,l){return `${c}-${l}`;}
export function mass(t){return t?.k==='item'?2**(t.l-1):0;}
export function needMass(needs){return needs.reduce((n,r)=>n+2**(r.l-1)*r.n,0);}

// Delivery experience scales with the quantity of base materials committed.
export function orderXP(needs){return 10+Math.floor(needMass(needs)/3);}
