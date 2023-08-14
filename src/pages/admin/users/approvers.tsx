import { AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { type FormEvent, useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

import AllApprover, {
    type CustomApprover,
} from '../../../components/Admin/user/approver'
import Modal from '../../../components/Modal'
import { fetchData } from '../../../utils/fetcher'
import styles from '../admin.module.css'

interface Approver {
    name: string
    email: string
    password: string
}

export default function ApproverManagement(): JSX.Element | undefined {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [approverList, setApproverList] = useState<CustomApprover[]>([])
    const [items, setItems] = useState<Approver[]>([])
    const [errorMessage, setErrorMessage] = useState({ input: '', file: '' })
    const [modalOpen, setModalOpen] = useState(false)
    const [approverInfo, setApproverInfo] = useState({
        name: '',
        email: '',
        password: '',
    })

    const { data: session } = useSession()

    const getAllApprover = async (): Promise<void> => {
        try {
            setLoading(true)
            const res = await fetch('/api/user/approver')
            const data = (await res.json()) as CustomApprover[]
            // console.log('index: ', data)
            if (!res.ok) {
                throw new Error('No data found')
            } else if (res.ok) {
                setApproverList(data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSaveAllApprovers(): Promise<void> {
        try {
            setLoading(true)
            const { data, status } = await fetchData<CustomApprover[]>(
                '/api/user/approver',
                'POST',
                items
            )
            if (status === 201) {
                // console.log('index: ', data)
                setApproverList(data)
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
            void getAllApprover()
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
                setItems(data as unknown as Approver[])

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

    function handleAddApprover(e: FormEvent<HTMLFormElement>): void {
        e.preventDefault()
        const isDuplicate = items.some(
            (obj) =>
                obj.name === approverInfo.name ||
                obj.email === approverInfo.email
        )
        if (!isDuplicate) {
            setItems([...items, approverInfo])
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
                    <meta
                        name='description'
                        content='admin approvers management'
                    />
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
                                    เพิ่มรายชื่อผู้นิเทศ
                                </header>
                                <form
                                    className={styles.tableContainer}
                                    onSubmit={(e) => {
                                        handleAddApprover(e)
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
                                            type='text'
                                            required
                                            placeholder='ชื่อ-นามสกุล'
                                            disabled={loading}
                                            className={
                                                errorMessage.input.length > 0
                                                    ? styles.inputError
                                                    : ''
                                            }
                                            value={approverInfo.name}
                                            onChange={({ target }) => {
                                                setApproverInfo({
                                                    ...approverInfo,
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
                                            value={approverInfo.email}
                                            onChange={({ target }) => {
                                                setApproverInfo({
                                                    ...approverInfo,
                                                    email: target.value,
                                                })
                                            }}
                                        />
                                        <input
                                            required
                                            placeholder='password'
                                            disabled={loading}
                                            type='text'
                                            value={approverInfo.password}
                                            onChange={({ target }) => {
                                                setApproverInfo({
                                                    ...approverInfo,
                                                    password: target.value,
                                                })
                                            }}
                                        />
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
                                        accept='.csv, .xlsx, .xlsm, .xlsb, .xltx, .xltm, .xls, .xlt, .xls, .xml, 	
                                        .xml, .xlam, .xla'
                                        onChange={(e) => {
                                            const file = e.target?.files?.[0]
                                            readExcel(file)
                                        }}
                                    />
                                    <span>
                                        *เฉพาะไฟล์ csv กับ Excel และต้องใช้ชื่อ
                                        column ดังนี้ name, email, password
                                        &#40; ไม่ต้องเรียงลำดับ &#41;
                                    </span>
                                </div>
                                {errorMessage.file}
                                {items.length > 0 && (
                                    <div className={styles.tableContainer}>
                                        <table className={styles.tables}>
                                            <thead>
                                                <tr>
                                                    <th>ชื่อ-นามสกุล</th>
                                                    <th>email</th>
                                                    <th>password</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((row: Approver) => (
                                                    <tr key={row.email}>
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
                                                    void handleSaveAllApprovers()
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
                                    เพิ่มรายชื่อผู้นิเทศ
                                </button>
                            </div>
                            <AllApprover
                                approverList={approverList}
                                setApproverList={setApproverList}
                            />
                        </>
                    )}
                </div>
            </>
        )
}
