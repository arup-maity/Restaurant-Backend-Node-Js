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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const Connection_1 = __importDefault(require("../config/Connection"));
const middleware_1 = require("../middleware");
const utils_1 = require("../file-manage/utils");
const taxonomyRoute = new hono_1.Hono();
taxonomyRoute.post("create-taxonomy", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield c.req.json();
        const checkSlug = yield Connection_1.default.taxonomy.findUnique({
            where: { slug: body.slug }
        });
        if (checkSlug)
            return c.json({ success: false, message: "Slug already exists" }, 409);
        const newTaxonomy = yield Connection_1.default.taxonomy.create({
            data: body
        });
        if (!newTaxonomy)
            return c.json({ success: false, message: "Unsccessfull" }, 409);
        return c.json({ success: true, message: "Successfully created" }, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ success: false, error }, 500);
    }
}));
taxonomyRoute.put("/update-taxonomy/:id", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = yield c.req.json(), { oldThumbnail } = _a, rest = __rest(_a, ["oldThumbnail"]);
        console.log(rest);
        const { id } = c.req.param();
        const checkSlug = yield Connection_1.default.taxonomy.findUnique({
            where: {
                slug: rest.slug,
                NOT: { id: +id }
            }
        });
        if (checkSlug)
            return c.json({ success: false, message: "Slug already exists" }, 409);
        const updatedTaxonomy = yield Connection_1.default.taxonomy.update({
            where: { id: +id },
            data: rest
        });
        if (!updatedTaxonomy)
            return c.json({ success: false, message: "Not updated" }, 409);
        if (oldThumbnail !== (rest === null || rest === void 0 ? void 0 : rest.thumbnail)) {
            yield (0, utils_1.deleteFile)('restaurant', oldThumbnail);
        }
        return c.json({ success: true, message: "Successfully updated" }, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ success: false, error }, 500);
    }
}));
taxonomyRoute.get("/read-taxonomy/:id", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = c.req.param();
        const taxonomy = yield Connection_1.default.taxonomy.findUnique({
            where: { id: +id }
        });
        if (!taxonomy)
            return c.json({ success: false, message: "Not found" }, 409);
        return c.json({ success: true, taxonomy }, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ success: false, error }, 500);
    }
}));
taxonomyRoute.get("/read-taxonomy-with-dishes/:slug", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = c.req.param();
        const taxonomy = yield Connection_1.default.taxonomy.findUnique({
            where: { slug },
            include: {
                dishes: {
                    include: {
                        dish: true
                    }
                }
            }
        });
        if (!taxonomy)
            return c.json({ success: false, message: "Not found" }, 409);
        return c.json({ success: true, taxonomy }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, message: error }, 500);
    }
}));
taxonomyRoute.delete("/delete-taxonomy/:id", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = c.req.param();
        const { thumbnail } = c.req.query();
        const deletedTaxonomy = yield Connection_1.default.taxonomy.delete({
            where: { id: +id }
        });
        if (!deletedTaxonomy)
            return c.json({ success: false, message: "Delete not successfully" }, 409);
        yield (0, utils_1.deleteFile)('restaurant', thumbnail);
        return c.json({ success: true, message: "Successfully delete" }, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ success: false, error }, 500);
    }
}));
taxonomyRoute.get("/taxonomies", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, column = 'createdAt', sortOrder = 'desc', page, limit } = c.req.query();
        const query = {};
        const taxonomies = yield Connection_1.default.taxonomy.findMany({
            orderBy: { [column]: sortOrder },
        });
        return c.json({ success: true, taxonomies }, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ success: false, error }, 500);
    }
}));
taxonomyRoute.get("/taxonomies/:type", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = c.req.param();
        const taxonomies = yield Connection_1.default.taxonomy.findMany({
            where: { type }
        });
        return c.json({ success: true, taxonomies }, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ success: false, error }, 500);
    }
}));
taxonomyRoute.get("/taxonomy-menu", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taxonomies = yield Connection_1.default.taxonomy.findMany({
            include: {
                dishes: {
                    include: {
                        dish: true,
                    }
                }
            }
        });
        return c.json({ success: true, taxonomies }, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ success: false, error }, 500);
    }
}));
exports.default = taxonomyRoute;
