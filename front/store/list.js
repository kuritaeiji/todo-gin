// [{ id: 1, title: 'list1', cards: [{ id:1, title: "card1", listID: 1 }] }]
// カードのlistIDはドラッグ&ドロップすると変化するので信用できない数値

import { cloneDeep } from 'lodash'

export const state = () => ({
  lists: []
})

export const getters = {
  lists (state) {
    return state.lists
  },
  listsLength (state) {
    return state.lists.length
  },
  listIndex (state) {
    return (id) => {
      return state.lists.findIndex(list => list.id === id)
    }
  },
  listIndexWithDestroy (state) {
    return (id, destroyID) => {
      const lists = state.lists.filter(list => list.id !== destroyID)
      return lists.findIndex(list => list.id === id)
    }
  },
  findList (state) {
    return (id) => {
      return state.lists.find(list => list.id === id)
    }
  },
  // カード
  cardsLengthByListID (state, getters) {
    return (listID) => {
      return getters.findList(listID).cards.length
    }
  },
  cardIndex (state) {
    // リストのindexとカードのindexを返す
    return (cardID) => {
      return cardIndex(state.lists, cardID)
    }
  },
  cardIndexWithDestroy (state, getters) {
    return (cardID, destroyID) => {
      const destroyCardIndex = getters.cardIndex(destroyID)
      const cloneLists = cloneDeep(state.lists)
      cloneLists[destroyCardIndex.listIndex].cards.splice(destroyCardIndex.cardIndex, 1)
      return cardIndex(cloneLists, cardID)
    }
  }
}

export const cardIndex = (lists, cardID) => {
  let index
  for (let i = 0; i < lists.length; i++) {
    const result = lists[i].cards.findIndex(card => card.id === cardID)
    if (result >= 0) {
      index = { listIndex: i, cardIndex: result }
      break
    }
  }
  return index
}

export const mutations = {
  setLists (state, lists) {
    state.lists = lists
  },
  createList (state, list) {
    state.lists.push(list)
  },
  updateList (state, list) {
    const index = state.lists.findIndex(l => l.id === list.id)
    state.lists.splice(index, 1, list)
  },
  destroyList (state, id) {
    state.lists = state.lists.filter(list => list.id !== id)
  },
  addList (state, { list, index }) {
    state.lists.splice(index, 0, list)
  },
  // カード
  createCard (state, { card, listIndex }) {
    state.lists[listIndex].cards.push(card)
  },
  updateCard (state, { card, listIndex, cardIndex }) {
    state.lists[listIndex].cards.splice(cardIndex, 1, card)
  },
  destroyCard (state, { listIndex, cardIndex }) {
    state.lists[listIndex].cards.splice(cardIndex, 1)
  },
  moveCard (state, { card, toListIndex, toCardIndex }) {
    state.lists[toListIndex].cards.splice(toCardIndex, 0, card)
  }
}

export const actions = {
  async getLists ({ commit }) {
    const response = await this.$axios.$get('/lists')
    commit('setLists', response)
  },
  async createList ({ commit, getters }, title) {
    const index = getters.listsLength
    const response = await this.$axios.$post('/lists', { title, index })
    commit('createList', response)
  },
  async updateList ({ commit }, list) {
    const response = await this.$axios.$put(`/lists/${list.id}`, { title: list.title })
    commit('updateList', response)
  },
  async destroyList ({ commit }, id) {
    await this.$axios.$delete(`/lists/${id}`)
    commit('destroyList', id)
  },
  async moveList ({ commit, getters }, { id, index }) {
    await this.$axios.$put(`/lists/${id}/move`, { index })
    const list = getters.findList(id)
    commit('destroyList', id)
    commit('addList', { list, index })
  },
  // カード
  createCard ({ commit, getters }, { card, listID }) {
    const listIndex = getters.listIndex(listID)
    commit('createCard', { card, listIndex })
  },
  updateCard ({ commit, getters }, card) {
    const { listIndex, cardIndex } = getters.cardIndex(card.id)
    commit('updateCard', { card, listIndex, cardIndex })
  },
  destroyCard ({ commit, getters }, card) {
    const { listIndex, cardIndex } = getters.cardIndex(card.id)
    commit('destroyCard', { listIndex, cardIndex })
  },
  moveCard ({ commit, dispatch, getters }, { card, toIndex, toListID }) {
    dispatch('destroyCard', card)
    const toListIndex = getters.listIndex(toListID)
    commit('moveCard', { card, toListIndex, toCardIndex: toIndex })
  }
}
