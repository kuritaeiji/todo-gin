export const state = () => ({
  loggedIn: false
})

export const getters = {
  loggedIn (state) {
    return state.loggedIn
  }
}

export const mutations = {
  setLoggedIn (state, isLoggedIn) {
    state.loggedIn = isLoggedIn
  }
}

export const actions = {
  setLoggedIn ({ commit }, isLoggedIn) {
    commit('setLoggedIn', isLoggedIn)
  }
}
