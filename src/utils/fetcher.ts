import toast from 'react-hot-toast'

interface FetchDataResponse<T> {
    status: number
    data: T
}

export const fetchData = async <T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    payload?: any
): Promise<FetchDataResponse<T> | any> => {
    const headers = {
        'Content-Type': 'application/json',
    }

    try {
        toast.dismiss()

        const toastId = toast.loading('กำลังดำเนินการ...')

        // console.log(url)

        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(payload),
        })

        if (response.status === 400) {
            const error = await response.json()
            console.log(error)
            error.map((error: any) => {
                toast.error(error.message, { id: toastId })
                return error.message
            })
        } else if (response.status === 500) {
            toast.error('Internal Server Error', { id: toastId })
        } else if (response.ok) {
            toast.success('ดำเนินการเสร็จสิ้น', { id: toastId })
        }
        const data = await response.json()

        // console.log('from fetcher', data)

        return { status: response.status, data }
    } catch (error) {
        console.log(error)
        // toast.dismiss()
        // toast.error('Internal Server Error')
    }
}
