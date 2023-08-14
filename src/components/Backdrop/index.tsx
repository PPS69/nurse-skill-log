import { motion } from 'framer-motion'
import { type ReactNode, type MouseEventHandler } from 'react'

interface BackdropProps {
    children: ReactNode
    onClick: MouseEventHandler<HTMLDivElement>
}

const Backdrop = ({ children, onClick }: BackdropProps): JSX.Element => (
    <motion.div
        onClick={onClick}
        className='backdrop'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
            duration: 0.15,
        }}
    >
        {children}
    </motion.div>
)

export default Backdrop
