/** Tap and drop share exact matching rules; non-matching drops keep the source in place. */
export function boardDropIntent(board,from,to){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from===to)return {kind:'none'};
 const source=board[from],target=board[to];
 return source?.k==='item'&&!source.dust&&target?.k==='item'&&source.c===target.c&&source.l===target.l&&source.l<6?{kind:'merge',from,to}:{kind:'none'};
}
export function boardTapIntent(board,selected,index){
 if(!Number.isInteger(index)||index<0||index>=board.length)return {kind:'none'};
 const target=board[index];
 if(target?.k==='gen')return {kind:'produce',index,c:target.c};
 const drop=boardDropIntent(board,selected,index);if(drop.kind==='merge')return drop;
 return {kind:'select',index:target?index:null};
}

/** Crossing the movement threshold starts dragging immediately; a stationary hold also arms it. */
export function createPressHold({x,y,delay=360,threshold=8,onArm=()=>{},schedule=setTimeout,cancel=clearTimeout}={}){
 let armed=false,cancelled=false,ended=false;
 let timer=schedule(()=>{timer=null;if(!ended&&!cancelled&&!armed){armed=true;onArm();}},delay);
 const clear=()=>{if(timer!==null)cancel(timer);timer=null;};
 return {
  move(nextX,nextY){if(!armed&&!cancelled&&!ended&&Math.hypot(nextX-x,nextY-y)>threshold){clear();armed=true;onArm();}return armed&&!ended;},
  release(){clear();const result=ended||cancelled?'cancel':armed?'hold':'tap';ended=true;return result;},
  cancel(){clear();ended=true;cancelled=true;},
  get armed(){return armed&&!ended;},get cancelled(){return cancelled;}
 };
}
