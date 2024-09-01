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
const middleware_1 = require("../middleware");
const jwt_1 = require("hono/jwt");
const cookie_1 = require("hono/cookie");
const userRoute = new hono_1.Hono();
userRoute.post("/create-admin-user", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield c.req.json();
        const user = yield Connection_1.default.adminUser.findUnique({
            where: { email: body.email }
        });
        if (user)
            return c.json({ success: false, message: "User already exists" }, 409);
        const hashPassword = bcrypt_1.default.hashSync(body.password, 16);
        const newUser = yield Connection_1.default.adminUser.create({
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                role: body.role,
                adminAuth: {
                    create: {
                        method: "password",
                        password: hashPassword
                    }
                }
            }
        });
        if (!newUser)
            return c.json({ success: false, message: "Not create user" }, 409);
        return c.json({ success: true, message: `Successfully create user ${body.firstName}` }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
userRoute.put("/update-admin-user/:id", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield c.req.json();
        const { id } = c.req.param();
        const updatedUser = yield Connection_1.default.adminUser.update({
            where: { id: +id },
            data: {
                email: body.email,
                role: body.role,
            }
        });
        if (!updatedUser)
            return c.json({ success: false, message: "Not update user" }, 409);
        return c.json({ success: true, message: `Successfully update user ${updatedUser.firstName}` }, 200);
    }
    catch (error) {
        return c.json({ success: false, error }, 500);
    }
}));
userRoute.get("/read-admin-user/:id", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = c.req.param();
        const user = yield Connection_1.default.adminUser.findUnique({
            where: { id: +id },
            include: {
                adminAuth: true
            }
        });
        if (!user)
            return c.json({ success: false, message: "User not found" }, 409);
        return c.json({ success: true, user }, 200);
    }
    catch (error) {
        return c.json({ success: false, error }, 500);
    }
}));
userRoute.delete("/delete-admin-user/:id", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = c.req.param();
        const deletedUser = yield Connection_1.default.adminUser.delete({
            where: { id: +id }
        });
        if (!deletedUser)
            return c.json({ success: false, message: "User not found" }, 409);
        return c.json({ success: true, message: `Successfully deleted user ${deletedUser.firstName}` }, 200);
    }
    catch (error) {
        return c.json({ success: false, error }, 500);
    }
}));
userRoute.get("/admin-users-list", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 25, search = '', role = "all", column = 'createdAt', sortOrder = 'desc' } = c.req.query();
        const conditions = {};
        if (search) {
            conditions.OR = [
                { email: { contains: search, mode: "insensitive" } },
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
            ];
        }
        if (role && role !== "all") {
            conditions.role = role;
        }
        const query = {};
        if (column && sortOrder) {
            query.orderBy = { [column]: sortOrder };
        }
        const users = yield Connection_1.default.adminUser.findMany(Object.assign({ where: conditions, take: +limit, skip: (+page - 1) * +limit }, query));
        const [filterCount, totalCount] = yield Promise.all([
            Connection_1.default.adminUser.count({ where: conditions }),
            Connection_1.default.adminUser.count(),
        ]);
        return c.json({ success: true, users, filterCount, totalCount, message: 'Successfully' }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
// customer user
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
            name: `${(newUser === null || newUser === void 0 ? void 0 : newUser.firstName) + ' ' + (newUser === null || newUser === void 0 ? void 0 : newUser.lastName)}`,
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
        return c.json({ success: true, user: newUser, message: 'Account create successfully' }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
exports.default = userRoute;
