// 机构类型字典
export const DEPT_TYPE = {
  area: "0", // 地区
  center: "1", // 中心
  centerDept: "2", // 内部管理机构
  bank1: "bank1", // 银行机构 / 天津法人银行
  bank2: "bank2", // 银行机构 / 民营银行
  bank3: "bank4", // 银行机构 / 政策性银行
  bank4: "bank4", // 银行机构 / 国有商业银行
  bank5: "bank5", // 银行机构 / 股份制商业银行
  bank6: "bank6", // 银行机构 / 城市商业银行
  bank7: "bank7", // 银行机构 / 金融资产管理公司
  bank8: "bank8", // 银行机构 / 信托公司
  bank9: "bank9", // 银行机构 / 住房储蓄银行
  bank10: "bank10", // 银行机构 / 村镇银行
  bank11: "bank11", // 银行机构 / 工行票据、财务公司
  bank12: "bank12", // 银行机构 / 外商独资法人银行
  bank13: "bank13", // 银行机构 / 外商独资银行天津分行
  bank14: "bank14", // 银行机构 / 中外合资银行
  nonBank1: "nonBank1", // 非银机构 / 华宝押运
  nonBank2: "nonBank2", // 非银机构 / 金融公司
  insurance1: "insurance1", // 保险机构 / 财产险
  insurance2: "insurance2", // 保险机构 / 人身险
  bankList: ["bank1", "bank2", "bank3", "bank4", "bank5", "bank6", "bank7", "bank8", "bank9", "bank10", "bank11", "bank12", "bank13", "bank14"],
  nonBankList: ["nonBank1", "nonBank2"],
  insuranceList: ["insurance1", "insurance2"],
};

// 调解室类型字典
export const MEDIATION_ROOM_TYPE = {
  statutoryWorkingDay: "1", // 法定工作日
  statutoryHoliday: "2", // 法定节假日
  custom: "3", // 自定义
};

// 调解室预约信息状态字典
export const MEDIATION_ROOM_RESERVATION_STATUS = {
  MEDIATION_ROOM_RESERVATION_STATUS0: "0", // 已取消
  MEDIATION_ROOM_RESERVATION_STATUS1: "1", // 已预约
  MEDIATION_ROOM_RESERVATION_STATUS2: "2", // 使用中
  MEDIATION_ROOM_RESERVATION_STATUS3: "3", // 结束
  MEDIATION_ROOM_RESERVATION_STATUS4: "4", // 过期
};

// 时间段
export const TIME_SPAN_OPTIONS = [
  {
    value: "8",
    label: "8:00~9:00",
    startTime: "08:00:00",
    endTime: "09:00:00",
  },
  {
    value: "9",
    label: "9:00~10:00",
    startTime: "09:00:00",
    endTime: "10:00:00",
  },
  {
    value: "10",
    label: "10:00~11:00",
    startTime: "10:00:00",
    endTime: "11:00:00",
  },
  {
    value: "11",
    label: "11:00~12:00",
    startTime: "11:00:00",
    endTime: "12:00:00",
  },
  {
    value: "14",
    label: "14:00~15:00",
    startTime: "14:00:00",
    endTime: "15:00:00",
  },
  {
    value: "15",
    label: "15:00~16:00",
    startTime: "15:00:00",
    endTime: "16:00:00",
  },
  {
    value: "16",
    label: "16:00~17:00",
    startTime: "16:00:00",
    endTime: "17:00:00",
  },
  {
    value: "17",
    label: "17:00~18:00",
    startTime: "17:00:00",
    endTime: "18:00:00",
  },
];

// 是否
export const SYS_YES_NO = {
  sys_yes: "Y", // 是
  sys_no: "N", // 否
};

// 性别
export const SYS_SEX = {
  man: "0", // 女
  woman: "1", // 男
};

// 纠纷业务受理状态
export const DM_ACCEPT_STATUS = {
  accept: "1", // 受理
  reject: "2", // 不受理
  out: "3", // 转出
};

// 纠纷业务进件渠道
export const DM_ENTRY_CHANNEL = {
  A: "A", // 投诉人申请
  B: "B", // 消保处5604客户申请
  C: "C", // 消保处转办
  D: "D", // 机构申请
  E: "E", // 消保平台转办
  F: "F", // 其他渠道申请
  G: "G", // 消保处面访转办
  H: "H", // 12378引导
  I: "I", // 综治中心引导
  TF: "TF", // 法院-天津铁路运输法院
  HX: "HX", // 法院-天津河西法院
  HD: "HD", // 法院-天津河东法院
  BH: "BH", // 法院-天津滨海法院
  CENTER: ["A", "B", "C", "D", "E", "F", "G", "H", "I"], // 中心
  COURT: ["TF", "HX", "HD", "BH"], // 法院
};

// 纠纷业务状态
export const DM_STATUS = {
  DM_STATUS1: "1", // 待前台处理
  DM_STATUS2: "2", // 待调解员处理
  DM_STATUS3: "3", // 待机构反馈
  DM_STATUS4: "4", // 调解中
  DM_STATUS5: "5", // 更改调解员审核
  DM_STATUS6: "6", // 待机构补充材料
  DM_STATUS10: "10", // 已办结
  DM_STATUS20: "20", // 已归档
};

