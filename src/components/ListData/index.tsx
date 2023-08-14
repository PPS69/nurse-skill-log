import { type WriteExperience } from '@prisma/client'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState, useContext } from 'react'
import Select from 'react-select'

import { WriteExperienceContext } from '../../pages'
import { customStyles, options } from '../../styles/select'
import { fetchData } from '../../utils/fetcher'
import styles from './ListData.module.css'
import { Table } from './Table'
import { TableLoading } from './Table/loading'
import ListDataModal from './modal'

interface ListDataProps {
    role: string
    isLoading: boolean
}

export interface CustomWriteExperience extends WriteExperience {
    approver: {
        name: string
    }
    student?: {
        name: string
    }
    experience: {
        name: string
    }
    subTopic: {
        name: string
    }
}

export interface SelectedData {
    id: string
    experienceId: number
    subTopicId: number
    studentId: string
}

export const statuses = new Map([
    ['new', { style: styles.bluePill, text: 'ใหม่' }],
    ['wait', { style: styles.grayPill, text: 'รอ' }],
    ['approved', { style: styles.greenPill, text: 'อนุมัติ' }],
    ['rejected', { style: styles.redPill, text: 'ปฏิเสธ' }],
])

export default function ListData({
    role,
    isLoading,
}: ListDataProps): JSX.Element {
    const [modalOpen, setModalOpen] = useState(false)
    const [isToggle, setIsToggle] = useState(false)
    const [modalData, setModalData] = useState<CustomWriteExperience>()
    const [filterByStatus, setFilterByStatus] = useState<string>('all')
    const [searchVal, setSearchVal] = useState<string>('')
    const [sortDate, setSortDate] = useState('')
    const [comment, setComment] = useState('')
    const [selectedData, setSelectedData] = useState<SelectedData[]>([])

    const { writeExperience, setWriteExperience } = useContext(
        WriteExperienceContext
    )

    let filteredData = useMemo(
        () =>
            writeExperience.filter((item: CustomWriteExperience) => {
                const dateString = new Date(item.date).toLocaleDateString(
                    'th-TH'
                )
                const searchMatch =
                    searchVal === '' ||
                    (searchVal.length > 0 &&
                        new Date(item.createdAt) >= new Date(searchVal) &&
                        new Date(item.createdAt) <=
                            new Date(`${searchVal} 23:59:59`)) ||
                    dateString
                        .toLowerCase()
                        .includes(searchVal.toLowerCase()) ||
                    item.studentId
                        .toLowerCase()
                        .includes(searchVal.toLowerCase()) ||
                    item.approver?.name
                        .toLowerCase()
                        .includes(searchVal.toLowerCase()) ||
                    item.experience.name
                        .toLowerCase()
                        .includes(searchVal.toLowerCase()) ||
                    item.subTopic.name
                        ?.toLowerCase()
                        .includes(searchVal.toLowerCase())

                return (
                    (filterByStatus === 'all' ||
                        item.status === filterByStatus) &&
                    searchMatch
                )
            }),
        [writeExperience, searchVal, filterByStatus]
    )

    if (sortDate === 'asc') {
        filteredData = filteredData.sort(
            (a: CustomWriteExperience, b: CustomWriteExperience) =>
                new Date(a.createdAt).valueOf() -
                new Date(b.createdAt).valueOf()
        )
    } else if (sortDate === 'desc') {
        filteredData = filteredData.sort(
            (a: CustomWriteExperience, b: CustomWriteExperience) =>
                new Date(b.createdAt).valueOf() -
                new Date(a.createdAt).valueOf()
        )
    }

    function updateObject(data: CustomWriteExperience): void {
        const updatedArray = writeExperience.map((obj) =>
            obj.id === data.id ? data : obj
        )
        setWriteExperience(updatedArray)
    }

    function handleModal(data: CustomWriteExperience): void {
        if (data !== null) {
            setModalData(data)
            setModalOpen(true)
        } else {
            setModalOpen(false)
        }
    }

    const handleUpdate = async (status: string): Promise<void> => {
        if (
            confirm(
                `ยืนยันที่จะส่งสถานะ ${statuses.get(status)?.text ?? ''}? ${
                    status === 'approved'
                        ? '(เมื่อส่งสถานะ อนุมัติ จะไม่สามารถแก้ไขได้อีก)'
                        : ''
                }`
            )
        )
            try {
                const { data } = await fetchData<CustomWriteExperience>(
                    `/api/post`,
                    'PUT',
                    { status, comment, data: selectedData }
                )

                setWriteExperience(data)
            } catch (error) {
                console.log(error)
            }
    }

    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
    }, [modalOpen])

    return (
        <>
            <AnimatePresence
                mode='wait'
                onExitComplete={() => null}
                initial={false}
            >
                {modalOpen && (
                    <ListDataModal
                        modalOpen={modalOpen}
                        setModalOpen={setModalOpen}
                        modalData={modalData}
                        updateObject={updateObject}
                    />
                )}
            </AnimatePresence>

            {isToggle ? (
                <div className={styles.buttonContainer}>
                    <input
                        placeholder='หมายเหตุ'
                        value={comment}
                        onChange={(e) => {
                            setComment(e.currentTarget.value)
                        }}
                    />
                    <button
                        className={styles.btnApproved}
                        value='approved'
                        disabled={selectedData.length < 1}
                        onClick={(e) => {
                            void handleUpdate(e.currentTarget.value)
                        }}
                    >
                        อนุมัติ
                    </button>
                    <button
                        className={styles.btnRejected}
                        value='rejected'
                        disabled={selectedData.length < 1}
                        onClick={(e) => {
                            void handleUpdate(e.currentTarget.value)
                        }}
                    >
                        ปฏิเสธ
                    </button>
                    <button
                        className={styles.btnWait}
                        value='wait'
                        disabled={selectedData.length < 1}
                        onClick={(e) => {
                            void handleUpdate(e.currentTarget.value)
                        }}
                    >
                        อนุมัติภายหลัง
                    </button>
                </div>
            ) : (
                <></>
            )}

            <div className={styles.info}>
                <div className={styles.search}>
                    <i className='fa fa-search' />
                    <input
                        type='search'
                        placeholder='ค้นหา'
                        value={searchVal}
                        disabled={isLoading}
                        onChange={(e) => {
                            setSearchVal(e.currentTarget.value)
                        }}
                    />
                </div>
                <Select
                    className='react-select-container'
                    // classNamePrefix='react-select'
                    aria-label='select-state'
                    styles={customStyles}
                    name='เลือกสถานะ'
                    defaultValue={{ value: 'all', label: 'แสดงทั้งหมด' }}
                    options={options}
                    isSearchable={false}
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onChange={(option: any) => {
                        setFilterByStatus(option.value)
                    }}
                    theme={(theme) => ({
                        ...theme,
                        borderRadius: 0,
                        colors: {
                            ...theme.colors,
                            primary25: '#c0c0c0',
                            primary: '#c0c0c0',
                        },
                    })}
                />
                {role === 'approver' && (
                    <div
                        className={styles.toggle}
                        onClick={() => {
                            setIsToggle(!isToggle)
                        }}
                    >
                        <input
                            type='checkbox'
                            className='checkbox'
                            checked={isToggle}
                            onChange={() => {
                                setIsToggle(!isToggle)
                            }}
                        />
                        <label>ตรวจแบบกลุ่ม</label>
                    </div>
                )}
            </div>
            <div className={styles.tableContainer}>
                {isLoading ? (
                    <TableLoading />
                ) : filteredData.length > 0 ? (
                    <Table
                        data={filteredData}
                        role={role}
                        sortDate={sortDate}
                        setSortDate={setSortDate}
                        handleModal={handleModal}
                        isToggle={isToggle}
                        selectedData={selectedData}
                        setSelectedData={setSelectedData}
                    />
                ) : filterByStatus === 'all' && searchVal.length > 0 ? (
                    <p>ไม่พบข้อมูลที่ตรงกับ &#34;{searchVal}&#34;</p>
                ) : filterByStatus !== 'all' ? (
                    <p>
                        ไม่พบข้อมูลที่มีสถานะ &#34;
                        {statuses.get(filterByStatus)?.text}&#34;{' '}
                        {searchVal.length > 0 ? `และ "${searchVal}"'` : ''}
                    </p>
                ) : (
                    <p>ไม่พบข้อมูล</p>
                )}
            </div>
        </>
    )
}
