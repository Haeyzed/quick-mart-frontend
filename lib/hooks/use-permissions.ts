"use client"

import React from 'react'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

/**
 * Hook to check user permissions
 * 
 * @returns Object with permission checking methods
 */
export function usePermissions() {
  const { data: session } = useSession()
  const user = session?.user as any
  const allPermissions = user?.all_permissions || []

  /**
   * Check if user has a specific permission
   * 
   * @param permission - Permission name to check (e.g., 'products-index', 'brand-add')
   * @returns boolean
   */
  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      if (!allPermissions || allPermissions.length === 0) {
        return false
      }
      return allPermissions.includes(permission)
    }
  }, [allPermissions])

  /**
   * Check if user has any of the given permissions
   * 
   * @param permissions - Array of permission names
   * @returns boolean
   */
  const hasAnyPermission = useMemo(() => {
    return (permissions: string[]): boolean => {
      if (!allPermissions || allPermissions.length === 0) {
        return false
      }
      return permissions.some(permission => allPermissions.includes(permission))
    }
  }, [allPermissions])

  /**
   * Check if user has all of the given permissions
   * 
   * @param permissions - Array of permission names
   * @returns boolean
   */
  const hasAllPermissions = useMemo(() => {
    return (permissions: string[]): boolean => {
      if (!allPermissions || allPermissions.length === 0) {
        return false
      }
      return permissions.every(permission => allPermissions.includes(permission))
    }
  }, [allPermissions])

  /**
   * Check if user has a specific role
   * 
   * @param roleName - Role name to check (e.g., 'Admin')
   * @returns boolean
   */
  const hasRole = useMemo(() => {
    return (roleName: string): boolean => {
      const roleNames = user?.role_names || []
      return roleNames.includes(roleName)
    }
  }, [user?.role_names])

  /**
   * Check if user has any of the given roles
   * 
   * @param roleNames - Array of role names
   * @returns boolean
   */
  const hasAnyRole = useMemo(() => {
    return (roleNames: string[]): boolean => {
      const userRoleNames = user?.role_names || []
      return roleNames.some(roleName => userRoleNames.includes(roleName))
    }
  }, [user?.role_names])

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    permissions: allPermissions,
    roles: user?.role_names || [],
  }
}

/**
 * Higher-order component to conditionally render based on permission(s)
 * 
 * @param permission - Single permission name or array of permission names (user needs at least one)
 * @param children - React node to render if permission(s) are granted
 * @param fallback - Optional fallback to render if permission(s) are not granted
 */
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasPermission, hasAnyPermission } = usePermissions()
  
  const hasAccess = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission)
  
  if (hasAccess) {
    return React.createElement(React.Fragment, null, children)
  }
  
  return React.createElement(React.Fragment, null, fallback)
}

/**
 * Higher-order component to conditionally render based on any permission
 * 
 * @param permissions - Array of permission names (user needs at least one)
 * @param children - React node to render if any permission is granted
 * @param fallback - Optional fallback to render if no permission is granted
 */
export function AnyPermissionGuard({
  permissions,
  children,
  fallback = null,
}: {
  permissions: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasAnyPermission } = usePermissions()
  
  if (hasAnyPermission(permissions)) {
    return React.createElement(React.Fragment, null, children)
  }
  
  return React.createElement(React.Fragment, null, fallback)
}

/**
 * Higher-order component to conditionally render based on all permissions
 * 
 * @param permissions - Array of permission names (user needs all)
 * @param children - React node to render if all permissions are granted
 * @param fallback - Optional fallback to render if not all permissions are granted
 */
export function AllPermissionsGuard({
  permissions,
  children,
  fallback = null,
}: {
  permissions: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasAllPermissions } = usePermissions()
  
  if (hasAllPermissions(permissions)) {
    return React.createElement(React.Fragment, null, children)
  }
  
  return React.createElement(React.Fragment, null, fallback)
}
