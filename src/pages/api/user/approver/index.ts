import { type NextApiRequest, type NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import prisma from '../../../../lib/prismadb'
import incryptPassword from '../../../../utils/bycrypt'
import { authOptions } from '../../auth/[...nextauth]'

const approverUpdateSchema = z.object({
    id: z.string().cuid(),
    name: z
        .string()
        .min(3, 'มีชื่อที่สั้นเกินไป')
        .max(70, 'มีชื่อที่ยาวเกินไป')
        .trim(),
    email: z.string().email().min(5).trim(),
})

const approverPostSchema = z.array(
    z.object({
        name: z
            .string()
            .min(3, 'มีชื่อที่สั้นเกินไป')
            .max(70, 'มีชื่อที่ยาวเกินไป')
            .trim(),
        email: z.string().email().min(5).trim(),
        password: z.string(),
    })
)

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
                const approvers = await prisma.user.findMany({
                    where: { role: 'approver' },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                })

                // console.log(approvers)

                res.status(200).json(approvers)
            } catch (error) {
                res.status(500).json(error)
            }
            break
        case 'POST':
            try {
                const approverArray = approverPostSchema.safeParse(req.body)

                if (!approverArray.success) {
                    res.status(400).json(approverArray.error.issues)
                    return
                }
                await Promise.all(
                    approverArray.data.map(async (value) => {
                        await prisma.user.create({
                            data: {
                                email: value.email,
                                name: value.name,
                                role: 'approver',
                                password: await incryptPassword(
                                    value.password != null ? value.password : ''
                                ),
                                approver: {
                                    create: {
                                        email: value.email,
                                        name: value.name,
                                    },
                                },
                            },
                        })
                    })
                ).catch((error) => {
                    console.log(error.message)
                    res.status(400).json(error)
                })

                const newData = await prisma.user.findMany({
                    where: { role: 'approver' },
                })

                res.status(201).json(newData)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break
        case 'PUT':
            try {
                const approverData = approverUpdateSchema.safeParse(req.body)

                if (!approverData.success) {
                    res.status(400).json(approverData.error.issues)
                    return
                }

                const { id, name, email } = approverData.data

                const newData = await prisma.user.update({
                    where: { id },
                    data: {
                        name,
                        email,
                        approver: {
                            update: {
                                name,
                                email,
                            },
                        },
                    },
                    include: {
                        approver: true,
                    },
                })

                res.status(200).json(newData)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break

        default:
            res.status(405).json(`Method Not Allowed`)
    }
}
