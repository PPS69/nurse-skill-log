import { type NextApiRequest, type NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import prisma from '../../../lib/prismadb'
import { authOptions } from '../auth/[...nextauth]'

const studentUpdateSchema = z.object({
    id: z.string().cuid(),
    name: z
        .string({
            required_error: 'Name is required',
        })
        .min(3)
        .max(70)
        .trim(),
    email: z.string().min(5).email(),
    role: z.enum(['admin', 'approver', 'student']),
    studentId: z
        .string()
        .min(8, 'รหัสนิสิตต้องมี 8 ตัว')
        .max(8, 'รหัสนิสิตต้องมี 8 ตัว'),
})

const userId = z.array(z.string().cuid())

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const { method } = req

    const { id, name, email, role, studentId } = req.body

    const session = await getServerSession(req, res, authOptions)
    if (session == null) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    switch (method) {
        case 'GET':
            try {
                const allUser = await prisma.user.findMany({
                    where: {
                        role: {
                            in: ['admin', 'student', 'approver'],
                        },
                    },
                    select: { id: true, name: true, email: true, role: true },
                })

                res.status(200).json(allUser)
            } catch (error) {
                res.send(error)
            }
            break
        case 'PUT':
            try {
                let user
                if (role === 'admin') {
                    user = await prisma.user.update({
                        where: {
                            id,
                        },
                        data: {
                            role,
                        },
                    })
                } else if (role === 'approver') {
                    user = await prisma.user.update({
                        where: {
                            id,
                        },
                        data: {
                            role,
                            approver: {
                                upsert: {
                                    update: { name, email },
                                    create: { name, email },
                                },
                            },
                        },
                    })
                } else if (role === 'student') {
                    const studentData = studentUpdateSchema.safeParse(req.body)

                    if (!studentData.success) {
                        res.status(400).json(studentData.error.issues)
                        return
                    } else {
                        user = await prisma.user.update({
                            where: {
                                id,
                            },
                            data: {
                                role,
                                Student: {
                                    upsert: {
                                        update: { studentId, name, email },
                                        create: { studentId, name, email },
                                    },
                                },
                            },
                        })
                    }
                }
                res.status(200).json(user)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break
        case 'DELETE':
            try {
                const studentData = userId.safeParse(req.body)

                if (!studentData.success) {
                    res.status(400).json(studentData.error.issues)
                    return
                }

                await Promise.all(
                    studentData.data.map(async (data) => {
                        await prisma.user.delete({
                            where: {
                                id: data,
                            },
                        })
                    })
                )

                const allUser = await prisma.user.findMany({
                    where: {
                        role: {
                            in: ['admin', 'student', 'approver'],
                        },
                    },
                    select: { id: true, name: true, email: true, role: true },
                })

                res.status(200).json(allUser)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break
        default:
            res.status(405).end(`Method Not Allowed`)
    }
}
