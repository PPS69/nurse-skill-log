import { type NextApiRequest, type NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

import prisma from '../../../../lib/prismadb'
import { authOptions } from '../../auth/[...nextauth]'

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

    let studentId = ''

    if (session.user.role === 'admin') {
        studentId = req.headers['x-student-id'] as string
    } else if (session.user.role === 'student') {
        studentId = session.user.studentId
    } else {
        res.status(403).json('Forbidden')
    }

    switch (method) {
        case 'GET':
            try {
                const syllabus = await prisma.student.findFirst({
                    where: { studentId },
                    select: {
                        syllabus: {
                            select: {
                                experiences: {
                                    orderBy: { id: 'asc' },
                                    include: {
                                        subTopic: {
                                            orderBy: { id: 'asc' },
                                            include: {
                                                writeExperience: {
                                                    where: {
                                                        studentId,
                                                        status: 'approved',
                                                    },
                                                    orderBy: {
                                                        createdAt: 'asc',
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
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                })

                const completedData = await prisma.completed.findFirst({
                    where: { studentId },
                    select: {
                        experience: {
                            select: { id: true },
                        },
                        subTopic: { select: { id: true } },
                    },
                })

                res.status(200).json(
                    await compareIds(
                        syllabus?.syllabus.experiences as Topic[],
                        completedData as CompletedData
                    )
                )
            } catch (error) {
                console.log(error)
                res.status(500).json('Internal Server Error')
            }
            break
        default:
            res.status(405).json(`Method Not Allowed`)
    }
}

interface Topic {
    id: number
    name: string
    subTopic?: SubTopic[]
    completed: boolean
}

interface SubTopic {
    id: number
    name: string
    practicePrinciples: number
    throughoutTheCourse: number
    experienceId?: number
    completed: boolean
}

interface CompletedData {
    experience: Array<{ id: number }>
    subTopic: Array<{ id: number }>
}

async function compareIds(
    data: Topic[],
    completedData: CompletedData
): Promise<Topic[]> {
    data.forEach((topic) => {
        if (completedData.experience.some((exp) => exp.id === topic.id)) {
            topic.completed = true
        }
        if (topic.subTopic != null) {
            topic.subTopic.forEach((subTopic) => {
                if (
                    completedData.subTopic.some((sub) => sub.id === subTopic.id)
                ) {
                    subTopic.completed = true
                }
                if (
                    subTopic.experienceId != null &&
                    completedData.experience.some(
                        (exp) => exp.id === subTopic.experienceId
                    )
                ) {
                    subTopic.completed = true
                }
            })
        }
    })
    return data
}
