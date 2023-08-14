import { type Dispatch, type SetStateAction, useState } from 'react'

import { type customSyllabus } from '../../../pages/admin/syllabus'
import {
    type customExperience,
    ExperienceReducer,
} from '../../../reducer/admin/experience'
import { fetchData } from '../../../utils/fetcher'
import SubTopicComponent from './supTopic'
import styles from './syllabus.module.css'

interface syllabusProps {
    syllabusList: customSyllabus[] | undefined
    setSyllabusList: Dispatch<SetStateAction<customSyllabus[]>>
}

export default function AllSyllabus({
    syllabusList,
    setSyllabusList,
}: syllabusProps): JSX.Element {
    const [syllabusInfo, setSyllabusInfo] = useState({
        name: '',
        index: -1,
    })
    const {
        experienceState,
        setLoadingTrue,
        setLoadingFalse,
        setExperienceName,
        setEditExperienceIndex,
        setEditSubtopicIndex,
        resetAllEditIndex,
        setAddExperience,
        setAddSubTopic,
        resetAllAdd,
        setSelectedExperience,
        resetSelectedExperience,
    } = ExperienceReducer()

    async function handleChangeSyllabusName(syllabusId: number): Promise<void> {
        const name = syllabusInfo.name
        try {
            setLoadingTrue()
            const { data } = await fetchData<customSyllabus>(
                `/api/syllabus/`,
                'PUT',
                {
                    id: syllabusId,
                    name,
                }
            )
            const updatedArray = syllabusList?.map((syllabus) => {
                if (syllabus.id === data.id) {
                    return {
                        ...syllabus,
                        name: data.name,
                    }
                }
                return syllabus
            })
            setSyllabusList(updatedArray as customSyllabus[])
            setSyllabusInfo({
                ...syllabusInfo,
                index: -1,
            })
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingFalse()
        }
    }
    async function handleDeleteSyllabus(
        syllabusId: number,
        syllabusName: string
    ): Promise<void> {
        if (confirm(`กดตกลงเพื่อดำเนินการหลักสูตร ${syllabusName ?? ''}`))
            try {
                setLoadingTrue()
                const { data } = await fetchData<customSyllabus>(
                    `/api/syllabus/`,
                    'DELETE',
                    {
                        id: syllabusId,
                    }
                )
                setSyllabusList(data as customSyllabus[])
            } catch (error) {
                console.log(error)
            } finally {
                setLoadingFalse()
            }
    }

    async function handleSaveExperienceName(
        syllabusId: number,
        id: number
    ): Promise<void> {
        const experienceName = experienceState.experienceName
        try {
            setLoadingTrue()
            const { data } = await fetchData<customSyllabus>(
                `/api/syllabus/${syllabusId}/experience`,
                'PUT',
                {
                    id,
                    experienceName,
                }
            )
            // console.log('data', data)
            updateObject(data)
            resetAllEditIndex()
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingFalse()
        }
    }

    async function handleAddExperience(syllabusId: number): Promise<void> {
        const experienceName = experienceState.experienceName
        try {
            setLoadingTrue()
            const { data } = await fetchData<customSyllabus>(
                `/api/syllabus/${syllabusId}/experience`,
                'POST',
                { experienceName }
            )
            // console.log('===>', data)
            const updatedArray = syllabusList?.map((syllabus) => {
                if (syllabus.id === data.id) {
                    return {
                        ...syllabus,
                        experiences: [
                            ...syllabus.experiences,
                            data.experiences[0],
                        ],
                    }
                }
                return syllabus
            })
            // console.log('PUSHARRAY', updatedArray)
            setSyllabusList(updatedArray as customSyllabus[])
            resetAllEditIndex()
            resetAllAdd()
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingFalse()
        }
    }

    async function handleDeleteExperience(
        syllabusId: number,
        experienceId: number,
        experienceName: string
    ): Promise<void> {
        if (
            confirm(`กดตกลงเพื่อดำเนินการลบประสบการณ์ ${experienceName ?? ''}`)
        ) {
            try {
                setLoadingTrue()
                const { data } = await fetchData<customSyllabus>(
                    `/api/syllabus/${syllabusId}/experience`,
                    'DELETE',
                    { id: experienceId }
                )
                // console.log('===>', data)
                const updatedArray = syllabusList?.map((syllabus) => {
                    if (syllabus.id === data.id) {
                        const filteredExperiences = syllabus.experiences.filter(
                            (experience) =>
                                experience.id !== data.experiences[0].id
                        )
                        return {
                            ...syllabus,
                            experiences: filteredExperiences,
                        }
                    }
                    return syllabus
                })

                // console.log('UPDATAARRAY', updatedArray)
                setSyllabusList(updatedArray as customSyllabus[])

                resetAllEditIndex()
                resetSelectedExperience()
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingFalse()
            }
        }
    }

    function updateObject(data: customSyllabus): void {
        if (syllabusList == null) {
            return
        }
        const updatedArray = syllabusList?.map((syllabus) => {
            if (syllabus.id === data.id) {
                return {
                    ...syllabus,
                    experiences: syllabus.experiences.map((experience) => {
                        if (experience.id === data.experiences[0].id) {
                            return data.experiences[0]
                        }
                        return experience
                    }),
                }
            }
            return syllabus
        })
        // console.log('UPDATEARRAY', updatedArray)
        setSyllabusList(updatedArray)
    }

    return (
        <div className={styles.container}>
            {syllabusList?.map((syllabus: customSyllabus, syllabusIndex) => (
                <div className={styles.containerBlock} key={syllabus.id}>
                    {syllabusInfo.index === syllabusIndex ? (
                        <form
                            className={styles.editSyllabusName}
                            onSubmit={(e) => {
                                e.preventDefault()
                                void handleChangeSyllabusName(syllabus.id)
                            }}
                        >
                            <input
                                required
                                value={syllabusInfo.name}
                                onChange={({ target }) => {
                                    setSyllabusInfo({
                                        ...syllabusInfo,
                                        name: target.value,
                                    })
                                }}
                            />
                            <div className={styles.editSyllabusButtonContainer}>
                                <button
                                    disabled={experienceState.loading}
                                    type='submit'
                                    className={styles.greenButton}
                                >
                                    <i className='fa fa-check' />
                                </button>
                                <button
                                    disabled={experienceState.loading}
                                    className={styles.redButton}
                                    onClick={() => {
                                        setSyllabusInfo({
                                            ...syllabusInfo,
                                            name: syllabus.name,
                                            index: -1,
                                        })
                                    }}
                                >
                                    <i className='fa fa-close' />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p>
                            {syllabus.name}
                            <i
                                className='fa fa-edit'
                                style={{
                                    marginLeft: '.5rem',
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    setSyllabusInfo({
                                        ...syllabusInfo,
                                        name: syllabus.name,
                                        index: syllabusIndex,
                                    })
                                }}
                            />
                            <i
                                className='fa fa-trash-o'
                                style={{
                                    marginLeft: '1rem',
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    void handleDeleteSyllabus(
                                        syllabus.id,
                                        syllabus.name
                                    )
                                }}
                            />
                        </p>
                    )}
                    <div className={styles.boxContainer}>
                        <div className={styles.experienceContainer}>
                            {syllabus.experiences.map(
                                (experience: customExperience, index) =>
                                    experienceState.editExperienceIndex ===
                                    index ? (
                                        <button
                                            disabled={experienceState.loading}
                                            className={
                                                experienceState
                                                    .selectedExperience.id ===
                                                experience.id
                                                    ? styles.blockActive
                                                    : styles.block
                                            }
                                            key={experience.id}
                                            onClick={() => {
                                                setSelectedExperience({
                                                    syllabusId: syllabus.id,
                                                    id: experience.id,
                                                    name: experience.name,
                                                    subTopic:
                                                        experience.subTopic,
                                                })
                                            }}
                                        >
                                            <input
                                                disabled={
                                                    experienceState.loading
                                                }
                                                autoFocus
                                                value={
                                                    experienceState.experienceName
                                                }
                                                onChange={({ target }) => {
                                                    setExperienceName(
                                                        target.value
                                                    )
                                                }}
                                            />
                                            <div
                                                className={
                                                    styles.syllabusButtonContainer
                                                }
                                            >
                                                <button
                                                    disabled={
                                                        experienceState.loading
                                                    }
                                                    type='button'
                                                    className={
                                                        styles.greenButton
                                                    }
                                                    onClick={() => {
                                                        void handleSaveExperienceName(
                                                            syllabus.id,
                                                            experienceState
                                                                .selectedExperience
                                                                .id
                                                        )
                                                    }}
                                                >
                                                    <i className='fa fa-check' />
                                                </button>
                                                <button
                                                    disabled={
                                                        experienceState.loading
                                                    }
                                                    className={styles.redButton}
                                                    onClick={() => {
                                                        setEditExperienceIndex(
                                                            -1
                                                        )
                                                    }}
                                                >
                                                    <i className='fa fa-close' />
                                                </button>
                                                <button
                                                    disabled={
                                                        experienceState.loading
                                                    }
                                                    className={
                                                        styles.grayButton
                                                    }
                                                    onClick={() => {
                                                        void handleDeleteExperience(
                                                            syllabus.id,
                                                            experience.id,
                                                            experience.name
                                                        )
                                                    }}
                                                >
                                                    <i className='fa fa-trash' />
                                                </button>
                                            </div>
                                        </button>
                                    ) : (
                                        <button
                                            disabled={experienceState.loading}
                                            className={
                                                experienceState
                                                    .selectedExperience.id ===
                                                experience.id
                                                    ? styles.blockActive
                                                    : styles.block
                                            }
                                            key={experience.id}
                                            onClick={() => {
                                                setSelectedExperience({
                                                    syllabusId: syllabus.id,
                                                    id: experience.id,
                                                    name: experience.name,
                                                    subTopic:
                                                        experience.subTopic,
                                                })
                                                setExperienceName(
                                                    experience.name
                                                )
                                                resetAllEditIndex()
                                                resetAllAdd()
                                            }}
                                            onDoubleClick={() => {
                                                setEditExperienceIndex(index)
                                            }}
                                        >
                                            {experience.name}
                                        </button>
                                    )
                            )}
                            {experienceState.addExperience === syllabusIndex ? (
                                <form
                                    className={styles.blockActive}
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        void handleAddExperience(syllabus.id)
                                    }}
                                >
                                    <input
                                        disabled={experienceState.loading}
                                        required
                                        placeholder='ชื่อประสบการณ์'
                                        autoFocus
                                        value={experienceState.experienceName}
                                        onChange={({ target }) => {
                                            setExperienceName(target.value)
                                        }}
                                    />
                                    <div
                                        className={
                                            styles.syllabusButtonContainer
                                        }
                                    >
                                        <button
                                            disabled={experienceState.loading}
                                            type='submit'
                                            className={styles.greenButton}
                                        >
                                            <i className='fa fa-check' />
                                        </button>
                                        <button
                                            disabled={experienceState.loading}
                                            className={styles.redButton}
                                            onClick={() => {
                                                setAddExperience(-1)
                                            }}
                                        >
                                            <i className='fa fa-close' />
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    disabled={experienceState.loading}
                                    className={styles.addBlock}
                                    onClick={() => {
                                        setAddExperience(syllabusIndex)
                                        resetAllEditIndex()
                                        setExperienceName('')
                                    }}
                                >
                                    เพิ่มประสบการณ์{' '}
                                    <i
                                        className='fa fa-plus-circle'
                                        style={{ paddingLeft: '5px' }}
                                    />
                                </button>
                            )}
                        </div>
                        <SubTopicComponent
                            syllabus={syllabus}
                            updateObject={updateObject}
                            experienceState={experienceState}
                            setLoadingTrue={setLoadingTrue}
                            setLoadingFalse={setLoadingFalse}
                            setEditSubtopicIndex={setEditSubtopicIndex}
                            resetAllEditIndex={resetAllEditIndex}
                            setAddSubTopic={setAddSubTopic}
                            resetAllAdd={resetAllAdd}
                            setSelectedExperience={setSelectedExperience}
                        />
                    </div>
                    {/* <div className={styles.buttonContainer}>
                        <button className={styles.grayButton}>
                            เรียงลำดับ
                        </button>
                        <button className={styles.greenButton}>
                            เพิ่มประสบการณ์
                        </button>
                    </div> */}
                </div>
            ))}

            {/* {[...Array(9)].map((x, i) => (
                <div className={styles.syllabusBlock} key={i}>
                    <p>ชื่อ:</p>
                    <p>email:</p>
                </div>
            ))} */}
        </div>
    )
}
