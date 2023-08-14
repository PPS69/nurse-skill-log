import { motion } from 'framer-motion'
import { type GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

import { type CustomWriteExperience } from '../../components/ListData'
import Overview from '../../components/Overview'
import OverviewLoading from '../../components/Overview/loading'
import WritingExperience from '../../components/WritingExperience'
import prisma from '../../lib/prismadb'
import styles from './logbook.module.css'

import type { Approver, Hospital } from '@prisma/client'

export interface Props {
    experience: ExpWithSubAndWriteExp[]
    approver: Approver[]
    hospital: Hospital[]
    student: {
        studentId: string
    }
    isLoading: boolean
}

export interface ExpWithSubAndWriteExp {
    id: number
    name: string
    completed: boolean
    subTopic: [
        {
            id: number
            name?: string
            completed: boolean
            practicePrinciples: number
            throughoutTheCourse: number
            experienceId: number
            writeExperience: CustomWriteExperience[]
        }
    ]
}

export default function Logbook(props: Props): JSX.Element {
    const router = useRouter()
    const { approver, hospital } = props
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)

    const [toggleState, setToggleState] = useState<number>(1)
    const [experiencesData, setExperiencesData] = useState<
        ExpWithSubAndWriteExp[]
    >([])

    function toggleTab(index: number): void {
        setToggleState(index)
    }

    useEffect(() => {
        if (session?.user.role !== 'student') {
            void router.push('/')
        }
        async function getSyllabus(): Promise<void> {
            try {
                setLoading(true)
                const res = await fetch('/api/user/student/syllabus')
                const data = await res.json()
                // console.log(data)
                if (res.ok) {
                    // const { syllabus: experiences } = data
                    // setExperiencesData(experiences.experiences)
                    setExperiencesData(data)
                } else {
                    setExperiencesData([])
                    // setExperiences(experiencedb)
                }
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        void getSyllabus()
    }, [])

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <Head>
                    <title>NU: Nure Skills Log | Logbook</title>
                    <meta
                        name='description'
                        content='for write the skills log'
                    />
                </Head>
                <h1 className={styles.header}>สมุดบันทึกประสบการณ์ของฉัน</h1>
                <div className={styles.blocTabs}>
                    <button
                        className={
                            toggleState === 1
                                ? `${styles.activeTabs}`
                                : `${styles.tabs}`
                        }
                        onClick={() => {
                            toggleTab(1)
                        }}
                    >
                        ภาพรวมสมุดบันทึก
                        <i
                            className='fa fa-check-circle-o'
                            style={{ paddingLeft: '10px' }}
                        />
                    </button>
                    <button
                        className={
                            toggleState === 2
                                ? `${styles.activeTabs}`
                                : `${styles.tabs}`
                        }
                        onClick={() => {
                            toggleTab(2)
                        }}
                    >
                        เขียนบันทึก
                        <i
                            className='fa fa-pencil-square-o'
                            style={{ paddingLeft: '10px' }}
                        />
                    </button>
                </div>
                <main className={styles.contentTab}>
                    <section
                        className={
                            toggleState === 1
                                ? `${styles.containerActive}`
                                : `${styles.container}`
                        }
                        id='syllabus'
                    >
                        {loading ? (
                            <OverviewLoading />
                        ) : (
                            <Overview data={experiencesData} />
                        )}
                    </section>

                    <section
                        className={
                            toggleState === 2
                                ? `${styles.containerActive}`
                                : `${styles.container}`
                        }
                        id='syllabus'
                    >
                        <WritingExperience
                            experience={experiencesData}
                            approver={approver}
                            hospital={hospital}
                            student={session?.user}
                            isLoading={loading}
                        />
                    </section>
                </main>
            </motion.div>
        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const approver = await prisma.approver.findMany()
    const hospital = await prisma.hospital.findMany()

    return { props: { approver, hospital }, revalidate: 60 }
}
