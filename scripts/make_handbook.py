"""Render a compact, illustrated Chinese delivery/design handbook from actual QA artifacts."""
from pathlib import Path
import json, html, os
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT, TA_CENTER
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/好日子小屋_设计与交付手册.pdf'
FONT=os.environ.get('PDF_FONT','/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf')
if not Path(FONT).exists():raise SystemExit('请设置 PDF_FONT，指向本机已安装的支持中文的TrueType字体文件。项目不分发字体。')
pdfmetrics.registerFont(TTFont('CozySans',FONT))
INK=colors.HexColor('#604a37');MUTED=colors.HexColor('#947d61');SAGE=colors.HexColor('#819573');LINE=colors.HexColor('#dfd1b8');PAPER=colors.HexColor('#fffaf0');MINT=colors.HexColor('#edf1e3');PINK=colors.HexColor('#f4e3d7')
styles={
 'body':ParagraphStyle('body',fontName='CozySans',fontSize=10,leading=16,textColor=INK,spaceAfter=8,wordWrap='CJK'),
 'small':ParagraphStyle('small',fontName='CozySans',fontSize=8.3,leading=13,textColor=MUTED,spaceAfter=6,wordWrap='CJK'),
 'h1':ParagraphStyle('h1',fontName='CozySans',fontSize=22,leading=30,textColor=INK,spaceAfter=15,wordWrap='CJK'),
 'h2':ParagraphStyle('h2',fontName='CozySans',fontSize=13,leading=20,textColor=SAGE,spaceBefore=10,spaceAfter=7,wordWrap='CJK'),
 'eyebrow':ParagraphStyle('eyebrow',fontName='CozySans',fontSize=8,leading=13,textColor=SAGE,spaceAfter=10,tracking=1),
 'cover':ParagraphStyle('cover',fontName='CozySans',fontSize=30,leading=42,textColor=INK,spaceAfter=12),
 'caption':ParagraphStyle('caption',fontName='CozySans',fontSize=8,leading=12,textColor=MUTED,alignment=TA_CENTER,spaceAfter=8,wordWrap='CJK'),
 'cell':ParagraphStyle('cell',fontName='CozySans',fontSize=8,leading=12,textColor=INK,wordWrap='CJK'),
 'cellhead':ParagraphStyle('cellhead',fontName='CozySans',fontSize=8.5,leading=13,textColor=colors.white,wordWrap='CJK'),
}
def P(s,style='body'):return Paragraph(html.escape(str(s)).replace('\n','<br/>'),styles[style])
def h(s):return P(s,'h2')
def img(name,w=None,height=None):
 im=Image(str(ROOT/'qa'/name));r=im.imageHeight/im.imageWidth
 if w is not None:im.drawWidth=w;im.drawHeight=w*r
 elif height is not None:im.drawHeight=height;im.drawWidth=height/r
 return im
W=507
def table(rows,widths,headers=True,font='cell'):
 rr=[[P(v,'cellhead' if headers and i==0 else font) for v in row] for i,row in enumerate(rows)]
 t=Table(rr,colWidths=widths,hAlign='LEFT',repeatRows=1 if headers else 0)
 sty=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,-1),.4,LINE)]
 if headers:sty.append(('BACKGROUND',(0,0),(-1,0),SAGE))
 for i in range(1 if headers else 0,len(rr)):
  if i%2==1:sty.append(('BACKGROUND',(0,i),(-1,i),MINT))
 t.setStyle(TableStyle(sty));return t

def page_header(c,doc):
 c.saveState();pw,ph=doc.pagesize;c.setFillColor(PAPER);c.rect(0,0,pw,ph,fill=1,stroke=0)
 c.setStrokeColor(LINE);c.setLineWidth(.6);c.line(44,ph-35,pw-44,ph-35)
 c.setFont('CozySans',7.7);c.setFillColor(MUTED);c.drawString(44,ph-25,'GOOD DAYS, TOGETHER / 设计与交付手册')
 c.line(44,37,pw-44,37);c.drawString(44,24,'布布一二 · 好日子小屋  |  单机 v1.0')
 c.drawRightString(pw-44,24,f'{doc.page:02d}');c.restoreState()

def heading(no,title,sub=''):
 out=[P(f'{no} / DESIGN + DELIVERY','eyebrow'),P(title,'h1')]
 if sub:out.append(P(sub,'small'))
 return out

