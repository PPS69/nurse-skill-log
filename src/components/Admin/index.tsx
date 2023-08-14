import { type User } from '@prisma/client'
import { useState, type Dispatch } from 'react'

import UseTimeConvert from '../../utils/dateCovert'
import { fetchData } from '../../utils/fetcher'
import styles from './Admin.module.css'

interface AdminProps {
    approverList: User[] | undefined
    setApproverList: Dispatch<User[]>
}

function Admin({ approverList, setApproverList }: AdminProps): JSX.Element {
    const [loading, setLoading] = useState(false)

    async function handleUpdate(
        value: string,
        id: string,
        name: string,
        email: string
    ): Promise<void> {
        try {
            setLoading(true)
            const { data } = await fetchData<User[]>(
                `/api/user/approver/confirm`,
                'POST',
                {
                    value,
                    id,
                    name,
                    email,
                }
            )
            setApproverList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.blockContainer}>
            {approverList?.map((data: User) => (
                <div className={styles.confirmBlock} key={data.id}>
                    <div className={styles.textContainer}>
                        <p>{data.name}</p>
                        <p>{data.email}</p>
                        <p>{UseTimeConvert(new Date(data.createdAt))}</p>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button
                            disabled={loading}
                            className={styles.greenButton}
                            value='approved'
                            onClick={(e) => {
                                void handleUpdate(
                                    e.currentTarget.value,
                                    data.id,
                                    data.name,
                                    data.email
                                )
                            }}
                        >
                            <i
                                className='fa fa-check'
                                style={{ marginRight: '5px' }}
                            />
                            ยืนยัน
                        </button>
                        <button
                            disabled={loading}
                            className={styles.redButton}
                            value='rejected'
                            onClick={(e) => {
                                void handleUpdate(
                                    e.currentTarget.value,
                                    data.id,
                                    data.name,
                                    data.email
                                )
                            }}
                        >
                            <i
                                className='fa fa-close'
                                style={{ marginRight: '5px' }}
                            />
                            ปฏิเสธ
                        </button>
                        {/* <button
                            className={styles.grayButton}
                            value='wait'
                            onClick={(e) => {
                                void handleUpdate(
                                    e.currentTarget.value,
                                    data.id
                                )
                            }}
                        >
                            <i
                                className='fa fa-clock-o'
                                style={{ marginRight: '5px' }}
                            />
                            ภายหลัง
                        </button> */}
                    </div>
                </div>
            ))}

            {/* {[...Array(9)].map((x, i) => (
                        <div className={styles.block} key={i}>
                            <p>ชื่อ:</p>
                            <p>email:</p>
                            <p>วันที่: {UseTimeConvert(new Date())}</p>
                            <div className={styles.buttonContainer}>
                                <button className={styles.greenButton}>
                                    ยืนยัน
                                </button>
                                <button className={styles.redButton}>
                                    ปฏิเสธ
                                </button>
                                <button className={styles.grayButton}>
                                    ภายหลัง
                                </button>
                            </div>
                        </div>
                    ))} */}
        </div>
    )
}

export default Admin
