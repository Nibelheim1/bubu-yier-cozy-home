import fs from 'node:fs/promises';
import {runCampaign} from './campaign.mjs';
import {VERSION} from '../src/data.mjs';
// One ordinary campaign. Solver waiting is not a human play-time benchmark.
const run=runCampaign(20261009,{collectAll:false});
const evidence={appVersion:VERSION,schema:run.final.schema,method:'One standard fresh campaign through public legal actions. No resource injection. Virtual waiting is not human play time.',seed:run.seed,mode:run.mode,calls:run.calls,orders:run.orders,renovations:run.renovations,produce:run.produce,merge:run.merge,coins:run.coins,energy:run.energy,seen:run.seen,producerLessons:run.final.producerLessons,firstVisit:run.final.tea.firstVisit,log:run.log};
await fs.mkdir(new URL('../qa/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../qa/v1.4-campaign.json',import.meta.url),JSON.stringify(evidence,null,2));
await fs.writeFile(new URL('../qa/v1.4-campaign-checkpoints.json',import.meta.url),JSON.stringify(run.checkpoints,null,2));
console.log(JSON.stringify({...evidence,log:undefined},null,2));
