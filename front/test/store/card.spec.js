import { actions } from '~/store/card'

describe('store/card.js', () => {
  const defaultCard = { id: 1, title: 'card' }

  describe('actions', () => {
    let axiosMock
    let dispatch
    beforeEach(() => {
      axiosMock = {
        $post: jest.fn(),
        $put: jest.fn(),
        $delete: jest.fn()
      }
      dispatch = jest.fn()
    })
    const axiosStub = {
      $post: () => { return Promise.resolve(defaultCard) },
      $put: () => { return Promise.resolve(defaultCard) },
      $delete: () => { return Promise.resolve() }
    }

    describe('createCard', () => {
      const cardsLength = 10
      const rootGetters = { 'list/cardsLengthByListID': listID => cardsLength }
      const params = { listID: 1, title: 'new card' }

      it('apiと通信してcardを作成する', () => {
        actions.$axios = axiosMock
        actions.createCard({ dispatch, rootGetters }, params)
        expect(axiosMock.$post).toHaveBeenCalledWith(`/lists/${params.listID}/cards`, { title: params.title, index: cardsLength })
      })

      it('front側のcardを追加するようlistStoreにdispatchする', async () => {
        actions.$axios = axiosStub
        await actions.createCard({ dispatch, rootGetters }, params)
        expect(dispatch).toHaveBeenCalledWith('list/createCard', { card: defaultCard, listID: params.listID }, { root: true })
      })
    })

    describe('updateCard', () => {
      const newTitle = 'new title'

      it('apiと通信してタイトルを更新する', () => {
        actions.$axios = axiosMock
        actions.updateCard({ dispatch }, { card: defaultCard, title: newTitle })
        expect(axiosMock.$put).toHaveBeenCalledWith(`/cards/${defaultCard.id}`, { title: newTitle })
      })

      it('front側のカードを更新するようlistStoreのupdateCardアクションをdispatchする', async () => {
        actions.$axios = axiosStub
        await actions.updateCard({ dispatch }, { card: defaultCard, title: newTitle })
        expect(dispatch).toHaveBeenCalledWith('list/updateCard', defaultCard, { root: true })
      })
    })

    describe('destroyCard', () => {
      it('apiと通信してカードを削除する', () => {
        actions.$axios = axiosMock
        actions.destroyCard({ dispatch }, defaultCard)
        expect(axiosMock.$delete).toHaveBeenCalledWith(`/cards/${defaultCard.id}`)
      })

      it('front側のカードを削除するようlistStoreのdestroyCardアクションをdispatchする', async () => {
        actions.$axios = axiosStub
        await actions.destroyCard({ dispatch }, defaultCard)
        expect(dispatch).toHaveBeenCalledWith('list/destroyCard', defaultCard, { root: true })
      })
    })

    describe('moveCard', () => {
      const params = { toListID: 1, toIndex: 10 }

      it('apiと通信してカードを移動させる', () => {
        actions.$axios = axiosMock
        actions.moveCard({ dispatch }, { ...params, card: defaultCard })
        expect(axiosMock.$put).toHaveBeenCalledWith(`/cards/${defaultCard.id}/move`, params)
      })

      it('front側のカードを移動するようlistStoreのmoveCardアクションをdispatchする', async () => {
        actions.$axios = axiosStub
        await actions.moveCard({ dispatch }, { ...params, card: defaultCard })
        expect(dispatch).toHaveBeenCalledWith('list/moveCard', { card: defaultCard, ...params }, { root: true })
      })
    })
  })
})
