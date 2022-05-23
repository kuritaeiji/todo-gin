<template>
  <v-card
    flat
    height="44"
    :color="cardColor"
    class="ma-3 d-flex justify-space-between"
    @mouseenter="toggleIsMouseEnter"
    @mouseleave="toggleIsMouseEnter"
    @mousedown.stop="mouseDown"
  >
    <v-card-title class="text-body-2 font-weight-bold user-select-none pa-0 ma-2">
      {{ card.title }}
    </v-card-title>

    <v-btn
      v-show="isMouseEnter"
      icon
      small
      class="ma-2"
      @click="toggleDialog"
    >
      <v-icon small>
        mdi-pencil
      </v-icon>
    </v-btn>

    <card-dialog :dialog.sync="dialog" :card="card" />
  </v-card>
</template>

<script>
import CardDialog from '~/components/card/Dialog.vue'

export default {
  components: { CardDialog },
  props: {
    card: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      isMouseEnter: false,
      dialog: false,
      title: this.card.title
    }
  },
  computed: {
    cardColor () {
      return this.isMouseEnter ? 'grey lighten-2' : 'grey lighten-3'
    }
  },
  methods: {
    toggleIsMouseEnter () {
      this.isMouseEnter = !this.isMouseEnter
    },
    toggleDialog () {
      this.dialog = !this.dialog
      this.$el.style.height = '44px'
    },
    mouseDown (event) {
      this.$emit('mousedown', event, this.card)
    }
  }
}
</script>
