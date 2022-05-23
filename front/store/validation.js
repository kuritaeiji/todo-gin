export const defaultValidation = {
  isShow: false,
  text: ''
}

export const state = () => ({
  validation: { ...defaultValidation }
})

export const getters = {
  validation (state) {
    return state.validation
  }
}

export const mutations = {
  setValidation (state, validation) {
    state.validation = validation
  }
}

export const actions = {
  setValidation ({ commit }, text) {
    commit('setValidation', { isShow: true, text })
  },
  clearValidation ({ commit }) {
    commit('setValidation', { ...defaultValidation })
  }
}
