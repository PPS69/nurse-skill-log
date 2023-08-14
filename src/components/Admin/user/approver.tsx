import { type User } from '@prisma/client'
import { useState, type Dispatch } from 'react'
import { fetchData } from '../../../utils/fetcher'

import styles from '../Admin.module.css'

interface AllApproverProps {
    approverList: CustomApprover[] | undefined
    setApproverList: Dispatch<CustomApprover[]>
}

export interface CustomApprover extends User {
    approver: {
        id: string
    }
}

function AllApprover({
    approverList,
    setApproverList,
}: AllApproverProps): JSX.Element {
    const [loading, setLoading] = useState(false)
    const [editIndex, setEditIndex] = useState(-1)
    const [approverInfo, setApproverInfo] = useState({
        id: '',
        name: '',
        email: '',
    })

    async function handleChangeData(): Promise<void> {
        try {
            setLoading(true)
            const { data } = await fetchData<CustomApprover>(
                `/api/user/approver`,
                'PUT',
                approverInfo
            )
            setEditIndex(-1)
            if (approverList != null) {
                const updatedArray = approverList.map((obj) =>
                    obj.id === data.id ? data : obj
                )
                setApproverList(updatedArray)
            }
            // console.log('===>', data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.tables}>
                <thead>
                    <tr>
                        <th style={{ width: '10%' }}>ลำดับ</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>email</th>
                        <th style={{ width: '10%' }} />
                    </tr>
                </thead>
                <tbody>
                    {approverList?.map((user, index) =>
                        editIndex === index ? (
                            <tr key={user.id}>
                                <td data-label='ลำดับ'>{index + 1}</td>

                                <td data-label='ชื่อ-นามสกุล'>
                                    <input
                                        disabled={loading}
                                        className={styles.tableInput}
                                        value={approverInfo.name}
                                        onChange={({ target }) => {
                                            setApproverInfo({
                                                ...approverInfo,
                                                name: target.value,
                                            })
                                        }}
                                    />
                                </td>
                                <td data-label='email'>
                                    <input
                                        disabled={loading}
                                        type='email'
                                        className={styles.tableInput}
                                        value={approverInfo.email}
                                        onChange={({ target }) => {
                                            setApproverInfo({
                                                ...approverInfo,
                                                email: target.value,
                                            })
                                        }}
                                    />
                                </td>

                                <td>
                                    <div className={styles.editButtonContainer}>
                                        <button
                                            disabled={loading}
                                            className={styles.greenButton}
                                            onClick={() => {
                                                void handleChangeData()
                                            }}
                                        >
                                            <i className='fa fa-check' />
                                        </button>
                                        <button
                                            disabled={loading}
                                            className={styles.redButton}
                                            onClick={() => {
                                                setEditIndex(-1)
                                            }}
                                        >
                                            <i className='fa fa-close' />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <tr key={user.id}>
                                <td data-label='ลำดับ'>{index + 1}</td>
                                <td data-label='ชื่อ-นามสกุล'>{user.name}</td>
                                <td data-label='email'>{user.email}</td>
                                <td>
                                    <button
                                        className={styles.editButton}
                                        onClick={() => {
                                            setEditIndex(index)
                                            setApproverInfo({
                                                ...approverInfo,
                                                id: user.id,
                                                name: user.name,
                                                email: user.email,
                                            })
                                        }}
                                    >
                                        แก้ไข
                                    </button>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
                {/* <tbody>
                    {[...Array(19)].map((x, i) =>
                        editIndex === i ? (
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>
                                    <input
                                        className={styles.tableInput}
                                        value='Maria Anders'
                                    />
                                </td>

                                <td>
                                    <input
                                        className={styles.tableInput}
                                        value='Germany'
                                    />
                                </td>
                                <td>
                                    <input
                                        className={styles.tableInput}
                                        value='NN'
                                    />
                                </td>
                                <td>
                                    <button
                                        className={styles.editButton}
                                        onClick={() => {
                                            setEditIndex(i)
                                        }}
                                    >
                                        แก้ไข
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>Maria Anders</td>
                                <td>Germany</td>
                                <td>NN</td>
                                <td>
                                    <button
                                        className={styles.editButton}
                                        onClick={() => {
                                            setEditIndex(i)
                                        }}
                                    >
                                        แก้ไข
                                    </button>
                                </td>
                            </tr>
                        )
                    )}
                </tbody> */}
            </table>
        </div>
    )
}

export default AllApprover
