import Vuetify from 'vuetify'
import { Store } from 'vuex'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import CardDialog from '~/components/card/Dialog.vue'
import CardForm from '~/components/card/Form.vue'

describe('components/CardDialog.vue', () => {
  let vuetify
  let mock
  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
  })

  const stubs = { 'card-form': true }
  const defaultCard = { id: 1, title: 'card' }

  const mountCardDialog = (options) => {
    return mount(CardDialog, {
      vuetify,
      localVue,
      propsData: { card: defaultCard, dialog: true },
      ...options
    })
  }

  describe('template', () => {
    describe('v-dialog', () => {
      it('v-model="setDialog"', () => {
        const wrapper = mountCardDialog({ stubs })
        const dialog = wrapper.findComponent({ name: 'v-dialog' })
        expect(dialog.props().value).toEqual(true)
        dialog.vm.$emit('input', true)
        expect(wrapper.emitted()['update:dialog'][0][0]).toEqual(true)
      })
    })

    describe('card-form', () => {
      it('titlePropsを渡す', () => {
        const wrapper = mountCardDialog()
        expect(wrapper.findComponent(CardForm).props().title).toEqual(wrapper.vm.$data.title)
      })

      it('submitイベントが発火するとupdateCardTemplateが呼び出される', () => {
        const wrapper = mountCardDialog({ methods: { updateCardTemplate: mock } })
        wrapper.findComponent(CardForm).vm.$emit('submit')
        expect(mock).toHaveBeenCalled()
      })

      it('cancelイベントが発火するとcancelUpdateCardが呼び出される', () => {
        const wrapper = mountCardDialog({ methods: { cancelUpdateCard: mock } })
        wrapper.findComponent(CardForm).vm.$emit('cancel')
        expect(mock).toHaveBeenCalled()
      })
    })

    describe('保存ボタン', () => {
      it('クリックするとupdateCardTemplateメソッドを呼び出す', () => {
        const wrapper = mountCardDialog({ stubs, methods: { updateCardTemplate: mock } })
        wrapper.findAllComponents({ name: 'v-btn' }).at(0).vm.$emit('click')
        expect(mock).toHaveBeenCalled()
      })
    })

    describe('削除ボタン', () => {
      it('クリックするとdestroyCardTemplateメソッドを呼び出す', () => {
        const wrapper = mountCardDialog({ stubs, methods: { destroyCardTemplate: mock } })
        wrapper.findAllComponents({ name: 'v-btn' }).at(1).vm.$emit('click')
        expect(mock).toHaveBeenCalled()
      })
    })
  })

  describe('script', () => {
    describe('props', () => {
      it('dialog', async () => {
        const wrapper = mountCardDialog({ stubs })
        await wrapper.setProps({ dialog: true })
        expect(wrapper.props().dialog).toEqual(true)
      })

      it('card', () => {
        const wrapper = mountCardDialog({ stubs })
        expect(wrapper.props().card).toEqual(defaultCard)
      })
    })

    describe('data', () => {
      it('titleの初期値はcardPropsのtitle', () => {
        const wrapper = mountCardDialog({ stubs })
        expect(wrapper.vm.$data.title).toEqual(wrapper.props().card.title)
      })
    })

    describe('methods', () => {
      let validateMock
      let resetValidationMock
      let updateCardMock
      let destroyCardMock
      beforeEach(() => {
        validateMock = jest.fn()
        resetValidationMock = jest.fn()
        updateCardMock = jest.fn()
        destroyCardMock = jest.fn()
      })

      const form = (isValid) => {
        if (isValid === undefined) {
          isValid = validateMock
        }

        return localVue.component('VForm', {
          methods: {
            validate: () => isValid,
            resetValidation: resetValidationMock
          },
          template: '<div />'
        })
      }

      const createStore = (updateCard, destroyCard) => {
        if (updateCard === undefined) { updateCard = updateCardMock }
        if (destroyCard === undefined) { destroyCard = destroyCardMock }
        return new Store({
          modules: {
            card: {
              namespaced: true,
              actions: {
                updateCard,
                destroyCard
              }
            }
          }
        })
      }

      it('cancelUpdateCard', async () => {
        const wrapper = mountCardDialog({ stubs: { ...stubs, 'v-form': form() } })
        await wrapper.setData({ title: 'fjojojo' })
        wrapper.vm.cancelUpdateCard()
        expect(wrapper.vm.$data.title).toEqual(wrapper.props().card.title)
        expect(resetValidationMock).toHaveBeenCalled()
        expect(wrapper.emitted()['update:dialog'][0][0]).toEqual(false)
      })

      describe('updateCardTemplate', () => {
        it('バリデーションがfalseの場合apiと通信してカードを更新しない', () => {
          const wrapper = mountCardDialog({ stubs: { ...stubs, 'v-form': form(false) } })
          wrapper.vm.updateCardTemplate()
          expect(updateCardMock).not.toHaveBeenCalled()
        })

        it('バリデーションがtrueの場合apiと通信してカードを更新する', () => {
          const wrapper = mountCardDialog({ stubs: { ...stubs, 'v-form': form(true) }, store: createStore() })
          wrapper.vm.updateCardTemplate()
          expect(updateCardMock.mock.calls[0][1]).toEqual({ card: wrapper.props().card, title: wrapper.vm.$data.title })
        })

        it('apiとの通信が成功する時、ダイアログを閉じる', async () => {
          const wrapper = mountCardDialog({ stubs: { ...stubs, 'v-form': form(true) }, store: createStore(() => Promise.resolve()) })
          await wrapper.vm.updateCardTemplate()
          expect(wrapper.emitted()['update:dialog'][0][0]).toEqual(false)
        })

        it('apiとの通信が失敗する場合、$handler.standardAxiosErrorメソッドを呼び出す', async () => {
          const error = 'error'
          const wrapper = mountCardDialog({
            stubs: { ...stubs, 'v-form': form(true) },
            store: createStore(() => Promise.reject(error)),
            mocks: { $handler: { standardAxiosError: mock } }
          })
          await wrapper.vm.updateCardTemplate()
          expect(mock).toHaveBeenCalledWith(error)
        })
      })

      describe('destroyCardTemplate', () => {
        it('apiと通信して、カードを削除する', () => {
          const wrapper = mountCardDialog({ stubs, store: createStore() })
          wrapper.vm.destroyCardTemplate()
          expect(destroyCardMock.mock.calls[0][1]).toEqual(wrapper.props().card)
        })

        it('apiとの通信が成功する場合、ダイアログを閉じる', async () => {
          const wrapper = mountCardDialog({ stubs, store: createStore(undefined, () => Promise.resolve()) })
          await wrapper.vm.destroyCardTemplate()
          expect(wrapper.emitted()['update:dialog'][0][0]).toEqual(false)
        })

        it('apiとの通信が失敗する場合、$handler.standardAxiosErrorメソッドを呼び出す', async () => {
          const error = 'error'
          const wrapper = mountCardDialog({
            stubs,
            store: createStore(undefined, () => Promise.reject(error)),
            mocks: { $handler: { standardAxiosError: mock } }
          })
          await wrapper.vm.destroyCardTemplate()
          expect(mock).toHaveBeenCalledWith(error)
        })
      })
    })
  })
})
