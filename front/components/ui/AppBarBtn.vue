<template>
  <v-btn
    text
    :to="to"
    class="font-weight-bold"
    @click="clickBtn"
  >
    <slot />
  </v-btn>
</template>

<script>
export default {
  props: {
    to: {
      type: String,
      default: ''
    }
  },
  methods: {
    clickBtn () {
      this.$emit('click')
    }
  }
}
</script>
