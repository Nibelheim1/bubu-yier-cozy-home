import assert from 'node:assert/strict';
import {GameEngine,validateState,clone,freshState} from '../src/engine.mjs';
import {CATS,TASKS,DAILY,CHAINS} from '../src/data.mjs';

/** Solve through legal player actions. Time is virtual; resources/items are never injected. */
export function runCampaign(seed=20261007,{calm=false,collectAll=false,gallery=false}={}){
 let now=new Date('2026-10-07T08:00:00+08:00').getTime(),calls=0,wait=0;
 const g=new GameEngine(freshState(now,seed),now); // seeded initial state, no resource injection
 if(calm)g.setting('calm',true);
 const log=[],checkpoints={};
 const doAction=(fn)=>{now+=250;g.tick(now);const r=fn();calls++;assert.ok(r.ok,`${r.code}: ${r.message} at stage ${g.s.stage}`);if(calls>20000)throw Error('Solver step bound exceeded');return r;};
 const boards=(c,l,dust=false)=>g.s.board.map((t,i)=>({t,i})).filter(({t})=>t?.k==='item'&&t.c===c&&t.l===l&&!!t.dust===dust).map(x=>x.i);
 function toBoard(c,l,n){
  while(boards(c,l).length<n){const i=g.s.storage.findIndex(t=>t.c===c&&t.l===l);if(i<0)break;space();doAction(()=>g.retrieve(i));}
 }
 function space(){
  if(g.free())return;
  // Store surplus if the board genuinely fills; this is the same public action as the UI.
  const t=TASKS[g.s.stage],protectedKeys=new Set((t?.needs||[]).map(r=>`${r.c}-${r.l}`));
  let candidate=g.s.board.findIndex(x=>x?.k==='item'&&!x.dust&&!protectedKeys.has(`${x.c}-${x.l}`));
  assert.ok(candidate>=0,'No reversible space recovery');
  if(g.s.storage.length<g.s.capacity)doAction(()=>g.store(candidate));else doAction(()=>g.sell(candidate));
 }
 function produce(c){
  space();let r=g.produce(c,now),attempts=0;
  while(!r.ok&&attempts++<50){
   if(r.code==='STOCK'){now+=6000;wait+=6000;g.tick(now);}
   else if(r.code==='ENERGY'){
    if(g.s.bag.energyPacks)doAction(()=>g.usePack());
    else{if(now<g.s.restAt){wait+=g.s.restAt-now;now=g.s.restAt;}doAction(()=>g.rest(now));}
   }else break;
   r=g.produce(c,now);
  }
  assert.ok(r.ok,`produce: ${r.code}`);calls++;now+=250;g.tick(now);
 }
 function ensure(c,l,n){
  let loops=0;
  while(g.count(c,l)<n){
   if(++loops>2000)throw Error('Unreachable item '+c+' '+l);
   if(l===1){produce(c);continue;}
   const dust=boards(c,l-1,true);
   ensure(c,l-1,dust.length?1:2);toBoard(c,l-1,dust.length?1:2);
   const free=boards(c,l-1);
   assert.ok(free.length>0,'Required source missing');
   const target=dust.length?dust[0]:free[1];assert.ok(target!==undefined,'Required second source missing');
   doAction(()=>g.move(free[0],target));
  }
 }
 doAction(()=>g.markIntro());doAction(()=>g.dailyGift(now));
 for(let stage=0;stage<24;stage++){
  const before={calls,produces:g.s.stats.produce,merges:g.s.stats.merge,now};
  if(stage===0)doAction(()=>g.move(8,9));
  for(const r of TASKS[stage].needs){assert.ok(CHAINS[r.c].unlock<=stage,'Source locked before its order');ensure(r.c,r.l,r.n);}
  assert.ok(g.canFulfill(TASKS[stage].needs));
  if(stage===7||stage===15||stage===22)checkpoints['ready-'+stage]=clone(g.s);
  doAction(()=>g.submit('main',stage));doAction(()=>g.build(stage%2));
  for(const d of DAILY)if(g.s.daily[d.key]>=d.target&&!g.s.daily.claimed.includes(d.key))doAction(()=>g.claimDaily(d.key,now));
  // Claim useful chapter gifts into the board; overflow remains safely queued.
  while(g.s.pending.length&&g.free()>8)doAction(()=>g.retrieve(0,'pending'));
  validateState(g.s);
  log.push({stage:stage+1,title:TASKS[stage].name,produces:g.s.stats.produce-before.produces,merges:g.s.stats.merge-before.merges,seconds:(now-before.now)/1000,energy:g.s.energy,coins:g.s.coins,free:g.free(),seen:Object.keys(g.s.seen).length});
  if((stage+1)%4===0)checkpoints[stage+1]=clone(g.s);
 }
 if(collectAll){for(const c of CATS)ensure(c,6,1);validateState(g.s);assert.equal(Object.keys(g.s.seen).length,36);}
 if(gallery){for(const c of CATS)for(let l=6;l>=1;l--)ensure(c,l,1);validateState(g.s);}
 return {seed,mode:calm?'calm':'standard',calls,virtualSeconds:(now-new Date('2026-10-07T08:00:00+08:00').getTime())/1000,waitSeconds:wait/1000,produce:g.s.stats.produce,merge:g.s.stats.merge,orders:g.s.stats.order,renovations:g.s.stage,seen:Object.keys(g.s.seen).length,energy:g.s.energy,coins:g.s.coins,log,checkpoints,final:clone(g.s)};
}
