import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import userForm from '~/components/user/Form.vue'
import { uniqueUserError } from '~/errors'

describe('components/UserForm.vue', () => {
  let vuetify
  let mock
  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
  })

  const mountUserForm = (options) => {
    return mount(userForm, {
      localVue,
      vuetify,
      ...options
    })
  }

  describe('template', () => {
    it('v-model="setEmail"', () => {
      const [email, newEmail] = ['email', 'newEmail']
      const wrapper = mountUserForm({
        propsData: { email }
      })
      const emailFeield = wrapper.findAllComponents({ name: 'v-text-field' }).at(0)
      expect(emailFeield.props().value).toEqual(email)
      emailFeield.vm.$emit('input', newEmail)
      expect(wrapper.emitted()['update:email']).toBeTruthy()
      expect(wrapper.emitted()['update:email'][0]).toEqual([newEmail])
    })

    it('メールフォームでblurするとisUniqueUserメソッドが発火する', () => {
      const wrapper = mountUserForm({
        methods: { isUniqueUser: mock }
      })
      wrapper.findAllComponents({ name: 'v-text-field' }).at(0).vm.$emit('blur')
      expect(mock).toHaveBeenCalled()
    })

    it('メールフォームでエンターキーを押すとsubmitメソッドが発火する', () => {
      const wrapper = mountUserForm({
        methods: { submit: mock }
      })
      wrapper.find('input[type="email"]').trigger('keypress.enter')
      expect(mock).toHaveBeenCalled()
    })

    it('v-model="setPassword"', () => {
      const [password, newPassword] = ['password', 'newPassword']
      const wrapper = mountUserForm({
        propsData: { password }
      })
      const passwordField = wrapper.findAllComponents({ name: 'v-text-field' }).at(1)
      expect(passwordField.props().value).toEqual(password)
      passwordField.vm.$emit('input', newPassword)
      expect(wrapper.emitted()['update:password'][0]).toEqual([newPassword])
    })

    it('パスワードフォームでエンターキーを押すとsubmitメソッドが発火する', () => {
      const wrapper = mountUserForm({
        methods: { submit: mock }
      })
      wrapper.find('input[type="password"]').trigger('keypress.enter')
      expect(mock).toHaveBeenCalled()
    })

    it('パスワードフォームで目のアイコンをクリックするとtoggleIsShowPasswordメソッドが発火する', () => {
      const wrapper = mountUserForm({
        methods: { toggleIsShowPassword: mock }
      })
      wrapper.findAllComponents({ name: 'v-text-field' }).at(1).vm.$emit('click:append')
      expect(mock).toHaveBeenCalled()
    })

    it('validationプロパティーによってパスワードのヒントの表示・非表示を変える', async () => {
      const wrapper = mountUserForm()
      expect(wrapper.find('div.grey--text').exists()).toEqual(false)
      wrapper.setProps({ validation: true })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('div.grey--text').exists()).toEqual(true)
    })

    it('ボタンをクリックするとsubmitメソッドが発火する', () => {
      const wrapper = mountUserForm({
        methods: { submit: mock }
      })
      wrapper.findComponent({ name: 'v-btn' }).vm.$emit('click')
      expect(mock).toHaveBeenCalled()
    })
  })

  describe('script', () => {
    it('props', () => {
      const [email, password, validation] = ['email', 'password', true]
      const wrapper = mountUserForm({
        propsData: { email, password, validation }
      })
      expect(wrapper.props().email).toEqual(email)
      expect(wrapper.props().password).toEqual(password)
      expect(wrapper.props().validation).toEqual(validation)
    })

    describe('computed', () => {
      it('rules', () => {
        const self = { validation: true }
        let rules = userForm.computed.rules.call(self)
        expect(rules.email.length).toEqual(3)
        expect(rules.password.length).toEqual(4)
        self.validation = false
        rules = userForm.computed.rules.call(self)
        expect(rules.email.length).toEqual(0)
        expect(rules.password.length).toEqual(0)
      })

      it('passwordField', () => {
        const self = { isShowPassword: true }
        expect(userForm.computed.passwordField.call(self)).toEqual({ icon: 'mdi-eye', type: 'text' })
        self.isShowPassword = false
        expect(userForm.computed.passwordField.call(self)).toEqual({ icon: 'mdi-eye-off', type: 'password' })
      })
    })

    describe('methods', () => {
      it('toggleIsShowPassword', () => {
        const wrapper = mountUserForm()
        wrapper.vm.toggleIsShowPassword()
        expect(wrapper.vm.isShowPassword).toEqual(true)
        wrapper.vm.toggleIsShowPassword()
        expect(wrapper.vm.isShowPassword).toEqual(false)
      })

      it('submit', () => {
        const wrapper = mountUserForm()
        wrapper.vm.submit()
        expect(wrapper.emitted().submit).toBeTruthy()
      })

      describe('isUniqueUser', () => {
        describe('validationがfalseの場合', () => {
          it('apiと通信しない', () => {
            const $axios = { $get: mock }
            const wrapper = mountUserForm({
              mocks: { $axios }
            })
            wrapper.vm.isUniqueUser()
            expect(mock).not.toHaveBeenCalled()
          })
        })

        describe('validationがtrueの場合', () => {
          it('apiと通信する', () => {
            const $axios = { $get: mock }
            const email = 'email'
            const wrapper = mountUserForm({
              mocks: { $axios },
              propsData: { email }
            })
            wrapper.setData({ validation: true })
            wrapper.vm.isUniqueUser()
            expect(mock).toHaveBeenCalledWith(`/users/unique?email=${email}`)
          })

          describe('200レスポンスが返ってくる場合', () => {
            it('errorMessagesが空配列になる', async () => {
              const $axios = { $get: () => new Promise((resolve) => { resolve() }) }
              const wrapper = mountUserForm({
                mocks: { $axios }
              })
              wrapper.setData({ errorMessages: ['message'], validation: true })
              await wrapper.vm.isUniqueUser()
              expect(wrapper.vm.errorMessages).toEqual([])
            })
          })

          describe('エラーが起こる場合', () => {
            it('ユニークユーザーエラーが返る場合、エラーメッセージを作成', async () => {
              const error = { response: { status: uniqueUserError.status, data: { content: uniqueUserError.content } } }
              const $axios = { $get: () => new Promise((resolve, reject) => { reject(error) }) }
              const wrapper = mountUserForm({
                mocks: { $axios }
              })
              wrapper.setData({ validation: true })
              await wrapper.vm.isUniqueUser()
              expect(wrapper.vm.errorMessages).toEqual(['既に登録済みです'])
            })

            it('ユニークユーザー以外のエラーが返る場合、標準のエラー処理', async () => {
              // eslint-disable-next-line prefer-promise-reject-errors
              const $axios = { $get: () => new Promise((resolve, reject) => { reject('error') }) }
              const $handler = { standardAxiosError: mock }
              const wrapper = mountUserForm({
                mocks: { $axios, $handler }
              })
              wrapper.setData({ validation: true })
              await wrapper.vm.isUniqueUser()
              expect(mock).toHaveBeenCalled()
            })
          })
        })
      })
    })
  })
})
