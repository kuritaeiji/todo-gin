import Vue from 'vue'
import Vuetify from 'vuetify'
import { Store } from 'vuex'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import signup from '~/pages/signup.vue'
import { emailClientError, uniqueUserError, validationError } from '~/errors'

describe('pages/signup.vue', () => {
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify()
  })

  const mountSignup = (options) => {
    return mount(signup, {
      localVue,
      vuetify,
      stubs: ['before-logged-in-form', 'user-form'],
      ...options
    })
  }

  describe('template', () => {
    it('before-logged-in-formコンポーネントはtitleプロパティーを受け取る', () => {
      const wrapper = mountSignup()
      expect(wrapper.find('before-logged-in-form-stub').attributes().title).toEqual('page.signup')
    })

    it('user-formコンポーネントがsubmitイベントを起こすとcreateUserメソッドが発火する', () => {
      const mock = jest.fn()
      const wrapper = mountSignup({
        methods: { createUser: mock }
      })
      wrapper.find('user-form-stub').vm.$emit('submit')
      expect(mock).toHaveBeenCalled()
    })
  })

  describe('script', () => {
    it('title', () => {
      const wrapper = mountSignup()
      expect(wrapper.vm.$metaInfo.title).toEqual('page.signup')
    })

    describe('createUser', () => {
      describe('validationがfalseの時', () => {
        it('v-formのvalidateメソッドを実行する', () => {
          const mock = jest.fn()
          const VForm = Vue.component('VForm', {
            methods: { validate: mock },
            template: '<div />'
          })
          const wrapper = mountSignup({
            stubs: { 'v-form': VForm }
          })
          wrapper.vm.createUser()
          expect(mock).toHaveBeenCalled()
        })

        it('apiと通信しない', () => {
          const $axios = { $post: jest.fn() }
          const wrapper = mountSignup({
            mocks: { $axios }
          })
          wrapper.vm.createUser()
          expect($axios.$post).not.toHaveBeenCalled()
        })
      })

      describe('vaidationがtrueの時', () => {
        it('apiと通信する', () => {
          const $axios = { $post: jest.fn() }
          const wrapper = mountSignup({
            mocks: { $axios }
          })
          wrapper.setData({ isValid: true })
          wrapper.vm.createUser()
          expect($axios.$post).toHaveBeenCalledWith('/users', { email: '', password: '' })
        })

        describe('axiosの通信が成功する場合', () => {
          it('createUserResolveメソッドが呼ばれる', async () => {
            const $axios = { $post: () => new Promise((resolve) => { resolve() }) }
            const mock = jest.fn()
            const wrapper = mountSignup({
              mocks: { $axios },
              methods: { createUserResolve: mock }
            })
            wrapper.setData({ isValid: true })
            await wrapper.vm.createUser()
            expect(mock).toHaveBeenCalled()
          })
        })

        describe('axiosの通信でエラーが発生する場合', () => {
          it('createUserRejectメソッドが呼ばれる', async () => {
            // eslint-disable-next-line prefer-promise-reject-errors
            const $axios = { $post: () => new Promise((resolve, reject) => { reject('error') }) }
            const mock = jest.fn()
            const wrapper = mountSignup({
              mocks: { $axios },
              methods: { createUserReject: mock }
            })
            wrapper.setData({ isValid: true })
            await wrapper.vm.createUser()
            expect(mock).toHaveBeenCalledWith('error')
          })
        })
      })
    })

    const createStore = (setFlashMock, setValidationMock) => {
      const func = () => {}
      return new Store({
        modules: {
          flash: {
            namespaced: true,
            actions: {
              setFlash: setFlashMock || func
            }
          },
          validation: {
            namespaced: true,
            actions: {
              setValidation: setValidationMock || func
            }
          }
        }
      })
    }

    describe('createUserReslove', () => {
      it('フラッシュメッセージを作成し、indexパスに遷移する', () => {
        const setFlashMock = jest.fn()
        const routerMock = jest.fn()
        const $router = { push: routerMock }
        const wrapper = mountSignup({
          store: createStore(setFlashMock),
          mocks: { $router }
        })

        wrapper.vm.createUserResolve()
        expect(setFlashMock).toHaveBeenCalled()
        expect(routerMock).toHaveBeenCalledWith({ name: 'index' })
      })
    })

    describe('createUserReject', () => {
      describe('バリデーションエラーの場合', () => {
        it('バリデーションを作成する', () => {
          let error = { response: { status: validationError.status, data: { content: validationError.content } } }
          const mock = jest.fn()
          const wrapper = mountSignup({
            store: createStore(null, mock)
          })
          wrapper.vm.createUserReject(error)
          expect(mock).toHaveBeenCalled()

          error = { response: { status: uniqueUserError.status, data: { content: uniqueUserError.content } } }
          wrapper.vm.createUserReject(error)
          expect(mock).toHaveBeenCalledTimes(2)
        })

        it('メールクライアントのエラーの場合', () => {
          const error = { response: { status: emailClientError.status, data: { content: emailClientError.content } } }
          const mock = jest.fn()
          const routerMock = jest.fn()
          const wrapper = mountSignup({
            store: createStore(mock),
            mocks: {
              $router: { push: routerMock }
            }
          })
          wrapper.vm.createUserReject(error)
          expect(mock).toHaveBeenCalled()
          expect(routerMock).toHaveBeenCalledWith({ name: 'index' })
        })

        it('その他のエラーの場合', () => {
          const mock = jest.fn()
          const wrapper = mountSignup({
            mocks: { $handler: { standardAxiosError: mock } }
          })
          wrapper.vm.createUserReject('error')
          expect(mock).toHaveBeenCalledWith('error')
        })
      })
    })
  })
})
