import { type ParsedUrlQuery } from 'querystring'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import Overview from '../../../../components/Overview'
import prisma from '../../../../lib/prismadb'
import { type ExpWithSubAndWriteExp } from '../../../logbook'
import styles from '../../admin.module.css'
import type { GetStaticProps, GetStaticPaths } from 'next'

interface IParams extends ParsedUrlQuery {
    studentId: string
}

interface OneStudentProps {
    student: Student
}

interface Student {
    studentId: string
    name: string
    email: string
    password: string
}

export default function OneStudent({
    student,
}: OneStudentProps): JSX.Element | undefined {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [experiencesData, setExperiencesData] = useState<
        ExpWithSubAndWriteExp[]
    >([])

    const { data: session } = useSession()

    useEffect(() => {
        const studentId = student?.studentId
        async function getSyllabus(): Promise<void> {
            try {
                setLoading(true)
                const res = await fetch('/api/user/student/syllabus', {
                    headers: {
                        'X-Student-Id': studentId,
                    },
                })

                const experiences = await res.json()
                // console.log(experiences)
                setExperiencesData(experiences)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }

        if (router.isFallback) {
            return
        }
        void getSyllabus()
    }, [])

    if (session == null || session.user.role !== 'admin') {
        return <div>You do not have permission to access this page.</div>
    }

    return (
        <>
            <Head>
                <title>NU: Nure Skills Log | {student?.name}</title>
                <meta name='description' content='admin user management' />
            </Head>

            <div className={styles.content}>
                {loading || router.isFallback ? (
                    <i className='fa fa-circle-o-notch fa-spin' />
                ) : (
                    <>
                        <p className={styles.studentIdHeader}>
                            สมุดบันทึกของ {student?.studentId} {student?.name}
                        </p>
                        <div className={styles.syllabusContainer}>
                            <Overview data={experiencesData} />
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const students = await prisma.student.findMany()

    const paths = students.map((student) => ({
        params: { studentId: student.studentId },
    }))

    return { paths, fallback: true }
}
export const getStaticProps: GetStaticProps = async (context) => {
    const { studentId } = context.params as IParams
    const student = await prisma.student.findFirst({
        where: { studentId },
    })

    return { props: { student }, revalidate: 10 }
}
