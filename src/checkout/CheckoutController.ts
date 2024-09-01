import { Hono } from "hono";
import prisma from "../config/Connection";
import { adminAuthentication } from "../middleware";
import { createSecret } from "./stripe";
import Stripe from "stripe";


const checkoutRoute = new Hono()
const stripe = new Stripe(process.env.STRIPE_SK as string)

checkoutRoute.post("/create-checkout", async c => {
   try {
      const body = await c.req.json()
      console.log(body)
      const newCheckout = await prisma.checkout.createMany({
         data: body
      })
      return c.json({ success: true, newCheckout }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
checkoutRoute.get("/checkout-details/:checkoutId", async c => {
   try {
      const checkoutId = c.req.param('checkoutId')
      const checkoutItems = await prisma.checkout.findMany({
         where: { checkoutId },
         include: {
            dishes: {
               select: {
                  title: true,
                  price: true,
                  thumbnail: true
               }
            },
         }
      })
      return c.json({ success: true, checkoutItems }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
checkoutRoute.post("/create-payment", async c => {
   try {
      const body = await c.req.json()
      const secret = await createSecret(body.amount, 'inr', body.checkoutId, 'name', 'email')
      return c.json({ success: true, secret }, 200)
   } catch (error) {
      return c.json({ success: false, error }, 500)
   }
})
checkoutRoute.get("/webhook/:instance", async c => {
   try {
      const instance = c.req.param('instance')
      const intent = await stripe.paymentIntents.retrieve(instance);
      return c.json({ success: true, intent }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
export default checkoutRoute