import { useRouter } from 'next/router'
import { type FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { customStyles } from '../../styles/select'
import { fetchData } from '../../utils/fetcher'
import styles from './writeExperience.module.css'
import type { ExpWithSubAndWriteExp, Props } from '../../pages/logbook'

const gray = '#c0c0c0'

export interface FormData {
    studentId: string
    approverId: string | undefined
    approverEmail: string | undefined
    date: string
    hospital: string | undefined
    ward: string
    patientBed: string
    experienceId: number
    experienceName: string | undefined
    subTopicId: number
    subTopicName: string | undefined
}

export default function Form(props: Props): JSX.Element {
    const { experience, approver, hospital, student, isLoading } = props
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        studentId: student.studentId,
        approverId: '',
        approverEmail: '',
        date: '',
        hospital: '',
        ward: '',
        patientBed: '',
        experienceId: 0,
        experienceName: '',
        subTopicId: 0,
        subTopicName: '',
    })

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault()
        // let toastId: string | undefined
        try {
            const { data, status } = await fetchData('/api/post', 'POST', {
                studentId: formData.studentId,
                approverId: formData.approverId,
                date: new Date(formData.date),
                hospital: formData.hospital,
                ward: handleNull(formData.ward),
                patientBed: handleNull(formData.patientBed),
                experienceId: formData.experienceId,
                subTopicId: formData.subTopicId,
            })
            // console.log('data ===>', data)
            // console.log('formData ===>', formData)
            if (data !== null && status === 201) {
                setLoading(true)
                toast(
                    (t) => (
                        <span className={styles.toastBtContainer}>
                            <span className={styles.toastTitle}>
                                ส่งบันทึกสำเร็จแล้ว
                            </span>
                            <button
                                className={styles.toastStayBt}
                                onClick={() => {
                                    toast.dismiss(t.id)
                                    setLoading(false)
                                }}
                            >
                                บันทึกเพิ่ม
                            </button>
                            <button
                                className={styles.toastHomeBt}
                                onClick={() => {
                                    toast.dismiss(t.id)
                                    void router.push('/')
                                }}
                            >
                                ไปดูบันทึกที่เขียน
                            </button>
                        </span>
                    ),
                    {
                        style: {
                            padding: '1rem 4rem',
                            background: '#e8e8e8',
                        },
                        position: 'bottom-right',
                        duration: Infinity,
                    }
                )
            }
        } catch (error) {
            setLoading(false)
            console.log(error)
        }
    }

    const topicSelect = experience.find(
        (st: ExpWithSubAndWriteExp) => st.id === formData.experienceId
    )

    const handleNull = (data: string): string => {
        if (data.length > 0) {
            return data
        }
        return 'ไม่ระบุ'
    }

    return (
        <>
            <form
                className={styles.writeForm}
                onSubmit={(e) => {
                    void handleSubmit(e)
                }}
            >
                <div>
                    <label className='required' htmlFor='เลือกประสบการณ์'>
                        เลือกประสบการณ์
                    </label>
                    <Select
                        name='เลือกประสบการณ์'
                        placeholder=''
                        isDisabled={isLoading}
                        isLoading={isLoading}
                        styles={customStyles}
                        isSearchable={false}
                        onChange={(option) => {
                            setFormData({
                                ...formData,
                                experienceId: option != null ? option.id : 0,
                                experienceName:
                                    option != null ? option.label : '',
                                subTopicId:
                                    option != null
                                        ? experience[option.value - 1]
                                              .subTopic[0].id
                                        : 0,
                                subTopicName:
                                    option != null
                                        ? experience[option.value - 1]
                                              .subTopic[0].name
                                        : '',
                            })
                        }}
                        options={experience.map((data, index) => ({
                            label: data.name,
                            value: index + 1,
                            id: data.id,
                        }))}
                        required
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 0,
                            colors: {
                                ...theme.colors,
                                primary25: gray,
                                primary: gray,
                            },
                        })}
                    />
                </div>
                <div>
                    <label htmlFor='เลือกหัวข้อย่อย'>เลือกหัวข้อย่อย</label>
                    <Select
                        name='เลือกหัวข้อย่อย'
                        placeholder=''
                        isDisabled={isLoading}
                        isLoading={isLoading}
                        isSearchable={false}
                        styles={customStyles}
                        onChange={(option: any) => {
                            setFormData({
                                ...formData,
                                subTopicId: option != null ? option.value : 0,
                                subTopicName:
                                    option != null ? option.label : '',
                            })
                        }}
                        options={topicSelect?.subTopic.map((data) => ({
                            label: data.name,
                            value: data.id,
                        }))}
                        value={{
                            label: formData.subTopicName,
                        }}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 0,
                            colors: {
                                ...theme.colors,
                                primary25: gray,
                                primary: gray,
                            },
                        })}
                    />
                </div>

                {/* <div>
                    <label htmlFor='studentId'>รหัสนิสิต</label>
                    <input
                        tabIndex={-1}
                        name='studentId'
                        type='text'
                        value={formData.studentId}
                        readOnly
                        className={styles.formInput}
                    />
                </div> */}
                <div>
                    <label className='required' htmlFor='ชื่อผู้นิเทศ'>
                        ชื่อผู้นิเทศ
                    </label>
                    <Select
                        name='ชื่อผู้นิเทศ'
                        placeholder=''
                        styles={customStyles}
                        required
                        onChange={(option) => {
                            setFormData({
                                ...formData,
                                approverId: option?.id,
                                approverEmail: option?.value,
                            })
                        }}
                        options={approver.map((data) => ({
                            label: data.name,
                            value: data.email,
                            id: data.id,
                        }))}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 0,
                            colors: {
                                ...theme.colors,
                                primary25: gray,
                                primary: gray,
                            },
                        })}
                    />
                </div>
                <div>
                    <label htmlFor='อีเมลผู้นิเทศ'>อีเมลผู้นิเทศ</label>
                    <input
                        tabIndex={-1}
                        type='text'
                        name='อีเมลผู้นิเทศ'
                        value={formData.approverEmail}
                        readOnly
                        className={styles.formInput}
                        onChange={({ target }) => {
                            setFormData({
                                ...formData,
                                approverId: target.value,
                            })
                        }}
                    />
                </div>
                <div>
                    <label className='required' htmlFor='date'>
                        เลือกวันที่
                    </label>
                    <input
                        name='date'
                        type='date'
                        className={styles.formInput}
                        value={formData.date}
                        required
                        onChange={({ target }) => {
                            setFormData({ ...formData, date: target.value })
                        }}
                    />
                </div>
                <div>
                    <label className='required' htmlFor='โรงพยาบาล'>
                        โรงพยาบาล <small>&#40;พิมพ์ตัวเลือกเพิ่มได้&#41;</small>
                    </label>
                    <CreatableSelect
                        name='โรงพยาบาล'
                        styles={customStyles}
                        placeholder=''
                        required
                        isClearable
                        onChange={(option) => {
                            setFormData({
                                ...formData,
                                hospital: option?.value,
                            })
                        }}
                        options={hospital.map((data) => ({
                            label: data.name,
                            value: data.name,
                        }))}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 0,
                            colors: {
                                ...theme.colors,
                                primary25: gray,
                                primary: gray,
                            },
                        })}
                    />
                </div>
                <div>
                    <label htmlFor='หอผู้ป่วย'>หอผู้ป่วย</label>
                    <input
                        type='text'
                        name='หอผู้ป่วย'
                        className={styles.formInput}
                        value={formData.ward}
                        onChange={({ target }) => {
                            setFormData({ ...formData, ward: target.value })
                        }}
                    />
                </div>
                <div>
                    <label htmlFor='เตียงผู้ป่วย'>เตียงผู้ป่วย</label>
                    <input
                        type='text'
                        name='เตียงผู้ป่วย'
                        className={styles.formInput}
                        value={formData.patientBed}
                        onChange={({ target }) => {
                            setFormData({
                                ...formData,
                                patientBed: target.value,
                            })
                        }}
                    />
                </div>
                <div className={styles.fullWidth}>
                    {loading ? (
                        <button disabled>
                            รอสักครู่ <i className='fa fa-gear fa-spin' />
                        </button>
                    ) : (
                        <button type='submit'>ส่ง</button>
                    )}
                </div>
            </form>
        </>
    )
}
