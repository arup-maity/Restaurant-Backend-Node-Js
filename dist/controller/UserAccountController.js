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
const userAccountRoute = new hono_1.Hono();
userAccountRoute.use(middleware_1.userAuthentication);
userAccountRoute.get("/order-list", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = c.user;
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return c.json({ success: false }, 409);
        const orders = yield Connection_1.default.order.findMany({
            where: { userId: +user.id },
            include: {
                orderItems: {
                    include: {
                        dishes: {
                            select: {
                                thumbnail: true
                            }
                        }
                    }
                },
                paymentMethod: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return c.json({ success: true, orders }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
userAccountRoute.get("/profile-details", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = c.user;
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return c.json({ success: false }, 409);
        const profileDetails = yield Connection_1.default.users.findUnique({
            where: { id: +user.id },
        });
        return c.json({ success: true, profileDetails }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
userAccountRoute.get("/address-details", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = c.user;
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return c.json({ success: false }, 409);
        const addressDetails = yield Connection_1.default.userAddresses.findMany({
            where: { userId: +user.id },
        });
        return c.json({ success: true, addressDetails }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
userAccountRoute.post("/add-address", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield c.req.json();
        const user = c.user;
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return c.json({ success: false }, 409);
        const newAddress = yield Connection_1.default.userAddresses.create({
            data: {
                userId: +user.id,
                fullName: body.fullName,
                streetAddress: body.streetAddress,
                country: body.country,
                city: body.city,
                state: body.state,
                zipCode: body.zipCode,
                phone: body.phone,
            }
        });
        return c.json({ success: true, newAddress }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
userAccountRoute.put("/update-address", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield c.req.json();
        const user = c.user;
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return c.json({ success: false }, 409);
        const updateAddress = yield Connection_1.default.userAddresses.update({
            where: { id: +body.id },
            data: {
                fullName: body.fullName,
                streetAddress: body.streetAddress,
                country: body.country,
                city: body.city,
                state: body.state,
                zipCode: body.zipCode,
                phone: body.phone,
            }
        });
        return c.json({ success: true, updateAddress }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
userAccountRoute.put("/update-profile", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield c.req.json();
        const user = c.user;
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return c.json({ success: false }, 409);
        const updateProfile = yield Connection_1.default.users.update({
            where: { id: +user.id },
            data: {
                fullName: body.fullName,
                email: body.email,
                phoneNumber: body.phoneNumber,
            }
        });
        return c.json({ success: true, updateProfile }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
exports.default = userAccountRoute;
