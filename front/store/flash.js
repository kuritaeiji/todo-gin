export const defaultFlash = {
  isShow: false,
  text: '',
  color: '',
  transitionCount: 0
}

export const state = () => ({
  flash: { ...defaultFlash }
})

export const getters = {
  flash (state) {
    return state.flash
  }
}

export const mutations = {
  setFlash (state, flash) {
    state.flash = flash
  },
  countUpFlash (state) {
    state.flash.transitionCount += 1
  }
}

export const actions = {
  setFlash ({ commit }, payload) {
    commit('setFlash', { isShow: true, transitionCount: 0, text: payload.text, color: payload.color })
  },
  clearFlash ({ commit }) {
    commit('setFlash', { ...defaultFlash })
  },
  countUpFlash ({ commit }) {
    commit('countUpFlash')
  },
  countUpFlashBecauseNotRedirect ({ dispatch }) {
    dispatch('countUpFlash')
  }
}
