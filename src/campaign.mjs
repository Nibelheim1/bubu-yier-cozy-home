/** Post-renovation stories and repeatable requests. No state or engine dependencies. */
import {CATS,CHAINS,needMass,orderXP} from './data.mjs';

export const CAMPAIGN_CHAPTERS=[
 {name:'山雨来前',short:'等雨来',sub:'把风雨来前的小事，一件件照顾好。',memory:'雨落下来以前',text:'最后一片落叶捡起来时，第一滴雨刚好落在布布鼻尖。一二拿着记录纸笑了：我们没有赶赢所有事情，不过该照顾的地方，都照顾到了。',region:'courtyard',pose:['bubu-turn','yier-happy']},
 {name:'邻里第一次分享',short:'分一半',sub:'一份便当，一封回信，送到巷口的心意。',memory:'带回家的空饭盒',text:'送出去的便当盒又回来了，里面夹着一张谢谢的小纸条。一二认真把它展平。布布说，原来空饭盒也能装着满满的东西。',region:'courtyard',pose:['bubu-happy','yier-turn']},
 {name:'萤火虫夏夜',short:'看微光',sub:'晚风慢下来，小小的光自由亮着。',memory:'没有带走的星星',text:'两只熊坐在花园边，直到最后一点微光飞进草丛。一二的画纸上留下几颗小黄点。布布没有伸手去抓，他们把那一晚记住，就已经足够。',region:'garden',pose:['bubu-sit','yier-joy']},
 {name:'秋日小集',short:'晒秋天',sub:'把花香、点心和手绘的小秋天，摆给大家看看。',memory:'一片叶子的颜色',text:'小集收好后，一二发现纸上落了一片金黄的叶子。布布替她压平纸角，没有拿走那片叶子。今天的秋天，就这样多坐了一会儿。',region:'courtyard',pose:['bubu-turn','yier-paint']},
 {name:'雨天互助',short:'递点暖',sub:'修好松动的地方，把暖意送到雨里。',memory:'伞下的一小段路',text:'最后一份热茶送到门口，布布的耳朵已经沾满细雨。一二拿来干毛巾，先擦他的耳尖。帮别人把一天过好，也记得把身边这只照顾好。',region:'house',pose:['bubu-happy','yier-happy']},
 {name:'冬日留暖',short:'留盏灯',sub:'备好小屋的暖，给长长的夜留一页书。',memory:'翻到同一页的夜晚',text:'一二读到一半停了下来，布布却接上下一句。原来他没有睡着，只是在旁边默默听着。窗外很冷，屋里这页故事，还可以慢慢讲。',region:'house',pose:['bubu-sit','yier-rest']},
 {name:'春日接力',short:'传新绿',sub:'把养大的小苗，交给下一双愿意等待的手。',memory:'送走的那盆新绿',text:'小苗被送走后，花园空了一小块。一二起初有些舍不得，后来把新的种子放进那一格。布布陪她蹲下来：它在别处继续长，我们也一样。',region:'garden',pose:['bubu-joy','yier-turn']},
 {name:'一周年筹备',short:'记一年',sub:'请帖、点心、旧照片，一起整理这一年的日子。',memory:'还没写满的一周年',text:'一二在记录最后写了一个小小的“还会继续”。布布本来想补上日期，看见那行字，又把笔放下。他们把这一年收好，也给往后留着空白。',region:'courtyard',pose:['bubu-happy','yier-joy']},
 {name:'四季的好日子',short:'常回来',sub:'回访、谢礼和四季回忆，把好日子继续过下去。',memory:'家里一直有你的位置',text:'四季的记录叠在一起，厚得快要合不上。一二把书往布布那边推了一点。他替她扶住书脊：慢慢看吧。下一页，我们明天一起写。',region:'house',pose:['bubu-sit','yier-happy']},
];

