import test from 'node:test';
import assert from 'node:assert/strict';
import {ResidentController,freshResidents,RESIDENT_EXITS,residentExitAt} from '../src/residents.mjs';
import {ACTOR_ACTIONS} from '../src/actor-actions.mjs';
import {GameEngine,freshState,validateState} from '../src/engine.mjs';
import {CATS,CHAINS} from '../src/data.mjs';

const seeded=()=>{let seed=114;return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};
const controller=(residents=freshResidents(),random=seeded())=>new ResidentController(residents,{random,clock:()=>0});
function stageEngine(stage){
 const s=freshState(1000);s.stage=stage;s.stats.build=stage;s.tutorial='done';s.decorStyles=s.decorStyles.map((_,i)=>i<stage?0:null);s.board=s.board.map((t,i)=>i<6?t:t?.k==='crate'&&t.openAt>stage?t:null);
 s.producerLessons=Object.fromEntries(CATS.map(c=>[c,c==='clean'||CHAINS[c].unlock<=stage]));s.tea.firstVisit=stage===24?'available':'locked';return new GameEngine(s,1000);
}

test('old saves migrate only missing residents; corrupt locations and runtime fields fail',()=>{
 const original=freshState(1000);assert.deepEqual(original.residents,freshResidents());assert.equal(original.schema,2);
 const old=structuredClone(original);delete old.residents;assert.deepEqual(validateState(old).residents,freshResidents());assert.equal(old.residents,undefined);
 for(const patch of [{region:'other'},{x:NaN},{y:Infinity},{x:7},{y:89},{remaining:100}]){
  const bad=structuredClone(original);Object.assign(bad.residents.bubu,patch);assert.throws(()=>validateState(bad),/角色位置/);
 }
 for(const residents of [null,[],{}, {bubu:original.residents.bubu}])assert.throws(()=>validateState({...original,residents}),/角色位置/);
 assert.deepEqual(validateState({...original,residents:{bubu:{region:'garden',x:8,y:12},yier:{region:'courtyard',x:92,y:88}}}).residents,{bubu:{region:'garden',x:8,y:12},yier:{region:'courtyard',x:92,y:88}});
});

test('one persistent home per bear; renders and camera changes never advance movement',()=>{
 const saved=freshResidents(),c=controller(saved),original=structuredClone(saved);
 for(let i=0;i<4;i++){assert.equal(c.frame('house',90000).length,2);assert.equal(c.frame('garden',90000).length,0);}
 assert.deepEqual(saved,original);assert.equal(c.residents,saved);
 assert.equal(c.transfer('bubu','garden',82,40,100),true);assert.equal(c.transfer('bubu','garden',30,70,100),false);
 assert.deepEqual(c.frame('house').map(a=>a.who),['yier']);assert.deepEqual(c.frame('garden').map(a=>a.who),['bubu']);assert.deepEqual(saved.yier,original.yier);
});

test('every eligible random GIF is reachable and each region excludes inappropriate actions',()=>{
 for(const region of ['house','garden','courtyard'])for(const who of ['bubu','yier']){
  const r=freshResidents();r[who].region=region;r[who==='bubu'?'yier':'bubu'].region=region==='house'?'garden':'house';
  const c=controller(r,()=>.99),seen=new Set();
  for(let t=500;t<=350000;t+=500){c.tick(t);const action=ACTOR_ACTIONS.find(a=>a.id===c.state(who).action);if(action){assert.ok(action.regions.includes(region));assert.equal(action.who,who);seen.add(action.id);}}
  const eligible=ACTOR_ACTIONS.filter(a=>a.who===who&&a.kind==='random'&&a.regions.includes(region)).map(a=>a.id);
  assert.deepEqual([...seen].sort(),eligible.sort(),`${region}/${who}`);
 }
});

test('furniture neighbors can prioritize eligible actions without dropping the queue',()=>{
 const r=freshResidents();r.bubu={region:'house',x:30,y:65};r.yier.region='garden';let calls=0;
 const c=controller(r,()=>{calls++;return calls>3&&calls%2===0?.55:.8;});const seen=new Set();
 for(let t=500;t<=400000;t+=500){c.tick(t,{decorByRegion:{house:[{decorId:5,x:30,y:65}]}});const s=c.state('bubu');if(s.action)seen.add(s.action);}
 assert.ok(seen.has('bubu-work'));assert.ok(seen.has('bubu-watermelon'));assert.ok(seen.has('bubu-sing'));
});

