import test from 'node:test';
import assert from 'node:assert/strict';
import {boardTapIntent,createPressHold} from '../src/interaction.mjs';
import {GameEngine,freshState} from '../src/engine.mjs';
const item=(c,l=1)=>({k:'item',c,l});
const board=()=>Array.from({length:49},()=>null);
test('A then B then another B merges B without moving A or needing a repeated tap',()=>{
 const s=freshState();s.tutorial='done';s.board[7]=item('tools');s.board[8]=item('tea');s.board[9]=item('tea');const g=new GameEngine(s);let selected=null;
 for(const index of [7,8,9]){const intent=boardTapIntent(g.s.board,selected,index);if(intent.kind==='merge'){assert.ok(g.move(intent.from,intent.to).ok);selected=intent.to;}else selected=intent.index;}
 assert.deepEqual(g.s.board[7],item('tools'));assert.equal(g.s.board[8],null);assert.deepEqual(g.s.board[9],item('tea',2));assert.equal(g.s.stats.merge,1);
});
test('taps on empty, different levels, or max-level items never request swaps or moves',()=>{
 const b=board();b[7]=item('tea',2);b[8]=item('tea',3);assert.deepEqual(boardTapIntent(b,7,8),{kind:'select',index:8});assert.deepEqual(boardTapIntent(b,7,9),{kind:'select',index:null});b[7]=item('tea',6);b[8]=item('tea',6);assert.equal(boardTapIntent(b,7,8).kind,'select');
});
test('dust accepts a matching normal source but cannot act as a source',()=>{
 const b=board();b[7]=item('clean');b[8]={...item('clean'),dust:true};assert.equal(boardTapIntent(b,7,8).kind,'merge');assert.deepEqual(boardTapIntent(b,8,7),{kind:'select',index:7});assert.equal(boardTapIntent(b,7,7).kind,'select');
});
test('a producer tap remains a produce action regardless of selected item',()=>{
 const b=board();b[0]={k:'gen',c:'clean'};b[7]=item('tea');assert.deepEqual(boardTapIntent(b,7,0),{kind:'produce',index:0,c:'clean'});
});
function held(){let callback,timer=null,arms=0;const h=createPressHold({x:10,y:10,schedule:fn=>{callback=fn;timer=1;return 1;},cancel:()=>{timer=null;},onArm:()=>arms++});return {h,fire:()=>callback(),get timer(){return timer;},get arms(){return arms;}};}
test('short tap releases without arming and clears its pending timer',()=>{const f=held();assert.equal(f.h.release(),'tap');assert.equal(f.timer,null);f.fire();assert.equal(f.arms,0);});
test('early swipe cancels the hold and cannot turn into a move or late tap',()=>{const f=held();assert.equal(f.h.move(10,30),false);f.fire();assert.equal(f.arms,0);assert.equal(f.h.release(),'cancel');});
test('stationary hold arms once, then permits movement and reports a held release',()=>{const f=held();f.h.move(12,11);f.fire();assert.equal(f.arms,1);assert.equal(f.h.move(50,70),true);assert.equal(f.h.release(),'hold');assert.equal(f.h.armed,false);});
test('pointer cancellation prevents late arming and any drop',()=>{const f=held();f.h.cancel();f.fire();assert.equal(f.arms,0);assert.equal(f.h.release(),'cancel');});
