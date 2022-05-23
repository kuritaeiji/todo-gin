import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import ListForm from '~/components/list/Form.vue'

describe('components/ListForm.vue', () => {
  let vuetify
  let mock
  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
  })

  const mountListForm = (options) => {
    return mount(ListForm, {
      vuetify,
      localVue,
      propsData: { title: 'title' },
      ...options
    })
  }

  describe('template', () => {
    it('text-fieldに文字が入力されるとupdate:titleをemitする', async () => {
      const wrapper = mountListForm()
      const textField = wrapper.find('input[type="text"]')
      const newTitle = 'new title'
      await textField.setValue(newTitle)
      expect(wrapper.emitted()['update:title'][0][0]).toEqual(newTitle)
    })

    it('text-field上でエンターキーを押すとsubmitメソッドを呼び出す', () => {
      const wrapper = mountListForm({ methods: { submit: mock } })
      wrapper.find('input[type="text"]').trigger('keypress.enter')
      expect(mock).toHaveBeenCalled()
    })

    it('text-field上でエスケープキーを押すとcancelメソッドを呼び出す', () => {
      const wrapper = mountListForm({ methods: { cancel: mock } })
      wrapper.find('input[type="text"]').trigger('keyup.esc')
      expect(mock).toHaveBeenCalled()
    })
  })

  describe('script', () => {
    it('submitメソッド', () => {
      const wrapper = mountListForm()
      wrapper.vm.submit()
      expect(wrapper.emitted().submit).toBeTruthy()
    })

    it('cancelメソッド', () => {
      const wrapper = mountListForm()
      wrapper.vm.cancel()
      expect(wrapper.emitted().cancel).toBeTruthy()
    })
  })
})