test('pause and reduced motion freeze actions; large time gaps advance at most 500 ms',()=>{
 const saved=freshResidents(),c=controller(saved,()=>.1);for(let t=500;t<=3500;t+=500)c.tick(t);
 assert.equal(c.state('bubu').mode,'walk');const before=structuredClone(saved),status=c.state('bubu');
 c.tick(200000,{paused:true});c.tick(400000,{reducedMotion:true});assert.deepEqual(saved,before);assert.equal(c.state('bubu').mode,status.mode);
 c.tick(600000);assert.ok(Math.hypot(saved.bubu.x-before.bubu.x,saved.bubu.y-before.bubu.y)<=4.25001);
 const snapshot=structuredClone(saved);for(let i=0;i<10;i++)c.frame('house',900000);assert.deepEqual(saved,snapshot);
});

test('reduced motion displays standing sprites while freezing single and pair actions, except manual drag',()=>{
 const solo=freshResidents();solo.yier.region='garden';const c=controller(solo,()=>.99);
 for(let t=500;t<=7000;t+=500)c.tick(t);assert.equal(c.state('bubu').mode,'action');assert.ok(c.frame('house')[0].id.startsWith('actor-motion-'));
 const positions=structuredClone(solo),remaining=c.state('bubu').remaining;c.tick(200000,{reducedMotion:true});
 assert.deepEqual(solo,positions);assert.equal(c.state('bubu').remaining,remaining);assert.deepEqual(c.frame('house').map(l=>l.id),['bubu-idle']);assert.deepEqual(c.frame('garden').map(l=>l.id),['yier-turn']);
 c.tick(200100,{reducedMotion:false});assert.ok(c.frame('house')[0].id.startsWith('actor-motion-'));assert.equal(c.state('bubu').remaining,remaining-100);
 const pair=controller({bubu:{region:'house',x:30,y:65},yier:{region:'house',x:40,y:65}},()=>.1);pair.tick(500);assert.ok(pair.pair);
 const pairBefore=structuredClone(pair.residents),pairRemaining=pair.pair.remaining;pair.tick(60000,{reducedMotion:true});
 assert.deepEqual(pair.residents,pairBefore);assert.equal(pair.pair.remaining,pairRemaining);assert.deepEqual(pair.frame('house').map(l=>l.id),['bubu-idle','yier-turn']);assert.equal(pair.frame('garden').length,0);
 pair.tick(60100,{reducedMotion:false});assert.ok(pair.frame('house')[0].id.startsWith('actor-motion-pair-'));assert.equal(pair.pair.remaining,pairRemaining-100);
 pair.tick(60200,{reducedMotion:true});pair.beginDrag('yier',60200);assert.ok(pair.frame('house').find(l=>l.who==='yier').id.startsWith('actor-motion-yier-drag-'));assert.equal(pair.frame('house').find(l=>l.who==='bubu').id,'bubu-idle');
});

test('drag variants belong to the dragged bear; cancellation restores and transfer moves only one',()=>{
 for(const who of ['bubu','yier'])for(const random of [()=>0,()=>.999]){
  const r=freshResidents(),c=controller(r,random),before=structuredClone(r),other=who==='bubu'?'yier':'bubu';
  assert.equal(c.beginDrag(who,100),true);assert.equal(c.beginDrag(who,100),false);assert.equal(c.beginDrag(other,100),false);
  assert.equal(c.state(who).action,`${who}-drag-${random()===0?1:2}`);assert.equal(c.frame('house').find(a=>a.who===who).id,c.state(who).id);
  c.dragTo(who,-20,200);assert.equal(r[who].x,8);assert.equal(r[who].y,88);c.tick(500);assert.deepEqual(r[other],before[other]);
  assert.equal(c.dragTo(who,NaN,40),false);c.endDrag(who,500,{cancel:true});assert.deepEqual(r,before);
  c.beginDrag(who,600);c.dragTo(who,8,34);c.endDrag(who,700);c.transfer(who,'courtyard',49,37,700);
  assert.deepEqual(r[who],{region:'courtyard',x:49,y:37});assert.deepEqual(r[other],before[other]);assert.equal(c.state(who).mode,'idle');
  c.tick(1200);assert.deepEqual(r[who],{region:'courtyard',x:49,y:37});
  const moved=structuredClone(r);c.beginDrag(who,1300);c.dragTo(who,60,70);c.cancelAll(1400);assert.deepEqual(r,moved);
 }
});

