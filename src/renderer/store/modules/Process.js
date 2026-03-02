const state = {}

const maxRows = 500

function ensureStateExists(state, id) {
	if (!state[id]) {
		state[id] = {
			log: [],
			status: 'unknown',
			showCommandSend: false,
		}
	}
}

const mutations = {
	INIT(state, { id }) {
		ensureStateExists(state, id)
	},
	LOG_LINE(state, { id, data }) {
		ensureStateExists(state, id)

		state[id].log.push(data)

		if (state[id].log.length > maxRows) {
			state[id].log.splice(0, state[id].log.length - maxRows)
		}
	},

	LOG_CLEAR(state, { id }) {
		ensureStateExists(state, id)

		state[id].log.splice(0)
	},

	SET_STATUS(state, { id, status, showCommandSend }) {
		ensureStateExists(state, id)

		state[id].status = status
		state[id].showCommandSend = showCommandSend
	},
}

const actions = {
	init({ commit }, { id }) {
		commit('INIT', { id })
	},
	logLine({ commit }, { id, data }) {
		commit('LOG_LINE', { id, data })
	},
	logClear({ commit }, data) {
		commit('LOG_CLEAR', data)
	},
	setStatus({ commit }, data) {
		commit('SET_STATUS', data)
	},
}

export default {
	state,
	mutations,
	actions,
}
