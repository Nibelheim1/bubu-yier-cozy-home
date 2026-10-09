import test from 'node:test';
import assert from 'node:assert/strict';
import {describeScene,renderSceneHTML,drawSceneCanvas,SCENE_STYLES} from '../src/scenes.mjs';

const state={stage:0,world:{region:'house',equipped:{}},decorStyles:{}};
test('each region chooses independent night art, without a brightness filter',()=>{
 for(const region of ['house','garden','courtyard']){
  const day=describeScene(state,{region,characters:false});
  const night=describeScene(state,{region,night:true,characters:false});
  assert.equal(day.background,`region-${region}`);
  assert.equal(night.background,`region-${region}-night`);
  const html=renderSceneHTML(night);
  assert.match(html,new RegExp(`assets/region-${region}-night.png`));
  assert.match(html,/style="filter:none"/);assert.doesNotMatch(html,/brightness\(\.64\)/);
  assert.match(html,/scene-weather-fireflies/);
  assert.equal(html.includes('scene-weather-window'),region==='house');
 }
 assert.match(SCENE_STYLES,/@keyframes scene-firefly-drift/);
});
test('day and rainy night do not add flying fireflies',()=>{
 const day=describeScene(state,{region:'garden',characters:false});
 const rainy=describeScene(state,{region:'garden',characters:false,environment:{night:true,phase:'night',weather:'rain'}});
 assert.doesNotMatch(renderSceneHTML(day),/scene-weather-fireflies/);
 assert.doesNotMatch(renderSceneHTML(rainy),/scene-weather-fireflies/);
 assert.match(renderSceneHTML(rainy),/scene-weather-rain/);
 assert.equal(rainy.background,'region-garden-night');
});
test('night photos load the same painted background and freeze fireflies without changing input',async()=>{
 const scene=describeScene(state,{region:'house',night:true,characters:false}),before=JSON.stringify(scene),loaded=[],circles=[];
 const ctx=new Proxy({createRadialGradient(){return {addColorStop(){}};}},{get(t,k){return k in t?t[k]:(...a)=>{if(k==='arc')circles.push(a);};},set(t,k,v){t[k]=v;return true;}});
 const photo=await drawSceneCanvas(ctx,scene,{loadImage:async id=>{loaded.push(id);return {width:1182,height:1330};}});
 assert.deepEqual(loaded,['region-house-night']);assert.equal(circles.length,4);
 assert.ok(circles.every(([x,y])=>x>=340&&x<=660&&y>=67.2&&y<=380.8));
 assert.deepEqual(photo,scene);assert.equal(JSON.stringify(scene),before);
});
