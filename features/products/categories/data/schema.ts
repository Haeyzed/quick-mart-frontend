import { z } from 'zod'

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().nullable(),
  short_description: z.string().nullable(),
  page_title: z.string().nullable(),
  image: z.string().nullable(),
  image_url: z.string().nullable(),
  icon: z.string().nullable(),
  icon_url: z.string().nullable(),
  parent_id: z.number().nullable(),
  parent_name: z.string().nullable(),
  is_active: z.boolean(),
  featured: z.boolean(),
  is_sync_disable: z.boolean(),
  woocommerce_category_id: z.number().nullable(),
  is_root: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
})

export type Category = z.infer<typeof categorySchema>

export const categoryListSchema = z.array(categorySchema)

