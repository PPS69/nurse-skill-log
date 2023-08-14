import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'

interface NavbarProps {
    onToggleSidebar: () => void
}

export default function Navbar({ onToggleSidebar }: NavbarProps): JSX.Element {
    const { data: session } = useSession()
    const router = useRouter()
    let toastId: string

    if (session?.user.role === 'wait') {
        toast.error('กรุณารอการยืนยันบัญชีของท่าน')
        void router.push('/login')
    } else if (session?.user.role === 'null') {
        toast.error('กรุณาใส่รหัสนิสิต')
        void router.push('/register/student')
    }

    return (
        <>
            <nav className='desktop'>
                {session?.user.role === 'admin' ? (
                    <button
                        onClick={onToggleSidebar}
                        className='sidebar-toggle'
                    >
                        <i className='fa fa-bars' />
                    </button>
                ) : (
                    <></>
                )}
                <header className='logo'>
                    <Link href='/'>
                        <h1>มหาวิทยาลัยนเรศวร</h1>
                    </Link>
                </header>
                {session?.user.role !== 'admin' ? (
                    <ul>
                        <Link href='/'>
                            <li
                                className={
                                    router.pathname === '/' ? 'active' : ''
                                }
                            >
                                <i
                                    className='fa fa-home'
                                    style={{ paddingRight: '5px' }}
                                />
                                หน้าหลัก
                            </li>
                        </Link>
                        {session?.user.role === 'student' ? (
                            <Link href='/logbook'>
                                <li
                                    className={
                                        router.pathname === '/logbook'
                                            ? 'active'
                                            : ''
                                    }
                                >
                                    <i
                                        className='fa fa-book'
                                        style={{ paddingRight: '5px' }}
                                    />
                                    สมุดบันทึก
                                </li>
                            </Link>
                        ) : (
                            <></>
                        )}
                    </ul>
                ) : (
                    <></>
                )}
                <span>
                    <i
                        className='fa fa-user-circle'
                        style={{ paddingRight: '10px' }}
                    />
                    {session?.user.role !== 'admin' ? 'สวัสดี' : 'สวัสดี admin'}{' '}
                    {session?.user.name}
                </span>

                <button
                    onClick={() => {
                        toast.loading('กำลังออกจากระบบ...', {
                            id: toastId,
                        })
                        void signOut({ callbackUrl: '/login' })
                    }}
                >
                    <i
                        className='fa fa-sign-out'
                        style={{ paddingRight: '5px' }}
                    />
                    ออกจากระบบ{' '}
                </button>
            </nav>
            <nav className='mobile'>
                <div className='logo'>
                    {session?.user.role === 'admin' ? (
                        <button onClick={onToggleSidebar}>
                            <i className='fa fa-bars' />
                        </button>
                    ) : (
                        <></>
                    )}
                    <h1>มหาวิทยาลัยนเรศวร</h1>
                </div>
                <div className='navigate'>
                    <Link href='/'>
                        <li>
                            หน้าหลัก
                            {router.pathname === '/' ? (
                                <motion.div
                                    className='underline'
                                    layoutId='underline'
                                />
                            ) : null}
                        </li>
                    </Link>
                    {session?.user.role === 'student' ? (
                        <Link href='/logbook'>
                            <li>
                                สมุดบันทึก
                                {router.pathname === '/logbook' ? (
                                    <motion.div
                                        className='underline'
                                        layoutId='underline'
                                    />
                                ) : null}
                            </li>
                        </Link>
                    ) : (
                        <></>
                    )}
                    <button
                        onClick={() => {
                            toast.loading('กำลังออกจากระบบ...', {
                                id: toastId,
                            })
                            void signOut({ callbackUrl: '/login' })
                        }}
                    >
                        <i className='fa fa-sign-out' />
                    </button>
                </div>
            </nav>
        </>
    )
}

Navbar.auth = true
