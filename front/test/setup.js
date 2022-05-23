import Vue from 'vue'
import Vuetify from 'vuetify'
import { config, RouterLinkStub } from '@vue/test-utils'

Vue.use(Vuetify)
const i18nMock = key => key
config.mocks.$t = i18nMock
const authMock = { login () {}, logout () {} }
config.mocks.$auth = authMock
config.stubs['router-link'] = RouterLinkStub
config.stubs['nuxt-link'] = RouterLinkStub
