import Vuetify from 'vuetify'
import { Store } from 'vuex'
import Vue from 'vue'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import CardCreateForm from '~/components/card/CreateForm.vue'
import CardForm from '~/components/card/Form.vue'
import ListCardCreateBtn from '~/components/ui/ListCardCreateBtn.vue'

describe('components/CardCreateForm.vue', () => {
  let vuetify
  let mock
  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
  })

  const listID = 1
  const mountCardCreateForm = (options) => {
    return mount(CardCreateForm, {
      localVue,
      vuetify,
      propsData: { listId: listID },
      ...options
    })
  }
  const stubs = { 'card-form': true, 'list-card-create-btn': true }

  describe('template', () => {
    describe('カード追加ボタン', () => {
      it('isShowFormの値によって表示・非表示を切り替える', async () => {
        const wrapper = mountCardCreateForm({ stubs })
        await wrapper.setData({ isShowForm: true })
        const btn = wrapper.findComponent({ name: 'v-btn' })
        expect(btn.isVisible()).toEqual(false)

        await wrapper.setData({ isShowForm: false })
        expect(btn.isVisible()).toEqual(true)
      })

      it('クリックするとtoggleIsShowFormメソッドを呼び出す', () => {
        const wrapper = mountCardCreateForm({ stubs, methods: { toggleIsShowForm: mock } })
        wrapper.findComponent({ name: 'v-btn' }).vm.$emit('click')
        expect(mock).toHaveBeenCalled()
      })
    })

    describe('v-formコンポーネント', () => {
      it('isShowFormの値によって表示・非表示を切り替える', async () => {
        const wrapper = mountCardCreateForm({ stubs })
        await wrapper.setData({ isShowForm: true })
        const form = wrapper.findComponent({ name: 'v-form' })
        expect(form.isVisible()).toEqual(true)

        await wrapper.setData({ isShowForm: false })
        expect(form.isVisible()).toEqual(false)
      })
    })

    describe('card-formコンポーネント', () => {
      it('titlePropsを渡す', async () => {
        const wrapper = mountCardCreateForm()
        const title = 'title'
        await wrapper.setData({ title })
        expect(wrapper.findComponent(CardForm).props().title).toEqual(title)
      })

      it('update:titleイベントがemitされるとtitleデータが更新される', () => {
        const wrapper = mountCardCreateForm()
        const title = 'title'
        wrapper.findComponent(CardForm).vm.$emit('update:title', title)
        expect(wrapper.vm.$data.title).toEqual(title)
      })

      it('submitイベントがemitされるとcreateCardTemplateメソッドが呼び出される', () => {
        const wrapper = mountCardCreateForm({ methods: { createCardTemplate: mock } })
        wrapper.findComponent(CardForm).vm.$emit('submit')
        expect(mock).toHaveBeenCalled()
      })

      it('cancelイベントがemitされるとcancelCreateCardメソッドが呼び出される', () => {
        const wrapper = mountCardCreateForm({ methods: { cancelCreateCard: mock } })
        wrapper.findComponent(CardForm).vm.$emit('cancel')
        expect(mock).toHaveBeenCalled()
      })
    })

    describe('list-card-create-btnコンポーネント', () => {
      it('btnTextPropsを渡す', () => {
        const wrapper = mountCardCreateForm()
        expect(wrapper.findComponent(ListCardCreateBtn).props().btnText).toEqual(wrapper.vm.$data.btnText)
      })

      it('createイベントが発火すると、createCardTemplateメソッドを呼び出す', () => {
        const wrapper = mountCardCreateForm({ methods: { createCardTemplate: mock } })
        wrapper.findComponent(ListCardCreateBtn).vm.$emit('create')
        expect(mock).toHaveBeenCalled()
      })

      it('cancelイベントが発火すると、cancelCreateCardメソッドを呼び出す', () => {
        const wrapper = mountCardCreateForm({ methods: { cancelCreateCard: mock } })
        wrapper.findComponent(ListCardCreateBtn).vm.$emit('cancel')
        expect(mock).toHaveBeenCalled()
      })
    })
  })

  describe('script', () => {
    describe('props', () => {
      it('listIdPropsを受け取る', () => {
        const listID = 100
        const wrapper = mountCardCreateForm({ stubs, propsData: { listId: listID } })
        expect(wrapper.props().listId).toEqual(listID)
      })
    })

    describe('methods', () => {
      let resetValidationMock
      beforeEach(() => {
        resetValidationMock = jest.fn()
      })
      const form = (isValid) => {
        return Vue.component('VForm', {
          methods: {
            resetValidation: resetValidationMock,
            validate: () => isValid
          },
          template: '<div />'
        })
      }

      it('toggleIsShowFormメソッド', () => {
        const wrapper = mountCardCreateForm({ stubs })
        wrapper.vm.toggleIsShowForm()
        expect(wrapper.vm.$data.isShowForm).toEqual(true)

        wrapper.vm.toggleIsShowForm()
        expect(wrapper.vm.$data.isShowForm).toEqual(false)
      })

      it('cencelCreateCardメソッド', async () => {
        const wrapper = mountCardCreateForm({ stubs: { 'v-form': form() } })
        await wrapper.setData({ isShowForm: true, title: 'title' })
        wrapper.vm.cancelCreateCard()
        expect(wrapper.vm.$data.isShowForm).toEqual(false)
        expect(wrapper.vm.$data.title).toEqual('')
        expect(resetValidationMock).toHaveBeenCalled()
      })

      describe('createCardTemplate', () => {
        let createCardMock
        beforeEach(() => {
          createCardMock = jest.fn()
        })
        const createStore = (createCard) => {
          if (createCard === undefined) { createCard = createCardMock }
          return new Store({
            modules: {
              card: {
                namespaced: true,
                actions: { createCard }
              }
            }
          })
        }

        it('バリデーションがfalseの時カードを作成しない', () => {
          const wrapper = mountCardCreateForm({ stubs: { ...stubs, 'v-form': form(false) }, store: createStore() })
          wrapper.vm.createCardTemplate()
          expect(createCardMock).not.toHaveBeenCalled()
        })

        it('バリデーションがtrueの時カードを作成する', () => {
          const wrapper = mountCardCreateForm({ stubs: { ...stubs, 'v-form': form(true) }, store: createStore() })
          wrapper.vm.createCardTemplate()
          expect(createCardMock).toHaveBeenCalled()
          expect(createCardMock.mock.calls[0][1]).toEqual({ title: wrapper.vm.$data.title, listID })
        })

        it('カードの作成に成功した場合、フォームをリセットする', async () => {
          const wrapper = mountCardCreateForm({ stubs: { ...stubs, 'v-form': form(true) }, store: createStore(() => { return Promise.resolve() }) })
          await wrapper.setData({ title: 'title' })
          await wrapper.vm.createCardTemplate()
          expect(wrapper.vm.$data.title).toEqual('')
          expect(resetValidationMock).toHaveBeenCalled()
        })

        it('カードの作成に失敗した場合、$handlerのstandardAxiosErrorメソッドを呼び出す', async () => {
          const error = 'error'
          const wrapper = mountCardCreateForm({
            stubs: { ...stubs, 'v-form': form(true) },
            store: createStore(() => { return Promise.reject(error) }),
            mocks: { $handler: { standardAxiosError: mock } }
          })
          await wrapper.vm.createCardTemplate()
          expect(mock).toHaveBeenCalledWith(error)
        })
      })
    })
  })
})
