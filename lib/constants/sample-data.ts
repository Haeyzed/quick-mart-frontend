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

export const SAMPLE_PRODUCTS_CSV = `name,code,category,unitcode,cost,type,brand,price,profitmargin,productdetails
Sample Product 1,PRD001,Electronics,PC,100,standard,Brand A,125,25,Sample product description
Sample Product 2,PRD002,Clothing,PC,50,standard,Brand B,62.5,25,Sample clothing item
Sample Product 3,PRD003,Food,KG,30,standard,Brand C,37.5,25,Sample food item`

