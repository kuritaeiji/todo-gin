import Vue from 'vue'
import Vuetify from 'vuetify'
import { Store } from 'vuex'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import ListCreateCard from '~/components/list/CreateCard.vue'
import ListForm from '~/components/list/Form.vue'
import ListCardCreateBtn from '~/components/ui/ListCardCreateBtn.vue'

describe('components/ListCreateForm.vue', () => {
  let vuetify
  let mock
  let actionMock
  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
    actionMock = jest.fn()
  })

  const createStore = (createList) => {
    if (createList === undefined) { createList = actionMock }
    return new Store({
      modules: {
        list: {
          namespaced: true,
          actions: {
            createList
          }
        }
      }
    })
  }

  const stubs = {
    'list-form': true,
    'list-card-create-btn': true
  }

  const mountForm = (options) => {
    return mount(ListCreateCard, {
      vuetify,
      localVue,
      ...options
    })
  }

  describe('template', () => {
    it('リストを追加ボタンの表示・非表示', async () => {
      const wrapper = mountForm({ stubs, store: createStore() })
      const addListBtn = wrapper.findAllComponents({ name: 'v-btn' }).at(0)
      await wrapper.setData({ isShow: true })
      expect(addListBtn.isVisible()).toEqual(false)
      await wrapper.setData({ isShow: false })
      expect(addListBtn.isVisible()).toEqual(true)
    })

    it('リスト追加ボタンをクリックするとtoggleIsShowメソッドが呼び出される', () => {
      const wrapper = mountForm({ stubs, store: createStore(), methods: { toggleIsShow: mock } })
      const addListBtn = wrapper.findAllComponents({ name: 'v-btn' }).at(0)
      addListBtn.vm.$emit('click')
      expect(mock).toHaveBeenCalled()
    })

    it('フォームの表示・非表示', async () => {
      const wrapper = mountForm({ stubs, store: createStore() })
      const form = wrapper.findComponent({ name: 'v-form' })
      await wrapper.setData({ isShow: true })
      expect(form.isVisible()).toEqual(true)
      await wrapper.setData({ isShow: false })
      expect(form.isVisible()).toEqual(false)
    })

    describe('list-form', () => {
      it('propsとしてtitleを渡す', async () => {
        const title = 'title'
        const wrapper = mountForm({ store: createStore() })
        await wrapper.setData({ title })
        expect(wrapper.findComponent(ListForm).props().title).toEqual(title)
      })

      it('update:titleがemitされるとnewListのtitleが更新される', () => {
        const wrapper = mountForm({ store: createStore() })
        const title = 'title'
        wrapper.findComponent(ListForm).vm.$emit('update:title', title)
        expect(wrapper.vm.$data.title).toEqual(title)
      })

      it('submitがemitされるとcreateListTemplateメソッドが呼び出される', () => {
        const wrapper = mountForm({ store: createStore(), methods: { createListTemplate: mock } })
        wrapper.findComponent(ListForm).vm.$emit('submit')
        expect(mock).toHaveBeenCalled()
      })

      it('cancelがemitされるとcancelCreateListメソッドが呼び出される', () => {
        const wrapper = mountForm({ store: createStore(), methods: { cancelCreateList: mock } })
        wrapper.findComponent(ListForm).vm.$emit('cancel')
        expect(mock).toHaveBeenCalled()
      })
    })

    describe('list-card-create-btnコンポーネント', () => {
      it('createイベントが発火するとcreateListTemplateが呼び出される', () => {
        const wrapper = mountForm({ methods: { createListTemplate: mock }, store: createStore() })
        wrapper.findComponent(ListCardCreateBtn).vm.$emit('create')
        expect(mock).toHaveBeenCalled()
      })

      it('cencelイベントが発火するとcancelCreateListメソッドが呼び出される', () => {
        const wrapper = mountForm({ methods: { cancelCreateList: mock }, store: createStore() })
        wrapper.findComponent(ListCardCreateBtn).vm.$emit('cancel')
        expect(mock).toHaveBeenCalled()
      })
    })
  })

  describe('script', () => {
    describe('methods', () => {
      it('toggleIsShow', async () => {
        const wrapper = mountForm({ stubs, store: createStore() })
        await wrapper.setData({ isShow: false })
        wrapper.vm.toggleIsShow()
        expect(wrapper.vm.$data.isShow).toEqual(true)
        wrapper.vm.toggleIsShow()
        expect(wrapper.vm.$data.isShow).toEqual(false)
      })

      describe('createListTemplate', () => {
        const form = (validationResult) => {
          return Vue.component('VForm', {
            methods: {
              validate () {
                return validationResult
              }
            },
            template: '<div />'
          })
        }

        describe('フォームのバリデーションがfalseの場合', () => {
          it('createListメソッドが呼び出されない', () => {
            const wrapper = mountForm({ stubs: { 'v-form': form(false) }, store: createStore() })
            wrapper.vm.createListTemplate()
            expect(actionMock).not.toHaveBeenCalled()
          })
        })

        describe('フォームのバリデーションがtrueの場合', () => {
          it('createListアクションを呼び出す', async () => {
            const wrapper = mountForm({ stubs: { 'v-form': form(true) }, store: createStore() })
            await wrapper.setData({ title: 'new title' })
            wrapper.vm.createListTemplate()
            expect(actionMock.mock.calls[0][1]).toEqual(wrapper.vm.$data.title)
          })

          it('createListアクションが正常に終了した場合、dataのtitleを初期化する', async () => {
            const createList = () => Promise.resolve()
            const wrapper = mountForm({ stubs: { 'v-form': form(true), ...stubs }, store: createStore(createList) })
            await wrapper.setData({ title: 'new title' })
            await wrapper.vm.createListTemplate()
            expect(wrapper.vm.$data.title).toEqual('')
          })

          it('createListでエラーが返る場合$handler.standardAxiosErrorを呼び出す', async () => {
            const error = 'error'
            const createList = () => { return Promise.reject(error) }
            const wrapper = mountForm({
              stubs: { ...stubs, 'v-form': form(true) },
              store: createStore(createList),
              mocks: {
                $handler: { standardAxiosError: mock }
              }
            })
            await wrapper.vm.createListTemplate()
            expect(mock).toHaveBeenCalledWith(error)
          })
        })
      })

      describe('cancelCreateList', () => {
        it('newListデータを初期化する', async () => {
          const wrapper = mountForm({ stubs, store: createStore() })
          await wrapper.setData({ title: 'new title' })
          wrapper.vm.cancelCreateList()
          expect(wrapper.vm.$data.title).toEqual('')
        })

        it('isShowをfalseにする', async () => {
          const wrapper = mountForm({ stubs, store: createStore() })
          await wrapper.setData({ isShow: true })
          wrapper.vm.cancelCreateList()
          expect(wrapper.vm.$data.isShow).toEqual(false)
        })
      })
    })
  })
})
