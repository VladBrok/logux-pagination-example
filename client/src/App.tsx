import { useClient } from '@logux/client/react'
import cn from 'classnames'
import type { Unsubscribe } from 'nanoevents'
import { useEffect, useState } from 'react'

import type { Player, PlayersPageResponse } from '../../api'

import styles from './App.module.css'

function App(): JSX.Element {
  const [players, setPlayers] = useState<Player[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const client = useClient()

  useEffect(() => {
    const sub: Unsubscribe[] = []

    sub.push(
      // TODO: use createAction (typescript fsa?)
      client.type<{ payload: PlayersPageResponse; type: string }>(
        'players/pageLoaded',
        action => {
          setPlayers(action.payload.players)
          setPage(action.payload.page)
          setTotalPages(action.payload.totalPages)
        }
      )
    )

    // TODO: show loader
    client.sync({
      channel: 'players',
      type: 'logux/subscribe'
    })

    return () => {
      client.sync({
        channel: 'players',
        type: 'logux/unsubscribe'
      })
      sub.forEach(unsubscribe => unsubscribe())
    }
  }, [])

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
        <h2 className={styles.tableTitle}>Top Players</h2>
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
              {players.map(player => (
                <tr key={player.id}>
                  <td className={styles.tableCell}>{player.id}</td>
                  <td className={styles.tableCell}>{player.name}</td>
                  <td className={styles.tableCell}>{player.rank}</td>
                  <td className={cn(styles.tableCell, styles.tableOptionsCell)}>
                    <div className={styles.rowOptions}>
                      <button>Edit</button>
                      <button>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.paginationContainer}>
            <button
              className={styles.paginationButton}
              disabled={page === 1}
              title="Go to previous page"
            >
              &lt;
            </button>
            <div>
              Page {page} of {totalPages}
            </div>
            <button
              className={styles.paginationButton}
              disabled={page === totalPages}
              title="Go to next page"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
