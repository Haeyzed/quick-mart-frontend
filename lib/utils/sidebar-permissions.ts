"use client"

import type { SidebarData, NavGroup, NavItem } from '@/components/layout/types'

/**
 * Permission mapping for sidebar items
 * Maps URL paths to required permissions
 * 
 * Note: Items without explicit mappings will default to allowing access
 * to maintain backward compatibility until all routes have permissions configured
 */
const PERMISSION_MAP: Record<string, string | string[]> = {
  // Dashboard - typically accessible to all authenticated users
  '/dashboard': 'dashboard',
  
  // Products - can be accessed with general 'products-index' or specific permissions
  '/products/categories': ['categories-index'],
  '/products/brands': ['brands-index','brands-create','brands-update','brands-delete'],
  '/products/units': ['units-index','units-create','units-update','units-delete'],
  '/products': ['products-index'],
  '/products/create': ['products-create'],
  '/products/print-barcode': ['products-index', 'products-barcode'],
  '/products/adjustment': ['products-index', 'products-adjustment'],
  '/products/adjustment/create': ['products-create', 'products-adjustment'],
  '/products/stock-count': ['products-index', 'products-stock-count'],
  
  // Purchase
  '/purchases': 'purchases-index',
  '/purchases/create': 'purchases-create',
  '/purchases/import-csv': 'purchases-import',
  
  // Sale
  '/sales': 'sales-index',
  '/pos': 'pos',
  '/sales/create': 'sales-create',
  '/sales/import-csv': 'sales-import',
  '/sales/packing-slips': 'sales-packing-slips',
  '/sales/challans': 'sales-challans',
  '/sales/delivery': 'sales-delivery',
  '/sales/gift-cards': 'sales-gift-cards',
  '/sales/coupons': 'sales-coupons',
  '/sales/couriers': 'sales-couriers',
  
  // Expense
  '/expenses/categories': 'expense',
  '/expenses': 'expenses-index',
  '/expenses/create': 'expenses-create',
  
  // Quotation
  '/quotations': 'quotation',
  '/quotations/create': 'quotation',
  
  // Transfer
  '/transfers': 'transfer',
  '/transfers/create': 'transfer',
  '/transfers/import-csv': 'transfer',
  
  // Return
  '/returns/sale': 'sale-return',
  '/returns/purchase': 'purchase-return',
  
  // Accounting
  '/accounting/accounts': 'account',
  '/accounting/accounts/create': 'account',
  '/accounting/money-transfers': 'account',
  '/accounting/balance-sheet': 'account',
  '/accounting/account-statement': 'account',
  
  // HRM
  '/hrm/departments': 'hrm',
  '/hrm/employees': 'hrm',
  '/hrm/attendance': 'hrm',
  '/hrm/payroll': 'hrm',
  '/hrm/holidays': 'hrm',
  
  // People - can be accessed with specific permissions or general 'people' permission
  '/people/users': ['users-index', 'user', 'people'],
  '/people/users/create': ['users-add', 'user', 'people'],
  '/people/customers': ['customer', 'customers-index', 'people'],
  '/people/customers/create': ['customer', 'customers-add', 'people'],
  '/people/billers': ['biller', 'billers-index', 'people'],
  '/people/billers/create': ['biller', 'billers-add', 'people'],
  '/people/suppliers': ['supplier', 'suppliers-index', 'people'],
  '/people/suppliers/create': ['supplier', 'suppliers-add', 'people'],
  
  // Reports
  '/reports/activity-log': 'report',
  '/reports/summary': 'report',
  '/reports/best-seller': 'report',
  '/reports/product': 'report',
  '/reports/daily-sale': 'report',
  '/reports/monthly-sale': 'report',
  '/reports/daily-purchase': 'report',
  '/reports/monthly-purchase': 'report',
  '/reports/sale': 'report',
  '/reports/challan': 'report',
  '/reports/sale-chart': 'report',
  '/reports/payment': 'report',
  '/reports/purchase': 'report',
  '/reports/customer': 'report',
  '/reports/customer-group': 'report',
  '/reports/customer-due': 'report',
  '/reports/supplier': 'report',
  '/reports/supplier-due': 'report',
  '/reports/warehouse': 'report',
  '/reports/warehouse-stock': 'report',
  '/reports/product-expiry': 'report',
  '/reports/product-quantity-alert': 'report',
  '/reports/daily-sale-objective': 'report',
  '/reports/user': 'report',
  '/reports/cash-register': 'report',
  
  // Manufacturing
  '/manufacturing/productions': 'manufacturing',
  '/manufacturing/productions/create': 'manufacturing',
  '/manufacturing/recipes': 'manufacturing',
  
  // E-commerce
  '/woocommerce': 'ecommerce',
  '/ecommerce/sliders': 'ecommerce',
  '/ecommerce/menu': 'ecommerce',
  '/ecommerce/collections': 'ecommerce',
  '/ecommerce/pages': 'ecommerce',
  '/ecommerce/widgets': 'ecommerce',
  '/ecommerce/faq-categories': 'ecommerce',
  '/ecommerce/faqs': 'ecommerce',
  '/ecommerce/social-links': 'ecommerce',
  '/ecommerce/blog': 'ecommerce',
  '/ecommerce/payment-gateways': 'ecommerce',
  '/ecommerce/settings': 'ecommerce',
  '/ecommerce/product-review': 'ecommerce',
  
  // Support
  '/support/tickets': 'support',
  
  // Settings - many settings items can be accessed with either 'settings' or specific permissions
  '/settings/printers': ['settings', 'printer'],
  '/settings/invoice': ['settings', 'invoice'],
  '/settings/role-permission': ['users-index', 'settings'],
  '/settings/sms-template': ['settings', 'sms'],
  '/settings/custom-fields': ['settings', 'custom-field'],
  '/settings/discount-plan': ['settings', 'discount'],
  '/settings/discount': ['settings', 'discount'],
  '/settings/notifications': ['settings', 'notification'],
  '/settings/send-notification': ['settings', 'notification'],
  '/settings/warehouse': ['warehouse', 'settings'],
  '/settings/tables': ['settings', 'table'],
  '/settings/customer-group': ['customer-group', 'settings'],
  '/settings/brand': ['brand', 'settings'],
  '/settings/unit': ['unit', 'settings'],
  '/settings/currency': ['settings', 'currency'],
  '/settings/tax': ['tax', 'settings'],
  '/settings/profile': ['settings', 'user-profile'],
  '/settings/create-sms': ['settings', 'sms'],
  '/settings/backup': ['settings', 'backup'],
  '/settings/general': ['settings', 'general-setting'],
  '/settings/mail': ['settings', 'mail-setting'],
  '/settings/reward-point': ['settings', 'reward-point'],
  '/settings/sms': ['settings', 'sms-setting'],
  '/settings/payment-gateways': ['settings', 'payment-gateway'],
  '/settings/pos': ['settings', 'pos-setting'],
  '/settings/hrm': ['settings', 'hrm-setting'],
  '/settings/barcode': ['settings', 'barcode-setting'],
  '/settings/languages': ['settings', 'language'],
  
  // Help
  '/help-center': 'help',
}

