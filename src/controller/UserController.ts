import { Hono } from "hono";
import bcrypt from "bcrypt";
import prisma from "../config/Connection";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";

const userRoute = new Hono()

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
         name: newUser?.fullName || '',
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
      return c.json({ success: true, user: newUser, payload, message: 'Account create successfully' }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})

export default userRoute;