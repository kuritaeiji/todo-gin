export const actions = {
  async createCard ({ dispatch, rootGetters }, { listID, title }) {
    const index = rootGetters['list/cardsLengthByListID'](listID)
    const card = await this.$axios.$post(`/lists/${listID}/cards`, { title, index })
    dispatch('list/createCard', { card, listID }, { root: true })
  },
  async updateCard ({ dispatch }, { card, title }) {
    const updatedCard = await this.$axios.$put(`/cards/${card.id}`, { title })
    dispatch('list/updateCard', updatedCard, { root: true })
  },
  async destroyCard ({ dispatch }, card) {
    await this.$axios.$delete(`/cards/${card.id}`)
    dispatch('list/destroyCard', card, { root: true })
  },
  async moveCard ({ dispatch }, { card, toListID, toIndex }) {
    dispatch('list/moveCard', { card, toListID, toIndex }, { root: true })
    await this.$axios.$put(`/cards/${card.id}/move`, { toListID, toIndex })
  }
}
