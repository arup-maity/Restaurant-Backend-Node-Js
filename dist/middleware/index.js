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
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthentication = adminAuthentication;
const cookie_1 = require("hono/cookie");
const jwt_1 = require("hono/jwt");
function adminAuthentication(c, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cookie_token = (0, cookie_1.getCookie)(c, 'token');
            function getToken() {
                const { authorization } = c.req.header();
                if (!authorization || authorization === undefined || !authorization.startsWith('Bearer ')) {
                    return null;
                }
                return authorization.split(' ')[1];
            }
            const token = cookie_token || getToken();
            // check is exists
            if (!token)
                return c.json({ auth: false, message: 'token not found' }, 409);
            // token is varifying
            const tokenVerify = yield (0, jwt_1.verify)(token, process.env.JWT_SECRET);
            if (!tokenVerify)
                return c.json({ auth: false, message: "token is not valid" }, 409);
            // check token purpose
            if (tokenVerify.purpose !== 'login')
                return c.json({ auth: false, message: 'this token not for login purpose' }, 409);
            // set token detais on request
            c.user = tokenVerify;
            yield next();
        }
        catch (error) {
            return c.json({ auth: false, message: "token is expired, Please login again" }, 409);
        }
    });
}
