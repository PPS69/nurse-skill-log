import React from 'react'
import styles from './overview.module.css'

export default function OverviewLoading(): JSX.Element {
    const headersSize = ['20%', '50%', '10%', '10%']

    return (
        <div className={styles.tableContainer}>
            <table className={styles.tables}>
                <thead>
                    <tr>
                        {[...Array(5)].map((header, index) => (
                            <th
                                className={styles.theadLoading}
                                scope='col'
                                key={index}
                                style={{ width: headersSize[index] }}
                            >
                                <span />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(5)].map((x, i) => (
                        <React.Fragment key={i + 10}>
                            <tr className={styles.tbodyLoading}>
                                <td rowSpan={2}>
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
                            <tr className={styles.tbodyLoading}>
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
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
