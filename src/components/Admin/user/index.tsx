import { type User } from '@prisma/client'
import { useEffect, useState, type Dispatch, type ChangeEvent } from 'react'
import { fetchData } from '../../../utils/fetcher'
import Modal from '../../Modal'

import styles from '../Admin.module.css'

interface AllUserProps {
    userList: User[] | undefined
    setUserList: Dispatch<User[]>
}

function AllUser({ userList, setUserList }: AllUserProps): JSX.Element {
    const [loading, setLoading] = useState(false)
    const [selectedData, setSelectedData] = useState<string[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState({
        id: '',
        name: '',
        email: '',
        role: '',
        studentId: '',
    })

    async function handleSubmit(
        id: string,
        name: string,
        email: string,
        role: string,
        studentId?: string
    ): Promise<void> {
        try {
            setLoading(true)
            const { data } = await fetchData<User>(`/api/user`, 'PUT', {
                id,
                name,
                email,
                role,
                studentId,
            })
            if (userList != null) {
                const updatedArray = userList.map((obj) =>
                    obj.id === data.id ? data : obj
                )
                setUserList(updatedArray)
            }
            setModalOpen(false)

            // console.log('===>', data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    function handleChangeRole(
        id: string,
        name: string,
        email: string,
        role: string
    ): void {
        if (role === 'student') {
            setModalData({ ...modalData, id, name, email, role })
            setModalOpen(true)
        } else {
            void handleSubmit(id, name, email, role)
        }
    }
    async function handleDeleteUsers(): Promise<void> {
        if (confirm('กดตกลงเพื่อดำเนินการลบผู้ใช้งานที่เลือก'))
            try {
                // console.log('selectedData', selectedData)
                setLoading(true)
                const { data } = await fetchData<User>(
                    `/api/user`,
                    'DELETE',
                    selectedData
                )
                setUserList(data)
                setSelectedData([])
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
    }

    const close = (): void => {
        setModalOpen(false)
    }

    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
    }, [modalOpen])

    function handleCheckboxChange(
        event: ChangeEvent<HTMLInputElement>,
        data: string
    ): void {
        if (event.target.checked) {
            setSelectedData([...selectedData, data])
        } else {
            setSelectedData(selectedData.filter((d) => d !== data))
        }
    }

    return (
        <>
            {modalOpen && (
                <Modal modalOpen={modalOpen} handleClose={close}>
                    <p
                        className={styles.modalCloseBt}
                        onClick={() => {
                            setModalOpen(false)
                        }}
                    >
                        <i className='fa fa-close' />
                    </p>
                    <div className={styles.modalContent}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                void handleSubmit(
                                    modalData.id,
                                    modalData.name,
                                    modalData.email,
                                    modalData.role,
                                    modalData.studentId
                                )
                            }}
                        >
                            <p>ชื่อ: {modalData.name}</p>
                            <p>email: {modalData.email}</p>
                            <p>role: {modalData.role}</p>
                            <p className='required'>
                                รหัสนิสิต:{' '}
                                <input
                                    disabled={loading}
                                    required
                                    type='number'
                                    inputMode='numeric'
                                    name='รหัสนิสิต'
                                    minLength={8}
                                    maxLength={8}
                                    size={8}
                                    value={modalData.studentId}
                                    className={styles.modalInput}
                                    onChange={({ target }) => {
                                        setModalData({
                                            ...modalData,
                                            studentId: target.value,
                                        })
                                    }}
                                />
                            </p>
                            <footer className={styles.modalFooter}>
                                <button
                                    disabled={loading}
                                    type='submit'
                                    className={styles.greenButton}
                                >
                                    ยืนยัน
                                </button>
                                <button
                                    disabled={loading}
                                    className={styles.redButton}
                                    onClick={close}
                                >
                                    ยกเลิก
                                </button>
                            </footer>
                        </form>
                    </div>
                </Modal>
            )}
            <div className={styles.deleteButton}>
                <button
                    disabled={selectedData.length <= 0 || loading}
                    type='button'
                    className={
                        selectedData.length > 0
                            ? styles.redButton
                            : styles.disabled
                    }
                    onClick={() => {
                        void handleDeleteUsers()
                    }}
                >
                    ลบผู้ใช้ที่เลือก
                </button>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.tables}>
                    <thead>
                        <tr>
                            <th style={{ width: '5%' }} />
                            <th style={{ width: '10%' }}>ลำดับ</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>email</th>
                            <th style={{ width: '20%' }}>role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userList?.map((user, index) => (
                            <tr key={user.id}>
                                <td>
                                    <input
                                        type='checkbox'
                                        className='checkbox'
                                        checked={selectedData.includes(user.id)}
                                        onChange={(event) => {
                                            handleCheckboxChange(event, user.id)
                                        }}
                                    />
                                </td>
                                <td data-label='ลำดับ'>{index + 1}</td>
                                <td data-label='ชื่อ-นามสกุล'>{user.name}</td>
                                <td data-label='email'>{user.email}</td>
                                <td data-label='role'>
                                    <select
                                        disabled={loading}
                                        className={styles.select}
                                        value={user.role}
                                        onChange={(event) => {
                                            handleChangeRole(
                                                user.id,
                                                user.name,
                                                user.email,
                                                event.target.value
                                            )
                                        }}
                                    >
                                        <option value='admin'>admin</option>
                                        <option value='student'>student</option>
                                        <option value='approver'>
                                            approver
                                        </option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {/* <tbody>
                    {[...Array(19)].map((x, i) => (
                        <tr key={i}>
                            <td>{i + 1}</td>
                            <td>Maria Anders</td>
                            <td>Germany</td>
                            <td>Germany</td>
                        </tr>
                    ))}
                </tbody> */}
                </table>
            </div>
        </>
    )
}

export default AllUser
