/* eslint-disable require-await */
import { cloneDeep } from 'lodash'
import { getters, mutations, actions } from '~/store/list'

const defaultLists = [
  { id: 1, title: 'list1', cards: [{ id: 1, title: 'card1' }, { id: 2, title: 'card2' }] },
  { id: 2, title: 'list2', cards: [{ id: 3, title: 'card3' }] },
  { id: 3, title: 'list3' }
]

describe('getters', () => {
  it('lists', () => {
    const result = getters.lists({ lists: defaultLists })
    expect(result).toEqual(defaultLists)
  })

  it('listsLength', () => {
    const result = getters.listsLength({ lists: defaultLists })
    expect(result).toEqual(defaultLists.length)
  })

  it('listIndex', () => {
    const result = getters.listIndex({ lists: defaultLists })(1)
    expect(result).toEqual(0)
  })

  it('listIndexWithDestroy', () => {
    // id1を削除した時のid2のindex
    const result = getters.listIndexWithDestroy({ lists: defaultLists })(2, 1)
    expect(result).toEqual(0)
  })

  it('findList', () => {
    const result = getters.findList({ lists: defaultLists })(1)
    expect(result).toEqual(defaultLists[0])
  })

  it('cardsLengthByListID', () => {
    const gettersStub = { findList: listID => defaultLists[0] }
    const result = getters.cardsLengthByListID({ lists: defaultLists }, gettersStub)(1)
    expect(result).toEqual(2)
  })

  it('cardIndex', () => {
    const result = getters.cardIndex({ lists: defaultLists })(3)
    expect(result).toEqual({ listIndex: 1, cardIndex: 0 })
  })

  it('cardIndexWithDestroy', () => {
    const gettersStub = {
      cardIndex (cardID) {
        return { listIndex: 0, cardIndex: 0 }
      }
    }
    const result = getters.cardIndexWithDestroy({ lists: defaultLists }, gettersStub)(2, 1)
    expect(result.listIndex).toEqual(0)
    expect(result.cardIndex).toEqual(0)
  })
})

describe('mutations', () => {
  const _state = () => ({
    lists: cloneDeep(defaultLists)
  })
  let state
  beforeEach(() => {
    state = _state()
  })

  it('setLists', () => {
    const newLists = [{ id: 10 }]
    mutations.setLists(state, newLists)
    expect(state.lists).toEqual(newLists)
  })

  it('createList', () => {
    const newList = { id: 3 }
    mutations.createList(state, newList)
    expect(state.lists).toEqual([...defaultLists, newList])
  })

  it('updateList', () => {
    const updatedList = { id: 1, title: 'updating list' }
    mutations.updateList(state, updatedList)
    expect(state.lists[0]).toEqual(updatedList)
  })

  it('destroyList', () => {
    const id = 1
    mutations.destroyList(state, id)
    expect(state.lists.length).toEqual(2)
    expect(state.lists[0].id).not.toEqual(id)
  })

  it('addList', () => {
    const list = { id: 4, title: 'test title' }
    const index = 1
    mutations.addList(state, { list, index })
    expect(state.lists).toEqual([defaultLists[0], list, defaultLists[1], defaultLists[2]])
  })

  it('createCard', () => {
    const newCard = { id: 10, title: 'newCard' }
    const listIndex = 0
    mutations.createCard(state, { card: newCard, listIndex })
    expect(state.lists[listIndex].cards.pop()).toEqual(newCard)
  })

  it('updateCard', () => {
    const updatedCard = { id: 1, title: 'updatedCard' }
    const listIndex = 0
    const cardIndex = 1
    mutations.updateCard(state, { card: updatedCard, listIndex, cardIndex })
    expect(state.lists[listIndex].cards[cardIndex]).toEqual(updatedCard)
  })

  it('destroyCard', () => {
    const listIndex = 0
    const cardIndex = 1
    mutations.destroyCard(state, { listIndex, cardIndex })
    expect(state.lists[listIndex].cards).toEqual([defaultLists[listIndex].cards[0]])
  })

  it('moveCard', () => {
    const toListIndex = 0
    const toCardIndex = 1
    const newCard = { id: 10, title: 'newCard' }
    mutations.moveCard(state, { card: newCard, toListIndex, toCardIndex })
    expect(state.lists[toListIndex].cards).toEqual([defaultLists[0].cards[0], newCard, defaultLists[0].cards[1]])
  })
})

