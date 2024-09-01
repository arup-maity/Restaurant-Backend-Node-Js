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
const checkoutRoute = new hono_1.Hono();
const stripe = new stripe_2.default(process.env.STRIPE_SK);
checkoutRoute.post("/create-checkout", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield c.req.json();
        console.log(body);
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
                        price: true,
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
        const secret = yield (0, stripe_1.createSecret)(body.amount, 'inr', body.checkoutId, 'name', 'email');
        return c.json({ success: true, secret }, 200);
    }
    catch (error) {
        return c.json({ success: false, error }, 500);
    }
}));
checkoutRoute.get("/webhook/:instance", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instance = c.req.param('instance');
        const intent = yield stripe.paymentIntents.retrieve(instance);
        return c.json({ success: true, intent }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
exports.default = checkoutRoute;
