import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import None from '../components/Layout/none'

export default function PageNotFound(): JSX.Element {
    return (
        <>
            <Head>
                <title>NU: Nure Skills Log | PageNotFound</title>
                <meta name='keywords' content='nure nu' />
            </Head>
            <main className='pageNotFound'>
                <Image
                    src={'/empty.gif'}
                    alt='empty'
                    height={300}
                    width={300}
                />
                <div className='border'>
                    <h1>404</h1>
                    <p> Page not found</p>
                    <Link href='/'>
                        <span className='b2h'>Back to Homepage</span>
                    </Link>
                </div>
            </main>
        </>
    )
}

PageNotFound.PageLayout = None
