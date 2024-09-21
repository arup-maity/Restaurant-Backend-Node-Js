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
const google_1 = require("./social-auth/google");
const authRoute = new hono_1.Hono();
const googleAuth = new google_1.GoogleAuth({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUrl: "http://localhost:8081/api/auth/google/callback"
});
authRoute.post("/admin-login", (c) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = yield c.req.json();
        console.log(body);
        // find username
        const user = yield Connection_1.default.users.findUnique({
            where: { email: body.email },
            include: {
                userAuth: true
            }
        });
        if (!user)
            return c.json({ success: false, message: "User not found" }, 409);
        // check password
        const checkPassword = bcrypt_1.default.compareSync(body === null || body === void 0 ? void 0 : body.password, (_a = user.userAuth) === null || _a === void 0 ? void 0 : _a.password);
        if (!checkPassword)
            return c.json({ success: false, message: "Not match username and password" }, 409);
        // 
        const payload = {
            id: user === null || user === void 0 ? void 0 : user.id,
            name: (user === null || user === void 0 ? void 0 : user.firstName) ? (user === null || user === void 0 ? void 0 : user.firstName) + " " + (user === null || user === void 0 ? void 0 : user.lastName) : '',
            role: user === null || user === void 0 ? void 0 : user.role,
            accessPurpose: 'admin',
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
        //  return response
        return c.json({ success: true, message: `Login successfully` }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
authRoute.post("/user-login", (c) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = yield c.req.json();
        // find username
        const user = yield Connection_1.default.users.findUnique({
            where: { email: body.email },
            include: {
                userAuth: true
            }
        });
        if (!user)
            return c.json({ success: false, message: "User not found" }, 409);
        // check password
        const checkPassword = bcrypt_1.default.compareSync(body === null || body === void 0 ? void 0 : body.password, (_a = user.userAuth) === null || _a === void 0 ? void 0 : _a.password);
        if (!checkPassword)
            return c.json({ success: false, message: "Not match username and password" }, 409);
        // 
        const payload = {
            id: user === null || user === void 0 ? void 0 : user.id,
            name: (user === null || user === void 0 ? void 0 : user.fullName) || '',
            role: 'user',
            accessPurpose: 'user',
            purpose: 'login',
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2, // Token expires in 5 minutes
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
        //  return response
        return c.json({ success: true, message: `Login successfully` }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, error }, 500);
    }
}));
authRoute.get("check-token", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // token is taking from cookie
        const cookie_token = (0, cookie_1.getCookie)(c, 'token');
        // token is taking from header
        function getToken() {
            const { authorization } = c.req.header();
            if (!authorization || !authorization.startsWith('Bearer ')) {
                return c.json({ login: false, message: 'token not found' }, 200);
            }
            return authorization.split(' ')[1];
        }
        const token = cookie_token || getToken();
        if (!token)
            return c.json({ login: false, message: 'token not found' }, 409);
        // verify that the token
        const tokenVerify = yield (0, jwt_1.verify)(token, process.env.JWT_SECRET);
        if (!tokenVerify)
            return c.json({ login: false, message: "token is not valid" }, 409);
        // check that the token porpose
        if (tokenVerify.purpose !== 'login')
            return c.json({ login: false, message: 'this token not for login purpose' }, 409);
        // return the response
        return c.json({ success: true, login: true, payload: tokenVerify }, 200);
    }
    catch (error) {
        return c.json({ login: false, message: "token is expire" }, 409);
    }
}));
// google
authRoute.get('/google-auth', (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authorizationUrl = yield googleAuth.createAuthorizationUrl({
            scopes: ["profile", "email", "openid"],
            state: 'home'
        });
        return c.redirect(authorizationUrl);
    }
    catch (error) {
        return c.json({ error: error.message }, 500);
    }
}));
authRoute.get("/google/callback", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = c.req.query();
        const userDetails = yield googleAuth.verifyAuthorizationUser(code);
        const user = yield Connection_1.default.users.findUnique({
            where: { email: userDetails === null || userDetails === void 0 ? void 0 : userDetails.email }
        });
        if (!user)
            return c.json({ success: false, message: "User not found" }, 409);
        const payload = {
            id: user === null || user === void 0 ? void 0 : user.id,
            fullName: (user === null || user === void 0 ? void 0 : user.fullName) || '',
            email: user.email,
            role: 'user',
            purpose: 'login',
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2,
        };
        const token = yield (0, jwt_1.sign)(payload, process.env.JWT_SECRET);
        (0, cookie_1.setCookie)(c, 'token', token, {
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
        });
        return c.redirect(process.env.ALLOWED_ORIGIN_WEB + "/");
        // return c.json({ user: userDetails }, 200);
    }
    catch (error) {
        return c.json({ error: error.message }, 500);
    }
}));
exports.default = authRoute;