test('nearby interaction renders one GIF with two handles, ends after 5 s and respects cooldown',()=>{
 const r=freshResidents();r.yier={region:'house',x:40,y:65};const c=controller(r,()=>.1);c.tick(500);
 assert.equal(c.state('bubu').mode,'pair');const frame=c.frame('house');
 assert.equal(frame.filter(a=>a.id).length,1);assert.equal(frame.filter(a=>a.hitOnly&&a.pairHit).length,2);
 assert.deepEqual(frame.filter(a=>a.hitOnly).map(a=>a.who),['bubu','yier']);
 for(let t=1000;t<=5500;t+=500)c.tick(t);assert.equal(c.pair,null);assert.ok(c.pairCooldown>0);
 for(let t=6000;t<=12000;t+=500)c.tick(t);assert.equal(c.pair,null);
 const c2=controller({bubu:{region:'house',x:30,y:65},yier:{region:'house',x:40,y:65}},()=>.1);c2.tick(500);
 const yierBefore={...c2.residents.yier};c2.beginDrag('bubu',600);assert.equal(c2.pair,null);assert.deepEqual(c2.residents.yier,yierBefore);assert.equal(c2.state('bubu').mode,'drag');
 c2.endDrag('bubu',700);c2.pairCooldown=0;c2.tick(1200);assert.ok(c2.pair);c2.residents.yier.x=90;c2.tick(1700);assert.equal(c2.pair,null);
});

test('all four interactions use handles matching their actual left-right or stacked bear positions',()=>{
 const r={bubu:{region:'house',x:30,y:65},yier:{region:'house',x:40,y:65}},c=controller(r,()=>.1),seen=new Set();
 for(let round=0;round<4;round++){
  const now=round*20000+500;c.tick(now);assert.ok(c.pair);const frame=c.frame('house'),image=frame.find(l=>l.who==='pair'),bubu=frame.find(l=>l.who==='bubu'),yier=frame.find(l=>l.who==='yier');
  seen.add(image.id);assert.ok(bubu.hitOnly&&yier.hitOnly);assert.equal(bubu.id,null);assert.equal(yier.id,null);
  if(image.id==='actor-motion-pair-bonk'){
   assert.equal(bubu.x,image.x);assert.equal(yier.x,image.x);assert.equal(bubu.y,image.y+image.h/4);assert.equal(yier.y,image.y-image.h/4);
   assert.equal(bubu.w,image.w);assert.equal(yier.w,image.w);assert.equal(bubu.h,image.h/2);assert.equal(yier.h,image.h/2);
  }else{
   assert.equal(bubu.x,image.x-image.w/4);assert.equal(yier.x,image.x+image.w/4);assert.equal(bubu.y,image.y);assert.equal(yier.y,image.y);
   assert.equal(bubu.w,image.w/2);assert.equal(yier.w,image.w/2);assert.equal(bubu.h,image.h);assert.equal(yier.h,image.h);
  }
  c.cancelAll(now);c.pairCooldown=0;
 }
 assert.deepEqual([...seen].sort(),ACTOR_ACTIONS.filter(a=>a.kind==='interaction'&&a.regions.includes('house')).map(a=>a.asset).sort());
});

test('separated Yier frequently chooses search without dropping other GIFs; together never chooses search',()=>{
 const r=freshResidents();r.bubu.region='garden';const c=controller(r);let searches=0;const seen=new Set();
 // Inspect action choices while apart; free movement now naturally reunites the bears.
 for(let i=0;i<1000;i++){const action=c.chooseAction('yier');if(action.kind==='search')searches++;seen.add(action.id);}
 assert.ok(searches/1000>.55,`${searches}/1000`);assert.ok(seen.size>3);
 r.bubu.region='house';for(let i=0;i<100;i++)assert.notEqual(c.chooseAction('yier').id,'yier-search');
});

test('autonomous walking through all four doors uses their spawns and cooldown prevents bouncing',()=>{
 for(const door of RESIDENT_EXITS){
  const c=controller(),r=c.residents.bubu,rt=c.runtime.bubu;
  Object.assign(r,{region:door.region,x:door.x,y:door.y});rt.mode='walk';rt.target={x:door.x,y:door.y};c.runtime.yier.remaining=100000;
  c.tick(500,{paused:true});assert.equal(r.region,door.region);
  c.tick(1000,{reducedMotion:true});assert.equal(r.region,door.region);
  c.tick(1500);assert.deepEqual(r,{region:door.destination,...door.spawn});assert.equal(rt.doorCooldown,18000);
  const back=RESIDENT_EXITS.find(e=>e.region===r.region&&e.destination===door.region);
  Object.assign(r,{x:back.x,y:back.y});rt.mode='walk';rt.target={x:back.x,y:back.y};c.tick(2000);assert.equal(r.region,door.destination);
  const persisted=structuredClone(c.residents);assert.deepEqual(Object.keys(persisted.bubu).sort(),['region','x','y']);
 }
});

