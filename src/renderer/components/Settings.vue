<template>
  <b-container fluid>
    <b-form @submit="onSubmit" @reset="onReset">
      <b-row>
        <b-col id="content">
          <legend>Processes</legend>
          <b-form-group
            id="basePathInputGroup"
            label="Base Path:"
            label-for="basePathInput"
            label-cols-sm="4"
            label-cols-lg="3"
            content-cols-sm
            content-cols-lg="7"
          >
            <b-input-group>
              <b-form-input id="basePathInput" type="text" v-model="config.basePath" placeholder="./"> </b-form-input>
              <b-button type="info" size="sm" class="mr-2" @click.stop="onOpenBasePath"> Open </b-button>
            </b-input-group>
          </b-form-group>

          <b-form-group
            id="logsPathInputGroup"
            label="Logs Path:"
            label-for="logsPathInput"
            label-cols-sm="4"
            label-cols-lg="3"
            content-cols-sm
            content-cols-lg="7"
          >
            <b-input-group>
              <b-form-input id="logsPathInput" type="text" v-model="config.logsPath" placeholder="logs/" />
              <b-button type="info" size="sm" class="mr-2" @click.stop="onOpenLogsPath"> Open </b-button>
            </b-input-group>
          </b-form-group>

          <b-form-group id="processesGroup" label-for="processesTable">
            <b-table-simple striped>
              <b-thead>
                <b-th>
                  Name

                  <b-button type="submit" variant="primary" @click="onAddProcessRow" size="sm" class="button-right">
                    Add
                  </b-button>
                </b-th>
              </b-thead>
              <b-tbody>
                <template v-for="(data, index) in config.processes">
                  <b-tr v-bind:key="'row-' + index">
                    <b-td>
                      <b-form inline>
                        <b-form-input
                          :id="'processName' + index"
                          v-model="config.processes[index].name"
                          type="text"
                          required
                          class="name-field"
                        />

                        <b-button
                          v-b-toggle="'collapse-' + index"
                          variant="primary"
                          size="sm"
                          class="button-margin-right"
                        >
                          <span class="when-open">Less</span><span class="when-closed">More</span> Options
                        </b-button>

                        <!-- we use @click.stop here to prevent emitting of a 'row-clicked' event  -->
                        <b-button size="sm" @click.stop="onRemoveProcessRow(index)" class="mr-2"> Remove </b-button>
                      </b-form>

                      <b-collapse v-bind:id="'collapse-' + index" class="mt-2">
                        <b-form-group
                          label="Executable"
                          :label-for="'processExeName' + index"
                          label-cols-sm="4"
                          label-cols-lg="3"
                          content-cols-sm
                          content-cols-lg="7"
                        >
                          <b-form-input
                            :id="'processExeName' + index"
                            v-model="config.processes[index].exeName"
                            type="text"
                            required
                          />
                        </b-form-group>

                        <b-form-group
                          label="Arguments"
                          :label-for="'processArgs' + index"
                          label-cols-sm="4"
                          label-cols-lg="3"
                          content-cols-sm
                          content-cols-lg="7"
                        >
                          <b-form-input
                            :id="'processArgs' + index"
                            v-model="config.processes[index].args"
                            type="text"
                          />
                        </b-form-group>

                        <b-form-group
                          label="Environment Variables"
                          :label-for="'env' + index"
                          label-cols-sm="4"
                          label-cols-lg="3"
                          content-cols-sm
                          content-cols-lg="7"
                        >
                          <b-table-simple>
                            <b-thead>
                              <b-th> Name </b-th>
                              <b-th> Value </b-th>
                              <b-th class="compact-column">
                                <b-button
                                  type="submit"
                                  variant="primary"
                                  @click="onAddEnvironmentVariable(index)"
                                  size="sm"
                                >
                                  Add
                                </b-button>
                              </b-th>
                            </b-thead>
                            <b-tbody>
                              <b-tr v-for="(_env, envIndex) in data.env || []" v-bind:key="'row-' + envIndex">
                                <b-td>
                                  <b-form-input
                                    :id="'id' + index + '-' + envIndex"
                                    v-model="config.processes[index].env[envIndex].id"
                                    type="text"
                                    required
                                  />
                                </b-td>
                                <b-td>
                                  <b-form-input
                                    :id="'value' + index + '-' + envIndex"
                                    v-model="config.processes[index].env[envIndex].value"
                                    type="text"
                                  />
                                </b-td>
                                <b-td class="compact-column">
                                  <!-- we use @click.stop here to prevent emitting of a 'row-clicked' event  -->
                                  <b-button
                                    size="sm"
                                    @click.stop="onRemoveEnvironmentVariable(index, envIndex)"
                                    class="mr-2"
                                  >
                                    Remove
                                  </b-button>
                                </b-td>
                              </b-tr>
                            </b-tbody>
                          </b-table-simple>
                        </b-form-group>

                        <b-form-group
                          label="Health Check"
                          :label-for="'processHealth' + index"
                          label-cols-sm="4"
                          label-cols-lg="3"
                          content-cols-sm
                          content-cols-lg="7"
                        >
                          <b-form-select
                            :id="'processHealth' + index"
                            v-model="config.processes[index].health"
                            :options="healthOptions"
                            class="mb-3"
                          />
                        </b-form-group>

                        <b-form-group
                          label="Send Commands"
                          :label-for="'sendCommands' + index"
                          label-cols-sm="4"
                          label-cols-lg="3"
                          content-cols-sm
                          content-cols-lg="7"
                        >
                          <b-form-select
                            :id="'sendCommands' + index"
                            v-model="config.processes[index].sendCommands"
                            :options="sendCommandsOptions"
                            class="mb-3"
                          />
                        </b-form-group>

                        <b-form-group
                          label="Save Log"
                          :label-for="'processLog' + index"
                          label-cols-sm="4"
                          label-cols-lg="3"
                          content-cols-sm
                          content-cols-lg="7"
                        >
                          <b-form-checkbox :id="'processLog' + index" v-model="config.processes[index].logMode" />
                        </b-form-group>

                        <b-form-group
                          label="Auto start"
                          :label-for="'autoStart' + index"
                          label-cols-sm="4"
                          label-cols-lg="3"
                          content-cols-sm
                          content-cols-lg="7"
                        >
                          <b-form-checkbox :id="'autoStart' + index" v-model="config.processes[index].autoStart" />
                        </b-form-group>
                      </b-collapse>
                    </b-td>
                  </b-tr>
                </template>
              </b-tbody>
            </b-table-simple>
          </b-form-group>

          <legend>HTTP</legend>
          <b-form-group
            id="httpApiEnableGroup"
            label="Enable HTTP Server:"
            label-for="httpApiEnableInput"
            label-cols-sm="4"
            label-cols-lg="3"
            content-cols-sm
            content-cols-lg="7"
          >
            <b-form-checkbox id="httpApiEnableInput" v-model="config.api.enable"> </b-form-checkbox>
          </b-form-group>

          <b-form-group
            id="httpApiPortGroup"
            label="HTTP Server Port:"
            label-for="httpApiPortInput"
            label-cols-sm="4"
            label-cols-lg="3"
            content-cols-sm
            content-cols-lg="7"
          >
            <b-form-input id="httpApiPortInput" type="number" v-model="config.api.port" placeholder="8005" />
          </b-form-group>

          <b-form-group
            id="httpApiProcessControlGroup"
            label="Process control API:"
            label-for="httpApiProcessControlInput"
            label-cols-sm="4"
            label-cols-lg="3"
            content-cols-sm
            content-cols-lg="7"
          >
            <b-form-checkbox id="httpApiProcessControlInput" v-model="config.api.processControl"> </b-form-checkbox>
          </b-form-group>

          <b-form-group
            id="httpApiStaticPathsGroup"
            label="Static paths"
            label-for="httpApiStaticPathsTable"
            label-cols-sm="4"
            label-cols-lg="3"
            content-cols-sm
            content-cols-lg="7"
          >
            <b-table-simple>
              <b-thead>
                <b-th> Name </b-th>
                <b-th> Path </b-th>
                <b-th> Allow Delete </b-th>
                <b-th class="compact-column">
                  <b-button type="submit" variant="primary" @click="onAddStaticPathRow" size="sm"> Add </b-button>
                </b-th>
              </b-thead>
              <b-tbody>
                <b-tr v-for="(data, index) in config.api.staticPaths" v-bind:key="'row-' + index">
                  <b-td>
                    <b-form-input
                      :id="'httpApiStaticPathName' + index"
                      v-model="config.api.staticPaths[index].name"
                      type="text"
                      required
                    />
                  </b-td>
                  <b-td>
                    <b-form-input
                      :id="'httpApiStaticPathPath' + index"
                      v-model="config.api.staticPaths[index].path"
                      type="text"
                      required
                    />
                  </b-td>
                  <b-td>
                    <b-form-checkbox
                      :id="'httpApiStaticPathAllowDelete' + index"
                      v-model="config.api.staticPaths[index].allowDelete"
                    />
                  </b-td>
                  <b-td>
                    <!-- we use @click.stop here to prevent emitting of a 'row-clicked' event  -->
                    <b-button size="sm" @click.stop="onRemoveStaticPathRow(index)" class="mr-2"> Remove </b-button>
                  </b-td>
                </b-tr>
              </b-tbody>
            </b-table-simple>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row id="footer">
        <b-col>
          <b-button type="submit" variant="primary"> Save </b-button>
          <b-button type="reset" variant="danger"> Reset </b-button>
        </b-col>
        <b-col id="version">
          <p class="text-right">Version: {{ version }}</p>
        </b-col>
      </b-row>
    </b-form>
  </b-container>
