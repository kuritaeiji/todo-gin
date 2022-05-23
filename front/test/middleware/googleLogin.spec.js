import googleLogin from '~/middleware/googleLogin'

describe('middleware/googleLogin', () => {
  it('$auth.googleLoginメソッドを呼び出す', () => {
    const mock = jest.fn()
    const app = { $auth: { googleLogin: mock } }
    const query = 'query'
    googleLogin({ app, query })
    expect(mock).toHaveBeenCalledWith(query)
  })
})
