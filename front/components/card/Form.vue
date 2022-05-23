<template>
  <v-textarea
    ref="title"
    v-model="setTitle"
    outlined
    autofocus
    hide-details
    validate-on-blur
    height="100"
    placeholder="カードのタイトルを入力"
    :rules="rules"
    class="font-weight-bold"
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
      rules: [required, max(100)]
    }
  },
  computed: {
    setTitle: {
      get () {
        return this.title
      },
      set (val) {
        // ホワイトスペースのみの場合と改行文字が一つでも入る場合はtitleをupdateしない
        if (/^\s+$/.test(val) || /.*\n.*/.test(val)) {
          this.$refs.title.lazyValue = val.slice(0, -1)
          return
        }

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