/**
 * Check if user has permission for a URL
 */
function hasPermissionForUrl(
  url: string,
  allPermissions: string[]
): boolean {
  // Check exact match first
  if (PERMISSION_MAP[url]) {
    const required = PERMISSION_MAP[url]
    if (Array.isArray(required)) {
      return required.some(perm => allPermissions.includes(perm))
    }
    return allPermissions.includes(required)
  }
  
  // Check prefix matches (e.g., /products/* should check products-index)
  for (const [path, permission] of Object.entries(PERMISSION_MAP)) {
    if (url.startsWith(path)) {
      const required = permission
      if (Array.isArray(required)) {
        return required.some(perm => allPermissions.includes(perm))
      }
      return allPermissions.includes(required)
    }
  }
  
  // Default: allow access if no permission mapping exists
  // This allows new routes to be accessible until permissions are configured
  return true
}

/**
 * Filter sidebar items based on user permissions
 */
export function filterSidebarByPermissions(
  sidebarData: Omit<SidebarData, 'user'>,
  allPermissions: string[]
): Omit<SidebarData, 'user'> {
  const filterNavItem = (item: NavItem): NavItem | null => {
    // If item has nested items (collapsible), filter them first
    if ('items' in item && item.items) {
      const filteredItems = item.items
        .map(filterNavItem)
        .filter((item): item is NavItem => item !== null)
        // Ensure filtered items are NavLink (have URL) as per type definition
        .filter((item): item is Extract<NavItem, { url: string }> => 
          'url' in item && !!item.url
        )
      
      // If no items remain after filtering, hide the parent
      if (filteredItems.length === 0) {
        return null
      }
      
      // Return the parent with filtered nested items
      return {
        ...item,
        items: filteredItems,
      } as NavItem
    }
    
    // If item has a URL (link), check permission
    if ('url' in item && item.url) {
      if (!hasPermissionForUrl(item.url, allPermissions)) {
        return null
      }
    }
    
    // If item has no URL and no items, allow it (e.g., section headers)
    return item
  }
  
  const filterNavGroup = (group: NavGroup): NavGroup | null => {
    const filteredItems = group.items
      .map(filterNavItem)
      .filter((item): item is NavItem => item !== null)
    
    if (filteredItems.length === 0) {
      return null
    }
    
    return {
      ...group,
      items: filteredItems,
    }
  }
  
  return {
    ...sidebarData,
    navGroups: sidebarData.navGroups
      .map(filterNavGroup)
      .filter((group): group is NavGroup => group !== null),
  }
}
