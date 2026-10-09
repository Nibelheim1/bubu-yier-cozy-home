import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spriteSpec,spriteContentRect,drawSprite} from '../src/visuals.mjs';

test('standing and walking actors fit the same height and keep their feet at the box floor',()=>{
 const calls=[],ctx={drawImage(...args){calls.push(args);}};
 for(const id of ['bubu-idle','bubu-walk1','yier-turn','yier-walk1']){
  const spec=spriteSpec(id);assert.ok(spec.grounded);const rect=spriteContentRect(spec),png=fs.readFileSync(new URL(`../public/assets/${spec.asset}.png`,import.meta.url)),w=png.readUInt32BE(16),h=png.readUInt32BE(20);
  assert.ok(rect.w>0&&rect.h>0&&(spec.col+rect.x+rect.w)/spec.cols<=1.001&&(spec.row+rect.y+rect.h)/spec.rows<=1.001);
  drawSprite(ctx,{width:w,height:h},spec,0,0,100,120);
  const args=calls.at(-1);assert.ok(Math.abs(args[6]+args[8]-120)<1e-8,`${id} feet must stay at 120`);
  assert.ok(args[8]>=108,`${id} should not shrink into its transparent source margins`);
 }
});

test('ordinary item inset keeps the existing centered placement',()=>{
 const calls=[],ctx={drawImage(...args){calls.push(args);}};
 drawSprite(ctx,{width:900,height:600},spriteSpec('tea-2'),10,20,80,100);
 const [,sx,sy,sw,sh,dx,dy,dw,dh]=calls[0];
 assert.equal(sx,337.5);assert.equal(sy,37.5);assert.equal(sw,225);assert.equal(sh,225);
 assert.equal(dx,10);assert.equal(dy,30);assert.equal(dw,80);assert.equal(dh,80);
});
