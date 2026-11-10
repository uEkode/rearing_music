/* 启动入口：首屏渲染、首次使用说明、重置演示、返回键与退出保存。
   本文件必须最后加载。 */
(function (MY) {
'use strict';

const S=MY.S;
const {$}=MY.ui;
const {go,render}=MY.app;
const {stopTimer}=MY.player;
const {saveDemo}=MY;
const {toast}=MY.ui;
const initialDemoState=MY.initialDemoState;

render();
if(!S.seenNotice){
  S.seenNotice=true;
  $('sheetPanel').innerHTML=`<div class="close" data-close="1">✕</div>
    <h3>开始前请知悉</h3>
    <p style="margin:0 0 14px;font-size:12px;color:var(--mute)">本工具的使用边界</p>
    <div style="background:var(--amber-l);border-radius:12px;padding:14px;font-size:12.5px;
      line-height:1.75;color:#7A5A2A">
      本工具输出的分贝值、音乐干预建议与应激判定，<b>仅作为牧场辅助参考</b>，
      不构成兽医诊断依据，也不替代现场人工观察。<br><br>
      · 当前分贝、识别和效益数据均为演示数据<br>
      · 当前不接入真实 AI、设备及系统消息推送<br>
      · 出现连续应激或牲畜异常行为，请立即人工介入</div>
    <button class="btn" data-close="1" style="margin-top:14px">我知道了</button>`;
  $('sheet').classList.add('on');
}

document.getElementById('resetDemo').addEventListener('click',()=>{
  if(!window.confirm('重置本机演示进度？本机的模拟处理记录和设置将恢复初始状态。'))return;
  stopTimer();Object.assign(S,JSON.parse(JSON.stringify(initialDemoState)));
  S.seenNotice=true;document.getElementById('sheet').classList.remove('on');
  saveDemo();render();toast('已恢复初始演示场景');
});
document.addEventListener('click',()=>setTimeout(saveDemo,0));
window.addEventListener('pagehide',saveDemo);
window.demoBack=()=>{
  if(document.getElementById('sheet').classList.contains('on')){document.getElementById('sheet').classList.remove('on');return true}
  if(S.page!=='home'){go('home');return true}
  return false;
};
saveDemo();

})(window.MY=window.MY||{});
