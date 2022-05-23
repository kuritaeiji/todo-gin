export default (ctx) => {
  ctx.app.$auth.guestMiddleware(ctx)
}