describe('actions', () => {
  let commit
  let dispatch
  beforeEach(() => {
    commit = jest.fn()
    dispatch = jest.fn()
  })
  let axiosMock
  beforeEach(() => {
    axiosMock = {
      $get: jest.fn(),
      $post: jest.fn(),
      $put: jest.fn(),
      $delete: jest.fn(),
      $move: jest.fn()
    }
  })

  const axiosStub = {
    async $get () { return defaultLists },
    async $post () { return defaultLists[0] },
    async $put () { return defaultLists[0] },
    async $delete () { return null }
  }

  describe('getLists', () => {
    it('apiと通信してリスト一覧を取得する', () => {
      actions.$axios = axiosMock
      actions.getLists({ commit })
      expect(axiosMock.$get).toHaveBeenCalledWith('/lists')
    })

    it('commitする', async () => {
      actions.$axios = axiosStub
      await actions.getLists({ commit })
      expect(commit).toHaveBeenCalledWith('setLists', defaultLists)
    })
  })

  describe('createList', () => {
    const length = 10
    const title = 'new list'
    const gettersStub = { listsLength: length }

    it('apiと通信してリストを作成する', () => {
      actions.$axios = axiosMock
      actions.createList({ commit, getters: gettersStub }, title)
      expect(axiosMock.$post).toHaveBeenCalledWith('/lists', { title, index: length })
    })

    it('commitする', async () => {
      actions.$axios = axiosStub
      await actions.createList({ commit, getters: gettersStub }, title)
      expect(commit).toHaveBeenCalledWith('createList', defaultLists[0])
    })
  })

  describe('updateList', () => {
    it('apiと通信してリストを更新する', () => {
      actions.$axios = axiosMock
      actions.updateList({ commit }, defaultLists[0])
      expect(axiosMock.$put).toHaveBeenCalledWith(`/lists/${defaultLists[0].id}`, { title: defaultLists[0].title })
    })

    it('commitする', async () => {
      actions.$axios = axiosStub
      await actions.destroyList({ commit }, defaultLists[0])
      expect(commit).toHaveBeenCalledWith('destroyList', defaultLists[0])
    })
  })

  describe('destroyList', () => {
    it('apiと通信してリストを削除する', () => {
      const id = 1
      actions.$axios = axiosMock
      actions.destroyList({ commit }, id)
      expect(axiosMock.$delete).toHaveBeenCalledWith(`/lists/${id}`)
    })

    it('commitする', async () => {
      const id = 1
      actions.$axios = axiosStub
      await actions.destroyList({ commit }, id)
      expect(commit).toHaveBeenCalledWith('destroyList', id)
    })
  })

  describe('moveList', () => {
    let params
    let getters
    beforeEach(() => {
      params = { id: 1, index: 3 }
      getters = { findList (id) { return defaultLists[0] } }
    })

    it('apiと通信してリストを移動する', () => {
      actions.$axios = axiosMock
      actions.moveList({ commit, getters }, params)
      expect(axiosMock.$put).toHaveBeenCalledWith(`/lists/${params.id}/move`, { index: params.index })
    })

    it('動かすリストの削除', async () => {
      actions.$axios = axiosStub
      await actions.moveList({ commit, getters }, params)
      expect(commit).toHaveBeenNthCalledWith(1, 'destroyList', params.id)
    })

    it('動かしたリストをindex番号に追加', async () => {
      actions.$axios = axiosStub
      await actions.moveList({ commit, getters }, params)
      expect(commit).toHaveBeenNthCalledWith(2, 'addList', { list: defaultLists[0], index: params.index })
    })
  })

  it('createCard', () => {
    const listIndex = 10
    const gettersStub = { listIndex: listID => listIndex }
    const params = { card: { id: 10, title: 'new card' }, listID: 1 }
    actions.createCard({ commit, getters: gettersStub }, params)
    expect(commit).toHaveBeenCalledWith('createCard', { card: params.card, listIndex })
  })

  it('updateCard', () => {
    const listIndex = 0
    const cardIndex = 1
    const updatingCard = { id: 2, title: 'updated card' }
    const gettersStub = { cardIndex: cardID => ({ listIndex, cardIndex }) }
    actions.updateCard({ commit, getters: gettersStub }, updatingCard)
    expect(commit).toHaveBeenCalledWith('updateCard', { card: updatingCard, listIndex, cardIndex })
  })

  it('destroyCard', () => {
    const listIndex = 0
    const cardIndex = 1
    const destroyedCard = { id: 2, title: 'updated card' }
    const gettersStub = { cardIndex: cardID => ({ listIndex, cardIndex }) }
    actions.destroyCard({ commit, getters: gettersStub }, destroyedCard)
    expect(commit).toHaveBeenCalledWith('destroyCard', { listIndex, cardIndex })
  })

  describe('moveCard', () => {
    const toListID = 1
    const listIndex = 0
    const cardIndex = 1
    const card = defaultLists[0].cards[0]
    const gettersStub = { listIndex: listID => listIndex }

    it('動かすカードを削除する', () => {
      actions.moveCard({ commit, dispatch, getters: gettersStub }, { card, toIndex: cardIndex, toListID })
      expect(dispatch).toHaveBeenCalledWith('destroyCard', card)
    })

    it('カードを指定の位置に追加する', () => {
      actions.moveCard({ commit, dispatch, getters: gettersStub }, { card, toIndex: cardIndex, toListID })
      expect(commit).toHaveBeenCalledWith('moveCard', { card, toListIndex: listIndex, toCardIndex: cardIndex })
    })
  })
})
