import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import UiGoogleBtn from '~/components/ui/GoogleBtn.vue'

describe('components/ui/GoogleBtn.vue', () => {
  let vuetify
  let mock
  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
  })
  const mountGoogleBtn = (options) => {
    return mount(UiGoogleBtn, {
      vuetify,
      localVue,
      ...options
    })
  }

  describe('template', () => {
    it('ボタンをクリックするとrequestAuthEndpointメソッドを呼び出す', () => {
      const wrapper = mountGoogleBtn({ methods: { requestAuthEndpoint: mock } })
      wrapper.findComponent({ name: 'v-btn' }).vm.$emit('click')
      expect(mock).toHaveBeenCalled()
    })
  })

  describe('script', () => {
    describe('props', () => {
      it('loginProps', async () => {
        const wrapper = mountGoogleBtn()
        expect(wrapper.props().login).toEqual(false)
        await wrapper.setProps({ login: true })
        expect(wrapper.props().login).toEqual(true)
      })
    })

    describe('computed', () => {
      describe('btnText', () => {
        it('loginPropsがtrueの時、「ログイン」文字列を返す', () => {
          expect(UiGoogleBtn.computed.btnText.call({ login: true })).toEqual('ログイン')
        })

        it('loginPropsがfalseの時、「会員登録」文字列を返す', () => {
          expect(UiGoogleBtn.computed.btnText.call({ login: false })).toEqual('会員登録')
        })
      })
    })

    describe('methods', () => {
      it('requestAuthEndpointメソッド', () => {
        const $auth = { requestGoogleAuthEndpoint: mock }
        const wrapper = mountGoogleBtn({ mocks: { $auth } })
        wrapper.vm.requestAuthEndpoint()
        expect(mock).toHaveBeenCalled()
      })
    })
  })
})
