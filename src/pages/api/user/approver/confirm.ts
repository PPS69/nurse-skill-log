import { type NextApiRequest, type NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

import { mailOptions, transporter } from '../../../../lib/nodemailer'
import prisma from '../../../../lib/prismadb'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const { method } = req

    const { id, name, email, value } = req.body

    const link = process.env.NEXTAUTH_URL

    // console.log(req.body)

    const session = await getServerSession(req, res, authOptions)
    if (session === null) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    switch (method) {
        case 'GET':
            try {
                const waitApprovers = await prisma.user.findMany({
                    where: { role: 'wait' },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                })
                // console.log(waitApprovers)
                res.status(200).json(waitApprovers)
            } catch (error) {
                console.log(error)
                res.status(500).json('Something went wrong')
            }
            break

        case 'POST':
            try {
                if (value === 'approved') {
                    await prisma.user.update({
                        where: { id },
                        data: {
                            role: 'approver',
                            approver: {
                                create: {
                                    name,
                                    email,
                                },
                            },
                        },
                    })
                    await transporter.sendMail({
                        ...mailOptions,
                        to: email,
                        subject: 'Account Confirmation',
                        text: 'บัญชีของท่านได้รับการยืนยันแล้ว',
                        html: `<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>แจ้งสถานะการยืนยันบัญชี</title></head><body><h1>แจ้งสถานะการยืนยันบัญชี</h1><p>บัญชีของท่านได้รับการยืนยันแล้ว</p><p>คลิกที่ลิงก์ด้านล่างเพื่อเข้าใช้งานเว็บไซต์ระบบติดตามการฝึกประสบการณ์พยาบาล</p><p><a href="${link}">${link}</a></p></body></html>`,
                    })
                } else if (value === 'rejected') {
                    await prisma.user.delete({
                        where: { id },
                    })
                }

                const waitApprovers = await prisma.user.findMany({
                    where: { role: 'wait' },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                })

                res.status(200).json(waitApprovers)
            } catch (error) {
                console.log(error)
                res.status(500).json(error)
            }
            break
        default:
            res.status(405).end(`Method Not Allowed`)
    }
}
