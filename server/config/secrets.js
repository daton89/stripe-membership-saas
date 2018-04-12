module.exports = {

  auth: {
    host: process.env.AUTH_HOST || ''
  },

  db: process.env.MONGODB || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || '',

  sessionStoreHost: process.env.SESSION_STORE_HOST || '',
  sessionSecret: process.env.SESSION_SECRET || '',
  sessionName: process.env.SESSION_NAME || '',

  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || '',
    domain: process.env.MAILGUN_DOMAIN || ''
  },

  stripeOptions: {
    apiKey: process.env.STRIPE_KEY || '',
    stripePubKey: process.env.STRIPE_PUB_KEY || '',
    defaultPlan: 'free',
    plans: ['free', 'silver', 'gold', 'platinum'],
    planData: {
      'free': {
        name: 'Free',
        price: 0
      },
      'silver': {
        name: 'Silver',
        price: 9
      },
      'gold': {
        name: 'Gold',
        price: 19
      },
      'platinum': {
        name: 'Platinum',
        price: 29
      }
    }
  },

  googleAnalytics: process.env.GOOGLE_ANALYTICS || ''
};
