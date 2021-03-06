# Stripe Membership SaaS

This is a boilerplate for a membership/subscription application with [Stripe](https://stripe.com), [Mailgun](https://mailgun.com/signup), ExpressJS MongoDB and React. Inspired by [sahat/hackathon-starter](https://github.com/sahat/hackathon-starter) and [RailsApps/rails-stripe-membership-saas](https://github.com/RailsApps/rails-stripe-membership-saas). It also handles stripe webhooks.

Check out the [demo](#)!

<a href="#">
    <img src="https://a16545fb495c8760fb33-4cec33efbe2744e99ba863e52edb2075.ssl.cf2.rackcdn.com/stripe-membership-app-screenshot.png">
</a>

### System Requirements

- MongoDB
- NodeJS
- Docker (for production and tests with Jenkins)
- Yarn (optional)

### Getting Started

First add variables in  `/server/config/environments` with the following credentials:

- Stripe [API keys](https://dashboard.stripe.com/account/apikeys) and [plan info](https://dashboard.stripe.com/test/plans)
- [Mailgun](https://mailgun.com/signup) for sending forgot/reset password confirmations.
- session secret
- google analytics id

Install dependencies with `yarn install` or `npm install`.

Start the server with `npm start`.

Note: Stripe webhooks can be recieved at `https://your-domain.com/stripe/events`.

### Heroku Deployment

```
heroku create your-awesome-saas-product
heroku addons:add mongohq
heroku config:set SESSION_SECRET='your_secret';
heroku config:set STRIPE_KEY='sk_test_example'
heroku config:set STRIPE_PUB_KEY='pk_test_example'
heroku config:set MAILGUN_USER='example.org'
heroku config:set MAILGUN_PASSWORD='key-secret'
heroku config:set GOOGLE_ANALYTICS='UA-XXXXXX-1'
```
