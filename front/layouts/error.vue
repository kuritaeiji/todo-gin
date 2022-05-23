<template>
  <v-container fluid fill-height>
    <v-row justify="center" align="center">
      <v-card-title>
        {{ error.statusCode }}
      </v-card-title>

      <v-card-text class="text-center">
        {{ error.message }}
      </v-card-text>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  head () {
    return {
      title: this.error.statusCode
    }
  }
}
</script>
