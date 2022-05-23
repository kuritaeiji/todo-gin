<template>
  <v-alert
    v-show="validation.isShow"
    dark
    dismissible
    color="red"
    class="font-weight-bold mb-5"
    @input="closeAlert"
  >
    {{ validation.text }}
  </v-alert>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: mapGetters('validation', ['validation']),
  methods: {
    ...mapActions('validation', ['clearValidation']),
    closeAlert () {
      this.clearValidation()
    }
  }
}
</script>
