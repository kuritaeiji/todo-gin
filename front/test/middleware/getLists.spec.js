import getLists from '~/middleware/getLists'

describe('middleware/getLists', () => {
  let store
  beforeEach(() => {
    store = {
      dispatch: jest.fn()
    }
  })
  const createApp = (loggedIn) => {
    return { $auth: { loggedIn } }
  }

  it('ログイン済みの場合リスト一覧を取得する', () => {
    getLists({ store, app: createApp(true) })
    expect(store.dispatch).toHaveBeenCalledWith('list/getLists')
  })

  it('ログインしていない場合リスト一覧を取得しない', () => {
    getLists({ store, app: createApp(false) })
    expect(store.dispatch).not.toHaveBeenCalled()
  })
})
