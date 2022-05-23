<template>
  <div>
    <v-text-field
      v-model="setEmail"
      outlined
      validate-on-blur
      type="email"
      :label="$t('model.user.email')"
      :rules="rules.email"
      :error-messages="errorMessages"
      @keypress.enter="submit"
      @blur="isUniqueUser"
    />
    <v-text-field
      v-model="setPassword"
      outlined
      validate-on-blur
      :label="$t('model.user.password')"
      :type="passwordField.type"
      :append-icon="passwordField.icon"
      :rules="rules.password"
      @click:append="toggleIsShowPassword"
      @keypress.enter="submit"
    />
    <div v-if="validation" class="text-caption grey--text pl-3">
      {{ $t('form.annotation.user.password') }}
    </div>
    <v-btn
      depressed
      large
      block
      color="primary"
      class="font-weight-bold my-5"
      @click="submit"
    >
      {{ $t('btn.submit') }}
    </v-btn>
  </div>
</template>

<script>
import { email, required, max, password, min } from '~/validators'
import { isUniqueUserError } from '~/errors'

export default {
  props: {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    validation: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isShowPassword: false,
      errorMessages: []
    }
  },
  computed: {
    setEmail: {
      get () {
        return this.email
      },
      set (val) {
        this.$emit('update:email', val)
      }
    },
    setPassword: {
      get () {
        return this.password
      },
      set (val) {
        this.$emit('update:password', val)
      }
    },
    rules () {
      if (this.validation) {
        return {
          email: [required, max(100), email],
          password: [required, max(50), min(8), password]
        }
      }
      return { email: [], password: [] }
    },
    passwordField () {
      return this.isShowPassword ? { icon: 'mdi-eye', type: 'text' } : { icon: 'mdi-eye-off', type: 'password' }
    }
  },
  methods: {
    toggleIsShowPassword () {
      this.isShowPassword = !this.isShowPassword
    },
    async isUniqueUser () {
      if (!this.validation) {
        return
      }

      try {
        await this.$axios.$get(`/users/unique?email=${this.email}`)
        this.errorMessages = []
      } catch (error) {
        if (isUniqueUserError(error)) {
          this.errorMessages = ['既に登録済みです']
        } else {
          this.$handler.standardAxiosError(error)
        }
      }
    },
    submit () {
      this.$emit('submit')
    }
  }
}
</script>