</template>

<script>
import packageJson from '../../../package.json'

export default {
  data() {
    return {
      version: packageJson.version,
      healthOptions: [
        { value: undefined, text: 'None' },
        { value: 'casparcg', text: 'CasparCG Ping' },
      ],
      sendCommandsOptions: [
        { value: undefined, text: 'Disabled' },
        { value: 'utf8', text: 'Generic process' },
        { value: 'utf16le', text: 'CasparCG 2.4+' },
      ],
      config: {
        api: {
          staticPaths: [],
        },
        processes: [],
      },
    }
  },
  created() {
    window.electronAPI.on('config', (conf) => {
      this.config = conf

      if (!this.config.api) {
        this.$set(this.config, 'api', {})
      }
      if (!this.config.api.staticPaths) {
        this.$set(this.config.api, 'staticPaths', [])
      }
    })
    window.electronAPI.send('config.get')
  },

  methods: {
    onSubmit(evt) {
      // TODO - some data validation (especially staticPaths)

      evt.preventDefault()
      window.electronAPI.send('config.set', this.config)
    },
    onReset(evt) {
      evt.preventDefault()
      window.electronAPI.send('config.get')
    },
    onAddStaticPathRow(evt) {
      evt.preventDefault()
      this.config.api.staticPaths.push({})
    },
    onRemoveStaticPathRow(index) {
      this.config.api.staticPaths.splice(index, 1)
    },
    onAddProcessRow(evt) {
      evt.preventDefault()
      this.config.processes.push({
        id: Math.random().toString(36).substring(7),
        autoStart: true,
      })
    },
    onRemoveProcessRow(index) {
      this.config.processes.splice(index, 1)
    },
    onOpenBasePath(evt) {
      evt.preventDefault()
      window.electronAPI.send('openPath', 'basePath')
    },
    onOpenLogsPath(evt) {
      evt.preventDefault()
      window.electronAPI.send('openPath', 'logsPath')
    },
    onAddEnvironmentVariable(index) {
      if (!this.config.processes[index].env) this.config.processes[index].env = []
      this.config.processes[index].env.push({ id: '', value: '' })
    },
    onRemoveEnvironmentVariable(rowIndex, envIndex) {
      this.config.processes[rowIndex].env.splice(envIndex, 1)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../../node_modules/bootstrap/scss/bootstrap';
@import '../../../node_modules/bootstrap/scss/_variables';
$button-height: 40px;
$footer-padding: 1rem;
$footer-height: calc(#{$button-height} + #{2 * $footer-padding});
#content {
  margin-bottom: $footer-height;
}
#footer {
  background: $light;
  bottom: 0;
  width: 100%;
  height: $footer-height;
  padding-top: $footer-padding;
  position: fixed;
}
#version {
  padding-top: $btn-padding-y;
}

.collapsed > .when-open,
.not-collapsed > .when-closed {
  display: none;
}
</style>
<style lang="scss">
.compact-column {
  width: 1%; // Make as narrow as possible
  vertical-align: middle !important;

  button {
    white-space: nowrap;
  }
}

.button-margin-right {
  margin-right: 0.5rem !important;
}

.button-right {
  float: right;
}

.name-field {
  flex-grow: 1;
  margin-right: 0.5rem !important;
}
</style>
