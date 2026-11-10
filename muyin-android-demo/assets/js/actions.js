/* 交互分发：整页唯一的点击代理 + 音频库搜索输入。
   所有可交互元素通过 data-* 属性声明行为，这里按属性分派。
   注意：分支顺序有意义（return 生效），新增分支请追加在合适位置。
   所有事件入口都先校验目标是否存在、状态是否允许，避免重复点击或脏数据导致误动作。 */
(function (MY) {
'use strict';

const S=MY.S;
const barn=MY.barn;
const ds=MY.ds;
const {$,toast,pushLabel}=MY.ui;
const {go,render}=MY.app;
const {startTimer,stopTimer}=MY.player;
const {openPushSheet,showSheet,closeSheet}=MY.sheets;

/* ---------- 交互 ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-tab],[data-open],[data-alert],[data-metric],[data-mode],[data-tpl],[data-play],[data-lib],[data-filt],[data-barnfilt],[data-done],[data-mi],[data-push],[data-toast],[data-recheck],[data-close],[data-calm2],[data-tgt],[data-grant],[data-info],[data-libcat],[data-pcfg],[data-plevel],[data-miniplay]');
  if(!t)return;
  const d=t.dataset;
  if(d.tab){go(d.tab);return}
  if(d.open){
    const b=barn(d.open);
    if(!b)return;
    const facts=ds.barnFacts(b.id);
    const evs=S.events.filter(x=>x.b===b.id);
    showSheet(`<button type="button" class="close" data-close="1" aria-label="关闭">✕</button>
      <h3>${b.nm}</h3><p style="margin:0 0 14px;font-size:12px;color:var(--mute)">${b.stock} · ${b.desc} · ${ds.barnOnline(b)?'演示设备在线':'设备离线'}</p>
      <div class="pbody">
      <div style="background:#fff;border-radius:14px;padding:14px;margin-bottom:11px">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <b style="font-size:13px;color:var(--green)">24小时声压曲线</b>
          <span style="font-size:11px;color:var(--mute)">实时 · 1分钟采样</span></div>
        <div style="display:flex;gap:3px;align-items:flex-end;height:64px;margin-top:12px">
          ${ds.curve24h()
            .map(h=>`<i style="flex:1;background:${h>66?'var(--red)':h>52?'var(--orange)':'#C8CFC7'};
              height:${h}%;border-radius:2px;display:block"></i>`).join('')}</div>
        <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--mute);margin-top:6px">
          <span>00:00</span><span>12:00</span><span>现在</span></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:11px">
        <div style="background:#fff;border-radius:12px;padding:12px"><small style="font-size:11px;color:var(--mute)">今日干预</small>
          <b style="display:block;font-size:20px;color:var(--green);margin-top:2px">${facts.todayInterv} 次</b></div>
        <div style="background:#fff;border-radius:12px;padding:12px"><small style="font-size:11px;color:var(--mute)">近7日最高</small>
          <b style="display:block;font-size:20px;color:var(--red);margin-top:2px">${facts.peakDb} dB</b></div></div>
      <div style="background:#fff;border-radius:14px;padding:14px;margin-bottom:11px">
        <b style="font-size:13px;color:var(--green)">该舍事件</b>
        ${evs.length?evs.map(e=>`<div style="display:flex;justify-content:space-between;align-items:center;
          padding:9px 0;border-bottom:1px solid var(--line);font-size:12px">
          <span>${e.tm}</span><span class="tag ${ds.eventStatus(e.st)[1]}">● ${ds.eventStatus(e.st)[0]}</span></div>`).join('')
          :'<div style="font-size:12px;color:var(--mute);padding:10px 0">近7日无事件</div>'}
      </div>
      </div>
      <div class="sticky">
        ${b.online
          ? `<button type="button" class="btn" data-calm2="${b.id}">♫ ${b.interv==='watch'?'再次安抚':'快捷安抚'}</button>
        ${b.interv==='watch'?`<button type="button" class="btn ghost" style="margin-top:9px" data-recheck="${b.id}">✓ 复测通过</button>`:''}`
          : `<button type="button" class="btn ghost" style="border-color:#D9DCD6;color:#9AA09A;cursor:default" disabled>设备离线 · 不可干预</button>`}
        <button type="button" class="btn ghost" style="margin-top:9px" data-close="1">关闭</button>
      </div>`);
    return}
  if(d.close){closeSheet();return}
  if(d.calm2){
    const b=barn(d.calm2);
    if(!b)return;
    if(!b.online){toast('演示设备离线，无法干预');return}
    MY.sheets.hideSheet();
    S.target=b.id;S.sessionCounted=false;S.tpl=ds.stressLevel(b)==='high'?'sleep':'night';
    const tpl=ds.templates()[S.tpl];
    S.track={nm:tpl.track,s:tpl.out,pos:0,dur:240};S.playing=false;go('music');
    toast(`已带入 ${b.nm} · ${tpl.nm}，点击播放开始干预`);return}
  if(d.alert){S.filt='pending';go('events');toast('已切换到「待处理」事件');return}
  if(d.metric){
    S.filt='all';go('events');
    const m=ds.metrics();
    toast(d.metric==='interv'
      ?`「今日干预次数」共 ${m.interv} 次 · 明细见下方事件列表`
      :`全场平均分贝 ${m.avgDb} dB · 明细见下方事件列表`);
    return}
  if(d.mode){S.mode=d.mode;render();return}
  if(d.tpl){
    S.tpl=d.tpl;
    const tpl=ds.templates()[d.tpl];
    S.track={nm:tpl.track,s:tpl.out,pos:0,dur:240};
    S.playing=false;render();
    toast(`已套用「${tpl.nm}」，点击播放开始`);return}
  if(d.miniplay){
    S.playing=false;stopTimer();
    const cur=barn(S.target);
    if(cur)cur.interv=null;
    render();
    toast('已暂停 · 事件保持「处理中」');return}
  if(d.play){
    const target=barn(S.target);
    if(!target||!target.online){toast('声压设备离线，无法下发音频');return}
    S.playing=!S.playing;
    if(S.playing){
      if(S.track.pos>=S.track.dur)S.track.pos=0;
      if(!S.sessionCounted){S.interv++;S.sessionCounted=true}
      let ev=S.events.find(x=>x.b===S.target&&x.st!=='done');
      if(ev){ev.st='proc';ev.cnt=true;ev.note=`已播放${S.track.nm}，音量${S.vol}%，持续观察中。`}
      else S.events.unshift({id:'e'+(S.events.length+1),b:S.target,cnt:true,
        tm:'刚刚 · 持续 0 分钟',st:'proc',note:`已播放${S.track.nm}，音量${S.vol}%，持续观察中。`});
      target.interv='playing';
      startTimer();
      toast('模拟干预已开始 · 不控制真实设备');}
    else {stopTimer();target.interv=null;toast('已暂停 · 事件保持「处理中」')}
    render();return}
  if(d.lib){toast('模拟试听 · 本版不播放真实音频');return}
  if(d.filt){S.filt=d.filt;render();return}
  if(d.barnfilt){S.barnFilt=d.barnfilt;render();return}
  if(d.recheck){
    const b=barn(d.recheck);
    if(!b||b.interv!=='watch')return;
    b.interv=null;b.db=Math.max(56,b.db-14);
    b.tip='声环境平稳，保持当前音量即可';
    /* 复测入口在圈舍详情弹层里，处理完把弹层收掉并刷新列表 */
    if($('sheet').classList.contains('on'))closeSheet();else render();
    toast(`${b.nm} 模拟复测通过 · 已恢复「正常」`);return}
  if(d.info){e.stopPropagation();S.popInfo=!S.popInfo;render();return}
  if(d.libcat){S.libCat=d.libcat;render();return}
  if(d.tgt){
    const b=barn(d.tgt);
    if(!b)return;
    if(!b.online){toast(`${b.nm} 声压设备离线，无法作为干预目标`);return}
    stopTimer();
    S.target=b.id;S.sessionCounted=false;S.playing=false;
    S.tpl=ds.stressLevel(b)==='high'?'sleep':'night';
    const tpl=ds.templates()[S.tpl];
    S.track={nm:tpl.track,s:tpl.out,pos:0,dur:240};
    render();
    toast(`目标已切换为 ${b.nm} · ${tpl.nm}`);return}
  if(d.done){
    const ev=S.events.find(x=>x.id===d.done);
    if(!ev||ev.st==='done')return;
    const wasProc=ev.st==='proc';
    if(ev.b===S.target){S.playing=false;stopTimer()}
    ev.st='done';
    ev.note=ev.note.replace(/。$/,'')+`。已由${ds.user().name}${wasProc?'确认处理':'标记处理'}，等待复测。`;
    if(!ev.cnt){S.interv++;ev.cnt=true}
    const b=barn(ev.b);
    if(b){b.interv='watch';b.tip=ds.copy().watchTip}
    render();
    toast('已标记处理 · 首页圈舍状态与干预计数已同步');return}
  if(d.push){
    S.push=!S.push;
    t.classList.toggle('on',S.push);
    t.setAttribute('aria-checked',String(S.push));
    toast(S.push?'推送已开启 · 首页铃铛将显示提醒':'推送已关闭 · 角标不再更新');
    return}
  if(d.mi){
    const copy=ds.copy();
    if(d.mi==='hardware'){showSheet(`<button type="button" class="close" data-close="1" aria-label="关闭">✕</button>
      <h3>硬件管理</h3><p style="margin:0 0 14px;font-size:12px;color:var(--mute)">${S.barns.length}台演示设备 · ${S.barns.filter(b=>!b.online).length}台离线</p>
      <div class="pbody">
      ${S.barns.map(b=>[b,!b.online?'离线':'在线',ds.barnFacts(b.id)]).map(r=>`
        <div style="display:flex;align-items:center;gap:11px;background:#fff;border-radius:12px;
          padding:12px;margin-bottom:8px">
          <div style="width:34px;height:34px;border-radius:9px;background:${r[1]==='在线'?'#EDF3EC':'var(--red-l)'};
            display:grid;place-items:center;font-size:14px;color:${r[1]==='在线'?'#3E6B4A':'var(--red)'}">▤</div>
          <div style="flex:1"><b style="font-size:13px">${r[0].nm}</b>
            <div style="font-size:11px;color:var(--mute)">声压传感器 · ${r[1]==='在线'?'电量 '+r[2].device.battery:r[2].device.offlineAt+' 断开'}</div></div>
          ${r[1]==='离线'?`<button type="button" class="btn sm ghost" style="border-color:var(--red);color:var(--red)"
            data-toast="演示提示：尚未连接真实设备">重连</button>`:''}</div>`).join('')}
      <div class="tip" style="margin-top:6px"><span>!</span><span>${copy.hardwareTip}</span></div>
      </div>
      <div class="sticky"><button type="button" class="btn" data-close="1">完成</button></div>`);}
    else if(d.mi==='barns'){showSheet(`<button type="button" class="close" data-close="1" aria-label="关闭">✕</button>
      <h3>圈舍管理</h3><p style="margin:0 0 14px;font-size:12px;color:var(--mute)">${S.barns.length}个圈舍 · 含存栏与设备绑定</p>
      <div class="pbody">
      ${S.barns.map(b=>[b,b.stock.replace(/[^0-9]/g,'')||0,ds.barnOnline(b)?'在线':'离线']).map(r=>`
        <div style="display:flex;align-items:center;gap:11px;background:#fff;border-radius:12px;
          padding:12px;margin-bottom:8px">
          <div style="width:34px;height:34px;border-radius:9px;background:var(--sub);display:grid;
            place-items:center;font-size:14px">⌂</div>
          <div style="flex:1"><b style="font-size:13px">${r[0].nm}</b>
            <div style="font-size:11px;color:var(--mute)">存栏 ${r[1]} 头 · 设备${r[2]}</div></div>
          <button type="button" class="sw ${r[0].granted?'on':''}" role="switch"
            aria-checked="${!!r[0].granted}" aria-label="${r[0].nm} 授权" data-grant="${r[0].id}"></button></div>`).join('')}
      <div class="tip" style="margin-top:6px"><span>◖</span><span>${copy.barnManageTip}</span></div>
      </div>`);}
    else if(d.mi==='legal'){showSheet(`<button type="button" class="close" data-close="1" aria-label="关闭">✕</button>
      <h3>产品免责边界声明</h3>
      <div class="pbody">
      <div style="background:var(--amber-l);border-radius:12px;padding:14px;font-size:12.5px;
        line-height:1.75;color:#7A5A2A;margin-top:12px">${copy.disclaimer}</div>
      <button type="button" class="btn" data-close="1" style="margin-top:14px">我知道了</button>
      </div>`);}
    else if(d.mi==='push'){openPushSheet();
      return}
    else {
      const item=ds.meItems().find(x=>x.key===d.mi);
      toast(item?`${item.title}：${item.desc}`:'该功能尚未实现');
    }
    return}
  if(d.grant){
    const b=barn(d.grant);
    if(!b)return;
    b.granted=!b.granted;
    t.classList.toggle('on',b.granted);
    t.setAttribute('aria-checked',String(b.granted));
    toast(b.granted?`已授权 ${b.nm}`:`已关闭 ${b.nm} 的授权，首页将不再显示`);
    return}
  if(d.pcfg){
    const k=d.pcfg;
    S.pushCfg[k]=!S.pushCfg[k];
    t.classList.toggle('on',S.pushCfg[k]);
    t.setAttribute('aria-checked',String(S.pushCfg[k]));
    toast(S.pushCfg[k]?`已开启「${pushLabel(k)}」提醒`:`已关闭「${pushLabel(k)}」提醒`);
    return}
  if(d.plevel){
    S.pushCfg.level=d.plevel;
    document.querySelectorAll('[data-plevel]').forEach(el=>{
      const on=el.dataset.plevel===d.plevel;
      el.classList.toggle('on',on);
      el.setAttribute('aria-pressed',String(on));
    });
    toast('提醒强度已更新');
    return}
  if(d.toast){toast(d.toast);return}
});

