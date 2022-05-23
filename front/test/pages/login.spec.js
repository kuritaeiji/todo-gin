import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import page from '~/pages/login.vue'
import localVue from '~/test/localVue'
import UiGoogleBtn from '~/components/ui/GoogleBtn.vue'

describe('pages/login.vue', () => {
  let vuetify
  let mock

  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
  })

  const mountPage = (options = {}) => {
    return mount(page, {
      localVue,
      vuetify,
      stubs: ['before-logged-in-form', 'user-form'],
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

    describe('methods', () => {
      it('login', () => {
        const $auth = { login: mock }
        const wrapper = mountPage({ mocks: { $auth } })
        wrapper.vm.login()

        expect(mock).toHaveBeenCalledWith(wrapper.vm.params.auth)
      })
    })
  })
})