/** 纠纷工单标记案件类型（扩展服务） */
export const MARK_CASE_TYPE_LABEL = {
  "10": "小额快处/简易案件",
  "20": "普通案件",
  "30": "复杂案件",
};

export function formatMarkCaseTypeLabel(val) {
  if (val === undefined || val === null || val === "") {
    return "—";
  }
  const key = String(val);
  return MARK_CASE_TYPE_LABEL[key] || key;
}

// 身份证类型
export const CERT_TYPE = {
  CERT_TYPE0: "0", // 身份证
  CERT_TYPE1: "1", // 护照
  CERT_TYPE2: "2", // 军警证
  CERT_TYPE3: "3", // 外国人永久居留证
};

// 纠纷业务协议阶段
export const DM_AGREEMENT_STEP = {
  AA1: "auditAgreement1", // 协议一审
  AA2: "auditAgreement2", // 协议二审
  AA3: "auditAgreement3", // 协议三审
  AA4: "auditAgreement4", // 协议四审
  AS: "applyStamp", // 用印申请
  AS1: "auditStamp1", // 用印一审
  AS2: "auditStamp2", // 用印二审
  AS3: "auditStamp3", // 用印三审
  AS4: "auditStamp4", // 用印四审
  AR: "auditReject", // 审核驳回
  AF: "auditFinish", // 审核完成
  S: "signing", // 签署中
  SF: "signFinish", // 签署完成
  SRV: "signRevoke", // 签署撤销
  SE: "signExpire", // 签署过期
  SRJ: "signReject", // 签署拒签
};

// 纠纷业务调解结果
export const DM_MEDIATION_RESULT = {
  success: "1", // 成功
  fail: "2", // 失败
  continue: "3" //有待继续调解
};

// 纠纷业务签约方式
export const DM_SIGN_WAY = {
  online: "1", // 签上签约
  offline: "2", // 线下签约
};

// 签署状态
export const SIGN_STATUS = {
  draft: "0", // 草稿
  signing: "1", // 签署中
  finish: "2", // 完成
  revoke: "3", // 撤销
  expire: "5", // 过期
  reject: "7", // 拒签
};

// 签署任务状态
export const SIGN_ITEM_STATUS = {
  waiting: "0", // 等待签署
  signing: "1", // 签署中
  finish: "2", // 已签署
  waitingApproval: "3", // 等待审批
  reject: "4", // 已拒签
};

// 审核结果
export const DM_AUDIT_RESULT = {
  pass: "1", // 通过
  reject: "2", // 驳回
};

// 办结类型
export const DM_FINISH_TYPE = {
  normal: "1", // 正常办结
  terminateAccept: "2", // 终止受理
  terminateMediate: "3", // 终止调解
};

// 提交归档状态
export const DM_ARCHIVE_STATUS = {
  apply: "1", // 提交归档
  reject: "2", // 驳回
};

// 通话记录关联类型
export const RECORD_RELATION_TYPE = {
  investigationRecordSound: "1", // 调查记录和通话录音记录关联
  mediationRecordSound: "2", // 调解记录和通话录音记录关联
  mediationRecordVideo: "3", // 调解记录和调解室录像记录关联
};

// 纠纷业务派单审核记录状态
export const DM_MEDIATOR_AUDIT_STATUS = {
  toAudit: "0", // 调查记录
  pass: "1", // 已通过
  reject: "2", // 已驳回
  cancel: "3", // 已撤回
};

// 纠纷业务创建类型
export const DM_CREATE_TYPE = {
  TYPE1: "1", // 中心新增
  TYPE2: "2", // 机构新增
  TYPE3: "3", // 中心导入
  TYPE4: "4", // 法院新增
};

// 调解室录像状态
export const DM_VIDEO_STATUS = {
  STATUS0: "0", // 待下载
  STATUS1: "1", // 待转码
  STATUS2: "2", // 待上传
  STATUS3: "3", // 已上传
};

// 调解室录像审核状态
export const DM_VIDEO_AUDIT_STATUS = {
  STATUS1: "1", // 待组长审核
  STATUS2: "2", // 待部门长审核
  STATUS11: "11", // 组长驳回
  STATUS12: "12", // 部门长驳回
  STATUS20: "20", // 通过
};
// 自然人/法人
export const DM_IDENTITY_TYPE = {
  NATURAL: "0", // 自然人
  LEGAL: "1", // 法人
};
// 渠道类型
export const DM_CHANNEL_TYPE = {
  MONITOR: "0", // 监管信访先行引导
  APPLY: "1", // 当事人自行申请调解
};
// 发文类型
export const DM_DOCUMENT_SENDING_TYPE = {
  '6': "津众和发",
  '7': "调解风险建议书",
  '8': "津众和党发",
  '9': "津众和函",
  '10': "津众和便函",
  '11': "主任办公会议纪要",
};
// 收文类型
export const DM_DOCUMENT_SENDING_TYPE2 = {
  '0': "津众和发",
  '1': "调解风险建议书",
  '2': "津众和党发",
  '3': "津众和函",
  '4': "津众和便函",
  '5': "主任办公会议纪要",
};

