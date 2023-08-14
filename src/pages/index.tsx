import { motion } from 'framer-motion'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import {
    useEffect,
    useState,
    createContext,
    type Dispatch,
    type SetStateAction,
} from 'react'

import { toast } from 'react-hot-toast'
import ListData, { type CustomWriteExperience } from '../components/ListData'
import styles from '../styles/Home.module.css'

interface ChangeStatus {
    status: string
    comment?: string
    data: Array<{ id: string }>
}

export const WriteExperienceContext = createContext<{
    writeExperience: CustomWriteExperience[]
    setWriteExperience: Dispatch<SetStateAction<CustomWriteExperience[]>>
}>({
    writeExperience: [],
    setWriteExperience: () => {},
})

export default function Home(): JSX.Element | undefined {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [writeExperience, setWriteExperience] = useState<
        CustomWriteExperience[]
    >([])

    const { data: session } = useSession()

    function changeStatus(data: ChangeStatus): void {
        void fetch('/api/post', {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(async (res) => await res.json())
            .then((data: CustomWriteExperience[]) => {
                setWriteExperience(data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const getWriteExperience = async (): Promise<void> => {
        try {
            setLoading(true)
            const res = await fetch('/api/post')
            const data = (await res.json()) as CustomWriteExperience[]
            // console.log('index: ', data)
            if (!res.ok) {
                throw new Error('No data found')
            } else if (res.ok) {
                setWriteExperience(data)
                if (session?.user.role === 'approver') {
                    setTimeout(function () {
                        const newData = data.filter(
                            (value) => value.status === 'new'
                        )
                        const updateData: ChangeStatus = {
                            status: 'wait',
                            data: newData,
                        }
                        changeStatus(updateData)
                    }, 3000)
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        toast.dismiss()
        if (
            session?.user.role === 'approver' ||
            session?.user.role === 'student'
        ) {
            void getWriteExperience()
        } else if (session?.user.role === 'admin') {
            void router.push('/admin')
        }
    }, [])

    function countStatuses(objects: CustomWriteExperience[]): string {
        // console.log(objects)
        const counts: Record<string, number> = {}

        for (const obj of objects) {
            if (obj.status === 'new' || obj.status === 'wait') {
                if (counts[obj.status] === 0 || isNaN(counts[obj.status])) {
                    counts[obj.status] = 0
                }
                counts[obj.status]++
            }
        }

        if (counts.new > 0 && counts.wait > 0) {
            return `คุณมี ${counts.new} รายการใหม่ และ ${counts.wait} รายการรออนุมัติ `
        } else if (counts.new > 0) {
            return `คุณมี ${counts.new} รายการใหม่`
        } else if (counts.wait > 0) {
            return `คุณมี ${counts.wait} รายการรออนุมัติ`
        } else {
            return `คุณไม่มีรายการรออนุมัติ`
        }
    }

    // if (session?.user.role === 'admin') {
    //     router.push('/admin')
    // }

    if (session?.user.role === 'student' || session?.user.role === 'approver') {
        return (
            <motion.div exit={{ opacity: 0 }}>
                <Head>
                    <title>NU: Nure Skills Log | Home</title>
                    <meta name='description' content='homepage' />
                </Head>
                {!loading ? (
                    <div className={styles.headerInfo}>
                        <h1 className={styles.header}>หน้าหลัก</h1>
                        {session?.user.role === 'approver' ? (
                            <span className={styles.list}>
                                <i
                                    className='fa fa-bell'
                                    style={{ paddingRight: '10px' }}
                                />
                                {countStatuses(writeExperience)}
                            </span>
                        ) : (
                            <></>
                        )}
                    </div>
                ) : (
                    <div className={styles.headerInfo}>
                        <h1 className={styles.header}>หน้าหลัก</h1>
                        {session?.user.role === 'approver' ? (
                            <span className={styles.list}>
                                <i
                                    className='fa fa-circle-o-notch fa-spin'
                                    style={{ fontSize: '24px' }}
                                />
                            </span>
                        ) : (
                            <></>
                        )}
                    </div>
                )}
                <div className={styles.container}>
                    <WriteExperienceContext.Provider
                        value={{ writeExperience, setWriteExperience }}
                    >
                        <ListData
                            role={session?.user.role}
                            isLoading={loading}
                        />
                    </WriteExperienceContext.Provider>
                </div>
            </motion.div>
        )
    }
}
