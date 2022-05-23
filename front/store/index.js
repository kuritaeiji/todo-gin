export const actions = {
  nuxtClientInit ({ dispatch }) {
    if (this.$auth.hasJwt()) {
      dispatch('auth/setLoggedIn', true)
    }
  }
}
