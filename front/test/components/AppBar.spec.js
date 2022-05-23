import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import AppBar from '~/components/AppBar.vue'

describe('components/AppBar.vue', () => {
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify()
  })

  const mountAppBar = (options) => {
    return mount(AppBar, {
      localVue,
      vuetify,
      ...options
    })
  }

  describe('template', () => {
    it('v-toolbar-titleのテクスト', () => {
      const wrapper = mountAppBar()
      expect(wrapper.findComponent({ name: 'v-toolbar-title' }).text()).toEqual('appTitle')
    })

    it('v-toolbar-titleのnuxt-linkのtoはルートパス', () => {
      const wrapper = mountAppBar()
      const routerLinkStub = wrapper.findComponent({ name: 'router-link-stub' })
      expect(routerLinkStub.props().to).toEqual('/')
    })

    it('slotにコンテンツを挿入できる', () => {
      const text = 'slot content'
      const wrapper = mountAppBar({
        slots: {
          btns: `<div data-test="slotContent">${text}</div>`
        }
      })
      const slotContent = wrapper.find('[data-test="slotContent"]')
      expect(slotContent.exists()).toEqual(true)
      expect(slotContent.text()).toEqual(text)
    })
  })
})
