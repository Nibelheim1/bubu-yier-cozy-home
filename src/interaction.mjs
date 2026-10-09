/** Tap selects; only an exact pair requests a merge. Moving belongs to a held drag. */
export function boardTapIntent(board,selected,index){
 if(!Number.isInteger(index)||index<0||index>=board.length)return {kind:'none'};
 const target=board[index],source=board[selected];
 if(target?.k==='gen')return {kind:'produce',index,c:target.c};
 if(selected!==null&&selected!==index&&source?.k==='item'&&!source.dust&&target?.k==='item'&&source.c===target.c&&source.l===target.l&&source.l<6)return {kind:'merge',from:selected,to:index};
 return {kind:'select',index:target?index:null};
}

/** A swipe before the hold threshold cancels dragging; release/cancel always clear the timer. */
export function createPressHold({x,y,delay=360,threshold=8,onArm=()=>{},schedule=setTimeout,cancel=clearTimeout}={}){
 let armed=false,cancelled=false,ended=false;
 let timer=schedule(()=>{timer=null;if(!ended&&!cancelled){armed=true;onArm();}},delay);
 const clear=()=>{if(timer!==null)cancel(timer);timer=null;};
 return {
  move(nextX,nextY){if(!armed&&!cancelled&&Math.hypot(nextX-x,nextY-y)>threshold){cancelled=true;clear();}return armed&&!ended;},
  release(){clear();const result=ended||cancelled?'cancel':armed?'hold':'tap';ended=true;return result;},
  cancel(){clear();ended=true;cancelled=true;},
  get armed(){return armed&&!ended;},get cancelled(){return cancelled;}
 };
}
