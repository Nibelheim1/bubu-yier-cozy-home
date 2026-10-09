import test from 'node:test';
import assert from 'node:assert/strict';
import {GameEngine,freshState,clone,validateState,firstVisitResponse} from '../src/engine.mjs';
import {CATS,SIDE_FLAVOR,SOUVENIRS,teaResponse} from '../src/data.mjs';
const NOW=new Date('2026-10-09T08:00:00+08:00').getTime();
function setup(){const s=freshState(NOW);s.stage=24;s.stats.build=24;s.tutorial='done';s.decorStyles.fill(0);s.board=s.board.map((t,i)=>i<6?t:null);s.producerLessons=Object.fromEntries(CATS.map(c=>[c,true]));s.tea.firstVisit='available';return new GameEngine(s,NOW);}

test('saved neighbor text migrates only exact known pairs and preserves recipe, reward and random state',()=>{
 const old=[['巷口留言','把小东西准备好，生活就方便一点。'],['下午的约定','不用赶，准备好了再送来就好。'],['邻里小纸条','今天也想分享一点热乎乎的心意。'],['窗边的请求','给平常的一天，添一点小颜色。'],['周末的准备','东西不用很多，合适就好。']];
 for(const [i,[name,wish]] of old.entries()){
  const g=setup();g.s.sideOrders[0].name=name;g.s.sideOrders[0].wish=wish;
  g.s.sideOrders[1].name='下午的约定';g.s.sideOrders[1].wish='已经另写过的内容。';
  const input=clone(g.s),expected=clone(input);[expected.sideOrders[0].name,expected.sideOrders[0].wish]=SIDE_FLAVOR[i];
  assert.deepEqual(validateState(g.s),expected);assert.deepEqual(g.s,input);
 }
});

test('tea text migrates from each recorded plan, condition and guest list while all snapshots stay intact',()=>{
 const g=setup();g.moveDecor(5,70,50);g.s.decorStyles[5]=1;
 for(const [i,spec] of SOUVENIRS.entries()){
  const record=g.resultContext({...g.teaOrder(),id:`tea-${i}-${spec.plan}`,round:i,plan:spec.plan,condition:spec.condition,region:spec.plan==='warm'?'house':'garden',souvenirKey:spec.key,participants:i%2?['bubu','yier','xiaoli']:['bubu','yier']});
  record.response=[{who:'yier',text:'旧版尚未对齐画面的台词。'}];record.displayChoice='clip';record.seen=true;record.decorPositions={5:{x:35,y:76}};record.decorStyles[5]=0;record.equipped={house:null,garden:null,courtyard:null};
  g.s.world.souvenirs[spec.key]=record;
 }
 g.s.tea.lastResult=clone(g.s.world.souvenirs['chime-garden']);
 const input=clone(g.s),expected=clone(input);
 for(const record of [expected.tea.lastResult,...Object.values(expected.world.souvenirs)])record.response=teaResponse(record.plan,record.condition,record.participants.includes('xiaoli'));
 assert.deepEqual(validateState(g.s),expected);assert.deepEqual(g.s,input);
});

test('new and migrated first-visit responses share current text without modifying earned state',()=>{
 const g=setup();g.moveDecor(21,60,75);const visit=g.beginFirstVisit();assert.ok(visit.ok);
 assert.deepEqual(visit.result.response,firstVisitResponse());assert.match(visit.result.response[0].text,/花架和画台/);
 g.s.tea.lastResult.response=[{who:'yier',text:'花架和纪念画都摆好了。'}];g.s.tea.lastResult.displayChoice='anchor';g.s.tea.lastResult.seen=true;g.moveDecor(21,35,65);
 const input=clone(g.s),expected=clone(input);expected.tea.lastResult.response=firstVisitResponse(expected.tea.lastResult.participants);
 assert.deepEqual(validateState(g.s),expected);assert.deepEqual(g.s,input);
 assert.equal(expected.tea.lastResult.decorPositions[21].x,60);assert.equal(expected.decorPositions[21].x,35);
});
