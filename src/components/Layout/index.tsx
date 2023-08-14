import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { type ReactNode, useState, useEffect } from 'react'
import Navbar from './navbar'
import Sidebar from './sidebar'

export default function Layout({
    children,
}: {
    children: ReactNode
}): JSX.Element {
    const { data: session } = useSession()
    const [openSidebar, setOpenSidebar] = useState(true)
    const router = useRouter()

    const toggleSidebar = (): void => {
        setOpenSidebar(!openSidebar)
    }

    useEffect(() => {
        const handleRouteChange = (): void => {
            if (window.innerWidth < 1000) {
                setOpenSidebar(false)
            }
        }
        router.events.on('routeChangeComplete', handleRouteChange)
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [router.events])

    useEffect(() => {
        if (window.innerWidth < 1000) {
            setOpenSidebar(false)
        }
    }, [])

    return (
        <>
            <Navbar onToggleSidebar={toggleSidebar} />
            <div className='container'>
                {session?.user.role === 'admin' ? (
                    <Sidebar isOpen={openSidebar} />
                ) : (
                    <></>
                )}
                <div className='content'>{children}</div>
            </div>
        </>
    )
}
