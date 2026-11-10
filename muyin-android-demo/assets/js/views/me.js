/* 我的：账号卡与功能入口（硬件/圈舍/推送/教程/免责声明）。 */
(function (MY) {
'use strict';

const S=MY.S;
const {NAV_ICON}=MY.ui;

function viewMe(){
  const p=S.pushCfg;
  const pushOn=['high','mild','event','offline','daily'].filter(k=>p[k]).length;
  const items=[
    ['▤','硬件管理',`${S.barns.length}台演示设备 · ${S.barns.filter(b=>b.st==='offline').length}台离线`,''],
    ['⌂','圈舍管理','6个圈舍 · 含存栏与设备绑定',''],
    ['🔔','消息推送设置',`${pushOn} 项提醒已开启 · 免打扰 ${p.dnd?p.dndStart+'–'+p.dndEnd:'关闭'}`,''],
    ['▷','新手短视频教程','3分钟学会使用 · 含大字幕',''],
    ['⛨','产品免责边界声明','本工具为辅助参考，不替代兽医诊断','warn']
  ];
  return `<div class="hd"><div><h1>我的</h1><p>账户 · 设备 · 帮助</p></div>
      <div class="iconbtn" data-toast="设置页">⚙</div></div>
    <div class="me"><div class="user" data-toast="账号与授权管理">
      <div class="ava">${NAV_ICON.me}</div>
      <div><b>陈志远</b><span class="role">● 牧场场长</span>
        <p>南岭牧业 · 一号场区 · 已授权6个圈舍</p></div></div></div>
    <div class="sect"><h2>功能与服务</h2><span></span></div>
    ${items.map((it,i)=>`<div class="mi ${it[3]}" data-mi="${i}">
      <div class="ic">${it[0]}</div><div><b>${it[1]}</b><small>${it[2]}</small></div>
      <div class="ar">›</div></div>`).join('')}
    <div style="height:8px"></div>`;
}

MY.views=MY.views||{};
MY.views.me=viewMe;

})(window.MY=window.MY||{});
