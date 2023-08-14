import { getServerSession } from 'next-auth'
import { z } from 'zod'

import prisma from '../../../../../lib/prismadb'
import { authOptions } from '../../../auth/[...nextauth]'
import type { NextApiRequest, NextApiResponse } from 'next'

const experienceUpdataValidation = z.object({
    id: z.number(),
    experienceName: z
        .string({
            required_error: 'Experience Name is required',
        })
        .min(3, 'ชื่อประสบการณ์สั้นเกินไป')
        .max(100)
        .trim(),
})

const experiencePostValidation = experienceUpdataValidation.omit({ id: true })
const experienceIdValidation = experienceUpdataValidation.pick({ id: true })

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
            return
        }

        switch (method) {
            case 'POST':
                try {
                    const experienceData = experiencePostValidation.safeParse(
                        req.body
                    )

                    if (!experienceData.success) {
                        res.status(400).json(experienceData.error.issues)
                        return
                    }

                    const { experienceName } = experienceData.data

                    const createExperience = await prisma.experience.create({
                        data: {
                            name: experienceName,
                            syllabus: { connect: { id: syllabusId } },
                        },
                    })

                    const newData = await prisma.syllabus.findFirst({
                        where: { id: syllabusId },
                        include: {
                            experiences: {
                                where: { id: createExperience.id },
                                include: { subTopic: true },
                            },
                        },
                    })
                    // console.log(newData)
                    res.status(201).json(newData)
                } catch (error) {
                    console.log(error)
                    res.status(500).json(error)
                }
                break
            case 'PUT':
                try {
                    const experienceData = experienceUpdataValidation.safeParse(
                        req.body
                    )

                    if (!experienceData.success) {
                        res.status(400).json(experienceData.error.issues)
                        return
                    }

                    const { id, experienceName } = experienceData.data

                    const updataExperience = await prisma.syllabus.update({
                        where: { id: syllabusId },
                        data: {
                            experiences: {
                                update: {
                                    where: { id },
                                    data: { name: experienceName },
                                },
                            },
                        },
                        include: {
                            experiences: {
                                where: { id },
                                include: { subTopic: true },
                            },
                        },
                    })
                    // console.log(updataExperience)
                    res.status(200).json(updataExperience)
                } catch (error) {
                    console.log(error)
                    res.status(500).json(error)
                }
                break
            case 'DELETE':
                try {
                    const experienceData = experienceIdValidation.safeParse(
                        req.body
                    )

                    if (!experienceData.success) {
                        res.status(400).json(experienceData.error.issues)
                        return
                    }

                    const { id } = experienceData.data

                    await prisma.experience.delete({
                        where: {
                            id,
                        },
                    })

                    res.status(200).json({
                        id: syllabusId,
                        experiences: [{ id }],
                    })
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
