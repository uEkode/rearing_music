/* 首页：圈舍总览。返回 HTML 字符串，由 app.render() 放进 #scroll。 */
(function (MY) {
'use strict';

const S=MY.S;
const ds=MY.ds;
const {unreadBadge}=MY.ui;

function viewHome(){
  const m=ds.metrics(), copy=ds.copy(), farm=ds.farm();
  const show=S.expandAll?S.barns:S.barns.slice(0,3);
  const s=show.map(b=>{
    const [tn,tc]=ds.statusLabel(b.st);
    const warn=b.st==='high', mild=b.st==='mild';
    return `<div class="barn" data-open="${b.id}">
      <div class="r1"><div><div class="nm">${b.nm}</div>
        <div class="sub">${b.stock} · ${b.desc}</div></div>
        <span class="tag ${tc}">● ${tn}</span></div>
      <div class="dbrow"><b style="color:${warn?'var(--red)':mild?'var(--orange)':b.st==='offline'?'#B9BEB8':'var(--green)'}">${b.db}</b>
        <span class="unit">dB</span><i>· 1小时均值</i></div>
      <div class="tip ${warn?'warn':mild?'':'ok'}"><span>${warn||mild?'!':'◖'}</span><span>${b.tip}</span></div>
      ${b.st==='watch'
        ?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
            <button class="btn ghost" data-recheck="${b.id}">✓ 复测通过</button>
            <button class="btn" data-calm="${b.id}">♫ 再次安抚</button></div>`
        :b.st==='offline'
        ?`<button class="btn ghost" style="border-color:#D9DCD6;color:#9AA09A;cursor:default" disabled>设备离线 · 不可干预</button>`
        :`<button class="btn" data-calm="${b.id}">♫ 快捷安抚</button>`}
    </div>`;
  }).join('');
  return `<div class="hd"><div><h1>圈舍总览</h1><p>${farm.name} · ${farm.area} · 在线${ds.onlineCount()}舍</p></div>
      <div class="iconbtn" data-alert="1">🔔${unreadBadge()?`<span class="badge">${unreadBadge()}</span>`:''}</div></div>
    <div class="stats">
      <div class="stat" data-metric="interv"><div class="k">今日干预次数<span>近7天</span></div>
        <div class="v">${m.interv}<em>次</em><span class="info" data-info="1">ⓘ</span></div>
        <div class="spark">${ds.sparks().interv.map(h=>`<i style="height:${h}%"></i>`).join('')}</div></div>
      <div class="stat" data-metric="db"><div class="k">全场平均分贝<span>近7天</span></div>
        <div class="v">${m.avgDb}<em>dB</em></div>
        <div class="spark">${ds.sparks().db.map(h=>`<i style="height:${h}%"></i>`).join('')}</div></div>
    </div>
    ${S.popInfo?`<div class="pop">${copy.statsNote}</div>`:''}
    <div class="sect"><h2>圈舍状态</h2>
      <span data-expand="1">${S.expandAll?'收起':'查看全部 '+S.barns.length+' 个'}</span></div>
    ${s}
    <div style="height:8px"></div>`;
}

MY.views=MY.views||{};
MY.views.home=viewHome;

})(window.MY=window.MY||{});
