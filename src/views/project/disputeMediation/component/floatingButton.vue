<!-- 悬浮窗 -->
<template>
  <div class="draggable-window" :style="{ left: x + 'px', top: y + 'px' }" @mousedown="startDrag">
    <el-button :type="buttonType" round @click="click">{{ title }}</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: null,
      parameter: {},
      callBackType: null,
      title: "悬浮按钮",
      x: 0, // 悬浮窗的初始 x 坐标
      y: 0, // 悬浮窗的初始 y 坐标
      xT: 0,
      yT: 0,
      isDragging: false, // 是否正在拖动
      startX: 0, // 鼠标按下时的初始 x 坐标
      startY: 0, // 鼠标按下时的初始 y 坐标
      mouseDownX: 0,
      mouseDownY: 0,
      mouseUpX: 0,
      mouseUpY: 0,
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      buttonType: "primary",
    };
  },
  mounted() {
    this.setMaxMin();
  },
  watch: {
    xT(newValue) {
      this.x = newValue < this.minX ? this.minX : (newValue > this.maxX ? this.maxX : newValue)
    },
    minX(newValue) {
      this.x = this.x < newValue ? newValue : (this.x > this.maxX ? this.maxX : this.x)
    },
    maxX(newValue) {
      this.x = this.x < this.minX ? this.minX : (this.x > newValue ? newValue : this.x)
    },
    yT(newValue) {
      this.y = newValue < this.minY ? this.minY : (newValue > this.maxY ? this.maxY : newValue)
    },
    minY(newValue) {
      this.y = this.y < newValue ? newValue : (this.y > this.maxY ? this.maxY : this.y)
    },
    maxY(newValue) {
      this.y = this.y < this.minY ? this.minY : (this.y > newValue ? newValue : this.y)
    },
  },
  methods: {
    open(id, title, parameter, callBackType, buttonType, x, y) {
      this.id = id;
      this.parameter = parameter;
      this.callBackType = callBackType;
      this.title = title;
      this.buttonType = buttonType;
      this.$nextTick(() => {
        if (x && y) {
          this.x = x;
          this.y = y;
        } else {
          // 获取 div 元素
          const divElement = document.querySelector('.draggable-window');  // 替换为实际的 class 或 id
          // 获取 div 的尺寸
          const rect = divElement.getBoundingClientRect();
          this.x = window.innerWidth - rect.width - 10;
          this.y = window.innerHeight - rect.height - 10;
        }
        this.setMaxMin();
      });
    },
    getPosition() {
      return {x: this.x, y: this.y};
    },
    startDrag(event) {
      // 开始拖动时触发
      this.isDragging = true;
      this.startX = event.clientX - this.x;
      this.startY = event.clientY - this.y;
      this.mouseDownX = event.clientX;
      this.mouseDownY = event.clientY;
      document.addEventListener('mousemove', this.drag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    drag(event) {
      // 拖动过程中触发
      if (this.isDragging) {
        this.xT = event.clientX - this.startX;
        this.yT = event.clientY - this.startY;
      }
    },
    stopDrag(event) {
      // 停止拖动时触发
      this.isDragging = false;
      this.mouseUpX = event.clientX;
      this.mouseUpY = event.clientY;
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.stopDrag);
    },
    setMaxMin() {
      // 获取 div 元素
      const divElement = document.querySelector('.draggable-window');
      // 获取 div 的尺寸
      const rect = divElement.getBoundingClientRect();
      const parentElement = this.$parent.$el;
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        // console.log("window", window.innerWidth, window.innerHeight);
        // console.log("screen", entry.contentRect.width, entry.contentRect.height);
        this.minX = window.innerWidth - entry.contentRect.width - 40
        this.minY = 100;
        this.maxX = window.innerWidth - rect.width - 10;
        this.maxY = window.innerHeight - rect.height - 10;
      });
      resizeObserver.observe(parentElement);
    },
    click() {
      // 如果正在拖动，则不执行点击事件
      if (this.mouseDownX === this.mouseUpX && this.mouseDownY === this.mouseUpY) {
        this.$emit('callback', this.id, this.parameter, this.callBackType);
      }
    }
  },
};
</script>

<style scoped>
.draggable-window {
  position: fixed;
  cursor: move;
  display: flex;
  flex-direction: column;
  z-index: 1;
}
</style>
