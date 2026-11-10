/* 页面骨架：路由（go）、整页渲染（render）。
   每个页面只返回 HTML 字符串，render 负责把它放进 #scroll，并同步迷你播放条与底部导航。 */
(function (MY) {
'use strict';

const S=MY.S;
const {$,fmt,NAV_ICON}=MY.ui;
const {saveDemo}=MY;

function go(p){
  // 音频持续播放：切页不中断，计时器继续跑，迷你条实时更新
  S.page=p;render();$('scroll').scrollTop=0}
function setTab(p){go(p)}

function render(){
  saveDemo();
  const v={home:MY.views.home,music:MY.views.music,events:MY.views.events,me:MY.views.me}[S.page]();
  $('scroll').innerHTML=v;
  $('mini').innerHTML=(S.playing&&S.page!=='music')?`<div class="mini">
      <div class="mi-t"><b>${S.track.nm}</b><small>${S.track.s}</small></div>
      <div class="mi-p"><span id="miniTime">${fmt(S.track.pos)}</span> / ${fmt(S.track.dur)}</div>
      <div class="mi-b" data-miniplay="1">❚❚</div>
    </div>`:'';
  const navs=[['home','首页'],['music','干预'],['events','事件'],['me','我的']];
  $('nav').innerHTML=navs.map(n=>`<div class="${S.page===n[0]?'on':''}" data-tab="${n[0]}">
    <span class="gi">${NAV_ICON[n[0]]}</span>${n[1]}</div>`).join('');
}

MY.app={go,setTab,render};

})(window.MY=window.MY||{});
