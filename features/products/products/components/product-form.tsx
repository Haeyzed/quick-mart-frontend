"use client"

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from '@/components/ui/file-upload'
import { useCreateProduct, useUpdateProduct, useProduct, useGenerateProductCode } from '../api/use-products'
import { useBrands } from '../../brands/api/use-brands'
import { useCategories } from '../../categories/api/use-categories'
import { useUnits } from '../../units/api/use-units'
import { useTaxes } from '../../../settings/tax/api/use-taxes'
import { useActiveWarehouses } from '../api/use-warehouses'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'
import { type Product } from '../data/schema'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ComboProductsTable } from './combo-products-table'
import { VariantSection } from './variant-section'
import { TagInput } from '@/components/tag-input'
import { DatePickerField } from '@/components/date-picker-field'
import { RelatedProducts } from './related-products'
import { BrandsActionDialog } from '../../brands/components/brands-action-dialog'
import { CategoriesActionDialog } from '../../categories/components/categories-action-dialog'
import { TaxesActionDialog } from '../../../settings/tax/components/tax-action-dialog'
import { UnitsActionDialog } from '../../units/components/units-action-dialog'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

// Form schema - simplified for now, will expand
const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  code: z.string().min(1, 'Code is required').max(255, 'Code is too long'),
  type: z.enum(['standard', 'combo', 'digital', 'service']),
  barcode_symbology: z.string().optional(),
  brand_id: z.number().nullable().optional(),
  category_id: z.number().min(1, 'Category is required'),
  unit_id: z.number().min(1, 'Unit is required').optional(),
  purchase_unit_id: z.number().nullable().optional(),
  sale_unit_id: z.number().nullable().optional(),
  cost: z.number().min(0, 'Cost must be positive').optional(),
  profit_margin: z.number().min(0).optional(),
  profit_margin_type: z.enum(['percentage', 'flat']).optional(),
  price: z.number().min(0, 'Price must be positive'),
  wholesale_price: z.number().min(0).optional(),
  alert_quantity: z.number().min(0).optional(),
  daily_sale_objective: z.number().min(0).optional(),
  promotion: z.boolean().optional(),
  promotion_price: z.number().min(0).optional(),
  starting_date: z.string().optional(),
  last_date: z.string().optional(),
  tax_id: z.number().nullable().optional(),
  tax_method: z.number().optional(),
  image: z.array(z.custom<File>()).optional(),
  prev_img: z.array(z.string()).optional(), // For existing images during update
  file: z.custom<File>().optional(),
  is_embeded: z.boolean().optional(),
  is_batch: z.boolean().optional(),
  is_variant: z.boolean().optional(),
  is_diffPrice: z.boolean().optional(),
  is_imei: z.boolean().optional(),
  featured: z.boolean().optional(),
  product_details: z.string().optional(),
  short_description: z.string().optional(),
  specification: z.string().optional(),
  related_products: z.string().optional(),
  is_addon: z.boolean().optional(),
  extras: z.string().optional(),
  menu_type: z.array(z.number()).optional(),
  is_active: z.boolean().optional(),
  is_online: z.boolean().optional(),
  kitchen_id: z.number().nullable().optional(),
  in_stock: z.boolean().optional(),
  track_inventory: z.boolean().optional(),
  is_sync_disable: z.boolean().optional(),
  tags: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  warranty: z.number().min(0).optional(),
  guarantee: z.number().min(0).optional(),
  warranty_type: z.enum(['days', 'months', 'years']).optional(),
  guarantee_type: z.enum(['days', 'months', 'years']).optional(),
  production_cost: z.number().min(0).optional(),
  is_recipe: z.boolean().optional(),
  // Initial stock
  is_initial_stock: z.boolean().optional(),
  stock_warehouse_id: z.array(z.number()).optional(),
  stock: z.array(z.number()).optional(),
  // Variants
  variant_option: z.array(z.string()).optional(),
  variant_value: z.array(z.string()).optional(),
  variant_name: z.array(z.string()).optional(),
  item_code: z.array(z.string()).optional(),
  additional_cost: z.array(z.number()).optional(),
  additional_price: z.array(z.number()).optional(),
  // Differential pricing
  warehouse_id: z.array(z.number()).optional(),
  diff_price: z.array(z.number()).optional(),
  // Combo products
  product_id: z.array(z.number()).optional(),
  product_qty: z.array(z.number()).optional(),
  unit_price: z.array(z.number()).optional(),
  wastage_percent: z.string().optional(),
  combo_unit_id: z.string().optional(),
}).refine((data) => {
  // If cost is required for standard products
  if (data.type === 'standard' && data.cost === undefined) {
    return false
  }
  return true
}, {
  message: 'Cost is required for standard products',
  path: ['cost'],
})

