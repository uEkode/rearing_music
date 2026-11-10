/* 全局演示状态。
   S 是唯一的可变状态容器：重置时用 Object.assign 原地复位，所以其它模块可以
   长期持有 MY.S 的引用（不要在别处给 S 重新赋值）。
   本文件同时负责 localStorage 演示进度的读写与校验。 */
(function (MY) {
'use strict';

const S={
  page:'home',
  barns:[
    {id:'A1',nm:'A区·1号育肥舍',stock:'存栏128头',desc:'声压监测中',db:62,st:'normal',
     tip:'声环境平稳，保持当前音量即可',tago:'正常'},
    {id:'B2',nm:'B区·2号妊娠舍',stock:'存栏86头',desc:'声压波动偏大',db:71,st:'mild',
     tip:'检测到71dB偏高，建议播放舒缓音乐并降低音量',tago:'轻度应激'},
    {id:'C5',nm:'C区·5号产房',stock:'存栏47头',desc:'持续高分贝',db:83,st:'high',
     tip:'已连续3次超过80dB，自动干预2次仍未回落',tago:'高度应激'},
    {id:'D3',nm:'D区·3号育肥舍',stock:'存栏64头',desc:'声压监测中',db:65,st:'normal',
     tip:'声环境平稳，保持当前音量即可',tago:'正常'},
    {id:'E4',nm:'E区·4号育肥舍',stock:'存栏72头',desc:'声压监测中',db:68,st:'normal',
     tip:'声环境平稳，保持当前音量即可',tago:'正常'},
    {id:'F6',nm:'F区·6号待用舍',stock:'暂未存栏',desc:'设备离线',db:0,st:'offline',
     tip:'声压设备离线，数据暂不可用',tago:'设备离线'}
  ],
  events:[
    {id:'e1',b:'C5',tm:'今天 10:24 · 持续 6 分钟',st:'pending',cnt:false,
     note:'已播放舒眠钢琴曲，等待 10 分钟后复测。'},
    {id:'e2',b:'B2',tm:'今天 09:12 · 持续 3 分钟',st:'proc',cnt:true,
     note:'已降低音量至55%，持续观察中。'},
    {id:'e3',b:'D3',tm:'昨天 21:40 · 持续 2 分钟',st:'done',cnt:true,
     note:'已由陈志远标记处理，等待复测。'},
    {id:'e4',b:'E4',tm:'昨天 14:05 · 持续 4 分钟',st:'done',cnt:true,
     note:'已由陈志远标记处理，等待复测。'}
  ],
  interv:12, avgDb:68, filt:'all', sessionCounted:false,
  expandAll:false, popInfo:false, libQ:'', libCat:'all',
  target:'B2', mode:'manual', tpl:'sleep', playing:false, vol:65,
  track:{nm:'舒眠钢琴曲 · 母牛安眠',s:'环境音 · 60 dB 恒定输出',pos:84,dur:240},
  deviceOk:true, push:true,
  pushCfg:{high:true,mild:false,event:true,offline:true,daily:false,
    dnd:false,dndStart:'22:00',dndEnd:'06:00',level:'normal'}
};
MY.S=S;

const DEMO_KEY='muyin-demo-state-v1';
const initialDemoState=JSON.parse(JSON.stringify(S));
MY.initialDemoState=initialDemoState;
try{
  const saved=JSON.parse(localStorage.getItem(DEMO_KEY)||'null');
  if(saved&&saved.version===1&&Array.isArray(saved.barns)&&Array.isArray(saved.events)){
    const validStates=['normal','mild','high','playing','watch','offline'];
    const validEvents=['pending','proc','done'];
    if(saved.barns.length===6&&saved.barns.every((b,i)=>b.id===initialDemoState.barns[i].id&&validStates.includes(b.st))&&saved.events.every(e=>validEvents.includes(e.st)&&initialDemoState.barns.some(b=>b.id===e.b))){
      S.barns=saved.barns;S.events=saved.events;
      if(Number.isFinite(saved.interv))S.interv=saved.interv;
      if(saved.pushCfg)Object.keys(S.pushCfg).forEach(k=>{if(typeof saved.pushCfg[k]===typeof S.pushCfg[k])S.pushCfg[k]=saved.pushCfg[k]});
      if(typeof saved.push==='boolean')S.push=saved.push;
      if(typeof saved.seenNotice==='boolean')S.seenNotice=saved.seenNotice;
      S.barns.forEach(b=>{if(b.st==='playing'){b.st='watch';b.tip='上次模拟干预已中断，请人工确认演示状态'}});
    }
  }
}catch(error){console.warn('Demo state unavailable',error)}

function saveDemo(){try{localStorage.setItem(DEMO_KEY,JSON.stringify({version:1,barns:S.barns,events:S.events,interv:S.interv,pushCfg:S.pushCfg,push:S.push,seenNotice:S.seenNotice}))}catch(error){console.warn('Demo state not saved',error)}}

MY.saveDemo=saveDemo;
MY.barn=id=>S.barns.find(b=>b.id===id);

})(window.MY=window.MY||{});
