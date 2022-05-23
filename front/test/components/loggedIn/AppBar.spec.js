import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import AppBar from '~/components/LoggedIn/AppBar.vue'

describe('component/LoggedInAppBar.vue', () => {
  let vuetify
  let store
  beforeEach(() => {
    vuetify = new Vuetify()
    store = {
      modules: {
        flash: {
          namspaced: true,
          actions: {
            setFlash: jest.fn()
          }
        }
      }
    }
  })

  const mountAppBar = (options) => {
    return mount(AppBar, {
      localVue,
      vuetify,
      store,
      stubs: ['app-bar', 'ui-app-bar-btn'],
      ...options
    })
  }

  describe('template', () => {
    it('ログアウトボタン', () => {
      const mock = jest.fn()
      const wrapper = mountAppBar({
        methods: {
          logout: mock
        }
      })
      const logoutBtn = wrapper.findAll('ui-app-bar-btn-stub').at(0)
      expect(logoutBtn.text()).toEqual('btn.logout')
      logoutBtn.vm.$emit('click')
      expect(mock).toHaveBeenCalled()
    })

    it('退会ボタン', () => {
      const mock = jest.fn()
      const wrapper = mountAppBar({
        methods: {
          withdraw: mock
        }
      })
      const withdrawBtn = wrapper.findAll('ui-app-bar-btn-stub').at(1)
      expect(withdrawBtn.text()).toEqual('btn.withdraw')
      withdrawBtn.vm.$emit('click')
      expect(mock).toHaveBeenCalled()
    })
  })

  describe('script', () => {
    describe('methods', () => {
      it('logoutメソッド', () => {
        const mock = jest.fn()
        const $route = { name: 'index' }
        const wrapper = mountAppBar({
          mocks: {
            $auth: {
              logout: mock
            },
            $route
          }
        })
        wrapper.vm.logout()
        expect(mock).toHaveBeenCalledWith(wrapper.vm, $route.name)
      })

      describe('withdrawメソッド', () => {
        it('apiとユーザーを削除するように通信する', () => {
          const $axios = { $delete: jest.fn() }
          const wrapper = mountAppBar({
            mocks: { $axios }
          })
          wrapper.vm.withdraw()
          expect($axios.$delete).toHaveBeenCalledWith('/users')
        })

        describe('apiとの通信が成功する場合', () => {
          it('ログアウトする', async () => {
            const $axios = { $delete: () => { return new Promise((resolve) => { resolve() }) } }
            const $auth = { logout: jest.fn() }
            const $route = { name: 'index' }
            const wrapper = mountAppBar({
              mocks: { $axios, $auth, $route }
            })
            await wrapper.vm.withdraw()
            expect($auth.logout).toHaveBeenCalledWith(wrapper.vm, $route.name, 'flash.withdraw')
          })
        })

        describe('apiとの通信が失敗する場合', () => {
          it('$handlerに処理を移譲する', async () => {
            // eslint-disable-next-line prefer-promise-reject-errors
            const $axios = { $delete: () => { return new Promise((resolve, reject) => { reject('error') }) } }
            const $handler = { standardAxiosError: jest.fn() }
            const wrapper = mountAppBar({
              mocks: { $axios, $handler }
            })
            await wrapper.vm.withdraw()
            expect($handler.standardAxiosError).toHaveBeenCalledWith('error')
          })
        })
      })
    })
  })
})
