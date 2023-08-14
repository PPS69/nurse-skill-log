import { getServerSession } from 'next-auth'
import { z } from 'zod'

import prisma from '../../../../../lib/prismadb'
import { authOptions } from '../../../auth/[...nextauth]'
import type { NextApiRequest, NextApiResponse } from 'next'

const subTopicValidation = z.object({
    experienceId: z.number(),
    name: z.string().max(100).trim().nullable(),
    practicePrinciples: z.number(),
    throughoutTheCourse: z.number(),
})

const subTopicUpdateValidation = subTopicValidation.extend({
    id: z.number(),
})

const subTopicIdValidation = subTopicUpdateValidation.pick({
    id: true,
    experienceId: true,
})

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const { method, query } = req

    const syllabusId = parseInt(query.id as string)

    try {
        const session = await getServerSession(req, res, authOptions)
        if (session == null) {
            res.status(401).json({ error: 'Unauthorized' })
        }

        switch (method) {
            case 'POST':
                try {
                    const subTopicData = subTopicValidation.safeParse(req.body)

                    if (!subTopicData.success) {
                        res.status(400).json(subTopicData.error.issues)
                        return
                    }

                    const {
                        experienceId,
                        name,
                        practicePrinciples,
                        throughoutTheCourse,
                    } = subTopicData.data

                    await prisma.subTopic.create({
                        data: {
                            name,
                            practicePrinciples,
                            throughoutTheCourse,
                            experience: { connect: { id: experienceId } },
                        },
                    })

                    const createSubtopic = await prisma.syllabus.findFirst({
                        where: { id: syllabusId },
                        include: {
                            experiences: {
                                where: { id: experienceId },
                                include: {
                                    subTopic: { orderBy: { id: 'asc' } },
                                },
                            },
                        },
                    })

                    // console.log('createSubtopic ====>', createSubtopic)
                    res.status(201).json(createSubtopic)
                } catch (error) {
                    console.log(error)
                    res.status(500).json(error)
                }
                break
            case 'PUT':
                try {
                    const subTopicData = subTopicUpdateValidation.safeParse(
                        req.body
                    )

                    if (!subTopicData.success) {
                        res.status(400).json(subTopicData.error.issues)
                        return
                    }

                    const {
                        id,
                        experienceId,
                        name,
                        practicePrinciples,
                        throughoutTheCourse,
                    } = subTopicData.data

                    const updatedSubTopic = await prisma.syllabus.update({
                        where: { id: syllabusId },
                        data: {
                            experiences: {
                                update: {
                                    where: { id: experienceId },
                                    data: {
                                        subTopic: {
                                            update: {
                                                where: { id },
                                                data: {
                                                    name,
                                                    practicePrinciples,
                                                    throughoutTheCourse,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        include: {
                            experiences: {
                                where: { id: experienceId },
                                include: {
                                    subTopic: { orderBy: { id: 'asc' } },
                                },
                            },
                        },
                    })
                    // console.log('====<>', updatedSubTopic)
                    res.status(200).json(updatedSubTopic)
                } catch (error) {
                    console.log(error)
                    res.status(500).json(error)
                }
                break

            case 'DELETE':
                try {
                    const subTopicData = subTopicIdValidation.safeParse(
                        req.body
                    )

                    if (!subTopicData.success) {
                        res.status(400).json(subTopicData.error.issues)
                        return
                    }

                    const { id, experienceId } = subTopicData.data

                    await prisma.subTopic.delete({
                        where: {
                            id,
                        },
                    })

                    const deleteSubtopic = await prisma.syllabus.findFirst({
                        where: { id: syllabusId },
                        include: {
                            experiences: {
                                where: { id: experienceId },
                                include: {
                                    subTopic: { orderBy: { id: 'asc' } },
                                },
                            },
                        },
                    })

                    // console.log('deleteSubtopic ====>', deleteSubtopic)
                    res.status(200).json(deleteSubtopic)
                } catch (error) {
                    console.log(error)
                    res.status(500).json(error)
                }
                break
            default:
                res.status(405).end(`Method Not Allowed`)
        }
    } catch (error) {
        res.status(500).json({ error: 'Server Error' })
    }
}
