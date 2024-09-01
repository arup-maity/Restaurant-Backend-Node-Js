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
exports.GoogleAuth = void 0;
const utils_1 = require("./utils");
class GoogleAuth {
    constructor(obj) {
        if (typeof obj !== "object" || Array.isArray(obj) || obj === null) {
            throw new Error("Constructor must be called with a single object argument");
        }
        this.clientId = obj.clientId;
        this.clientSecret = obj.clientSecret;
        this.redirectUrl = obj.redirectUrl;
        this.googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
        this.tokenUrl = "https://oauth2.googleapis.com/token";
        this.userInfo = "https://openidconnect.googleapis.com/v1/userinfo";
    }
    createAuthorizationUrl(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const googleScopes = options.scopes || ["profile", "email", "openid"];
            const googleState = options.state || "home";
            const getScopes = Array.from(new Set(googleScopes));
            const authorizationUrl = new URL(this.googleAuthUrl);
            authorizationUrl.searchParams.set("response_type", "code");
            authorizationUrl.searchParams.set("state", googleState);
            authorizationUrl.searchParams.set("client_id", this.clientId);
            authorizationUrl.searchParams.set("scope", getScopes.join(" "));
            authorizationUrl.searchParams.set("redirect_uri", this.redirectUrl);
            if (options.codeVerifier) {
                const codeChallenge = yield (0, utils_1.sha256_hash)(options.codeVerifier);
                authorizationUrl.searchParams.set("code_challenge_method", "S256");
                authorizationUrl.searchParams.set("code_challenge", codeChallenge);
            }
            return authorizationUrl.toString();
        });
    }
    verifyAuthorizationUser(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = new Headers();
            headers.set("Content-Type", "application/x-www-form-urlencoded");
            headers.set("Accept", "application/json");
            const body = new URLSearchParams();
            body.set("code", code);
            body.set("client_id", this.clientId);
            body.set("client_secret", this.clientSecret);
            body.set("redirect_uri", this.redirectUrl);
            body.set("grant_type", "authorization_code");
            const request = new Request(this.tokenUrl, {
                method: "POST",
                headers,
                body
            });
            const response = yield fetch(request);
            const result = yield response.json();
            return yield this.getUserDetails(result.access_token);
        });
    }
    getUserDetails(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(this.userInfo, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return yield response.json();
        });
    }
}
exports.GoogleAuth = GoogleAuth;
