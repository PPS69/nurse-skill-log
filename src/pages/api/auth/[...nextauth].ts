import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from 'bcrypt'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

import prisma from '../../../lib/prismadb'

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {},
            async authorize(credentials): Promise<any> {
                const { email, password } = credentials as {
                    email: string
                    password: string
                }

                const user = await prisma.user.findFirst({
                    where: {
                        email,
                    },
                })

                const checkPassword = await compare(
                    password,
                    user?.password ?? ''
                )

                if (user == null || !checkPassword) {
                    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
                }
                if (user.role === 'wait') {
                    throw new Error('บัญชีของท่านกำลังรอการยืนยัน')
                }

                return user
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
        newUser: '/register/student',
        // verifyRequest:'/login',
    },
    secret: process.env.JWT_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user != null) {
                token.role = user.role
            }
            // console.log('token: ', token)
            return token
        },
        async session({ session, token, user }) {
            if (session.user !== null) {
                session.user.id = token.id
                session.user.role = token.role
            }

            if (session.user.role === 'student') {
                const student = await prisma.student.findFirst({
                    where: { email: session.user.email },
                })
                if (student !== null) {
                    session.user.studentId = student.studentId
                }
            } else if (session.user.role === 'approver') {
                const approver = await prisma.approver.findFirst({
                    where: { email: session.user.email },
                })
                if (approver !== null) {
                    session.user.id = approver.id
                }
            }
            // console.log('session', session)
            return session
        },
    },
}

export default NextAuth(authOptions)
