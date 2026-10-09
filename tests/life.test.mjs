import test from 'node:test';
import assert from 'node:assert/strict';
import {describeEnvironment,ambientFrame} from '../src/life.mjs';
import {describeScene,renderSceneHTML,drawSceneCanvas,SCENE_STYLES} from '../src/scenes.mjs';

const state=(stage=24)=>({stage,decorStyles:{},decorPositions:{},world:{region:'house',equipped:{}}});
const local=(h,m=0,s=0)=>new Date(2026,9,9,h,m,s).getTime();

test('environment uses local clock phases and stable ten-minute simulated weather',()=>{
 for(const [h,phase] of [[4,'night'],[5,'morning'],[8,'morning'],[9,'day'],[16,'day'],[17,'dusk'],[18,'dusk'],[19,'night']]){
  const e=describeEnvironment(local(h));assert.equal(e.phase,phase);assert.equal(e.night,phase==='night');assert.equal(e.simulated,true);
 }
 const a=describeEnvironment(local(12,10)),b=describeEnvironment(local(12,19,59)),c=describeEnvironment(local(12,20));
 assert.equal(a.weather,b.weather);assert.equal(a.segment,b.segment);assert.equal(c.segment,a.segment+1);assert.equal(b.clock,'12:19');
 assert.deepEqual(a,describeEnvironment(local(12,10)));
 const weather=new Set(Array.from({length:144},(_,i)=>describeEnvironment(local(0,i*10)).weather));
 assert.deepEqual([...weather].sort(),['cloudy','rain','sunny','wind']);
});

test('ambient actors really change position and walk frames with continuous segment boundaries',()=>{
 const s=state(),env=describeEnvironment(local(12));
 const frame=t=>ambientFrame(s,'house',env,t);
 const a=frame(500),b=frame(4000);assert.notEqual(a.actors[0].x,b.actors[0].x);assert.match(a.actors[0].id,/walk[1-4]$/);assert.notEqual(a.actors[0].id,frame(680).actors[0].id);
 for(const boundary of [15000,30000,45000,60000,75000,90000]){
  const before=frame(boundary-1),after=frame(boundary);
  for(let i=0;i<2;i++){assert.ok(Math.abs(before.actors[i].x-after.actors[i].x)<.01);assert.ok(Math.abs(before.actors[i].y-after.actors[i].y)<.01);}
 }
});

test('idle return cycle leaves both bears empty-handed in every region',()=>{
 for(const region of ['house','garden','courtyard'])for(const stage of [1,24]){
  const frame=ambientFrame(state(stage),region,null,83000);
  assert.equal(frame.walking,false);assert.equal(frame.activity,'look');
  assert.deepEqual(frame.actors.map(a=>a.id),['bubu-idle','yier-turn']);
  assert.deepEqual(frame.props,[]);
 }
});

test('personal activities require built furniture and use its moved coordinates without changing save',()=>{
 const early=ambientFrame(state(0),'house',null,23000);assert.equal(early.actors.some(a=>['read','paint'].includes(a.activity)),false);
 const s=state();s.decorPositions={16:{x:35,y:44},8:{x:60,y:41},17:{x:50,y:66}};const before=JSON.stringify(s);
 const scene=describeScene(s,{region:'house',ambient:true,now:23000});
 assert.equal(scene.ambient.actors[0].activity,'read');assert.equal(scene.ambient.actors[1].activity,'view-painting');
 assert.equal(scene.ambient.actors[0].x,21);assert.equal(scene.ambient.actors[0].y,48);assert.equal(scene.ambient.actors[1].x,83);assert.equal(scene.ambient.actors[1].id,'yier-turn');assert.equal(scene.ambient.actors[1].flip,false);
 const rest=describeScene(s,{region:'house',ambient:true,now:53000});assert.equal(rest.ambient.actors[0].activity,'rest');assert.equal(rest.ambient.actors[0].x,36.5);assert.equal(rest.ambient.actors[0].y,70);assert.equal(rest.ambient.actors[1].x-rest.ambient.actors[0].x,27);
 assert.equal(JSON.stringify(s),before);
 for(const region of ['house','garden','courtyard'])for(const time of [0,8000,23000,40000,53000,68000,83000])for(const a of ambientFrame(s,region,null,time).actors){assert.ok(a.x>=11&&a.x<=89);assert.ok(a.y>=14&&a.y<=86);}
});

