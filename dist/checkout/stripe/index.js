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
exports.createSecret = createSecret;
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SK);
function createSecret(amount_1) {
    return __awaiter(this, arguments, void 0, function* (amount, currency = 'inr', metadata) {
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            payment_method_types: ['card'],
            metadata: metadata
        });
        // const session = await stripe.checkout.sessions.create({
        //    line_items: [
        //       {
        //          price_data: {
        //             currency: 'inr',
        //             product_data: {
        //                name: 'T-shirt',
        //             },
        //             unit_amount: 2000,
        //          },
        //          quantity: 1,
        //       },
        //    ],
        //    mode: 'payment',
        //    ui_mode: 'embedded',
        //    // The URL of your payment completion page
        //    return_url: 'http://localhost:3001/'
        // });
        // console.log('===>', session)
        return paymentIntent.client_secret;
    });
}
