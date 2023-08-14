import { AnimatePresence } from 'framer-motion'
import React, { useEffect, useState } from 'react'

import UseTimeConvert from '../../utils/dateCovert'
import { type CustomWriteExperience } from '../ListData'
import Modal from '../Modal'
import styles from './overview.module.css'

import type { ExpWithSubAndWriteExp } from '../../pages/logbook'

interface OverviewProps {
    data: ExpWithSubAndWriteExp[]
}

const headers = [
    'ประสบการณ์',
    'หัวข้อย่อย',
    'ปฏิบัติหลักการ (ครั้ง)',
    'ตลอดหลักสูตร (ครั้ง)',
    'จำนวนบันทึกที่อนุมัติ',
]

const headersSize = ['20%', '50%', '10%', '10%']

export default function Overview({ data = [] }: OverviewProps): JSX.Element {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState<CustomWriteExperience[]>([])
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

    return (
        <>
            <AnimatePresence
                mode='wait'
                onExitComplete={() => null}
                initial={false}
            >
                {modalOpen && (
                    <Modal modalOpen={modalOpen} handleClose={close}>
                        <button
                            className={styles.modalCloseBt}
                            onClick={() => {
                                setModalOpen(false)
                            }}
                        >
                            <i className='fa fa-close' />
                        </button>
                        <header className={styles.modalHeader}>
                            ข้อมูลประสบการณ์ที่เขียน
                        </header>
                        <main className={styles.modalContent}>
                            {modalData?.map((data) => (
                                <div
                                    className={styles.modalBlock}
                                    key={data.id}
                                >
                                    <li>
                                        <b>วันที่:</b>{' '}
                                        {new Date(data.date).toLocaleDateString(
                                            'th-TH'
                                        )}
                                    </li>
                                    <li>
                                        <b>สถานที่</b>: {data.hospital}
                                    </li>
                                    <li>
                                        <b>หอผู้ป่วย</b>: {data.ward}
                                    </li>
                                    <li>
                                        <b>เตียงผู้ป่วย:</b> {data.patientBed}
                                    </li>
                                    <li>
                                        <b>ประสบการณ์:</b>{' '}
                                        {data.experience?.name}
                                    </li>
                                    <li>
                                        <b>หัวข้อย่อย:</b>{' '}
                                        {data.subTopic?.name ?? 'ไม่มี'}
                                    </li>

                                    <li>
                                        <b>วันที่ส่ง:</b>{' '}
                                        {UseTimeConvert(
                                            new Date(
                                                data.createdAt ?? new Date()
                                            )
                                        )}
                                    </li>

                                    <li className={styles.fullWidth}>
                                        <b>หมายเหตุ:</b>{' '}
                                        {data.comment ?? 'ไม่มี'}
                                    </li>
                                </div>
                            ))}
                        </main>
                    </Modal>
                )}
            </AnimatePresence>
            <div className={styles.tableContainer} tabIndex={0}>
                <table className={styles.tables}>
                    <thead>
                        <tr>
                            {headers?.map((header: string, index) => (
                                <th
                                    scope='col'
                                    key={header}
                                    style={{ width: headersSize[index] }}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(
                            (
                                experience: ExpWithSubAndWriteExp,
                                index: number
                            ) => (
                                <React.Fragment key={experience.id}>
                                    <tr>
                                        <td
                                            rowSpan={
                                                experience.subTopic.length + 1
                                            }
                                            data-label='ประสบการณ์'
                                            style={{
                                                backgroundColor:
                                                    experience.completed
                                                        ? '#50C878'
                                                        : 'white',
                                            }}
                                        >
                                            {experience.name}
                                        </td>
                                    </tr>
                                    {experience.subTopic.map((subTopic) => (
                                        <tr key={subTopic.id}>
                                            <td
                                                data-label='หัวข้อย่อย'
                                                style={{
                                                    backgroundColor:
                                                        subTopic.completed
                                                            ? '#50C878'
                                                            : 'white',
                                                }}
                                            >
                                                {subTopic.name}
                                            </td>
                                            <td
                                                data-label='ปฏิบัติหลักการ (ครั้ง)'
                                                style={{
                                                    padding: '0',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {subTopic.practicePrinciples}
                                            </td>
                                            <td
                                                data-label='ตลอดหลักสูตร (ครั้ง)'
                                                style={{
                                                    padding: '0',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {subTopic.throughoutTheCourse}
                                            </td>
                                            {subTopic.writeExperience.length >
                                            0 ? (
                                                <td
                                                    style={{
                                                        padding: '0',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {
                                                        <button
                                                            className={
                                                                styles.openModal
                                                            }
                                                            onClick={() => {
                                                                setModalData(
                                                                    subTopic.writeExperience
                                                                )
                                                                setModalOpen(
                                                                    true
                                                                )
                                                            }}
                                                        >
                                                            {
                                                                subTopic
                                                                    .writeExperience
                                                                    .length
                                                            }
                                                        </button>
                                                    }
                                                </td>
                                            ) : (
                                                <td
                                                    data-label='จำนวนบันทึกที่อนุมัติ'
                                                    style={{
                                                        padding: '0',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {
                                                        subTopic.writeExperience
                                                            .length
                                                    }
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}
