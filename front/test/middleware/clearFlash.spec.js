import clearFlash from '~/middleware/clearFlash'

describe('middleware/clearFlash', () => {
  let store
  beforeEach(() => {
    store = {
      dispatch: jest.fn(),
      getters: {
        'flash/flash': {
          transitionCount: 0
        }
      }
    }
  })

  it('画面遷移する度にtransitionCountを+する', () => {
    clearFlash({ store })
    expect(store.dispatch).toHaveBeenCalledWith('flash/countUpFlash')
  })

  it('transitionCountが1の場合、flashメッセージを削除しない', () => {
    clearFlash({ store })
    expect(store.dispatch).toHaveBeenCalledTimes(1)
  })

  it('transitionCountが2の場合、flashメッセージを削除', () => {
    store.getters['flash/flash'].transitionCount = 2
    clearFlash({ store })
    expect(store.dispatch).toHaveBeenNthCalledWith(2, 'flash/clearFlash')
  })
})
