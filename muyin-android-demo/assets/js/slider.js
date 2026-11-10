/* 滑块：播放进度（#seekBar）与音量（#volBar）共用。
   支持鼠标/触摸拖动与键盘方向键；改动时只更新局部 DOM，不整页重渲染。 */
(function (MY) {
'use strict';

const S=MY.S;
const {$}=MY.ui;
const {fmt,VOL_ICON}=MY.ui;

let drag=null;

/* 滑块定位：两端吸附，保证 0% 和 100% 可达 */
function sliderPos(el,clientX){
  const r=el.getBoundingClientRect();
  const ratio=(clientX-r.left)/r.width;
  if(ratio<=0.015)return 0;
  if(ratio>=0.985)return 1;
  return Math.max(0,Math.min(1,ratio));
}

function setVol(v){
  S.vol=Math.max(0,Math.min(100,Math.round(v)));
  const bar=$('volBar');
  if(bar){
    bar.querySelector('i').style.width=S.vol+'%';
    bar.querySelector('.knob').style.left=S.vol+'%';
    bar.setAttribute('aria-valuenow',String(S.vol));
    bar.setAttribute('aria-valuetext',S.vol+'%');
  }
  const vn=document.querySelector('.vnum');
  if(vn)vn.textContent=S.vol+'%';
  const sp=document.querySelector('.vspk');
  if(sp)sp.innerHTML=VOL_ICON(S.vol);
  const ev=S.events.find(x=>x.b===S.target&&x.st==='proc');
  // 只有真的在播放时才改事件备注，避免没播放就拖动音量把备注改掉
  if(ev&&S.playing)ev.note=`已播放${S.track.nm}，音量${S.vol}%，持续观察中。`;
}

function setSeek(sec){
  S.track.pos=Math.max(0,Math.min(S.track.dur,Math.round(sec)));
  MY.player.paintProgress();
}

function applyVol(el,clientX){setVol(sliderPos(el,clientX)*100)}

function applySeek(el,clientX){
  setSeek(sliderPos(el,clientX)*S.track.dur);
  // 拖动时给出即时反馈，明确这是"跳转到"而非"播放中"
  const tip=document.getElementById('seekTip');
  if(tip){
    tip.textContent=`跳转到 ${fmt(S.track.pos)}`;tip.classList.add('on');
    clearTimeout(tip._h);
    tip._h=setTimeout(()=>tip.classList.remove('on'),1400);
  }
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

/* 键盘操作：方向键微调，PageUp/PageDown 大幅调整，Home/End 到两端 */
document.addEventListener('keydown',e=>{
  const el=e.target;
  if(!el||!el.dataset)return;
  const isVol=el.dataset.vol!==undefined, isSeek=el.dataset.seek!==undefined;
  if(!isVol&&!isSeek)return;
  let step=0;
  if(e.key==='ArrowRight'||e.key==='ArrowUp')step=1;
  else if(e.key==='ArrowLeft'||e.key==='ArrowDown')step=-1;
  else if(e.key==='PageUp')step=6;
  else if(e.key==='PageDown')step=-6;
  else if(e.key==='Home'){isVol?setVol(0):setSeek(0);e.preventDefault();return}
  else if(e.key==='End'){isVol?setVol(100):setSeek(S.track.dur);e.preventDefault();return}
  else return;
  if(isVol)setVol(S.vol+step*5);else setSeek(S.track.pos+step*5);
  e.preventDefault();
});

document.addEventListener('mousedown',onDown);
document.addEventListener('touchstart',onDown,{passive:false});

MY.slider={sliderPos,applyVol,applySeek,setVol,setSeek};

})(window.MY=window.MY||{});
