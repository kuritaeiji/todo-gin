import Vue from 'vue'
import Vuetify from 'vuetify'
import { Store } from 'vuex'
import { mount } from '@vue/test-utils'
import localVue from '~/test/localVue'
import ListUpdateForm from '~/components/list/UpdateForm.vue'
import ListForm from '~/components/list/Form.vue'

describe('components/ListUpdateForm.vue', () => {
  let vuetify
  let mock
  beforeEach(() => {
    vuetify = new Vuetify()
    mock = jest.fn()
  })
  const stubs = { 'list-form': true }
  const defaultList = { id: 1, title: 'title', index: 0 }

  const mountComponent = (options) => {
    return mount(ListUpdateForm, {
      localVue,
      vuetify,
      propsData: { list: defaultList },
      ...options
    })
  }

  describe('template', () => {
    describe('リストのタイトル', () => {
      it('タイトルの表示・非表示', async () => {
        const wrapper = mountComponent({ stubs })
        const vCardTitle = wrapper.findComponent({ name: 'v-card-title' })
        expect(vCardTitle.isVisible()).toEqual(true)
        await wrapper.setData({ isShowForm: true })
        expect(vCardTitle.isVisible()).toEqual(false)
      })

      it('リストのタイトルが表示される', () => {
        const wrapper = mountComponent({ stubs })
        expect(wrapper.findComponent({ name: 'v-card-title' }).text()).toEqual(defaultList.title)
      })

      it('リストのタイトルをダブルクリックするとopenFormメソッドを呼び出す', () => {
        const wrapper = mountComponent({ stubs, methods: { openForm: mock } })
        const listTitle = wrapper.findComponent({ name: 'v-card-title' })
        listTitle.trigger('dblclick')
        expect(mock).toHaveBeenCalled()
      })
    })

    describe('リストフォーム', () => {
      it('タイトルをpropsとして受け取る', () => {
        const wrapper = mountComponent()
        expect(wrapper.findComponent(ListForm).props().title).toEqual(defaultList.title)
      })

      it('update:titleイベントが起こるとeidtListのtitleが更新される', () => {
        const wrapper = mountComponent()
        const newTitle = 'new title'
        wrapper.findComponent(ListForm).vm.$emit('update:title', newTitle)
        expect(wrapper.vm.$data.editList.title).toEqual(newTitle)
      })

      it('submitイベントが起こるとupdateListTemplateメソッドを呼び出す', () => {
        const wrapper = mountComponent({ methods: { updateListTemplate: mock } })
        wrapper.findComponent(ListForm).vm.$emit('submit')
        expect(mock).toHaveBeenCalled()
      })

      it('cancelイベントが起こるとcancelEditメソッドを呼び出す', () => {
        const wrapper = mountComponent({ methods: { cancelEdit: mock } })
        wrapper.findComponent(ListForm).vm.$emit('cancel')
        expect(mock).toHaveBeenCalled()
      })
    })
  })

  describe('script', () => {
    it('listpropsを受け取ることができる', () => {
      const wrapper = mountComponent({ stubs })
      expect(wrapper.props().list).toEqual(defaultList)
    })

    it('dataのeditListの初期値はlistProps', () => {
      const wrapper = mountComponent({ stubs })
      const list = wrapper.props().list
      expect(wrapper.vm.$data.editList).toEqual({ title: list.title, id: list.id })
    })

    describe('methods', () => {
      it('openForm', () => {
        const wrapper = mountComponent({ stubs })
        wrapper.vm.openForm()
        expect(wrapper.vm.$data.isShowForm).toEqual(true)
      })

      it('closeForm', async () => {
        const wrapper = mountComponent({ stubs })
        await wrapper.setData({ isShowForm: true })
        wrapper.vm.closeForm()
        expect(wrapper.vm.$data.isShowForm).toEqual(false)
      })

      it('cancelEdit', async () => {
        const wrapper = mountComponent({ stubs, methods: { closeForm: mock } })
        await wrapper.setData({ editList: { title: 'new title', id: defaultList.id } })
        wrapper.vm.cancelEdit()
        expect(wrapper.vm.$data.editList.title).toEqual(defaultList.title)
        expect(mock).toHaveBeenCalled()
      })

      describe('updateListTemplate', () => {
        const createStore = (updateListAction) => {
          return new Store({
            modules: {
              list: {
                namespaced: true,
                actions: { updateList: updateListAction }
              }
            }
          })
        }
        const createVForm = (validationResult) => {
          return Vue.component('VForm', {
            methods: {
              validate () { return validationResult }
            },
            template: '<div />'
          })
        }

        describe('バリデーションがfalseの場合', () => {
          it('storeのupdateListアクションをdispatchしない', () => {
            const form = createVForm(false)
            const wrapper = mountComponent({ stubs: { ...stubs, 'v-form': form }, store: createStore(mock) })
            wrapper.vm.updateListTemplate()
            expect(mock).not.toHaveBeenCalled()
          })
        })

        describe('バリデーションがtrueの場合', () => {
          let form
          beforeEach(() => {
            form = createVForm(true)
          })

          it('storeのupdateListアクションを呼び出す', () => {
            const wrapper = mountComponent({ stubs: { ...stubs, 'v-form': form }, store: createStore(mock) })
            wrapper.vm.updateListTemplate()
            expect(mock).toHaveBeenCalled()
          })

          describe('正常にリストをupdateできた場合', () => {
            it('closeFormメソッドを呼び出す', async () => {
              const updateListAction = () => Promise.resolve()
              const wrapper = mountComponent({
                stubs: { ...stubs, 'v-form': form },
                store: createStore(updateListAction),
                methods: { closeForm: mock }
              })
              await wrapper.vm.updateListTemplate()

              expect(mock).toHaveBeenCalled()
            })
          })

          describe('エラーが発生した場合', () => {
            it('$handler.standardAxiosErrorを呼び出す', async () => {
              const error = 'error'
              const updateListAction = () => Promise.reject(error)
              const wrapper = mountComponent({
                stubs: { ...stubs, 'v-form': form },
                store: createStore(updateListAction),
                mocks: { $handler: { standardAxiosError: mock } }
              })
              await wrapper.vm.updateListTemplate()

              expect(mock).toHaveBeenCalledWith(error)
            })
          })
        })
      })
    })
  })
})
