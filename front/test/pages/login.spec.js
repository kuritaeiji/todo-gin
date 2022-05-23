import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import page from '~/pages/login.vue'
import localVue from '~/test/localVue'
import UiGoogleBtn from '~/components/ui/GoogleBtn.vue'

describe('pages/login.vue', () => {
  let vuetify
  let mock
  const $config = { testUser: { email: 'email', password: 'password' } }

  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
  })

  const mountPage = (options = {}) => {
    return mount(page, {
      localVue,
      vuetify,
      stubs: ['before-logged-in-form', 'user-form'],
      mocks: { $config },
      ...options
    })
  }

  describe('template', () => {
    it('submitイベントが起こると、ログインメソッドを呼び出す', () => {
      const wrapper = mountPage({
        methods: { login: mock }
      })
      wrapper.find('user-form-stub').vm.$emit('submit')
      expect(mock).toHaveBeenCalled()
    })

    it('ui-google-btnコンポーネントにloginProps=trueを渡す', () => {
      const wrapper = mountPage()
      expect(wrapper.findComponent(UiGoogleBtn).props().login).toEqual(true)
    })
  })

  describe('script', () => {
    it('title', () => {
      const wrapper = mountPage()
      expect(wrapper.vm.$metaInfo.title).toEqual('page.login')
    })

    describe('data', () => {
      it('params.authの初期値はテストユーザーのメールアドレスとパスワード', () => {
        const wrapper = mountPage()
        expect(wrapper.vm.$data.params.auth).toEqual($config.testUser)
      })
    })

    describe('methods', () => {
      it('login', () => {
        const $auth = { login: mock }
        const wrapper = mountPage({ mocks: { $auth, $config } })
        wrapper.vm.login()

        expect(mock).toHaveBeenCalledWith(wrapper.vm.params.auth)
      })
    })
  })
})
