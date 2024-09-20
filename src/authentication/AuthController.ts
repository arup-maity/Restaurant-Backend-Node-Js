import { Hono } from "hono";
import bcrypt from "bcrypt";
import prisma from "../config/Connection";
import { sign, verify } from "hono/jwt";
import { getCookie, setCookie } from "hono/cookie";
import { GoogleAuth } from "./social-auth/google";

const authRoute = new Hono()

const googleAuth = new GoogleAuth({
   clientId: process.env.GOOGLE_CLIENT_ID || "",
   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
   redirectUrl: "http://localhost:8081/api/auth/google/callback"
});

authRoute.post("/admin-login", async c => {
   try {
      const body = await c.req.json()
      console.log(body)
      // find username
      const user = await prisma.adminUser.findUnique({
         where: { email: body.email },
         include: {
            adminAuth: true
         }
      })
      if (!user) return c.json({ success: false, message: "User not found" }, 409)
      // check password
      const checkPassword = bcrypt.compareSync(body?.password, user.adminAuth?.password)
      if (!checkPassword) return c.json({ success: false, message: "Not match username and password" }, 409)
      // 
      const payload = {
         id: user?.id,
         name: user?.firstName + " " + user?.lastName,
         role: user?.role,
         accessPurpose: 'admin',
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
      //  return response
      return c.json({ success: true, message: `Login successfully` }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
authRoute.post("/user-login", async c => {
   try {
      const body = await c.req.json()
      // find username
      const user = await prisma.users.findUnique({
         where: { email: body.email },
         include: {
            userAuth: true
         }
      })
      if (!user) return c.json({ success: false, message: "User not found" }, 409)
      // check password
      const checkPassword = bcrypt.compareSync(body?.password, user.userAuth?.password)
      if (!checkPassword) return c.json({ success: false, message: "Not match username and password" }, 409)
      // 
      const payload = {
         id: user?.id,
         name: user?.fullName || '',
         role: 'user',
         accessPurpose: 'user',
         purpose: 'login',
         exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2, // Token expires in 5 minutes
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
      //  return response
      return c.json({ success: true, message: `Login successfully` }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
authRoute.get("check-token", async c => {
   try {
      // token is taking from cookie
      const cookie_token = getCookie(c, 'token')
      // token is taking from header
      function getToken() {
         const { authorization } = c.req.header();
         if (!authorization || !authorization.startsWith('Bearer ')) {
            return c.json({ login: false, message: 'token not found' }, 200)
         }
         return authorization.split(' ')[1]
      }
      const token = cookie_token || getToken() as string
      if (!token) return c.json({ login: false, message: 'token not found' }, 409)
      // verify that the token
      const tokenVerify = await verify(token, process.env.JWT_SECRET!)
      if (!tokenVerify) return c.json({ login: false, message: "token is not valid" }, 409)
      // check that the token porpose
      if (tokenVerify.purpose !== 'login') return c.json({ login: false, message: 'this token not for login purpose' }, 409)
      // return the response
      return c.json({ success: true, login: true, payload: tokenVerify }, 200)

   } catch (error) {
      return c.json({ login: false, message: "token is expire" }, 409)
   }
})
// google
authRoute.get('/google-auth', async c => {
   try {
      const authorizationUrl = await googleAuth.createAuthorizationUrl({
         scopes: ["profile", "email", "openid"],
         state: 'home'
      });
      return c.redirect(authorizationUrl);
   } catch (error: any) {
      return c.json({ error: error.message }, 500);
   }
})
authRoute.get("/google/callback", async c => {
   try {
      const { code } = c.req.query();
      const userDetails: { [key: string]: any } = await googleAuth.verifyAuthorizationUser(code);

      const user = await prisma.users.findUnique({
         where: { email: userDetails?.email }
      });
      if (!user) return c.json({ success: false, message: "User not found" }, 409);
      const payload = {
         id: user?.id,
         fullName: user?.fullName || '',
         email: user.email,
         role: 'user',
         purpose: 'login',
         exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2,
      }
      const token = await sign(payload, process.env.JWT_SECRET!)
      setCookie(c, 'token', token, {
         path: '/',
         secure: true,
         httpOnly: true,
         sameSite: 'Strict',
      })
      return c.redirect(process.env.ALLOWED_ORIGIN_WEB + "/")
      // return c.json({ user: userDetails }, 200);
   } catch (error: any) {
      return c.json({ error: error.message }, 500);
   }
})

export default authRoute