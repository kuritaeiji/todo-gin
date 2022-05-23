export default async ({ app: { $auth }, query }) => {
  await $auth.googleLogin(query)
}
