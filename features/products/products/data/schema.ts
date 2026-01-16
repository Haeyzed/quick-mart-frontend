import { z } from 'zod'

// Variant schema
export const productVariantSchema = z.object({
  id: z.number(),
  variant_id: z.number(),
  variant_name: z.string().nullable(),
  item_code: z.string().nullable(),
  additional_cost: z.number(),
  additional_price: z.number(),
  qty: z.number(),
  position: z.number(),
})

// Brand schema - matches ProductResource (uses title, but API might return null if not loaded properly)
export const brandSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
})

// Category schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
})

// Unit schema - matches ProductResource (uses unit_name/unit_code, but API might return null if not loaded properly)
export const unitSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
})

// Tax schema
export const taxSchema = z.object({
  id: z.number(),
  name: z.string(),
  rate: z.number(),
}).passthrough()

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  type: z.enum(['standard', 'combo', 'digital', 'service']),
  slug: z.string().nullable(),
  barcode_symbology: z.string(),
  brand: brandSchema.nullable().optional(),
  brand_id: z.number().nullable(),
  category: categorySchema.nullable().optional(),
  category_id: z.number(),
  unit: unitSchema.nullable().optional(),
  unit_id: z.number().nullable(),
  purchase_unit_id: z.number().nullable(),
  sale_unit_id: z.number().nullable(),
  cost: z.number(),
  profit_margin: z.number().nullable(),
  profit_margin_type: z.enum(['percentage', 'flat']).nullable(),
  price: z.number(),
  wholesale_price: z.number().nullable(),
  qty: z.number().nullable(),
  alert_quantity: z.number().nullable(),
  daily_sale_objective: z.number().nullable(),
  promotion: z.boolean().nullable(),
  promotion_price: z.number().nullable(),
  starting_date: z.string().nullable(),
  last_date: z.string().nullable(),
  tax: taxSchema.nullable().optional(),
  tax_id: z.number().nullable(),
  tax_method: z.number().nullable(), // 0 = exclusive, 1 = inclusive
  image: z.array(z.string()).nullable(),
  image_url: z.array(z.string()).nullable(),
  file: z.string().nullable(),
  file_url: z.string().nullable(),
  is_embeded: z.boolean().nullable(),
  is_batch: z.boolean(),
  is_variant: z.boolean(),
  is_diff_price: z.boolean(),
  is_imei: z.boolean(),
  featured: z.boolean().nullable(),
  product_list: z.string().nullable(), // Comma-separated product IDs for combo
  variant_list: z.string().nullable(), // Comma-separated variant IDs for combo
  qty_list: z.string().nullable(), // Comma-separated quantities for combo
  price_list: z.string().nullable(), // Comma-separated prices for combo
  product_details: z.string().nullable(),
  short_description: z.string().nullable(),
  specification: z.string().nullable(),
  related_products: z.string().nullable(), // Comma-separated product IDs
  is_addon: z.boolean().nullable(),
  extras: z.string().nullable(), // Comma-separated addon IDs
  menu_type: z.union([z.string(), z.array(z.number())]).nullable(), // API returns string, form uses array
  variant_option: z.array(z.string()).nullable().optional(),
  variant_value: z.array(z.string()).nullable().optional(),
  is_active: z.boolean(),
  is_online: z.boolean().nullable(),
  kitchen_id: z.number().nullable(),
  in_stock: z.boolean().nullable(),
  track_inventory: z.boolean(),
  is_sync_disable: z.boolean().nullable(),
  woocommerce_product_id: z.number().nullable(),
  woocommerce_media_id: z.number().nullable(),
  tags: z.string().nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  warranty: z.number().nullable(),
  guarantee: z.number().nullable(),
  warranty_type: z.enum(['days', 'months', 'years']).nullable(),
  guarantee_type: z.enum(['days', 'months', 'years']).nullable(),
  wastage_percent: z.string().nullable(), // Comma-separated for combo products
  combo_unit_id: z.string().nullable(), // Comma-separated unit IDs for combo products
  production_cost: z.number().nullable(),
  is_recipe: z.boolean().nullable(),
  variants: z.array(productVariantSchema).nullable().optional(), // Optional when not loaded
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

// Form schema for creating/updating products
export const productFormSchema = productSchema.omit({
  id: true,
  slug: true,
  brand: true,
  category: true,
  unit: true,
  tax: true,
  image_url: true,
  file_url: true,
  variants: true,
  created_at: true,
  updated_at: true,
}).extend({
  prev_img: z.array(z.string()).optional(), // For existing images during update
})

export type Product = z.infer<typeof productSchema>
export type ProductVariant = z.infer<typeof productVariantSchema>

export const productListSchema = z.array(productSchema)

