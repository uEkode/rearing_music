/* 数据源接口：视图与交互只通过 MY.ds 取数据，不直接读演示常量。
   当前全部来自 js/fixtures.js 的演示（测试）数据，应激等级来自 js/stress.js。
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

  /* 首页指标：干预次数取运行时状态，平均分贝由当前在线圈舍实时算出 */
  metrics:()=>{
    const live=S.barns.filter(b=>b.granted&&b.online);
    const avgDb=live.length?Math.round(live.reduce((sum,b)=>sum+b.db,0)/live.length):0;
    return {
      interv:S.interv, avgDb,
      weekEvents:F.metrics.weekEvents, weekTrend:F.metrics.weekTrend,
      avgIntervMin:F.metrics.avgIntervMin, benefitYuan:F.metrics.benefitYuan
    };
  },
  sparks:()=>F.sparks,
  /* 首页只展示「已授权且未移除」的圈舍 */
  homeBarns:()=>S.barns.filter(b=>b.granted),
  onlineCount:()=>S.barns.filter(b=>b.granted&&b.online).length,

  /* 圈舍 */
  barns:()=>S.barns,
  barn:id=>MY.barn(id),
  barnLabel:id=>{const b=MY.barn(id);return b?b.nm:id},
  barnOnline:b=>!!b&&b.online!==false,
  /* 展示用状态：离线 > 干预中/恢复观察 > 应激等级 */
  barnStatus:b=>{
    if(!b||b.online===false)return F.stress.labels.offline;
    if(b.interv==='playing')return F.stress.labels.playing;
    if(b.interv==='watch')return F.stress.labels.watch;
    return MY.stress.label(MY.stress.evaluate(b).key);
  },
  stressLevel:b=>MY.stress.evaluate(b).key,
  /* 分类口径：离线 > 干预中（含恢复观察） > 应激（轻度/高度） > 正常 */
  barnCategory:b=>{
    if(!b||b.online===false)return 'offline';
    if(b.interv==='playing'||b.interv==='watch')return 'active';
    return MY.stress.evaluate(b).key==='normal'?'normal':'stress';
  },
  barnFilters:()=>F.barnFilters,
  barnFacts:id=>F.barnFacts[id]||{todayInterv:0,peakDb:0,device:{battery:'—',offlineAt:''}},
  curve24h:()=>F.barnCurve24h,

  /* 事件：「处理中」并入待处理，未处理即 st!=='done' */
  events:()=>S.events,
  eventFilters:()=>F.eventFilters,
  eventStatus:st=>F.eventStatusLabels[st],
  isOpenEvent:e=>e.st!=='done',
  openEventCount:()=>S.events.filter(e=>e.st!=='done').length,
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
