/* 滑块拖动：播放进度（#seekBar）与音量（#volBar）共用。
   拖动时只更新局部 DOM，不整页重渲染。 */
(function (MY) {
'use strict';

const S=MY.S;
const {$}=MY.ui;
const {fmt,VOL_ICON}=MY.ui;
const {paintProgress}=MY.player;

let drag=null;

/* 滑块定位：两端吸附，保证 0% 和 100% 可达 */
function sliderPos(el,clientX){
  const r=el.getBoundingClientRect();
  const ratio=(clientX-r.left)/r.width;
  if(ratio<=0.015)return 0;
  if(ratio>=0.985)return 1;
  return Math.max(0,Math.min(1,ratio));
}
function applyVol(el,clientX){
  S.vol=Math.round(sliderPos(el,clientX)*100);
  const bar=$('volBar');
  bar.querySelector('i').style.width=S.vol+'%';
  bar.querySelector('.knob').style.left=S.vol+'%';
  const vn=document.querySelector('.vnum');
  if(vn)vn.textContent=S.vol+'%';
  const sp=document.querySelector('.vspk');
  if(sp)sp.innerHTML=VOL_ICON(S.vol);
  const ev=S.events.find(x=>x.b===S.target&&x.st==='proc');
  if(ev)ev.note=`已播放${S.track.nm}，音量${S.vol}%，持续观察中。`;
}
function applySeek(el,clientX){
  S.track.pos=Math.round(sliderPos(el,clientX)*S.track.dur);
  paintProgress();
  // 拖动时给出即时反馈，明确这是"跳转到"而非"播放中"
  const tip=document.getElementById('seekTip');
  if(tip){tip.textContent=`跳转到 ${fmt(S.track.pos)}`;tip.classList.add('on')}
  clearTimeout(tip._h);
  tip._h=setTimeout(()=>tip.classList.remove('on'),1400);
}
function onDown(e){
  const el=e.target.closest('[data-vol],[data-seek]');
  if(!el)return;
  e.preventDefault();
  drag={el,kind:el.dataset.vol?'vol':'seek'};
  if(drag.kind==='vol')applyVol(el,e.clientX);else applySeek(el,e.clientX);
  document.addEventListener('mousemove',onMove);
  document.addEventListener('mouseup',onUp);
  document.addEventListener('touchmove',onMove,{passive:false});
  document.addEventListener('touchend',onUp);
}
function onMove(e){
  if(!drag)return;
  e.preventDefault();
  const x=e.touches?e.touches[0].clientX:e.clientX;
  if(drag.kind==='vol')applyVol(drag.el,x);else applySeek(drag.el,x);
}
function onUp(){
  if(drag&&drag.kind==='seek'&&S.track.pos>=S.track.dur-1){
    S.playing=false;
    MY.player.stopTimer();
    S.track.pos=S.track.dur;
    MY.player.finishPlayback();
    MY.app.render();
  }
  drag=null;
  document.removeEventListener('mousemove',onMove);
  document.removeEventListener('mouseup',onUp);
  document.removeEventListener('touchmove',onMove);
  document.removeEventListener('touchend',onUp);
}

document.addEventListener('mousedown',onDown);
document.addEventListener('touchstart',onDown,{passive:false});

MY.slider={sliderPos,applyVol,applySeek};

})(window.MY=window.MY||{});