// Every row contains its own story rather than a numbered copy of a generic order.
// [title, wish, region, three material chains, Bubu's response, Yier's response]
const campaignStories=[
 [
  ['听一听松动的门边','风一吹门边就响。检查接缝、擦净灰尘，再画下需要留意的地方。','courtyard',['tools','clean','craft'],'响的地方已经找到了，修完还要再试一次。','我把位置画好了，下次听见声音就能认出来。'],
  ['沿着小路捡落叶','落叶堵在花园边了。整理小路，照顾被压住的花，再备茶歇一歇。','garden',['clean','garden','tea'],'水能顺着边缘流走了，小路也不滑了。','这片叶子像小船，还是让它待在干燥的地方吧。'],
  ['把易潮的纸收好','画纸不能挨着潮气。整理画角、擦干纸箱边，再把盖子固定稳。','house',['craft','clean','tools'],'盖子合上了，但没有压到你的画。','有一张还没画完。雨天再接着画，刚刚好。'],
  ['给花盆留出水路','雨大的时候，花盆要能透气。清理盆底、支稳盆沿，再检查枝叶。','garden',['garden','tools','clean'],'盆底没有被泥堵住，支撑也稳了。','那它们就安心喝雨水，我只在旁边看看。'],
  ['试一遍雨夜照明','把灯座和窗边再检查一次，画好夜间的小路线，留下一壶温茶。','house',['tools','craft','tea'],'从门口到屋里都能看清楚，没有晃眼的地方。','你的脚印在图上画得特别大，肯定不会走错。'],
  ['准备雨天的早餐','提前备好烘焙材料、洗净用具，顺便给花园的小盆盖好防雨布。','house',['bake','clean','garden'],'明早不用冒雨出门，面包的准备都在这里。','我也给小盆留了透气的一边，不会闷住它。'],
  ['风里送来的提醒','写一份小屋检查清单，收好修理用具，再给门前留一份暖点心。','courtyard',['craft','tools','bake'],'这张清单不用写得很厉害，能看懂就行。','我还画了你的大鼻子，表示检查的人是你。'],
  ['第一阵雨落下来','把最后的积灰擦掉，安顿好花草，备齐热茶；剩下的就听雨吧。','house',['clean','garden','tea'],'关门前我又看了一遍，花盆都稳稳的。','好了，这回你的工作是陪我听雨。'],
 ],
 [
  ['巷口便当的第一炉','想把便当送出去，先试好点心的份量、洗净盒子，再画一张配料纸。','house',['bake','clean','craft'],'试吃这份我会认真分，不会一口就吃完。','你说的时候，已经把最香那块拿起来了。'],
  ['挑一束不拥挤的花','剪理能分享的枝叶，备一壶淡茶，把花束扎稳，让它路上不散。','garden',['garden','tea','tools'],'绑得稳，也给叶子留出了空隙。','拿在手里不会挡路，花也能一路看风景。'],
  ['在饭盒上画小太阳','继续备点心、洗净盛放用具，再画上两只熊的小标记。','house',['bake','clean','craft'],'看到太阳就知道是这一份，不会装错。','你画的太阳有耳朵，那分明是一只熊呀。'],
  ['在巷口留一份茶','把茶和点心分装好，临时托盘支稳，送到门前方便领取的地方。','courtyard',['tea','bake','tools'],'托盘不晃了，杯子也没有贴到边上。','热的那份写了提醒，拿的时候就不会着急。'],
  ['读一读盒底的回信','擦净回来的盒子，把小纸条展平，泡茶慢慢读；不急着立刻回。','house',['clean','craft','tea'],'字很小，不过每一句我都看清楚了。','原来我们觉得普通的面包，也让人开心呀。'],
  ['把感谢画成一张卡','画一张回卡，照顾一盆适合赠送的绿叶，再准备附上的小点心。','garden',['craft','garden','bake'],'这盆叶子长好了，可以放心交给别人。','卡上写了浇水的办法，他们也能慢慢照顾。'],
  ['再备一次分享的便当','这次把份量分得更清楚，备好点心与花茶，把盛放用具一一擦净。','house',['bake','tea','clean'],'给你的那一份也留在这里，没有全送出去。','那我也把你喜欢的那块，留在家里的盒子。'],
  ['空饭盒也有故事','整理所有回来的盒子，修好松掉的扣子，记录这一次送出去的心意。','courtyard',['clean','tools','craft'],'盒子又能用啦，下次还可以继续装。','这次的回信我记下了，空盒子也不空呢。'],
 ],
 [
  ['把午后的热慢慢散掉','擦净通风的窗边，检查窗扣，再备些淡茶，等屋里的热退下去。','house',['clean','tools','tea'],'窗扣固定好了，风能进来，也不乱拍窗。','喝完这杯，我们再去看看花园有没有凉一点。'],
  ['给小花园补一口水','傍晚再照顾花草，备好干净园艺用具，画下今天需要少量浇水的位置。','garden',['garden','clean','craft'],'土还是湿的，这几盆今天不用再多浇。','我画了小小的水滴，明天还能照着检查。'],
  ['留一份不太甜的晚点','做些轻轻的小点心，备好凉下来的花茶，把桌边收拾清爽。','house',['bake','tea','clean'],'这次点心小一点，夜里也能慢慢吃。','我给你留了两块，可别说是同一小口。'],
  ['把观萤的位置让出来','整理花园边缘的小路，修稳临时垫板，照顾草边的花；草丛里面不走。','garden',['clean','tools','garden'],'坐在这里就看得到，不用踩进草里。','也不用开亮灯，我们等它们自己亮起来。'],
  ['画一张安静的约定','画好不追、不抓的小提醒，备茶与分享点心，晚上轻轻说话就好。','courtyard',['craft','tea','bake'],'瓶子不用带。想记住的话，我们画下来。','画上小黄点，它们还是自由飞着的。'],
  ['把夜风写进画纸','备好画画用具，照顾边上的花草，再把晚茶送到阴凉处。','garden',['craft','garden','tea'],'风把纸角吹起来了，我给你轻轻扶住。','我画得慢一点，它们会一亮一亮地经过。'],
  ['收好看夜色的点心','把晚点做好并收整干净，检查观赏位置的垫板，留出回家的路。','courtyard',['bake','clean','tools'],'回屋的小路没有东西挡着，走慢点就行。','点心盒空了，微光却还在，我们再坐一会儿。'],
  ['只带回今晚的记忆','照顾好花园，收起纸笔，备一壶回屋的茶；让草丛恢复原来的安静。','garden',['garden','craft','tea'],'我们把东西都带走了，草边还是原来的样子。','只带走画上的星星，真的那些留在这里。'],
 ],
 [
  ['量一量秋日小集的位置','擦净门前空地，检查临时摆放的支撑，画下不挡通道的位置。','courtyard',['clean','tools','craft'],'中间这一条留出来，送东西也好走。','我在图上画了脚印，谁都能看懂怎么绕。'],
  ['为收成挑一张说明卡','整理可以分享的花叶，画清楚照顾办法，再备一壶开场的茶。','garden',['garden','craft','tea'],'不是每盆都能送出去，这几盆状态正好。','说明卡写了别急着浇水，也要先摸摸土。'],
  ['试烤一盘秋天的点心','把点心试好，洗净盛盘用具，备茶试试搭配，不用一味做得更甜。','house',['bake','clean','tea'],'这杯茶淡一点，刚好能尝出点心的味道。','那就照这个做，秋天也不用全是糖。'],
  ['把落叶画成小地图','挑好画纸，擦净干燥的落叶，再检查压纸的临时夹子。','courtyard',['craft','clean','tools'],'夹子很牢，但没有把叶子夹碎。','每片的颜色都不一样，小地图就会长这样。'],
  ['给小集留一处停脚的花','安顿好分享花草，修稳临时支撑，备茶让忙完的两只先歇一会儿。','garden',['garden','tools','tea'],'支撑只是今天借用，收场时一起拿走。','花在旁边就很好看，不用搭得特别高。'],
  ['烤够一场分享的份量','分批备好点心，画上口味标记，把每一只盘子擦净后再装。','house',['bake','craft','clean'],'我数好了份量，这回不会只顾着试吃。','你认真数点心的样子，也应该画下来。'],
  ['让门前飘起淡淡茶香','把茶、花和最后一盘点心分好，给这场小集留出从容的时间。','courtyard',['tea','garden','bake'],'热茶在这边，花草在旁边，不会弄湿点心。','忙完我们也坐一会儿，别只负责把快乐送走。'],
  ['秋日小集慢慢收场','把借用的用具整理检修，擦净空地，再留下今天的一张手绘记录。','courtyard',['clean','tools','craft'],'门前又空出来了，看着还像原来的小路。','画里多了好多小东西，今天真的很热闹。'],
 ],
 [
  ['雨声里听见小响动','检查窗边松动处，擦净滴下的雨水，备些热茶陪着慢慢找。','house',['tools','clean','tea'],'是这个扣子在响，修好后就不用担心了。','雨声还在，屋里的那一点紧张没有了。'],
  ['把送暖的路记下来','画好门前避水路线，清理路边落叶，照顾被雨压住的枝叶。','courtyard',['craft','clean','garden'],'绕开积水也不会踩到花，这条路可以走。','我把转弯画大了，雨里看起来也清楚。'],
  ['分一炉不会散的热面包','分批准备面包，固定好携带用的盒扣，把用具擦干再装。','house',['bake','tools','clean'],'盒扣松不开了，面包到门前还是完整的。','那一份留得厚一点，拿回去可以分着吃。'],
  ['给雨里的绿叶扶一扶','修好临时支撑、安顿倒伏枝叶，再画下雨停后需要回看的地方。','garden',['tools','garden','craft'],'只是扶住，没有绑紧，它还能自己长。','雨停后再来看看，不用现在就要求它站直。'],
  ['门口接一杯暖茶','准备温茶和软点心，收好门前用具，让接东西的时候少淋一点雨。','courtyard',['tea','bake','clean'],'杯子没装太满，走这段路不容易洒。','我把干的那一边留好了，先放下再拿。'],
  ['补一张看得清的提示','修稳临时提示牌、画大提醒的字，再给旁边的花叶腾出位置。','courtyard',['tools','craft','garden'],'牌子稳了，路口也没有被它挡住。','字画大以后，从屋门这里也能读清楚啦。'],
  ['再送一批雨天小份餐','继续分批做点心、备热茶，洗净回来的盒子，准备下一次递送。','house',['bake','tea','clean'],'干净盒子回来了，我们还能继续装下一份。','这一批我也数过了，你自己的别忘了拿。'],
  ['把帮忙的人也照顾好','收好修理用具，擦干潮湿角落，泡一壶只留给我们的茶。','house',['tools','clean','tea'],'最后的工具也擦干了，今天可以先到这里。','过来，先擦耳朵。你也不是不会被淋湿的。'],
 ],
 [
  ['检查冬天的门缝','找出进冷风的接缝、擦净边角，画一张修补清单，不漏掉小地方。','house',['tools','clean','craft'],'手边没有冷风了，门也还是能轻轻打开。','我把完成的地方画上圆圈，剩下的慢慢来。'],
  ['给花园安排过冬的角落','整理怕冷的花草，修稳临时挡风支撑，清理贴着叶子的湿落叶。','garden',['garden','tools','clean'],'挡风的边上留了空隙，叶子不会一直闷着。','天气暖一点，我再来陪它们晒一会儿太阳。'],
  ['留一炉清晨能闻到的香','分批备好暖面包，准备早晨的花茶，把盛放用具收得干净。','house',['bake','tea','clean'],'明早醒来不用急，先坐下吃热乎的。','那我今天就先期待一点明天的味道。'],
  ['写好夜读的那几页','把读过的故事画成小记，检查灯座，再准备不会太满的晚茶。','house',['craft','tools','tea'],'灯稳稳的，这一页也看得清楚。','你上次偷偷听到了哪里？我就从那里读起。'],
  ['备一份冬日门前小礼','准备分享的点心，附上一张手绘问候，挑好状态稳当的小绿叶。','courtyard',['bake','craft','garden'],'小绿叶放在挡风的一边，不会冻着。','小卡没有写很多，暖暖的心意刚好放得下。'],
  ['把积着的零碎慢慢收好','整理屋内用具、检修松掉的小扣子，备茶陪着把角落一一收完。','house',['clean','tools','tea'],'以前想着以后再收的，都回到原来的地方了。','还有你坐着的位置，也给你留好了。'],
  ['冬夜也给花园一份照顾','备好园艺用具，擦净花盆边缘，把这段冬日的变化画在记录里。','garden',['garden','clean','craft'],'叶子没有像夏天那样长快，不过它还很好。','我会把慢慢长也画下来，冬天不用着急。'],
  ['长长的夜读到同一页','备齐一晚的淡茶和点心，把共同读过的故事重新画成记录。','house',['tea','bake','craft'],'你刚才停下那句，我记得后面还有一句。','原来你真的在听，那我们再读一小段。'],
 ],
 [
  ['找一找春天的新芽','整理冬后花草，清理压着新芽的落叶，画下最先醒来的那一小片。','garden',['garden','clean','craft'],'这里有新叶了，比昨天多展开了一点。','我画得特别小，因为它现在就是这么小。'],
  ['修整育苗的临时支撑','把园艺材料备齐，检查支撑用具，再清洁准备接住新苗的容器。','garden',['garden','tools','clean'],'容器干净了，也能稳稳放住，不会挤到根。','第一盆留在家里，后面的再慢慢分出去。'],
  ['画一份能照着做的养护卡','照顾待分享的小苗，画清楚光照与浇水提示，再备茶核对一次。','house',['garden','craft','tea'],'别只写天天浇水，先看看土才对。','嗯，我画了摸摸土的手，照着就能明白。'],
  ['给幼苗准备稳当的旅程','修稳携带用的临时托架，安顿好小苗，把边缘清理得不扎手。','courtyard',['tools','garden','clean'],'托架很轻，放下时盆底也不会晃。','叶子不碰到边上，出门也像在家里一样稳。'],
  ['送苗前留一口小点心','备好分享点心与淡茶，给送出的每盆小苗补上一张手绘小卡。','house',['bake','tea','craft'],'小卡贴在旁边了，不会挡住叶子。','点心也装好了，照顾小苗的人别忘了自己。'],
  ['把空出的那格留给种子','整理花园空位、检修手边园艺用具，再记下重新播种的日期。','garden',['garden','tools','craft'],'空出来这一格不用立刻填满，先把土理好。','我想再等一颗种子。这回也不催它。'],
  ['回信里的叶子长高了','画下回信里的新叶，备好下一批待分享小苗，清理准备好的容器。','house',['craft','garden','clean'],'它换了地方，还真的继续长起来了。','我有一点舍不得，不过现在更开心了。'],
  ['让下一盆新绿也出发','备齐花草与路上的小点心，泡茶核对养护清单，再送下一盆出去。','courtyard',['garden','bake','tea'],'这一盆的养护办法也记清了，放心交出去。','等它长高的回信吧，我们在家继续种。'],
 ],
 [
  ['翻出刚来小屋那张画','整理一年前的画纸，擦净保存用具，备茶一起看看最初的小屋。','house',['craft','clean','tea'],'那时候门边还有灰，你倒把阳光画满了。','因为我那时候就想好，要在这里晒太阳。'],
  ['把邀请写得清清楚楚','画好一周年的小邀请，检查盛放纸张的盒扣，备些递送时的点心。','courtyard',['craft','tools','bake'],'时间和地点都写全了，这张不会让人猜。','最后那句是我写的：来坐一会儿就好。'],
  ['给周年点心试三种份量','分批准备点心，备好试配的花茶，把每一批用具清洁后再开始。','house',['bake','tea','clean'],'小份也能吃到每一种，不用一盘堆得太高。','我们慢慢做，够分享，也够自己尝。'],
  ['把这一年的花画下来','照顾花园的花草、画出四季变化，再检查记录纸的临时夹子。','garden',['garden','craft','tools'],'这朵去年还没有开，你连空花盆也记住了。','空花盆也很重要，那时我们在等它呀。'],
  ['给来坐坐留出顺路的位置','清理门前通道，修稳临时托盘，备好开场的茶；不添新家具也够坐。','courtyard',['clean','tools','tea'],'借用原来的位置就很好，通道还是宽的。','这样大家来坐坐，我们也不用忙着大搬家。'],
  ['画一张两只熊的年表','整理手绘记录，给分享的小花补上说明，再备一批周年点心。','house',['craft','garden','bake'],'有些日期记不清楚，事情却都记得。','那就画在一起，这一年本来就不是考试。'],
  ['分批把周年茶点准备齐','慢慢备齐点心、花茶与分享花草，每一批完成都先收好再做下一批。','courtyard',['bake','tea','garden'],'前面那批已经备好，不用一直拿在手里。','剩下的明天再做也行，邀请上没写要累坏。'],
  ['给一周年留下继续两个字','擦净记录纸边缘，检修保存的夹子，再画完这一次聚会的小记。','house',['clean','tools','craft'],'你最后这句话，不加句号也可以。','因为我们还会继续呀，下一页先空着。'],
 ],
 [
  ['春日的回信再读一次','照顾花园的绿叶、整理春天的回信，备茶看看那些送走的小苗。','garden',['garden','craft','tea'],'送出去的那盆已经有新叶，像当初这里一样。','回信就放进这一页，春天还有后来的故事。'],
  ['夏夜的画还亮着','整理观萤的手绘记录，擦净夏夜用过的托盘，备一点不太甜的点心。','house',['craft','clean','bake'],'画上没有捉来的萤火虫，只有我们坐过的夜。','那些小黄点还是很好看，我一下就想起来了。'],
  ['秋日的小集回访','准备回访用的花茶，修稳携带托盘，整理适合分享的秋色花草。','courtyard',['tea','tools','garden'],'托盘修好了，这回也能稳稳送到门前。','不需要再摆一场小集，去问问近况就很好。'],
  ['冬天的暖意再分一点','分批备点心、清洁盛放用具，画一张问候，把冬日心意续下去。','house',['bake','clean','craft'],'问候和点心都装好了，不用等到节日才送。','对呀，普通的一天也可以想起别人。'],
  ['谢谢一直稳稳的小屋','把用了一年的地方逐项检修，清理角落，再备茶谢过这一段日子。','house',['tools','clean','tea'],'没有新装什么，不过住着更放心了。','它替我们挡风雨，我们也把它照顾好。'],
  ['给花园的四季写封信','照顾花草，把每个季节画成一页，再准备一起读信时的小点心。','garden',['garden','craft','bake'],'信写给花园，它大概会用新叶回你。','那我就慢慢等，它一直都是这样回答的。'],
  ['把四季谢礼一份份备齐','分批备好点心与花茶，修稳递送的用具；每份都留一点刚好的心意。','courtyard',['bake','tea','tools'],'最后这一份也好了，一次送不完就分几趟。','是呀，路可以多走几次，心意不用挤在一起。'],
  ['明天的小屋仍然开着门','整理四季记录、擦净常用角落，备好两只杯子的茶；这不是最后一天。','house',['craft','clean','tea'],'记录先收在这里，想起来就再翻翻。','明天一起做什么？不用现在决定，我们还有好多天。'],
 ],
];

