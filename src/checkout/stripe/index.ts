import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SK as string)

export async function createSecret(amount: number, currency: string = 'inr', metadata: { [key: string]: any }) {
   const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ['card'],
      metadata: metadata
   });
   // const session = await stripe.checkout.sessions.create({
   //    line_items: [
   //       {
   //          price_data: {
   //             currency: 'inr',
   //             product_data: {
   //                name: 'T-shirt',
   //             },
   //             unit_amount: 2000,
   //          },
   //          quantity: 1,
   //       },
   //    ],
   //    mode: 'payment',
   //    ui_mode: 'embedded',
   //    // The URL of your payment completion page
   //    return_url: 'http://localhost:3001/'
   // });
   // console.log('===>', session)
   return paymentIntent.client_secret;
}