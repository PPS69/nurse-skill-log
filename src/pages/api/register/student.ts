import { type NextApiRequest, type NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import prisma from '../../../lib/prismadb'
import { authOptions } from '../auth/[...nextauth]'

const registerSchema = z.object({
    fullname: z
        .string({
            required_error: 'Name is required',
        })
        .min(3)
        .max(70)
        .trim(),
    email: z.string().min(5),
    studentId: z
        .string()
        .min(8, 'รหัสนิสิตต้องมี 8 ตัว')
        .max(8, 'รหัสนิสิตต้องมี 8 ตัว'),
})

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const { method } = req

    const session = await getServerSession(req, res, authOptions)
    if (session == null) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    switch (method) {
        case 'GET':
            try {
                // console.log(session)
                if (session.user.role !== 'null') {
                    res.status(403).json({ error: 'Forbidden' })
                    return
                }
                const student = await prisma.user.findFirst({
                    where: { email: session.user.email },
                    select: {
                        email: true,
                        name: true,
                    },
                })
                res.status(200).json(student)
            } catch (error) {
                res.json({ error: 'Something went wrong' })
            }
            break

        case 'POST':
            try {
                const userData = registerSchema.safeParse(req.body)

                if (!userData.success) {
                    // console.log(userData)
                    res.status(400).json(userData.error.issues)
                    return
                }

                const { fullname, email, studentId } = userData.data

                const user = await prisma.user.update({
                    where: { email },
                    data: {
                        name: fullname,
                        role: 'student',
                        Student: {
                            create: {
                                name: fullname,
                                email,
                                studentId,
                            },
                        },
                    },
                })

                res.status(201).json({
                    message: 'User created successfully',
                    user,
                })
            } catch (error) {
                console.error(error)
                res.status(500).json({ error: 'Error registering user' })
            }
            break

        default:
            res.status(405).json({ error: `Method Not Allowed` })
    }
}
