import { type NextApiRequest, type NextApiResponse } from 'next'
import { z } from 'zod'
import prisma from '../../../lib/prismadb'
import incryptPassword from '../../../utils/bycrypt'

const registerSchema = z
    .object({
        name: z
            .string({
                required_error: 'Name is required',
            })
            .min(3)
            .max(70)
            .trim(),
        email: z
            .string({
                required_error: 'Email is required',
            })
            .email('รูปแบบ email ไม่ถูกต้อง')
            .min(5),
        password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัว'),
        confirmPassword: z.string(),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
            ctx.addIssue({
                code: 'custom',
                message: 'รหัสผ่านไม่ตรงกัน',
            })
        }
    })

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const { method } = req

    switch (method) {
        case 'POST':
            try {
                const userData = registerSchema.safeParse(req.body)

                if (!userData.success) {
                    // console.log(userData)
                    res.status(400).json(userData.error.issues)
                    return
                }

                const { name, email, password } = userData.data

                const checkEmail = await prisma.user.findUnique({
                    where: {
                        email,
                    },
                })

                if (checkEmail !== null) {
                    res.status(409).json({
                        message: 'This email already exists',
                    })
                    return
                }

                const hashedPassword = await incryptPassword(password)

                const user = await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role: 'wait',
                    },
                })
                res.status(201).json({
                    message: 'User created successfully',
                    user,
                })
            } catch (error) {
                console.error(error)
                res.status(500).json('Error registering user')
            }
            break
        default:
            res.status(405).json(`Method Not Allowed`)
    }
}
