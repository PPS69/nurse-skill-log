/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnimatePresence, motion } from 'framer-motion'
import Router, { useRouter } from 'next/router'
import { useSession, SessionProvider } from 'next-auth/react'
import { useEffect, type ComponentType } from 'react'
import toast, { Toaster } from 'react-hot-toast'

import Layout from '../components/Layout'
import LoadingAnimate from '../components/Loading'
import type { AppProps } from 'next/app'
import '../styles/globals.css'

type ComponentWithPageLayout = AppProps & {
    Component: AppProps['Component'] & {
        PageLayout?: ComponentType
    }
}

interface LayoutProps {
    children: JSX.Element
}

export default function MyApp({
    Component,
    pageProps: { session, ...pageProps },
}: ComponentWithPageLayout): JSX.Element {
    const router = useRouter()
    // const [loading, setLoading] = useState(false)

    // useEffect(() => {
    //     // Used for page transition
    //     let toastId: string | undefined
    //     const start = (): void => {
    //         // setLoading(true)
    //         toast.loading('กำลังโหลด...', { id: toastId })
    //     }
    //     const end = (): void => {
    //         // setLoading(false)
    //         toast.dismiss(toastId)
    //     }
    //     Router.events.on('routeChangeStart', start)
    //     Router.events.on('routeChangeComplete', end)
    //     Router.events.on('routeChangeError', end)
    //     return () => {
    //         Router.events.off('routeChangeStart', start)
    //         Router.events.off('routeChangeComplete', end)
    //         Router.events.off('routeChangeError', end)
    //     }
    // }, [])
    return (
        <SessionProvider session={session}>
            <link
                rel='stylesheet'
                href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
            />
            <Toaster />
            {Component.PageLayout != null ? (
                <Component {...pageProps} />
            ) : (
                <Auth>
                    {/* {loading ? (
                        <LoadingAnimate />
                    ) : ( */}
                    <AnimatePresence mode='wait' initial={false}>
                        <Layout>
                            <motion.div
                                key={router.route}
                                initial='initialState'
                                animate='animateState'
                                exit='exitState'
                                transition={{
                                    duration: 0.3,
                                }}
                                variants={{
                                    initialState: {
                                        y: 10,
                                        opacity: 0,
                                    },
                                    animateState: {
                                        y: 0,
                                        opacity: 1,
                                    },
                                    exitState: {},
                                }}
                            >
                                <Component {...pageProps} />
                            </motion.div>
                        </Layout>
                    </AnimatePresence>
                    {/* )} */}
                </Auth>
            )}
        </SessionProvider>
    )
}

function Auth({ children }: LayoutProps): JSX.Element {
    const { status } = useSession({ required: true })

    if (status === 'loading') {
        return <LoadingAnimate />
    }

    return children
}