eco=json.loads((ROOT/'qa/economy-report.json').read_text());br=json.loads((ROOT/'qa/browser-report.json').read_text());sim=json.loads((ROOT/'qa/simulation-summary.json').read_text());build=json.loads((ROOT/'release/build-info.json').read_text())
story=[]
# 1 cover
story += [Spacer(1,16),P('布布一二\n好日子小屋','cover'),P('把小小的心愿，慢慢合成家。','h2'),P('完整离线单机游戏 · 六章故事 · 二合经营 · 家园布置','body'),Spacer(1,10)]
t=Table([[img('01-launch.png',w=185),img('17-complete-home.png',w=185)]],colWidths=[253.5,253.5]);t.setStyle(TableStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'TOP')]));story.append(t)
story += [Spacer(1,10),P('封面使用实际构建版本运行截图，非宣传概念图。','caption'),P(f'版本 1.0.0  ·  {build["runtimeAssets"]} 个运行素材  ·  代码 / 图稿 / 剧情 / 测试一并交付','small'),P('角色立绘为用户设定图精确切图；另有参考生成插画。商业IP授权与平台接入不在本包内。','small'),PageBreak()]
# 2 play
story+=heading('01','先打开它，一起回家','不需要账号，不依赖付费接口，也没有假装已经接入的云服务。')
story+=[h('最快的打开方式'),P('在完整项目包中，打开 release/好日子小屋_双击即玩.html。图片、音乐和代码均已内嵌。Windows也可以双击根目录“ 双击开始游戏.bat ”。'),P('聊天附件预览不是游戏运行环境。请先将HTML完整保存到本地，再用现代浏览器打开。手机部署可使用 dist/ 中的静态版本。','small'),h('第一份心愿怎么完成'),table([['一步','你做什么','小屋发生什么'],['1','读开场，点选/拖动两块相同小方巾','获得软海绵，同时解开尘封'],['2','交付上方的心愿','材料进入修缮包，获得一颗心愿星'],['3','回小屋选择门垫配色并布置','布布一二回应，门口发生可见变化'],['4','回合成台，点击带闪电的清洁篮','开始下一份心愿，随后解锁更多来源']],[42,228,237]),h('基本操作'),P('同类同级合成，异类普通物品交换；尘封物品只能由同类同级物品合入。物品详情可查看六阶路线与来源。最高为六级，订单只接受指定阶数，不把高阶自动折算为低阶。'),P('鼠标与触屏支持拖放，也支持“点选一个 → 点目标”。键盘可以在格子间移动并按Enter操作。短屏会自动切换紧凑订单条，点开可查看完整主线与邻里委托。'),h('累了，也不会卡住'),P('免费茶歇每分钟补30体力。初始口袋里有点心与剪刀，物品还可以收纳、出售、拆分或撤销。设置中的“轻松模式”关闭取物的体力与库存消耗，但保留正常合成和剧情流程。'),h('把进度保管好'),P('设置中可以导出/导入JSON存档。进度仅在当前浏览器保存，换设备或清理数据前先导出。浏览器限制本地保存时会明确提醒；没有云端同步，也不声称存在云端同步。'),PageBreak()]
# 3 research
story+=heading('02','从研究到自己的闭环','学习二合经营游戏的结构，不复制原作代码、美术与宣传文案。')
story+=[P('公开资料显示，《肥鹅健身房》把合成、订单和场所经营结合，而不仅是一块合成棋盘。本项目据此将“合出什么”“为何需要”“送到哪里”“之后发生什么”串成一条可追踪的生活叙事。'),table([['观察/设计问题','本游戏的具体处理'],['开场需要给玩家一个能看见的目标','旧屋和待整理家具；四幕对白；第一项门垫在游戏内真的落地'],['前几步应教会多个概念而非大段讲解','两块小方巾 → 解尘封 → 交付 → 星星 → 选配色 → 布置'],['订单容易和经营表现脱节','每项都有生活请求、固定需求、一个可见布置、两句角色回应'],['来源与空间需要随进度展开','6个固定工作台分期开放；下两行木箱分组清走'],['满盘、冷却、误合成会让玩家受挫','仓库、待领队列、剪刀、撤销、免费茶歇、轻松模式'],['主线结束后不能只剩死棋盘','邻里委托持续刷新；图鉴、换色、拍照和手帐继续存在']],[180,327]),h('叙事上的区别'),P('经营对象从健身场所改为两只熊共同生活的小屋。目标不是把关系压成“赚钱升级”，而是用清洁、修补、烘焙、泡茶、绘画和园艺，把两只的相处习惯变成玩家能够完成的小愿望。'),h('调研边界'),P('使用公开商店介绍、介绍文章与玩家反馈；没有完整实玩《肥鹅健身房》当前线上版本，也没有其后台概率与运营指标。因此不声称复刻全部活动、商业经济或证明本作品会获得某种留存。详细来源和取舍见 docs/01_调研与设计取舍.md。','small'),PageBreak()]
# 4 art roles
story+=heading('03','两只熊，和一屋可爱的小东西','外形依据用户提供的设定图；场景道具保留深棕轮廓与低饱和纸感。')
roles=Table([[Image(str(ROOT/'public/assets/bubu-idle.png'),width=112,height=121.3),Image(str(ROOT/'public/assets/yier-turn.png'),width=112,height=121.3)]],colWidths=[253.5,253.5]);roles.setStyle(TableStyle([('ALIGN',(0,0),(-1,-1),'CENTER')]));story.append(roles)
story += [table([['布布','一二'],['棕色、圆头、短肢、深棕线条、浅黄色双颊。温和可靠，靠具体行动照顾一二。','白色身体、深棕实心耳、粉色双颊、小领结和足端。活泼好奇，也会认真回应布布。']],[253.5,253.5]),h('素材来源，分别说清楚'),P('22张角色立绘是设定图的精确像素裁切与透明化，不是22张全新动作生图。两次参考生图工具输出了概念海报；原图随包保留，局部作为陪伴插画。没有把海报假报成合格的完整独立动作图集。'),P('通用物品、家具与空屋背景为原创SVG图稿栅格化PNG，游戏运行时使用真正的图片素材。36个物品采用不同主体轮廓，三件家具有意复用其对应收藏图形，使物品进入小屋后保持识别。'),img('item-art-contact-sheet.jpg',w=300),P('实际36个合成物品；完整大图在 qa/item-art-contact-sheet.jpg。','caption'),PageBreak()]
# 5 rules
story+=heading('04','数值有来处，失败有出口','主线许可独立于可花费金币；重要操作均先校验，再扣资源。')
story+=[table([['资源','规则','恢复/保护'],['体力','初始100；产出耗1；自然15秒+1','自然恢复上限100；免费茶歇与点心；可选轻松模式'],['工作台库存','18/24/30容量；6秒+1','升级立即补满；满盘不先扣体力/库存'],['金币','主线/邻里/等级/每日/出售获得','主要用于便利性升级；零金币也能继续主线'],['心愿星','当前主线交付固定1颗','只用于当前布置，无法在商店误花'],['仓库/待领','8格可扩至24；礼物另排队','满盘礼物不消失，仓库可直接用于订单'],['剪刀/撤销','拆为两个低一阶；撤销最近可逆动作','失败不扣剪刀；撤销同时恢复奖励，阻止复制']],[82,220,205]),h('有意义，而不过度刁难的体力节奏'),P('初版奖励叠加过多，主线结束能堆到六百多体力。正式版将主线每单改为2至4，章节10，成长每级5，每日礼物20；自然恢复与免费茶歇保持。100个随机种子仍全部走通。'),h('可核对的静态总量'),P(f'24项主线基础物品价值合计 {eco["mainBaseValue"]}；固定主线金币 {eco["mainCoins"]}；固定主线体力 {eco["mainEnergy"]}；心愿星发出24、消耗24。这些数字不等同于点击次数，因为已有尘封、二阶掉落、章节材料与升级会改变具体操作量。'),h('正常路径不注入资源'),P(f'100种子主线模拟的产出次数为 {sim["standard"]["minProduce"]}–{sim["standard"]["maxProduce"]}，最终最低体力为 {sim["standard"]["minFinalEnergy"]}。每一步通过正常玩家动作；等待用虚拟时钟推进，不能当作真人游玩时长。'),PageBreak()]
# 6,7 quest tables
for half,(lo,hi) in enumerate([(0,12),(12,24)]):
 story+=heading(f'0{5+half}','24个小愿望'+(' · 上篇' if not half else ' · 下篇'),'每一项都有完整请求、精确需求、可见布置和角色回应。完整对白见独立剧情文档。')
 rows=[['序','心愿/布置','需要的准备物资']]
 for t in eco['tasks'][lo:hi]:
  needs='、'.join(f'{eco["chains"][n["c"]]["items"][n["l"]-1]}×{n["n"]}' for n in t['needs'])
  rows.append([str(t['stage']+1).zfill(2),t['name'],needs])
 story +=[table(rows,[29,209,269]),h('章节里的感情推进'),P('从共同整理、学会留一份，到为对方的小爱好腾地方；再一起等花开、允许彼此不赶时间，最后把小屋的快乐分享出去。日常冲突用互相回应解决，不让一二只是闯祸，也不把布布写成训斥者。' if not half else '第24项完成后进入完整结尾，玩家亲手做好的家具、收集与记忆不被清空。之后仍有邻里委托、图鉴、免费换色与拍照。通关不是删除这间家，而是让它留下来。'),PageBreak()]
