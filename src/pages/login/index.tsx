import { motion } from 'framer-motion'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'

import bg from '../../../public/bg.jpg'
import None from '../../components/Layout/none'
import styles from './login.module.css'

export default function Login(): JSX.Element {
    const router = useRouter()
    const [userInfo, setUserInfo] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    let toastId: string

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault()
        try {
            toast.dismiss(toastId)
            toastId = toast.loading('Loading...')
            setLoading(true)

            const res = await signIn('credentials', {
                email: userInfo.email,
                password: userInfo.password,
                redirect: false,
            })
            if (!(res?.ok ?? false)) {
                toast.error(`${res?.error ?? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'}`, {
                    id: toastId,
                })
                return
            }
            if (res?.ok === true) {
                toast.dismiss(toastId)
                void router.push('/')
            }
            toast.dismiss(toastId)
        } catch (error) {
            console.log(error)
            toast.error('Unable to sign in', { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div exit={{ opacity: 0 }}>
            <Head>
                <title>NU: Nure Skills Log | Login</title>
                <meta name='description' content='login page' />
            </Head>
            <main className={styles.container}>
                <section className={styles.section}>
                    <div className={styles.imgBox}>
                        <Image
                            src={bg}
                            alt='backgroud'
                            fill
                            sizes='(max-width: 768px)'
                            priority
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
                                ลงชื่อเข้าใช้งาน{' '}
                                <label className={styles.subHeader}>
                                    ระบบติดตามการฝึกประสบการณ์พยาบาล
                                </label>
                            </h1>

                            <form
                                onSubmit={(e) => {
                                    void handleSubmit(e)
                                }}
                            >
                                <label htmlFor='email'>Email</label>
                                <input
                                    value={userInfo.email}
                                    type='email'
                                    name='email'
                                    className={styles.inputBox}
                                    required
                                    onChange={({ target }) => {
                                        setUserInfo({
                                            ...userInfo,
                                            email: target.value,
                                        })
                                    }}
                                />
                                <label htmlFor='password'>Password</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        value={userInfo.password}
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        name='password'
                                        title='รหัสผ่านต้องมีอย่างน้อย 8 ตัว'
                                        pattern='.{8,}'
                                        className={styles.inputBox}
                                        required
                                        onChange={({ target }) => {
                                            setUserInfo({
                                                ...userInfo,
                                                password: target.value,
                                            })
                                        }}
                                    />

                                    <button
                                        type='button'
                                        className={
                                            showPassword
                                                ? 'fa fa-eye'
                                                : 'fa fa-eye-slash'
                                        }
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setShowPassword(!showPassword)
                                        }}
                                    />
                                </div>
                                <div className={styles.forgetPass}>
                                    <button
                                        type='button'
                                        onClick={(e) => {
                                            e.preventDefault()
                                            toast.dismiss(toastId)
                                            toast('ติดต่อแอดมิน', {
                                                id: toastId,
                                            })
                                        }}
                                    >
                                        ลืมรหัสผ่าน ?
                                    </button>
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
                                        value='เข้าสู่ระบบ'
                                    />
                                )}
                                {/* <button
                                    type='button'
                                    className={styles.googleSignIn}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        toast.loading('Redirecting...', {
                                            id: toastId,
                                        })
                                        void signIn('google', {
                                            callbackUrl: '/',
                                        })
                                    }}
                                >
                                    <Image
                                        src='/google.svg'
                                        alt='Google Logo'
                                        width={32}
                                        height={32}
                                        className={styles.googleLogo}
                                    />
                                    Sign in with Google
                                </button> */}
                            </form>
                            <p className={styles.register}>
                                ไม่มีบัญชี ?{' '}
                                <Link href={'/register'}>
                                    <b style={{ padding: '0 5px' }}>
                                        ลงทะเบียน
                                    </b>
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </section>
            </main>
        </motion.div>
    )
}

Login.PageLayout = None
