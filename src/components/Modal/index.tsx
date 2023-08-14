import { motion } from 'framer-motion'
import Backdrop from '../Backdrop'

const dropIn = {
    hidden: {
        y: 100,
        opacity: 0,
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            opacity: { duration: 0.1 },
            type: 'spring',
            damping: 25,
            stiffness: 500,
        },
    },
    exit: {
        y: 100,
        opacity: 0,
    },
}

const Modal = ({ handleClose, children }: any): JSX.Element => (
    <Backdrop onClick={handleClose}>
        <motion.div
            tabIndex={0}
            onClick={(e) => {
                e.stopPropagation()
            }}
            className='modal'
            variants={dropIn}
            initial='hidden'
            animate='visible'
            exit='exit'
        >
            {children}
        </motion.div>
    </Backdrop>
)

export default Modal
