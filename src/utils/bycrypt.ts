import bcrypt from 'bcrypt'

export default async function incryptPassword(
    password: string
): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    return hashedPassword
}
