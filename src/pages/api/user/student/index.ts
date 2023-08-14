import { type NextApiRequest, type NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import prisma from '../../../../lib/prismadb'
import incryptPassword from '../../../../utils/bycrypt'
import { authOptions } from '../../auth/[...nextauth]'

const studentUpdateSchema = z.object({
    id: z.string().cuid(),
    studentId: z
        .string()
        .min(8, 'รหัสนิสิตต้องมี 8 ตัว')
        .max(8, 'รหัสนิสิตต้องมี 8 ตัว'),
    name: z
        .string()
        .min(3, 'มีชื่อที่สั้นเกินไป')
        .max(70, 'มีชื่อที่ยาวเกินไป')
        .trim(),
    email: z.string().email().min(5).trim(),
    syllabusId: z.number(),
})

const studentPostSchema = z.array(
    z.object({
        studentId: z
            .string()
            .min(8, 'รหัสนิสิตต้องมี 8 ตัว')
            .max(8, 'รหัสนิสิตต้องมี 8 ตัว'),
        name: z
            .string()
            .min(3, 'มีชื่อที่สั้นเกินไป')
            .max(70, 'มีชื่อที่ยาวเกินไป')
            .trim(),
        email: z.string().email().min(5).trim(),
        // syllabusId: z.string(),
        password: z.string().optional().nullable(),
    })
)

const userIdSchema = studentUpdateSchema.pick({ id: true })

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
                const students = await prisma.user.findMany({
                    where: { role: 'student' },
                    orderBy: { Student: { studentId: 'asc' } },
                    include: {
                        Student: {
                            select: {
                                studentId: true,
                                syllabus: true,
                            },
                        },
                    },
                })

                // console.log(students)

                res.status(200).json(students)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break
        case 'POST':
            try {
                const studentData = studentPostSchema.safeParse(req.body)

                if (!studentData.success) {
                    res.status(400).json(studentData.error.issues)
                    return
                }
                await Promise.all(
                    studentData.data.map(async (value) => {
                        await prisma.user.create({
                            data: {
                                email: value.email,
                                name: value.name,
                                role: 'student',
                                password: await incryptPassword(
                                    value.password != null ? value.password : ''
                                ),
                                Student: {
                                    create: {
                                        studentId: value.studentId,
                                        email: value.email,
                                        name: value.name,
                                        // syllabusId: value.syllabusId,
                                        completed: {
                                            create: {},
                                        },
                                    },
                                },
                            },
                        })
                    })
                ).catch((error) => {
                    console.log(error.message)
                    res.status(400).json({ error })
                })

                const newData = await prisma.user.findMany({
                    where: { role: 'student' },
                    orderBy: { Student: { studentId: 'asc' } },
                    include: {
                        Student: {
                            select: {
                                studentId: true,
                                syllabus: true,
                            },
                        },
                    },
                })

                res.status(201).json(newData)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break
        case 'PUT':
            try {
                const studentData = studentUpdateSchema.safeParse(req.body)

                if (!studentData.success) {
                    res.status(400).json(studentData.error.issues)
                    return
                }

                const { id, name, email, studentId, syllabusId } =
                    studentData.data

                const newData = await prisma.user.update({
                    where: { id },
                    data: {
                        name,
                        email,
                        Student: {
                            update: {
                                name,
                                email,
                                studentId,
                                syllabusId,
                            },
                        },
                    },
                    include: {
                        Student: {
                            select: {
                                studentId: true,
                                syllabus: true,
                            },
                        },
                    },
                })

                res.status(200).json(newData)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break
        case 'DELETE':
            try {
                const userId = userIdSchema.safeParse(req.body)

                if (!userId.success) {
                    res.status(400).json(userId.error.issues)
                    return
                }

                const { id } = userId.data

                await prisma.user.delete({
                    where: {
                        id,
                    },
                })

                const allStudents = await prisma.user.findMany({
                    where: { role: 'student' },
                    orderBy: { Student: { studentId: 'asc' } },
                    include: {
                        Student: {
                            select: { studentId: true, syllabus: true },
                        },
                    },
                })

                res.status(200).json(allStudents)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break

        default:
            res.status(405).json(`Method Not Allowed`)
    }
}
