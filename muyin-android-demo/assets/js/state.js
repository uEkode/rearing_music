/* 全局运行时状态。
   S 是唯一的可变状态容器：初始值来自 js/fixtures.js 的演示数据，重置时用
   Object.assign 原地复位，所以其它模块可以长期持有 MY.S 的引用。
   本文件同时负责 localStorage 演示进度的读写与校验。 */
(function (MY) {
'use strict';

const F=MY.fixtures;
const copy=MY.fixtures.copy;

const S={
  page:'home',
  /* 圈舍与事件是可变的演示数据，从 fixtures 拷贝一份 */
  barns:JSON.parse(JSON.stringify(F.barns)),
  events:JSON.parse(JSON.stringify(F.events)),
  interv:F.metrics.interv, avgDb:F.metrics.avgDb, filt:'all', sessionCounted:false,
  expandAll:false, popInfo:false, libQ:'', libCat:'all',
  target:'B2', mode:'manual', tpl:'sleep', playing:false, vol:65,
  track:{nm:F.templates.sleep.track,s:F.templates.sleep.out,pos:84,dur:240},
  push:true,
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
      S.barns.forEach(b=>{if(b.st==='playing'){b.st='watch';b.tip=copy.interruptedTip}});
    }
  }
}catch(error){console.warn('Demo state unavailable',error)}

function saveDemo(){try{localStorage.setItem(DEMO_KEY,JSON.stringify({version:1,barns:S.barns,events:S.events,interv:S.interv,pushCfg:S.pushCfg,push:S.push,seenNotice:S.seenNotice}))}catch(error){console.warn('Demo state not saved',error)}}

MY.saveDemo=saveDemo;
MY.barn=id=>S.barns.find(b=>b.id===id);

})(window.MY=window.MY||{});
