import authMiddleware from '~/middleware/auth'

describe('middleware/auth', () => {
  it('authプラグインに処理を移譲する', () => {
    const mock = jest.fn()
    const ctx = {
      app: {
        $auth: {
          authMiddleware: mock
        }
      }
    }
    authMiddleware(ctx)
    expect(mock).toHaveBeenCalledWith(ctx)
  })
})
