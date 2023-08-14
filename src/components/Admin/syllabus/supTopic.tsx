import { type SubTopic } from '@prisma/client'
import { useReducer } from 'react'

import { type customSyllabus } from '../../../pages/admin/syllabus'
import {
    type customExperience,
    type State,
} from '../../../reducer/admin/experience'

import {
    initialSubTopicInfo,
    subTopicReducer,
} from '../../../reducer/admin/subTopic'
import { fetchData } from '../../../utils/fetcher'
import styles from './syllabus.module.css'

interface SubTopicComponentProps {
    syllabus: customSyllabus
    updateObject: (params: customSyllabus) => void
    experienceState: State
    setLoadingTrue: () => void
    setLoadingFalse: () => void
    setEditSubtopicIndex: (data: number) => void
    resetAllEditIndex: () => void
    setAddSubTopic: (data: number) => void
    resetAllAdd: () => void
    setSelectedExperience: (data: customExperience) => void
}

const SubTopicComponent = ({
    syllabus,
    updateObject,
    experienceState,
    setLoadingTrue,
    setLoadingFalse,
    setEditSubtopicIndex,
    resetAllEditIndex,
    setAddSubTopic,
    resetAllAdd,
    setSelectedExperience,
}: SubTopicComponentProps): JSX.Element => {
    const [state, dispatch] = useReducer(subTopicReducer, initialSubTopicInfo)

    async function handleAddSubTopic(syllabusId: number): Promise<void> {
        const subTopicInfo = state.subTopicInfo
        try {
            setLoadingTrue()
            const { data } = await fetchData<customSyllabus>(
                `/api/syllabus/${syllabusId}/subTopic`,
                'POST',
                subTopicInfo
            )
            // console.log('===>', data)
            updateObject(data)
            // console.log(
            //     'SelectedExperience',
            //     experienceState.selectedExperience
            // )
            setSelectedExperience({
                ...experienceState.selectedExperience,
                subTopic: data.experiences[0].subTopic,
            })
            resetAllEditIndex()
            resetAllAdd()
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingFalse()
        }
    }

    async function handleSaveSubTopicInfo(syllabusId: number): Promise<void> {
        const subTopicInfo = state.subTopicInfo
        try {
            setLoadingTrue()
            const { data } = await fetchData<customSyllabus>(
                `/api/syllabus/${syllabusId}/subTopic`,
                'PUT',
                subTopicInfo
            )
            // console.log('===>', data)
            updateObject(data)
            setSelectedExperience({
                ...experienceState.selectedExperience,
                subTopic: data.experiences[0].subTopic,
            })
            resetAllEditIndex()
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingFalse()
        }
    }

    async function handleDeleteSubTopic(
        syllabusId: number,
        experienceId: number,
        subTopicId: number,
        subTopicName: string | null
    ): Promise<void> {
        if (confirm(`กดตกลงเพื่อดำเนินการลบหัวข้อย่อย ${subTopicName ?? ''}`)) {
            try {
                setLoadingTrue()
                const { data } = await fetchData<customSyllabus>(
                    `/api/syllabus/${syllabusId}/subTopic`,
                    'DELETE',
                    { id: subTopicId, experienceId }
                )
                // console.log('===>', data)
                updateObject(data)
                setSelectedExperience({
                    ...experienceState.selectedExperience,
                    subTopic: data.experiences[0].subTopic,
                })
                resetAllEditIndex()
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingFalse()
            }
        }
    }

    return (
        <>
            {experienceState.selectedExperience.syllabusId === syllabus.id ? (
                <div className={styles.subtopicContainer}>
                    {experienceState.selectedExperience.subTopic.map(
                        (subTopic: SubTopic, index) =>
                            experienceState.editSubTopicIndex === index ? (
                                <div
                                    key={subTopic.id}
                                    className={styles.blockActive}
                                >
                                    <p>
                                        <input
                                            disabled={experienceState.loading}
                                            placeholder='ชื่อหัวข้อย่อย'
                                            value={
                                                state.subTopicInfo.name ?? ''
                                            }
                                            onChange={({ target }) => {
                                                dispatch({
                                                    type: 'SET_SUBTOPIC_NAME',
                                                    payload: target.value,
                                                })
                                            }}
                                        />
                                    </p>
                                    <p>
                                        ในวิชา:
                                        <input
                                            disabled={experienceState.loading}
                                            type='number'
                                            inputMode='numeric'
                                            min='0'
                                            value={
                                                state.subTopicInfo
                                                    .practicePrinciples
                                            }
                                            onChange={({ target }) => {
                                                dispatch({
                                                    type: 'SET_SUBTOPIC_PP',
                                                    payload: parseInt(
                                                        target.value
                                                    ),
                                                })
                                            }}
                                        />
                                    </p>
                                    <p>
                                        ตลอดหลักสูตร:
                                        <input
                                            disabled={experienceState.loading}
                                            type='number'
                                            inputMode='numeric'
                                            min='0'
                                            max='1'
                                            value={
                                                state.subTopicInfo
                                                    .throughoutTheCourse
                                            }
                                            onChange={({ target }) => {
                                                dispatch({
                                                    type: 'SET_SUBTOPIC_TTC',
                                                    payload: parseInt(
                                                        target.value
                                                    ),
                                                })
                                            }}
                                        />
                                    </p>
                                    <div className={styles.buttonContainer}>
                                        <button
                                            disabled={experienceState.loading}
                                            className={styles.greenButton}
                                            onClick={() => {
                                                void handleSaveSubTopicInfo(
                                                    syllabus.id
                                                )
                                            }}
                                        >
                                            <i className='fa fa-check' />
                                        </button>
                                        <button
                                            disabled={experienceState.loading}
                                            className={styles.redButton}
                                            onClick={() => {
                                                resetAllEditIndex()
                                            }}
                                        >
                                            <i className='fa fa-close' />
                                        </button>
                                        <button
                                            disabled={experienceState.loading}
                                            className={styles.grayButton}
                                            onClick={() => {
                                                void handleDeleteSubTopic(
                                                    syllabus.id,
                                                    subTopic.experienceId,
                                                    subTopic.id,
                                                    subTopic.name
                                                )
                                            }}
                                        >
                                            <i className='fa fa-trash' />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    disabled={experienceState.loading}
                                    key={subTopic.id}
                                    className={styles.block}
                                    onClick={() => {
                                        resetAllAdd()
                                        resetAllEditIndex()
                                        setEditSubtopicIndex(index)
                                        dispatch({
                                            type: 'SET_SUBTOPIC_INFO',
                                            payload: {
                                                id: subTopic.id,
                                                experienceId:
                                                    subTopic.experienceId,
                                                name: subTopic.name,
                                                practicePrinciples:
                                                    subTopic.practicePrinciples,
                                                throughoutTheCourse:
                                                    subTopic.throughoutTheCourse,
                                                completed: subTopic.completed,
                                            },
                                        })
                                    }}
                                >
                                    <p>{subTopic.name}</p>
                                    <p>ในวิชา: {subTopic.practicePrinciples}</p>
                                    <p>
                                        ตลอดหลักสูตร:
                                        {subTopic.throughoutTheCourse}
                                    </p>
                                </button>
                            )
                    )}
                    {experienceState.selectedExperience.id !== 0 ? (
                        experienceState.addSubTopic ===
                        experienceState.selectedExperience.id ? (
                            <div className={styles.blockActive}>
                                <p>
                                    <input
                                        disabled={experienceState.loading}
                                        placeholder='ชื่อหัวข้อย่อย'
                                        value={state.subTopicInfo.name ?? ''}
                                        onChange={({ target }) => {
                                            dispatch({
                                                type: 'SET_SUBTOPIC_NAME',
                                                payload: target.value,
                                            })
                                        }}
                                    />
                                </p>
                                <p>
                                    ในวิชา:
                                    <input
                                        disabled={experienceState.loading}
                                        type='number'
                                        inputMode='numeric'
                                        min='0'
                                        value={
                                            state.subTopicInfo
                                                .practicePrinciples
                                        }
                                        onChange={({ target }) => {
                                            dispatch({
                                                type: 'SET_SUBTOPIC_PP',
                                                payload: parseInt(target.value),
                                            })
                                        }}
                                    />
                                </p>
                                <p>
                                    ตลอดหลักสูตร:
                                    <input
                                        disabled={experienceState.loading}
                                        type='number'
                                        inputMode='numeric'
                                        min='0'
                                        minLength={1}
                                        value={
                                            state.subTopicInfo
                                                .throughoutTheCourse
                                        }
                                        onChange={({ target }) => {
                                            dispatch({
                                                type: 'SET_SUBTOPIC_TTC',
                                                payload: parseInt(target.value),
                                            })
                                        }}
                                    />
                                </p>
                                <div className={styles.buttonContainer}>
                                    <button
                                        disabled={experienceState.loading}
                                        className={styles.greenButton}
                                        onClick={() => {
                                            void handleAddSubTopic(syllabus.id)
                                        }}
                                    >
                                        <i className='fa fa-check' />
                                    </button>
                                    <button
                                        disabled={experienceState.loading}
                                        className={styles.redButton}
                                        onClick={() => {
                                            resetAllAdd()
                                        }}
                                    >
                                        <i className='fa fa-close' />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                disabled={experienceState.loading}
                                className={styles.addBlock}
                                onClick={() => {
                                    dispatch({
                                        type: 'RESET_SUBTOPIC_INFO',
                                    })
                                    dispatch({
                                        type: 'SET_SUBTOPIC_EXPERIENCEID',
                                        payload:
                                            experienceState.selectedExperience
                                                .id,
                                    })
                                    resetAllEditIndex()
                                    setAddSubTopic(
                                        experienceState.selectedExperience.id
                                    )
                                }}
                            >
                                เพิ่มหัวข้อย่อย
                                <i
                                    className='fa fa-plus-circle'
                                    style={{ paddingLeft: '5px' }}
                                />
                            </button>
                        )
                    ) : (
                        <></>
                    )}
                </div>
            ) : (
                <div className={styles.subtopicContainer} />
            )}
        </>
    )
}

export default SubTopicComponent
