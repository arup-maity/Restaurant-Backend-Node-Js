import { Hono } from "hono";
import bcrypt from "bcrypt";
import prisma from "../config/Connection";
import { adminAuthentication } from "../middleware";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";

const userRoute = new Hono()

userRoute.post("/create-admin-user", adminAuthentication, async c => {
   try {
      const body = await c.req.json()
      const user = await prisma.adminUser.findUnique({
         where: { email: body.email }
      })
      if (user) return c.json({ success: false, message: "User already exists" }, 409)
      const hashPassword = bcrypt.hashSync(body.password, 16)
      const newUser = await prisma.adminUser.create({
         data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            role: body.role,
            adminAuth: {
               create: {
                  method: "password",
                  password: hashPassword
               }
            }
         }
      })
      if (!newUser) return c.json({ success: false, message: "Not create user" }, 409)
      return c.json({ success: true, message: `Successfully create user ${body.firstName}` }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
userRoute.put("/update-admin-user/:id", adminAuthentication, async c => {
   try {
      const body = await c.req.json()
      const { id } = c.req.param()
      const updatedUser = await prisma.adminUser.update({
         where: { id: +id },
         data: {
            email: body.email,
            role: body.role,
         }
      })
      if (!updatedUser) return c.json({ success: false, message: "Not update user" }, 409)
      return c.json({ success: true, message: `Successfully update user ${updatedUser.firstName}` }, 200)
   } catch (error) {
      return c.json({ success: false, error }, 500)
   }
})
userRoute.get("/read-admin-user/:id", adminAuthentication, async c => {
   try {
      const { id } = c.req.param()
      const user = await prisma.adminUser.findUnique({
         where: { id: +id },
         include: {
            adminAuth: true
         }
      })
      if (!user) return c.json({ success: false, message: "User not found" }, 409)
      return c.json({ success: true, user }, 200)
   } catch (error) {
      return c.json({ success: false, error }, 500)
   }
})
userRoute.delete("/delete-admin-user/:id", adminAuthentication, async c => {
   try {
      const { id } = c.req.param()
      const deletedUser = await prisma.adminUser.delete({
         where: { id: +id }
      })
      if (!deletedUser) return c.json({ success: false, message: "User not found" }, 409)
      return c.json({ success: true, message: `Successfully deleted user ${deletedUser.firstName}` }, 200)
   } catch (error) {
      return c.json({ success: false, error }, 500)
   }
})
userRoute.get("/admin-users-list", adminAuthentication, async c => {
   try {
      const { page = 1, limit = 25, search = '', role = "all", column = 'createdAt', sortOrder = 'desc' } = c.req.query()
      const conditions: any = {}
      if (search) {
         conditions.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
         ]
      }
      if (role && role !== "all") {
         conditions.role = role
      }
      const query: any = {}
      if (column && sortOrder) {
         query.orderBy = { [column]: sortOrder }
      }
      const users = await prisma.adminUser.findMany({
         where: conditions,
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query,
      })
      const [filterCount, totalCount] = await Promise.all([
         prisma.adminUser.count({ where: conditions }),
         prisma.adminUser.count(),
      ]);
      return c.json({ success: true, users, filterCount, totalCount, message: 'Successfully' }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})

// customer user
userRoute.post("/create-user", async c => {
   try {
      const body = await c.req.json()
      const user = await prisma.users.findUnique({
         where: { email: body.email }
      })
      if (user) return c.json({ success: false, message: "User already exists" }, 409)
      const hashPassword = bcrypt.hashSync(body.password, 16)
      const newUser = await prisma.users.create({
         data: {
            fullName: body.fullName,
            email: body.email,
            userAuth: {
               create: {
                  method: "password",
                  password: hashPassword
               }
            }
         }
      })
      if (!newUser) return c.json({ success: false, message: "Not create user" }, 409)
      const payload = {
         id: newUser?.id,
         name: `${newUser?.firstName + ' ' + newUser?.lastName}`,
         role: 'user',
         accessPurpose: 'user',
         purpose: 'login',
         exp: Math.floor(Date.now() / 1000) + 60 * 60 * 6, // Token expires in 5 minutes
      }
      // generate the token
      const token = await sign(payload, process.env.JWT_SECRET as string)
      // Regular cookies
      setCookie(c, 'token', token, {
         domain: process.env.ENVIRONMENT === 'production' ? '.arupmaity.in' : 'localhost',
         path: '/',
         secure: true,
         httpOnly: false,
         sameSite: 'Strict',
         maxAge: 30 * 24 * 60 * 60,
      })
      return c.json({ success: true, user: newUser, message: 'Account create successfully' }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})

export default userRoute