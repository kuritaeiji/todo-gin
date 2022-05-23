export default ({ app, $axios, isDev, route }) => {
  $axios.onRequest((config) => {
    if (isDev) {
      console.dir(config)
    }

    // headerにtoken付与
    app.$auth.axiosRequestInterceptor(config)
    // csrf対策のためにカスタムヘッダーを付与する”
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
  })

  $axios.onResponse((response) => {
    if (isDev) {
      console.dir(response)
    }
  })

  $axios.onError((error) => {
    if (isDev) {
      console.dir(error)
    }

    // backendのauthミドルウェアへの対応
    app.$auth.axiosErrorInterceptor(error, route)
  })
}
