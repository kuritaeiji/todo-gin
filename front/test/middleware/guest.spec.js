import guest from '~/middleware/guest'

describe('middleware/guest', () => {
  it('authプラグインに処理を移譲する', () => {
    const mock = jest.fn()
    const ctx = {
      app: {
        $auth: {
          guestMiddleware: mock
        }
      }
    }
    guest(ctx)
    expect(mock).toHaveBeenCalledWith(ctx)
  })
  // let store
  // let redirect
  // beforeEach(() => {
  //   store = { dispatch: jest.fn() }
  //   redirect = jest.fn()
  // })
  // const app = { i18n: { t: key => key }, $auth: { loggedIn: false } }
  // const from = { name: 'index' }

  // describe('ログインしていない場合', () => {
  //   it('何もしない', () => {
  //     guest({ app, redirect, store, from })
  //     expect(store.dispatch).not.toHaveBeenCalled()
  //     expect(redirect).not.toHaveBeenCalled()
  //   })
  // })

  // describe('ログインしている場合', () => {
  //   it('フラッシュメッセージを作成', () => {
  //     app.$auth.loggedIn = true
  //     guest({ app, redirect, store, from })
  //     expect(store.dispatch).toHaveBeenNthCalledWith(1, 'flash/setFlash', { text: 'flash.guestMiddleware', color: 'red' })
  //   })

  //   it('indexパスにリダイレクトする', () => {
  //     guest({ app, redirect, store, from })
  //     expect(redirect).toHaveBeenCalledWith({ name: 'index' })
  //   })

  //   it('遷移元がindexパスである場合、flashメッセージのtransitionCountを1増やす', () => {
  //     guest({ app, redirect, store, from })
  //     expect(store.dispatch).toHaveBeenNthCalledWith(2, 'flash/countUpFlash')
  //   })

  //   it('遷移元がindexパス以外の場合は、flashメッセージのtransitionカウントを増やさない', () => {
  //     from.name = '/signup'
  //     guest({ app, redirect, store, from })
  //     expect(store.dispatch).toHaveBeenCalledTimes(1)
  //   })
  // })
})
