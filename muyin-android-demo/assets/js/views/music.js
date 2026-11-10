/* 干预页：目标圈舍、自动/手动/定时三种模式、场景模板、播放器、音频库。 */
(function (MY) {
'use strict';

const S=MY.S;
const ds=MY.ds;
const {fmt,VOL_ICON}=MY.ui;

function viewMusic(){
  const cur=ds.barn(S.target);
  const tk=S.track;
  const copy=ds.copy();
  const lib=ds.library();
  let body='';
  if(S.mode==='auto'){
    body=`<div class="card" style="background:#fff;border-radius:15px;padding:15px;margin-bottom:14px">
      <h3 style="margin:0 0 10px;font-size:14px;color:var(--green)">自动触发规则</h3>
      ${ds.autoRules().map(r=>`
        <div style="display:flex;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)">
          <div style="flex:1"><b style="font-size:12.5px">${r[0]}</b>
            <div style="font-size:11px;color:var(--mute);margin-top:2px">${r[1]}</div></div>
          <div class="sw ${r[2]?'on':''}"></div></div>`).join('')}
      <div class="tip" style="margin-top:12px"><span>◖</span><span>${copy.autoTip}</span></div>
    </div>`;
  }else if(S.mode==='timer'){
    body=`<div style="background:#fff;border-radius:15px;padding:15px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <b style="font-size:14px;color:var(--green)">定时任务</b>
        <button class="btn sm ghost" data-toast="新建定时任务">＋ 新建</button></div>
      ${ds.schedules().map(r=>`
        <div style="display:flex;gap:11px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)">
          <div style="width:38px;height:38px;border-radius:10px;background:var(--sub);display:grid;
            place-items:center;font-size:16px">◷</div>
          <div style="flex:1"><b style="font-size:13px">${r[0]}</b>
            <div style="font-size:11px;color:var(--mute);margin-top:2px">${r[1]} · ${r[2]}</div></div>
          <div class="sw on"></div></div>`).join('')}
      <div class="tip" style="margin-top:12px"><span>◖</span><span>${copy.timerTip}</span></div>
    </div>`;
  }
  const online=ds.barnOnline(cur);
  return `<div class="hd"><div><h1>音乐干预控制台</h1>
      <p>${cur?cur.nm:'未选择圈舍'} · ${S.playing?'正在干预':'待开始'}</p></div>
      <span class="tag ${online?'t-normal':'t-high'}">● ${online?'设备已连接':'设备离线'}</span></div>
    <div class="tgt"><span class="tg-l">目标圈舍</span>
      ${S.barns.map(b=>`<div class="tg ${S.target===b.id?'on':''} ${b.st==='offline'?'dis':''}" data-tgt="${b.id}">${b.nm.replace('区·','·')}</div>`).join('')}
    </div>
    <div class="seg">${ds.modes().map(s=>`<div class="${S.mode===s[0]?'on':''}" data-mode="${s[0]}">
      <span class="gi">${s[1]}</span><b>${s[2]}</b><small>${s[3]}</small></div>`).join('')}</div>
    ${body}
    <div class="sect"><h2>常用场景模板</h2><span>一键套用</span></div>
    <div class="tpl">${Object.entries(ds.templates()).map(([k,v])=>`
      <div class="${S.tpl===k?'on':''}" data-tpl="${k}"><span class="gi">${v.g}</span>
        <b>${v.nm}</b><small>${v.desc}</small><span class="one">一键套用</span></div>`).join('')}</div>
    <div class="player ${S.playing?'on':''}">
      <div class="t"><div><h3>${tk.nm}</h3><div class="s">${tk.s}</div></div>
        <div class="heart" data-toast="已收藏到「我的 · 音频偏好」">♡</div></div>
      <div class="bar ${S.playing?'hot':''}" id="seekBar" data-seek="1"><i style="width:${tk.pos/tk.dur*100}%"></i>
        <div class="knob" style="left:${tk.pos/tk.dur*100}%"></div>
        <span class="seektip" id="seekTip"></span></div>
      <div class="time"><span id="timeCur">${fmt(tk.pos)}</span><span>${fmt(tk.dur)}</span></div>
      <div class="ctrls">
        <div class="c" data-toast="上一首">◁</div>
        <div class="c" data-toast="后退15秒">↺</div>
        <div class="c big" data-play="1">${S.playing?'❚❚':'▶'}</div>
        <div class="c" data-toast="前进15秒">↻</div>
        <div class="c" data-toast="下一首">▷</div>
      </div>
      <div class="vol"><span class="vspk">${VOL_ICON(S.vol)}</span>
        <div class="bar hot" id="volBar" data-vol="1"><i style="width:${S.vol}%"></i>
          <div class="knob" style="left:${S.vol}%"></div></div>
        <span class="vnum">${S.vol}%</span></div>
    </div>
    <div class="sect"><h2>音频库</h2><span>共${ds.libraryTotal()}首</span></div>
    <div class="search"><span>⌕</span><input id="libSearch" placeholder="搜索曲名或场景" value="${S.libQ||''}"></div>
    <div class="chips">${lib.categories
      .map(c=>`<div class="chip ${(S.libCat||'all')===c[0]?'on':''}" data-libcat="${c[0]}">${c[1]}</div>`).join('')}</div>
    <div id="libList">${lib.tracks.filter(a=>{
        const okQ=!S.libQ||(a[0]+a[1]).toLowerCase().includes(S.libQ.toLowerCase());
        const okC=(S.libCat||'all')==='all'||a[4]===S.libCat;
        return okQ&&okC;
      }).map(a=>`
      <div class="lib" data-lib="${a[0]}"><div class="ic ${a[3]}">${a[2]}</div>
        <div><b>${a[0]}</b><small>${a[1]}</small></div>
        <div class="try">▷ 试听</div></div>`).join('')
      ||`<div style="text-align:center;padding:26px 0;color:var(--mute);font-size:13px">没有匹配的音频</div>`}</div>
    <div style="height:8px"></div>`;
}

MY.views=MY.views||{};
MY.views.music=viewMusic;

})(window.MY=window.MY||{});
