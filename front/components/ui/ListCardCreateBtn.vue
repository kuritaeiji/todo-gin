<template>
  <div class="pt-1">
    <v-btn
      small
      depressed
      color="primary"
      class="white--text text-body-2 font-weight-bold mr-1"
      @click="create"
    >
      {{ btnText }}
    </v-btn>
    <v-btn icon @click="cancel">
      <v-icon>
        mdi-close
      </v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    btnText: {
      type: String,
      required: true
    }
  },
  methods: {
    create () {
      this.$emit('create')
    },
    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>
