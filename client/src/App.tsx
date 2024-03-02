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
    </div>
  )
}

export default App
