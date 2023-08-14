import { useSession } from 'next-auth/react'
import { useState, type Dispatch } from 'react'

import UseTimeConvert from '../../utils/dateCovert'
import { fetchData } from '../../utils/fetcher'
import Modal from '../Modal'
import styles from './ListData.module.css'
import { type CustomWriteExperience, statuses } from '.'

interface ModalProps {
    modalOpen: boolean
    setModalOpen: Dispatch<boolean>
    modalData: CustomWriteExperience | undefined
    updateObject: (params: CustomWriteExperience) => void
}

export default function ListDataModal({
    modalOpen,
    setModalOpen,
    modalData,
    updateObject,
}: ModalProps): JSX.Element {
    const { data: session } = useSession()
    const [comment, setComment] = useState(modalData?.comment ?? 'ไม่มี')

    const handleUpdate = async (
        status: string,
        id: string,
        experienceId?: number,
        subTopicId?: number,
        studentId?: string
    ): Promise<void> => {
        if (
            confirm(
                `ยืนยันที่จะส่งสถานะ ${status}? ${
                    status === 'approved'
                        ? '(เมื่อส่งสถานะ approved จะไม่สามารถแก้ไขได้อีก)'
                        : ''
                }`
            )
        )
            try {
                const { data } = await fetchData<CustomWriteExperience>(
                    `/api/post/${id}`,
                    'PUT',
                    {
                        status,
                        comment,
                        experienceId,
                        subTopicId,
                        studentId,
                    }
                )

                updateObject(data)
                // console.log('===>', data)
            } catch (error) {
                console.log(error)
            } finally {
                setModalOpen(false)
            }
    }

    const close = (): void => {
        setModalOpen(false)
    }

    return (
        <Modal modalOpen={modalOpen} handleClose={close}>
            <button
                className={styles.modalCloseBt}
                onClick={() => {
                    setModalOpen(false)
                }}
            >
                <i className='fa fa-close' />
            </button>
            <header className={styles.modalHeader}>ข้อมูลประสบการณ์</header>
            <main className={styles.modalContent}>
                {session?.user.role === 'approver' ? (
                    <li>
                        <b>รหัสนิสิต-ชื่อ:</b> {modalData?.studentId}{' '}
                        {modalData?.student !== undefined
                            ? modalData?.student.name
                            : ''}
                    </li>
                ) : (
                    <li>
                        <b>ผู้นิเทศ:</b> {modalData?.approver.name}
                    </li>
                )}
                <li>
                    <b>วันที่:</b>{' '}
                    {new Date(modalData?.date ?? new Date()).toLocaleDateString(
                        'th-TH'
                    )}
                </li>
                <li>
                    <b>สถานที่</b>: {modalData?.hospital}
                </li>
                <li>
                    <b>หอผู้ป่วย</b>: {modalData?.ward}
                </li>
                <li>
                    <b>เตียงผู้ป่วย:</b> {modalData?.patientBed}
                </li>
                <li>
                    <b>ประสบการณ์:</b> {modalData?.experience?.name}
                </li>
                <li>
                    <b>หัวข้อย่อย:</b> {modalData?.subTopic?.name ?? 'ไม่มี'}
                </li>

                <li>
                    <b>วันที่ส่ง:</b>{' '}
                    {UseTimeConvert(
                        new Date(modalData?.createdAt ?? new Date())
                    )}
                </li>
                <li>
                    <b>สถานะ:</b>{' '}
                    {modalData !== undefined ? (
                        <span
                            style={{
                                display: 'inline',
                            }}
                            className={statuses.get(modalData.status)?.style}
                        >
                            {statuses.get(modalData.status)?.text}
                        </span>
                    ) : (
                        <span>ไม่ทราบ</span>
                    )}
                    {/* <b>สถานะ:</b> {handleStatus(modalData?.status ?? '')} */}
                </li>
                {session?.user.role === 'approver' ? (
                    <li className={styles.fullWidth}>
                        <b>หมายเหตุ:</b>{' '}
                        <textarea
                            disabled={modalData?.status === 'approved'}
                            placeholder='เขียนหมายเหตุถึงนิสิต'
                            value={comment}
                            onChange={({ target }) => {
                                setComment(target.value)
                            }}
                        />
                    </li>
                ) : (
                    <li className={styles.fullWidth}>
                        <b>หมายเหตุ:</b> {modalData?.comment ?? 'ไม่มี'}
                    </li>
                )}
            </main>
            {session?.user.role === 'approver' &&
            modalData?.status !== 'approved' ? (
                <footer className={styles.modalFooter}>
                    {/* {modalData?.status !== 'approved' && ( */}
                    <button
                        className={styles.btnApproved}
                        value='approved'
                        onClick={(e) => {
                            void handleUpdate(
                                e.currentTarget.value,
                                modalData?.id ?? '',
                                modalData?.experienceId,
                                modalData?.subTopicId,
                                modalData?.studentId
                            )
                        }}
                    >
                        อนุมัติ
                    </button>
                    {/* )} */}
                    {modalData?.status !== 'rejected' && (
                        <button
                            className={styles.btnRejected}
                            value='rejected'
                            onClick={(e) => {
                                void handleUpdate(
                                    e.currentTarget.value,
                                    modalData?.id ?? '',
                                    modalData?.experienceId,
                                    modalData?.subTopicId,
                                    modalData?.studentId
                                )
                            }}
                        >
                            ปฏิเสธ
                        </button>
                    )}
                    <button
                        className={styles.btnWait}
                        value='wait'
                        onClick={(e) => {
                            void handleUpdate(
                                e.currentTarget.value,
                                modalData?.id ?? '',
                                modalData?.experienceId,
                                modalData?.subTopicId,
                                modalData?.studentId
                            )
                        }}
                    >
                        อนุมัติภายหลัง
                    </button>
                </footer>
            ) : (
                <></>
            )}
        </Modal>
    )
}
