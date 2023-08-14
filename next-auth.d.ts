import { type Role } from '@prisma/client'
import { type DefaultSession } from 'next-auth'

declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        role?: Role
    }
}

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the
     * `SessionProvider` React Context and trpc context
     */
    interface Session {
        user?: {
            role?: Role
        } & DefaultSession['student']
    }

    /** Passed as a parameter to the `jwt` callback */
    interface User {
        role?: Role
    }
}
