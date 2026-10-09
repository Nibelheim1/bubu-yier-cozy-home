import {ACTOR_BOUNDS} from './actor-bounds.mjs';
/** Atlas lookup preserves the gameplay's item IDs. Each sheet has six square slots. */
const SPRITE_CATEGORIES = ['clean','tools','bake','tea','craft','garden'];
const atlasSlot = (asset, index) => ({asset, cols:3, rows:2, col:index%3, row:Math.floor(index/3), slotAspect:1, fit:'contain', inset:['atlas-tea','atlas-decor-b'].includes(asset)?0.125:0});

export function spriteSpec(id) {
  if (typeof id !== 'string') return null;
  const actorBounds=ACTOR_BOUNDS[id];
  if(actorBounds){
    const motion=/^(bubu|yier)-(walk[1-4]|handover[1-3]|support[1-2])$/.exec(id),guest=/^xiaoli-(idle|wave|walk[1-4]|sit|receive|hold)$/.exec(id);
    const spec=motion?motionSlot(`atlas-${motion[1]}-motion`,['walk1','walk2','walk3','walk4','handover1','handover2','handover3','support1','support2'].indexOf(motion[2])):guest?motionSlot('atlas-xiaoli',['idle','wave','walk1','walk2','walk3','walk4','sit','receive','hold'].indexOf(guest[1])):{asset:id,cols:1,rows:1,col:0,row:0,slotAspect:actorBounds.slotAspect};
    return {...spec,slotAspect:actorBounds.slotAspect,bounds:actorBounds.bounds,grounded:true};
  }
  const motion = /^(bubu|yier)-(walk[1-4]|handover[1-3]|support[1-2])$/.exec(id);
  if (motion) return motionSlot(`atlas-${motion[1]}-motion`, ['walk1','walk2','walk3','walk4','handover1','handover2','handover3','support1','support2'].indexOf(motion[2]));
  const guest = /^xiaoli-(idle|wave|walk[1-4]|sit|receive|hold)$/.exec(id);
  if (guest) return motionSlot('atlas-xiaoli', ['idle','wave','walk1','walk2','walk3','walk4','sit','receive','hold'].indexOf(guest[1]));
  const prop = /^prop-(watering-can|clip|tea-cloth|coaster|postcard|wind-chime)$/.exec(id);
  if (prop) return atlasSlot('atlas-tea-props', ['watering-can','clip','tea-cloth','coaster','postcard','wind-chime'].indexOf(prop[1]));
  const item = /^(clean|tools|bake|tea|craft|garden)-([1-6])$/.exec(id);
  if (item) return atlasSlot(`atlas-${item[1]}`, Number(item[2])-1);
  const generator = /^gen-(clean|tools|bake|tea|craft|garden)$/.exec(id);
  if (generator) return atlasSlot('atlas-generators', SPRITE_CATEGORIES.indexOf(generator[1]));
  const decor = /^decor-?(\d{2})$/.exec(id);
  if (decor) {
    const index = Number(decor[1])-1;
    if (index >= 0 && index < 24) return atlasSlot(`atlas-decor-${'abcd'[Math.floor(index/6)]}`, index%6);
  }
  return null;
}

const motionSlot = (asset,index) => ({asset,cols:3,rows:3,col:index%3,row:Math.floor(index/3),slotAspect:1,fit:'contain',inset:0});

export function spriteContentRect(spec){const inset=spec?.inset||0;const [x,y,w,h]=spec?.bounds||[inset,inset,1-2*inset,1-2*inset];return {x,y,w,h};}

/** Display a slot's center, omitting specified transparent margins without editing PNGs. */
export function drawSprite(ctx, image, spec, x, y, w, h) {
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  if (!iw || !ih || w <= 0 || h <= 0) return;
  const cols = spec?.cols || 1, rows = spec?.rows || 1;
  const slotW = iw / cols, slotH = ih / rows, content=spriteContentRect(spec);
  const sw = slotW * content.w, sh = slotH * content.h;
  const ratio = Math.min(w / sw, h / sh);
  const dw = sw * ratio, dh = sh * ratio;
  ctx.drawImage(image, ((spec?.col || 0)+content.x)*slotW, ((spec?.row || 0)+content.y)*slotH, sw, sh,
    x+(w-dw)/2, y+(spec?.grounded?h-dh:(h-dh)/2), dw, dh);
}

export const SPRITE_ATLAS_IDS = [
  ...SPRITE_CATEGORIES.map(c=>`atlas-${c}`), 'atlas-generators',
  ...Array.from('abcd', letter=>`atlas-decor-${letter}`),
  'atlas-bubu-motion','atlas-yier-motion','atlas-xiaoli','atlas-tea-props',
];
export const WORLD_ASSET_IDS = ['region-house','region-garden','region-courtyard','region-house-night','region-garden-night','region-courtyard-night','world-map','party-memory','yier-rest'];

export {describeScene,freezeScene,renderSceneHTML,drawSceneCanvas,describeWorldMap,renderWorldOverlays,createScenePlayer,SCENE_STYLES,decorPlacement,decorBounds} from './scenes.mjs';
