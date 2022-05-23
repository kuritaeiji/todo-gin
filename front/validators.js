export const required = v => !!v || '入力して下さい'

export const max = (maxLength) => {
  return v => v.length <= maxLength || `${maxLength}文字以内で入力して下さい`
}

export const min = (minLength) => {
  return v => v.length >= minLength || `${minLength}以上入力して下さい`
}

const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const email = v => emailRegexp.test(v) || '有効なメールアドレスを入力して下さい'

const passwordRegexp = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])^[a-zA-Z0-9]+$/
export const password = v => passwordRegexp.test(v) || '3種類以上の文字かつ、アルファベットと数字のみ有効'
