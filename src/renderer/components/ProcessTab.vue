<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <div id="status-bar">
          <process-controls :key="this.$route.params.id" :id="this.$route.params.id" showClear="1" />
        </div>

        <ul id="log-panel" v-chat-scroll="{ always: false }">
          <li v-for="(l, i) in data.log" v-bind:key="i" :class="[l.type, logClass(l)]">
            {{ l.content }}
          </li>
        </ul>
        <b-form ref="commandForm" @submit.prevent="onSubmit" v-bind:class="{ hidden: !data.showCommandSend }">
          <b-input-group>
            <b-form-input placeholder="Enter a command" id="command"></b-form-input>
            <b-button type="submit">Send</b-button>
          </b-input-group>
        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { ipcRenderer } from 'electron'
import ProcessControls from './ProcessControls'

export default {
  components: {
    'process-controls': ProcessControls,
  },
  data() {
    return {
      data: this.$store.state.Process[this.$route.params.id] || {},
    }
  },

  watch: {
    $route(to, from) {
      this.$store.dispatch('init', { id: this.$route.params.id })
      this.data = this.$store.state.Process[to.params.id] || {}
    },
  },

  methods: {
    logClass(l) {
      if (l.content.indexOf('[fatal]') !== -1) {
        return 'fatal'
      }
      if (l.content.indexOf('[error]') !== -1) {
        return 'error'
      }
      if (l.content.indexOf('[warning]') !== -1) {
        return 'warning'
      }
      if (l.content.indexOf('[info]') !== -1) {
        return 'info'
      }

      return null
    },
    onSubmit(submitEvent) {
      const command = submitEvent.target.elements.command.value
      ipcRenderer.send(this.$route.params.id + '.control', 'command', command)
      this.$refs.commandForm.reset()
    },
  },
}
</script>

<style scoped>
#status-bar {
  text-align: right;
}

#log-panel {
  list-style-type: none;
  overflow: scroll;

  overflow-y: scroll;
  height: calc(100vh - 56px - 38px - 100px);

  font-family: courier;
  font-size: 0.95em;
}

#log-panel li {
  white-space: nowrap;
}

#log-panel li.event {
  color: blue;
}

#log-panel li.log.error {
  color: red;
}
#log-panel li.log.fatal {
  color: red;
  font-weight: bold;
}
#log-panel li.log.warning {
  color: orange;
}

.hidden {
  display: none;
}
</style>
