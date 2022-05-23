<template>
  <v-dialog v-model="setDialog" max-width="400">
    <v-card flat tile class="pa-5">
      <v-card-title class="pt-0 px-0 font-weight-bold">
        カードの編集
      </v-card-title>

      <v-form ref="form" class="mb-3" @submit.prevent>
        <card-form :title.sync="title" @submit="updateCardTemplate" @cancel="cancelUpdateCard" />
      </v-form>

      <v-card-actions class="px-0">
        <v-btn
          depressed
          color="primary"
          class="mr-5 pa-5 white--text font-weight-bold"
          @click="updateCardTemplate"
        >
          保存する
        </v-btn>
        <v-btn
          depressed
          color="error"
          class="pa-5 white--text font-weight-bold"
          @click="destroyCardTemplate"
        >
          削除する
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import CardForm from '~/components/card/Form.vue'

export default {
  components: { CardForm },
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    card: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      title: this.card.title
    }
  },
  computed: {
    setDialog: {
      get () {
        return this.dialog
      },
      set (val) {
        this.$emit('update:dialog', val)
      }
    }
  },
  methods: {
    ...mapActions('card', ['updateCard', 'destroyCard']),
    cancelUpdateCard () {
      this.title = this.card.title
      this.$refs.form.resetValidation()
      this._closeDialog()
    },
    async updateCardTemplate () {
      if (!this.$refs.form.validate()) {
        return
      }

      try {
        await this.updateCard({ card: this.card, title: this.title })
        this._closeDialog()
      } catch (error) {
        this.$handler.standardAxiosError(error)
      }
    },
    async destroyCardTemplate () {
      try {
        await this.destroyCard(this.card)
        this._closeDialog()
      } catch (error) {
        this.$handler.standardAxiosError(error)
      }
    },
    _closeDialog () {
      this.$emit('update:dialog', false)
    }
  }
}
</script>
