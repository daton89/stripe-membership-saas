"use strict";

var Stripe = require("stripe"),
  stripe;

module.exports = exports = function stripeCustomer(schema, options) {
  stripe = Stripe(options.apiKey);

  schema.add({
    stripe: {
      customerId: String,
      subscriptionId: String,
      last4: String,
      plan: {
        type: String,
        default: options.defaultPlan
      }
    }
  });

  schema.pre("save", async function(next) {
    var user = this;
    if (!user.isNew || user.stripe.customerId) return next();
    try {
      await user.createCustomer();
      next();
    } catch (err) {
      return next(err);
    }
  });

  schema.statics.getPlans = function() {
    return options.planData;
  };

  schema.methods.createCustomer = async function() {
    const user = this;

    const customer = await stripe.customers.create({
      email: user.email
    });

    user.stripe.customerId = customer.id;

    return;
  };

  schema.methods.setCard = async function(stripe_token) {
    const user = this;

    let customer;

    if (user.stripe.customerId) {
      customer = await stripe.customers.update(user.stripe.customerId, {
        card: stripe_token
      });
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        card: stripe_token
      });
    }

    if (!user.stripe.customerId) {
      user.stripe.customerId = customer.id;
    }

    const card = customer.cards
      ? customer.cards.data[0]
      : customer.sources.data[0];

    user.stripe.last4 = card.last4;

    await user.save();
  };

  schema.methods.setPlan = async function(plan, stripe_token) {
    const user = this;
    const customerData = {
      plan: plan
    };

    console.log("plan, stripe_token =>", plan, stripe_token);

    const plans = await stripe.plans.list({ limit: 4 });

    const planId = plans.data.find(p => p.nickname === plan).id;

    if (user.stripe.subscriptionId) {
      // update subscription
      const subscription = await stripe.subscriptions.update(
        user.stripe.subscriptionId,
        {
          billing: "send_invoice",
          days_until_due: 1,
          items: [{ plan: planId }]
        }
      );
      user.stripe.plan = plan;
      user.stripe.subscriptionId = subscription.id;
      await user.save();
      return;
    }

    console.log("stripe_token =>", stripe_token);
    if (stripe_token) await user.setCard(stripe_token);

    const subscription = await stripe.subscriptions.create({
      customer: user.stripe.customerId,
      items: [{ plan: planId }]
    });

    user.stripe.plan = plan;
    user.stripe.subscriptionId = subscription.id;
    await user.save();

    return;
  };

  schema.methods.updateStripeEmail = async function() {
    const user = this;

    if (!user.stripe.customerId) throw new Error("Customer not found!");

    await stripe.customers.update(user.stripe.customerId, {
      email: user.email
    });

    return;
  };

  schema.methods.cancelStripe = async function() {
    const user = this;

    if (user.stripe.customerId) {
      await stripe.customers.del(user.stripe.customerId);
    }

    return;
  };
};
