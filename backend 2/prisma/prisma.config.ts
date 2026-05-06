export default {
  datasource: {
    db: {
      adapter: 'postgresql',
      url: process.env.DATABASE_URL,
      directUrl: process.env.DIRECT_URL,
    },
  },
}
