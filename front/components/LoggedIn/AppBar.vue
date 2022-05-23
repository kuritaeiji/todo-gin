<template>
  <app-bar>
    <template #btns>
      <ui-app-bar-btn @click="logout">
        {{ $t('btn.logout') }}
      </ui-app-bar-btn>

      <ui-app-bar-btn @click="withdraw">
        {{ $t('btn.withdraw') }}
      </ui-app-bar-btn>
    </template>
  </app-bar>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('flash', ['setFlash']),
    logout () {
      this.$auth.logout(this, this.$route.name)
    },
    async withdraw () {
      try {
        await this.$axios.$delete('/users')
        this.$auth.logout(this, this.$route.name, 'flash.withdraw')
      } catch (error) {
        this.$handler.standardAxiosError(error)
      }
    }
  }
}
</script>
