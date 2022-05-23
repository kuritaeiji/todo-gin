<template>
  <v-alert
    v-show="flash.isShow"
    dark
    tile
    dismissible
    width="100%"
    :color="flash.color"
    class="font-weight-bold mb-5"
    @input="closeAlert"
  >
    {{ flash.text }}
  </v-alert>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: mapGetters('flash', ['flash']),
  methods: {
    ...mapActions('flash', ['clearFlash']),
    closeAlert () {
      this.clearFlash()
    }
  }
}
</script>
