import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { signIn, signOut } from 'next-auth/react'
import { useState, useEffect, type FormEvent } from 'react'
import toast from 'react-hot-toast'

import bg from '../../../../public/bg.jpg'
import None from '../../../components/Layout/none'
import styles from '../register.module.css'

export default function RegisterStudent(): JSX.Element {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [userInfo, setUserInfo] = useState({
        fullname: '',
        email: '',
        studentId: '',
    })

    useEffect(() => {
        const getSession = async (): Promise<void> => {
            const res = await fetch('/api/register/student')
            if (res.status === 403) {
                void router.push('/')
                toast.error('คุณไม่มีสิทธิ')
            } else if (res.status === 401) {
                void router.push('/login')
                toast.error('คุณไม่ได้เข้าสู่ระบบ')
            } else if (res.status === 400) {
                const error = await res.json()
                console.log(error)
                error.map((error: any): void => {
                    toast.error(error.message)
                    return error.message
                })
            } else if (res.ok) {
                const data = await res.json()
                // console.log(data)
                setUserInfo({
                    ...userInfo,
                    fullname: data.name,
                    email: data.email,
                })
            }
        }
        getSession().catch(Error)
    }, [])

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault()
        let toastId: string | undefined
        try {
            toast.dismiss(toastId)
            toastId = toast.loading('Loading...')
            setLoading(true)

            const res = await fetch('/api/register/student', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify({
                    fullname: userInfo.fullname,
                    email: userInfo.email,
                    studentId: userInfo.studentId,
                }),
            })

            if (res.status === 400) {
                const error = await res.json()
                console.log(error)
                error.map((error: any) => {
                    toast.error(error.message, { id: toastId })
                    return error.message
                })
            }

            if (res.status === 500) {
                toast.error('Internal Server Error', { id: toastId })
            }

            if (res.status === 201) {
                toast.success('ลงทะเบียนเสร็จสิ้น 😎', { id: toastId })
                await signOut({ redirect: false })
                await signIn('google', { callbackUrl: '/' })
            }
            // toast.dismiss(toastId)
        } catch (error) {
            console.log(error)
            toast.error('Unable to sign in', { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Head>
                <title>Nure Website | Register</title>
                <meta name='description' content='student register page' />
            </Head>
            <div className={styles.container}>
                <section className={styles.section}>
                    <div className={styles.imgBox}>
                        <Image
                            src={bg}
                            alt='background'
                            fill
                            priority
                            sizes='(max-width: 768px)'
                            className={styles.image}
                        />
                    </div>
                    <div className={styles.contentBox}>
                        <div className={styles.formBox}>
                            <h2 className={styles.header}>ลงทะเบียนนิสิต</h2>
                            <form
                                onSubmit={(e) => {
                                    void handleSubmit(e)
                                }}
                            >
                                <label htmlFor='fullname'>ชื่อ-นามสกุล</label>
                                <input
                                    required
                                    type='text'
                                    name='fullname'
                                    className={styles.inputBox}
                                    value={userInfo.fullname}
                                    onChange={({ target }) => {
                                        setUserInfo({
                                            ...userInfo,
                                            fullname: target.value,
                                        })
                                    }}
                                />
                                <label htmlFor='email'>อีเมล</label>
                                <input
                                    required
                                    type='email'
                                    name='email'
                                    className={styles.inputBox}
                                    value={userInfo.email}
                                    disabled
                                    onChange={({ target }) => {
                                        setUserInfo({
                                            ...userInfo,
                                            email: target.value,
                                        })
                                    }}
                                />
                                <label htmlFor='รหัสนิสิต'>รหัสนิสิต</label>
                                <input
                                    required
                                    type='number'
                                    inputMode='numeric'
                                    name='รหัสนิสิต'
                                    minLength={8}
                                    maxLength={8}
                                    size={8}
                                    className={styles.inputBox}
                                    value={userInfo.studentId}
                                    onChange={({ target }) => {
                                        setUserInfo({
                                            ...userInfo,
                                            studentId: target.value,
                                        })
                                    }}
                                />
                                {loading ? (
                                    <input
                                        type='button'
                                        disabled
                                        className={styles.submitLoading}
                                        value='รอสักครู่...'
                                    />
                                ) : (
                                    <input
                                        type='submit'
                                        className={styles.submit}
                                        value='ลงทะเบียน'
                                    />
                                )}
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

RegisterStudent.PageLayout = None
