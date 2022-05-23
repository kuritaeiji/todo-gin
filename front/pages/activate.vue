<script>
import { isAlreadyActivatedUserError, isJwtExpiredError } from '~/errors'

export default {
  layout: 'empty',
  async middleware ({ query, $axios, app, store, redirect }) {
    try {
      await $axios.$put(`/users/activate?token=${query.token}`)
      store.dispatch('flash/setFlash', { color: 'info', text: app.i18n.t('flash.activateUser') })
      redirect({ name: 'login' })
    } catch (error) {
      if (isJwtExpiredError(error)) {
        store.dispatch('flash/setFlash', { color: 'red', text: app.i18n.t('flash.jwtExpiredError') })
        redirect({ name: 'index' })
        return
      }

      if (isAlreadyActivatedUserError(error)) {
        store.dispatch('flash/setFlash', { color: 'red', text: app.i18n.t('flash.alreadyActivatedUserError') })
        redirect({ name: 'index' })
        return
      }

      app.$handler.standardAxiosError(error)
    }
  }
}
</script>
