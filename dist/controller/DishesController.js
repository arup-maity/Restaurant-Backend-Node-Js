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
const dishesRoute = new hono_1.Hono();
dishesRoute.post("/create-dish", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = yield c.req.json(), { category } = _a, rest = __rest(_a, ["category"]);
        const checkSlug = yield Connection_1.default.dishes.findUnique({
            where: { slug: rest.slug }
        });
        if (checkSlug)
            return c.json({ success: false, message: "Dish slug already exists" }, 409);
        const dish = yield Connection_1.default.dishes.create({
            data: Object.assign(Object.assign({}, rest), { categories: {
                    create: category.map((id) => ({
                        taxonomy: { connect: { id: id } },
                    })),
                } }),
        });
        if (!dish)
            return c.json({ success: false, message: "Dish not created" }, 409);
        return c.json({ success: true, message: "Dish created successfully", dish });
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, message: error }, 500);
    }
}));
dishesRoute.put("/update-dish/:id", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = c.req.param();
        const _a = yield c.req.json(), { category, oldCategory, oldThumbnail } = _a, rest = __rest(_a, ["category", "oldCategory", "oldThumbnail"]);
        const newCategoryIds = category.filter((id) => !oldCategory.includes(id));
        const removedCategoryIds = oldCategory.filter((id) => !category.includes(id));
        const updateDish = yield Connection_1.default.dishes.update({
            where: { id: +id },
            data: Object.assign(Object.assign({}, rest), { categories: {
                    create: newCategoryIds.map((id) => ({
                        taxonomy: { connect: { id: id } },
                    }))
                } })
        });
        yield Promise.all(removedCategoryIds.map((taxonomyId) => Connection_1.default.dishesTaxonomy.delete({
            where: { dishId_taxonomyId: { dishId: +id, taxonomyId } },
        })));
        if (!updateDish)
            return c.json({ success: false, message: "Dish not updated" }, 409);
        if (oldThumbnail !== '' && oldThumbnail !== rest.thumbnail) {
            yield (0, utils_1.deleteFile)('restaurant', oldThumbnail);
        }
        return c.json({ success: true, message: "Dish updated successfully" });
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, message: error }, 500);
    }
}));
dishesRoute.get("/read-dish/:id", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = c.req.param();
        const dish = yield Connection_1.default.dishes.findUnique({
            where: { id: +id },
            include: {
                categories: true
            }
        });
        if (!dish)
            return c.json({ success: false, message: "Dish not found" }, 409);
        return c.json({ success: true, dish }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, message: error }, 500);
    }
}));
dishesRoute.get("/dish-detail/:slug", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = c.req.param();
        const dish = yield Connection_1.default.dishes.findUnique({
            where: { slug },
            include: {
                categories: true
            }
        });
        if (!dish)
            return c.json({ success: false, message: "Dish not found" }, 409);
        return c.json({ success: true, dish }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, message: error }, 500);
    }
}));
dishesRoute.delete("/delete-dish/:id", middleware_1.adminAuthentication, (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = c.req.param();
        const { thumbnail } = c.req.query();
        const deleteDish = yield Connection_1.default.$transaction([
            Connection_1.default.dishesTaxonomy.deleteMany({
                where: { dishId: +id }
            }),
            Connection_1.default.dishes.delete({
                where: { id: +id }
            })
        ]);
        yield (0, utils_1.deleteFile)('restaurant', thumbnail);
        return c.json({ success: true, message: "Dish deleted" }, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ success: false, error }, 500);
    }
}));
dishesRoute.get("/all-dishes", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dishes = yield Connection_1.default.dishes.findMany({
            include: {
                categories: {
                    include: {
                        taxonomy: true
                    }
                }
            }
        });
        return c.json({ success: true, dishes }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, message: error }, 500);
    }
}));
dishesRoute.get("/filtered-dishes", (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dishes = yield Connection_1.default.dishes.findMany();
        return c.json({ success: true, dishes }, 200);
    }
    catch (error) {
        console.log(error);
        return c.json({ success: false, message: error }, 500);
    }
}));
exports.default = dishesRoute;
