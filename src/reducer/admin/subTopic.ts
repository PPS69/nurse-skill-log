import { type SubTopic } from '@prisma/client'

interface State {
    subTopicInfo: SubTopic
}

type SubTopicAction =
    | {
          type: 'RESET_SUBTOPIC_INFO'
      }
    | {
          type: 'SET_SUBTOPIC_INFO'
          payload: SubTopic
      }
    | {
          type: 'SET_SUBTOPIC_EXPERIENCEID'
          payload: number
      }
    | {
          type: 'SET_SUBTOPIC_NAME'
          payload: string | null
      }
    | {
          type: 'SET_SUBTOPIC_PP'
          payload: number
      }
    | {
          type: 'SET_SUBTOPIC_TTC'
          payload: number
      }

export const initialSubTopicInfo: State = {
    subTopicInfo: {
        id: 0,
        experienceId: 0,
        name: '',
        practicePrinciples: 0,
        throughoutTheCourse: 0,
        completed: false,
    },
}

export const subTopicReducer = (
    state: State,
    action: SubTopicAction
): State => {
    switch (action.type) {
        case 'RESET_SUBTOPIC_INFO':
            return initialSubTopicInfo
        case 'SET_SUBTOPIC_INFO':
            return {
                ...state,
                subTopicInfo: action.payload,
                // id: action.payload.id,
                // experienceId: action.payload.experienceId,
                // name: action.payload.name ?? '',
                // practicePrinciples: action.payload.practicePrinciples,
                // throughoutTheCourse: action.payload.throughoutTheCourse,
            }
        case 'SET_SUBTOPIC_EXPERIENCEID':
            return {
                ...state,
                subTopicInfo: {
                    ...state.subTopicInfo,
                    experienceId: action.payload,
                },
            }
        case 'SET_SUBTOPIC_NAME':
            return {
                ...state,
                subTopicInfo: { ...state.subTopicInfo, name: action.payload },
            }
        case 'SET_SUBTOPIC_PP': {
            let practicePrinciples = action.payload
            if (isNaN(practicePrinciples) || practicePrinciples <= 0) {
                practicePrinciples = 0
            }

            return {
                ...state,
                subTopicInfo: { ...state.subTopicInfo, practicePrinciples },
            }
        }
        case 'SET_SUBTOPIC_TTC': {
            let throughoutTheCourse = action.payload
            if (isNaN(throughoutTheCourse) || throughoutTheCourse <= 0) {
                throughoutTheCourse = 0
            }
            return {
                ...state,
                subTopicInfo: {
                    ...state.subTopicInfo,
                    throughoutTheCourse: action.payload,
                },
            }
        }

        default:
            return state
    }
}
