/* 底部弹层：消息推送设置。
   内容写进 #sheetPanel，再给 #sheet 加 .on 显示。 */
(function (MY) {
'use strict';

const S=MY.S;
const {$}=MY.ui;

/* ---------- 消息推送设置 ---------- */
function openPushSheet(){
  const p=S.pushCfg;
  const row=(k,ic,t,d,on,extra='')=>`
    <div class="mrow">
      <div class="ic ${extra}">${ic}</div>
      <div class="tx"><b>${t}</b>${d?`<small>${d}</small>`:''}</div>
      <div class="sw ${on?'on':''}" data-pcfg="${k}"></div>
    </div>`;
  $('sheetPanel').innerHTML=`<div class="close" data-close="1">✕</div>
    <h3>消息推送设置</h3>
    <p style="margin:0 0 16px;font-size:12px;color:var(--mute)">决定哪些情况会主动提醒你</p>
    <div class="pbody">
    <div class="grp">应激事件提醒</div>
    ${row('high','!','高度应激告警','分贝持续 ≥ 80 dB 时立即推送',p.high)}
    ${row('mild','~','轻度应激提醒','60–80 dB 区间，每日汇总一次',p.mild)}
    ${row('event','▤','事件处理提醒','有事件被他人处理时通知',p.event)}

    <div class="grp">设备与系统</div>
    ${row('offline','▣','设备离线提醒','声压设备断连时推送',p.offline)}
    ${row('daily','◷','每日数据摘要','每天 07:00 推送昨日干预效果',p.daily)}

    <div class="grp">免打扰时段</div>
    ${row('dnd','☾','夜间免打扰','开启后该时段仅保留高度应激告警',p.dnd)}
    <div class="timepick">
      <div><small>开始</small><b>${p.dndStart}</b></div>
      <span>→</span>
      <div><small>结束</small><b>${p.dndEnd}</b></div>
      <button class="btn sm ghost" data-pdnd="1">调整</button>
    </div>

    <div class="grp">提醒强度</div>
    <div class="chips" style="margin-bottom:14px">
      ${[['light','仅角标'],['normal','角标+振动'],['full','角标+振动+声音']].map(x=>
        `<div class="chip ${p.level===x[0]?'on':''}" data-plevel="${x[0]}">${x[1]}</div>`).join('')}
    </div>

    <div class="tip" style="margin:4px 0 8px"><span>◖</span>
      <span>关闭全部提醒后，首页铃铛仍会显示待处理数量，但不再推送系统通知。</span></div>
    </div>
    <div class="sticky"><button class="btn" data-close="1">完成</button></div>`;
  $('sheet').classList.add('on');
}

MY.sheets={openPushSheet};

})(window.MY=window.MY||{});
