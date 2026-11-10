/* 应激等级判定。
   现在按分贝阈值（fixtures.stress.levels）推导；接入真实 AI 后，把 evaluate()
   换成模型返回的等级即可，视图只依赖等级 key 与标签，不需要跟着改。
   返回的 source 用来区分「本地规则」与「AI 识别」，便于以后展示识别来源。 */
(function (MY) {
'use strict';

const F=MY.fixtures;

/* 只按客观量推导等级：离线优先，其次落阈值区间 */
function level(db, online){
  if(online===false)return 'offline';
  const n=Number(db)||0;
  const levels=F.stress.levels;
  for(let i=0;i<levels.length;i++){
    const l=levels[i];
    if(n>=l.min&&n<l.max)return l.key;
  }
  return levels[levels.length-1].key;
}

function evaluate(barn){
  if(!barn)return {key:'offline',db:0,source:'rule'};
  const db=Number(barn.db)||0;
  return {key:level(db,barn.online),db,source:'rule'};
}

function label(key){return F.stress.labels[key]||F.stress.labels.normal}

function isStress(key){return key==='mild'||key==='high'}

MY.stress={evaluate,label,level,isStress};

})(window.MY=window.MY||{});
