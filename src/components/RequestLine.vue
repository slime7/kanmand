<template>
  <div>
    <div>request line</div>
    <ul>
      <li v-for="r in requests" :key="r.index">{{ r.route }}</li>
    </ul>
  </div>
</template>

<script>
// import { ipcRenderer } from 'electron'; // eslint-disable-line

export default {
  name: 'RequestLine',

  computed: {
    requests() {
      return this.$store.state.requests;
    },
  },
};
</script>

<style scoped>

</style>
