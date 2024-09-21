import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from "hono/cors";
import demoRoute from './demo/DemoController'
import authRoute from './authentication/AuthController';
import taxonomyRoute from './controller/TaxonomyController';
import dishesRoute from './controller/DishesController';
import fileRoute from './file-manage/FileManaga';
import checkoutRoute from './checkout/CheckoutController';
import adminUserRoute from './controller/AdminUserController';
import userRoute from './controller/UserController';
import userAccountRoute from './controller/UserAccountController';
import adminOrderRoute from './controller/AdminOrderController';

const app = new Hono()

app.use(
   "/*",
   cors({
      origin: [`${process.env.ALLOWED_ORIGIN_WEB}`, 'http://localhost:3001'],
      allowMethods: ["POST", "GET", "PUT", "DELETE"],
      credentials: true
   })
);

app.get('/', (c) => {
   return c.text('Hello Hono!')
})
// admin
app.route("/api/admin/user", adminUserRoute)
app.route("/api/admin/order", adminOrderRoute)
// public
app.route("/api/user", userRoute)
app.route("/api/user/account", userAccountRoute)

//

// 
app.route("/api/auth", authRoute)
app.route("/api/user", adminUserRoute)
app.route("/api/taxonomy", taxonomyRoute)
app.route("/api/dishes", dishesRoute)
app.route("/api/checkout", checkoutRoute)
app.route("/api/file", fileRoute)
// demo api
app.route("/api/demo", demoRoute)

const port = 8081
console.log(`Server is running on port ${port}`)

serve({ fetch: app.fetch, port })
