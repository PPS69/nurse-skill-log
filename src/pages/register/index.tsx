import { motion } from 'framer-motion'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { type FormEvent, type ChangeEvent, useState } from 'react'
import toast from 'react-hot-toast'

import bg from '../../../public/bg.jpg'
import None from '../../components/Layout/none'
import styles from './register.module.css'

export default function Register(): JSX.Element {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [userInfo, setUserInfo] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [show, setShow] = useState({
        password: false,
        confirmPassword: false,
    })

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault()
        let toastId: string | undefined
        try {
            toast.dismiss(toastId)
            toastId = toast.loading('Loading...')
            setLoading(true)

            const res = await fetch('/api/register/approver', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    name: userInfo.firstname.concat(' ', userInfo.lastname),
                    email: userInfo.email,
                    password: userInfo.password,
                    confirmPassword: userInfo.confirmPassword,
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
            if (res.status === 409) {
                toast.error('email นี้มีผู้ใช้งานแล้ว', { id: toastId })
            }

            if (res.status === 500) {
                toast.error('Internal Server Error', { id: toastId })
            }

            if (res.status === 201) {
                toast.success('ลงทะเบียนเสร็จสิ้น 😎', { id: toastId })
                void router.push('/login')
            }
        } catch (error) {
            console.log(error)
            toast.error('Unable to sign in', { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
    }

    return (
        <>
            <Head>
                <title>NU: Nure Skills Log | Register</title>
                <meta name='description' content='approver register page' />
            </Head>
            <div className={styles.container}>
                <section className={styles.section}>
                    <div className={styles.imgBox}>
                        <Image
                            src={bg}
                            alt='background'
                            sizes='(max-width: 768px)'
                            priority
                            fill
                            className={styles.image}
                        />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.3,
                        }}
                        className={styles.contentBox}
                    >
                        <div className={styles.formBox}>
                            <h1 className={styles.header}>
                                ลงทะเบียนผู้นิเทศ
                                <label className={styles.subHeader}>
                                    ระบบติดตามการฝึกประสบการณ์พยาบาล
                                </label>
                            </h1>
                            <form
                                onSubmit={(e) => {
                                    void handleSubmit(e)
                                }}
                            >
                                <label htmlFor='firstname'>ชื่อ</label>
                                <input
                                    required
                                    disabled={loading}
                                    type='text'
                                    name='firstname'
                                    className={styles.inputBox}
                                    onChange={handleChange}
                                />
                                <label htmlFor='lastname'>นามสกุล</label>
                                <input
                                    required
                                    disabled={loading}
                                    type='text'
                                    name='lastname'
                                    className={styles.inputBox}
                                    onChange={handleChange}
                                />
                                <label htmlFor='email'>อีเมล</label>
                                <input
                                    required
                                    disabled={loading}
                                    type='email'
                                    name='email'
                                    className={styles.inputBox}
                                    onChange={handleChange}
                                />

                                <label htmlFor='password'>รหัสผ่าน</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        required
                                        disabled={loading}
                                        type={
                                            show.password ? 'text' : 'password'
                                        }
                                        name='password'
                                        title='ต้องมีอย่างน้อย 8 ตัว'
                                        pattern='.{8,}'
                                        className={styles.inputBox}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type='button'
                                        className={
                                            show.password
                                                ? 'fa fa-eye'
                                                : 'fa fa-eye-slash'
                                        }
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setShow({
                                                ...show,
                                                password: !show.password,
                                            })
                                        }}
                                    />
                                </div>
                                <label htmlFor='confirmPassword'>
                                    ยืนยันรหัสผ่าน
                                </label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        required
                                        disabled={loading}
                                        type={
                                            show.confirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        name='confirmPassword'
                                        className={styles.inputBox}
                                        onChange={handleChange}
                                    />

                                    <button
                                        type='button'
                                        className={
                                            show.confirmPassword
                                                ? 'fa fa-eye'
                                                : 'fa fa-eye-slash'
                                        }
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setShow({
                                                ...show,
                                                confirmPassword:
                                                    !show.confirmPassword,
                                            })
                                        }}
                                    />
                                </div>
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
                            <p className={styles.login}>
                                มีบัญชีแล้ว ?{' '}
                                <Link href={'/login'}>
                                    <b style={{ padding: '0 5px' }}>
                                        เข้าสู่ระบบ
                                    </b>
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </section>
            </div>
        </>
    )
}

Register.PageLayout = None