# 8 UI ops
story+=heading('07','实际操作界面','完整棋盘、详细订单和短屏专用紧凑模式均已实现。')
t=Table([[img('03-tutorial-board.png',w=185),img('viewport-360x640.png',w=185)]],colWidths=[253.5,253.5]);t.setStyle(TableStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'TOP')]));story.append(t)
story+=[Spacer(1,12),P('左：390×844开场，教学提示位于棋盘之前。右：360×640紧凑订单，教学后7行棋盘完整位于检查栏上方。','caption'),h('操作不只有拖动'),P('点选与拖放都能二合；键盘激活后焦点仍留在格子。普通可移动物品处理拖动，空格和固定格允许纵向滚动。触摸取消不会消耗或移动物品。'),h('需求和手头物品可以相互查询'),P('点订单物品打开路线，点路线来源定位工作台。合成提示优先为当前主线找有效下一步；材料齐备时改为引导交付或布置，而不是继续盲目推荐合成。'),PageBreak()]
# 9 systems
story+=heading('08','一套能继续生活的系统','手帐、小铺与存档不是不可点的装饰入口。')
t=Table([[img('10-memory-book.png',w=145),img('13-shop.png',w=145),img('15-settings.png',w=145)]],colWidths=[169,169,169]);t.setStyle(TableStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'TOP')]));story.append(t)
story+=[Spacer(1,12),table([['手帐','小铺与道具','设置与存档'],['六张章节回忆、全部过去对白、36项图鉴、每日目标和累计记录。','金币购买、工作台升级、仓库扩容、点心与剪刀。没有真实付费或广告。','导出、校验导入、失败提醒、备份恢复、音效/音乐/减少动态/轻松模式。']],[169,169,169]),h('合照是真正生成的PNG'),P('导出按实际已解锁装饰与当前颜色绘制，使用相同角色切图，按房间边界裁切。不是把宣传图换个名字交给玩家。实际导出文件在 qa/home-photo-export.png。'),h('音乐的范围'),P('包含一首24.62秒原创程序合成循环，及Web Audio短音效。默认关闭背景音乐，切后台暂停。没有借用商业歌曲或声称采用官方真人/熊熊语配音。'),PageBreak()]
# 10 tests
story+=heading('09','检查不是一句“已自检”','保留可复跑脚本、原始结果和实际运行截图。')
story+=[table([['37 / 37','100 / 100',f'{br["passed"]} / {br["total"]}'],['规则单元测试通过','正常模式随机种子主线通关','Chromium界面回归通过']],[169,169,169],headers=False),Spacer(1,12),h('已经修过的问题'),table([['发现','修复'],['离线内嵌脚本把$$替换坏','模板注入改为回调替换，并增加字符串与实际启动回归'],['一二侧转脸部透明化错误','扩大闭合轮廓的裁切，重新检查全部角色'],['半身图被用作完整演员','地图/对白改用完整动作，头像另用半身表情'],['小屏界面裁掉部分棋盘','增加真正的紧凑心愿模式和订单抽屉'],['键盘焦点与触摸取消不够稳','恢复激活后焦点，取消指针不修改模型'],['体力回报堆积过多','下调四类回报，重跑100个随机种子']],[165,342]),h('浏览器测试的准确范围'),P(f'浏览器为 Chromium {br["browser"]}。测试直接加载最终单文件HTML，仅在内存测试副本中打开QA入口。环境管理策略阻止文件/HTTP导航，未绕过策略；本地存储读写及恢复回归使用内存Web Storage适配器。'),P('因此，没有冒称已实测双击文件导航、真实file源持久化、PWA公网安装、Safari或真实手机硬件。这些必须在目标环境复验。所有已通过结果应按这一区别理解。','small'),PageBreak()]
# 11 files boundary
story+=heading('10','交付文件与后续边界','能直接游玩，也能继续维护；没有藏在按钮背后的虚假后端。')
story+=[table([['路径','用途'],['release/','单文件离线游戏与构建信息'],['dist/','独立JS/CSS/PNG/WAV的静态站点版，附PWA清单与缓存脚本'],['src/','数据、规则引擎、UI、样式、HTML模板'],['public/assets/','103个运行素材，原件均已入包'],['art/','原角色参考、参考生成概念图、通用SVG图稿、完整来源清单'],['docs/','调研、设计、剧情、数值、技术、测试、美术和发布说明'],['tests/ 与 qa/','可复跑的验证脚本、原始结果、检查点和运行截图']],[134,373]),h('重新构建'),P('运行游戏无需Node。编辑源码后，用Node.js 18或更高版本执行 npm run build。没有npm依赖，不需要先执行npm install。npm test 运行37项规则检查；npm run simulate 运行100种子通关。'),h('已完成的范围'),P('完整的离线单机故事闭环和可重复经营，不等于商业手游多年的内容量。当前没有支付、广告SDK、账号、云同步、联网好友、排行榜或平台登录。邻里纸条是程序生成的单机委托，不冒充真实玩家。'),h('角色与发布'),P('布布一二及用户参考图的既有权利不会因本包交付而转移。商业发行前需要确认相应使用权；当前包未包含商业IP授权。对目标平台、真实设备与公网PWA的验证也不在已通过测试的范围内。'),h('读更完整的设计依据'),P('调研来源与逐项设计取舍：docs/01_调研与设计取舍.md。完整24项剧情：docs/03_角色世界观与完整剧情.md。数值与完整47项回归记录：docs/04与06文档。README给出安装、运行与修改入口。'),PageBreak()]
# 12 sources
story+=heading('11','来源与阅读路线','以下是公开研究与实现资料，详细限制已在调研文档标出。')
refs=[
 ('《肥鹅健身房》官方TapTap产品页面','https://www.taptap.cn/app/208912','查看作品定位与官方发布内容；没有据此声称已完整实玩当前全部系统。'),
 ('《肥鹅健身房》App Store产品介绍','https://apps.apple.com/cn/app/id1565453504','合成、订单、清理与场所经营的官方公开说明。'),
 ('产业介绍文章：肥鹅健身房','https://www.gamelook.com.cn/2022/06/487511','观察上线早期结构；历史文章不等于当前版本状态。'),
 ('TapTap公开玩家讨论','https://www.taptap.cn/moment/222554506354558583','用于识别等待、库存和整理等摩擦点；个别反馈不代表全体玩家。'),
 ('MDN Pointer Events','https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events','拖放、触摸与取消事件的实现参考。'),
 ('MDN localStorage','https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage','存储域、限制和file:行为差异。'),
 ('MDN Page Visibility','https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API','后台保存和音频暂停。'),
 ('MDN Using Service Workers','https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers','静态部署版本的缓存设计，不代替实际安装测试。'),
]
for name,url,desc in refs:
 story += [h(name),P(desc,'small'),P(url,'small')]
story += [Spacer(1,10),P('角色图片来源：用户在本次对话中提供的布布、一二设定卡；原件保存在art/reference。素材来源清单逐项记录原图、切图、参考生成与原创图稿，未把它们混称为全部重新生图。','small')]
doc=SimpleDocTemplate(str(OUT),pagesize=(595.2756,841.8898),rightMargin=44,leftMargin=44,topMargin=52,bottomMargin=52,title='布布一二·好日子小屋：设计与交付手册',author='好日子小屋项目',subject='游戏设计、使用说明、素材、测试和交付边界')
doc.build(story,onFirstPage=page_header,onLaterPages=page_header)
print('wrote',OUT,OUT.stat().st_size,'bytes')
