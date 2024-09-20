import { Hono } from "hono";
import prisma from "@/config/Connection";
import { userAuthentication } from "@/middleware";

const userAccountRoute = new Hono()

userAccountRoute.use(userAuthentication)
userAccountRoute.get("/order-list", async c => {
   try {
      const user = c.user
      if (!user?.id) return c.json({ success: false }, 409)

      const orders = await prisma.order.findMany({
         where: { userId: +user.id },
         include: {
            orderItems: {
               include: {
                  dishes: {
                     select: {
                        thumbnail: true
                     }
                  }
               }
            },
            paymentMethod: true
         },
         orderBy: {
            createdAt: 'desc'
         }
      })


      return c.json({ success: true, orders }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
userAccountRoute.get("/profile-details", async c => {
   try {
      const user = c.user
      if (!user?.id) return c.json({ success: false }, 409)
      const profileDetails = await prisma.users.findUnique({
         where: { id: +user.id },
      })
      return c.json({ success: true, profileDetails }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
userAccountRoute.get("/address-details", async c => {
   try {
      const user = c.user
      if (!user?.id) return c.json({ success: false }, 409)
      const addressDetails = await prisma.userAddresses.findMany({
         where: { userId: +user.id },
      })
      return c.json({ success: true, addressDetails }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
userAccountRoute.post("/add-address", async c => {
   try {
      const body = await c.req.json()
      const user = c.user
      if (!user?.id) return c.json({ success: false }, 409)
      const newAddress = await prisma.userAddresses.create({
         data: {
            userId: +user.id,
            fullName: body.fullName,
            streetAddress: body.streetAddress,
            country: body.country,
            city: body.city,
            state: body.state,
            zipCode: body.zipCode,
            phone: body.phone,
         }
      })
      return c.json({ success: true, newAddress }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
userAccountRoute.put("/update-address", async c => {
   try {
      const body = await c.req.json()
      const user = c.user
      if (!user?.id) return c.json({ success: false }, 409)
      const updateAddress = await prisma.userAddresses.update({
         where: { id: +body.id },
         data: {
            fullName: body.fullName,
            streetAddress: body.streetAddress,
            country: body.country,
            city: body.city,
            state: body.state,
            zipCode: body.zipCode,
            phone: body.phone,
         }
      })
      return c.json({ success: true, updateAddress }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
userAccountRoute.put("/update-profile", async c => {
   try {
      const body = await c.req.json()
      const user = c.user
      if (!user?.id) return c.json({ success: false }, 409)
      const updateProfile = await prisma.users.update({
         where: { id: +user.id },
         data: {
            fullName: body.fullName,
            email: body.email,
            phoneNumber: body.phoneNumber,
         }
      })
      return c.json({ success: true, updateProfile }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})

export default userAccountRoute;