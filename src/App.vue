<template>
  <div id="app">
    <div class="md-layout">
      <h1 class="md-layout-item">快捷 kancolle 指令发送</h1>
    </div>
    <Command />
  </div>
</template>

<script>
import Command from './components/Command.vue';

export default {
  name: 'app',
  components: {
    Command,
  },
};
</script>

<style>
  body {
    margin: 0;
    font-size: 14px;
  }

  #app {
    font-family: "Noto Sans", "Noto Sans CJK SC",
    "Microsoft YaHei", "微软雅黑",
    tahoma, arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }
</style>
