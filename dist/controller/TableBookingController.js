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
const middleware_1 = require("../middleware");
const tableBookingsRoute = new hono_1.Hono();
tableBookingsRoute.post("/booking-table", middleware_1.userAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = c.user;
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return c.json({ success: false }, 409);
        const body = yield c.req.json();
        const newBooking = yield Connection_1.default.tableBooking.create({
            data: {
                userId: +user.id,
                time: body.time,
                date: body.date,
                note: body.note
            }
        });
        return c.json({ success: true, data: newBooking }, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ success: false, error: error }, 500);
    }
}));
exports.default = tableBookingsRoute;