/* 键盘触发：用 role="button" 的容器（圈舍卡、指标卡）不享受原生按钮的
   Enter/Space 行为，这里补上；原生 <button> 不经过这条分支 */
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' ')return;
  const el=e.target;
  if(!el||el.getAttribute('role')!=='button')return;
  e.preventDefault();
  el.click();
});

/* 免打扰时段：时间选择器直接改，改完即生效 */
document.addEventListener('change',e=>{
  const el=e.target;
  if(!el||!el.dataset||!el.dataset.dnd)return;
  if(el.dataset.dnd==='start')S.pushCfg.dndStart=el.value||S.pushCfg.dndStart;
  else S.pushCfg.dndEnd=el.value||S.pushCfg.dndEnd;
  toast(`免打扰时段 ${S.pushCfg.dndStart} – ${S.pushCfg.dndEnd}`);
});

/* 音频库搜索：局部更新，不重渲染整页以保留输入焦点 */
document.addEventListener('input',e=>{
  if(e.target.id!=='libSearch')return;
  S.libQ=e.target.value;
  const holder=document.getElementById('libList');
  if(!holder)return;
  const html=ds.library().tracks.filter(a=>{
    const okQ=!S.libQ||(a[0]+a[1]).toLowerCase().includes(S.libQ.toLowerCase());
    const okC=(S.libCat||'all')==='all'||a[4]===S.libCat;
    return okQ&&okC;
  }).map(a=>`
    <button type="button" class="lib" data-lib="${a[0]}"><div class="ic ${a[3]}" aria-hidden="true">${a[2]}</div>
      <div><b>${a[0]}</b><small>${a[1]}</small></div>
      <div class="try">▷ 试听</div></button>`).join('')
    ||`<div style="text-align:center;padding:26px 0;color:var(--mute);font-size:13px">没有匹配的音频</div>`;
  holder.innerHTML=html;
});

})(window.MY=window.MY||{});
