export class Handler {
  constructor ({ error }) {
    this.error = error
  }

  standardAxiosError (error) {
    if (error.response) {
      this.error({ statusCode: error.response.status, message: error.response.statusText })
      return
    }
    this.error({ statusCode: 500, message: error.message })
  }
}

export default (ctx, inject) => {
  inject('handler', new Handler(ctx))
}
