import Vuetify from 'vuetify'
import { Store } from 'vuex'
import { mount } from '@vue/test-utils'
import Validation from '~/components/Validation.vue'
import localVue from '~/test/localVue'

describe('component/Validation.vue', () => {
  let vuetify
  let actions
  let clearValidationMock
  beforeEach(() => {
    vuetify = new Vuetify()
    clearValidationMock = jest.fn()
    actions = {
      clearValidation: clearValidationMock
    }
  })

  const mountValidation = (options = {}) => {
    return mount(Validation, {
      localVue,
      vuetify,
      ...options
    })
  }

  const createStore = (getters) => {
    return new Store({
      modules: {
        validation: {
          namespaced: true,
          getters,
          actions
        }
      }
    })
  }

  const defaultGetters = { validation () { return { isShow: true } } }

  describe('template', () => {
    it('v-alertコンポーネントはvalidation.isShowがtrueの時表示され、falseの時非表示になる', () => {
      let wrapper = mountValidation({ store: createStore(defaultGetters) })
      expect(wrapper.findComponent({ name: 'v-alert' }).isVisible()).toEqual(true)

      const getters = { validation () { return { isShow: false } } }
      wrapper = mountValidation({ store: createStore(getters) })
      expect(wrapper.findComponent({ name: 'v-alert' }).isVisible()).toEqual(false)
    })

    it('v-alertでバツボタンをクリックすると、closeAlertメソッドが発火する', () => {
      const wrapper = mountValidation({ store: createStore(defaultGetters) })
      const mock = jest.fn()
      wrapper.setMethods({ closeAlert: mock })
      wrapper.findComponent({ name: 'v-alert' }).vm.$emit('input')
      expect(mock).toHaveBeenCalled()
    })

    it('v-alertはvalidation.textをtextとしてもつ', () => {
      const text = 'text'
      const getters = { validation: () => ({ isShow: true, text }) }
      const wrapper = mountValidation({ store: createStore(getters) })
      expect(wrapper.findComponent({ name: 'v-alert' }).text()).toMatch(new RegExp(text))
    })
  })

  describe('script', () => {
    it('closeAlertはclearValidationをよびだす', () => {
      const wrapper = mountValidation({ store: createStore(defaultGetters) })
      wrapper.vm.closeAlert()
      expect(clearValidationMock).toHaveBeenCalled()
    })
  })
})
