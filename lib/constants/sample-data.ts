/**
 * Sample data for CSV imports
 */

export const SAMPLE_CATEGORIES_CSV = `name,parent_category
Electronics,
Mobile Phones,Electronics
Laptops,Electronics
Clothing,
Men's Clothing,Clothing
Women's Clothing,Clothing`

export const SAMPLE_BRANDS_CSV = `name,short_description,image_url,page_title
Apple,Leading technology brand,https://example.com/apple.jpg,Apple Products
Samsung,Global electronics company,https://example.com/samsung.jpg,Samsung Devices
Nike,Just Do It,https://example.com/nike.jpg,Nike Sports`

export const SAMPLE_UNITS_CSV = `code,name,baseunit,operator,operationvalue
PC,Piece,,
DZ,Dozen,PC,*,12
KG,Kilogram,,
G,Gram,KG,/,1000
M,Meter,,
CM,Centimeter,M,/,100`

export const SAMPLE_TAXES_CSV = `name,rate
VAT,15
GST,18
Sales Tax,10
Service Tax,12`

