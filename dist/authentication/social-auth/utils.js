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
exports.sha256_hash = sha256_hash;
function base64Encode(unencoded) {
    return Buffer.from(unencoded || "").toString("base64");
}
function base64urlEncode(unencoded) {
    const encoded = base64Encode(unencoded);
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function sha256_hash(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashBuffer = yield crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
        return base64urlEncode(hashBuffer);
    });
}
