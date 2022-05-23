<template>
  <v-card
    flat
    width="300"
    :class="cardClass"
  >
    <v-btn
      v-show="!isShow"
      depressed
      width="300"
      color="white"
      class="primary--text font-weight-bold justify-start"
      @click="toggleIsShow"
    >
      ＋ {{ btnText }}
    </v-btn>

    <v-form v-show="isShow" ref="form" class="width-284" @submit.prevent>
      <list-form :title.sync="title" @submit="createListTemplate" @cancel="cancelCreateList" />
      <list-card-create-btn :btn-text="btnText" @create="createListTemplate" @cancel="cancelCreateList" />
    </v-form>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex'
import ListForm from '~/components/list/Form.vue'
import ListCardCreateBtn from '~/components/ui/ListCardCreateBtn.vue'

export default {
  components: {
    ListForm,
    ListCardCreateBtn
  },
  data () {
    return {
      isShow: false,
      title: '',
      btnText: 'リストを追加'
    }
  },
  computed: {
    cardClass () {
      return this.isShow ? 'pa-2' : ''
    }
  },
  methods: {
    ...mapActions('list', ['createList']),
    toggleIsShow () {
      this.isShow = !this.isShow
    },
    async createListTemplate () {
      if (!this.$refs.form.validate()) {
        return
      }

      try {
        await this.createList(this.title)
        this.resetCreatForm()
      } catch (error) {
        this.$handler.standardAxiosError(error)
      }
    },
    cancelCreateList () {
      this.resetCreatForm()
      this.toggleIsShow()
    },
    resetCreatForm () {
      this.title = ''
    }
  }
}
</script>
