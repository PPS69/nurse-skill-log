import { type User, type Syllabus } from '@prisma/client'
import { useRouter } from 'next/router'
import { useState, type Dispatch } from 'react'
import { fetchData } from '../../../utils/fetcher'

import styles from '../Admin.module.css'

interface AllStudentProps {
    studentList: CustomStudent[] | undefined
    setStudentList: Dispatch<CustomStudent[]>
    syllabus: Syllabus[]
}

export interface CustomStudent extends User {
    Student: {
        studentId: string
        syllabus: Syllabus
    }
}

function AllStudent({
    studentList,
    setStudentList,
    syllabus,
}: AllStudentProps): JSX.Element {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [editIndex, setEditIndex] = useState(-1)
    const [studentInfo, setStudentInfo] = useState({
        id: '',
        studentId: '',
        name: '',
        email: '',
        syllabusId: 0,
        syllabusName: '',
    })

    async function handleChangeData(): Promise<void> {
        try {
            setLoading(true)
            const { data } = await fetchData<CustomStudent>(
                `/api/user/student`,
                'PUT',
                studentInfo
            )
            setEditIndex(-1)
            if (studentList != null) {
                const updatedArray = studentList.map((obj) =>
                    obj.id === data.id ? data : obj
                )
                setStudentList(updatedArray)
            }
            // console.log('===>', data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteStudent(
        id: string,
        name: string
    ): Promise<void> {
        if (confirm(`กดตกลงเพื่อดำเนินการลบนิสิต ${name ?? ''}`)) {
            try {
                setLoading(true)
                const { data } = await fetchData<CustomStudent>(
                    `/api/user/student`,
                    'DELETE',
                    { id }
                )

                setStudentList(data)
                setEditIndex(-1)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.tables}>
                <thead>
                    <tr>
                        <th style={{ width: '5%' }}>ลำดับ</th>
                        <th style={{ width: '10%' }}>รหัสนิสิต</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>email</th>
                        <th style={{ width: '15%' }}>หลักสูตร</th>
                        <th style={{ width: '10%' }} />
                    </tr>
                </thead>
                <tbody>
                    {studentList?.map((user, index) =>
                        editIndex === index ? (
                            <tr key={user.id}>
                                <td data-label='ลำดับ'>{index + 1}</td>
                                <td data-label='รหัสนิสิต'>
                                    <input
                                        type='number'
                                        inputMode='numeric'
                                        disabled={loading}
                                        className={styles.tableInput}
                                        value={studentInfo.studentId}
                                        onChange={({ target }) => {
                                            setStudentInfo({
                                                ...studentInfo,
                                                studentId: target.value,
                                            })
                                        }}
                                    />
                                </td>
                                <td data-label='ชื่อ-นามสกุล'>
                                    <input
                                        disabled={loading}
                                        className={styles.tableInput}
                                        value={studentInfo.name}
                                        onChange={({ target }) => {
                                            setStudentInfo({
                                                ...studentInfo,
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
                                        value={studentInfo.email}
                                        onChange={({ target }) => {
                                            setStudentInfo({
                                                ...studentInfo,
                                                email: target.value,
                                            })
                                        }}
                                    />
                                </td>
                                <td data-label='หลักสูตร'>
                                    <select
                                        disabled={loading}
                                        className={styles.select}
                                        value={studentInfo.syllabusName}
                                        onChange={({ target }) => {
                                            const selectedSyllabus =
                                                syllabus.find(
                                                    (s) =>
                                                        s.name === target.value
                                                )

                                            setStudentInfo({
                                                ...studentInfo,
                                                syllabusId:
                                                    selectedSyllabus?.id ?? 0,
                                                syllabusName:
                                                    selectedSyllabus?.name ??
                                                    '',
                                            })
                                        }}
                                    >
                                        {syllabus.map((data) => (
                                            <option
                                                key={data.id}
                                                value={data.name}
                                            >
                                                {data.name}
                                            </option>
                                        ))}
                                    </select>
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
                                        <button
                                            disabled={loading}
                                            className={styles.grayButton}
                                            onClick={() => {
                                                void handleDeleteStudent(
                                                    user.id,
                                                    user.name
                                                )
                                            }}
                                        >
                                            <i className='fa fa-trash' />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <tr key={user.id}>
                                <td data-label='ลำดับ'>{index + 1}</td>
                                <td data-label='รหัสนิสิต'>
                                    {user.Student.studentId}
                                </td>
                                <td data-label='ชื่อ-นามสกุล'>{user.name}</td>
                                <td data-label='email'>{user.email}</td>
                                <td data-label='หลักสูตร'>
                                    {user.Student.syllabus.name}
                                </td>
                                <td>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '.5rem',
                                        }}
                                    >
                                        <button
                                            disabled={loading}
                                            className={styles.editButton}
                                            onClick={() => {
                                                setEditIndex(index)
                                                setStudentInfo({
                                                    ...studentInfo,
                                                    id: user.id,
                                                    studentId:
                                                        user.Student.studentId,
                                                    name: user.name,
                                                    email: user.email,
                                                    syllabusId:
                                                        user.Student.syllabus
                                                            .id,
                                                    syllabusName:
                                                        user.Student.syllabus
                                                            .name,
                                                })
                                            }}
                                        >
                                            แก้ไข
                                        </button>

                                        <button
                                            disabled={loading}
                                            className={styles.editButton}
                                            onClick={() => {
                                                void router.push(
                                                    `/admin/users/students/${user.Student.studentId}`
                                                )
                                            }}
                                        >
                                            ดูสมุด
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default AllStudent
