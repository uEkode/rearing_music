/* 底部弹层：内容写进 #sheetPanel，由 #sheet 的 .on 控制显示。
   所有入口都走 showSheet()：换内容、回到顶部、接管焦点、锁住背景滚动；
   closeSheet() 负责收尾并把焦点交还给打开它的元素。 */
(function (MY) {
'use strict';

const S=MY.S;
const ds=MY.ds;
const {$}=MY.ui;

/* 打开前的焦点位置，关闭后归还 */
let lastFocus=null;
let lastFocusSel=null;

/* 触发元素在重渲染后会被替换，记下它的 data-* 以便回查同一位置 */
function triggerSelector(el){
  if(!el||!el.dataset)return null;
  const keys=Object.keys(el.dataset);
  if(!keys.length)return null;
  const k=keys[0], v=String(el.dataset[k]);
  return (v==='1'||v==='')?`[data-${k}]`:`[data-${k}="${v.replace(/"/g,'\\"')}"]`;
}

function focusables(root){
  return [...root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
    .filter(el=>!el.disabled&&el.offsetParent!==null);
}

/* 统一打开方式：换内容 → 回到顶部 → 显示 → 焦点移入 → 锁住背景滚动 */
function showSheet(html){
  const sheet=$('sheet');
  const panel=$('sheetPanel');
  lastFocus=document.activeElement;
  lastFocusSel=triggerSelector(lastFocus);
  panel.innerHTML=html;
  panel.scrollTop=0;
  sheet.classList.add('on');
  sheet.removeAttribute('inert');
  const scroll=$('scroll');
  if(scroll)scroll.classList.add('locked');
  panel.focus({preventScroll:true});
}

/* 只收起，不重渲染：重置演示等场景自己会处理随后的渲染 */
function hideSheet(){
  const sheet=$('sheet');
  if(!sheet||!sheet.classList.contains('on'))return false;
  sheet.classList.remove('on');
  sheet.setAttribute('inert','');
  const scroll=$('scroll');
  if(scroll)scroll.classList.remove('locked');
  return true;
}

/* 统一关闭方式：收弹层 → 重渲染页面并还原背景滚动位置 → 焦点还给原位置 */
function closeSheet(){
  if(!hideSheet())return;
  const panel=$('sheetPanel');
  if(panel)panel.scrollTop=0;
  const scroll=$('scroll');
  const top=scroll?scroll.scrollTop:0;
  MY.app.render();
  if(scroll)scroll.scrollTop=top;
  /* 关闭会重建 #scroll，原触发元素通常已被替换，按位置回查同一个入口 */
  let back=(lastFocus&&lastFocus.isConnected)?lastFocus:null;
  if(!back&&lastFocusSel)back=document.querySelector(lastFocusSel);
  if(back)back.focus({preventScroll:true});
  else{
    const nav=document.querySelector('.nav .navbtn.on');
    if(nav)nav.focus({preventScroll:true});
  }
  lastFocusSel=null;
}

/* 弹层内的键盘行为：Esc 关闭，Tab 在面板内循环 */
document.addEventListener('keydown',e=>{
  const sheet=$('sheet');
  if(!sheet||!sheet.classList.contains('on'))return;
  if(e.key==='Escape'){closeSheet();e.preventDefault();return;}
  if(e.key!=='Tab')return;
  const panel=$('sheetPanel');
  const items=focusables(panel);
  if(!items.length)return;
  const first=items[0], last=items[items.length-1];
  if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}
  else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}
});

/* ---------- 消息推送设置 ---------- */
function pushSheetHTML(){
  const p=S.pushCfg;
  const cfg=ds.pushConfig();
  const row=(k,ic,t,d,on)=>`
    <div class="mrow">
      <div class="ic" aria-hidden="true">${ic}</div>
      <div class="tx"><b>${t}</b>${d?`<small>${d}</small>`:''}</div>
      <button type="button" class="sw ${on?'on':''}" role="switch" aria-checked="${!!on}" data-pcfg="${k}" aria-label="${t}"></button>
    </div>`;
  return `<button type="button" class="close" data-close="1" aria-label="关闭">✕</button>
    <h3 id="sheetTitle">消息推送设置</h3>
    <p style="margin:0 0 16px;font-size:12px;color:var(--mute)">决定哪些情况会主动提醒你</p>
    <div class="pbody">
    <div class="grp">总开关</div>
    <div class="mrow">
      <div class="ic" aria-hidden="true">🔔</div>
      <div class="tx"><b>${cfg.master.title}</b><small>${cfg.master.desc}</small></div>
      <button type="button" class="sw ${S.push?'on':''}" role="switch" aria-checked="${S.push}" data-push="1" aria-label="${cfg.master.title}"></button>
    </div>
    ${cfg.groups.map(g=>`<div class="grp">${g.title}</div>
    ${g.rows.map(r=>row(r[0],r[1],r[2],r[3],p[r[0]])).join('')}`).join('')}
    <div class="grp">免打扰时段</div>
    ${row(cfg.dnd.key,cfg.dnd.ic,cfg.dnd.title,cfg.dnd.desc,p[cfg.dnd.key])}
    <div class="timepick">
      <div><small>开始</small><input type="time" class="dndtime" data-dnd="start" value="${p.dndStart}" aria-label="免打扰开始时间"></div>
      <span aria-hidden="true">→</span>
      <div><small>结束</small><input type="time" class="dndtime" data-dnd="end" value="${p.dndEnd}" aria-label="免打扰结束时间"></div>
    </div>

    <div class="grp">提醒强度</div>
    <div class="chips" style="margin-bottom:14px">
      ${cfg.levels.map(x=>
        `<button type="button" class="chip ${p.level===x[0]?'on':''}" data-plevel="${x[0]}" aria-pressed="${p.level===x[0]}">${x[1]}</button>`).join('')}
    </div>

    <div class="tip" style="margin:4px 0 8px"><span>◖</span>
      <span>${cfg.tip}</span></div>
    </div>
    <div class="sticky"><button type="button" class="btn" data-close="1">完成</button></div>`;
}

function openPushSheet(){showSheet(pushSheetHTML())}

MY.sheets={showSheet,closeSheet,hideSheet,openPushSheet};

})(window.MY=window.MY||{});
