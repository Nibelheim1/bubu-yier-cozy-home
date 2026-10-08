import fs from 'node:fs/promises';import {runCampaign} from './campaign.mjs';
const run=runCampaign(20261007,{collectAll:true});
await fs.mkdir(new URL('../qa/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../qa/campaign-full.json',import.meta.url),JSON.stringify(run,null,2));
await fs.writeFile(new URL('../qa/campaign-checkpoints.json',import.meta.url),JSON.stringify(run.checkpoints,null,2));
const trials=[];
for(let i=1;i<=100;i++){
 const r=runCampaign(i*7919);trials.push({seed:r.seed,mode:r.mode,produces:r.produce,merges:r.merge,waitSeconds:r.waitSeconds,virtualSeconds:r.virtualSeconds,coins:r.coins,energy:r.energy,renovations:r.renovations});
}
const calm=runCampaign(42,{calm:true,collectAll:true});
const result={campaigns:trials.length,passed:trials.filter(t=>t.renovations===24).length,standard:{minProduce:Math.min(...trials.map(t=>t.produces)),maxProduce:Math.max(...trials.map(t=>t.produces)),maxWaitSeconds:Math.max(...trials.map(t=>t.waitSeconds)),minFinalEnergy:Math.min(...trials.map(t=>t.energy))},calm:{renovations:calm.renovations,discoveries:calm.seen,waitSeconds:calm.waitSeconds},method:'Public legal actions only. Seed selected at initialization. Waiting is advanced on a virtual clock, not claimed as human play time.',trials};
await fs.writeFile(new URL('../qa/simulation-summary.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,trials:undefined},null,2));console.log('Full story + all collection:',{renovations:run.renovations,seen:run.seen,produces:run.produce,merges:run.merge,calls:run.calls});
