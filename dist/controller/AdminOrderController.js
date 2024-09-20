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
const adminOrderRoute = new hono_1.Hono();
adminOrderRoute.get("/order-request", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield Connection_1.default.order.findMany({
        // where: { status: "pending" },
        });
        return c.json({ success: true, orders }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error: error }, 500);
    }
}));
adminOrderRoute.get("/read-order/:id", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = c.req.param();
        const order = yield Connection_1.default.order.findUnique({
            where: { id: +id },
            include: {
                user: true,
                orderItems: {
                    include: {
                        dishes: true
                    }
                },
                paymentMethod: true
            }
        });
        if (!order)
            return c.json({ success: false, message: "Not found" }, 404);
        return c.json({ success: true, order }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error: error }, 500);
    }
}));
adminOrderRoute.put("/update-status/:id", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = c.req.param();
        const { status } = yield c.req.json();
        const updatedOrder = yield Connection_1.default.order.update({
            where: { id: +id },
            data: { status },
            include: {
                user: true,
                orderItems: {
                    include: {
                        dishes: true
                    }
                },
                paymentMethod: true
            }
        });
        if (!updatedOrder)
            return c.json({ success: false, message: "Not found" }, 404);
        return c.json({ success: true, message: "Order status updated successfully", updatedOrder }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error: error }, 500);
    }
}));
adminOrderRoute.get("/orders-list", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield Connection_1.default.order.findMany({
            include: {
                user: true,
                orderItems: {
                    include: {
                        dishes: true
                    }
                },
                paymentMethod: true
            }
        });
        return c.json({ success: true, orders }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error: error }, 500);
    }
}));
exports.default = adminOrderRoute;
