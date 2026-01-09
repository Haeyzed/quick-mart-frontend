import { z } from 'zod'

export const brandSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().nullable(),
  short_description: z.string().nullable(),
  page_title: z.string().nullable(),
  image: z.string().nullable(),
  image_url: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type Brand = z.infer<typeof brandSchema>

export const brandListSchema = z.array(brandSchema)

