import VueMeta from 'vue-meta'
import Vuex from 'vuex'
import { createLocalVue } from '@vue/test-utils'

const localVue = createLocalVue()
localVue.use(VueMeta, { keyName: 'head' })
localVue.use(Vuex)
export default localVue