test('garden looks at unlocked plants, and moved resting corners leave room for both bears',()=>{
 const early=ambientFrame(state(12),'garden',null,23000);assert.equal(early.actors[1].activity,'look');
 const garden=ambientFrame(state(24),'garden',null,23000);assert.equal(garden.actors[1].activity,'view-flowers');assert.equal(garden.actors[1].id,'yier-turn');assert.match(garden.caption,/新叶和花朵/);
 for(const x of [12,25,50,75,88]){
  const s=state();s.decorPositions={17:{x,y:70}};const resting=describeScene(s,{region:'house',ambient:true,now:53000});
  const [a,b]=resting.ambient.actors;assert.ok(b.x-a.x>=27);assert.ok(a.x>=11);assert.ok(b.x<=89);
 }
 const left=ambientFrame(state(),'house',null,500);assert.equal(left.actors[0].flip,true);assert.equal(left.actors[1].flip,false);
});

test('together is a two-bear activity and normal histories retain their original poses and time',()=>{
 const s=state(),env=describeEnvironment(local(12));
 const current=describeScene(s,{environment:env,ambient:true,now:68000});assert.equal(current.ambient.activity,'together');assert.equal(current.ambient.actors.length,2);assert.equal(current.ambient.props[0].glyph,'♡');
 const legacy=describeScene(s,{night:true});assert.equal(legacy.night,true);assert.equal(legacy.layers.find(a=>a.who==='bubu').id,'bubu-sit');assert.equal(legacy.ambient,undefined);
 const replay=describeScene(s,{replay:true,environment:env,ambient:true,now:68000});assert.equal(replay.environment,null);assert.equal(replay.ambient,undefined);
 const tea=describeScene(s,{teaResult:{stage:24,region:'house',night:true,plan:'warm',participants:['bubu','yier']},environment:env,ambient:true,now:68000});assert.equal(tea.night,true);assert.equal(tea.environment,null);assert.equal(tea.ambient,undefined);assert.equal(tea.layers.find(a=>a.who==='bubu').id,'bubu-handover3');
});

test('HTML shows moving rain/wind, with indoor weather confined to the window',()=>{
 const s=state();for(const region of ['house','courtyard'])for(const weather of ['sunny','cloudy','rain','wind']){
  const scene=describeScene(s,{region,environment:{phase:'dusk',night:false,weather},ambient:true,now:68000});const html=renderSceneHTML(scene);
  assert.match(html,new RegExp(`scene-weather-${weather}`));assert.match(html,/scene-time-dusk/);assert.equal(html.includes('scene-weather-window'),region==='house');assert.match(html,/sepia\(\.23\)/);
 }
 assert.match(SCENE_STYLES,/@keyframes scene-rain-fall/);assert.match(SCENE_STYLES,/@keyframes scene-wind-blow/);assert.match(SCENE_STYLES,/prefers-reduced-motion/);
});

test('photographs use the same time filter, weather and actor snapshot as HTML',async()=>{
 const calls=[],ctx=new Proxy({filter:'none',createRadialGradient(){return {addColorStop(){}};}},{get(target,key){if(key in target)return target[key];return (...args)=>calls.push([key,...args]);},set(target,key,value){target[key]=value;if(key==='filter')calls.push(['filter',value]);return true;}});
 const input=describeScene(state(),{region:'house',environment:{phase:'dusk',night:false,weather:'rain'},ambient:true,now:68000});const before=JSON.stringify(input);
 const photo=await drawSceneCanvas(ctx,input,{loadImage:async()=>({width:300,height:300}),width:1000,height:1120});
 assert.deepEqual(photo,input);assert.equal(JSON.stringify(input),before);assert.ok(calls.some(c=>c[0]==='filter'&&c[1].includes('sepia(.23)')));assert.ok(calls.some(c=>c[0]==='rect'&&c[1]===340&&c[3]===320));assert.ok(calls.some(c=>c[0]==='lineTo'));assert.ok(calls.some(c=>c[0]==='fillText'&&c[1]==='♡'));
});
