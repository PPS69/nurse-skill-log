import { type User } from '@prisma/client'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import Admin from '../../components/Admin'
import styles from './admin.module.css'

export default function AdminPage(): JSX.Element | undefined {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [approverList, setApproverList] = useState<User[]>([])

    const { data: session } = useSession()

    const getUser = async (): Promise<void> => {
        try {
            setLoading(true)
            const res = await fetch('/api/user/approver/confirm')
            const data = (await res.json()) as User[]
            // console.log('index: ', data)
            if (!res.ok) {
                throw new Error('No data found')
            } else if (res.ok) {
                setApproverList(data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user.role === 'admin') {
            void getUser()
        } else {
            void router.push('/')
        }
    }, [])

    if (session?.user.role === 'admin')
        return (
            <>
                <Head>
                    <title>NU: Nure Skills Log | Admin</title>
                    <meta name='description' content='admin homepage' />
                </Head>

                <div className={styles.content}>
                    {loading ? (
                        <i className='fa fa-circle-o-notch fa-spin' />
                    ) : approverList?.length > 0 ? (
                        <Admin
                            approverList={approverList}
                            setApproverList={setApproverList}
                        />
                    ) : (
                        <span className={styles.noData}>
                            ไม่มีผู้ใช้งานให้ยืนยัน
                        </span>
                    )}
                </div>
            </>
        )

    // if (session?.user.role === 'student' || session?.user.role === 'approver') {
    // }
}
