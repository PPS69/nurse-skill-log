export const customStyles = {
    control: (base: any, state: any): any => ({
        ...base,
        backgroundColor: '#E8E8E8',
        border: 0,
        borderRadius: '5px',
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        boxShadow: state.isFocused ? '0 0 0 2px black' : '',
        paddingLeft: '.5rem',
        fontSize: '.9rem',
        cursor: 'pointer',
    }),
    option: (defaultStyles: any, state: any) => ({
        ...defaultStyles,
        zIndex: 999,
        paddingLeft: '1rem',
        fontSize: '.9rem',
        cursor: 'pointer',
    }),
    menuList: (provided: any, _state: any) => ({
        ...provided,
        position: 'absolute',
        backgroundColor: '#E8E8E8',
        width: '100%',
        maxHeight: '230px',
    }),
}

export const options = [
    { value: 'all', label: 'แสดงทั้งหมด' },
    { value: 'new', label: 'ใหม่' },
    { value: 'wait', label: 'รอ' },
    { value: 'approved', label: 'อนุมัติ' },
    { value: 'rejected', label: 'ปฏิเสธ' },
]
