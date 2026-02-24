<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="dark" sticky>
      <b-navbar-nav>
        <b-nav-item to="/" exact> Status </b-nav-item>
        <b-nav-item v-for="val in processes" :key="val.id" :to="'/' + val.id">
          {{ val.name }}
        </b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <b-nav-item to="/settings" right> Settings </b-nav-item>
      </b-navbar-nav>
    </b-navbar>

    <router-view />
  </div>
</template>

<script>
export default {
  name: 'CasparcgLauncher',
  data() {
    return {
      processes: [],
    }
  },

  created() {
    window.electronAPI.on('processes.get', (data) => {
      this.processes = data || []
    })
    window.electronAPI.send('processes.get')
  },
}
</script>

<style>
/* CSS */
</style>
