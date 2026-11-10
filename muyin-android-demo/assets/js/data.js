/* 静态演示数据：干预模板、圈舍名映射、状态标签、音频库、推送文案。
   这里的内容全部是演示用的写死数据，接入真实接口时替换为服务端返回。 */
(function (MY) {
'use strict';

const REC={
  sleep:{nm:'舒眠安眠',desc:'舒缓钢琴+母牛安眠',track:'舒眠钢琴曲 · 母牛安眠',out:'环境音 · 60 dB 恒定输出',g:'☾'},
  night:{nm:'夜间安眠',desc:'环境音·60dB恒定输出',track:'夜间白噪 · 深空低频',out:'环境音 · 55 dB 恒定输出',g:'☆'},
  guide:{nm:'录音引导',desc:'04:00',track:'牧场景声 · 录音引导',out:'实况环境音 · 48 dB 柔和输出',g:'▤'}
};
const BMAP={'A1':'A区·1号育肥舍','B2':'B区·2号妊娠舍','C5':'C区·5号产房',
  'D3':'D区·3号育肥舍','E4':'E区·4号育肥舍','F6':'F区·6号待用舍'};
const STAG={normal:['正常','t-normal'],mild:['轻度应激','t-mild'],high:['高度应激','t-high'],
  playing:['干预中','t-play'],watch:['恢复观察','t-watch'],offline:['设备离线','t-offline']};
const STAGE={pending:['待处理','t-high'],proc:['处理中','t-mild'],done:['已处理','t-normal']};
const LIB=[
  ['雨林清晨','自然环境音 · 04:00','♫','','env'],
  ['深海白噪','低频白噪 · 03:30','♫','g','noise'],
  ['牧场晨风','实况录音 · 05:00','♫','','live'],
  ['心跳摇篮曲','60 BPM · 04:00','♫','g','guide'],
  ['雪山静谧','自然环境音 · 06:00','♫','','env'],
  ['子宫音模拟','低频白噪 · 02:00','♫','g','noise'],
  ['雨打棚顶','实况录音 · 03:00','♫','','live'],
  ['采奶引导铃','旋律引导 · 01:30','♫','g','guide']
];
const PUSH_LBL={high:'高度应激告警',mild:'轻度应激提醒',event:'事件处理提醒',
  offline:'设备离线提醒',daily:'每日数据摘要',dnd:'夜间免打扰'};

MY.data={REC,BMAP,STAG,STAGE,LIB,PUSH_LBL};

})(window.MY=window.MY||{});
