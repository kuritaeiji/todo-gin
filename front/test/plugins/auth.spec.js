import { Auth } from '~/plugins/auth'
import { recordNotFoundError, passwordAuthenticationError, notLoggedInError, notLoggedInWithJwtIsExpiredError, guestError } from '~/errors'

describe('plugins/Auth', () => {
  describe('login', () => {
    const authParams = { email: 'test@example.com', password: 'password' }

    it('$axiosに$postメソッドを送信する', () => {
      const $axios = {
        $post: jest.fn()
      }
      const auth = new Auth({ $axios, stoer: 'store', app: 'app' })
      auth.login(authParams)
      expect($axios.$post).toHaveBeenCalledWith('/login', authParams)
    })

    it('ログインに成功するとlocalstorageにBearerトークンを保存し、authstoreのloggedInステートをtrueにし、flashメッセージを作成し、indexパスにリダイレクトする', async () => {
      const response = { token: 'token' }
      const $axios = {
        $post () { return new Promise(resolve => resolve(response)) }
      }
      const store = { dispatch: jest.fn() }
      const redirect = jest.fn()
      const app = { i18n: { t (key) { return key } } }
      const auth = new Auth({ $axios, store, redirect, app })
      auth.storage = { setItem: jest.fn() }

      await auth.login(authParams)
      expect(auth.storage.setItem).toHaveBeenCalledWith(auth.accessTokenKey, auth.tokenType + response.token)
      expect(store.dispatch.mock.calls[0]).toEqual(['auth/setLoggedIn', true])
      expect(store.dispatch.mock.calls[1]).toEqual(['flash/setFlash', { color: 'info', text: 'flash.login' }])
      expect(redirect).toHaveBeenCalledWith({ name: 'index' })
    })

    it('ログインが失敗し、ユーザーが見つからなかった場合バリデーションを作成する', async () => {
      const error = { response: { status: recordNotFoundError.status, data: { content: recordNotFoundError.content } } }
      const $axios = { $post () { return new Promise((resolve, reject) => reject(error)) } }
      const store = { dispatch: jest.fn() }
      const app = { i18n: { t (key) { return key } } }
      const auth = new Auth({ $axios, store, app })
      await auth.login(authParams)

      expect(store.dispatch).toHaveBeenCalledWith('validation/setValidation', `error.login.${recordNotFoundError.content}`)
    })

    it('ログインが失敗し、パスワードが間違っている場合バリデーションを作成する', async () => {
      const error = { response: { status: passwordAuthenticationError.status, data: { content: passwordAuthenticationError.content } } }
      const $axios = { $post () { return new Promise((resolve, reject) => reject(error)) } }
      const store = { dispatch: jest.fn() }
      const app = { i18n: { t (key) { return key } } }
      const auth = new Auth({ $axios, store, app })
      await auth.login(authParams)

      expect(store.dispatch).toHaveBeenCalledWith('validation/setValidation', `error.login.${passwordAuthenticationError.content}`)
    })

    it('ログインが意図しないエラーで失敗する場合$handlerにstandardAxiosErrorメソッドを送信する', async () => {
      const error = {}
      const $axios = { $post () { return new Promise((resolve, reject) => reject(error)) } }
      const app = { $handler: { standardAxiosError: jest.fn() } }
      const auth = new Auth({ $axios, store: 'store', app })
      await auth.login(authParams)

      expect(app.$handler.standardAxiosError).toHaveBeenCalledWith(error)
    })
  })

  describe('requestGoogleAuthEndpointメソッド', () => {
    it('apiと通信してurlを取得', () => {
      const $axios = { $get: jest.fn() }
      const auth = new Auth({ $axios })
      auth.requestGoogleAuthEndpoint()
      expect($axios.$get).toHaveBeenCalledWith('/google')
    })

    it('apiとの通信が失敗した場合、$handler.standardAxiosErrorメソッドを呼び出す', async () => {
      const error = 'error'
      const $axios = { $get: () => Promise.reject(error) }
      const app = { $handler: { standardAxiosError: jest.fn() } }
      const auth = new Auth({ $axios, app })
      await auth.requestGoogleAuthEndpoint()
      expect(app.$handler.standardAxiosError).toHaveBeenCalledWith(error)
    })

    it('apiから返ったurlにリダイレクトする', async () => {
      const response = { url: 'https://api.google.com', state: 'state' }
      const $axios = { $get: () => Promise.resolve(response) }
      const auth = new Auth({ $axios })
      const mock = jest.fn()
      delete window.location
      window.location = Object.defineProperties({}, { assign: { configurable: true, value: mock } })
      await auth.requestGoogleAuthEndpoint()
      expect(mock).toHaveBeenCalledWith(response.url)
    })
  })

  describe('googleLoginメソッド', () => {
    const query = { state: 'state', code: 'code' }

    it('/google/loginパスにpostする', () => {
      const $axios = { $post: jest.fn() }
      const auth = new Auth({ $axios })
      auth.googleLogin(query)

      expect($axios.$post).toHaveBeenCalledWith('/google/login', { state: query.state, code: query.code })
    })

    it('成功する場合_loginResolveメソッドをよびだす', async () => {
      const response = 'response'
      const $axios = { $post: () => Promise.resolve(response) }
      const auth = new Auth({ $axios })
      auth._loginResolve = jest.fn()
      await auth.googleLogin(query)

      expect(auth._loginResolve).toHaveBeenCalledWith(response)
    })

    it('失敗する場合app.$handler.standardAxiosErrorメソッドをよびだす', async () => {
      const error = 'error'
      const $axios = { $post: () => Promise.reject(error) }
      const app = { $handler: { standardAxiosError: jest.fn() } }
      const auth = new Auth({ $axios, app })
      await auth.googleLogin(query)

      expect(app.$handler.standardAxiosError).toHaveBeenCalledWith(error)
    })
  })

  describe('logoutメソッド', () => {
    const app = { i18n: { t: key => key } }
    let storage
    let store
    let redirect
    let vue
    beforeEach(() => {
      storage = { removeItem: jest.fn() }
      store = { dispatch: jest.fn() }
      redirect = jest.fn()
      vue = {
        $nuxt: {
          setLayout: jest.fn()
        }
      }
    })

    describe('遷移元のpathがindexでない場合', () => {
      const routeName = 'not-index'
      let auth
      beforeEach(() => {
        auth = new Auth({ store, app, redirect })
        auth.storage = storage
      })

      it('localstorageのjwtを削除', () => {
        auth.logout(vue, routeName)
        expect(auth.storage.removeItem).toHaveBeenCalledWith(auth.accessTokenKey)
      })

      it('storeのloggedInをfalseにする', () => {
        auth.logout(vue, routeName)
        expect(auth.store.dispatch).toHaveBeenNthCalledWith(1, 'auth/setLoggedIn', false)
      })

      it('flashMessageを作成する', () => {
        auth.logout(vue, routeName)
        expect(auth.store.dispatch).toHaveBeenNthCalledWith(2, 'flash/setFlash', { color: 'info', text: 'flash.logout' })
      })

      it('indexパスにリダイレクトする', () => {
        auth.logout(vue, routeName)
        expect(auth.redirect).toHaveBeenCalledWith({ name: 'index' })
      })

      it('レイアウトをtoppageにしない', () => {
        auth.logout(vue, routeName)
        expect(vue.$nuxt.setLayout).not.toHaveBeenCalled()
      })

      it('flashメッセージのtransitionカウントを+しない', () => {
        auth.logout(vue, routeName)
        expect(auth.store.dispatch).toHaveBeenCalledTimes(2)
      })
    })

    describe('遷移元のpathがindexである場合', () => {
      const routeName = 'index'
      let auth
      beforeEach(() => {
        auth = new Auth({ store, app, redirect })
        auth.storage = storage
      })

      it('レイアウトをtoppageにする', () => {
        auth.logout(vue, routeName)
        expect(vue.$nuxt.setLayout).toHaveBeenCalledWith('toppage')
      })

      it('flashメッセージのtransitionCountを+する', () => {
        auth.logout(vue, routeName)
        expect(auth.store.dispatch).toHaveBeenNthCalledWith(3, 'flash/countUpFlashBecauseNotRedirect')
      })

      it('indexパスにリダイレクトしない', () => {
        auth.logout(vue, routeName)
        expect(auth.redirect).not.toHaveBeenCalled()
      })
    })
  })

  describe('authMiddlewareメソッド', () => {
    let store
    let redirect
    let auth
    const app = { i18n: { t: key => key } }
    beforeEach(() => {
      store = { dispatch: jest.fn(), getters: { 'auth/loggedIn': true } }
      redirect = jest.fn()
      auth = new Auth({ store, redirect, app })
    })

    describe('ログインしている場合', () => {
      it('何もしない', () => {
        auth.authMiddleware({})
        expect(store.dispatch).not.toHaveBeenCalled()
        expect(redirect).not.toHaveBeenCalled()
      })
    })

    describe('ログインしていない場合', () => {
      beforeEach(() => {
        store.getters['auth/loggedIn'] = false
      })

      let from = { name: 'login' }

      it('フラッシュメッセージを作成する', () => {
        auth.authMiddleware({ from })
        expect(store.dispatch).toHaveBeenNthCalledWith(1, 'flash/setFlash', { text: 'flash.authMiddleware', color: 'red' })
      })

      it('ログインパスにリダイレクトする', () => {
        auth.authMiddleware({ from })
        expect(redirect).toHaveBeenCalledWith({ name: 'login' })
      })

      describe('遷移元のパスがloginパスの場合', () => {
        it('flashメッセージのtransitionCountを+する', () => {
          from = { name: 'login' }
          auth.authMiddleware({ from })
          expect(store.dispatch).toHaveBeenNthCalledWith(2, 'flash/countUpFlashBecauseNotRedirect')
        })
      })

      describe('遷移元のパスがloginパスでない場合', () => {
        it('flashメッセージのtransitionCountを+しない', () => {
          from = { name: 'not-login' }
          auth.authMiddleware({ from })
          expect(store.dispatch).toHaveBeenCalledTimes(1)
        })
      })
    })
  })

  describe('guestMiddlewareメソッド', () => {
    let store
    let redirect
    let auth
    const app = { i18n: { t: key => key } }
    const from = { name: 'not-index' }
    beforeEach(() => {
      store = {
        dispatch: jest.fn(),
        getters: {
          'auth/loggedIn': true
        }
      }
      redirect = jest.fn()
      auth = new Auth({ store, redirect, app })
    })

    describe('ログインしている場合', () => {
      it('フラッシュメッセージを作成する', () => {
        auth.guestMiddleware({ from })
        expect(store.dispatch).toHaveBeenNthCalledWith(1, 'flash/setFlash', { text: 'flash.guestMiddleware', color: 'red' })
      })

      it('indexパスにリダイレクト', () => {
        auth.guestMiddleware({ from })
        expect(redirect).toHaveBeenCalledWith({ name: 'index' })
      })

      describe('遷移元がindexパスの場合', () => {
        it('flashのcountを+する', () => {
          auth.guestMiddleware({ from: { name: 'index' } })
          expect(store.dispatch).toHaveBeenNthCalledWith(2, 'flash/countUpFlashBecauseNotRedirect')
        })
      })

      describe('遷移元がindexパス以外の場合', () => {
        it('flashのcountを+しない', () => {
          auth.guestMiddleware({ from })
          expect(store.dispatch).toHaveBeenCalledTimes(1)
        })
      })
    })

    describe('ログインしていない場合', () => {
      it('何もしない', () => {
        store.getters['auth/loggedIn'] = false
        auth.guestMiddleware({ from })
        expect(store.dispatch).not.toHaveBeenCalled()
        expect(redirect).not.toHaveBeenCalled()
      })
    })
  })

  describe('axiosRequestInterceptor', () => {
    it('ログインしている場合リクエストヘッダーにtoken付与する', () => {
      const store = { getters: { 'auth/loggedIn': true } }
      const token = 'token'
      const config = { headers: {} }
      const auth = new Auth({ store })
      auth.storage.getItem = key => token
      auth.axiosRequestInterceptor(config)
      expect(config.headers[auth.tokenHeader]).toEqual(auth.accessToken)
    })

    it('ログインしていない場合、何もしない', () => {
      const store = { getters: { 'auth/loggedIn': false } }
      const config = { headers: {} }
      const auth = new Auth({ store })
      auth.axiosRequestInterceptor(config)
      expect(config.headers).toEqual({})
    })
  })

  describe('axiosErrorInterceptor', () => {
    const app = { i18n: { t: key => key } }
    const route = { name: 'index' }
    let store
    let redirect
    let auth
    beforeEach(() => {
      store = { dispatch: jest.fn() }
      redirect = jest.fn()
      auth = new Auth({ store, redirect, app })
      auth.storage = {
        removeItem: jest.fn()
      }
    })

    describe('axiosからnotLoggedInErrorが返る場合', () => {
      const error = { response: { status: notLoggedInError.status, data: { content: notLoggedInError.content } } }

      it('localstorageのtokenを削除する', () => {
        auth.axiosErrorInterceptor(error, route)
        expect(auth.storage.removeItem).toHaveBeenCalledWith(auth.accessTokenKey)
      })

      it('authストアのloggedInをfalseにする', () => {
        auth.axiosErrorInterceptor(error, route)
        expect(auth.store.dispatch).toHaveBeenNthCalledWith(1, 'auth/setLoggedIn', false)
      })

      it('ログインパスにリダイレクトする', () => {
        auth.axiosErrorInterceptor(error, route)
        expect(redirect).toHaveBeenCalledWith({ name: 'login' })
      })

      describe('有効期限以外の理由でnotLoggedInErrorになった場合', () => {
        it('ログインするようにという、flashメッセージを作成する', () => {
          error.response.status = notLoggedInError.status
          error.response.data.content = notLoggedInError.content
          auth.axiosErrorInterceptor(error, route)
          expect(store.dispatch).toHaveBeenNthCalledWith(2, 'flash/setFlash', { color: 'red', text: 'flash.authMiddleware' })
        })
      })

      describe('tokenの有効期限が切れていた場合', () => {
        it('tokenの有効期限が切れているという、flashメッセージを作成する', () => {
          error.response.status = notLoggedInWithJwtIsExpiredError.status
          error.response.data.content = notLoggedInWithJwtIsExpiredError.content
          auth.axiosErrorInterceptor(error, route)
          expect(store.dispatch).toHaveBeenNthCalledWith(2, 'flash/setFlash', { color: 'red', text: 'flash.notLoggedInWithJwtIsExpiredError' })
        })
      })
    })

    describe('axiosからguestエラーが返る場合', () => {
      it('guestMiddlewareメソッドに処理を任せる', () => {
        auth.guestMiddleware = jest.fn()
        const error = { response: { status: guestError.status, data: { content: guestError.content } } }
        auth.axiosErrorInterceptor(error, route)
        expect(auth.guestMiddleware).toHaveBeenCalledWith({ from: route })
      })
    })
  })
})
