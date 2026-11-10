/* 数据源接口：视图与交互只通过 MY.ds 取数据，不直接读演示常量。
   当前全部来自 js/fixtures.js 的演示（测试）数据。
   接入真实后端时只改这一个文件：把各函数换成 fetch(docs/API.md 里的接口)，
   并让 app.render 支持加载中/失败态；视图结构不用动。 */
(function (MY) {
'use strict';

const F=MY.fixtures;
const S=MY.S;

const ds={
  app:()=>F.app,
  farm:()=>F.farm,
  user:()=>F.user,

  /* 首页指标：干预次数与平均分贝会随演示操作变化，取运行时状态 */
  metrics:()=>({
    interv:S.interv, avgDb:S.avgDb,
    weekEvents:F.metrics.weekEvents, weekTrend:F.metrics.weekTrend,
    avgIntervMin:F.metrics.avgIntervMin, benefitYuan:F.metrics.benefitYuan
  }),
  sparks:()=>F.sparks,
  onlineCount:()=>S.barns.filter(b=>b.st!=='offline').length,

  /* 圈舍 */
  barns:()=>S.barns,
  barn:id=>MY.barn(id),
  barnLabel:id=>{const b=MY.barn(id);return b?b.nm:id},
  barnOnline:b=>!!b&&b.st!=='offline',
  barnFacts:id=>F.barnFacts[id]||{todayInterv:0,peakDb:0,device:{battery:'—',offlineAt:''}},
  curve24h:()=>F.barnCurve24h,

  /* 事件 */
  events:()=>S.events,
  eventFilters:()=>F.eventFilters,
  eventStatus:st=>F.eventStatusLabels[st],
  statusLabel:st=>F.statusLabels[st],
  alarm:()=>F.alarm,

  /* 干预 */
  modes:()=>F.modes,
  templates:()=>F.templates,
  autoRules:()=>F.autoRules,
  schedules:()=>F.schedules,
  library:()=>F.library,
  libraryTotal:()=>F.library.tracks.length,

  /* 消息推送 */
  pushConfig:()=>F.push,
  pushLabel:k=>F.push.labels[k]||k,

  copy:()=>F.copy,
  meItems:()=>F.meItems
};

MY.ds=ds;

})(window.MY=window.MY||{});
