"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  Package02Icon,
  ShoppingCart01Icon,
  Invoice04Icon,
  ExchangeDollarIcon,
  File01Icon,
  ArrowDataTransferHorizontalIcon,
  TruckReturnIcon,
  Calculator01Icon,
  Briefcase01Icon,
  UserIcon,
  AnalyticsUpIcon,
  Factory01Icon,
  ShoppingBag01Icon,
  Store01Icon,
  Tag01Icon,
  Settings01Icon,
  HelpCircleIcon,
  CommandIcon,
  // AppWindow01Icon,
  // Volume2Icon,
} from "@hugeicons/core-free-icons"
import type { SidebarData } from "../types"

const DashboardIcon = () => <HugeiconsIcon icon={Home01Icon} className="size-4" />
const ProductIcon = () => <HugeiconsIcon icon={Package02Icon} className="size-4" />
const PurchaseIcon = () => <HugeiconsIcon icon={ShoppingCart01Icon} className="size-4" />
const SaleIcon = () => <HugeiconsIcon icon={Invoice04Icon} className="size-4" />
const ExpenseIcon = () => <HugeiconsIcon icon={ExchangeDollarIcon} className="size-4" />
const QuotationIcon = () => <HugeiconsIcon icon={File01Icon} className="size-4" />
const TransferIcon = () => <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="size-4" />
const ReturnIcon = () => <HugeiconsIcon icon={TruckReturnIcon} className="size-4" />
const AccountingIcon = () => <HugeiconsIcon icon={Calculator01Icon} className="size-4" />
const HRMIcon = () => <HugeiconsIcon icon={Briefcase01Icon} className="size-4" />
const PeopleIcon = () => <HugeiconsIcon icon={UserIcon} className="size-4" />
const ReportsIcon = () => <HugeiconsIcon icon={AnalyticsUpIcon} className="size-4" />
const ManufacturingIcon = () => <HugeiconsIcon icon={Factory01Icon} className="size-4" />
const WooCommerceIcon = () => <HugeiconsIcon icon={ShoppingBag01Icon} className="size-4" />
const EcommerceIcon = () => <HugeiconsIcon icon={Store01Icon} className="size-4" />
const SupportIcon = () => <HugeiconsIcon icon={Tag01Icon} className="size-4" />
const SettingsIcon = () => <HugeiconsIcon icon={Settings01Icon} className="size-4" />
const HelpIcon = () => <HugeiconsIcon icon={HelpCircleIcon} className="size-4" />
const CommandIconComponent = () => <HugeiconsIcon icon={CommandIcon} className="size-4" />
// const AppWindowIcon = () => <HugeiconsIcon icon={AppWindow01Icon} className="size-4" />
// const VolumeIcon = () => <HugeiconsIcon icon={Volume2Icon} className="size-4" />

