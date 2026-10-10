/** Original GIF action catalog. All assets are copied unchanged from the supplied 动作gif folder.
 * durationMs is one complete GIF cycle; callers can repeat short cycles for a readable action.
 * furnitureIds are optional nearby anchors, not unlock requirements: each GIF includes its own props.
 * Composite pair GIFs replace both separate actor images while the interaction is active.
 * Drag variants are selected by who, never by the ambiguous source suffix alone.
 */
export const ACTOR_ACTIONS = [
  {
    "id": "yier-cheer",
    "asset": "actor-motion-yier-cheer",
    "who": "yier",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 360,
    "label": "为布布打call",
    "width": 240,
    "height": 246,
    "loop": 0
  },
  {
    "id": "yier-search",
    "asset": "actor-motion-yier-search",
    "who": "yier",
    "kind": "search",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 1040,
    "label": "人呢",
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "yier-work",
    "asset": "actor-motion-yier-work",
    "who": "yier",
    "kind": "random",
    "regions": [
      "house"
    ],
    "durationMs": 800,
    "label": "工作",
    "furnitureIds": [
      "decor-06"
    ],
    "width": 1000,
    "height": 1000,
    "loop": 0
  },
  {
    "id": "yier-jump",
    "asset": "actor-motion-yier-jump",
    "who": "yier",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 1440,
    "label": "开心蹦跳",
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "yier-fart",
    "asset": "actor-motion-yier-fart",
    "who": "yier",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 640,
    "label": "放屁",
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "yier-recline",
    "asset": "actor-motion-yier-recline",
    "who": "yier",
    "kind": "random",
    "regions": [
      "house"
    ],
    "durationMs": 1710,
    "label": "瘫倒",
    "furnitureIds": [
      "decor-18"
    ],
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "yier-sleep",
    "asset": "actor-motion-yier-sleep",
    "who": "yier",
    "kind": "random",
    "regions": [
      "house"
    ],
    "durationMs": 1200,
    "label": "睡大觉",
    "furnitureIds": [
      "decor-08",
      "decor-18"
    ],
    "width": 500,
    "height": 476,
    "loop": 0
  },
  {
    "id": "yier-pajamas",
    "asset": "actor-motion-yier-pajamas",
    "who": "yier",
    "kind": "random",
    "regions": [
      "house"
    ],
    "durationMs": 1800,
    "label": "睡衣撒娇",
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "yier-swing",
    "asset": "actor-motion-yier-swing",
    "who": "yier",
    "kind": "random",
    "regions": [
      "garden",
      "courtyard"
    ],
    "durationMs": 1530,
    "label": "荡秋千",
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "yier-drag-1",
    "asset": "actor-motion-yier-drag-1",
    "who": "yier",
    "kind": "drag",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 800,
    "label": "被拖动1",
    "width": 640,
    "height": 640,
    "loop": 0
  },
  {
    "id": "yier-drag-2",
    "asset": "actor-motion-yier-drag-2",
    "who": "yier",
    "kind": "drag",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 2550,
    "label": "被拖动2",
    "width": 561,
    "height": 561,
    "loop": 0
  },
  {
    "id": "yier-kick",
    "asset": "actor-motion-yier-kick",
    "who": "yier",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 720,
    "label": "踢腿",
    "width": 566,
    "height": 566,
    "loop": 0
  },
  {
    "id": "yier-exercise",
    "asset": "actor-motion-yier-exercise",
    "who": "yier",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 2160,
    "label": "运动",
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "yier-question",
    "asset": "actor-motion-yier-question",
    "who": "yier",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 700,
    "label": "问号",
    "width": 640,
    "height": 640,
    "loop": 0
  },
  {
    "id": "yier-goose",
    "asset": "actor-motion-yier-goose",
    "who": "yier",
    "kind": "random",
    "regions": [
      "garden",
      "courtyard"
    ],
    "durationMs": 1280,
    "label": "骑鹅冲",
    "width": 240,
    "height": 240,
    "loop": null
  },
  {
    "id": "yier-sneak",
    "asset": "actor-motion-yier-sneak",
    "who": "yier",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 5000,
    "label": "鬼鬼祟祟",
    "width": 640,
    "height": 640,
    "loop": 0
  },
  {
    "id": "pair-kiss",
    "asset": "actor-motion-pair-kiss",
    "who": "pair",
    "kind": "interaction",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 2340,
    "label": "亲亲",
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "pair-hug",
    "asset": "actor-motion-pair-hug",
    "who": "pair",
    "kind": "interaction",
    "regions": [
      "house",
      "courtyard"
    ],
    "durationMs": 1170,
    "label": "壁咚",
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "pair-bonk",
    "asset": "actor-motion-pair-bonk",
    "who": "pair",
    "kind": "interaction",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 60,
    "label": "打布布",
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "pair-cuddle",
    "asset": "actor-motion-pair-cuddle",
    "who": "pair",
    "kind": "interaction",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 1080,
    "label": "贴贴",
    "width": 300,
    "height": 300,
    "loop": 0
  },
  {
    "id": "bubu-cheer",
    "asset": "actor-motion-bubu-cheer",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 360,
    "label": "为一二打call",
    "width": 240,
    "height": 246,
    "loop": 0
  },
  {
    "id": "bubu-watermelon",
    "asset": "actor-motion-bubu-watermelon",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 3060,
    "label": "吃西瓜",
    "furnitureIds": [
      "decor-06",
      "decor-22"
    ],
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "bubu-pudding",
    "asset": "actor-motion-bubu-pudding",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 240,
    "label": "吹小布丁",
    "furnitureIds": [
      "decor-06",
      "decor-22"
    ],
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "bubu-sing",
    "asset": "actor-motion-bubu-sing",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 300,
    "label": "唱歌",
    "width": 640,
    "height": 640,
    "loop": 0
  },
  {
    "id": "bubu-work",
    "asset": "actor-motion-bubu-work",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "house"
    ],
    "durationMs": 800,
    "label": "工作",
    "furnitureIds": [
      "decor-06"
    ],
    "width": 1000,
    "height": 1000,
    "loop": 0
  },
  {
    "id": "bubu-eat",
    "asset": "actor-motion-bubu-eat",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 3060,
    "label": "干饭",
    "furnitureIds": [
      "decor-06",
      "decor-22"
    ],
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "bubu-laundry",
    "asset": "actor-motion-bubu-laundry",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "courtyard"
    ],
    "durationMs": 600,
    "label": "洗衣服",
    "width": 639,
    "height": 580,
    "loop": 0
  },
  {
    "id": "bubu-play",
    "asset": "actor-motion-bubu-play",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "house"
    ],
    "durationMs": 720,
    "label": "玩耍",
    "furnitureIds": [
      "decor-08",
      "decor-18"
    ],
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "bubu-recline",
    "asset": "actor-motion-bubu-recline",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "house"
    ],
    "durationMs": 1710,
    "label": "瘫倒",
    "furnitureIds": [
      "decor-18"
    ],
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "bubu-doze",
    "asset": "actor-motion-bubu-doze",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 400,
    "label": "站着睡着了",
    "width": 283,
    "height": 304,
    "loop": 0
  },
  {
    "id": "bubu-swing",
    "asset": "actor-motion-bubu-swing",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "garden",
      "courtyard"
    ],
    "durationMs": 1530,
    "label": "荡秋千",
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "bubu-drag-1",
    "asset": "actor-motion-bubu-drag-1",
    "who": "bubu",
    "kind": "drag",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 2550,
    "label": "被拖动1",
    "width": 566,
    "height": 566,
    "loop": 0
  },
  {
    "id": "bubu-drag-2",
    "asset": "actor-motion-bubu-drag-2",
    "who": "bubu",
    "kind": "drag",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 1000,
    "label": "被拖动2",
    "width": 424,
    "height": 424,
    "loop": 0
  },
  {
    "id": "bubu-kick",
    "asset": "actor-motion-bubu-kick",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "house",
      "garden",
      "courtyard"
    ],
    "durationMs": 720,
    "label": "连环踢",
    "width": 640,
    "height": 640,
    "loop": 0
  },
  {
    "id": "bubu-rocking-horse",
    "asset": "actor-motion-bubu-rocking-horse",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "garden",
      "courtyard"
    ],
    "durationMs": 2400,
    "label": "骑木马玩耍",
    "width": 240,
    "height": 240,
    "loop": 0
  },
  {
    "id": "bubu-goose",
    "asset": "actor-motion-bubu-goose",
    "who": "bubu",
    "kind": "random",
    "regions": [
      "garden",
      "courtyard"
    ],
    "durationMs": 1280,
    "label": "骑鹅冲",
    "width": 240,
    "height": 240,
    "loop": 0
  }
];
export const ACTOR_ACTION_ASSET_IDS = ACTOR_ACTIONS.map(action => action.asset);
