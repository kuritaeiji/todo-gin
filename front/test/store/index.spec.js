import { actions } from '~/store/index'

describe('actions', () => {
  describe('nuxtClientInit', () => {
    it('hasJwt()がtrueの場合loggedInをtrueにする', () => {
      const authStub = { hasJwt: () => true }
      const dispatch = jest.fn()
      actions.$auth = authStub
      actions.nuxtClientInit({ dispatch })
      expect(dispatch).toHaveBeenCalledWith('auth/setLoggedIn', true)
    })

    it('hasJwt()がfalseの場合何もしない', () => {
      const authStub = { hasJwt: () => false }
      const dispatch = jest.fn()
      actions.$auth = authStub
      actions.nuxtClientInit({ dispatch })
      expect(dispatch).not.toHaveBeenCalled()
    })
  })
})
