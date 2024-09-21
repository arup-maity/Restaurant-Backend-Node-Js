import { Hono } from "hono";
import prisma from "../config/Connection";
import { adminAuthentication } from "../middleware";
import { deleteFile } from "../file-manage/utils";

const dishesRoute = new Hono()

dishesRoute.post("/create-dish", adminAuthentication, async c => {
   try {
      const { category, ...rest } = await c.req.json()
      const checkSlug = await prisma.dishes.findUnique({
         where: { slug: rest.slug }
      })
      if (checkSlug) return c.json({ success: false, message: "Dish slug already exists" }, 409)
      const dish = await prisma.dishes.create({
         data: {
            ...rest,
            categories: {
               create: category.map((id: number) => ({
                  taxonomy: { connect: { id: id } },
               })),
            }
         },
      })
      if (!dish) return c.json({ success: false, message: "Dish not created" }, 409)
      return c.json({ success: true, message: "Dish created successfully", dish })
   } catch (error) {
      console.log(error)
      return c.json({ success: false, message: error }, 500)
   }
})
dishesRoute.put("/update-dish/:id", adminAuthentication, async c => {
   try {
      const { id } = c.req.param()
      const { category, oldCategory, oldThumbnail, ...rest } = await c.req.json()
      const newCategoryIds = category.filter((id: number) => !oldCategory.includes(id))
      const removedCategoryIds = oldCategory.filter((id: number) => !category.includes(id));

      const updateDish = await prisma.dishes.update({
         where: { id: +id },
         data: {
            ...rest,
            categories: {
               create: newCategoryIds.map((id: number) => ({
                  taxonomy: { connect: { id: id } },
               }))
            }
         }
      })

      await Promise.all(removedCategoryIds.map((taxonomyId: number) =>
         prisma.dishesTaxonomy.delete({
            where: { dishId_taxonomyId: { dishId: +id, taxonomyId } },
         })
      ));

      if (!updateDish) return c.json({ success: false, message: "Dish not updated" }, 409)
      if (oldThumbnail !== '' && oldThumbnail !== rest.thumbnail) {
         await deleteFile('restaurant', oldThumbnail)
      }
      return c.json({ success: true, message: "Dish updated successfully" })
   } catch (error) {
      console.log(error)
      return c.json({ success: false, message: error }, 500)
   }
})
dishesRoute.get("/read-dish/:id", adminAuthentication, async c => {
   try {
      const { id } = c.req.param()
      const dish = await prisma.dishes.findUnique({
         where: { id: +id },
         include: {
            categories: true
         }
      })
      if (!dish) return c.json({ success: false, message: "Dish not found" }, 409)
      return c.json({ success: true, dish }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, message: error }, 500)
   }
})
dishesRoute.get("/dish-detail/:slug", async c => {
   try {
      const { slug } = c.req.param()
      const dish = await prisma.dishes.findUnique({
         where: { slug },
         include: {
            categories: true
         }
      })
      if (!dish) return c.json({ success: false, message: "Dish not found" }, 409)
      return c.json({ success: true, dish }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, message: error }, 500)
   }
})
dishesRoute.delete("/delete-dish/:id", adminAuthentication, async c => {
   try {
      const { id } = c.req.param()
      const { thumbnail } = c.req.query()
      const deleteDish = await prisma.$transaction([
         prisma.dishesTaxonomy.deleteMany({
            where: { dishId: +id }
         }),
         prisma.dishes.delete({
            where: { id: +id }
         })
      ])
      await deleteFile('restaurant', thumbnail)
      return c.json({ success: true, message: "Dish deleted" }, 200)
   } catch (error) {
      console.error(error)
      return c.json({ success: false, error }, 500)
   }
})
dishesRoute.get("/all-dishes", async c => {
   try {
      const dishes = await prisma.dishes.findMany({
         include: {
            categories: {
               include: {
                  taxonomy: true
               }
            }
         }
      })
      return c.json({ success: true, dishes }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, message: error }, 500)
   }
})
dishesRoute.get("/filtered-dishes", async c => {
   try {
      const dishes = await prisma.dishes.findMany()
      return c.json({ success: true, dishes }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, message: error }, 500)
   }
})
export default dishesRoute