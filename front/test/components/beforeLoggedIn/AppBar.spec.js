import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import AppBar from '~/components/beforeLoggedIn/AppBar.vue'
import localVue from '~/test/localVue'

describe('components/BeforeLoggedInAppBar.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  const mountAppBar = (options) => {
    return mount(AppBar, {
      localVue,
      vuetify,
      stubs: ['ui-app-bar-btn', 'app-bar'],
      ...options
    })
  }

  describe('template', () => {
    it('ログインボタンが存在する', () => {
      const wrapper = mountAppBar()
      const loginBtn = wrapper.findAll('ui-app-bar-btn-stub').at(0)
      expect(loginBtn.attributes().to).toEqual('/login')
      expect(loginBtn.text()).toEqual('page.login')
    })

    it('会員登録ボタンが存在する', () => {
      const wrapper = mountAppBar()
      const signupBtn = wrapper.findAll('ui-app-bar-btn-stub').at(1)
      expect(signupBtn.attributes().to).toEqual('/signup')
      expect(signupBtn.text()).toEqual('page.signup')
    })
  })
})
