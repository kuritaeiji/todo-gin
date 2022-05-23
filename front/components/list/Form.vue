<template>
  <v-text-field
    v-model="setTitle"
    outlined
    dense
    autofocus
    hide-details
    validate-on-blur
    class="font-weight-bold"
    :rules="rules"
    @keypress.enter="submit"
    @keyup.esc="cancel"
  />
</template>

<script>
import { max, required } from '~/validators'

export default {
  props: {
    title: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      rules: [required, max(50)]
    }
  },
  computed: {
    setTitle: {
      get () {
        return this.title
      },
      set (val) {
        this.$emit('update:title', val)
      }
    }
  },
  methods: {
    submit () {
      this.$emit('submit')
    },
    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>
