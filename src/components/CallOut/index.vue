<template>
  <div class="callOutTip">
    <el-header style="padding: 0">
      <span class="el-dialog__title" style="margin-right: 5px">当前状态:</span>
      <el-tag :type="getCallOutStateType(callStatus)" v-if="callStatus">
        {{ getCallOutStateStr(callStatus) + (getPrivateDataStr() ? '(' + getPrivateDataStr() + ')' : '') }}
      </el-tag>
      <div class="top-right-btn" style="margin-top: -5px">
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="text" icon="el-icon-close" style="color: #c0c0c0" @click="close"/>
          </el-col>
        </el-row>
      </div>
    </el-header>

    <el-row style="margin-bottom: 10px">
      <el-col :span="24">
        <span>通话号码: </span>
        <el-tooltip class="item" effect="dark" content="点击搜索历史调解工单" placement="top">
          <span @mouseenter="show('el-tooltip__popper')">
            <el-button type="text" @click="changeRule" v-if="phoneNumber" style="font-size: 16px">
              {{ phoneNumber }}
            </el-button>
          </span>
        </el-tooltip>
      </el-col>
    </el-row>
    <el-row style="margin-bottom: 10px">
      <el-col :span="24">
        <span>本分机号: {{ store.getters.userInfo.seatNum }}</span>
      </el-col>
    </el-row>
    <el-row style="margin-bottom: 10px" v-if="workOrderId">
      <el-col :span="24">
        <span>工单编号: {{ workOrderId }}</span>
      </el-col>
    </el-row>

    <el-divider/>

    <!--    <el-row :gutter="10">-->
    <!--      <el-col :span="1.5">-->
    <!--        <el-button type="primary" size="small" @click="connect" v-if="callStatus === 'logout'">连接</el-button>-->
    <!--      </el-col>-->
    <!--      <el-col :span="1.5">-->
    <!--        <el-button type="success" size="small" @click="dial" v-if="callStatus === 'ready' || callStatus === 'unready'">拨号</el-button>-->
    <!--      </el-col>-->
    <!--      <el-col :span="1.5">-->
    <!--        <el-button type="primary" size="small" @click="transfer" v-if="callStatus === 'busy'">转接</el-button>-->
    <!--      </el-col>-->
    <!--      <el-col :span="1.5">-->
    <!--        <el-button type="danger" size="small" @click="hangup" v-if="callStatus === 'busy'">挂机</el-button>-->
    <!--      </el-col>-->
    <!--      <el-col :span="1.5">-->
    <!--        <el-button type="success" size="small" @click="goReady" v-if="callStatus === 'unready' || callStatus === 'login' || callStatus === 'acw'">示闲</el-button>-->
    <!--      </el-col>-->
    <!--      <el-col :span="1.5">-->
    <!--        <el-dropdown trigger="click" @command="goBreak" v-if="callStatus === 'ready' || callStatus === 'acw'">-->
    <!--          <el-button type="danger" size="small">示忙<i class="el-icon-arrow-down el-icon&#45;&#45;right" /></el-button>-->
    <!--          <el-dropdown-menu slot="dropdown">-->
    <!--            <el-dropdown-item command="away">外出中</el-dropdown-item>-->
    <!--            <el-dropdown-item command="rest">小休中</el-dropdown-item>-->
    <!--            <el-dropdown-item command="conference">会议中</el-dropdown-item>-->
    <!--            <el-dropdown-item command="trainning">培训中</el-dropdown-item>-->
    <!--            <el-dropdown-item command="coach">辅导中</el-dropdown-item>-->
    <!--          </el-dropdown-menu>-->
    <!--        </el-dropdown>-->
    <!--      </el-col>-->
    <!--    </el-row>-->

    <el-button type="primary" size="small" @click="connect">连接</el-button>

    <el-divider/>

    <el-row :gutter="10">
      <el-col :span="18">
        <el-form ref="dialNumberForm" :model="dialNumberForm">
          <el-form-item prop="dialNumber"
                        :rules="[{ required: true, message: '请输入电话号码', trigger: 'blur' }]"
          >
            <el-input v-model="dialNumberForm.dialNumber" size="small" placeholder="请输入电话号码"/>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="6">
        <el-button type="success" size="small" @click="dial()">拨号</el-button>
      </el-col>
    </el-row>

    <!--    <el-divider />-->

    <el-row :gutter="10">
      <el-col :span="1.5">
        <el-popover placement="left" v-model="turnNumberPopover" width="350" trigger="click">
          <template v-if="turnNumberPopover">
            <el-row :gutter="10">
              <template v-for="(value, key) in turnNumbers">
                <el-col :span="8">
                  <el-tooltip class="item" :disabled="!getBreakReasonStr(value.privateData) && !value.nickNames"
                              effect="dark" placement="top"
                              :content="getBreakReasonStr(value.privateData) + (value.nickNames ? '(' + value.nickNames.join(',') + ')' : '')"
                  >
                    <span @mouseenter="show('el-tooltip__popper')">
                      <el-button :type="getCallOutStateType(value.state)" size="mini" @click="transfer(key)" plain
                                 style="margin-bottom: 10px;width: 100%"
                                 :disabled="value.disabled"
                      >
                        {{ key + (value.state ? '(' + getCallOutStateStr(value.state) + ')' : '') }}
                      </el-button>
                    </span>
                  </el-tooltip>
                </el-col>
              </template>
            </el-row>
            <el-divider/>
            <el-row :gutter="10">
              <el-col :span="18">
                <el-form ref="turnNumberForm" :model="turnNumberForm">
                  <el-form-item prop="turnNumber"
                                :rules="[{ required: true, message: '请输入转接电话号码', trigger: 'blur' }]"
                  >
                    <el-input v-model="turnNumberForm.turnNumber" size="small" placeholder="请输入转接电话号码"/>
                  </el-form-item>
                </el-form>
              </el-col>
              <el-col :span="6">
                <el-button type="primary" size="small" @click="transfer()">转接</el-button>
              </el-col>
            </el-row>
          </template>
          <el-button slot="reference" type="primary" size="small">
            转接<i class="el-icon-arrow-down el-icon--right"/>
          </el-button>
        </el-popover>
      </el-col>

      <el-col :span="1.5">
        <el-button type="danger" size="small" @click="hangup">挂机</el-button>
      </el-col>
    </el-row>

    <el-divider/>

    <el-row :gutter="10">
      <el-col :span="1.5">
        <el-button type="success" size="small" @click="goReady">示闲</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-dropdown trigger="click" @command="goBreak">
          <el-button type="danger" size="small">示忙<i class="el-icon-arrow-down el-icon--right"/></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="away">外出中</el-dropdown-item>
            <el-dropdown-item command="rest">小休中</el-dropdown-item>
            <el-dropdown-item command="conference">会议中</el-dropdown-item>
            <el-dropdown-item command="trainning">培训中</el-dropdown-item>
            <el-dropdown-item command="coach">辅导中</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import store from '@/store'
