/* 模拟播放器：计时、进度绘制、播放结束后的状态收尾。
   本版不播放真实音频，计时器只驱动演示进度。 */
(function (MY) {
'use strict';

const S=MY.S;
const barn=MY.barn;
const {$}=MY.ui;
const {fmt,toast}=MY.ui;

let playTimer=null;

function startTimer(){
  stopTimer();
  playTimer=setInterval(()=>{
    if(!S.playing){stopTimer();return}
    S.track.pos+=1;
    if(S.track.pos>=S.track.dur){
      S.track.pos=S.track.dur;
      S.playing=false;
      stopTimer();
      finishPlayback();
      MY.app.render();
      return;
    }
    paintProgress();
    if(S.page!=='music'){
      // 后台播放时刷新迷你条上的时间
      const mt=$('miniTime');
      if(mt)mt.textContent=fmt(S.track.pos);
    }
  },1000);
}
function stopTimer(){if(playTimer){clearInterval(playTimer);playTimer=null}}

/* 只更新进度条与时间文字，不整页重渲染（否则会打断拖动） */
function paintProgress(){
  const bar=$('seekBar');
  const mt=$('miniTime');
  if(mt)mt.textContent=fmt(S.track.pos);
  if(!bar)return;
  const pct=S.track.pos/S.track.dur*100;
  bar.querySelector('i').style.width=pct+'%';
  bar.querySelector('.knob').style.left=pct+'%';
  const tip=bar.querySelector('.seektip');
  if(tip)tip.style.left=pct+'%';
  const tm=$('timeCur');
  if(tm)tm.textContent=fmt(S.track.pos);
}

/* 干预结束的统一收尾：事件转已处理 + 圈舍转恢复观察 */
function finishPlayback(){
  const ev=S.events.find(x=>x.b===S.target&&x.st==='proc');
  if(ev){ev.st='done';ev.note=ev.note.replace(/。$/,'')+`。干预时长 ${fmt(S.track.dur)}，待复测。`}
  const b=barn(S.target);
  if(b){b.st='watch';b.tip=MY.ds.copy().doneTip}
  toast('干预已结束 · 事件转为「已处理」');
}

MY.player={startTimer,stopTimer,paintProgress,finishPlayback};

})(window.MY=window.MY||{});
