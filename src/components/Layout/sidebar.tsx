import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'

import styles from './Sidebar.module.css'

interface SidebarProps {
    isOpen: boolean
}

const links = [
    { name: 'ยืนยันผู้ใช้งาน', to: '/admin', id: 1, icon: 'fa fa-user-plus' },
    { name: 'ผู้ใช้งาน', to: '/admin/users', id: 2, icon: 'fa fa-users' },
    { name: 'นิสิต', to: '/admin/users/students', id: 3, icon: 'fa fa-user' },
    {
        name: 'ผู้นิเทศ',
        to: '/admin/users/approvers',
        id: 4,
        icon: 'fa fa-user',
    },
    { name: 'หลักสูตร', to: '/admin/syllabus', id: 5, icon: 'fa fa-book' },
]

const sideVariants = {
    closed: {
        width: 0,
    },
    open: {
        width: 260,
    },
    exit: {
        width: 0,
        transition: { delay: 0.25, duration: 0.3 },
    },
}

const itemVariants = {
    closed: {
        opacity: 0,
    },
    open: { opacity: 1, transition: { delay: 0.2, duration: 0.2 } },
}

function Sidebar({ isOpen }: SidebarProps): JSX.Element {
    const router = useRouter()

    const studentIdPath = router.asPath.split('/admin/users/students')[1]

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.nav
                    className={styles.sidebar}
                    initial='closed'
                    animate='open'
                    exit='exit'
                    variants={sideVariants}
                >
                    <motion.ul
                        initial='closed'
                        animate='open'
                        exit='closed'
                        variants={itemVariants}
                    >
                        {studentIdPath?.length > 0 ? (
                            <button
                                onClick={() => {
                                    router.back()
                                }}
                            >
                                <span
                                    className='fa fa-reply'
                                    style={{ marginRight: '10px' }}
                                />
                                ย้อนกลับ
                            </button>
                        ) : (
                            links.map(({ name, to, id, icon }) => (
                                <Link href={to} key={id}>
                                    <li
                                        className={
                                            router.pathname === to
                                                ? styles.active
                                                : ''
                                        }
                                    >
                                        <span
                                            className={icon}
                                            style={{ marginRight: '10px' }}
                                        />
                                        {name}
                                    </li>
                                </Link>
                            ))
                        )}
                    </motion.ul>
                </motion.nav>
            )}
        </AnimatePresence>
    )
}

export default Sidebar
