const express = require('express');
const path = require('path');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 4242;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.get('/config', (req, res) => {
  res.json({
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
  });
});

app.post('/create-checkout-session', async (req, res) => {
  const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: "Gramma's Juice",
              description: 'Premium natural formula crafted for vitality'
            },
            unit_amount: 1499
          },
          quantity: quantity
        }
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
