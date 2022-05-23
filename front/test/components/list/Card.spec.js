import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import ListCard from '~/components/list/Card.vue'
import ListUpdateForm from '~/components/list/UpdateForm.vue'
import ListDestroyBtn from '~/components/list/DestroyBtn.vue'

describe('components/Card.vue', () => {
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify()
  })

  const list = { title: 'list title', id: 1, index: 0 }
  const mountCard = (optinos) => {
    return mount(ListCard, {
      localVue,
      vuetify,
      propsData: { list },
      ...optinos
    })
  }

  describe('template', () => {
    it('list-update-formコンポーネントにlistpropsを渡す', () => {
      const wrapper = mountCard()
      expect(wrapper.findComponent(ListUpdateForm).props().list).toEqual(list)
    })

    it('list-destroy-btnコンポーネントにpropsとしてlistを渡す', () => {
      const wrapper = mountCard()
      expect(wrapper.findComponent(ListDestroyBtn).props().list).toEqual(list)
    })
  })

  describe('script', () => {
    it('listpropsを受け取る', () => {
      const wrapper = mountCard({ stubs: { 'list-update-form': true } })
      expect(wrapper.props().list).toEqual(list)
    })
  })
})
