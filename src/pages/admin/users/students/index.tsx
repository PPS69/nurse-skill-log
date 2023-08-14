import { AnimatePresence } from 'framer-motion'
import { type GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { type FormEvent, useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

import AllStudent, {
    type CustomStudent,
} from '../../../../components/Admin/user/student'
import Modal from '../../../../components/Modal'
import prisma from '../../../../lib/prismadb'
import { fetchData } from '../../../../utils/fetcher'
import styles from '../../admin.module.css'

interface StudentManagementType {
    syllabus: [
        {
            id: number
            name: string
        }
    ]
}

interface Student {
    studentId: string
    name: string
    email: string
    password: string
}

export default function StudentManagement({
    syllabus,
}: StudentManagementType): JSX.Element | undefined {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [studentList, setStudentList] = useState<CustomStudent[]>([])
    const [items, setItems] = useState<Student[]>([])
    const [errorMessage, setErrorMessage] = useState({ input: '', file: '' })
    const [modalOpen, setModalOpen] = useState(false)
    const [studentInfo, setStudentInfo] = useState({
        studentId: '',
        name: '',
        email: '',
        syllabusId: 0,
        password: '',
    })

    const { data: session } = useSession()

    const getAllStudent = async (): Promise<void> => {
        try {
            setLoading(true)
            const res = await fetch('/api/user/student')
            const data = (await res.json()) as CustomStudent[]
            // console.log('index: ', data)
            if (!res.ok) {
                throw new Error('No data found')
            } else if (res.ok) {
                setStudentList(data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
    async function handleSaveAllStudents(): Promise<void> {
        try {
            setLoading(true)
            const { data, status } = await fetchData<CustomStudent[]>(
                '/api/user/student',
                'POST',
                items
            )
            if (status === 201) {
                // console.log('index: ', data)
                setStudentList(data)
                setItems([])
                close()
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user.role === 'admin') {
            void getAllStudent()
        } else {
            void router.push('/')
        }
    }, [])

    const readExcel = (file: any): void => {
        const fileReader = new FileReader()
        if (file !== undefined) {
            fileReader.readAsArrayBuffer(file)
        }

        fileReader.onload = (e) => {
            try {
                const bufferArray = e.target?.result
                const wb = XLSX.read(bufferArray, { type: 'buffer' })
                const wsname = wb.SheetNames?.[0]
                const ws = wb.Sheets?.[wsname]
                const data = XLSX.utils.sheet_to_json(ws).map((item: any) => {
                    const newItem: Record<string, string> = {}
                    Object.keys(item).forEach((key) => {
                        newItem[key] = item[key].toString()
                    })
                    return newItem
                })
                setItems(data as unknown as Student[])

                setErrorMessage({
                    ...errorMessage,
                    file: '',
                })
            } catch (error) {
                console.log('error', error)
                setErrorMessage({
                    ...errorMessage,
                    file: 'รูปแบบไฟล์ไม่ถูกต้อง',
                })
            }
        }
    }

    const close = (): void => {
        setModalOpen(false)
    }

    function handleAddStudents(e: FormEvent<HTMLFormElement>): void {
        e.preventDefault()
        const isDuplicate = items.some(
            (obj) =>
                obj.studentId === studentInfo.studentId &&
                obj.name === studentInfo.name &&
                obj.email === studentInfo.email
        )
        if (!isDuplicate) {
            setItems([...items, studentInfo])
            // console.log(items)
        } else {
            setErrorMessage({ ...errorMessage, input: 'มีข้อมูลที่ซ้ำกัน' })
        }
    }

    if (session?.user.role === 'admin')
        return (
            <>
                <Head>
                    <title>NU: Nure Skills Log | User</title>
                    <meta name='description' content='admin user management' />
                </Head>
                <AnimatePresence
                    mode='wait'
                    onExitComplete={() => null}
                    initial={false}
                >
                    {modalOpen && (
                        <Modal modalOpen={modalOpen} handleClose={close}>
                            <div className={styles.modalContent}>
                                <header className={styles.modalHeader}>
                                    เพิ่มรายชื่อนิสิต
                                </header>
                                <form
                                    className={styles.tableContainer}
                                    onSubmit={(e) => {
                                        handleAddStudents(e)
                                    }}
                                    onFocus={() => {
                                        setErrorMessage({
                                            ...errorMessage,
                                            input: '',
                                        })
                                    }}
                                >
                                    <div className={styles.inputContainer}>
                                        <input
                                            required
                                            type='number'
                                            inputMode='numeric'
                                            placeholder='รหัสนิสิต'
                                            title='รหัสนิสิตจะต้องมี 8 หลัก'
                                            minLength={8}
                                            maxLength={8}
                                            disabled={loading}
                                            className={
                                                errorMessage.input.length > 0
                                                    ? styles.inputError
                                                    : ''
                                            }
                                            value={studentInfo.studentId}
                                            onChange={({ target }) => {
                                                setStudentInfo({
                                                    ...studentInfo,
                                                    studentId: target.value,
                                                })
                                            }}
                                        />
                                        <input
                                            type='text'
                                            required
                                            placeholder='ชื่อ-นามสกุล'
                                            disabled={loading}
                                            className={
                                                errorMessage.input.length > 0
                                                    ? styles.inputError
                                                    : ''
                                            }
                                            value={studentInfo.name}
                                            onChange={({ target }) => {
                                                setStudentInfo({
                                                    ...studentInfo,
                                                    name: target.value,
                                                })
                                            }}
                                        />
                                        <input
                                            required
                                            placeholder='email'
                                            disabled={loading}
                                            type='email'
                                            className={
                                                errorMessage.input.length > 0
                                                    ? styles.inputError
                                                    : ''
                                            }
                                            value={studentInfo.email}
                                            onChange={({ target }) => {
                                                setStudentInfo({
                                                    ...studentInfo,
                                                    email: target.value,
                                                })
                                            }}
                                        />
                                        <input
                                            required
                                            placeholder='password'
                                            disabled={loading}
                                            type='text'
                                            value={studentInfo.password}
                                            onChange={({ target }) => {
                                                setStudentInfo({
                                                    ...studentInfo,
                                                    password: target.value,
                                                })
                                            }}
                                        />
                                        {/* <select
                                        disabled={loading}
                                        value={studentInfo.syllabusId}
                                        onChange={({ target }) => {
                                            setStudentInfo({
                                                ...studentInfo,
                                                syllabusId: target.value,
                                            })
                                        }}
                                    >
                                        {syllabus.map((data) => (
                                            <option
                                                key={data.id}
                                                value={data.id}
                                            >
                                                {data.id}
                                            </option>
                                        ))}
                                    </select> */}
                                        <div
                                            className={
                                                styles.editButtonContainer
                                            }
                                        >
                                            <button
                                                disabled={loading}
                                                className={styles.greenButton}
                                                type='submit'
                                            >
                                                เพิ่มรายชื่อ
                                            </button>
                                        </div>
                                    </div>
                                    {errorMessage.input}
                                </form>
                                <span className={styles.or}>
                                    ---- หรือ ----
                                </span>
                                <div className={styles.fileWrapper}>
                                    <input
                                        disabled={loading}
                                        type='file'
                                        accept='.CSV.xlsx, .xlsm, .xlsb, .xltx, .xltm, .xls, .xlt, .xls, .xml, 	
                                        .xml, .xlam, .xla'
                                        onChange={(e) => {
                                            const file = e.target?.files?.[0]
                                            readExcel(file)
                                        }}
                                    />
                                    <span>
                                        *เฉพาะไฟล์ csv กับ Excel และต้องใช้ชื่อ
                                        column ดังนี้ studentId, name, email,
                                        password &#40; ไม่ต้องเรียงลำดับ &#41;
                                    </span>
                                </div>
                                {errorMessage.file}
                                {items.length > 0 && (
                                    <div className={styles.tableContainer}>
                                        <table className={styles.tables}>
                                            <thead>
                                                <tr>
                                                    <th>รหัสนิสิต</th>
                                                    <th>ชื่อ-นามสกุล</th>
                                                    <th>email</th>
                                                    <th>password</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((row: Student) => (
                                                    <tr key={row.studentId}>
                                                        <td>{row.studentId}</td>
                                                        <td>{row.name}</td>
                                                        <td>{row.email}</td>
                                                        <td>{row.password}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className={styles.tableButton}>
                                            <button
                                                disabled={loading}
                                                className={styles.greenButton}
                                                onClick={() => {
                                                    void handleSaveAllStudents()
                                                }}
                                            >
                                                บันทึก
                                            </button>
                                            <button
                                                disabled={loading}
                                                className={styles.grayButton}
                                                onClick={() => {
                                                    setItems([])
                                                }}
                                            >
                                                ล้างทั้งหมด
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Modal>
                    )}
                </AnimatePresence>

                <div className={styles.content}>
                    {loading ? (
                        <i className='fa fa-circle-o-notch fa-spin' />
                    ) : (
                        <>
                            <div className={styles.openModal}>
                                <button
                                    disabled={loading}
                                    onClick={() => {
                                        setModalOpen(true)
                                    }}
                                >
                                    เพิ่มรายชื่อนิสิต
                                </button>
                            </div>
                            <AllStudent
                                studentList={studentList}
                                setStudentList={setStudentList}
                                syllabus={syllabus}
                            />
                        </>
                    )}
                </div>
            </>
        )
}

export const getStaticProps: GetStaticProps = async () => {
    const syllabus = await prisma.syllabus.findMany({})

    return { props: { syllabus }, revalidate: 60 }
}
