import { db } from "@/db";
import { categories, products, coupons, settings, reviews, orderItems } from "@/db/schema";
import { sql, and, inArray, notInArray, isNotNull } from "drizzle-orm";

const img = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800`;

const seedCategories = [
  { name: "Dresses", slug: "dresses", description: "Elegant dresses for every occasion", image: img(27383810) },
  { name: "Jackets & Coats", slug: "jackets", description: "Outerwear that turns heads", image: img(35114789) },
  { name: "Tops & Tees", slug: "tops", description: "Everyday essentials", image: img(39457678) },
  { name: "Denim", slug: "denim", description: "Timeless denim styles", image: img(24287019) },
  { name: "Blazers", slug: "blazers", description: "Sharp tailoring", image: img(18718843) },
  { name: "Streetwear", slug: "streetwear", description: "Urban looks", image: img(5592267) },
];

const seedProducts = [
  // Dresses
  { name: "Ivory Satin Slip Dress", slug: "ivory-satin-slip-dress", cat: "dresses", price: "129.00", compare: "159.00", gender: "women", images: [img(27383810), img(30590675)], sizes: ["XS", "S", "M", "L"], colors: ["Ivory", "Black"], stock: 24, featured: true, tags: ["new", "bestseller"], description: "A fluid satin slip dress with a bias cut and adjustable straps. Finished with a delicate cowl neckline, this piece moves effortlessly from day to evening." },
  { name: "Cobalt Bodycon Midi Dress", slug: "cobalt-bodycon-midi-dress", cat: "dresses", price: "109.00", compare: null, gender: "women", images: [img(31046837), img(27677903)], sizes: ["XS", "S", "M", "L"], colors: ["Cobalt", "Black"], stock: 18, featured: true, tags: ["new"], description: "A sculpting stretch-crepe midi dress in vivid cobalt. Square neckline, hidden back zip and a flattering knee-length hem." },
  { name: "Noir Evening Dress", slug: "noir-evening-dress", cat: "dresses", price: "219.00", compare: null, gender: "women", images: [img(31301586), img(10119335)], sizes: ["XS", "S", "M", "L"], colors: ["Black"], stock: 5, featured: false, tags: ["limited"], description: "A floor-skimming black evening dress with a sweetheart neckline and softly draped skirt. Reserved for special nights." },
  { name: "Scarlet Gown", slug: "scarlet-gown", cat: "dresses", price: "249.00", compare: "299.00", gender: "women", images: [img(35661020)], sizes: ["XS", "S", "M", "L"], colors: ["Scarlet"], stock: 6, featured: false, tags: ["premium"], description: "A dramatic red gown in heavyweight satin with a corseted bodice and sweeping skirt." },
  // Jackets & coats
  { name: "Charcoal Wool Overcoat", slug: "charcoal-wool-overcoat", cat: "jackets", price: "289.00", compare: "349.00", gender: "women", images: [img(35114789), img(10447634)], sizes: ["XS", "S", "M", "L", "XL"], colors: ["Charcoal", "Camel"], stock: 10, featured: true, tags: ["bestseller"], description: "A long double-faced wool overcoat with notch lapels and a relaxed, straight silhouette. The coat you will wear every winter." },
  { name: "Black Longline Coat", slug: "black-longline-coat", cat: "jackets", price: "259.00", compare: null, gender: "women", images: [img(19354455)], sizes: ["XS", "S", "M", "L"], colors: ["Black"], stock: 9, featured: false, tags: ["new"], description: "A minimal black longline coat in a wool-cashmere blend, cut to layer over chunky knits." },
  { name: "Classic Leather Biker Jacket", slug: "classic-leather-biker-jacket", cat: "jackets", price: "329.00", compare: null, gender: "men", images: [img(11136467), img(31705700)], sizes: ["S", "M", "L", "XL"], colors: ["Black"], stock: 8, featured: true, tags: ["premium"], description: "Buttery soft lambskin leather biker with an asymmetric zip, belted hem and quilted lining. Ages beautifully." },
  { name: "Shearling Collar Aviator Jacket", slug: "shearling-collar-aviator-jacket", cat: "jackets", price: "279.00", compare: "319.00", gender: "men", images: [img(33287672)], sizes: ["S", "M", "L", "XL"], colors: ["Tan", "Dark Brown"], stock: 7, featured: true, tags: ["new"], description: "A rugged aviator jacket with a plush shearling collar and lining. Warm, structured and built for the city." },
  // Tops & tees
  { name: "Essential White Crew Tee", slug: "essential-white-crew-tee", cat: "tops", price: "29.00", compare: null, gender: "unisex", images: [img(39457678), img(20669538)], sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["White", "Black", "Navy"], stock: 80, featured: false, tags: ["essential"], description: "Heavyweight organic cotton crew-neck tee with a slightly oversized fit. Pre-shrunk and garment dyed." },
  { name: "Black Crew Neck Tee", slug: "black-crew-neck-tee", cat: "tops", price: "29.00", compare: null, gender: "women", images: [img(9558583), img(9558752)], sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "White"], stock: 60, featured: false, tags: ["essential"], description: "A perfectly cut black tee in soft combed cotton. Relaxed shoulders, clean neckline." },
  { name: "Blush Long Sleeve Tee", slug: "blush-long-sleeve-tee", cat: "tops", price: "39.00", compare: "49.00", gender: "unisex", images: [img(9558761)], sizes: ["S", "M", "L", "XL"], colors: ["Blush", "Sage"], stock: 35, featured: false, tags: ["new"], description: "A lightweight long-sleeve tee in a soft blush tone. Unisex fit, ribbed cuffs." },
  { name: "Sage Pocket Tee", slug: "sage-pocket-tee", cat: "tops", price: "34.00", compare: null, gender: "unisex", images: [img(9594692), img(8148577)], sizes: ["S", "M", "L", "XL"], colors: ["Sage", "Orange"], stock: 40, featured: false, tags: [], description: "A relaxed pocket tee in washed sage cotton jersey. Also available in burnt orange." },
  // Denim
  { name: "Classic Denim Trucker Jacket", slug: "classic-denim-trucker-jacket", cat: "denim", price: "99.00", compare: "120.00", gender: "women", images: [img(24287019), img(19110954)], sizes: ["XS", "S", "M", "L", "XL"], colors: ["Mid Wash", "Light Wash"], stock: 30, featured: true, tags: ["bestseller"], description: "The trucker jacket, perfected. 100% cotton denim with brass hardware and a slightly relaxed fit for layering." },
  { name: "Oversized Denim Jacket", slug: "oversized-denim-jacket", cat: "denim", price: "109.00", compare: null, gender: "women", images: [img(17200343), img(34470862)], sizes: ["XS", "S", "M", "L"], colors: ["Light Wash"], stock: 20, featured: false, tags: [], description: "Boxy, oversized fit in washed cotton denim with dropped shoulders. Wear it over everything." },
  { name: "Double Denim Set", slug: "double-denim-set", cat: "denim", price: "159.00", compare: null, gender: "unisex", images: [img(6769357)], sizes: ["S", "M", "L", "XL"], colors: ["Indigo"], stock: 14, featured: false, tags: ["new"], description: "Matching indigo denim jacket and straight-leg jeans. Buy the set, save on the pair." },
  { name: "Denim Jacket & Mini Skirt Set", slug: "denim-jacket-mini-skirt-set", cat: "denim", price: "129.00", compare: "149.00", gender: "women", images: [img(25947008), img(19738592)], sizes: ["XS", "S", "M", "L"], colors: ["Light Wash"], stock: 12, featured: true, tags: ["new"], description: "A cropped denim jacket paired with a matching high-rise mini skirt. Rigid cotton denim that softens with wear." },
  // Blazers
  { name: "Black Tailored Suit Set", slug: "black-tailored-suit-set", cat: "blazers", price: "199.00", compare: null, gender: "women", images: [img(18718843), img(32275954)], sizes: ["XS", "S", "M", "L"], colors: ["Black"], stock: 9, featured: true, tags: ["bestseller"], description: "Structured shoulders, a nipped waist and straight-leg trousers. The tailored set for boardrooms and after-hours." },
  { name: "Grey Relaxed Blazer Suit", slug: "grey-relaxed-blazer-suit", cat: "blazers", price: "189.00", compare: "229.00", gender: "women", images: [img(18054155), img(38224125)], sizes: ["XS", "S", "M", "L"], colors: ["Grey"], stock: 7, featured: false, tags: [], description: "An oversized single-breasted blazer and wide-leg trousers in a soft grey wool blend." },
  { name: "Powder Blue Blazer Set", slug: "powder-blue-blazer-set", cat: "blazers", price: "179.00", compare: null, gender: "women", images: [img(9168242), img(8368060)], sizes: ["XS", "S", "M", "L"], colors: ["Powder Blue"], stock: 8, featured: false, tags: ["new"], description: "A fresh take on tailoring in powder blue linen blend. Blazer and matching trousers." },
  // Streetwear
  { name: "Crimson Varsity Bomber", slug: "crimson-varsity-bomber", cat: "streetwear", price: "149.00", compare: "179.00", gender: "unisex", images: [img(15880475)], sizes: ["XS", "S", "M", "L", "XL"], colors: ["Crimson", "Black"], stock: 19, featured: true, tags: ["bestseller"], description: "A classic varsity bomber in crimson wool-blend with contrast ribbed trims and snap closure." },
  { name: "Layered Hoodie & Bomber Set", slug: "layered-hoodie-bomber-set", cat: "streetwear", price: "139.00", compare: null, gender: "men", images: [img(5592267), img(5592271)], sizes: ["S", "M", "L", "XL"], colors: ["Black", "Grey"], stock: 16, featured: false, tags: ["new"], description: "A heavyweight hoodie with a matching nylon bomber. The two-piece street uniform." },
  { name: "Navy Pullover Hoodie", slug: "navy-pullover-hoodie", cat: "streetwear", price: "69.00", compare: "89.00", gender: "men", images: [img(1002406), img(5592269)], sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Navy", "Black"], stock: 40, featured: false, tags: ["essential"], description: "A brushed-fleece pullover hoodie with a kangaroo pocket and ribbed hem. Everyday comfort." },
  { name: "Urban Utility Overshirt", slug: "urban-utility-overshirt", cat: "streetwear", price: "79.00", compare: null, gender: "men", images: [img(17459760), img(10326143)], sizes: ["S", "M", "L", "XL"], colors: ["Olive", "Stone"], stock: 22, featured: false, tags: [], description: "Cotton twill overshirt with utility pockets and a relaxed drop-shoulder cut." },
];

export async function seedIfEmpty() {
  const res = await db.execute<{ count: string }>(sql`select count(*)::text as count from products`);
  if (Number(res.rows[0]?.count ?? 0) > 0) return { seeded: false };

  const insertedCats = await db.insert(categories).values(seedCategories).returning();
  const catMap = new Map(insertedCats.map((c) => [c.slug, c.id]));

  const insertedProducts = await db
    .insert(products)
    .values(
      seedProducts.map((p) => ({
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compare,
        categoryId: catMap.get(p.cat) ?? null,
        images: p.images,
        sizes: p.sizes,
        colors: p.colors,
        stock: p.stock,
        featured: p.featured,
        gender: p.gender,
        tags: p.tags,
      }))
    )
    .returning();

  const reviewSamples = [
    { authorName: "Amelia R.", rating: 5, comment: "Fits perfectly and the fabric feels premium. Already ordered a second colour." },
    { authorName: "Jordan K.", rating: 4, comment: "Great quality. Runs slightly large so consider sizing down." },
    { authorName: "Priya S.", rating: 5, comment: "Exactly like the photos. Shipping was fast too!" },
  ];
  await db.insert(reviews).values(
    insertedProducts.slice(0, 10).flatMap((p, i) =>
      reviewSamples.slice(0, (i % 3) + 1).map((r) => ({ ...r, productId: p.id }))
    )
  );

  await db.insert(coupons).values([
    { code: "WELCOME10", type: "percent", value: "10", minOrder: "0" },
    { code: "SAVE20", type: "fixed", value: "20", minOrder: "150" },
  ]).onConflictDoNothing();

  await db.insert(settings).values([
    { key: "store_name", value: "VOGUE ATELIER" },
    { key: "announcement", value: "Free shipping on orders over $100 · Use code WELCOME10 for 10% off" },
    { key: "support_email", value: "hello@vogueatelier.com" },
  ]).onConflictDoNothing();

  return { seeded: true };
}

/** Re-apply seed images/names/categories to existing rows (used by the admin "Refresh demo images" action). */
export async function resyncSeedMedia() {
  for (const c of seedCategories) {
    await db.insert(categories).values(c).onConflictDoUpdate({ target: categories.slug, set: { image: c.image, name: c.name, description: c.description } });
  }
  const cats = await db.select().from(categories);
  const catMap = new Map(cats.map((c) => [c.slug, c.id]));
  for (const p of seedProducts) {
    await db
      .insert(products)
      .values({ name: p.name, slug: p.slug, description: p.description, price: p.price, compareAtPrice: p.compare, categoryId: catMap.get(p.cat) ?? null, images: p.images, sizes: p.sizes, colors: p.colors, stock: p.stock, featured: p.featured, gender: p.gender, tags: p.tags })
      .onConflictDoUpdate({ target: products.slug, set: { name: p.name, description: p.description, images: p.images, colors: p.colors, categoryId: catMap.get(p.cat) ?? null, gender: p.gender, featured: p.featured, tags: p.tags, updatedAt: new Date() } });
  }
  // Remove superseded demo products (old slugs) that were never ordered
  const oldSlugs = ["sepia-knit-coord-set", "shearling-collar-moto-jacket", "monochrome-tailored-set", "backless-denim-midi-dress", "checked-wool-blazer-dress", "heritage-checkered-coat", "noir-lace-evening-dress", "essential-red-crew-tee", "vintage-wash-denim-shirt-jacket", "tan-leather-biker-jacket", "city-layered-street-set", "suede-field-jacket", "crimson-bomber-jacket", "weekend-essentials-kit"];
  await db.delete(products).where(and(inArray(products.slug, oldSlugs), notInArray(products.id, db.select({ id: orderItems.productId }).from(orderItems).where(isNotNull(orderItems.productId)))));
  return { ok: true };
}
