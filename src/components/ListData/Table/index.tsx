import { motion } from 'framer-motion'
import { type ChangeEvent, useState, type Dispatch } from 'react'
import { type CustomWriteExperience, statuses, type SelectedData } from '..'
import UseTimeConvert from '../../../utils/dateCovert'
import styles from '../ListData.module.css'

interface TableProps {
    data: CustomWriteExperience[]
    role: string
    sortDate: string
    setSortDate: Dispatch<string>
    handleModal: Dispatch<CustomWriteExperience>
    isToggle: boolean
    selectedData: SelectedData[]
    setSelectedData: Dispatch<SelectedData[]>
}

const approverHeader = [
    'สถานะ',
    'รหัสนิสิต',
    'ประสบการณ์',
    'หัวข้อย่อย',
    'วันที่',
]
const studentHeader = [
    'สถานะ',
    'ประสบการณ์',
    'หัวข้อย่อย',
    'วันที่',
    'ผู้นิเทศ',
]

export function Table({
    data,
    role,
    sortDate,
    setSortDate,
    handleModal,
    isToggle,
    selectedData,
    setSelectedData,
}: TableProps): JSX.Element {
    const [isSelectAll, setIsSelectAll] = useState(false)

    let headers

    if (role === 'student') {
        headers = studentHeader
    } else if (role === 'approver') {
        headers = approverHeader
    }

    const handleSelectAll = (): void => {
        setIsSelectAll(!isSelectAll)
        if (!isSelectAll) {
            setSelectedData(
                data.map((li) => ({
                    id: li.id,
                    experienceId: li.experienceId,
                    subTopicId: li.subTopicId,
                    studentId: li.studentId,
                }))
            )
        } else {
            setSelectedData([])
        }
    }

    function handleCheckboxChange(
        event: ChangeEvent<HTMLInputElement>,
        id: string,
        data: CustomWriteExperience
    ): void {
        if (event.target.checked) {
            setSelectedData([
                ...selectedData,
                {
                    id,
                    experienceId: data.experienceId,
                    subTopicId: data.subTopicId,
                    studentId: data.studentId,
                },
            ])
        } else {
            setSelectedData(selectedData.filter((d) => d.id !== id))
        }
    }

    return (
        <table className={styles.tables}>
            <thead>
                <tr>
                    {headers?.map((header: string) => (
                        <th scope='col' key={header}>
                            {header}
                        </th>
                    ))}
                    <th
                        scope='col'
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            setSortDate(sortDate === 'asc' ? 'desc' : 'asc')
                        }}
                    >
                        เวลาส่ง{' '}
                        {sortDate === 'asc' ? (
                            <i
                                className='fa fa-caret-up'
                                style={{ paddingLeft: '5px' }}
                            />
                        ) : (
                            <i
                                className='fa fa-caret-down'
                                style={{ paddingLeft: '5px' }}
                            />
                        )}
                    </th>
                    {!isToggle ? <th /> : <></>}
                    {isToggle ? (
                        <th>
                            <input
                                type='checkbox'
                                className='checkbox'
                                checked={isSelectAll}
                                onChange={() => {
                                    handleSelectAll()
                                }}
                            />
                        </th>
                    ) : (
                        <></>
                    )}
                </tr>
            </thead>
            <tbody>
                {data.map((data: CustomWriteExperience, index: number) => (
                    <motion.tr
                        key={data.id}
                        layout
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            duration: 0.5,
                            opacity: { duration: 0.1 },
                            delay: index * 0.1,
                        }}
                    >
                        <td data-label='สถานะ'>
                            <span className={statuses.get(data.status)?.style}>
                                {statuses.get(data.status)?.text}
                            </span>
                        </td>
                        {role === 'approver' ? (
                            <td data-label='รหัสนิสิต'>{data.studentId}</td>
                        ) : (
                            <></>
                        )}
                        <td data-label='ประสบการณ์'>{data.experience?.name}</td>
                        <td data-label='หัวข้อย่อย'>
                            {data.subTopic?.name ?? '-'}
                        </td>
                        <td data-label='วันที่'>
                            {new Date(data.date).toLocaleDateString('th-TH')}
                        </td>
                        {role === 'student' ? (
                            <td data-label='ผู้นิเทศ'>
                                {data.approver.name ?? '-'}
                            </td>
                        ) : (
                            <></>
                        )}
                        <td data-label='เวลาที่ส่ง'>
                            {UseTimeConvert(new Date(data.createdAt))}
                        </td>
                        {!isToggle ? (
                            <td>
                                {data.status !== 'new' && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{
                                            scale: 0.9,
                                        }}
                                        className={styles.openModalButton}
                                        onClick={() => {
                                            handleModal(data)
                                        }}
                                    >
                                        ตรวจ
                                    </motion.button>
                                )}
                            </td>
                        ) : (
                            <></>
                        )}
                        {isToggle ? (
                            <td>
                                {data.status !== 'approved' &&
                                data.status !== 'new' ? (
                                    <input
                                        type='checkbox'
                                        className='checkbox'
                                        checked={selectedData.some(
                                            (selected) =>
                                                selected.id === data.id
                                        )}
                                        onChange={(event) => {
                                            handleCheckboxChange(
                                                event,
                                                data.id,
                                                data
                                            )
                                        }}
                                    />
                                ) : (
                                    <></>
                                )}
                            </td>
                        ) : (
                            <></>
                        )}
                    </motion.tr>
                ))}
            </tbody>
        </table>
    )
}
