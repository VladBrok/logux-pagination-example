import cn from 'classnames'

import styles from './App.module.css'

function App(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.headerContainer}>
            <img
              alt="logo"
              height="90"
              src="https://logux.org/branding/logo-light.svg"
              width="90"
            ></img>
            <h1>Logux pagination example</h1>
          </div>
        </div>

        <div>
          <div>
            <ol className={styles.instructionList}>
              <li>Open this page in 2 different browsers</li>
              <li>
                Try updating, deleting or creating new players and see how pages
                update in real-time
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <h2>Top Players</h2>
        <div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeaderCell}>ID</th>
                <th className={styles.tableHeaderCell}>Name</th>
                <th className={styles.tableHeaderCell}>Rank</th>
                <th className={styles.tableHeaderCell}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.tableCell}>omg</td>
                <td className={styles.tableCell}>omg</td>
                <td className={styles.tableCell}>omg</td>
                <td className={cn(styles.tableCell, styles.tableOptionsCell)}>
                  <div className={styles.rowOptions}>
                    <button>Edit</button>
                    <button>Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App
