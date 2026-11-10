/* 演示数据（测试数据）。
   这里是唯一写死业务数据的地方：场区、账号、圈舍、事件、指标、样例曲线、
   规则与任务清单、音频库、推送设置文案、免责与提示文案。
   圈舍只存客观量（分贝、是否在线、是否授权、干预状态），应激等级由 js/stress.js
   按阈值推导，将来换成 AI 输出的等级即可，不需要改数据结构和视图。
   接入真实后端时不需要改视图，替换 js/datasource.js 即可。 */
(function (MY) {
'use strict';

const F={};

/* ---------- 应用与账号 ---------- */
F.app={
  title:'牧音管家 · 演示版',
  strip:'牧音管家 · 演示数据 / 未接设备',
  statusTime:'9:41'
};
F.farm={name:'南岭牧业',area:'一号场区'};
F.user={name:'陈志远',role:'牧场场长'};

/* ---------- 应激分级：阈值与标签 ----------
   接入真实 AI 后由模型直接给出等级，stress.js 只负责归一化与兜底。 */
F.stress={
  levels:[
    {key:'normal',min:0,max:70},
    {key:'mild',min:70,max:80},
    {key:'high',min:80,max:1000}
  ],
  labels:{
    normal:['正常','t-normal'],
    mild:['轻度应激','t-mild'],
    high:['高度应激','t-high'],
    offline:['设备离线','t-offline'],
    playing:['干预中','t-play'],
    watch:['恢复观察','t-watch']
  }
};

/* ---------- 圈舍（可变状态，state.js 从这里拷贝一份） ----------
   db 当前分贝；online 设备是否在线；granted 是否授权可见；
   interv 干预状态：null / 'playing' / 'watch' */
F.barns=[
  {id:'A1',nm:'A区·1号育肥舍',stock:'存栏128头',desc:'声压监测中',db:62,
   online:true,granted:true,interv:null,tip:'声环境平稳，保持当前音量即可'},
  {id:'B2',nm:'B区·2号妊娠舍',stock:'存栏86头',desc:'声压波动偏大',db:71,
   online:true,granted:true,interv:null,tip:'检测到71dB偏高，建议播放舒缓音乐并降低音量'},
  {id:'C5',nm:'C区·5号产房',stock:'存栏47头',desc:'持续高分贝',db:83,
   online:true,granted:true,interv:null,tip:'已连续3次超过80dB，自动干预2次仍未回落'},
  {id:'D3',nm:'D区·3号育肥舍',stock:'存栏64头',desc:'声压监测中',db:65,
   online:true,granted:true,interv:null,tip:'声环境平稳，保持当前音量即可'},
  {id:'E4',nm:'E区·4号育肥舍',stock:'存栏72头',desc:'声压监测中',db:68,
   online:true,granted:true,interv:null,tip:'声环境平稳，保持当前音量即可'},
  {id:'F6',nm:'F区·6号待用舍',stock:'暂未存栏',desc:'设备离线',db:0,
   online:false,granted:true,interv:null,tip:'声压设备离线，数据暂不可用'}
];

/* ---------- 圈舍详情用的演示事实（不参与存档，避免污染可变状态） ---------- */
F.barnFacts={
  A1:{todayInterv:0,peakDb:66,device:{battery:'82%',offlineAt:''}},
  B2:{todayInterv:1,peakDb:75,device:{battery:'76%',offlineAt:''}},
  C5:{todayInterv:2,peakDb:87,device:{battery:'64%',offlineAt:''}},
  D3:{todayInterv:0,peakDb:69,device:{battery:'91%',offlineAt:''}},
  E4:{todayInterv:0,peakDb:72,device:{battery:'88%',offlineAt:''}},
  F6:{todayInterv:0,peakDb:4,device:{battery:'—',offlineAt:'10:24'}}
};

/* ---------- 事件（可变状态） ----------
   st：pending 待处理 / proc 处理中（两者都算未处理）/ done 已处理 */
F.events=[
  {id:'e1',b:'C5',tm:'今天 10:24 · 持续 6 分钟',st:'pending',cnt:false,
   note:'已播放舒眠钢琴曲，等待 10 分钟后复测。'},
  {id:'e2',b:'B2',tm:'今天 09:12 · 持续 3 分钟',st:'proc',cnt:true,
   note:'已降低音量至55%，持续观察中。'},
  {id:'e3',b:'D3',tm:'昨天 21:40 · 持续 2 分钟',st:'done',cnt:true,
   note:'已由陈志远标记处理，等待复测。'},
  {id:'e4',b:'E4',tm:'昨天 14:05 · 持续 4 分钟',st:'done',cnt:true,
   note:'已由陈志远标记处理，等待复测。'}
];

/* ---------- 首页指标 ----------
   平均分贝由当前在线圈舍实时算出（见 datasource.metrics），不在这里写死 */
F.metrics={
  interv:12,
  weekEvents:26, weekTrend:'↓ 12%', avgIntervMin:4.2, benefitYuan:3860
};
F.sparks={
  interv:[30,50,40,70,55,85,60],
  db:[45,60,50,65,55,75,50]
};
F.barnCurve24h=[30,35,28,40,45,38,52,60,48,44,58,70,66,58,50,46,55,68,74,62,48,40,36,32];

/* ---------- 事件页 ---------- */
F.alarm={title:'● 高频应激预警',
  text:'C区5号产房今日3次超过 80 dB，已自动干预2次'};

/* ---------- 干预页：模式、自动规则、定时任务 ---------- */
F.modes=[
  ['auto','↻','自动','超阈值自动触发'],
  ['manual','☝','手动','手动选曲干预'],
  ['timer','◷','定时','定时批量播放']
];
F.autoRules=[
  ['≥80 dB 持续3次','自动播放 舒眠安眠 · 60dB',true],
  ['75–80 dB','仅记录 · 通知管理员',true],
  ['设备离线超15分钟','改用备用音箱',false]
];
F.schedules=[
  ['每日 05:00','舒眠安眠 · 全场','06舍 · 60dB'],
  ['每日 21:30','夜间安眠 · 妊娠舍','B区 · 55dB']
];

/* ---------- 音频库 ---------- */
F.library={
  tracks:[
    ['雨林清晨','自然环境音 · 04:00','♫','','env'],
    ['深海白噪','低频白噪 · 03:30','♫','g','noise'],
    ['牧场晨风','实况录音 · 05:00','♫','','live'],
    ['心跳摇篮曲','60 BPM · 04:00','♫','g','guide'],
    ['雪山静谧','自然环境音 · 06:00','♫','','env'],
    ['子宫音模拟','低频白噪 · 02:00','♫','g','noise'],
    ['雨打棚顶','实况录音 · 03:00','♫','','live'],
    ['采奶引导铃','旋律引导 · 01:30','♫','g','guide']
  ],
  categories:[['all','全部'],['env','环境音'],['noise','白噪音'],['live','实况录音'],['guide','引导曲']]
};

/* ---------- 场景模板 ---------- */
F.templates={
  sleep:{nm:'舒眠安眠',desc:'舒缓钢琴+母牛安眠',track:'舒眠钢琴曲 · 母牛安眠',out:'环境音 · 60 dB 恒定输出',g:'☾'},
  night:{nm:'夜间安眠',desc:'环境音·60dB恒定输出',track:'夜间白噪 · 深空低频',out:'环境音 · 55 dB 恒定输出',g:'☆'},
  guide:{nm:'录音引导',desc:'04:00',track:'牧场景声 · 录音引导',out:'实况环境音 · 48 dB 柔和输出',g:'▤'}
};

/* ---------- 事件状态与筛选 ----------
   「处理中」算未处理，所以筛选只有 全部 / 待处理 / 已处理 三类 */
F.eventStatusLabels={
  pending:['待处理','t-high'],proc:['处理中','t-mild'],done:['已处理','t-normal']
};
F.eventFilters=[['all','全部'],['pending','待处理'],['done','已处理']];

/* ---------- 消息推送设置 ---------- */
F.push={
  groups:[
    {title:'应激事件提醒',rows:[
      ['high','!','高度应激告警','分贝持续 ≥ 80 dB 时立即推送'],
      ['mild','~','轻度应激提醒','60–80 dB 区间，每日汇总一次'],
      ['event','▤','事件处理提醒','有事件被他人处理时通知']
    ]},
    {title:'设备与系统',rows:[
      ['offline','▣','设备离线提醒','声压设备断连时推送'],
      ['daily','◷','每日数据摘要','每天 07:00 推送昨日干预效果']
    ]}
  ],
  dnd:{key:'dnd',ic:'☾',title:'夜间免打扰',desc:'开启后该时段仅保留高度应激告警'},
  levels:[['light','仅角标'],['normal','角标+振动'],['full','角标+振动+声音']],
  labels:{high:'高度应激告警',mild:'轻度应激提醒',event:'事件处理提醒',
    offline:'设备离线提醒',daily:'每日数据摘要',dnd:'夜间免打扰'},
  master:{title:'接收推送提醒',desc:'关闭后不再推送任何提醒，首页角标也不再更新'},
  tip:'关闭全部提醒后，首页铃铛仍会显示待处理数量，但不再推送系统通知。'
};

/* ---------- 长文案 ---------- */
F.copy={
  statsNote:'统计口径：手动 + 自动 + 定时干预，不含音频试听。',
  autoTip:'自动模式下首页「快捷安抚」仍可手动覆盖当前策略',
  timerTip:'定时任务同样计入「今日干预次数」与事件流',
  disclaimer:'本工具输出的分贝值、音乐干预建议与应激判定，<b>仅作为牧场辅助参考</b>，'+
    '不构成兽医诊断依据，也不替代现场人工观察。<br><br>'+
    '· 当前分贝、识别和效益数据均为演示数据<br>'+
    '· 当前不接入真实 AI、设备及系统消息推送<br>'+
    '· 出现连续应激或牲畜异常行为，请立即人工介入',
  hardwareTip:'离线圈舍在首页仍可见，但「快捷安抚」不可用',
  barnManageTip:'关闭授权后，该圈舍将从首页移除',
  watchTip:'干预已执行，等待 10 分钟复测声压后恢复常态',
  doneTip:'干预已完成，等待 10 分钟复测声压后恢复常态',
  interruptedTip:'上次模拟干预已中断，请人工确认演示状态'
};

/* ---------- 我的：功能入口（desc 为空时由视图按当前状态生成） ---------- */
F.meItems=[
  {key:'hardware',ic:'▤',title:'硬件管理',desc:'',warn:false},
  {key:'barns',ic:'⌂',title:'圈舍管理',desc:'',warn:false},
  {key:'push',ic:'🔔',title:'消息推送设置',desc:'',warn:false},
  {key:'tutorial',ic:'▷',title:'新手短视频教程',desc:'3分钟学会使用 · 含大字幕',warn:false},
  {key:'legal',ic:'⛨',title:'产品免责边界声明',desc:'本工具为辅助参考，不替代兽医诊断',warn:true}
];

MY.fixtures=F;

})(window.MY=window.MY||{});