function campaignSplit(units,minLevel=4){
 const out=[];
 for(let level=6;level>=minLevel;level--){
  const weight=2**(level-minLevel),n=Math.min(3,Math.floor(units/weight));
  if(n){out.push({l:level,n});units-=n*weight;}
 }
 if(units)throw new Error('Campaign material allocation exceeds supported item counts');
 return out;
}
const campaignChainLabel={clean:'清洁用具',tools:'修理用具',bake:'点心',tea:'茶具',craft:'手绘材料',garden:'花草'};
function campaignStep(needs,cats){return {label:`准备${cats.map(c=>campaignChainLabel[c]).join('与')}`,needs:needs.filter(r=>cats.includes(r.c))};}

export const CAMPAIGN_TASKS=campaignStories.flatMap((rows,c)=>rows.map(([name,wish,region,cats,bubuText,yierText],j)=>{
 const mass=48+32*c+8*j,units=mass/8,base=Math.floor(units/3),remainder=units%3;
 const needs=cats.flatMap((cat,i)=>campaignSplit(base+(i<remainder?1:0)).map(r=>({c:cat,...r})));
 const steps=mass<96?[campaignStep(needs,cats)]:c<3?[campaignStep(needs,cats.slice(0,1)),campaignStep(needs,cats.slice(1))]:cats.map(cat=>campaignStep(needs,[cat]));
 const who=j%2?'yier':'bubu';
 return {id:24+c*8+j,name,title:name,who,wish,region,chapter:c,displayChapter:c+6,expanded:true,renovation:false,mass,needs,steps,coins:18+mass,xp:90+Math.floor(3*mass/4),after:who==='bubu'?[['bubu','happy',bubuText],['yier','turn',yierText]]:[['yier','happy',yierText],['bubu','turn',bubuText]]};
}));