test('separated bears prefer the route to one another and use the courtyard for a two-door journey',()=>{
 const apart=controller({bubu:{region:'house',x:28,y:65},yier:{region:'garden',x:74,y:70}},()=>0);
 apart.startNext('bubu');assert.deepEqual(apart.state('bubu').target,{x:8,y:34});assert.equal(apart.runtime.bubu.journeyRegion,'garden');
 apart.startNext('yier');assert.notDeepEqual(apart.state('yier').target,{x:92,y:27});
 let reunited=false,visitedCourtyard=false;
 for(let t=500;t<=90000;t+=500){apart.tick(t);if(apart.residents.bubu.region==='courtyard')visitedCourtyard=true;if(apart.residents.bubu.region===apart.residents.yier.region){reunited=true;break;}}
 assert.ok(visitedCourtyard);assert.ok(reunited);assert.equal(apart.residents.bubu.region,'garden');
 // A draw of 0.5 goes to a door when apart (75%), but remains an ordinary walk together (30%).
 for(const separate of [false,true]){
  const c=controller();if(separate)c.residents.yier.region='courtyard';const draws=[.1,.5,.5,.5];c.random=()=>draws.shift()??.5;c.startNext('bubu');
  assert.equal(c.state('bubu').target.y===34,separate);
 }
});

test('each door has a single destination and an elliptical release zone',()=>{
 assert.equal(RESIDENT_EXITS.length,4);
 for(const door of RESIDENT_EXITS){assert.equal(residentExitAt(door.region,door.x,door.y),door);assert.equal(residentExitAt(door.region,door.x+door.rx*.9,door.y+door.ry*.9),null);assert.ok(door.spawn.x>=8&&door.spawn.x<=92);}
 assert.equal(residentExitAt('garden',NaN,27),null);assert.equal(residentExitAt('house',50,70),null);
});

test('together activity cannot reward separated bears or consume anything',()=>{
 const game=new GameEngine(null,1000);game.s.stage=1;game.s.residents.yier.region='courtyard';
 const before=structuredClone(game.s);const result=game.homeActivity('house',1000);
 assert.equal(result.code,'APART');assert.deepEqual(game.s,before);
 game.s.residents.yier.region='house';assert.equal(game.homeActivity('house',1000).ok,true);assert.equal(game.s.coins,before.coins+8);
 assert.equal(game.homeActivity('house',1000).code,'CLAIMED');assert.equal(game.s.coins,before.coins+8);
});

test('tea submission requires both residents at the plan region before consuming or rewarding',()=>{
 const game=stageEngine(13);game.chooseTeaPlan('garden');const order=game.teaOrder();order.needs.forEach((r,i)=>game.s.board[7+i]={k:'item',c:r.c,l:r.l});
 const before=structuredClone(game.s);assert.equal(game.submit('tea',order.id).code,'APART');assert.deepEqual(game.s,before);
 game.s.residents.bubu.region='garden';const separated=structuredClone(game.s);assert.equal(game.submit('tea',order.id).code,'APART');assert.deepEqual(game.s,separated);
 game.s.residents.yier.region='garden';assert.equal(game.submit('tea',order.id).ok,true);assert.equal(game.s.tea.round,1);assert.equal(game.s.stats.order,1);
});

test('first visit requires both bears in courtyard and preserves locked/arrived precedence',()=>{
 const locked=stageEngine(13);assert.equal(locked.beginFirstVisit().code,'LOCKED');
 const game=stageEngine(24),before=structuredClone(game.s);assert.equal(game.beginFirstVisit().code,'APART');assert.deepEqual(game.s,before);
 game.s.residents.bubu.region='courtyard';const separated=structuredClone(game.s);assert.equal(game.beginFirstVisit().code,'APART');assert.deepEqual(game.s,separated);
 game.s.residents.yier.region='courtyard';assert.equal(game.beginFirstVisit().ok,true);assert.equal(game.s.coins,before.coins);assert.equal(game.s.stats.order,before.stats.order);
 game.s.residents.bubu.region='house';const arrived=structuredClone(game.s);assert.equal(game.beginFirstVisit().code,'ARRIVED');assert.deepEqual(game.s,arrived);
});
