import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import ListCardCreateBtn from '~/components/ui/ListCardCreateBtn.vue'

describe('components/UiListCardCreateBtn.vue', () => {
  let vuetify
  // let mock
  beforeEach(() => {
    vuetify = new Vuetify()
    // mock = jest.fn()
  })

  const btnText = 'btntext'
  const mountBtns = (options) => {
    return mount(ListCardCreateBtn, {
      vuetify,
      localVue,
      propsData: { btnText },
      ...options
    })
  }

  describe('template', () => {
    describe('作成ボタン', () => {
      // it('clickするとcreateメソッドを呼び出す', () => {
      //   const wrapper = mountBtns({ methods: { create: mock } })
      //   wrapper.findAllComponents({ name: 'v-btn' }).at(0).vm.$emit('click')
      //   console.log(mock.mock.calls[0])
      //   expect(mock).toHaveBennCalled()
      // })

      it('btnTextが表示される', () => {
        const wrapper = mountBtns()
        expect(wrapper.findAllComponents({ name: 'v-btn' }).at(0).text()).toEqual(btnText)
      })
    })

    // describe('キャンセルボタン', () => {
    //   it('clickするとcancelメソッドを呼び出す', () => {
    //     const wrapper = mountBtns({ methods: { cancel: mock } })
    //     wrapper.findAllComponents({ name: 'v-btn' }).at(1).vm.$emit('click')
    //     expect(mock).toHaveBennCalled()
    //   })
    // })
  })

  describe('script', () => {
    describe('props', () => {
      it('btnTextProps', () => {
        const wrapper = mountBtns()
        expect(wrapper.props().btnText).toEqual(btnText)
      })
    })

    describe('methods', () => {
      it('createメソッド', () => {
        const wrapper = mountBtns()
        wrapper.vm.create()
        expect(wrapper.emitted().create[0]).toBeTruthy()
      })

      it('cancelメソッド', () => {
        const wrapper = mountBtns()
        wrapper.vm.cancel()
        expect(wrapper.emitted().cancel[0]).toBeTruthy()
      })
    })
  })
})
