<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <b-table striped :items="processes" :fields="['name', { key: 'status', label: '' }]">
          <template #cell(name)="data">
            <b-link :to="'/' + data.item.id">
              {{ data.value }}
            </b-link>
          </template>
          <template #cell(status)="data">
            <process-controls :id="data.item.id" />
          </template>
        </b-table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import ProcessControls from './ProcessControls'

export default {
  components: {
    'process-controls': ProcessControls,
  },
  data() {
    return {
      processes: [],
    }
  },
  created() {
    window.electronAPI.on('processes.get', (data) => {
      this.processes = data || []

      // ensure they have all been init
      for (let p of this.processes) {
        this.$store.dispatch('init', { id: p.id })
      }
    })
    window.electronAPI.send('processes.get')
  },
}
</script>

<style scoped></style>
