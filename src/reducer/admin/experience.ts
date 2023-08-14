import { type SubTopic } from '@prisma/client'
import { useReducer } from 'react'

export interface customExperience {
    syllabusId: number
    id: number
    name: string
    subTopic: SubTopic[]
}

export interface State {
    loading: boolean
    experienceName: string
    editExperienceIndex: number
    editSubTopicIndex: number
    addExperience: number
    addSubTopic: number
    selectedExperience: customExperience
}

type Action =
    | { type: 'SET_LOADING_TRUE' }
    | { type: 'SET_LOADING_FALSE' }
    | { type: 'SET_EXPERIENCE_NAME'; payload: string }
    | { type: 'SET_EDIT_EXPERIENCE_INDEX'; payload: number }
    | { type: 'SET_EDIT_SUBTOPIC_INDEX'; payload: number }
    | { type: 'RESET_ALL_EDIT_INDEX' }
    | { type: 'SET_ADD_EXPERIENCE'; payload: number }
    | { type: 'SET_ADD_SUBTOPIC'; payload: number }
    | { type: 'RESET_ALL_ADD' }
    | { type: 'SET_SELECTED_EXPERIENCE'; payload: customExperience }
    | { type: 'RESET_SELECTED_EXPERIENCE' }

interface ExperienceReducerReturnType {
    experienceState: State
    setLoadingTrue: () => void
    setLoadingFalse: () => void
    setExperienceName: (data: string) => void
    setEditExperienceIndex: (data: number) => void
    setEditSubtopicIndex: (data: number) => void
    resetAllEditIndex: () => void
    setAddExperience: (data: number) => void
    setAddSubTopic: (data: number) => void
    resetAllAdd: () => void
    setSelectedExperience: (data: customExperience) => void
    resetSelectedExperience: () => void
}

const initialState: State = {
    loading: false,
    experienceName: '',
    editExperienceIndex: -1,
    editSubTopicIndex: -1,
    addExperience: -1,
    addSubTopic: -1,
    selectedExperience: { syllabusId: 0, id: 0, name: '', subTopic: [] },
}

const experienceReducer = (experienceState: State, action: Action): State => {
    switch (action.type) {
        case 'SET_LOADING_TRUE':
            return { ...experienceState, loading: true }
        case 'SET_LOADING_FALSE':
            return { ...experienceState, loading: false }

        case 'SET_EXPERIENCE_NAME':
            return { ...experienceState, experienceName: action.payload }

        case 'SET_EDIT_EXPERIENCE_INDEX':
            return { ...experienceState, editExperienceIndex: action.payload }
        case 'SET_EDIT_SUBTOPIC_INDEX':
            return { ...experienceState, editSubTopicIndex: action.payload }
        case 'RESET_ALL_EDIT_INDEX':
            return {
                ...experienceState,
                editExperienceIndex: -1,
                editSubTopicIndex: -1,
            }

        case 'SET_ADD_EXPERIENCE':
            return { ...experienceState, addExperience: action.payload }
        case 'SET_ADD_SUBTOPIC':
            return { ...experienceState, addSubTopic: action.payload }
        case 'RESET_ALL_ADD':
            return { ...experienceState, addExperience: -1, addSubTopic: -1 }

        case 'SET_SELECTED_EXPERIENCE':
            return { ...experienceState, selectedExperience: action.payload }
        case 'RESET_SELECTED_EXPERIENCE':
            return {
                ...experienceState,
                selectedExperience: initialState.selectedExperience,
            }
        default:
            return experienceState
    }
}

export function ExperienceReducer(): ExperienceReducerReturnType {
    const [experienceState, dispatch] = useReducer(
        experienceReducer,
        initialState
    )
    function setLoadingTrue(): void {
        dispatch({ type: 'SET_LOADING_TRUE' })
    }
    function setLoadingFalse(): void {
        dispatch({ type: 'SET_LOADING_FALSE' })
    }
    function setExperienceName(data: string): void {
        dispatch({ type: 'SET_EXPERIENCE_NAME', payload: data })
    }
    function setEditExperienceIndex(data: number): void {
        dispatch({ type: 'SET_EDIT_EXPERIENCE_INDEX', payload: data })
    }
    function setEditSubtopicIndex(data: number): void {
        dispatch({ type: 'SET_EDIT_SUBTOPIC_INDEX', payload: data })
    }
    function resetAllEditIndex(): void {
        dispatch({ type: 'RESET_ALL_EDIT_INDEX' })
    }
    function setAddExperience(data: number): void {
        dispatch({ type: 'SET_ADD_EXPERIENCE', payload: data })
    }
    function setAddSubTopic(data: number): void {
        dispatch({ type: 'SET_ADD_SUBTOPIC', payload: data })
    }
    function resetAllAdd(): void {
        dispatch({ type: 'RESET_ALL_ADD' })
    }

    function setSelectedExperience(data: customExperience): void {
        dispatch({
            type: 'SET_SELECTED_EXPERIENCE',
            payload: data,
        })
    }
    function resetSelectedExperience(): void {
        dispatch({
            type: 'RESET_SELECTED_EXPERIENCE',
        })
    }

    return {
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
    }
}
