export default defineEventHandler(async (event) => {
  if (getRequestURL(event).pathname.startsWith('/api/times')) await requireUserSession(event)
})
