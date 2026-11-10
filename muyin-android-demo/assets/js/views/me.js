/* 我的：账号卡与功能入口（硬件/圈舍/推送/教程/免责声明）。 */
(function (MY) {
'use strict';

const S=MY.S;
const ds=MY.ds;
const {NAV_ICON}=MY.ui;

function viewMe(){
  const p=S.pushCfg;
  const pushOn=['high','mild','event','offline','daily'].filter(k=>p[k]).length;
  const user=ds.user(), farm=ds.farm();
  /* 描述里含实时状态的入口在这里生成，其余用数据源里的固定文案 */
  const descOf={
    hardware:`${S.barns.length}台演示设备 · ${S.barns.filter(b=>b.st==='offline').length}台离线`,
    barns:`${S.barns.length}个圈舍 · 含存栏与设备绑定`,
    push:`${pushOn} 项提醒已开启 · 免打扰 ${p.dnd?p.dndStart+'–'+p.dndEnd:'关闭'}`
  };
  return `<div class="hd"><div><h1>我的</h1><p>账户 · 设备 · 帮助</p></div>
      <button type="button" class="iconbtn" data-toast="设置页" aria-label="设置">⚙</button></div>
    <div class="me"><button type="button" class="user" data-toast="账号与授权管理">
      <div class="ava" aria-hidden="true">${NAV_ICON.me}</div>
      <div><b>${user.name}</b><span class="role">● ${user.role}</span>
        <p>${farm.name} · ${farm.area} · 已授权${S.barns.length}个圈舍</p></div></button></div>
    <div class="sect"><h2>功能与服务</h2><span></span></div>
    ${ds.meItems().map(it=>`<button type="button" class="mi ${it.warn?'warn':''}" data-mi="${it.key}">
      <div class="ic" aria-hidden="true">${it.ic}</div><div><b>${it.title}</b><small>${descOf[it.key]||it.desc}</small></div>
      <div class="ar" aria-hidden="true">›</div></button>`).join('')}
    <div style="height:8px"></div>`;
}

MY.views=MY.views||{};
MY.views.me=viewMe;

})(window.MY=window.MY||{});