import axios from 'axios'
import { getCallOutUser } from '@/api/system/user'

export default {
  name: 'CallOut',
  computed: {
    store() {
      return store
    }
  },
  components: {},
  data() {
    return {
      workOrderId: null,
      callStatus: '',
      data: {},
      phoneNumber: '',
      dialNumberForm: {
        dialNumber: null
      },
      turnNumberForm: {
        turnNumber: null
      },
      turnNumbers: {},
      turnNumberPopover: false,
      dsq: null,
      zIndexTimer: null,
      mutationObserver: null,
    }
  },
  watch: {
    '$store.state.settings.callInfo': {
      handler(newVal) {
        if (newVal) {
          this.callStatus = newVal.callStatus
          this.data = newVal.data
          if (this.data.state === 'busy') {
            this.phoneNumber = this.data.dnis
          }
          this.workOrderId = newVal.workOrderId
          this.dialNumberForm.dialNumber = newVal.dialNumber
        }

        // 根据CallOut是否显示来控制定时器
        if (newVal && newVal.open) {
          if (!this.mutationObserver) {
            this.startZIndexMonitor();
          }
        } else {
          this.stopZIndexMonitor();
        }
      },
      deep: true, // 开启深度监控
      immediate: true // 立即执行一次
    },
    'turnNumberPopover'(newValue) {
      if (newValue) {
        this.turnNumberForm = {
          turnNumber: null
        }
        this.turnNumbers = {}
        for (let i = 101; i <= 140; i++) {
          this.turnNumbers[i.toString()] = { state: '', privateData: '', disabled: false, type: 'info' }
        }
        for (let i = 101; i <= 140; i++) {
          axios.get(`/call/api/ola/agents/${i}`).then(res => {
            if (res.status === 200) {
              this.turnNumbers[i.toString()].state = res.data.agent[0].state
              this.turnNumbers[i.toString()].privateData = res.data.agent[0].private_data
              this.turnNumbers[i.toString()].disabled = this.getCallOutStateStr(res.data.agent[0].state) !== '示闲中'
              // 强制更新组件，重新渲染
              this.$forceUpdate()
            }
          }).catch(()=>{})
        }
        getCallOutUser().then(res => {
          Object.entries(res.data).forEach(([key, value]) => {
            if (this.turnNumbers.hasOwnProperty(key)) {
              this.turnNumbers[key].nickNames = value
            }
          })
          // 强制更新组件，重新渲染
          this.$forceUpdate()
        }).catch(()=>{})
        this.show('el-popover')
      }
    }
  },

  mounted() {
    // 组件挂载时根据显示状态决定是否启动监控
    const callInfo = this.$store.state.settings.callInfo;
    if (callInfo && callInfo.open) {
      this.startZIndexMonitor();
    }
  },

  beforeDestroy() {
    // 清理资源
    this.stopZIndexMonitor();
  },

  methods: {
    // 启动z-index监控
    startZIndexMonitor() {
      if (this.mutationObserver) return; // 避免重复启动

      // 立即执行一次检查
      this.ensureTopZIndex();

      // 创建MutationObserver监听DOM变化
      this.mutationObserver = new MutationObserver((mutations) => {
        // 检查是否有dialog相关的元素被添加或移除
        let shouldCheck = false;

        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            // 检查添加的节点
            for (const node of mutation.addedNodes) {
              if (node.nodeType === 1) { // 元素节点
                const element = node;
                // 检查是否是dialog、notification等元素
                if (element.classList && (
                  element.classList.contains('el-dialog__wrapper') ||
                  element.classList.contains('el-message-box__wrapper') ||
                  element.classList.contains('el-notification') ||
                  element.classList.contains('el-drawer') ||
                  element.classList.contains('el-loading-mask')
                )) {
                  shouldCheck = true;
                  break;
                }
              }
            }
            // 检查移除的节点（dialog关闭时需要重新调整）
            if (mutation.removedNodes.length > 0) {
              shouldCheck = true;
            }
          }
          if (shouldCheck) break;
        }

        // 只在有相关变化时才执行检查
        if (shouldCheck) {
          // 延迟执行，避免频繁触发
          if (this.zIndexTimer) {
            clearTimeout(this.zIndexTimer);
          }

          this.zIndexTimer = setTimeout(() => {
            this.ensureTopZIndex();
          }, 50);
        }
      });

      // 监听body的子元素变化
      this.mutationObserver.observe(document.body, {
        childList: true,  // 监听子元素的添加和移除
        subtree: true     // 监听所有后代节点
      });
    },

    // 停止z-index监控
    stopZIndexMonitor() {
      // 断开MutationObserver
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
        this.mutationObserver = null;
      }

      // 清理延时器
      if (this.zIndexTimer) {
        clearTimeout(this.zIndexTimer);
        this.zIndexTimer = null;
      }
    },

    // 确保CallOut组件始终在最高层级（但尊重重要弹窗）
    ensureTopZIndex() {
      const callOutElement = this.$el;
      if (!callOutElement) return;

      let maxZIndex = 99998;
      let hasImportantDialog = false;

      // 重要弹窗类型（应该在CallOut之上的）
      const importantDialogSelectors = [
        '.el-message-box__wrapper', // 确认框、警告框
        '.el-notification' // 通知
      ];

      // 普通dialog类型（CallOut应该在其之上的）
      const normalDialogSelectors = [
        '.el-dialog__wrapper',
        '.el-drawer',
        '.el-loading-mask'
      ];

      // 检查是否有重要弹窗
      importantDialogSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          hasImportantDialog = true;
          elements.forEach(element => {
            const zIndex = parseInt(window.getComputedStyle(element).zIndex);
            if (!isNaN(zIndex) && zIndex > maxZIndex) {
              maxZIndex = zIndex;
            }
          });
        }
      });

      // 如果有重要弹窗，CallOut应该在其之下
      if (hasImportantDialog) {
        const newZIndex = Math.max(maxZIndex - 1, 2000);
        if (callOutElement.style.zIndex !== newZIndex.toString()) {
          callOutElement.style.zIndex = newZIndex;
        }
        return;
      }

      // 没有重要弹窗时，检查普通dialog
      normalDialogSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // 跳过CallOut组件本身及其子元素
          if (callOutElement.contains(element) || element.contains(callOutElement)) return;

          const zIndex = parseInt(window.getComputedStyle(element).zIndex);
          if (!isNaN(zIndex) && zIndex > maxZIndex) {
            maxZIndex = zIndex;
          }
        });
      });

      // 设置CallOut的z-index为最大值+5，确保它在普通dialog之上，最小值为99999
      const newZIndex = Math.max(maxZIndex + 5, 99999);
      if (callOutElement.style.zIndex !== newZIndex.toString()) {
        callOutElement.style.zIndex = newZIndex;
      }
    },
    close() {
      this.$store.dispatch('settings/setCallInfoOpen', {
        open: false,
        workOrderId: null,
        dialNumber: null
      })
    },
    // 连接
    connect() {
      this.$callWs.websocket_connect()
      // this.$store.dispatch('settings/setCallInfoCallStatus', 'login')
    },
    // 拨号
    dial(phoneNumber) {
      if (phoneNumber) {
        this.dialNumberForm.dialNumber = phoneNumber
      }
      this.$refs['dialNumberForm'].validate((valid) => {
        if (valid) {
          this.$ola.dial(this.dialNumberForm.dialNumber, this.workOrderId ? this.workOrderId : '')
          // this.phoneNumber = this.dialNumberForm.dialNumber
          // this.$store.dispatch('settings/setCallInfoCallStatus', 'busy')
        }
      })
    },

    // 示闲
    goReady() {
      this.$ola.go_ready()
      // this.$store.dispatch('settings/setCallInfoCallStatus', 'ready')
    },
    // 示忙
    goBreak(command) {
      this.$ola.go_break(command)
      // this.$store.dispatch('settings/setCallInfoCallStatus', 'unready')
      // this.$store.dispatch('settings/setCallInfoBreakReason', command)
    },
    // 挂机
    hangup() {
      this.$ola.hangup()
      // this.$store.dispatch('settings/setCallInfoCallStatus', 'acw')
    },
    // 转接
    transfer(phoneNumber) {
      if (phoneNumber) {
        this.turnNumberForm.turnNumber = phoneNumber
      }
      this.$refs['turnNumberForm'].validate((valid) => {
        if (valid) {
          this.$ola.transfer(this.turnNumberForm.turnNumber)
          // this.$store.dispatch('settings/setCallInfoCallStatus', 'acw')
          this.turnNumberPopover = false
        }
      })
    },

    changeRule() {
      this.$router.push({ path: '/mediation/disputeMediation', query: { phoneNumber: this.phoneNumber } })
    },

    show(className) {
      if (this.dsq) {
        clearTimeout(this.dsq)
      }
      this.dsq = setTimeout(() => {
        const node = document.getElementsByClassName(className)
        // 遍历
        for (let i = 0; i < node.length; i++) {
          node[i].style.zIndex = 100000
        }
      }, 1)
    },

    getPrivateDataStr() {
      if (this.data.state === 'busy') {
        if (this.data.call_direction === 'outbound') {
          if (this.data.private_data === 'calling') {
            return '拨号中'
          } else if (this.data.private_data === 'answered') {
            if (this.data.other_answered === false) {
              return '振铃中'
            } else if (this.data.other_answered === true) {
              return ''
            }
          }
        } else if (this.data.call_direction === 'inbound') {
          if (this.data.private_data === 'ring') {
            return '振铃中'
          } else if (this.data.private_data === 'answered') {
            return ''
          }
        }
      } else if (this.data.state === 'unready') {
        switch (this.data.private_data) {
          case 'away':
            return '外出中'
          case 'rest':
            return '小休中'
          case 'conference':
            return '会议中'
          case 'trainning':
            return '培训中'
          case 'coach':
            return '辅导中'
          default:
            return ''
        }
      }
      return ''
    },

    getBreakReasonStr(breakReason) {
      switch (breakReason) {
        case 'away':
          return '外出中'
        case 'rest':
          return '小休中'
        case 'conference':
          return '会议中'
        case 'trainning':
          return '培训中'
        case 'coach':
          return '辅导中'
        default:
          return ''
      }
    }
  }
}
</script>

<style scoped lang="scss">
.callOutTip {
  position: fixed;
  z-index: 99999;
  right: 10px;
  top: 50px;
  width: 330px;
  padding: 14px 26px 14px 13px;
  border-radius: 8px;
  box-sizing: border-box;
  border: 1px solid #ebeef5;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  transition: opacity 0.3s, transform 0.3s, left 0.3s, right 0.3s, top 0.4s, bottom 0.3s;
  overflow: hidden;
}

.el-dropdown-menu {
  z-index: 100000 !important;
}

::v-deep .el-popover {
  z-index: 100000 !important;
}

::v-deep .el-popper {
  z-index: 100000 !important;
}

::v-deep .el-tooltip__popper {
  z-index: 100000 !important;
}
</style>
