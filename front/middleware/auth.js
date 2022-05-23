export default (ctx) => {
  ctx.app.$auth.authMiddleware(ctx)
}
