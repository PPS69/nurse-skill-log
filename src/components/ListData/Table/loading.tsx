import styles from '../ListData.module.css'

export function TableLoading(): JSX.Element {
    return (
        <table className={styles.tables}>
            <thead>
                <tr>
                    {[...Array(6)].map((x, i) => (
                        <th className={styles.theadLoading} key={i}>
                            <span />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {[...Array(9)].map((x, i) => (
                    <tr className={styles.tbodyLoading} key={i + 10}>
                        <td>
                            <span />
                        </td>
                        <td>
                            <span />
                        </td>
                        <td>
                            <span />
                        </td>
                        <td>
                            <span />
                        </td>
                        <td>
                            <span />
                        </td>
                        <td>
                            <span />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
