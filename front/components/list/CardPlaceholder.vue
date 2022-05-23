<template>
  <v-card
    flat
    width="300"
    min-width="300"
    color="grey"
    :height="height"
    class="mr-5 mb-5"
  />
</template>

<script>
export default {
  props: {
    height: {
      type: Number,
      required: true
    }
  }
}
</script>
