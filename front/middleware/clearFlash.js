export default ({ store }) => {
  store.dispatch('flash/countUpFlash')
  if (store.getters['flash/flash'].transitionCount >= 2) {
    store.dispatch('flash/clearFlash')
  }
}