export const CAMPAIGN_SIDE_MASS=[[16,48],[24,80],[32,112],[40,160],[48,208],[64,256]];
export function campaignSideTier(level){return Math.min(5,Math.max(0,Math.floor((level-10)/8)));}
const campaignSeasons=['春日','夏日','秋日','冬日'];
const campaignSideFlavors=[
 {name:'新芽旁的小纸条',wish:'窗边又有新芽了，准备一份春日养护小心意，留给愿意慢慢等的人。',cats:['garden','clean','craft']},
 {name:'春风里的歇脚礼',wish:'路过门前的人可以歇一会儿，把这一份轻轻的春日问候备好。',cats:['bake','tea','clean']},
 {name:'再出发的育苗约定',wish:'新一批小苗可以出发了，准备托放和记录所需，让下一次照顾也从容。',cats:['garden','tools','craft']},
 {name:'树荫下的清爽小聚',wish:'午后的树荫正好，备齐这一场清爽小聚的用物，忙完也留时间坐坐。',cats:['tea','clean','bake']},
 {name:'夏夜微光的回礼',wish:'给一起安静看夜色的日子留一份回礼；微光自在飞，心意慢慢备。',cats:['craft','garden','tea']},
 {name:'热天里的一次检修',wish:'趁傍晚凉下来，准备手边的检查与整理用物，把不顺手的小地方照顾好。',cats:['tools','clean','craft']},
 {name:'秋色小集的准备',wish:'把适合分享的秋日小东西准备齐，留一条好走的通道，再慢慢摆开。',cats:['garden','craft','tools']},
 {name:'落叶边的一份问候',wish:'给门前的秋日留一份问候，分享刚好的味道，也让平常的一天暖一点。',cats:['bake','tea','craft']},
 {name:'风起前的整理约定',wish:'风又要来了，备齐清理与检查所需，让用久的小东西继续稳稳陪着。',cats:['clean','tools','garden']},
 {name:'冬日送暖的小盒',wish:'冬天的一份心意不必匆忙，分批备好这一盒送暖所需，完成了再出发。',cats:['bake','tea','clean']},
 {name:'长夜读书的准备',wish:'晚上的故事可以慢慢读，准备夜读与记录用物，把相伴的时间留出来。',cats:['craft','tools','tea']},
 {name:'过冬绿叶的回访',wish:'再看看过冬的小绿叶，准备这次回访与照顾所需，慢慢长也值得记住。',cats:['garden','clean','craft']},
];

