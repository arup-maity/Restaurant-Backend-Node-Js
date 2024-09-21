import { Hono } from "hono";
import bcrypt from "bcrypt";
import prisma from "../config/Connection";
import { adminAuthentication } from "../middleware";

const adminUserRoute = new Hono()
adminUserRoute.use(adminAuthentication)
adminUserRoute.post("/create", async c => {
   try {
      const body = await c.req.json()
      const user = await prisma.users.findUnique({
         where: { email: body.email }
      })
      if (user) return c.json({ success: false, message: "User already exists" }, 409)
      const hashPassword = bcrypt.hashSync(body.password, 16)
      const newUser = await prisma.users.create({
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
adminUserRoute.put("/update/:id", async c => {
   try {
      const body = await c.req.json()
      const { id } = c.req.param()
      const updatedUser = await prisma.users.update({
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
adminUserRoute.get("/read/:id", async c => {
   try {
      const { id } = c.req.param()
      const user = await prisma.users.findUnique({
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
adminUserRoute.delete("/delete/:id", async c => {
   try {
      const { id } = c.req.param()
      const deletedUser = await prisma.users.delete({
         where: { id: +id }
      })
      if (!deletedUser) return c.json({ success: false, message: "User not found" }, 409)
      return c.json({ success: true, message: `Successfully deleted user ${deletedUser.firstName}` }, 200)
   } catch (error) {
      return c.json({ success: false, error }, 500)
   }
})
adminUserRoute.get("/managements-list", async c => {
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
      const users = await prisma.users.findMany({
         where: conditions,
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query,
      })
      const [filterCount, totalCount] = await Promise.all([
         prisma.users.count({ where: conditions }),
         prisma.users.count(),
      ]);
      return c.json({ success: true, users, filterCount, totalCount, message: 'Successfully' }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
adminUserRoute.get("/customers-list", async c => {
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
      const users = await prisma.users.findMany({
         where: conditions,
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query,
      })
      const [filterCount, totalCount] = await Promise.all([
         prisma.users.count({ where: conditions }),
         prisma.users.count(),
      ]);
      return c.json({ success: true, users, filterCount, totalCount, message: 'Successfully' }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})

export default adminUserRoute