export const sidebarData: Omit<SidebarData, 'user'> = {
  teams: [
    {
      name: 'Quick Mart',
      logo: CommandIconComponent,
      plan: 'Next.js + ShadcnUI',
    },
    // {
    //   name: 'Acme Inc',
    //   logo: AppWindowIcon,
    //   plan: 'Enterprise',
    // },
    // {
    //   name: 'Acme Corp.',
    //   logo: VolumeIcon,
    //   plan: 'Startup',
    // },
  ],
  
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: DashboardIcon,
        },
        {
          title: "Product",
          icon: ProductIcon,
          items: [
            {
              title: "Categories",
              url: "/products/categories",
            },
            {
              title: "Brands",
              url: "/products/brands",
            },
            {
              title: "Units",
              url: "/products/units",
            },
            {
              title: "Products",
              url: "/products",
            },
            {
              title: "Add Product",
              url: "/products/create",
            },
            {
              title: "Print Barcode",
              url: "/products/print-barcode",
            },
            {
              title: "Adjustments",
              url: "/products/adjustment",
            },
            {
              title: "Add Adjustment",
              url: "/products/adjustment/create",
            },
            {
              title: "Stock Count",
              url: "/products/stock-count",
            },
          ],
        },
        {
          title: "Purchase",
          icon: PurchaseIcon,
          items: [
            {
              title: "Purchases",
              url: "/purchases",
            },
            {
              title: "Add Purchase",
              url: "/purchases/create",
            },
            {
              title: "Import Purchase By CSV",
              url: "/purchases/import-csv",
            },
          ],
        },
        {
          title: "Sale",
          icon: SaleIcon,
          items: [
            {
              title: "Sales",
              url: "/sales",
            },
            {
              title: "POS",
              url: "/pos",
            },
            {
              title: "Add Sale",
              url: "/sales/create",
            },
            {
              title: "Import Sale By CSV",
              url: "/sales/import-csv",
            },
            {
              title: "Packing Slips",
              url: "/sales/packing-slips",
            },
            {
              title: "Challans",
              url: "/sales/challans",
            },
            {
              title: "Deliveries",
              url: "/sales/delivery",
            },
            {
              title: "Gift Cards",
              url: "/sales/gift-cards",
            },
            {
              title: "Coupons",
              url: "/sales/coupons",
            },
            {
              title: "Couriers",
              url: "/sales/couriers",
            },
          ],
        },
        {
          title: "Expense",
          icon: ExpenseIcon,
          items: [
            {
              title: "Expense Categories",
              url: "/expenses/categories",
            },
            {
              title: "Expenses",
              url: "/expenses",
            },
            {
              title: "Add Expense",
              url: "/expenses/create",
            },
          ],
        },
        {
          title: "Quotation",
          icon: QuotationIcon,
          items: [
            {
              title: "Quotations",
              url: "/quotations",
            },
            {
              title: "Add Quotation",
              url: "/quotations/create",
            },
          ],
        },
        {
          title: "Transfer",
          icon: TransferIcon,
          items: [
            {
              title: "Transfers",
              url: "/transfers",
            },
            {
              title: "Add Transfer",
              url: "/transfers/create",
            },
            {
              title: "Import Transfer By CSV",
              url: "/transfers/import-csv",
            },
          ],
        },
        {
          title: "Return",
          icon: ReturnIcon,
          items: [
            {
              title: "Sale Return",
              url: "/returns/sale",
            },
            {
              title: "Purchase Return",
              url: "/returns/purchase",
            },
          ],
        },
      ],
    },
    {
      title: "Business",
      items: [
        {
          title: "Accounting",
          icon: AccountingIcon,
          items: [
            {
              title: "Accounts",
              url: "/accounting/accounts",
            },
            {
              title: "Add Account",
              url: "/accounting/accounts/create",
            },
            {
              title: "Money Transfers",
              url: "/accounting/money-transfers",
            },
            {
              title: "Balance Sheet",
              url: "/accounting/balance-sheet",
            },
            {
              title: "Account Statement",
              url: "/accounting/account-statement",
            },
          ],
        },
        {
          title: "HRM",
          icon: HRMIcon,
          items: [
            {
              title: "Department",
              url: "/hrm/departments",
            },
            {
              title: "Employee",
              url: "/hrm/employees",
            },
            {
              title: "Attendance",
              url: "/hrm/attendance",
            },
            {
              title: "Payroll",
              url: "/hrm/payroll",
            },
            {
              title: "Holiday",
              url: "/hrm/holidays",
            },
          ],
        },
        {
          title: "People",
          icon: PeopleIcon,
          items: [
            {
              title: "Users",
              url: "/people/users",
            },
            {
              title: "Add User",
              url: "/people/users/create",
            },
            {
              title: "Customers",
              url: "/people/customers",
            },
            {
              title: "Add Customer",
              url: "/people/customers/create",
            },
            {
              title: "Billers",
              url: "/people/billers",
            },
            {
              title: "Add Biller",
              url: "/people/billers/create",
            },
            {
              title: "Suppliers",
              url: "/people/suppliers",
            },
            {
              title: "Add Supplier",
              url: "/people/suppliers/create",
            },
          ],
        },
        {
          title: "Reports",
          icon: ReportsIcon,
          items: [
            {
              title: "Activity Log",
              url: "/reports/activity-log",
            },
            {
              title: "Summary Report",
              url: "/reports/summary",
            },
            {
              title: "Best Seller",
              url: "/reports/best-seller",
            },
            {
              title: "Product Report",
              url: "/reports/product",
            },
            {
              title: "Daily Sale",
              url: "/reports/daily-sale",
            },
            {
              title: "Monthly Sale",
              url: "/reports/monthly-sale",
            },
            {
              title: "Daily Purchase",
              url: "/reports/daily-purchase",
            },
            {
              title: "Monthly Purchase",
              url: "/reports/monthly-purchase",
            },
            {
              title: "Sale Report",
              url: "/reports/sale",
            },
            {
              title: "Challan Report",
              url: "/reports/challan",
            },
            {
              title: "Sale Report Chart",
              url: "/reports/sale-chart",
            },
            {
              title: "Payment Report",
              url: "/reports/payment",
            },
            {
              title: "Purchase Report",
              url: "/reports/purchase",
            },
            {
              title: "Customer Report",
              url: "/reports/customer",
            },
            {
              title: "Customer Group Report",
              url: "/reports/customer-group",
            },
            {
              title: "Customer Due Report",
              url: "/reports/customer-due",
            },
            {
              title: "Supplier Report",
              url: "/reports/supplier",
            },
            {
              title: "Supplier Due Report",
              url: "/reports/supplier-due",
            },
            {
              title: "Warehouse Report",
              url: "/reports/warehouse",
            },
            {
              title: "Warehouse Stock Chart",
              url: "/reports/warehouse-stock",
            },
            {
              title: "Product Expiry Report",
              url: "/reports/product-expiry",
            },
            {
              title: "Product Quantity Alert",
              url: "/reports/product-quantity-alert",
            },
            {
              title: "Daily Sale Objective Report",
              url: "/reports/daily-sale-objective",
            },
            {
              title: "User Report",
              url: "/reports/user",
            },
            {
              title: "Cash Register",
              url: "/reports/cash-register",
            },
          ],
        },
        {
          title: "Manufacturing",
          icon: ManufacturingIcon,
          items: [
            {
              title: "Productions",
              url: "/manufacturing/productions",
            },
            {
              title: "Add Production",
              url: "/manufacturing/productions/create",
            },
            {
              title: "Recipes",
              url: "/manufacturing/recipes",
            },
          ],
        },
      ],
    },
    {
      title: "E-commerce",
      items: [
        {
          title: "WooCommerce",
          url: "/woocommerce",
          icon: WooCommerceIcon,
        },
        {
          title: "eCommerce",
          icon: EcommerceIcon,
          items: [
            {
              title: "Sliders",
              url: "/ecommerce/sliders",
            },
            {
              title: "Menu",
              url: "/ecommerce/menu",
            },
            {
              title: "Collections",
              url: "/ecommerce/collections",
            },
            {
              title: "Pages",
              url: "/ecommerce/pages",
            },
            {
              title: "Widgets",
              url: "/ecommerce/widgets",
            },
            {
              title: "Faq Category",
              url: "/ecommerce/faq-categories",
            },
            {
              title: "Faqs",
              url: "/ecommerce/faqs",
            },
            {
              title: "Social Links",
              url: "/ecommerce/social-links",
            },
            {
              title: "Blog",
              url: "/ecommerce/blog",
            },
            {
              title: "Payment Gateways",
              url: "/ecommerce/payment-gateways",
            },
            {
              title: "Settings",
              url: "/ecommerce/settings",
            },
            {
              title: "Product Review",
              url: "/ecommerce/product-review",
            },
          ],
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          title: "Support Tickets",
          url: "/support/tickets",
          icon: SupportIcon,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Settings",
          icon: SettingsIcon,
          items: [
            {
              title: "Receipt Printers",
              url: "/settings/printers",
            },
            {
              title: "Invoice Settings",
              url: "/settings/invoice",
            },
            {
              title: "Role Permission",
              url: "/settings/role-permission",
            },
            {
              title: "SMS Template",
              url: "/settings/sms-template",
            },
            {
              title: "Custom Fields",
              url: "/settings/custom-fields",
            },
            {
              title: "Discount Plan",
              url: "/settings/discount-plan",
            },
            {
              title: "Discount",
              url: "/settings/discount",
            },
            {
              title: "All Notification",
              url: "/settings/notifications",
            },
            {
              title: "Send Notification",
              url: "/settings/send-notification",
            },
            {
              title: "Warehouse",
              url: "/settings/warehouse",
            },
            {
              title: "Tables",
              url: "/settings/tables",
            },
            {
              title: "Customer Group",
              url: "/settings/customer-group",
            },
            {
              title: "Brand",
              url: "/settings/brand",
            },
            {
              title: "Unit",
              url: "/settings/unit",
            },
            {
              title: "Currency",
              url: "/settings/currency",
            },
            {
              title: "Tax",
              url: "/settings/tax",
            },
            {
              title: "User Profile",
              url: "/settings/profile",
            },
            {
              title: "Create SMS",
              url: "/settings/create-sms",
            },
            {
              title: "Backup Database",
              url: "/settings/backup",
            },
            {
              title: "General Setting",
              url: "/settings/general",
            },
            {
              title: "Mail Setting",
              url: "/settings/mail",
            },
            {
              title: "Reward Point Setting",
              url: "/settings/reward-point",
            },
            {
              title: "SMS Setting",
              url: "/settings/sms",
            },
            {
              title: "Payment Gateways",
              url: "/settings/payment-gateways",
            },
            {
              title: "POS Settings",
              url: "/settings/pos",
            },
            {
              title: "HRM Setting",
              url: "/settings/hrm",
            },
            {
              title: "Barcode Settings",
              url: "/settings/barcode",
            },
            {
              title: "Languages",
              url: "/settings/languages",
            },
          ],
        },
        {
          title: "Help Center",
          url: "/help-center",
          icon: HelpIcon,
        },
      ],
    },
  ],
}

