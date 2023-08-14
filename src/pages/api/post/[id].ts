import { type NextApiRequest, type NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import prisma from '../../../lib/prismadb'
import { authOptions } from '../auth/[...nextauth]'

const updateWriteExperienceSchema = z.object({
    comment: z.string().nullable(),
    status: z.enum(['new', 'wait', 'approved', 'rejected']),
    experienceId: z.number().optional(),
    subTopicId: z.number().optional(),
    studentId: z.string().optional(),
})

export default async function handle(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const { method, query } = req

    const id = query.id as string

    const session = await getServerSession(req, res, authOptions)
    if (session == null) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    switch (method) {
        case 'PUT':
            try {
                const checkData = updateWriteExperienceSchema.safeParse(
                    req.body
                )
                if (!checkData.success) {
                    res.status(400).json(checkData.error.issues)
                    return
                }

                const { status, comment, experienceId, subTopicId, studentId } =
                    checkData.data

                const newData = await prisma.writeExperience.update({
                    where: { id },
                    data: {
                        comment,
                        status,
                    },
                    include: {
                        experience: {
                            select: {
                                name: true,
                            },
                        },
                        subTopic: {
                            select: {
                                name: true,
                            },
                        },
                        student: {
                            select: { name: true },
                        },
                    },
                })

                const checkSubTopicCompleted = await prisma.subTopic.findFirst({
                    where: { id: subTopicId },
                    select: {
                        practicePrinciples: true,
                        throughoutTheCourse: true,
                        experience: { select: { id: true, subTopic: true } },
                        writeExperience: {
                            where: { studentId, status: 'approved' },
                        },
                    },
                })

                if (checkSubTopicCompleted == null) return

                const {
                    practicePrinciples,
                    throughoutTheCourse,
                    experience,
                    writeExperience,
                } = checkSubTopicCompleted

                const sum = practicePrinciples + throughoutTheCourse

                if (writeExperience.length >= sum) {
                    await prisma.completed.update({
                        where: { studentId },
                        data: {
                            subTopic: {
                                connect: {
                                    id: subTopicId,
                                },
                            },
                        },
                    })
                } else {
                    await prisma.completed.update({
                        where: { studentId },
                        data: {
                            subTopic: {
                                disconnect: {
                                    id: subTopicId,
                                },
                            },
                        },
                    })
                }
                const checkExperienceCompleted =
                    await prisma.completed.findFirst({
                        where: {
                            studentId,
                        },
                        include: {
                            subTopic: {
                                where: { experienceId },
                            },
                        },
                    })

                if (checkExperienceCompleted == null) return

                const { subTopic } = checkExperienceCompleted

                if (subTopic.length >= experience.subTopic.length) {
                    await prisma.completed.update({
                        where: { studentId },
                        data: {
                            experience: {
                                connect: {
                                    id: experienceId,
                                },
                            },
                        },
                    })
                } else {
                    await prisma.completed.update({
                        where: { studentId },
                        data: {
                            experience: {
                                disconnect: {
                                    id: experienceId,
                                },
                            },
                        },
                    })
                }

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
