import { Hono } from "hono";
import prisma from "../config/Connection";
import { adminAuthentication } from "../middleware";
import { deleteFile } from "../file-manage/utils";

const taxonomyRoute = new Hono()

taxonomyRoute.post("create-taxonomy", adminAuthentication, async c => {
   try {
      const body = await c.req.json()
      const checkSlug = await prisma.taxonomy.findUnique({
         where: { slug: body.slug }
      })
      if (checkSlug) return c.json({ success: false, message: "Slug already exists" }, 409)
      const newTaxonomy = await prisma.taxonomy.create({
         data: body
      })
      if (!newTaxonomy) return c.json({ success: false, message: "Unsccessfull" }, 409)
      return c.json({ success: true, message: "Successfully created" }, 200)
   } catch (error) {
      console.error(error)
      return c.json({ success: false, error }, 500)
   }
})
taxonomyRoute.put("/update-taxonomy/:id", adminAuthentication, async c => {
   try {
      const { oldThumbnail, ...rest } = await c.req.json()
      console.log(rest)
      const { id } = c.req.param()
      const checkSlug = await prisma.taxonomy.findUnique({
         where: {
            slug: rest.slug,
            NOT: { id: +id }
         }
      })
      if (checkSlug) return c.json({ success: false, message: "Slug already exists" }, 409)
      const updatedTaxonomy = await prisma.taxonomy.update({
         where: { id: +id },
         data: rest
      })
      if (!updatedTaxonomy) return c.json({ success: false, message: "Not updated" }, 409)
      if (oldThumbnail !== rest?.thumbnail) {
         await deleteFile('restaurant', oldThumbnail)
      }
      return c.json({ success: true, message: "Successfully updated" }, 200)
   } catch (error) {
      console.error(error)
      return c.json({ success: false, error }, 500)
   }
})
taxonomyRoute.get("/read-taxonomy/:id", adminAuthentication, async c => {
   try {
      const { id } = c.req.param()
      const taxonomy = await prisma.taxonomy.findUnique({
         where: { id: +id }
      })
      if (!taxonomy) return c.json({ success: false, message: "Not found" }, 409)
      return c.json({ success: true, taxonomy }, 200)
   } catch (error) {
      console.error(error)
      return c.json({ success: false, error }, 500)
   }
})
taxonomyRoute.get("/read-taxonomy-with-dishes/:slug", async c => {
   try {
      const { slug } = c.req.param()
      const taxonomy = await prisma.taxonomy.findUnique({
         where: { slug },
         include: {
            dishes: {
               include: {
                  dish: true
               }
            }
         }
      })
      if (!taxonomy) return c.json({ success: false, message: "Not found" }, 409)
      return c.json({ success: true, taxonomy }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, message: error }, 500)
   }
})
taxonomyRoute.delete("/delete-taxonomy/:id", adminAuthentication, async c => {
   try {
      const { id } = c.req.param()
      const { thumbnail } = c.req.query()
      const deletedTaxonomy = await prisma.taxonomy.delete({
         where: { id: +id }
      })
      if (!deletedTaxonomy) return c.json({ success: false, message: "Delete not successfully" }, 409)
      await deleteFile('restaurant', thumbnail)
      return c.json({ success: true, message: "Successfully delete" }, 200)
   } catch (error) {
      console.error(error)
      return c.json({ success: false, error }, 500)
   }
})
taxonomyRoute.get("/taxonomies", adminAuthentication, async c => {
   try {
      const { search, column = 'createdAt', sortOrder = 'desc', page, limit } = c.req.query()

      const query = {}


      const taxonomies = await prisma.taxonomy.findMany({
         orderBy: { [column]: sortOrder },
      })
      return c.json({ success: true, taxonomies }, 200)
   } catch (error) {
      console.error(error)
      return c.json({ success: false, error }, 500)
   }
})
taxonomyRoute.get("/taxonomies/:type", adminAuthentication, async c => {
   try {
      const { type } = c.req.param()
      const taxonomies = await prisma.taxonomy.findMany({
         where: { type }
      })
      return c.json({ success: true, taxonomies }, 200)
   } catch (error) {
      console.error(error)
      return c.json({ success: false, error }, 500)
   }
})
taxonomyRoute.get("/taxonomy-menu", async c => {
   try {
      const taxonomies = await prisma.taxonomy.findMany({
         include: {
            dishes: {
               include: {
                  dish: true,
               }
            }
         }
      })
      return c.json({ success: true, taxonomies }, 200)
   } catch (error) {
      console.error(error)
      return c.json({ success: false, error }, 500)
   }
})

export default taxonomyRoute