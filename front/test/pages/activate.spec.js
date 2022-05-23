import { alreadyActivatedUserError, jwtExpiredError } from '~/errors'
import activate from '~/pages/activate'

describe('pages/activate.vue', () => {
  it('layoutはempty', () => {
    expect(activate.layout).toEqual('empty')
  })

  describe('middleware', () => {
    let store
    let app
    let redirect
    const query = { token: 'token' }
    beforeEach(() => {
      store = { dispatch: jest.fn() }
      app = {
        i18n: { t: key => key },
        $handler: { standardAxiosError: jest.fn() }
      }
      redirect = jest.fn()
    })

    it('apiと通信する', () => {
      const $axios = { $put: jest.fn() }
      activate.middleware({ $axios, store, app, redirect, query })
      expect($axios.$put).toHaveBeenCalledWith(`/users/activate?token=${query.token}`)
    })

    describe('200レスポンスが返る場合', () => {
      const $axios = { $put: () => new Promise((resolve) => { resolve() }) }

      it('フラッシュメッセージを作成する', async () => {
        await activate.middleware({ $axios, store, app, redirect, query })
        expect(store.dispatch).toHaveBeenCalledWith('flash/setFlash', { color: 'info', text: 'flash.activateUser' })
      })

      it('ログインパスにリダイレクトする', async () => {
        await activate.middleware({ $axios, store, app, redirect, query })
        expect(redirect).toHaveBeenCalledWith({ name: 'login' })
      })
    })

    describe('エラーレスポンスが返る場合', () => {
      describe('トークン期限切れエラーレスポンスが返る場合', () => {
        const error = { response: { status: jwtExpiredError.status, data: { content: jwtExpiredError.content } } }
        const $axios = { $put: () => new Promise((resolve, reject) => { reject(error) }) }

        it('フラッシュメッセージを作成する', async () => {
          await activate.middleware({ $axios, store, app, redirect, query })
          expect(store.dispatch).toHaveBeenCalledWith('flash/setFlash', { color: 'red', text: 'flash.jwtExpiredError' })
        })

        it('indexパスにリダイレクトする', async () => {
          await activate.middleware({ $axios, store, app, redirect, query })
          expect(redirect).toHaveBeenCalledWith({ name: 'index' })
        })
      })

      describe('既にユーザーが有効化されているエラーが返る場合', () => {
        const error = { response: { status: alreadyActivatedUserError.status, data: { content: alreadyActivatedUserError.content } } }
        const $axios = { $put: () => new Promise((resolve, reject) => { reject(error) }) }

        it('フラッシュメッセージを作成する', async () => {
          await activate.middleware({ $axios, store, app, redirect, query })
          expect(store.dispatch).toHaveBeenCalledWith('flash/setFlash', { color: 'red', text: 'flash.alreadyActivatedUserError' })
        })

        it('indexパスにリダイレクトする', async () => {
          await activate.middleware({ $axios, store, app, redirect, query })
          expect(redirect).toHaveBeenCalledWith({ name: 'index' })
        })
      })

      describe('それ以外のエラーが返る場合', () => {
        it('標準のエラー処理を行う', async () => {
          const error = 'error'
          const $axios = { $put: () => new Promise((resolve, reject) => { reject(error) }) }
          await activate.middleware({ $axios, store, app, redirect, query })
          expect(app.$handler.standardAxiosError).toHaveBeenCalledWith(error)
        })
      })
    })
  })
})
