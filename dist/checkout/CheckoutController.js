"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const Connection_1 = __importDefault(require("../config/Connection"));
const stripe_1 = require("./stripe");
const stripe_2 = __importDefault(require("stripe"));
const middleware_1 = require("../middleware");
const checkoutRoute = new hono_1.Hono();
const stripe = new stripe_2.default(process.env.STRIPE_SK);
checkoutRoute.post("/create-checkout", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield c.req.json();
        const newCheckout = yield Connection_1.default.checkout.createMany({
            data: body
        });
        return c.json({ success: true, newCheckout }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
checkoutRoute.get("/checkout-details/:checkoutId", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkoutId = c.req.param('checkoutId');
        const checkoutItems = yield Connection_1.default.checkout.findMany({
            where: { checkoutId },
            include: {
                dishes: {
                    select: {
                        title: true,
                        thumbnail: true
                    }
                },
            }
        });
        return c.json({ success: true, checkoutItems }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
checkoutRoute.post("/create-payment", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield c.req.json();
        const metadata = {
            checkoutId: body.checkoutId,
            // shippingAddress: body.shippingAddress
        };
        const secret = yield (0, stripe_1.createSecret)(body.amount, 'inr', metadata);
        return c.json({ success: true, secret }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
checkoutRoute.get("/webhook", middleware_1.userAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = c.user;
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return c.json({ success: false }, 409);
        const { instance } = c.req.query();
        const intent = yield stripe.paymentIntents.retrieve(instance);
        const checkoutId = intent.metadata.checkoutId;
        const checkout = yield Connection_1.default.checkout.findMany({
            where: { checkoutId },
        });
        if (!checkout.length)
            return c.json({ success: false }, 409);
        const orderDetails = checkout.map((item) => ({
            dishId: item.id,
            quantity: item.quantity,
            price: item.price,
        }));
        const paymentDetails = {
            paymentId: intent === null || intent === void 0 ? void 0 : intent.id,
            paymentMethod: intent === null || intent === void 0 ? void 0 : intent.payment_method_types[0],
            amount: +(intent === null || intent === void 0 ? void 0 : intent.amount) / 100,
            status: intent === null || intent === void 0 ? void 0 : intent.status
        };
        const [createOrder, deleteCheckout] = yield Connection_1.default.$transaction([
            Connection_1.default.order.create({
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
            Connection_1.default.checkout.deleteMany({
                where: { checkoutId },
            }),
        ]);
        if (!createOrder)
            return c.json({ success: false }, 409);
        return c.json({ success: true }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
exports.default = checkoutRoute;
