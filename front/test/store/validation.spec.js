import { getters, mutations, actions, defaultValidation } from '~/store/validation'

describe('getters', () => {
  it('validation', () => {
    const result = getters.validation({ validation: defaultValidation })
    expect(result).toEqual(defaultValidation)
  })
})

describe('mutations', () => {
  it('setValidation', () => {
    const state = { validation: { ...defaultValidation } }
    const newValidation = { isShow: true, text: 'test text' }
    mutations.setValidation(state, newValidation)
    expect(state.validation).toEqual(newValidation)
  })
})

describe('actions', () => {
  let commit
  beforeEach(() => {
    commit = jest.fn()
  })

  it('setValidation', () => {
    const text = 'test text'
    actions.setValidation({ commit }, text)
    expect(commit).toHaveBeenCalledWith('setValidation', { isShow: true, text })
  })

  it('clearValidation', () => {
    actions.clearValidation({ commit })
    expect(commit).toHaveBeenCalledWith('setValidation', defaultValidation)
  })
})
