export default async ({ store, app }) => {
  if (!app.$auth.loggedIn) { return }

  await store.dispatch('list/getLists')
}
