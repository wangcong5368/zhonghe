import defaultSettings from '@/settings'

const { sideTheme, showSettings, topNav, tagsView, fixedHeader, sidebarLogo, dynamicTitle } = defaultSettings

const storageSetting = JSON.parse(localStorage.getItem('layout-setting')) || ''
const state = {
  title: '',
  theme: storageSetting.theme || '#409EFF',
  sideTheme: storageSetting.sideTheme || sideTheme,
  showSettings: showSettings,
  topNav: storageSetting.topNav === undefined ? topNav : storageSetting.topNav,
  tagsView: storageSetting.tagsView === undefined ? tagsView : storageSetting.tagsView,
  fixedHeader: storageSetting.fixedHeader === undefined ? fixedHeader : storageSetting.fixedHeader,
  sidebarLogo: storageSetting.sidebarLogo === undefined ? sidebarLogo : storageSetting.sidebarLogo,
  dynamicTitle: storageSetting.dynamicTitle === undefined ? dynamicTitle : storageSetting.dynamicTitle,

  // 话务系统模块
  callInfo: {
    open: false,
    callStatus: '',
    data: {},
    workOrderId: null,
    dialNumber: null,
  }
}
const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
  SET_CALL_INFO_CALL_STATUS: (state, data) => {
    state.callInfo.callStatus = data
  },
  SET_CALL_INFO_DATA: (state, data) => {
    state.callInfo.data = data
  },
  SET_CALL_INFO_OPEN: (state, data) => {
    state.callInfo.open = data.open
    state.callInfo.workOrderId = data.workOrderId
    state.callInfo.dialNumber = data.dialNumber
  },
}

const actions = {
  // 修改布局设置
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  // 设置网页标题
  setTitle({ commit }, title) {
    state.title = title
  },

  setCallInfoCallStatus({ commit }, data) {
    commit('SET_CALL_INFO_CALL_STATUS', data)
  },

  setCallInfoData({ commit }, data) {
    commit('SET_CALL_INFO_DATA', data)
  },

  setCallInfoOpen({ commit }, data) {
    commit('SET_CALL_INFO_OPEN', data)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
