import { getters, mutations, actions, defaultFlash } from '~/store/flash'

describe('getters', () => {
  it('flash', () => {
    const result = getters.flash({ flash: defaultFlash })
    expect(result).toEqual(defaultFlash)
  })
})

describe('mutations', () => {
  const _state = () => ({
    flash: {
      ...defaultFlash
    }
  })
  let state
  beforeEach(() => {
    state = _state()
  })

  it('setFlash', () => {
    const newFlash = { isShow: true }
    mutations.setFlash(state, { isShow: true })
    expect(state.flash).toEqual(newFlash)
  })

  it('countUpFlash', () => {
    mutations.countUpFlash(state)
    expect(state.flash.transitionCount).toEqual(1)
  })
})

describe('actions', () => {
  let commit
  beforeEach(() => {
    commit = jest.fn()
  })

  it('setFlash', () => {
    const payload = { text: 'text', color: 'color' }
    actions.setFlash({ commit }, payload)
    expect(commit).toHaveBeenCalledWith('setFlash', { isShow: true, transitionCount: 0, ...payload })
  })

  it('clearFlash', () => {
    actions.clearFlash({ commit })
    expect(commit).toHaveBeenCalledWith('setFlash', defaultFlash)
  })

  it('countUpFlash', () => {
    actions.countUpFlash({ commit })
    expect(commit).toHaveBeenCalledWith('countUpFlash')
  })

  it('countUpFlashBecauseNotRedirect', () => {
    const dispatch = jest.fn()
    actions.countUpFlashBecauseNotRedirect({ dispatch })
    expect(dispatch).toHaveBeenCalledWith('countUpFlash')
  })
})
