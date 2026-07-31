<template>
  <div id="app">
    <router-view/>
    <theme-picker/>
    <transition name="el-zoom-in-top">
      <CallOut v-if="showCallOut"/>
    </transition>
  </div>
</template>

<script>
import ThemePicker from '@/components/ThemePicker'
import CallOut from '@/components/CallOut/index.vue'

export default {
  name: 'App',
  components: {
    ThemePicker,
    CallOut
  },
  data() {
    return {
      showCallOut: false
    }
  },
  mounted() {
  },
  watch: {
    '$store.state.settings.callInfo.open'(newV) {
      this.showCallOut = newV
    },
    '$store.getters.userInfo'(newV) {
      if (newV) {
        this.$callWs.formData.queue = newV.seatNum && newV.seatNum.toString().slice(0, 5) || ''
        this.$callWs.formData.ola_extn = newV.seatNum && newV.seatNum.toString().slice(5) || ''
        this.$callWs.websocket_connect()
      }
    }
  },
  methods: {}
}
</script>
