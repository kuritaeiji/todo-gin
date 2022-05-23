<template>
  <before-logged-in-form :title="title">
    <v-form ref="form" v-model="isValid">
      <user-form
        validation
        v-bind.sync="params.user"
        @submit="createUser"
      />
    </v-form>

    <ui-google-btn />
  </before-logged-in-form>
</template>

<script>
import { mapActions } from 'vuex'
import { isEmailClientError, isUniqueUserError, isValidationError } from '~/errors'
import UiGoogleBtn from '~/components/ui/GoogleBtn.vue'

export default {
  components: { UiGoogleBtn },
  layout: 'beforeLoggedIn',
  middleware: 'guest',
  data () {
    return {
      title: this.$t('page.signup'),
      isValid: false,
      params: {
        user: {
          email: '',
          password: ''
        }
      }
    }
  },
  head () {
    return {
      title: this.title
    }
  },
  methods: {
    ...mapActions('flash', ['setFlash']),
    ...mapActions('validation', ['setValidation']),
    async createUser () {
      if (!this.isValid) {
        this.$refs.form.validate()
        return
      }

      try {
        await this.$axios.$post('/users', this.params.user)
        this.createUserResolve()
      } catch (error) {
        this.createUserReject(error)
      }
    },
    createUserResolve () {
      this.setFlash({ color: 'info', text: this.$t('flash.activationEmail') })
      this.$router.push({ name: 'index' })
    },
    createUserReject (error) {
      if (isValidationError(error) || isUniqueUserError(error)) {
        this.setValidation(this.$t('validation.standard'))
        return
      }

      if (isEmailClientError(error)) {
        this.setFlash(this.$t('flash.activationEmailError'))
        this.$router.push({ name: 'index' })
        return
      }

      this.$handler.standardAxiosError(error)
    }
  }
}
</script>
