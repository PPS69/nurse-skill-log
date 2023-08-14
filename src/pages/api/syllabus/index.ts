import { type NextApiRequest, type NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import prisma from '../../../lib/prismadb'
import { authOptions } from '../auth/[...nextauth]'

const syllabusValidate = z.object({
    id: z.number(),
    name: z
        .string({
            required_error: 'Syllabus Name is required',
        })
        .min(3)
        .max(100)
        .trim(),
})

const syllabusIdValidate = syllabusValidate.pick({ id: true })

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
                const syllabus = await prisma.syllabus.findMany({
                    include: {
                        experiences: {
                            include: {
                                subTopic: true,
                            },
                        },
                    },
                })
                res.status(200).json(syllabus)
            } catch (error) {
                res.status(500).json(error)
            }
            break
        case 'POST':
            try {
                const updataSyllabus = await prisma.syllabus.create({
                    data: {
                        name:
                            'หลักสูตร' +
                            `${Math.floor(Math.random() * 100) + 1}`,
                    },
                    include: {
                        experiences: {
                            include: { subTopic: true },
                        },
                    },
                })
                res.status(201).json(updataSyllabus)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break
        case 'PUT':
            try {
                const experienceData = syllabusValidate.safeParse(req.body)

                if (!experienceData.success) {
                    res.status(400).json(experienceData.error.issues)
                    return
                }

                const { id, name } = experienceData.data

                const updataSyllabus = await prisma.syllabus.update({
                    where: { id },
                    data: {
                        name,
                    },
                    include: {
                        experiences: {
                            where: { id },
                            include: { subTopic: true },
                        },
                    },
                })
                res.status(200).json(updataSyllabus)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break
        case 'DELETE':
            try {
                const experienceData = syllabusIdValidate.safeParse(req.body)

                if (!experienceData.success) {
                    res.status(400).json(experienceData.error.issues)
                    return
                }

                const { id } = experienceData.data

                await prisma.syllabus.delete({
                    where: {
                        id,
                    },
                })

                const syllabus = await prisma.syllabus.findMany({
                    include: {
                        experiences: {
                            include: {
                                subTopic: true,
                            },
                        },
                    },
                })
                res.status(200).json(syllabus)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break
        default:
            res.status(405).end(`Method Not Allowed`)
    }
}
