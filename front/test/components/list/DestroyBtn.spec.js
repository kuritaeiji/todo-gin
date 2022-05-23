import Vuetify from 'vuetify'
import { Store } from 'vuex'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import ListDestroyBtn from '~/components/list/DestroyBtn.vue'

describe('components/ListDestroyBtn.vue', () => {
  let vuetify
  let mock
  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
  })

  const list = { id: 1, title: 'test list', index: 0 }

  const mountComponent = (options) => {
    return mount(ListDestroyBtn, {
      localVue,
      vuetify,
      propsData: { list },
      ...options
    })
  }

  describe('template', () => {
    it('ボタンがクリックされると、destroyListTemplateメソッドが呼ばれる', () => {
      const wrapper = mountComponent({ methods: { destroyListTemplate: mock } })
      wrapper.findComponent({ name: 'v-btn' }).vm.$emit('click')
      expect(mock).toHaveBeenCalled()
    })
  })

  describe('script', () => {
    it('listpropsを受け取れる', () => {
      const wrapper = mountComponent()
      expect(wrapper.props().list).toEqual(list)
    })

    describe('destroyListTemplateメソッド', () => {
      const createStore = (destroyList) => {
        return new Store({
          modules: {
            list: {
              namespaced: true,
              actions: { destroyList }
            }
          }
        })
      }

      it('storeのdestroyListアクションが呼び出される', () => {
        const wrapper = mountComponent({ store: createStore(mock) })
        wrapper.vm.destroyListTemplate()
        expect(mock).toHaveBeenCalled()
      })

      describe('異常系の場合', () => {
        it('$handler.standardAxiosErrorメソッドを呼び出す', async () => {
          const error = 'error'
          const wrapper = mountComponent({
            store: createStore(() => Promise.reject(error)),
            mocks: { $handler: { standardAxiosError: mock } }
          })
          await wrapper.vm.destroyListTemplate()
          expect(mock).toHaveBeenCalledWith(error)
        })
      })
    })
  })
})
