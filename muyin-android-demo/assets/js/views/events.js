/* 事件与数据中心：本周指标、效益演示卡、实时预警事件列表与筛选。 */
(function (MY) {
'use strict';

const S=MY.S;
const ds=MY.ds;

function viewEvents(){
  const m=ds.metrics(), alarm=ds.alarm();
  const fl=ds.eventFilters().map(f=>f[0]==='all'?[f[0],f[1]+' '+S.events.length]:f);
  /* 「处理中」并入待处理：待处理 = 所有未处理事件 */
  const list=S.filt==='all'?S.events
    :S.filt==='pending'?S.events.filter(ds.isOpenEvent)
    :S.events.filter(e=>e.st==='done');
  return `<div class="hd"><div><h1>事件与数据中心</h1><p>近7日 · 全场汇总</p></div></div>
    <button type="button" class="banner" data-alert="1"><b>${alarm.title}</b>
      <p>${alarm.text}</p></button>
    <div class="kpi"><div class="hd2"><h3>本周关键指标</h3><span>较上周</span></div>
      <div class="g2">
        <div class="m"><small>应激事件</small><b>${m.weekEvents}</b><span class="dn">${m.weekTrend}</span></div>
        <div class="m"><small>平均干预时长</small><b>${m.avgIntervMin}<em style="font-size:12px;font-style:normal;font-weight:400"> 分</em></b></div>
      </div>
      <div class="m gold" style="margin-top:10px;display:flex;align-items:center;justify-content:space-between">
        <div><small>演示效益数据（未验证）</small>
          <b style="display:block;margin:3px 0;font-size:23px;color:var(--orange)">¥ ${m.benefitYuan.toLocaleString('en-US')} <span class="u">元/月</span></b></div>
        <button class="btn sm ghost" style="border-color:var(--orange);color:var(--orange)" data-toast="演示版尚未生成真实报告">⤓ 导出报告</button>
      </div></div>
    <div class="sect"><h2>实时预警事件</h2><span>全部 ${S.events.length} 条</span></div>
    <div class="chips">${fl.map(f=>`<button type="button" class="chip ${S.filt===f[0]?'on':''}" data-filt="${f[0]}" aria-pressed="${S.filt===f[0]}">${f[1]}</button>`).join('')}</div>
    ${list.length?list.map(e=>{
      const [sn,sc]=ds.eventStatus(e.st);
      const btn=e.st==='pending'?`<button class="act" data-done="${e.id}">✓ 标记已处理</button>`
        :e.st==='proc'?`<button class="act proc" data-done="${e.id}">◷ 处理中 · 确认已处理</button>`
        :`<button class="act done" disabled>✓ 已处理</button>`;
      return `<div class="ev"><div class="r1"><div><div class="nm">${ds.barnLabel(e.b)}</div>
        <div class="tm">${e.tm}</div></div><span class="tag ${sc}">● ${sn}</span></div>
        <div class="nt">备注：${e.note}</div>${btn}</div>`;
    }).join(''):`<div style="text-align:center;padding:38px 0;color:var(--mute);font-size:13px">该筛选下暂无事件</div>`}
    <div style="height:8px"></div>`;
}

MY.views=MY.views||{};
MY.views.events=viewEvents;

})(window.MY=window.MY||{});
