import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import prisma from '../../../lib/prismadb'
import { authOptions } from '../auth/[...nextauth]'
import type { NextApiRequest, NextApiResponse } from 'next'

const postWriteExperienceSchema = z.object({
    date: z.string().datetime(),
    hospital: z.string().min(5).max(100).trim(),
    ward: z.string().optional(),
    patientBed: z.string().optional(),
    experienceId: z.number(),
    subTopicId: z.number(),
    approverId: z.string().cuid(),
    studentId: z.string().length(8),
})

const updateWriteExperienceSchema = z.object({
    status: z.enum(['wait', 'approved', 'rejected']),
    comment: z.string().optional().nullable(),
    data: z.array(
        z.object({
            id: z.string().cuid(),
            experienceId: z.number(),
            subTopicId: z.number(),
            studentId: z.string().length(8),
        })
    ),
})

export default async function handle(
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
                // Find and get all WritedExpreiences that are included in this id

                if (session.user.role === 'student') {
                    const getAllWritedExpreience =
                        await prisma.writeExperience.findMany({
                            where: {
                                studentId: session.user.studentId,
                            },
                            orderBy: {
                                createdAt: 'desc',
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
                                approver: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        })
                    res.status(200).json(getAllWritedExpreience)
                } else if (session.user.role === 'approver') {
                    const getAllWritedExpreience =
                        await prisma.writeExperience.findMany({
                            where: {
                                approverId: session.user.id,
                            },
                            orderBy: {
                                createdAt: 'desc',
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

                    res.status(200).json(getAllWritedExpreience)
                }
            } catch (error) {
                console.log(error)
                res.status(400).json({ error: 'something went wrong' })
            }
            break

        case 'POST':
            try {
                const writeExperienceData = postWriteExperienceSchema.safeParse(
                    req.body
                )

                if (!writeExperienceData.success) {
                    res.status(400).json(writeExperienceData.error.issues)
                    return
                }

                const postWritedExpreience =
                    await prisma.writeExperience.create({
                        data: writeExperienceData.data,
                    })
                res.status(201).json(postWritedExpreience)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break

        case 'PUT':
            try {
                const update = updateWriteExperienceSchema.safeParse(req.body)

                if (!update.success) {
                    res.status(400).json(update.error.issues)
                    return
                } else {
                    const { status, comment, data } = update.data
                    await Promise.all(
                        data.map(async (value) => {
                            await prisma.writeExperience.update({
                                where: { id: value.id },
                                data: {
                                    status,
                                    comment,
                                },
                            })
                            const { experienceId, subTopicId, studentId } =
                                value
                            const checkSubTopicCompleted =
                                await prisma.subTopic.findFirst({
                                    where: { id: subTopicId },
                                    select: {
                                        practicePrinciples: true,
                                        throughoutTheCourse: true,
                                        experience: {
                                            select: {
                                                id: true,
                                                subTopic: true,
                                            },
                                        },
                                        writeExperience: {
                                            where: {
                                                studentId,
                                                status: 'approved',
                                            },
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
                        })
                    ).catch(Error)
                }

                const newData = await prisma.writeExperience.findMany({
                    where: { approverId: session.user.id },
                    orderBy: {
                        createdAt: 'desc',
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
                res.status(200).json(newData)
            } catch (error) {
                console.log(error)
                res.status(500).json('Internal Server Error')
            }
            break

        default:
            res.status(405).json(`Method Not Allowed`)
    }
}
