import fs from 'node:fs/promises';import {runCampaign} from './campaign.mjs';
const r=runCampaign(20261007,{collectAll:true,gallery:true});
await fs.writeFile(new URL('../qa/gallery-session.json',import.meta.url),JSON.stringify({method:'Built through the same legal-action solver, adding postgame collection actions; no inventory injection.',seed:r.seed,calls:r.calls,produce:r.produce,merge:r.merge,state:r.final},null,2));
console.log('Gallery session from legal actions:',{stage:r.renovations,seen:r.seen,produce:r.produce,merge:r.merge,inventory:r.final.board.filter(t=>t?.k==='item').length,storage:r.final.storage.length});
