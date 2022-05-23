import { mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import localVue from '~/test/localVue'
import CardForm from '~/components/card/Form.vue'

describe('components/CardForm.vue', () => {
  let vuetify
  let mock
  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
  })

  const mountCardForm = (options) => {
    return mount(CardForm, {
      localVue,
      vuetify,
      propsData: { title: '' },
      ...options
    })
  }

  describe('template', () => {
    it('エンターキーを押すとsubmitメソッドを呼び出す', () => {
      const wrapper = mountCardForm({ methods: { submit: mock } })
      wrapper.find('textarea').trigger('keypress.enter')
      expect(mock).toHaveBeenCalled()
    })

    it('エスケープキーを押すとcancelメソッドを呼び出す', () => {
      const wrapper = mountCardForm({ methods: { cancel: mock } })
      wrapper.find('textarea').trigger('keyup.esc')
      expect(mock).toHaveBeenCalled()
    })
  })

  describe('script', () => {
    it('titlePropsを受け取る', () => {
      const wrapper = mountCardForm()
      expect(wrapper.props().title).toEqual('')
    })

    describe('computed', () => {
      describe('setTitle', () => {
        it('get', () => {
          const title = 'title'
          expect(CardForm.computed.setTitle.get.call({ title })).toEqual(title)
        })

        describe('set', () => {
          it('通常の場合update:titleイベントをemitする', () => {
            const wrapper = mountCardForm()
            const val = 'new title'
            wrapper.find('textarea').setValue(val)
            expect(wrapper.emitted()['update:title'][0][0]).toEqual(val)
          })

          it('まだテキストエリアに何も入力されていない状態で空白文字が入力されるとemitせずテキストエリアにも空白文字を表示させない', () => {
            const wrapper = mountCardForm()
            const val = '\n'
            wrapper.find('textarea').setValue(val)
            expect(wrapper.emitted()['update:title']).toBeFalsy()
            expect(wrapper.vm.$refs.title.lazyValue).toEqual('')
          })
        })
      })
    })

    describe('methods', () => {
      it('submitメソッドはsubmitイベントをemitとする', () => {
        const wrapper = mountCardForm()
        wrapper.vm.submit()
        expect(wrapper.emitted().submit).toBeTruthy()
      })

      it('cancelメソッドはcancelメソッドをemitする', () => {
        const wrapper = mountCardForm()
        wrapper.vm.cancel()
        expect(wrapper.emitted().cancel).toBeTruthy()
      })
    })
  })
})
