import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import AllSyllabus from '../../../components/Admin/syllabus'
import { type customExperience } from '../../../reducer/admin/experience'
import { fetchData } from '../../../utils/fetcher'
import styles from '../admin.module.css'

export interface customSyllabus {
    id: number
    name: string
    experiences: customExperience[]
}

export default function SyllabusManagement(): JSX.Element | undefined {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [syllabusList, setSyllabusList] = useState<customSyllabus[]>([])

    const { data: session } = useSession()

    const getAllSyllabus = async (): Promise<void> => {
        try {
            setLoading(true)
            const res = await fetch('/api/syllabus')
            const data = (await res.json()) as customSyllabus[]
            // console.log('main: ', data)
            if (!res.ok) {
                throw new Error('No data found')
            } else if (res.ok) {
                setSyllabusList(data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    async function addSyllabus(): Promise<void> {
        try {
            const { data, status } = await fetchData<customSyllabus>(
                '/api/syllabus',
                'POST'
            )
            if (status === 201) {
                // console.log('index: ', data)
                setSyllabusList([...syllabusList, data])
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (session?.user.role === 'admin') {
            void getAllSyllabus()
        } else {
            void router.push('/')
        }
    }, [])

    if (session?.user.role === 'admin')
        return (
            <>
                <Head>
                    <title>NU: Nure Skills Log | Home</title>
                    <meta name='description' content='admin homepage' />
                </Head>

                <div className={styles.content}>
                    {loading ? (
                        <i className='fa fa-circle-o-notch fa-spin' />
                    ) : (
                        <>
                            <div className={styles.openModal}>
                                <button
                                    disabled={loading}
                                    onClick={() => {
                                        void addSyllabus()
                                    }}
                                >
                                    เพิ่มหลักสูตร
                                </button>
                            </div>
                            <AllSyllabus
                                syllabusList={syllabusList}
                                setSyllabusList={setSyllabusList}
                            />
                        </>
                    )}
                </div>
            </>
        )
}
