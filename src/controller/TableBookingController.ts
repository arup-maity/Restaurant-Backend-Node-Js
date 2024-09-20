import { Hono } from "hono";
import prisma from "@/config/Connection";
import { userAuthentication } from "@/middleware";

const tableBookingsRoute = new Hono()

tableBookingsRoute.post("/booking-table", userAuthentication, async c => {
   try {
      const user = c.user
      if (!user?.id) return c.json({ success: false }, 409)
      const body = await c.req.json()
      const newBooking = await prisma.tableBooking.create({
         data: {
            userId: +user.id,
            time: body.time,
            date: body.date,
            note: body.note
         }
      })
      return c.json({ success: true, data: newBooking }, 200)
   } catch (error) {
      console.error(error)
      return c.json({ success: false, error: error }, 500)
   }
})


export default tableBookingsRoute