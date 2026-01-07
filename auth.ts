import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Types
export interface User {
  id: number
  name: string
  email: string | null
  phone: string | null
  company_name: string | null
  role_id: number | null
  biller_id: number | null
  warehouse_id: number | null
  is_active: boolean
  is_deleted: boolean
  email_verified_at: string | null
  created_at: string | null
  updated_at: string | null
}

interface LoginResponse {
  user: User
  token: string
}

interface ApiResponse<T> {
  status: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

// Helper to make API calls directly (for server-side)
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const url = `${baseURL}/api${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data: ApiResponse<T> = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred')
  }

  return data
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        name: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) {
          throw new Error("Please provide both email/username and password")
        }

        try {
          const response = await apiCall<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              name: credentials.name,
              password: credentials.password,
            }),
          })

          if (response.status && response.data) {
            return {
              id: String(response.data.user.id),
              email: response.data.user.email || '',
              name: response.data.user.name,
              phone: response.data.user.phone,
              company_name: response.data.user.company_name,
              role_id: response.data.user.role_id,
              biller_id: response.data.user.biller_id,
              warehouse_id: response.data.user.warehouse_id,
              is_active: response.data.user.is_active,
              is_deleted: response.data.user.is_deleted,
              email_verified_at: response.data.user.email_verified_at,
              created_at: response.data.user.created_at,
              updated_at: response.data.user.updated_at,
              accessToken: response.data.token,
            }
          }

          throw new Error(response.message || 'Login failed')
        } catch (error: any) {
          console.error('Auth error:', error)
          throw new Error(error.message || 'Invalid credentials')
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          accessToken: (user as any).accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: (user as any).phone,
            company_name: (user as any).company_name,
            role_id: (user as any).role_id,
            biller_id: (user as any).biller_id,
            warehouse_id: (user as any).warehouse_id,
            is_active: (user as any).is_active,
            is_deleted: (user as any).is_deleted,
            email_verified_at: (user as any).email_verified_at,
            created_at: (user as any).created_at,
            updated_at: (user as any).updated_at,
          },
          tokenExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        }
      }

      // Check if token needs refresh (refresh 1 day before expiry)
      const now = Date.now()
      const expiry = token.tokenExpiry as number | undefined
      
      if (expiry && now > expiry - (24 * 60 * 60 * 1000)) {
        try {
          const response = await apiCall<LoginResponse>('/auth/refresh-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token.accessToken}`,
            },
            body: JSON.stringify({
              revoke_old_token: false,
            }),
          })

          if (response.status && response.data) {
            return {
              ...token,
              accessToken: response.data.token,
              user: {
                ...(token.user as any),
                ...response.data.user,
              },
              tokenExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000),
            }
          }
        } catch (error) {
          // If refresh fails, return token as-is
          // User will be logged out when token actually expires
          console.error('Token refresh failed:', error)
        }
      }

      // Handle session update (e.g., profile update)
      if (trigger === 'update' && session) {
        return {
          ...token,
          user: {
            ...(token.user as any),
            ...(session as any),
          },
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token.user && token.accessToken) {
        session.user = {
          ...session.user,
          ...(token.user as any),
        }
        ;(session as any).accessToken = token.accessToken
      }
      return session
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  events: {
    async signOut(message) {
      // Call logout API with the token
      // message can be { session } or { token }
      const token = (message as any).token as any
      if (token?.accessToken) {
        try {
          await apiCall('/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token.accessToken}`,
            },
          })
        } catch (error) {
          // Ignore logout errors - user is already signed out locally
          console.error('Logout error:', error)
        }
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
})
