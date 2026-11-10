/* 底部弹层：内容写进 #sheetPanel，由 #sheet 的 .on 控制显示。
   所有入口都走 showSheet()，保证换内容时滚动条回到顶部。 */
(function (MY) {
'use strict';

const S=MY.S;
const ds=MY.ds;
const {$}=MY.ui;

/* 统一打开方式：换内容 → 回到顶部 → 显示 */
function showSheet(html){
  const panel=$('sheetPanel');
  panel.innerHTML=html;
  panel.scrollTop=0;
  $('sheet').classList.add('on');
}

/* 统一关闭方式：收弹层后重渲染页面，并还原背景列表原来的滚动位置
   （render 会重建 #scroll，内容高度变化时滚动位置会变）。 */
function closeSheet(){
  const panel=$('sheetPanel');
  if(panel)panel.scrollTop=0;
  $('sheet').classList.remove('on');
  const scroll=$('scroll');
  const top=scroll?scroll.scrollTop:0;
  MY.app.render();
  if(scroll)scroll.scrollTop=top;
}

/* ---------- 消息推送设置 ---------- */
function pushSheetHTML(){
  const p=S.pushCfg;
  const cfg=ds.pushConfig();
  const row=(k,ic,t,d,on)=>`
    <div class="mrow">
      <div class="ic">${ic}</div>
      <div class="tx"><b>${t}</b>${d?`<small>${d}</small>`:''}</div>
      <div class="sw ${on?'on':''}" data-pcfg="${k}"></div>
    </div>`;
  return `<div class="close" data-close="1">✕</div>
    <h3>消息推送设置</h3>
    <p style="margin:0 0 16px;font-size:12px;color:var(--mute)">决定哪些情况会主动提醒你</p>
    <div class="pbody">
    <div class="grp">总开关</div>
    <div class="mrow">
      <div class="ic">🔔</div>
      <div class="tx"><b>${cfg.master.title}</b><small>${cfg.master.desc}</small></div>
      <div class="sw ${S.push?'on':''}" data-push="1"></div>
    </div>
    ${cfg.groups.map(g=>`<div class="grp">${g.title}</div>
    ${g.rows.map(r=>row(r[0],r[1],r[2],r[3],p[r[0]])).join('')}`).join('')}
    <div class="grp">免打扰时段</div>
    ${row(cfg.dnd.key,cfg.dnd.ic,cfg.dnd.title,cfg.dnd.desc,p[cfg.dnd.key])}
    <div class="timepick">
      <div><small>开始</small><b>${p.dndStart}</b></div>
      <span>→</span>
      <div><small>结束</small><b>${p.dndEnd}</b></div>
      <button class="btn sm ghost" data-pdnd="1">调整</button>
    </div>

    <div class="grp">提醒强度</div>
    <div class="chips" style="margin-bottom:14px">
      ${cfg.levels.map(x=>
        `<div class="chip ${p.level===x[0]?'on':''}" data-plevel="${x[0]}">${x[1]}</div>`).join('')}
    </div>

    <div class="tip" style="margin:4px 0 8px"><span>◖</span>
      <span>${cfg.tip}</span></div>
    </div>
    <div class="sticky"><button class="btn" data-close="1">完成</button></div>`;
}

function openPushSheet(){showSheet(pushSheetHTML())}

MY.sheets={showSheet,closeSheet,openPushSheet};

})(window.MY=window.MY||{});
