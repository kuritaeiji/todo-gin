<template>
  <v-btn
    depressed
    large
    block
    color="teal lighten-1"
    class="font-weight-bold white--text"
    @click="requestAuthEndpoint"
  >
    <v-icon
      class="mr-1"
    >
      mdi-google
    </v-icon>
    グーグルで{{ btnText }}
  </v-btn>
</template>

<script>
export default {
  props: {
    login: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    btnText () {
      return this.login ? 'ログイン' : '会員登録'
    }
  },
  methods: {
    requestAuthEndpoint () {
      this.$auth.requestGoogleAuthEndpoint()
    }
  }
}
</script>
