import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from "hono/cors";
import userRoute from './user-manage/UserController'
import demoRoute from './demo/DemoController'
import authRoute from './authentication/AuthController';
import taxonomyRoute from './taxonomy/TaxonomyController';
import dishesRoute from './dishes/DishesController';
import fileRoute from './file-manage/FileManaga';
import checkoutRoute from './checkout/CheckoutController';

const app = new Hono()

app.use(
   "/*",
   cors({
      origin: [`${process.env.ALLOWED_ORIGIN_WEB}`],
      allowMethods: ["POST", "GET", "PUT", "DELETE"],
      credentials: true
   })
);

app.get('/', (c) => {
   return c.text('Hello Hono!')
})
app.route("/api/auth", authRoute)
app.route("/api/user", userRoute)
app.route("/api/taxonomy", taxonomyRoute)
app.route("/api/dishes", dishesRoute)
app.route("/api/checkout", checkoutRoute)
app.route("/api/file", fileRoute)
// demo api
app.route("/api/demo", demoRoute)

const port = 8081
console.log(`Server is running on port ${port}`)

serve({ fetch: app.fetch, port })
