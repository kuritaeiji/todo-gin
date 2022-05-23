<template>
  <before-logged-in-form :title="title">
    <v-form>
      <user-form
        v-bind.sync="params.auth"
        @submit="login"
      />
    </v-form>

    <ui-google-btn login />

    <v-card
      flat
      tile
      color="grey lighten-4"
      class="mt-3"
    >
      <v-card-title class="py-1">
        テストユーザー
      </v-card-title>

      <v-card-text>
        メールアドレス: user@example.com<br>
        パスワード: Password1010
      </v-card-text>
    </v-card>
  </before-logged-in-form>
</template>

<script>
import UiGoogleBtn from '~/components/ui/GoogleBtn.vue'

export default {
  components: { UiGoogleBtn },
  layout: 'beforeLoggedIn',
  middleware: 'guest',
  data () {
    return {
      title: this.$t('page.login'),
      params: {
        auth: {
          email: '',
          password: ''
        }
      }
    }
  },
  head () {
    return {
      title: this.title
    }
  },
  methods: {
    login () {
      this.$auth.login(this.params.auth)
    }
  }
}
</script>
