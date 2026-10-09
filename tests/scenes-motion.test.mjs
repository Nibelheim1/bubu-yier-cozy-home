import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState} from '../src/engine.mjs';
import {describeScene,createScenePlayer} from '../src/scenes.mjs';

function harness(event='tea',region='house',participants=['bubu','yier']){
 const state=freshState(0);state.stage=24;state.decorPositions={12:{x:50,y:70}};
 const scene=describeScene(state,{region,teaResult:event==='tea'?{stage:24,region,plan:region==='garden'?'garden':'warm',participants}:undefined});
 let now=0,id=0,frame;const jobs=new Map();
 const player=createScenePlayer({event,scene,clock:()=>now,schedule:fn=>{jobs.set(++id,fn);return id;},cancel:key=>jobs.delete(key),onFrame:s=>{frame=s;}});
 function sample(t){now+=player.steps[player.status.step].duration*t;const [key,fn]=jobs.entries().next().value||[];assert.ok(fn);jobs.delete(key);fn();return frame;}
 return {player,sample,get frame(){return frame;},jump(ms){now+=ms;}};
}
const layer=(s,key)=>s.layers.find(l=>l.key===key);

test('support, watering and cup placement finish walking before operating',()=>{
 const h=harness('tea','garden');h.player.start();
 const support=h.sample(.7),x=layer(support,'yier').x;
 assert.equal(layer(support,'yier').id,'yier-support2');assert.equal(layer(support,'yier').flip,true);
 assert.equal(layer(h.sample(.2),'yier').x,x);h.sample(.1);h.player.advance();
 const water=h.sample(.7),bx=layer(water,'bubu').x;
 assert.equal(layer(water,'bubu').id,'bubu-support1');assert.equal(layer(water,'bubu').flip,true);
 assert.equal(layer(water,'watering-can').x,bx-6);assert.equal(layer(water,'water-stream'),undefined);
 const later=h.sample(.15);assert.equal(layer(later,'bubu').x,bx);assert.ok(layer(later,'water-stream'));h.player.destroy();
 const cups=harness();cups.player.start();const placed=cups.sample(.9);
 assert.equal(layer(placed,'cup-one').heldBy,undefined);assert.equal(layer(placed,'cup-one').w,8);
 const final=cups.sample(.1);assert.equal(layer(final,'yier').x,layer(placed,'yier').x);cups.player.destroy();
});

test('tea stream begins after arrival and kettle tilt; guest cup is picked up then handed over',()=>{
 const h=harness('tea','house',['bubu','yier','xiaoli']);h.player.start();h.sample(1);h.player.advance();
 const tilting=h.sample(.68);assert.ok(layer(tilting,'teapot').rotation>0);assert.equal(layer(tilting,'tea-stream'),undefined);
 const pouring=h.sample(.12);assert.ok(layer(pouring,'tea-stream'));assert.equal(layer(pouring,'teapot').flip,true);
 h.sample(.2);h.player.advance();const pickup=h.sample(.2);assert.ok(layer(pickup,'cup-three'));assert.equal(layer(pickup,'guest-cup'),undefined);
 const carried=h.sample(.2);assert.equal(layer(carried,'guest-cup').heldBy,'yier');assert.equal(layer(carried,'yier').flip,false);assert.equal(layer(carried,'xiaoli').flip,false);
 const passed=h.sample(.55);assert.equal(layer(passed,'guest-cup').heldBy,undefined);assert.equal(layer(passed,'guest-cup').w,7);assert.equal(layer(passed,'guest-cup').x,layer(passed,'xiaoli').x-4);h.player.destroy();
});

test('pause and resume preserve progress and do not advance a waiting step',()=>{
 const h=harness();h.player.start();h.sample(.3);const before=h.frame.action.progress;
 h.player.pause();assert.equal(h.player.status.paused,true);assert.equal(h.player.status.waiting,false);
 h.jump(60000);h.player.resume();assert.equal(h.frame.action.progress,before);assert.equal(h.player.status.step,0);
 h.sample(.7);assert.equal(h.player.status.waiting,true);h.player.pause();h.player.resume();assert.equal(h.player.status.waiting,true);assert.equal(h.player.status.step,0);h.player.destroy();
});

test('skip leaves placed props detached and preserves prep item size',()=>{
 const h=harness('tea','garden');h.player.skip();
 assert.equal(layer(h.frame,'watering-can').heldBy,undefined);assert.equal(layer(h.frame,'watering-can').handOffset,undefined);assert.equal(layer(h.frame,'watering-can').w,13);
 const state=freshState(0);state.stage=23;state.mainPrepStep=1;let end;
 const p=createScenePlayer({event:'prep-23',scene:describeScene(state,{region:'garden'}),onComplete:s=>{end=s;}});p.skip();
 assert.equal(layer(end,'prep-flower').w,24);assert.equal(layer(end,'prep-flower').heldBy,undefined);p.destroy();h.player.destroy();
});
