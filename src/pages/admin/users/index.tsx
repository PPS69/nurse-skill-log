import { type User } from '@prisma/client'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import AllUser from '../../../components/Admin/user'
import styles from '../admin.module.css'

export default function UserManagement(): JSX.Element | undefined {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [userList, setUserList] = useState<User[]>()

    const { data: session } = useSession()

    const getAllUser = async (): Promise<void> => {
        try {
            setLoading(true)
            const res = await fetch('/api/user')
            const data = (await res.json()) as User[]
            // console.log('index: ', data)
            if (!res.ok) {
                throw new Error('No data found')
            } else if (res.ok) {
                setUserList(data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user.role === 'admin') {
            void getAllUser()
        } else {
            void router.push('/')
        }
    }, [])

    if (session?.user.role === 'admin')
        return (
            <>
                <Head>
                    <title>NU: Nure Skills Log | User</title>
                    <meta name='description' content='admin user management' />
                </Head>

                <div className={styles.content}>
                    {loading ? (
                        <i className='fa fa-circle-o-notch fa-spin' />
                    ) : (
                        <AllUser
                            userList={userList}
                            setUserList={setUserList}
                        />
                    )}
                </div>
            </>
        )
}
