// Vue 2 Plugin for ola API
import conf from '@/conf'
import store from '@/store'

const OlaPlugin = {
  install(Vue, options = {}) {
    const callWs = {
      state: {
        phoneNumber: '187050000000',
        dialogVisible: false,
        btnLoading: false,
        formData: {
          // serverIp: "shanrenliu.xicp.net",
          serverIp: conf.server.serverIp,
          serverPort: conf.server.serverPort,
          queue: conf.server.queue,
          ola_extn: store.getters.userInfo.seatNum + '',
          password: conf.server.password
        },
        dialNumber: '',
        turnNumber: '',
        breakReason: 'rest',
        connectionStatus: '',
        ola_extnStatus: ''
      },
      formData: {
        // serverIp: "shanrenliu.xicp.net",
        serverIp: conf.server.serverIp,
        serverPort: conf.server.serverPort,
        queue: conf.server.queue,
        ola_extn: store.getters.userInfo.seatNum + '',
        password: conf.server.password
      },

      // reset() {
      //   this.$refs.ruleForm.resetFields()
      //   store.dispatch('settings/changeCallOutFlag', false)
      // },

      websocket_connect() {
        console.log(' websocket_connect')
        // console.log('seatNum', store.getters.userInfo.seatNum)
        const { serverIp, serverPort, ola_extn, password } = callWs.formData
        const url = `ws://${serverIp}:${serverPort}/ola_socket`
        ola.onConnect = callWs.onConnect
        ola.onMessage = callWs.onMessage
        ola.onClose = callWs.onClose
        ola.connect(url, ola_extn, password)
      },
      onConnect() {
        console.log('websocket connected!')
        callWs.state.connectionStatus = 'Connected'
        const { ola_extn } = callWs.formData
        ola._extn = ola_extn
        ola.subscribe('ola.agent.' + ola_extn)
        ola.subscribe('ola.caller.' + ola_extn)
        ola.get_agent_state(ola_extn)

        //连接之后，先登出一次,防止其他地方已经登陆
        callWs.login()
        callWs.logout()
        callWs.login()
        callWs.goReady()
      },
      onClose() {
        callWs.state.connectionStatus = 'Disconnected'
        // callWs.setOlaExtnStatus('未签入')
        // store.dispatch('settings/setCallInfoCallStatus', 'logout')
      },
      onMessage(evt) {
        const data = JSON.parse(evt.data)
        console.log("data", data)
        if (data.event_type === 'agent_state') {
          store.dispatch('settings/setCallInfoCallStatus', data.state)
          store.dispatch('settings/setCallInfoData', data)
          if (data.state === 'busy' && data.call_direction === 'inbound' && data.private_data === 'ring') {
            this.$store.dispatch('settings/setCallInfoOpen', {
              open: true,
              workOrderId: null,
              dialNumber: null,
            })
          } else if (data.state === 'acw') {
            // 挂机后系统可以返回两种状态:acw 话后整理状态 ready 示闲状态，如果不需要acw，可以联系我们后台修改配置，如果需要保留，如果需要再次
            // 拨打电话的话，需要手动点击示闲按钮
            callWs.goReady()
            // this.$alert("已挂机");
            // Vue.$modal.msgWarning('已挂机');
          }
        } else if (data.event_type === 'agent_caller_state') {
          // special feature, never mind
          if (data.action === 'in') {
            $('#caller_queue').append(' <a id=\'' + data.caller.uuid + '\' href=\'#\' onclick="take_call(\'' + data.caller.uuid + '\');return false;">' + data.caller.cid_number + '</a>')
          } else {
            $('#' + data.caller.uuid).remove()
          }
        } else if (data.event_type === 'command/reply') {
        }
      },
      login() {
        const { queue, ola_extn } = callWs.formData
        const queues = queue.split(',')
        ola.login(queues, ola_extn, { type: 'onhook' })
        // 已签入
        // callWs.setOlaExtnStatus('已签入')
        // store.dispatch('settings/setCallInfoCallStatus', "login")
      },
      logout() {
        ola.logout()
        // 未签入
        // callWs.setOlaExtnStatus('未签入')
        // store.dispatch('settings/setCallInfoCallStatus', "logout")
      },
      goReady() {
        ola.go_ready()
        // callWs.setOlaExtnStatus('示闲中')
        // store.dispatch('settings/setCallInfoCallStatus', "ready")
      },
    }
    const ola = {
      version: '2.0.1',
      ws: undefined,
      uuid: '73836387-0000-0000-0000-0000-0000000000',
      connected: false,
      socket_connected: false,
      onConnect: undefined,
      onMessage: undefined,
      onClose: undefined,
      _connectSuccess: undefined,
      _connectError: undefined,
      _username: undefined,
      _password: undefined,
      _extn: undefined,

      connect(url, username, password, success, error) {
        if (!url) url = `ws://${document.location.hostname}:${document.location.port}/ola_socket`

        if ('WebSocket' in window) {
          // browser supports websockets
          this.ws = new WebSocket(url)
          if (this.ws) {
            this.ws.onclose = ola.onClose || (() => console.log('WebSocket closed.'))
            this.ws.onopen = this._onOpen
            this.ws.onmessage = this._onMessage
            this._connectSuccess = success
            this._connectError = error
            this._username = username
            this._password = password
          }
        } else {
          // browser does not support websockets
          if ('console' in window) {
            console.log('you don\'t have websocket')
          }
          return false
        }
      },

      close() {
        ola.ws.close()
      },
      _onOpen() {
        ola.auth(ola._username, ola._password)
      },

      _onMessage(evt) {
        try {
          const msg = JSON.parse(evt.data)
          console.log('js.msg:', msg)
          if (msg.event_name === 'command/reply' && msg.code === 200) {
            this.ws.onmessage = options.onMessage || (evt => console.log(evt.data))
          }
          ola.ws.onmessage = ola.onMessage
          ola.onConnect()
        } catch (err) {
          console.error('Error parsing message: ', err)
        }
      },

      auth(username, password) {
        return this.send({ cmd: 'auth', args: { username, password, accept: 'application/json' } })
      },

      send(msg) {
        console.log('send:', msg)
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          msg.uuid = this.nextUuid()
          this.ws.send(JSON.stringify(msg))
          return msg.uuid
        } else {
          console.error('WebSocket is not open.')
          return null
        }
      },

      nextUuid() {
        let u = (parseFloat(this.uuid.substring(29)) + 1).toString()
        u = u === '2147483647' ? '0' : u
        while (u.length < 12) {
          u = '0' + u
        }
        this.uuid = `73836387-0000-0000-0000-0000-${u}`
        return this.uuid
      },

      merge(target, additional) {
        for (const key in additional) {
          if (additional.hasOwnProperty(key)) {
            target[key] = additional[key]
          }
        }
      },

      // All methods from the original file
      get_agent_state() {
        return this.send({ action: 'api', cmd: 'get_agent_state', args: { extn: this._extn } })
      },

      get_trunk_state() {
        return this.send({ action: 'api', cmd: 'get_trunk_state' })
      },

      login(queue, extn, params) {
        const args = { queue, extn, ...params }
        this._extn = extn
        return this.send({ action: 'api', cmd: 'login', args })
      },

      logout() {
        return this.send({ action: 'api', cmd: 'logout', args: { extn: this._extn } })
      },

      collect_dtmf(extn, soundfile) {
        return this.send({ action: 'api', cmd: 'collect_dtmf', args: { extn, soundfile } })
      },

      collect_judge(extn) {
        return this.send({ action: 'api', cmd: 'collect_judge', args: { extn } })
      },

      ping() {
        return this.send({ cmd: 'ping' })
      },

      subscribe(key) {
        return this.send({ cmd: 'subscribe', args: { key } })
      },

      unsubscribe(key) {
        return this.send({ cmd: 'unsubscribe', args: { key } })
      },

      go_ready() {
        return this.send({ action: 'api', cmd: 'go_ready', args: { extn: this._extn } })
      },

      go_ready2(extn) {
        return this.send({ action: 'api', cmd: 'go_ready', args: { extn } })
      },

      go_break(reason) {
        return this.send({ action: 'api', cmd: 'go_break', args: { extn: this._extn, reason } })
      },

      go_break2(extn) {
        return this.send({ action: 'api', cmd: 'go_break', args: { extn, reason: '' } })
      },

      toggle_ready() {
        return this.send({ action: 'api', cmd: 'toggle_ready', args: { extn: this._extn } })
      },

      answer() {
        return this.send({ action: 'api', cmd: 'answer', args: { extn: this._extn } })
      },

      hangup() {
        return this.send({ action: 'api', cmd: 'hangup_other', args: { extn: this._extn } })
      },

      dial(dst, otherStr, gateway) {
        return this.send({ action: 'api', cmd: 'dial', args: { extn: this._extn, dest: dst, gateway, otherStr } })
      },

      transfer(dst, src) {
        const extn = src || this._extn
        return this.send({ action: 'api', cmd: 'transfer', args: { extn, dest: dst } })
      },

      transfer_uuid(uuid, dst) {
        return this.send({ action: 'api', cmd: 'transfer', args: { channel_uuid: uuid, dest: dst } })
      },

      monitor(dst, src) {
        const extn = src || this._extn
        return this.send({ action: 'api', cmd: 'monitor', args: { extn, dest: dst } })
      },

      monitor_uuid(uuid) {
        return this.send({ action: 'api', cmd: 'monitor', args: { extn: this._extn, channel_uuid: uuid } })
      },

      intercept(dst, src) {
        const extn = src || this._extn
        return this.send({ action: 'api', cmd: 'intercept', args: { extn, dest: dst } })
      },

      intercept_uuid(uuid) {
        return this.send({ action: 'api', cmd: 'intercept', args: { extn: this._extn, channel_uuid: uuid } })
      },

      three_way(dst, src, gateway) {
        const extn = src || this._extn
        return this.send({
          action: 'api',
          cmd: 'monitor',
          args: { extn, dest: dst, three_way: 'true', goip_gateway: gateway }
        })
      },

      exit_three_way(ext) {
        return this.send({ action: 'api', cmd: 'unmonitor', args: { extn: ext, three_way: 'true' } })
      },

      three_way_uuid(uuid) {
        return this.send({
          action: 'api',
          cmd: 'monitor',
          args: { extn: this._extn, channel_uuid: uuid, three_way: 'true' }
        })
      },

      unmonitor(ext) {
        return this.send({ action: 'api', cmd: 'unmonitor', args: { extn: ext } })
      },

      whisper(who) {
        return this.send({ action: 'api', cmd: 'whisper', args: { extn: this._extn, who } })
      },

      consult(dst) {
        return this.send({ action: 'api', cmd: 'consult', args: { extn: this._extn, dest: dst } })
      },

      unconsult(dst) {
        return this.send({ action: 'api', cmd: 'unconsult', args: { extn: this._extn, dest: dst } })
      },

      hold() {
        return this.send({ action: 'api', cmd: 'hold', args: { extn: this._extn } })
      },

      unhold(dst) {
        return this.send({ action: 'api', cmd: 'unhold', args: { extn: this._extn } })
      },

      toggle_hold() {
        return this.send({ action: 'api', cmd: 'toggle_hold', args: { extn: this._extn } })
      },

      take_call(channel_uuid) {
        return this.send({ action: 'api', cmd: 'take_call', args: { extn: this._extn, channel_uuid } })
      },

      next_queue(uuid) {
        return this.send({ action: 'api', cmd: 'next_queue', args: { extn: this._extn, channel_uuid: uuid } })
      },

      conference(dst) {
        return this.send({ action: 'api', cmd: 'conference', args: { extn: this._extn, dest: dst } })
      },

      conference_uuid(uuid) {
        return this.send({ action: 'api', cmd: 'conference', args: { extn: this._extn, channel_uuid: uuid } })
      },

      broadcast(numbers, mute) {
        return this.send({ action: 'api', cmd: 'broadcast', args: { extn: this._extn, numbers, mute } })
      },

      chat(to, message, content_type) {
        return this.send({ action: 'api', cmd: 'chat', args: { to, message, content_type } })
      },

      message(from, to, message, content_type) {
        return this.send({ action: 'api', cmd: 'message', args: { from, to, message, content_type } })
      },

      alarm(queue, state) {
        return this.send({ action: 'api', cmd: 'alarm', args: { queue, state } })
      },

      dlogin(ext) {
        return this.send({ action: 'api', cmd: 'dlogin', args: { extn: ext } })
      },

      dlogout(ext) {
        return this.send({ action: 'api', cmd: 'dlogout', args: { extn: ext } })
      },

      inject(ext, uuid) {
        return this.send({ action: 'api', cmd: 'inject', args: { extn: ext, channel_uuid: uuid } })
      },

      kill(uuid, cause) {
        return this.send({ action: 'api', cmd: 'kill', args: { channel_uuid: uuid, cause } })
      },

      eavesdrop(uuid) {
        return this.send({ action: 'api', cmd: 'eavesdrop', args: { channel_uuid: uuid } })
      },

      conf(name, action, member) {
        return this.send({ action: 'api', cmd: 'conf', args: { name, action, member } })
      },

      answer_all(ext, queue) {
        return this.send({ action: 'api', cmd: 'answer_all', args: { extn: ext, queue } })
      },

      group_call(ext, queue, numbers, batch_accept) {
        return this.send({ action: 'api', cmd: 'group_call', args: { extn: ext, queue, numbers, batch_accept } })
      },

      sip_gateway(profile, gateway, op) {
        return this.send({ action: 'api', cmd: 'sip_gateway', args: { profile, gateway, op } })
      },

      play(conference, filename) {
        return this.send({ action: 'api', cmd: 'play', args: { conference, filename } })
      },

      stop_play(conference, filename) {
        return this.send({ action: 'api', cmd: 'play', args: { conference, filename } })
      },

      merge_call(ext1, ext2) {
        return this.send({ action: 'api', cmd: 'merge_call', args: { extn1: ext1, extn2: ext2 } })
      },

      api_handfree(ext) {
        return this.send({ action: 'api', cmd: 'api_handfree', args: { extn: ext } })
      },

      status(ext) {
        return this.ws ? this.ws.readyState : -1
      }
    }

    Vue.prototype.$ola = ola
    Vue.prototype.$callWs = callWs
  }
}

export default OlaPlugin
