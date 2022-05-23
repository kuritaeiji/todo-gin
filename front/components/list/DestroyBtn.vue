<template>
  <v-btn icon small class="mr-1 pt-1" @click="destroyListTemplate">
    <v-icon small>
      mdi-close
    </v-icon>
  </v-btn>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {
    list: {
      type: Object,
      required: true
    }
  },
  methods: {
    ...mapActions('list', ['destroyList']),
    async destroyListTemplate () {
      try {
        await this.destroyList(this.list.id)
      } catch (error) {
        this.$handler.standardAxiosError(error)
      }
    }
  }
}
</script>
