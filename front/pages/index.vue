<template>
  <v-container fluid fill-height class="d-flex flex-nowrap align-start overflow-x-auto">
    <list-card
      v-for="list of lists"
      :key="`list-card-${list.id}`"
      :list="list"
      class="list-card"
      :data-id="list.id"
      @mousedown="mouseDown"
    >
      <card-card
        v-for="card in list.cards"
        :key="`card-card-${card.id}`"
        :card="card"
        class="card-card"
        :data-id="card.id"
        :data-list-id="list.id"
        @mousedown.stop="mouseDownCard"
      />
      <card-create-form :list-id="list.id" />
    </list-card>

    <list-create-card />
  </v-container>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import ListCard from '~/components/list/Card.vue'
import ListCreateCard from '~/components/list/CreateCard.vue'
import ListCardPlaceholder from '~/components/list/CardPlaceholder.vue'
import CardCardPlaceholder from '~/components/card/CardPlaceholder.vue'
import CardCreateForm from '~/components/card/CreateForm.vue'
import CardCard from '~/components/card/Card.vue'

const defaultDragParam = { id: null, index: null }
const defaultDragCardParam = { card: null, toIndex: null, toListID: null }
const startScrollPx = 100
const scrollSpeed = 10

export default {
  components: { ListCard, CardCreateForm, ListCreateCard, CardCard },
  layout ({ app }) {
    return app.$auth.loggedIn ? 'default' : 'toppage'
  },
  middleware: ['getLists'],
  data () {
    return {
      isDraggingList: false,
      isDraggingCard: false,
      draggingList: null,
      dragElement: '',
      element: '',
      elementRect: '',
      placeholder: '',
      isFirstMouseMove: false,
      initialPageX: 0,
      initialPageY: 0,
      moveX: 0,
      moveY: 0,
      dragParam: { ...defaultDragParam },
      dragCardParam: { ...defaultDragCardParam },
      headerHeight: 0,
      containerElement: '',
      cssText: ''
    }
  },
  head () {
    return {
      title: this.$t('page.index')
    }
  },
  computed: {
    ...mapGetters('list', ['lists', 'listIndexWithDestroy', 'listIndex', 'cardIndexWithDestroy', 'cardIndex']),
    dragElementCenterX () {
      return this.elementRect.left + this.moveX + (this.elementRect.width / 2)
    },
    dragElementCenterY () {
      return this.elementRect.top + this.moveY + (this.elementRect.height / 2)
    },
    isChangedDraggedListIndex () {
      return this.listIndex(this.draggingList.id) !== this.dragParam.index
    },
    isChangedDraggedCardIndex () {
      const index = this.cardIndex(this.dragCardParam.card.id)
      return (this.dragCardParam.toIndex !== index.cardIndex) || (this.dragCardParam.toListID !== this.lists[index.listIndex].id)
    }
  },
  mounted () {
    this.headerHeight = document.getElementsByTagName('header')[0].clientHeight
    // v-main__wrapにposition: relativeがある為containerElementの下にdragElementを置く
    this.containerElement = document.getElementsByClassName('container')[0]
    window.addEventListener('mousemove', this.mouseMove)
    window.addEventListener('mouseup', this.mouseUp)
  },
  beforeDestroy () {
    window.removeEventListener('mousemove', this.mouseMove)
    window.removeEventListener('mouseup', this.mouseUp)
  },
  methods: {
    ...mapActions('list', ['moveList']),
    ...mapActions('card', ['moveCard']),
    mouseDown (event, list) {
      this.isDraggingList = true
      this.element = event.currentTarget
      this.elementRect = this.element.getBoundingClientRect()
      this.isFirstMouseMove = true
      this.initialPageX = event.pageX
      this.initialPageY = event.pageY
      this.dragParam.id = list.id
      this.draggingList = list
    },
    mouseDownCard (event, card) {
      this.isDraggingCard = true
      this.element = event.currentTarget
      this.elementRect = this.element.getBoundingClientRect()
      this.isFirstMouseMove = true
      this.initialPageX = event.pageX
      this.initialPageY = event.pageY
      this.dragCardParam = Object.assign({}, this.dragCardParam, { card, toListID: Number(this.element.dataset.listId) })
    },
    mouseMove (event) {
      if (this.isDraggingList) {
        if (this.isFirstMouseMove) {
          this._setPlaceholder()
          this._setDragElement()
          this._makeElementInvisible()
          this.isFirstMouseMove = false
        }

        this._moveDragElement(event)
        this._scrollRight()
        this._scrollLeft()
        this._moveListTemplate()
      }

      if (this.isDraggingCard) {
        if (this.isFirstMouseMove) {
          this._setDragCard()
          this._makeElementInvisible()
          this._setCardPlaceholder()
          this.isFirstMouseMove = false
        }

        this._moveDragElement(event)
        this._scrollRight()
        this._scrollLeft()
        this._moveCardTemplate()
      }
    },
    async mouseUp () {
      if (this.isDraggingList) {
        if (this.dragParam.id === null || this.dragParam.index === null || !this.isChangedDraggedListIndex) {
          this._finishDraggingList()
          this._initDragParam()
          return
        }

        try {
          this._finishDraggingList()
          await this.moveList(this.dragParam)
          this._initDragParam()
        } catch (error) {
          this.$handler.standardAxiosError(error)
        }
      }

      if (this.isDraggingCard) {
        if (this.card === null || this.dragCardParam.toIndex === null || !this.isChangedDraggedCardIndex) {
          this._finishDraggingCard()
          this._initDragCardParam()
          return
        }

        try {
          this._finishDraggingCard()
          await this.moveCard(this.dragCardParam)
          this._initDragCardParam()
        } catch (error) {
          this.$handler.standardAxiosError(error)
        }
      }
    },
    _setPlaceholder () {
      const Class = Vue.extend(ListCardPlaceholder)
      const instance = new Class({
        propsData: { height: this.elementRect.height }
      }).$mount()
      this.placeholder = instance.$el
      this.element.parentNode.insertBefore(this.placeholder, this.element)
    },
    _setCardPlaceholder () {
      const Class = Vue.extend(CardCardPlaceholder)
      const instance = new Class().$mount()
      this.placeholder = instance.$el
      this.element.parentNode.insertBefore(this.placeholder, this.element)
    },
    _setDragElement () {
      this.dragElement = this.element.cloneNode(true)
      // 複製したノードはlist-cardを外す ドラッグしている要素以外を見つけ出す為
      this.dragElement.classList.remove('list-card')
      this.containerElement.appendChild(this.dragElement)
      this.dragElement.style.position = 'absolute'
      this.dragElement.style.zIndex = 100
      this.dragElement.style.top = this.elementRect.top + 'px'
      this.dragElement.style.left = this.elementRect.left + 'px'
    },
    _setDragCard () {
      this.dragElement = this.element.cloneNode(true)
      this.containerElement.appendChild(this.dragElement)
      this.dragElement.style.width = this.element.clientWidth + 'px'
      this.dragElement.style.position = 'absolute'
      this.dragElement.style.zIndex = 100
      this.dragElement.style.top = this.elementRect.top - this.headerHeight + 'px'
      this.dragElement.style.left = this.elementRect.left + 'px'
    },
    _makeElementInvisible () {
      this.cssText = this.element.style.cssText
      this.element.style.cssText = 'display: none !important'
    },
    _makeElementVisible () {
      this.element.style.cssText = this.cssText
    },
    _moveDragElement (event) {
      // 最初の位置 + 動いた距離
      this.moveX = event.pageX - this.initialPageX
      this.moveY = event.pageY - this.initialPageY
      this.dragElement.style.left = this.elementRect.left + this.moveX + 'px'
      this.dragElement.style.top = this.elementRect.top + this.moveY - this.headerHeight + 'px'
    },
    _scrollRight () {
      const containerActualWidth = window.scrollX + this.containerElement.clientWidth
      const diffWidthRight = containerActualWidth - this.dragElementCenterX
      if (diffWidthRight < startScrollPx) {
        this.containerElement.scrollLeft += (startScrollPx - diffWidthRight) / scrollSpeed
      }
    },
    _scrollLeft () {
      const diffWidth = this.dragElementCenterX - window.scrollX
      if (diffWidth < startScrollPx) {
        this.containerElement.scrollLeft -= (startScrollPx - diffWidth) / scrollSpeed
      }
    },
    _moveListTemplate () {
      const self = this
      const lists = [...document.getElementsByClassName('list-card')].filter(list => Number(list.dataset.id) !== self.dragParam.id)

      lists.forEach((list) => {
        const rect = list.getBoundingClientRect()
        const centerX = rect.left + (rect.width / 2)
        const offsetX = this.dragElementCenterX - centerX

        if (Math.abs(offsetX) < (self.elementRect.width / 2)) {
          self.placeholder.remove()
          self._setPlaceholder()

          const listID = Number(list.dataset.id)
          if (offsetX < 0) {
            // 左から右入れ替えるリストの後にプレースホルダーを置く
            self.containerElement.insertBefore(self.placeholder, list.nextSibling)
            this.$set(this.dragParam, 'index', this.listIndexWithDestroy(listID, this.dragParam.id) + 1)
          }
          if (offsetX > 0) {
            // 右から左に入れ替えるリストの後にプレースホルダーを置く
            self.containerElement.insertBefore(self.placeholder, list)
            this.$set(this.dragParam, 'index', this.listIndexWithDestroy(listID, this.dragParam.id))
          }
        }
      })
    },
    _moveCardTemplate () {
      const self = this
      const lists = [...document.getElementsByClassName('list-card')]

      lists.forEach((list) => {
        const listRect = list.getBoundingClientRect()
        const listCenterX = listRect.left + (listRect.width / 2)
        const listOffsetX = this.dragElementCenterX - listCenterX

        if (Math.abs(listOffsetX) < (listRect.width / 2)) {
          const listID = Number(list.dataset.id)
          const cards = [...document.getElementsByClassName('card-card')].filter(card => (Number(card.dataset.id) !== self.dragCardParam.card.id) && (Number(card.dataset.listId) === listID))

          if (cards.length) {
            // リストにカードが存在する場合
            cards.forEach((card) => {
              const cardRect = card.getBoundingClientRect()
              const cardCenterY = cardRect.top + (cardRect.height / 2)
              const cardOffsetY = this.dragElementCenterY - cardCenterY

              const cardID = Number(card.dataset.id)
              if (Math.abs(cardOffsetY) < (self.elementRect.height / 2)) {
                if (cardOffsetY < 0) {
                  // 上から下に移動する
                  list.insertBefore(self.placeholder, card.nextSibling)
                  const index = this.cardIndexWithDestroy(cardID, self.dragCardParam.card.id)
                  this.dragCardParam = Object.assign({}, this.dragCardParam, { toIndex: index.cardIndex + 1, toListID: listID })
                }

                if (cardOffsetY > 0) {
                  // 下から上に移動する
                  list.insertBefore(self.placeholder, card)
                  const index = this.cardIndexWithDestroy(cardID, self.dragCardParam.card.id)
                  this.dragCardParam = Object.assign({}, this.dragCardParam, { toIndex: index.cardIndex, toListID: listID })
                }
              }
            })
          } else {
            // カードがリストに存在しない時カード作成ボタンの前にプレースホルダーを挿入
            list.insertBefore(self.placeholder, list.children[list.children.length - 1])
            this.dragCardParam = Object.assign({}, this.dragCardParam, { toIndex: 0, toListID: listID })
          }
        }
      })
    },
    _finishDraggingList () {
      this.isDraggingList = false
      this.isDraggingCard = false
      this._makeElementVisible()
      this.placeholder.remove()
      this.dragElement.remove()
    },
    _initDragParam () {
      this.dragParam = { ...defaultDragParam }
    },
    _finishDraggingCard () {
      this.isDraggingCard = false
      this._makeElementVisible()
      this.dragElement.remove()
      this.placeholder.remove()
    },
    _initDragCardParam () {
      this.dragCardParam = { ...defaultDragCardParam }
    }
  }
}
</script>
