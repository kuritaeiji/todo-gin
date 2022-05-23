import Vuetify from 'vuetify'
import { Store } from 'vuex'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import Flash from '~/components/Flash.vue'

describe('components/Flash.vue', () => {
  let vuetify
  let actions
  beforeEach(() => {
    vuetify = new Vuetify()
    actions = {
      clearFlash: jest.fn()
    }
  })

  const mountFlash = (options) => {
    return mount(Flash, {
      localVue,
      vuetify,
      ...options
    })
  }

  const createStore = (getters) => {
    return new Store({
      modules: {
        flash: {
          namespaced: true,
          getters,
          actions
        }
      }
    })
  }

  describe('template', () => {
    it('flash.isShowがtrueの場合v-alertは表示される', () => {
      const getters = { flash: () => ({ isShow: true }) }
      const wrapper = mountFlash({
        store: createStore(getters)
      })

      expect(wrapper.findComponent({ name: 'v-alert' }).isVisible()).toEqual(true)
    })

    it('flash.isShowがfalseの場合v-alertは非表示になる', () => {
      const getters = { flash: () => ({ isShow: false }) }
      const wrapper = mountFlash({
        store: createStore(getters)
      })

      expect(wrapper.findComponent({ name: 'v-alert' }).isVisible()).toEqual(false)
    })

    it('inputイベントが起こるとcloseAlertメソッドが発火する', () => {
      const getters = { flash: () => ({ isShow: true }) }
      const mock = jest.fn()
      const wrapper = mountFlash({
        store: createStore(getters),
        methods: {
          closeAlert: mock
        }
      })

      wrapper.findComponent({ name: 'v-alert' }).vm.$emit('input')
      expect(mock).toHaveBeenCalled()
    })

    it('v-alertはflash.textをtextとしてもつ', () => {
      const text = 'text'
      const getters = { flash: () => ({ isShow: true, text }) }
      const wrapper = mountFlash({
        store: createStore(getters)
      })

      expect(wrapper.findComponent({ name: 'v-alert' }).text()).toMatch(new RegExp(text))
    })
  })

  describe('script', () => {
    it('closeAlertメソッド', () => {
      const wrapper = mountFlash({
        store: createStore({ flash: () => ({ isShow: true }) })
      })

      wrapper.vm.closeAlert()
      expect(actions.clearFlash).toHaveBeenCalled()
    })
  })
})
