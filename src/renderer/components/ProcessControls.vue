<template>
  <div id="process-controls">
    <span>
      {{ data.status }}
    </span>
    <b-button-group>
      <b-button v-if="showClear" variant="warning" @click="clearLog"> Clear Log </b-button>
      <b-button variant="success" v-on:click="start"> Start </b-button>
      <b-button variant="danger" v-on:click="stop"> Stop </b-button>
      <b-button variant="info" v-on:click="restart"> Restart </b-button>
    </b-button-group>
  </div>
</template>

<script>
export default {
  props: ['id', 'showClear'],
  data() {
    return {
      data: this.$store.state.Process[this.id] || {},
    }
  },
  created() {
    this.$store.dispatch('init', { id: this.id })
  },
  methods: {
    clearLog() {
      this.$store.dispatch('logClear', { id: this.id })
    },
    stop() {
      window.electronAPI.send(this.id + '.control', 'stop')
    },
    start() {
      window.electronAPI.send(this.id + '.control', 'start')
    },
    restart() {
      window.electronAPI.send(this.id + '.control', 'restart')
    },
  },
}
</script>

<style scoped>
#process-controls {
  text-align: right;
}
.btn-group {
  margin: 15px;
}
</style>
