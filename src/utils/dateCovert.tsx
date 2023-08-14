export default function UseTimeConvert(date: Date): JSX.Element {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

    let outputString: string

    if (diffInMinutes < 1) {
        outputString = 'ไม่กี่วินาทีที่ผ่านมา'
    }
    // 1
    else if (diffInMinutes < 60) {
        outputString = `${diffInMinutes} นาทีที่แล้ว`
    }
    // 2
    else if (
        now.getDate() === date.getDate() &&
        now.getMonth() === date.getMonth() &&
        now.getFullYear() === date.getFullYear()
    ) {
        outputString = `วันนี้ เวลา ${formatTime(date)}`
    }
    // 3
    else if (
        now.getDate() - date.getDate() === 1 &&
        now.getMonth() === date.getMonth() &&
        now.getFullYear() === date.getFullYear()
    ) {
        outputString = `เมื่อวานนี้ เวลา ${formatTime(date)}`
    } else {
        outputString = `${date.getDate()}/${
            date.getMonth() + 1
        }/${date.getFullYear()} เวลา ${formatTime(date)}`
    }
    const monthNames = [
        'มกราคม',
        'กุมภาพันธ์',
        'มีนาคม',
        'เมษายน',
        'พฤษภาคม',
        'มิถุนายน',
        'กรกฎาคม',
        'สิงหาคม',
        'กันยายน',
        'ตุลาคม',
        'พฤศจิกายน',
        'ธันวาคม',
    ]

    const fullDateString = `${date.getDate()} ${
        monthNames[date.getMonth()]
    } ${date.getFullYear()} เวลา ${formatTime(date)}`

    return <span title={fullDateString}>{outputString}</span>
}

function formatTime(date: Date): string {
    const hours = date.getHours()
    const minutes = date.getMinutes()

    return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')} น.`
}
