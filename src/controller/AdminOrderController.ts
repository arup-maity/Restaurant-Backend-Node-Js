import { Hono } from "hono";
import prisma from "../config/Connection";
import { adminAuthentication } from "../middleware";

const adminOrderRoute = new Hono()

adminOrderRoute.get("/order-request", adminAuthentication, async c => {
   try {
      const orders = await prisma.order.findMany({
         // where: { status: "pending" },
      })
      return c.json({ success: true, orders }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error: error }, 500)
   }
})
adminOrderRoute.get("/read-order/:id", adminAuthentication, async c => {
   try {
      const { id } = c.req.param()
      const order = await prisma.order.findUnique({
         where: { id: +id },
         include: {
            user: true,
            orderItems: {
               include: {
                  dishes: true
               }
            },
            paymentMethod: true
         }
      })
      if (!order) return c.json({ success: false, message: "Not found" }, 404)
      return c.json({ success: true, order }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error: error }, 500)
   }
})
adminOrderRoute.put("/update-status/:id", adminAuthentication, async c => {
   try {
      const { id } = c.req.param()
      const { status } = await c.req.json()
      const updatedOrder = await prisma.order.update({
         where: { id: +id },
         data: { status },
         include: {
            user: true,
            orderItems: {
               include: {
                  dishes: true
               }
            },
            paymentMethod: true
         }
      })
      if (!updatedOrder) return c.json({ success: false, message: "Not found" }, 404)
      return c.json({ success: true, message: "Order status updated successfully", updatedOrder }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error: error }, 500)
   }
})
adminOrderRoute.get("/orders-list", adminAuthentication, async c => {
   try {
      const orders = await prisma.order.findMany({
         include: {
            user: true,
            orderItems: {
               include: {
                  dishes: true
               }
            },
            paymentMethod: true
         }
      })
      return c.json({ success: true, orders }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error: error }, 500)
   }
})
export default adminOrderRoute