/* 启动入口：首屏渲染、首次使用说明、重置演示、返回键与退出保存。
   本文件必须最后加载。 */
(function (MY) {
'use strict';

const S=MY.S;
const ds=MY.ds;
const {$}=MY.ui;
const {go,render}=MY.app;
const {stopTimer}=MY.player;
const {saveDemo}=MY;
const {toast}=MY.ui;
const initialDemoState=MY.initialDemoState;

/* 页面标题与顶部演示条也来自数据源，避免和演示数据两套口径 */
document.title=ds.app().title;
document.querySelector('.demo-strip span').textContent=ds.app().strip;

render();
if(!S.seenNotice){
  S.seenNotice=true;
  MY.sheets.showSheet(`<button type="button" class="close" data-close="1" aria-label="关闭">✕</button>
    <h3>开始前请知悉</h3>
    <p style="margin:0 0 14px;font-size:12px;color:var(--mute)">本工具的使用边界</p>
    <div style="background:var(--amber-l);border-radius:12px;padding:14px;font-size:12.5px;
      line-height:1.75;color:#7A5A2A">${ds.copy().disclaimer}</div>
    <button type="button" class="btn" data-close="1" style="margin-top:14px">我知道了</button>`);
}

document.getElementById('resetDemo').addEventListener('click',()=>{
  if(!window.confirm('重置本机演示进度？本机的模拟处理记录和设置将恢复初始状态。'))return;
  stopTimer();Object.assign(S,JSON.parse(JSON.stringify(initialDemoState)));
  S.seenNotice=true;MY.sheets.hideSheet();
  saveDemo();render();toast('已恢复初始演示场景');
});
document.addEventListener('click',()=>setTimeout(saveDemo,0));
window.addEventListener('pagehide',saveDemo);
window.demoBack=()=>{
  if($('sheet').classList.contains('on')){MY.sheets.closeSheet();return true}
  if(S.page!=='home'){go('home');return true}
  return false;
};
saveDemo();

})(window.MY=window.MY||{});
