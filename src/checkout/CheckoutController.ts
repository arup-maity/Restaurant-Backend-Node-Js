import { Hono } from "hono";
import prisma from "../config/Connection";
import { createSecret } from "./stripe";
import Stripe from "stripe";
import { userAuthentication } from "@/middleware";


const checkoutRoute = new Hono()
const stripe = new Stripe(process.env.STRIPE_SK as string)

checkoutRoute.post("/create-checkout", async c => {
   try {
      const body = await c.req.json()
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
      const metadata = {
         checkoutId: body.checkoutId,
         // shippingAddress: body.shippingAddress
      }
      const secret = await createSecret(body.amount, 'inr', metadata)
      return c.json({ success: true, secret }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
checkoutRoute.get("/webhook", userAuthentication, async c => {
   try {
      const user = c.user
      if (!user?.id) return c.json({ success: false }, 409)
      const { instance } = c.req.query()
      const intent = await stripe.paymentIntents.retrieve(instance);

      const checkoutId = intent.metadata.checkoutId
      const checkout = await prisma.checkout.findMany({
         where: { checkoutId },
      })
      if (!checkout.length) return c.json({ success: false }, 409)
      const orderDetails = checkout.map((item: { [key: string]: any }) => ({
         dishId: item.id,
         quantity: item.quantity,
         price: item.price,
      }))

      const paymentDetails = {
         paymentId: intent?.id,
         paymentMethod: intent?.payment_method_types[0],
         amount: +intent?.amount / 100,
         status: intent?.status
      }

      const [createOrder, deleteCheckout] = await prisma.$transaction([
         prisma.order.create({
            data: {
               userId: +user.id,
               orderItems: {
                  create: orderDetails,
               },
               paymentMethod: {
                  create: paymentDetails,
               }
            }
         }),
         prisma.checkout.deleteMany({
            where: { checkoutId },
         }),
      ])
      if (!createOrder) return c.json({ success: false }, 409)
      return c.json({ success: true }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
export default checkoutRoute