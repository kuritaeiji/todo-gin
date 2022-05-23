import { Handler } from '~/plugins/handler'

describe('plugins/Handler', () => {
  describe('standardAxiosError', () => {
    it('apiからエラーが返る場合apiからのエラーを基にエラー処理する', () => {
      const error = jest.fn()
      const axiosError = { response: { status: 404, statusText: 'not found' } }
      const handler = new Handler({ error })
      handler.standardAxiosError(axiosError)

      expect(error).toHaveBeenCalledWith({ statusCode: axiosError.response.status, message: axiosError.response.statusText })
    })

    it('apiからエラーが返らない低レベルのエラーの場合、500エラーを表示する', () => {
      const error = jest.fn()
      const axiosError = { message: 'network error' }
      const handler = new Handler({ error })
      handler.standardAxiosError(axiosError)

      expect(error).toHaveBeenCalledWith({ statusCode: 500, message: axiosError.message })
    })
  })
})
