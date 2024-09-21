import { Hono } from "hono";
import bcrypt from "bcrypt";
import prisma from "../config/Connection";

const demoRoute = new Hono()

demoRoute.post("/create-admin-user", async c => {
   try {
      const body = await c.req.json()
      const user = await prisma.users.findUnique({
         where: { email: body.email }
      })
      if (user) return c.json({ success: false, message: "User already exists" }, 409)
      const hashPassword = bcrypt.hashSync(body.password, 16)
      const newUser = await prisma.users.create({
         data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            role: 'administrator',
            isActive: true,
            userAuth: {
               create: {
                  method: "password",
                  password: hashPassword
               }
            }
         }
      })
      if (!newUser) return c.json({ success: false, message: "Not create user" }, 409)

      return c.json({ success: true, newUser }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
demoRoute.post("/create-dish", async c => {
   try {
      const createMany = await prisma.dishes.createMany({
         data: [
            {
               "title": "Poori Aloo Choley (4 Pcs)",
               "slug": "poori-aloo-choley-4-pcs",
               "description": "A deep-fried, puffy Indian bread made from unleavened whole wheat flour dough. It's light, crispy, and pairs well with various curries and side dishes. A simple and flavorful potato dish, usually spiced with cumin, turmeric, and other Indian spices. It can be served dry or with a light gravy. A rich and spicy chickpea curry, made with a blend of tomatoes, onions, and a variety of aromatic spices. It's hearty and often enjoyed with rice or bread like Poori.",
               "shortDescription": "A classic combination of deep-fried Poori, spiced potato curry, and a rich, flavorful chickpea curry.",
               "price": 115,
               "costPrice": 250,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Choley Kulcha (2 Pcs)",
               "slug": "choley-kulcha-2-pcs",
               "description": "Choley is a rich and spicy chickpea curry, made with a blend of tomatoes, onions, and aromatic spices. Kulcha is a soft, leavened flatbread, often stuffed with various ingredients. Together, they create a hearty and satisfying meal.",
               "shortDescription": "Rich chickpea curry served with soft, stuffed Kulcha bread.",
               "price": 155,
               "costPrice": 250,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Bread Rolls (2 Pcs)",
               "slug": "bread-rolls-2-pcs",
               "description": "Crispy on the outside and soft on the inside, these bread rolls are stuffed with a flavorful filling, typically made from mashed potatoes, spices, and herbs. They are a popular snack or breakfast item.",
               "shortDescription": "Crispy stuffed bread rolls with a savory potato filling.",
               "price": 95,
               "costPrice": 200,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Bun Anda Shurjee",
               "slug": "bun-anda-shurjee",
               "description": "A classic breakfast dish consisting of a soft bun served with scrambled eggs cooked with spices. It's a comforting and filling meal, perfect for a quick start to the day.",
               "shortDescription": "Soft bun served with spiced scrambled eggs.",
               "price": 105,
               "costPrice": 200,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Bun Omlette Plain / with Cheese",
               "slug": "bun-omlette-plain-with-cheese",
               "description": "A fluffy omelette served inside a soft bun. The plain version is a simple yet satisfying meal, while the cheese version adds a rich, creamy texture to the dish.",
               "shortDescription": "Fluffy omelette served in a bun, available plain or with cheese.",
               "price": 105,
               "costPrice": 155,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Bun Masala Omlette Plain / with Cheese",
               "slug": "bun-masala-omlette-plain-with-cheese",
               "description": "A spicy twist on the classic bun omelette, this version is made with a masala omelette that's flavored with a blend of spices. The cheese option adds a creamy layer to the dish.",
               "shortDescription": "Spiced masala omelette served in a bun, available plain or with cheese.",
               "price": 115,
               "costPrice": 165,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Parantha Egg Roll Plain / with Cheese",
               "slug": "parantha-egg-roll-plain-with-cheese",
               "description": "A flavorful dish where a spiced egg omelette is rolled inside a flaky, golden-brown parantha. The cheese version adds an extra layer of richness to the roll.",
               "shortDescription": "Spiced egg omelette rolled inside a parantha, available plain or with cheese.",
               "price": 125,
               "costPrice": 175,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Masala Egg Sandwich Plain / with Cheese",
               "slug": "masala-egg-sandwich-plain-with-cheese",
               "description": "A hearty sandwich made with spiced scrambled eggs and a variety of condiments, served between slices of soft bread. The cheese option adds a creamy texture to the sandwich.",
               "shortDescription": "Spiced scrambled egg sandwich, available plain or with cheese.",
               "price": 155,
               "costPrice": 205,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Choley Chawal / Parantha (2 Pcs)",
               "slug": "choley-chawal-parantha-2-pcs",
               "description": "Choley is a rich and spicy chickpea curry, made with a blend of tomatoes, onions, and aromatic spices. It can be enjoyed with steamed rice (Chawal) or soft, flaky paranthas. This dish is a popular and hearty choice for lunch or dinner.",
               "shortDescription": "Spicy chickpea curry served with your choice of rice or paranthas.",
               "price": 95,
               "costPrice": 200,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Dal Makhani Chawal / Parantha (2 Pcs)",
               "slug": "dal-makhani-chawal-parantha-2-pcs",
               "description": "Dal Makhani is a creamy and rich lentil dish made from black lentils and kidney beans, slow-cooked with butter and cream. It can be served with steamed rice (Chawal) or soft paranthas, offering a comforting and flavorful meal.",
               "shortDescription": "Creamy Dal Makhani served with your choice of rice or paranthas.",
               "price": 125,
               "costPrice": 250,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Paneer Makhani Chawal / Parantha (2 Pcs)",
               "slug": "paneer-makhani-chawal-parantha-2-pcs",
               "description": "Paneer Makhani is a rich and creamy dish made with paneer (Indian cottage cheese) simmered in a tomato-based gravy with butter and cream. It pairs wonderfully with steamed rice (Chawal) or soft, flaky paranthas.",
               "shortDescription": "Creamy Paneer Makhani served with your choice of rice or paranthas.",
               "price": 125,
               "costPrice": 250,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Chicken Makhani Chawal / Parantha (2 Pcs)",
               "slug": "chicken-makhani-chawal-parantha-2-pcs",
               "description": "Chicken Makhani, also known as Butter Chicken, is a popular dish made with tender chicken pieces cooked in a rich, buttery tomato-based gravy. It is served with steamed rice (Chawal) or soft paranthas, making for a delicious and satisfying meal.",
               "shortDescription": "Rich Chicken Makhani served with your choice of rice or paranthas.",
               "price": 145,
               "costPrice": 250,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Chicken Tikka Sandwich / With Cheese",
               "slug": "chicken-tikka-sandwich-with-cheese",
               "description": "A delicious sandwich filled with tender pieces of chicken tikka, marinated in spices and grilled to perfection. The sandwich is available in a plain version or with an added layer of cheese for a creamy, indulgent twist.",
               "shortDescription": "Grilled chicken tikka sandwich, available plain or with cheese.",
               "price": 285,
               "costPrice": 335,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Chicken Keema Sandwich / With Cheese",
               "slug": "chicken-keema-sandwich-with-cheese",
               "description": "This hearty sandwich is filled with spiced minced chicken (keema), offering a rich and flavorful experience. The cheese option adds a smooth, creamy texture to the already savory filling.",
               "shortDescription": "Spiced minced chicken sandwich, available plain or with cheese.",
               "price": 285,
               "costPrice": 335,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Vada Pav Classic / Schezwan (2 Pcs)",
               "slug": "vada-pav-classic-schezwan-2-pcs",
               "description": "A popular Indian street food, Vada Pav features a spicy potato fritter (vada) placed inside a soft bun (pav). The classic version is simple and flavorful, while the Schezwan version adds a fiery kick with Schezwan sauce.",
               "shortDescription": "Spicy potato fritter in a bun, available in classic or Schezwan style.",
               "price": 95,
               "costPrice": 125,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Keema Pav (2 Pcs)",
               "slug": "keema-pav-2-pcs",
               "description": "A hearty and flavorful dish where spiced minced chicken (keema) is served with soft pav buns. It's a popular snack or light meal, perfect for satisfying cravings.",
               "shortDescription": "Spiced minced chicken served with soft pav buns.",
               "price": 235,
               "costPrice": 250,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Bun Maska Classic / Grilled",
               "slug": "bun-maska-classic-grilled",
               "description": "A simple yet delicious snack, Bun Maska is a soft bun slathered with butter (maska). The classic version is served as is, while the grilled version adds a toasty, crisp texture.",
               "shortDescription": "Soft bun with butter, available in classic or grilled style.",
               "price": 75,
               "costPrice": 105,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Bun Jam Maska Classic / Grilled",
               "slug": "bun-jam-maska-classic-grilled",
               "description": "A sweet twist on the traditional Bun Maska, this version includes a layer of jam along with the butter. The classic version is served soft, while the grilled version adds a crispy texture.",
               "shortDescription": "Soft bun with butter and jam, available in classic or grilled style.",
               "price": 75,
               "costPrice": 105,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Bun Samosa Classic / Grilled / with Cheese",
               "slug": "bun-samosa-classic-grilled-with-cheese",
               "description": "This dish combines a crispy samosa stuffed inside a soft bun. The classic version is served as is, the grilled version adds a toasty texture, and the cheese option introduces a rich, creamy layer.",
               "shortDescription": "Crispy samosa in a bun, available in classic, grilled, or with cheese.",
               "price": 95,
               "costPrice": 145,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Bun Masala Aloo Grill Classic / with Cheese",
               "slug": "bun-masala-aloo-grill-classic-with-cheese",
               "description": "A flavorful sandwich featuring spiced mashed potatoes (masala aloo) grilled inside a soft bun. The classic version is simple and satisfying, while the cheese option adds a creamy, indulgent layer.",
               "shortDescription": "Spiced mashed potatoes in a grilled bun, available in classic or with cheese.",
               "price": 125,
               "costPrice": 145,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               "title": "Bun Peri Peri Paneer Grill Classic / with Cheese",
               "slug": "bun-peri-peri-paneer-grill-classic-with-cheese",
               "description": "A spicy and tangy sandwich featuring grilled paneer (Indian cottage cheese) coated in peri peri seasoning. The classic version is flavorful, while the cheese option adds an extra creamy layer.",
               "shortDescription": "Grilled peri peri paneer in a bun, available in classic or with cheese.",
               "price": 145,
               "costPrice": 165,
               "thumbnail": "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            }
         ],
         skipDuplicates: true, // Skip 'Bobo'
      })
      return c.json({ success: true, createMany }, 200)
   } catch (error) {
      console.log(error)
      return c.json({ success: false, error }, 500)
   }
})
demoRoute.post("/create-category", async c => {
   try {
      const createMany = await prisma.taxonomy.createMany({
         data: [
            {
               name: "Starters",
               slug: "starters",
               description: "A selection of simple yet delicious dishes to start your meal.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Main Dishes",
               slug: "main-dishes",
               description: "A selection of hearty and flavorful dishes to enjoy during your meal.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Deserts",
               slug: "desserts",
               description: "A selection of sweet and delicious dishes to enjoy after your meal.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Drinks",
               slug: "drinks",
               description: "A test category for demonstration purposes.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Beverages",
               slug: "beverages",
               description: "A selection of refreshing and healthy drinks to enjoy at your table.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Dessert Specials",
               slug: "dessert-specials",
               description: "A selection of desserts that are extraordinary and delicious.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Appetizers",
               slug: "appetizers",
               description: "A selection of small and fun dishes to enjoy before your meal.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Salads",
               slug: "salads",
               description: "A selection of hearty and flavorful salads to enjoy during your meal.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Side Dishes",
               slug: "side-dishes",
               description: "A selection of small and fun dishes to enjoy after your meal.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Beer",
               slug: "beer",
               description: "A selection of handcrafted beers to enjoy at your table.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Wine",
               slug: "wine",
               description: "A selection of handcrafted wines to enjoy at your table.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Cocktails",
               slug: "cocktails",
               description: "A selection of handcrafted cocktails to enjoy at your table.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Pizza",
               slug: "pizza",
               description: "A selection of handcrafted pizza to enjoy at your table.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            },
            {
               name: "Other",
               slug: "other",
               description: "A selection of other specialty dishes to enjoy at your table.",
               thumbnail: "27a3cf7f-efa5-4182-997e-4ea245a246ca.jpg"
            }
         ]
      })
      return c.json({ success: true, createMany }, 200)
   } catch (error) {
      return c.json({ success: false, error }, 500)
   }
})
export default demoRoute