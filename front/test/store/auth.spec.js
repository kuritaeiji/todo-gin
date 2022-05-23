import { getters, actions, mutations } from '~/store/auth'

const defaultState = {
  loggedIn: false
}

describe('getters', () => {
  it('loggedIn', () => {
    const result = getters.loggedIn(defaultState)
    expect(result).toEqual(false)
  })
})

describe('mutations', () => {
  let state
  const _state = () => ({
    ...defaultState
  })
  beforeEach(() => {
    state = _state()
  })

  it('setLoggedIn', () => {
    mutations.setLoggedIn(state, true)
    expect(state.loggedIn).toEqual(true)
  })
})

describe('actions', () => {
  const commit = jest.fn()

  it('setLoggedIn', () => {
    actions.setLoggedIn({ commit }, true)
    expect(commit).toHaveBeenCalledWith('setLoggedIn', true)
  })
})
