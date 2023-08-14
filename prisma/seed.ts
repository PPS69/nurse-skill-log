import { PrismaClient } from '@prisma/client'
import incryptPassword from '../src/utils/bycrypt'
import { Experience, Hospital, SubTopic } from './data'

const prisma = new PrismaClient()

async function main(): Promise<void> {
    await prisma.hospital.deleteMany()
    await prisma.subTopic.deleteMany()
    await prisma.experience.deleteMany()
    await prisma.approver.deleteMany()
    await prisma.student.deleteMany()
    await prisma.syllabus.deleteMany()
    await prisma.user.deleteMany()

    await prisma.hospital.createMany({
        data: Hospital,
    })

    await prisma.syllabus.create({
        data: {
            name: 'ปี 2562',
            experiences: {
                create: Experience,
            },
        },
    })

    await prisma.subTopic.createMany({
        data: SubTopic,
    })

    const hashedPassword = await incryptPassword('123123123')

    await prisma.user.create({
        data: {
            name: 'บัวหลวง',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
        },
    })

    await prisma.user.create({
        data: {
            name: 'สมศรี ธาตุทองซาวด์',
            email: 'approver@example.com',
            password: hashedPassword,
            role: 'approver',
            approver: {
                create: {
                    name: 'สมศรี ธาตุทองซาวด์',
                    email: 'approver@example.com',
                },
            },
        },
    })

    await prisma.user.create({
        data: {
            name: 'สมชาย หมายปองรัก',
            email: 'student@example.com',
            password: hashedPassword,
            role: 'student',
            Student: {
                create: {
                    studentId: '62364269',
                    name: 'สมชาย หมายปองรัก',
                    email: 'student@example.com',
                    completed: {
                        create: {},
                    },
                },
            },
        },
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .finally(async () => {
        await prisma.$disconnect()
    })
