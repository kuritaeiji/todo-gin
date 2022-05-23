<template>
  <div>
    <v-card-title
      v-show="!isShowForm"
      class="pt-1 text-body-1 font-weight-bold height-40 user-select-none"
      @dblclick="openForm"
    >
      {{ list.title }}
    </v-card-title>

    <v-form v-show="isShowForm" ref="form" @submit.prevent>
      <list-form v-bind.sync="editList" @submit="updateListTemplate" @cancel="cancelEdit" />
    </v-form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import ListForm from '~/components/list/Form.vue'

export default {
  components: { ListForm },
  props: {
    list: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      isShowForm: false,
      editList: {
        id: this.list.id,
        title: this.list.title
      }
    }
  },
  methods: {
    ...mapActions('list', ['updateList']),
    openForm () {
      this.isShowForm = true
    },
    closeForm () {
      this.isShowForm = false
    },
    cancelEdit () {
      this.editList.title = this.list.title
      this.closeForm()
    },
    async updateListTemplate () {
      if (!this.$refs.form.validate()) {
        return
      }
      try {
        await this.updateList(this.editList)
        this.closeForm()
      } catch (error) {
        this.$handler.standardAxiosError(error)
      }
    }
  }
}
</script>