type ProductFormProps = {
  productId?: number
  onSuccess?: () => void
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!productId
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const generateCode = useGenerateProductCode()
  
  // Dialog states
  const [brandDialogOpen, setBrandDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [taxDialogOpen, setTaxDialogOpen] = useState(false)
  const [unitDialogOpen, setUnitDialogOpen] = useState(false)
  
  // Only fetch product if editing
  const productQuery = useProduct(isEdit && productId ? productId : 0)
  const product = isEdit ? productQuery.data : undefined
  const isLoadingProduct = isEdit ? productQuery.isLoading : false

  // Fetch dropdown data
  const brandsQuery = useBrands({ is_active: true, per_page: 100, page: 1 })
  const categoriesQuery = useCategories({ is_active: true, per_page: 100, page: 1 })
  const unitsQuery = useUnits({ is_active: true, per_page: 100, page: 1 })
  const taxesQuery = useTaxes({ is_active: true, per_page: 100, page: 1 })
  const { data: warehouses = [] } = useActiveWarehouses()

  const brands = brandsQuery.data?.data || []
  const categories = categoriesQuery.data?.data || []
  const units = unitsQuery.data?.data || []
  const taxes = taxesQuery.data?.data || []

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      code: '',
      type: 'standard',
      barcode_symbology: 'EAN13',
      brand_id: null,
      category_id: 0,
      unit_id: undefined,
      purchase_unit_id: null,
      sale_unit_id: null,
      cost: 0,
      profit_margin: 0,
            profit_margin_type: 'percentage' as const,
      price: 0,
      wholesale_price: undefined,
      alert_quantity: undefined,
      daily_sale_objective: undefined,
      promotion: false,
      promotion_price: undefined,
      starting_date: undefined,
      last_date: undefined,
      tax_id: null,
      tax_method: 0,
      image: [],
      prev_img: [],
      file: undefined,
      is_embeded: false,
      is_batch: false,
      is_variant: false,
      is_diffPrice: false,
      is_imei: false,
      featured: false,
      product_details: undefined,
      short_description: undefined,
      specification: undefined,
      related_products: undefined,
      is_addon: false,
      extras: undefined,
      menu_type: [],
      is_active: true,
      is_online: false,
      kitchen_id: null,
      in_stock: false,
      track_inventory: true,
      is_sync_disable: false,
      tags: undefined,
      meta_title: undefined,
      meta_description: undefined,
      warranty: undefined,
      guarantee: undefined,
      warranty_type: 'months',
      guarantee_type: 'months',
      production_cost: undefined,
      is_recipe: false,
      is_initial_stock: false,
      stock_warehouse_id: [],
      stock: [],
      variant_option: [],
      variant_value: [],
      variant_name: [],
      item_code: [],
      additional_cost: [],
      additional_price: [],
      warehouse_id: [],
      diff_price: [],
      product_id: [],
      product_qty: [],
      unit_price: [],
      wastage_percent: undefined,
      combo_unit_id: undefined,
    },
  })

  const selectedUnitId = form.watch('unit_id')

  // Load product data when editing
  useEffect(() => {
    if (isEdit && product) {
      form.reset({
        name: product.name,
        code: product.code,
        type: product.type,
        barcode_symbology: product.barcode_symbology || 'EAN13',
        brand_id: product.brand_id,
        category_id: product.category_id,
        unit_id: product.unit_id || undefined,
        purchase_unit_id: product.purchase_unit_id,
        sale_unit_id: product.sale_unit_id,
        cost: product.cost,
        profit_margin: product.profit_margin || 0,
        profit_margin_type: (product.profit_margin_type as 'percentage' | 'flat') || 'percentage',
        price: product.price,
        wholesale_price: product.wholesale_price || undefined,
        alert_quantity: product.alert_quantity || undefined,
        daily_sale_objective: product.daily_sale_objective || undefined,
        promotion: product.promotion || false,
        promotion_price: product.promotion_price || undefined,
        starting_date: product.starting_date || undefined,
        last_date: product.last_date || undefined,
        tax_id: product.tax_id,
        tax_method: product.tax_method || 0,
        image: [],
        prev_img: product.image || [],
        file: undefined,
        is_embeded: product.is_embeded || false,
        is_batch: product.is_batch,
        is_variant: product.is_variant,
        is_diffPrice: product.is_diffPrice,
        is_imei: product.is_imei,
        featured: product.featured || false,
        product_details: product.product_details || undefined,
        short_description: product.short_description || undefined,
        specification: product.specification || undefined,
        related_products: product.related_products || undefined,
        is_addon: product.is_addon || false,
        extras: product.extras || undefined,
        menu_type: product.menu_type || [],
        is_active: product.is_active,
        is_online: product.is_online || false,
        kitchen_id: product.kitchen_id,
        in_stock: product.in_stock || false,
        track_inventory: product.track_inventory,
        is_sync_disable: product.is_sync_disable || false,
        tags: product.tags || undefined,
        meta_title: product.meta_title || undefined,
        meta_description: product.meta_description || undefined,
        warranty: product.warranty || undefined,
        guarantee: product.guarantee || undefined,
        warranty_type: (product.warranty_type as 'days' | 'months' | 'years') || 'months',
        guarantee_type: (product.guarantee_type as 'days' | 'months' | 'years') || 'months',
        production_cost: product.production_cost || undefined,
        is_recipe: product.is_recipe || false,
        is_initial_stock: false,
        stock_warehouse_id: [],
        stock: [],
        variant_option: product.variant_option || [],
        variant_value: product.variant_value || [],
        variant_name: (product as any).variant_name || [],
        item_code: (product as any).item_code || [],
        additional_cost: (product as any).additional_cost || [],
        additional_price: (product as any).additional_price || [],
        warehouse_id: (product as any).warehouse_id || [],
        diff_price: (product as any).diff_price || [],
        product_id: (product as any).product_id || [],
        product_qty: (product as any).product_qty || [],
        unit_price: (product as any).unit_price || [],
        wastage_percent: product.wastage_percent || undefined,
        combo_unit_id: product.combo_unit_id || undefined,
      })
    }
  }, [isEdit, product, form])

  const onSubmit = async (data: z.infer<typeof productFormSchema>) => {
    try {
      const formData = new FormData()

      // Append all form fields
      formData.append('name', data.name)
      formData.append('code', data.code)
      formData.append('type', data.type)
      if (data.barcode_symbology) formData.append('barcode_symbology', data.barcode_symbology)
      if (data.brand_id) formData.append('brand_id', data.brand_id.toString())
      formData.append('category_id', data.category_id.toString())
      if (data.unit_id) formData.append('unit_id', data.unit_id.toString())
      if (data.purchase_unit_id) formData.append('purchase_unit_id', data.purchase_unit_id.toString())
      if (data.sale_unit_id) formData.append('sale_unit_id', data.sale_unit_id.toString())
      if (data.cost !== undefined) formData.append('cost', data.cost.toString())
      if (data.profit_margin !== undefined) formData.append('profit_margin', data.profit_margin.toString())
      if (data.profit_margin_type) formData.append('profit_margin_type', data.profit_margin_type)
      formData.append('price', data.price.toString())
      if (data.wholesale_price !== undefined) formData.append('wholesale_price', data.wholesale_price.toString())
      if (data.alert_quantity !== undefined) formData.append('alert_quantity', data.alert_quantity.toString())
      if (data.daily_sale_objective !== undefined) formData.append('daily_sale_objective', data.daily_sale_objective.toString())
      if (data.promotion) formData.append('promotion', '1')
      if (data.promotion_price !== undefined) formData.append('promotion_price', data.promotion_price.toString())
      if (data.starting_date) formData.append('starting_date', data.starting_date)
      if (data.last_date) formData.append('last_date', data.last_date)
      if (data.tax_id) formData.append('tax_id', data.tax_id.toString())
      if (data.tax_method !== undefined) formData.append('tax_method', data.tax_method.toString())

      // Handle images
      if (data.image && data.image.length > 0) {
        data.image.forEach((file) => {
          formData.append('image[]', file)
        })
      }
      if (isEdit && data.prev_img && data.prev_img.length > 0) {
        data.prev_img.forEach((img) => {
          formData.append('prev_img[]', img)
        })
      }

      // Handle file
      if (data.file) {
        formData.append('file', data.file)
      }

      // Handle boolean fields
      if (data.is_embeded) formData.append('is_embeded', '1')
      if (data.is_batch) formData.append('is_batch', '1')
      if (data.is_variant) formData.append('is_variant', '1')
      if (data.is_diffPrice) formData.append('is_diffPrice', '1')
      if (data.is_imei) formData.append('is_imei', '1')
      if (data.featured) formData.append('featured', '1')
      if (data.is_addon) formData.append('is_addon', '1')
      if (data.is_active) formData.append('is_active', '1')
      if (data.is_online) formData.append('is_online', '1')
      if (data.in_stock) formData.append('in_stock', '1')
      if (data.track_inventory) formData.append('track_inventory', '1')
      if (data.is_sync_disable) formData.append('is_sync_disable', '1')
      if (data.is_recipe) formData.append('is_recipe', '1')
      if (data.is_initial_stock) formData.append('is_initial_stock', '1')

      // Handle text fields
      if (data.product_details) formData.append('product_details', data.product_details)
      if (data.short_description) formData.append('short_description', data.short_description)
      if (data.specification) formData.append('specification', data.specification)
      if (data.related_products) formData.append('related_products', data.related_products)
      if (data.extras) formData.append('extras', data.extras)
      if (data.tags) formData.append('tags', data.tags)
      if (data.meta_title) formData.append('meta_title', data.meta_title)
      if (data.meta_description) formData.append('meta_description', data.meta_description)
      if (data.warranty !== undefined) formData.append('warranty', data.warranty.toString())
      if (data.guarantee !== undefined) formData.append('guarantee', data.guarantee.toString())
      if (data.warranty_type) formData.append('warranty_type', data.warranty_type)
      if (data.guarantee_type) formData.append('guarantee_type', data.guarantee_type)
      if (data.production_cost !== undefined) formData.append('production_cost', data.production_cost.toString())
      if (data.wastage_percent) formData.append('wastage_percent', data.wastage_percent)
      if (data.combo_unit_id) formData.append('combo_unit_id', data.combo_unit_id)

      // Handle arrays
      if (data.menu_type && Array.isArray(data.menu_type) && data.menu_type.length > 0) {
        data.menu_type.forEach((id) => {
          formData.append('menu_type[]', id.toString())
        })
      }
      if (data.stock_warehouse_id && data.stock_warehouse_id.length > 0) {
        data.stock_warehouse_id.forEach((id) => {
          formData.append('stock_warehouse_id[]', id.toString())
        })
      }
      if (data.stock && data.stock.length > 0) {
        data.stock.forEach((qty) => {
          formData.append('stock[]', qty.toString())
        })
      }
      if (data.variant_option && data.variant_option.length > 0) {
        data.variant_option.forEach((option) => {
          formData.append('variant_option[]', option)
        })
      }
      if (data.variant_value && data.variant_value.length > 0) {
        data.variant_value.forEach((value) => {
          formData.append('variant_value[]', value)
        })
      }
      if (data.variant_name && data.variant_name.length > 0) {
        data.variant_name.forEach((name) => {
          formData.append('variant_name[]', name)
        })
      }
      if (data.item_code && data.item_code.length > 0) {
        data.item_code.forEach((code) => {
          formData.append('item_code[]', code)
        })
      }
      if (data.additional_cost && data.additional_cost.length > 0) {
        data.additional_cost.forEach((cost) => {
          formData.append('additional_cost[]', cost.toString())
        })
      }
      if (data.additional_price && data.additional_price.length > 0) {
        data.additional_price.forEach((price) => {
          formData.append('additional_price[]', price.toString())
        })
      }
      if (data.warehouse_id && data.warehouse_id.length > 0) {
        data.warehouse_id.forEach((id) => {
          formData.append('warehouse_id[]', id.toString())
        })
      }
      if (data.diff_price && data.diff_price.length > 0) {
        data.diff_price.forEach((price) => {
          formData.append('diff_price[]', price.toString())
        })
      }
      if (data.product_id && data.product_id.length > 0) {
        data.product_id.forEach((id) => {
          formData.append('product_id[]', id.toString())
        })
      }
      if (data.product_qty && data.product_qty.length > 0) {
        data.product_qty.forEach((qty) => {
          formData.append('product_qty[]', qty.toString())
        })
      }
      if (data.unit_price && data.unit_price.length > 0) {
        data.unit_price.forEach((price) => {
          formData.append('unit_price[]', price.toString())
        })
      }
      if (data.kitchen_id) formData.append('kitchen_id', data.kitchen_id.toString())

      if (isEdit && productId) {
        await updateProduct.mutateAsync({ id: productId, data: formData })
      } else {
        await createProduct.mutateAsync(formData)
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/products')
      }
    } catch (error) {
      handleApiError(error)
    }
  }

  if (isEdit && isLoadingProduct) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Spinner />
      </div>
    )
  }

  const productType = form.watch('type')

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
      <FieldGroup>
        {/* Row 1: Product Type, Product Name, Product Code */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Field>
            <FieldLabel>
              Product Type <span className='text-destructive'>*</span>
            </FieldLabel>
            <Controller
              control={form.control}
              name='type'
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select product type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='standard'>Standard</SelectItem>
                    <SelectItem value='combo'>Combo</SelectItem>
                    <SelectItem value='digital'>Digital</SelectItem>
                    <SelectItem value='service'>Service</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{form.formState.errors.type?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>
              Product Name <span className='text-destructive'>*</span>
            </FieldLabel>
            <Input {...form.register('name')} placeholder='Enter product name' />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>
              Product Code <span className='text-destructive'>*</span>
            </FieldLabel>
            <div className='flex gap-2'>
              <Input {...form.register('code')} placeholder='Enter product code' />
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={async () => {
                  try {
                    const { data: code } = await generateCode.refetch()
                    if (code) {
                      form.setValue('code', code)
                      toast.success('Code generated successfully')
                    }
                  } catch (error) {
                    handleApiError(error)
                  }
                }}
                disabled={generateCode.isFetching}
              >
                {generateCode.isFetching ? <Spinner className='h-4 w-4' /> : '⟳'}
              </Button>
            </div>
            <FieldError>{form.formState.errors.code?.message}</FieldError>
          </Field>
        </div>

        {/* Row 2: Barcode Symbology, Digital File (conditional), Brand, Category */}
        <div className={`grid grid-cols-1 gap-4 ${productType === 'digital' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          <Field>
            <FieldLabel>Barcode Symbology</FieldLabel>
            <Controller
              control={form.control}
              name='barcode_symbology'
              render={({ field }) => (
                <Select value={field.value || 'EAN13'} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='C128'>Code 128</SelectItem>
                    <SelectItem value='C39'>Code 39</SelectItem>
                    <SelectItem value='UPCA'>UPC-A</SelectItem>
                    <SelectItem value='UPCE'>UPC-E</SelectItem>
                    <SelectItem value='EAN8'>EAN-8</SelectItem>
                    <SelectItem value='EAN13'>EAN-13</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{form.formState.errors.barcode_symbology?.message}</FieldError>
          </Field>

          {/* Digital File Upload - Only for digital type, appears in Row 2 */}
          {productType === 'digital' && (
            <Field>
              <FieldLabel>
                Attach File <span className='text-destructive'>*</span>
              </FieldLabel>
              <Controller
                control={form.control}
                name='file'
                render={({ field: { onChange, value, ...field } }) => (
                  <FileUpload
                    {...field}
                    accept='*/*'
                    value={value ? [value] : []}
                    onValueChange={(files) => onChange(files[0] || undefined)}
                    maxFiles={1}
                  >
                    <FileUploadDropzone className='flex-row flex-wrap border-dotted text-center'>
                      Drag and drop or
                      <FileUploadTrigger asChild>
                        <Button type='button' variant='link' size='sm' className='p-0'>
                          choose file
                        </Button>
                      </FileUploadTrigger>
                      to upload
                    </FileUploadDropzone>
                    <FileUploadList>
                      {value && (
                        <FileUploadItem key={value.name} value={value}>
                          <FileUploadItemPreview />
                          <FileUploadItemMetadata />
                          <FileUploadItemDelete asChild>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='size-7'
                            >
                              ×
                              <span className='sr-only'>Delete</span>
                            </Button>
                          </FileUploadItemDelete>
                        </FileUploadItem>
                      )}
                    </FileUploadList>
                  </FileUpload>
                )}
              />
              <FieldError>{form.formState.errors.file?.message}</FieldError>
            </Field>
          )}

          <Field>
            <FieldLabel>Brand</FieldLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <Controller
                  control={form.control}
                  name='brand_id'
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => {
                        field.onChange(value ? Number(value) : null)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select brand (optional)' />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setBrandDialogOpen(true)}
                title="Add new brand"
              >
                <HugeiconsIcon icon={Plus} className="h-4 w-4" />
              </Button>
            </div>
            <FieldError>{form.formState.errors.brand_id?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>
              Category <span className='text-destructive'>*</span>
            </FieldLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <Controller
                  control={form.control}
                  name='category_id'
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ''}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select category (required)' />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCategoryDialogOpen(true)}
                title="Add new category"
              >
                <HugeiconsIcon icon={Plus} className="h-4 w-4" />
              </Button>
            </div>
            <FieldError>{form.formState.errors.category_id?.message}</FieldError>
          </Field>
        </div>

        {/* Pricing & Units - Only for standard, combo, service */}
        {(productType === 'standard' || productType === 'combo' || productType === 'service') && (
          <>
            {productType !== 'combo' && (
              <>
                {/* Row 3: Product Unit, Sale Unit, Purchase Unit */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <Field>
                    <FieldLabel>
                      Product Unit <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Controller
                          control={form.control}
                          name='unit_id'
                          render={({ field }) => (
                            <Select
                              value={field.value?.toString() || ''}
                              onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select unit' />
                              </SelectTrigger>
                              <SelectContent>
                                {units
                                  .filter((u) => !u.base_unit) // Only show base units (base_unit is null)
                                  .map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                      {unit.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setUnitDialogOpen(true)}
                        title="Add new unit"
                      >
                        <HugeiconsIcon icon={Plus} className="h-4 w-4" />
                      </Button>
                    </div>
                    <FieldError>{form.formState.errors.unit_id?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel>Sale Unit</FieldLabel>
                    <Controller
                      control={form.control}
                      name='sale_unit_id'
                      render={({ field }) => (
                        <Select
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={(value) => {
                            field.onChange(value ? Number(value) : null)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select sale unit (optional)' />
                          </SelectTrigger>
                          <SelectContent>
                            {units
                              .filter((u) => !selectedUnitId || u.base_unit === selectedUnitId || u.id === selectedUnitId)
                              .map((unit) => (
                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                  {unit.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError>{form.formState.errors.sale_unit_id?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel>Purchase Unit</FieldLabel>
                    <Controller
                      control={form.control}
                      name='purchase_unit_id'
                      render={({ field }) => (
                        <Select
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={(value) => {
                            field.onChange(value ? Number(value) : null)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select purchase unit (optional)' />
                          </SelectTrigger>
                          <SelectContent>
                            {units
                              .filter((u) => !selectedUnitId || u.base_unit === selectedUnitId || u.id === selectedUnitId)
                              .map((unit) => (
                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                  {unit.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError>{form.formState.errors.purchase_unit_id?.message}</FieldError>
                  </Field>
                </div>

                  {/* Cost and Profit Margin */}
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {productType === 'standard' && (
                      <>
                        <Field>
                          <FieldLabel>
                            Cost <span className='text-destructive'>*</span>
                          </FieldLabel>
                          <Input
                            type='number'
                            step='0.01'
                            {...form.register('cost', { valueAsNumber: true })}
                            placeholder='0.00'
                          />
                          <FieldError>{form.formState.errors.cost?.message}</FieldError>
                        </Field>

                        <Field>
                          <FieldLabel>Profit Margin Type</FieldLabel>
                          <Controller
                            control={form.control}
                            name='profit_margin_type'
                            render={({ field }) => (
                              <Select value={field.value || 'percentage'} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='percentage'>Percentage (%)</SelectItem>
                                  <SelectItem value='flat'>Flat</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          <FieldError>{form.formState.errors.profit_margin_type?.message}</FieldError>
                        </Field>

                        <Field>
                          <FieldLabel>Profit Margin</FieldLabel>
                          <Input
                            type='number'
                            step='0.01'
                            {...form.register('profit_margin', { valueAsNumber: true })}
                            placeholder='0.00'
                          />
                          <FieldError>{form.formState.errors.profit_margin?.message}</FieldError>
                        </Field>
                      </>
                    )}
                  </div>

                {/* Row 5: Price, Wholesale Price, Daily Sale Objective */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <Field>
                    <FieldLabel>
                      Price <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <Input
                      type='number'
                      step='0.01'
                      {...form.register('price', { valueAsNumber: true })}
                      placeholder='0.00'
                    />
                    <FieldError>{form.formState.errors.price?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel>Wholesale Price</FieldLabel>
                    <Input
                      type='number'
                      step='0.01'
                      {...form.register('wholesale_price', { valueAsNumber: true })}
                      placeholder='0.00'
                    />
                    <FieldError>{form.formState.errors.wholesale_price?.message}</FieldError>
                  </Field>

                  {productType === 'standard' && (
                    <Field>
                      <FieldLabel>Daily Sale Objective</FieldLabel>
                      <Input
                        type='number'
                        step='0.01'
                        {...form.register('daily_sale_objective', { valueAsNumber: true })}
                        placeholder='0.00'
                      />
                      <FieldDescription>Minimum quantity to sell per day</FieldDescription>
                      <FieldError>{form.formState.errors.daily_sale_objective?.message}</FieldError>
                    </Field>
                  )}
                </div>

                {/* Row 6: Alert Quantity, Tax, Tax Method */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  {productType === 'standard' && (
                    <Field>
                      <FieldLabel>Alert Quantity</FieldLabel>
                      <Input
                        type='number'
                        step='0.01'
                        {...form.register('alert_quantity', { valueAsNumber: true })}
                        placeholder='0.00'
                      />
                      <FieldDescription>Low stock alert threshold</FieldDescription>
                      <FieldError>{form.formState.errors.alert_quantity?.message}</FieldError>
                    </Field>
                  )}

                  <Field>
                    <FieldLabel>Tax</FieldLabel>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Controller
                          control={form.control}
                          name='tax_id'
                          render={({ field }) => (
                            <Select
                              value={field.value ? String(field.value) : undefined}
                              onValueChange={(value) => {
                                field.onChange(value ? Number(value) : null)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select tax (optional)' />
                              </SelectTrigger>
                              <SelectContent>
                                {taxes.map((tax) => (
                                  <SelectItem key={tax.id} value={tax.id.toString()}>
                                    {tax.name} ({tax.rate}%)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setTaxDialogOpen(true)}
                        title="Add new tax"
                      >
                        <HugeiconsIcon icon={Plus} className="h-4 w-4" />
                      </Button>
                    </div>
                    <FieldError>{form.formState.errors.tax_id?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel>Tax Method</FieldLabel>
                    <Controller
                      control={form.control}
                      name='tax_method'
                      render={({ field }) => (
                        <Select
                          value={field.value?.toString() || '0'}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='0'>Exclusive</SelectItem>
                            <SelectItem value='1'>Inclusive</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError>{form.formState.errors.tax_method?.message}</FieldError>
                  </Field>
                </div>
                </>
              )}
          </>
        )}

        {/* Promotional Pricing */}
            <Field>
              <div className='flex items-center justify-between'>
                <div>
                  <FieldLabel>Enable Promotion</FieldLabel>
                  <FieldDescription>Add promotional pricing for this product</FieldDescription>
                </div>
                <Controller
                  control={form.control}
                  name='promotion'
                  render={({ field }) => (
                    <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </Field>

            {form.watch('promotion') && (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <Field>
                  <FieldLabel>Promotional Price</FieldLabel>
                  <Input
                    type='number'
                    step='0.01'
                    {...form.register('promotion_price', { valueAsNumber: true })}
                    placeholder='0.00'
                  />
                  <FieldError>{form.formState.errors.promotion_price?.message}</FieldError>
                </Field>

                <DatePickerField
                  label="Start Date"
                  value={form.watch('starting_date')}
                  onChange={(value) => form.setValue('starting_date', value)}
                  error={form.formState.errors.starting_date?.message}
                />

                <DatePickerField
                  label="End Date"
                  value={form.watch('last_date')}
                  onChange={(value) => form.setValue('last_date', value)}
                  error={form.formState.errors.last_date?.message}
                />
              </div>
            )}

        {/* Warranty & Guarantee */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='grid grid-cols-2 gap-2'>
                <Field>
                  <FieldLabel>Warranty</FieldLabel>
                  <Input
                    type='number'
                    min='0'
                    {...form.register('warranty', { valueAsNumber: true })}
                    placeholder='0'
                  />
                  <FieldError>{form.formState.errors.warranty?.message}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Controller
                    control={form.control}
                    name='warranty_type'
                    render={({ field }) => (
                      <Select value={field.value || 'months'} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='days'>Days</SelectItem>
                          <SelectItem value='months'>Months</SelectItem>
                          <SelectItem value='years'>Years</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError>{form.formState.errors.warranty_type?.message}</FieldError>
                </Field>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <Field>
                  <FieldLabel>Guarantee</FieldLabel>
                  <Input
                    type='number'
                    min='0'
                    {...form.register('guarantee', { valueAsNumber: true })}
                    placeholder='0'
                  />
                  <FieldError>{form.formState.errors.guarantee?.message}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Controller
                    control={form.control}
                    name='guarantee_type'
                    render={({ field }) => (
                      <Select value={field.value || 'months'} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='days'>Days</SelectItem>
                          <SelectItem value='months'>Months</SelectItem>
                          <SelectItem value='years'>Years</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError>{form.formState.errors.guarantee_type?.message}</FieldError>
                </Field>
              </div>
            </div>


        {/* Images */}
          <Field>
            <FieldLabel>Images</FieldLabel>
            <Controller
              control={form.control}
              name='image'
              render={({ field: { onChange, value = [], ...field } }) => (
                <FileUpload
                  {...field}
                  accept='image/*'
                  value={value}
                  onValueChange={onChange}
                >
                  <FileUploadDropzone className='flex-row flex-wrap border-dotted text-center'>
                    Drag and drop or
                    <FileUploadTrigger asChild>
                      <Button type='button' variant='link' size='sm' className='p-0'>
                        choose files
                      </Button>
                    </FileUploadTrigger>
                    to upload
                  </FileUploadDropzone>
                  <FileUploadList>
                    {value.map((file, index) => (
                      <FileUploadItem key={index} value={file}>
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='size-7'
                          >
                            ×
                            <span className='sr-only'>Delete</span>
                          </Button>
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                </FileUpload>
              )}
            />
            {isEdit && form.watch('prev_img') && form.watch('prev_img')!.length > 0 && (
              <div className='mt-4 flex gap-2'>
                {form.watch('prev_img')!.map((img, index) => (
                  <div key={index} className='relative'>
                    <img src={img} alt={`Product ${index + 1}`} className='h-20 w-20 rounded object-cover' />
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      className='absolute -right-2 -top-2 h-6 w-6 rounded-full p-0'
                      onClick={() => {
                        const current = form.getValues('prev_img') || []
                        form.setValue(
                          'prev_img',
                          current.filter((_, i) => i !== index)
                        )
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <FieldError>{form.formState.errors.image?.message}</FieldError>
          </Field>

        {/* Additional Options */}
            <Field>
              <div className='flex items-center justify-between'>
                <div>
                  <FieldLabel>Active</FieldLabel>
                  <FieldDescription>Product will be visible and available</FieldDescription>
                </div>
                <Controller
                  control={form.control}
                  name='is_active'
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </Field>

            <Field>
              <div className='flex items-center justify-between'>
                <div>
                  <FieldLabel>Featured</FieldLabel>
                  <FieldDescription>Featured products will be displayed in POS</FieldDescription>
                </div>
                <Controller
                  control={form.control}
                  name='featured'
                  render={({ field }) => (
                    <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </Field>

            {productType === 'standard' && (
              <>
                <Field>
                  <div className='flex items-center justify-between'>
                    <div>
                      <FieldLabel>Has Variants</FieldLabel>
                      <FieldDescription>This product has variants (size, color, etc.)</FieldDescription>
                    </div>
                    <Controller
                      control={form.control}
                      name='is_variant'
                      render={({ field }) => (
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                </Field>

                {/* Variant Section - Only for standard products with variants enabled */}
                {productType === 'standard' && form.watch('is_variant') && (
                  <VariantSection
                    control={form.control as any}
                    watch={form.watch as any}
                    setValue={form.setValue as any}
                    productCode={form.watch('code') || ''}
                  />
                )}

                <Field>
                  <div className='flex items-center justify-between'>
                    <div>
                      <FieldLabel>This is Topping</FieldLabel>
                      <FieldDescription>Check this if the item is a topping or extra or add-on only to be served with a main course</FieldDescription>
                    </div>
                    <Controller
                      control={form.control}
                      name='is_addon'
                      render={({ field }) => (
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                </Field>

                <Field>
                  <div className='flex items-center justify-between'>
                    <div>
                      <FieldLabel>Has Batch/Expiry</FieldLabel>
                      <FieldDescription>This product has batch and expiry dates</FieldDescription>
                    </div>
                    <Controller
                      control={form.control}
                      name='is_batch'
                      render={({ field }) => (
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                </Field>

                <Field>
                  <div className='flex items-center justify-between'>
                    <div>
                      <FieldLabel>Has IMEI/Serial</FieldLabel>
                      <FieldDescription>This product has IMEI or serial numbers</FieldDescription>
                    </div>
                    <Controller
                      control={form.control}
                      name='is_imei'
                      render={({ field }) => (
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                </Field>
              </>
            )}

            <Field>
              <FieldLabel>Product Details</FieldLabel>
              <Textarea
                {...form.register('product_details')}
                placeholder='Enter product details'
                rows={4}
              />
              <FieldError>{form.formState.errors.product_details?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Short Description</FieldLabel>
              <Textarea
                {...form.register('short_description')}
                placeholder='Enter short description'
                rows={3}
              />
              <FieldError>{form.formState.errors.short_description?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Specification</FieldLabel>
              <Textarea
                {...form.register('specification')}
                placeholder='Enter product specifications'
                rows={4}
              />
              <FieldError>{form.formState.errors.specification?.message}</FieldError>
            </Field>

            {productType === 'standard' && (
              <>
                <Field>
                  <div className='flex items-center justify-between'>
                    <div>
                      <FieldLabel>Embedded Barcode</FieldLabel>
                      <FieldDescription>Check this if this product will be used in weight scale machine</FieldDescription>
                    </div>
                    <Controller
                      control={form.control}
                      name='is_embeded'
                      render={({ field }) => (
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                </Field>

                <Field>
                  <div className='flex items-center justify-between'>
                    <div>
                      <FieldLabel>Differential Pricing</FieldLabel>
                      <FieldDescription>This product has different price for different warehouse</FieldDescription>
                    </div>
                    <Controller
                      control={form.control}
                      name='is_diffPrice'
                      render={({ field }) => (
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                </Field>

                {/* Differential Pricing Table */}
                {form.watch('is_diffPrice') && (
                  <Field>
                    <FieldLabel>Warehouse Prices</FieldLabel>
                    <div className='rounded-md border'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Warehouse</TableHead>
                            <TableHead>Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {warehouses.map((warehouse, index) => (
                            <TableRow key={warehouse.id}>
                              <TableCell>
                                <input
                                  type='hidden'
                                  {...form.register(`warehouse_id.${index}`, { value: warehouse.id })}
                                />
                                {warehouse.name}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type='number'
                                  step='0.01'
                                  {...form.register(`diff_price.${index}`, { valueAsNumber: true })}
                                  placeholder='0.00'
                                  className='w-full'
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <FieldError>
                      {form.formState.errors.warehouse_id?.message || form.formState.errors.diff_price?.message}
                    </FieldError>
                  </Field>
                )}

                <Field>
                  <div className='flex items-center justify-between'>
                    <div>
                      <FieldLabel>Initial Stock</FieldLabel>
                      <FieldDescription>Add initial stock for this product (Note: This feature will not work for product with variants and batches)</FieldDescription>
                    </div>
                    <Controller
                      control={form.control}
                      name='is_initial_stock'
                      render={({ field }) => (
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                </Field>
              </>
            )}

            {productType === 'combo' && (
              <>
                {/* Combo Products Section */}
                <ComboProductsTable
                  control={form.control as any}
                  watch={form.watch as any}
                  setValue={form.setValue as any}
                />
                
                <Field>
                  <FieldLabel>Production Cost</FieldLabel>
                  <Input
                    type='number'
                    step='0.01'
                    {...form.register('production_cost', { valueAsNumber: true })}
                    placeholder='0.00'
                  />
                  <FieldDescription>Production cost for combo products</FieldDescription>
                  <FieldError>{form.formState.errors.production_cost?.message}</FieldError>
                </Field>
              </>
            )}

            <Field>
              <div className='flex items-center justify-between'>
                <div>
                  <FieldLabel>Sell Online</FieldLabel>
                  <FieldDescription>Make this product available for online sales</FieldDescription>
                </div>
                <Controller
                  control={form.control}
                  name='is_online'
                  render={({ field }) => (
                    <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </Field>

            <Field>
              <div className='flex items-center justify-between'>
                <div>
                  <FieldLabel>In Stock</FieldLabel>
                  <FieldDescription>Mark product as in stock</FieldDescription>
                </div>
                <Controller
                  control={form.control}
                  name='in_stock'
                  render={({ field }) => (
                    <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </Field>

            <Field>
              <div className='flex items-center justify-between'>
                <div>
                  <FieldLabel>Track Inventory</FieldLabel>
                  <FieldDescription>Track inventory for this product</FieldDescription>
                </div>
                <Controller
                  control={form.control}
                  name='track_inventory'
                  render={({ field }) => (
                    <Switch checked={field.value !== false} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </Field>

            <Field>
              <div className='flex items-center justify-between'>
                <div>
                  <FieldLabel>Disable WooCommerce Sync</FieldLabel>
                  <FieldDescription>Disable synchronization with WooCommerce</FieldDescription>
                </div>
                <Controller
                  control={form.control}
                  name='is_sync_disable'
                  render={({ field }) => (
                    <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </Field>

            {/* Promotion Section */}
            <Field>
              <div className='flex items-center justify-between'>
                <div>
                  <FieldLabel>Add Promotional Price</FieldLabel>
                  <FieldDescription>Enable promotional pricing for this product</FieldDescription>
                </div>
                <Controller
                  control={form.control}
                  name='promotion'
                  render={({ field }) => (
                    <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </Field>

            {form.watch('promotion') && (
              <>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <Field>
                    <FieldLabel>Promotional Price</FieldLabel>
                    <Input
                      type='number'
                      step='0.01'
                      {...form.register('promotion_price', { valueAsNumber: true })}
                      placeholder='0.00'
                    />
                    <FieldError>{form.formState.errors.promotion_price?.message}</FieldError>
                  </Field>

                  <DatePickerField
                    label="Promotion Starts"
                    value={form.watch('starting_date')}
                    onChange={(value) => form.setValue('starting_date', value)}
                    error={form.formState.errors.starting_date?.message}
                  />

                  <DatePickerField
                    label="Promotion Ends"
                    value={form.watch('last_date')}
                    onChange={(value) => form.setValue('last_date', value)}
                    error={form.formState.errors.last_date?.message}
                  />
                </div>
              </>
            )}

        {/* Initial Stock Section - Only for standard products without variants/batches */}
        {productType === 'standard' && form.watch('is_initial_stock') && !form.watch('is_variant') && !form.watch('is_batch') && (
          <Field>
            <FieldLabel>Initial Warehouse Stock</FieldLabel>
            <FieldDescription>
              Add initial stock quantities for each warehouse. This feature will not work for products with variants and batches.
            </FieldDescription>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.map((warehouse, index) => (
                    <TableRow key={warehouse.id}>
                      <TableCell>
                        <input
                          type='hidden'
                          {...form.register(`stock_warehouse_id.${index}`, { value: warehouse.id })}
                        />
                        {warehouse.name}
                      </TableCell>
                      <TableCell>
                        <Input
                          type='number'
                          min='0'
                          step='0.01'
                          {...form.register(`stock.${index}`, { valueAsNumber: true })}
                          placeholder='0'
                          className='w-full'
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <FieldError>
              {form.formState.errors.stock_warehouse_id?.message || form.formState.errors.stock?.message}
            </FieldError>
          </Field>
        )}

        {/* SEO & Additional Information */}
            <Field>
              <FieldLabel>Tags</FieldLabel>
              <TagInput
                value={form.watch('tags')?.split(',').map(t => t.trim()).filter(t => t) || []}
                onChange={(tags) => form.setValue('tags', tags.join(','))}
                placeholder='Enter tags separated by commas'
                delimiter=','
              />
              <FieldDescription>Product tags for search and categorization</FieldDescription>
              <FieldError>{form.formState.errors.tags?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Meta Title</FieldLabel>
              <Input
                {...form.register('meta_title')}
                placeholder='Enter meta title for SEO'
                maxLength={255}
              />
              <FieldError>{form.formState.errors.meta_title?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Meta Description</FieldLabel>
              <Textarea
                {...form.register('meta_description')}
                placeholder='Enter meta description for SEO'
                rows={3}
                maxLength={1000}
              />
              <FieldError>{form.formState.errors.meta_description?.message}</FieldError>
            </Field>

            <RelatedProducts
              setValue={form.setValue}
              value={form.watch('related_products')}
            />

        {/* Restaurant Module Fields */}
            <Field>
              <FieldLabel>Kitchen</FieldLabel>
              <Controller
                control={form.control}
                name='kitchen_id'
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(value) => {
                      field.onChange(value ? Number(value) : null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select kitchen (optional)' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Add kitchen API integration when available */}
                      <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                        Kitchen selection coming soon. Requires kitchen API integration.
                      </div>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{form.formState.errors.kitchen_id?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Menu Type</FieldLabel>
              <Controller
                control={form.control}
                name='menu_type'
                render={({ field }) => (
                  <Input
                    value={Array.isArray(field.value) ? field.value.join(',') : ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (!value) {
                        field.onChange([])
                      } else {
                        const ids = value.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id))
                        field.onChange(ids)
                      }
                    }}
                    placeholder='Comma-separated menu type IDs (e.g., 1,2,3)'
                  />
                )}
              />
              <FieldDescription>
                Enter menu type IDs separated by commas. Full menu type selection coming soon. Requires menu type API integration.
              </FieldDescription>
              <FieldError>{form.formState.errors.menu_type?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Extras/Add-ons</FieldLabel>
              <Textarea
                {...form.register('extras')}
                placeholder='Comma-separated addon IDs (e.g., 1,2,3)'
                rows={2}
              />
              <FieldDescription>
                Enter addon/extra product IDs separated by commas. Full addon search integration coming soon.
              </FieldDescription>
              <FieldError>{form.formState.errors.extras?.message}</FieldError>
            </Field>
      </FieldGroup>

      {/* Dialogs */}
      <BrandsActionDialog
        open={brandDialogOpen}
        onOpenChange={(open) => {
          setBrandDialogOpen(open)
          if (!open) {
            brandsQuery.refetch()
          }
        }}
      />
      <CategoriesActionDialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open)
          if (!open) {
            categoriesQuery.refetch()
          }
        }}
      />
      <TaxesActionDialog
        open={taxDialogOpen}
        onOpenChange={(open) => {
          setTaxDialogOpen(open)
          if (!open) {
            taxesQuery.refetch()
          }
        }}
      />
      <UnitsActionDialog
        open={unitDialogOpen}
        onOpenChange={(open) => {
          setUnitDialogOpen(open)
          if (!open) {
            unitsQuery.refetch()
          }
        }}
      />

      {/* Form Actions */}
      <div className='flex justify-end gap-4'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.back()}
          disabled={createProduct.isPending || updateProduct.isPending}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={createProduct.isPending || updateProduct.isPending}>
          {createProduct.isPending || updateProduct.isPending ? (
            <>
              <Spinner className='mr-2' />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{isEdit ? 'Update Product' : 'Create Product'}</>
          )}
        </Button>
      </div>
    </form>
  )
}

