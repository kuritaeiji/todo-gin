import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import CardCard from '~/components/card/Card.vue'
import CardDialog from '~/components/card/Dialog.vue'

describe('components/Card.vue', () => {
  let vuetify
  let mock
  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
  })

  const stubs = { 'card-dialog': true }
  const defaultCard = { id: 1, title: 'card1' }
  const mountCardCard = (options) => {
    return mount(CardCard, {
      vuetify,
      localVue,
      propsData: { card: defaultCard },
      ...options
    })
  }

  describe('template', () => {
    describe('v-card', () => {
      it('v-cardのcolorはcomputedのcardColor', () => {
        const wrapper = mountCardCard({ stubs })
        expect(wrapper.findComponent({ name: 'v-card' }).props().color).toEqual('grey lighten-3')
      })

      it('mouseenterイベントが発火するとtoggleIsMouseEnterメソッドを呼び出す', () => {
        const wrapper = mountCardCard({ stubs, methods: { toggleIsMouseEnter: mock } })
        wrapper.find('.v-card').trigger('mouseenter')
        expect(mock).toHaveBeenCalled()
      })

      it('mouseleaveイベントが発火するとtoggleIsMouseEnterメソッドを呼び出す', () => {
        const wrapper = mountCardCard({ stubs, methods: { toggleIsMouseEnter: mock } })
        wrapper.find('.v-card').trigger('mouseleave')
        expect(mock).toHaveBeenCalled()
      })
    })

    describe('v-card-title', () => {
      it('cardのtitleを表示する', () => {
        const wrapper = mountCardCard({ stubs })
        expect(wrapper.findComponent({ name: 'v-card-title' }).text()).toEqual(defaultCard.title)
      })
    })

    describe('v-btn', () => {
      it('isMouseEnterの値によって表示・非表示を切り替える', async () => {
        const wrapper = mountCardCard({ stubs })
        const btn = wrapper.findComponent({ name: 'v-btn' })
        await wrapper.setData({ isMouseEnter: false })
        expect(btn.isVisible()).toEqual(false)

        await wrapper.setData({ isMouseEnter: true })
        expect(btn.isVisible()).toEqual(true)
      })

      it('編集ボタンをクリックするとtoggleDialogメソッドを呼び出す', () => {
        const wrapper = mountCardCard({ stubs, methods: { toggleDialog: mock } })
        wrapper.findComponent({ name: 'v-btn' }).vm.$emit('click')
        expect(mock).toHaveBeenCalled()
      })
    })

    describe('card-dialog', () => {
      it('dialogPropsを渡す', async () => {
        const wrapper = mountCardCard()
        await wrapper.setData({ dialog: true })
        expect(wrapper.findComponent(CardDialog).props().dialog).toEqual(true)
      })

      it('update:dialogイベントが発火すると、dialogを更新する', async () => {
        const wrapper = mountCardCard()
        await wrapper.setData({ dialog: true })
        wrapper.findComponent(CardDialog).vm.$emit('update:dialog', false)
        expect(wrapper.vm.$data.dialog).toEqual(false)
      })

      it('cardPropsを渡す', () => {
        const wrapper = mountCardCard()
        expect(wrapper.findComponent(CardDialog).props().card).toEqual(defaultCard)
      })
    })
  })

  describe('script', () => {
    describe('props', () => {
      it('cardPropsを受け取る', async () => {
        const wrapper = mountCardCard({ stubs })
        const newCard = { id: 100, title: 'new card' }
        await wrapper.setProps({ card: newCard })
        expect(wrapper.props().card).toEqual(newCard)
      })
    })

    describe('computed', () => {
      it('cardColor', () => {
        expect(CardCard.computed.cardColor.call({ isMouseEnter: true })).toEqual('grey lighten-2')
        expect(CardCard.computed.cardColor.call({ isMouseEnter: false })).toEqual('grey lighten-3')
      })
    })

    describe('methods', () => {
      it('toggleIsMouseEnterメソッド', async () => {
        const wrapper = mountCardCard({ stubs })
        await wrapper.setData({ isMouseEnter: false })
        wrapper.vm.toggleIsMouseEnter()
        expect(wrapper.vm.$data.isMouseEnter).toEqual(true)
        wrapper.vm.toggleIsMouseEnter()
        expect(wrapper.vm.$data.isMouseEnter).toEqual(false)
      })

      it('toggleDialog', async () => {
        const wrapper = mountCardCard({ stubs })
        await wrapper.setData({ dialog: false })
        wrapper.vm.toggleDialog()
        expect(wrapper.vm.$data.dialog).toEqual(true)
        wrapper.vm.toggleDialog()
        expect(wrapper.vm.$data.dialog).toEqual(false)
      })
    })
  })
})