// Find a balanced exact allocation while keeping the nine-row order limit.
function campaignSideAllocation(units,count){
 let best=null;
 function visit(parts,left){
  if(parts.length===count-1){
   if(left<1)return;
   const allocation=[...parts,left];
   let splits;
   try{splits=allocation.map(n=>campaignSplit(n,3));}catch{return;}
   const rows=splits.reduce((sum,rs)=>sum+rs.length,0);
   if(rows>9)return;
   const score=allocation.reduce((sum,n)=>sum+(n-units/count)**2,0);
   if(!best||score<best.score||(score===best.score&&rows<best.rows))best={score,rows,splits};
   return;
  }
  for(let n=1;n<=left-(count-parts.length-1);n++)visit([...parts,n],left-n);
 }
 visit([],units);
 if(!best)throw new Error('Unable to allocate a repeatable campaign request');
 return best.splits;
}
export function campaignSideSpec({slot=0,completed=0,level=10,stage=24,random=Math.random}={}){
 if(stage<24)return null;
 slot=slot===1?1:0;completed=Math.max(0,Math.floor(Number(completed)||0));
 const tier=campaignSideTier(level),loop=Math.floor(completed/12)+1,seasonIndex=Math.floor((completed%12)/3),season=campaignSeasons[seasonIndex];
 const flavor=campaignSideFlavors[seasonIndex*3+(completed+slot)%3];
 const available=CATS.filter(c=>CHAINS[c].unlock<=stage);
 const preferred=flavor.cats.filter(c=>available.includes(c));
 const remaining=available.filter(c=>!preferred.includes(c));
 // Reroll recipe order and, when possible, its supporting chain without changing mass.
 const sample=()=>Math.max(0,Math.min(0.999999999,Number(random())||0));
 if(remaining.length&&sample()<0.5)preferred[2]=remaining[Math.floor(sample()*remaining.length)];
 const cats=[...preferred];
 for(let i=cats.length-1;i>0;i--){const other=Math.floor(sample()*(i+1));[cats[i],cats[other]]=[cats[other],cats[i]];}
 const mass=CAMPAIGN_SIDE_MASS[tier][slot]+(slot===0?4:8)*(completed%3),count=Math.min(3,mass/4,cats.length);
 const allocation=campaignSideAllocation(mass/4,count);
 const needs=cats.slice(0,count).flatMap((c,i)=>allocation[i].map(r=>({c,...r})));
 if(needMass(needs)!==mass)throw new Error('Repeatable campaign request mass mismatch');
 return {slot,tier,loop,theme:season,completedAt:completed,levelAt:level,mass,expanded:true,looping:true,name:`${season} · ${slot?'长期协作':'轻委托'}：${flavor.name}`,wish:`${flavor.wish} 本次准备${cats.slice(0,count).map(c=>campaignChainLabel[c]).join('、')}。`,needs,coins:8+2*mass,xp:orderXP(needs)};
}
