/* 界面工具：DOM 查询、格式化、Toast、角标计算、图标片段。
   只放与页面无关的通用能力；具体页面在 views/ 里。 */
(function (MY) {
'use strict';

const S=MY.S;
const PUSH_LBL=MY.fixtures.push.labels;

const $=id=>document.getElementById(id);

const pushLabel=k=>PUSH_LBL[k]||k;

/* 角标 = 待处理事件数（「处理中」算未处理），与事件页「待处理」筛选、
   铃铛点击后的列表保持一致；关闭推送总开关后归零。 */
function unreadBadge(){
  if(!S.push)return 0;
  return S.events.filter(e=>e.st!=='done').length;
}

const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('on');
  clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),2300)};

function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0')}

/* 音量图标：按音量档位切换 */
function VOL_ICON(v){
  const wave=v===0?'':(v<40?`<path d="M15.5 8.5a5 5 0 0 1 0 7"/>`:
    v<75?`<path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a9 9 0 0 1 0 12"/>`:
    `<path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a9 9 0 0 1 0 12"/><path d="M21.5 3.5a13 13 0 0 1 0 17"/>`);
  const mute=v===0?`<path d="M16 9.5 21.5 15M21.5 9.5 16 15"/>`:'';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/>
    ${wave}${mute}</svg>`;
}

/* 底部导航图标：统一线性描边风格，全部用 currentColor 跟随文字色 */
const NAV_ICON={
  home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.5 12 3.5l8.5 7"/>
    <path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-5.5h5V20"/></svg>`,
  music:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l10-2v12"/>
    <circle cx="6.5" cy="18" r="2.6"/><circle cx="16.5" cy="16" r="2.6"/></svg>`,
  events:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/>
    <rect x="6" y="11" width="3.2" height="6" rx="1"/><rect x="11.4" y="7" width="3.2" height="10" rx="1"/>
    <rect x="16.8" y="13.5" width="3.2" height="3.5" rx="1"/></svg>`,
  me:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.8"/>
    <path d="M4.8 20c.6-3.9 3.6-6.2 7.2-6.2s6.6 2.3 7.2 6.2"/></svg>`
};

MY.ui={$,fmt,toast,unreadBadge,pushLabel,VOL_ICON,NAV_ICON};

})(window.MY=window.MY||{});
