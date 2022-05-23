import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import AppBarBtn from '~/components/ui/AppBarBtn.vue'

describe('components/UiAppBarBtn.vue', () => {
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify()
  })

  const mountAppBarBtn = (options) => {
    return mount(AppBarBtn, {
      localVue,
      vuetify,
      ...options
    })
  }

  describe('template', () => {
    it('v-btnをクリックするとclickBtnが発火する', () => {
      const mock = jest.fn()
      const wrapper = mountAppBarBtn({
        methods: {
          clickBtn: mock
        }
      })
      wrapper.findComponent({ name: 'v-btn' }).vm.$emit('click')
      expect(mock).toHaveBeenCalled()
    })

    it('v-btnのto', () => {
      const wrapper = mountAppBarBtn({
        propsData: { to: 'to' }
      })
      expect(wrapper.findComponent({ name: 'v-btn' }).props().to).toEqual('to')
    })

    it('slotにコンテンツが挿入される', () => {
      const text = 'slot content'
      const wrapper = mountAppBarBtn({
        slots: {
          default: `<div data-test="slotContent">${text}</div>`
        }
      })
      const slot = wrapper.find('[data-test="slotContent"]')
      expect(slot.exists()).toEqual(true)
      expect(slot.text()).toEqual(text)
    })
  })

  describe('script', () => {
    it('propsを受け取ること', () => {
      const wrapper = mountAppBarBtn({
        propsData: {
          to: 'to'
        }
      })
      expect(wrapper.props().to).toEqual('to')
    })

    it('clickBtnメソッド', () => {
      const wrapper = mountAppBarBtn()
      wrapper.vm.clickBtn()
      expect(wrapper.emitted().click).not.toBeUndefined()
    })
  })
})
