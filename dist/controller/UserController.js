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
const bcrypt_1 = __importDefault(require("bcrypt"));
const Connection_1 = __importDefault(require("../config/Connection"));
const jwt_1 = require("hono/jwt");
const cookie_1 = require("hono/cookie");
const userRoute = new hono_1.Hono();
userRoute.post("/create-user", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield c.req.json();
        const user = yield Connection_1.default.users.findUnique({
            where: { email: body.email }
        });
        if (user)
            return c.json({ success: false, message: "User already exists" }, 409);
        const hashPassword = bcrypt_1.default.hashSync(body.password, 16);
        const newUser = yield Connection_1.default.users.create({
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
        });
        if (!newUser)
            return c.json({ success: false, message: "Not create user" }, 409);
        const payload = {
            id: newUser === null || newUser === void 0 ? void 0 : newUser.id,
            name: (newUser === null || newUser === void 0 ? void 0 : newUser.fullName) || '',
            role: 'user',
            accessPurpose: 'user',
            purpose: 'login',
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 6, // Token expires in 5 minutes
        };
        // generate the token
        const token = yield (0, jwt_1.sign)(payload, process.env.JWT_SECRET);
        // Regular cookies
        (0, cookie_1.setCookie)(c, 'token', token, {
            domain: process.env.ENVIRONMENT === 'production' ? '.arupmaity.in' : 'localhost',
            path: '/',
            secure: true,
            httpOnly: false,
            sameSite: 'Strict',
            maxAge: 30 * 24 * 60 * 60,
        });
        return c.json({ success: true, user: newUser, payload, message: 'Account create successfully' }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
exports.default = userRoute;
