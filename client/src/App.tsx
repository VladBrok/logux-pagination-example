import { faker } from '@faker-js/faker'
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
  const [editingPlayer, setEditingPlayer] = useState<Player>()
  const client = useClient()
  const [newPlayerAdded, setNewPlayerAdded] = useState<Player>()
  const [newPlayerAddedShown, setNewPlayerAddedShown] = useState(false)

  useEffect(() => {
    client.sync({
      channel: 'players',
      type: 'logux/subscribe'
    })

    return () => {
      client.sync({
        channel: 'players',
        type: 'logux/unsubscribe'
      })
    }
  }, [])

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

          if (action.payload.page > action.payload.totalPages) {
            updatePage(action.payload.totalPages)
          }
        }
      )
    )

    sub.push(
      client.type<{ payload: Player; type: string }>(
        'players/update',
        action => {
          setPlayers(data =>
            data.map(x => (x.id === action.payload.id ? action.payload : x))
          )
        }
      )
    )

    sub.push(
      client.type<{ payload: { id: string }; type: string }>(
        'players/delete',
        refreshPage
      )
    )

    sub.push(
      client.type<{ payload: Player; type: string }>(
        'players/create',
        refreshPage
      )
    )

    return () => {
      sub.forEach(unsubscribe => {
        unsubscribe()
      })
    }
  }, [page])

  const prevPage = (): void => {
    if (page <= 1) {
      return
    }
    updatePage(page - 1)
  }

  const nextPage = (): void => {
    if (page >= totalPages) {
      return
    }
    updatePage(page + 1)
  }

  const updatePage = (newPage: number): void => {
    // TODO: show loader (maybe until /pageLoaded fires or maybe just using `sync`)
    client.sync({
      payload: {
        page: newPage
      },
      type: 'players/loadPage'
    })
  }

  const refreshPage = (): void => {
    updatePage(page)
  }

  const edit =
    (player: Player): (() => void) =>
    (): void => {
      setEditingPlayer(player)
    }

  const deletePlayer =
    (player: Player): (() => void) =>
    (): void => {
      client.sync({
        payload: {
          id: player.id
        },
        type: 'players/delete'
      })
    }

  const cancelEdit = (): void => {
    setEditingPlayer(undefined)
  }

  const saveEdit = (): void => {
    setPlayers(data =>
      data.map(player =>
        player.id === editingPlayer?.id ? editingPlayer : player
      )
    )
    setEditingPlayer(undefined)
    client.sync({
      payload: editingPlayer,
      type: 'players/update'
    })
  }

  const add = (): void => {
    const player: Player = {
      id: faker.string.uuid(),
      name: faker.person.firstName(),
      rank: faker.number.int({ max: 100, min: 1 })
    }
    client.sync({
      payload: player,
      type: 'players/create'
    })
    setNewPlayerAdded(player)
    setNewPlayerAddedShown(true)
    setTimeout(() => {
      setNewPlayerAddedShown(false)
    }, 2000)
  }

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
        <h2 className={styles.tableTitle}>All Players</h2>
        <div className={styles.tableOptions}>
          <button onClick={add}>Add random player</button>
          <span
            className={cn(styles.playerAdded, {
              [styles.playerAddedVisible]: newPlayerAddedShown
            })}
          >
            Added new player: {newPlayerAdded?.name}
          </span>
        </div>
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
                  <td className={styles.tableCell}>{player.id.slice(0, 6)}</td>
                  <td className={styles.tableCell}>
                    {editingPlayer?.id !== player.id && player.name}
                    {editingPlayer?.id === player.id && (
                      <input
                        onChange={e => {
                          setEditingPlayer({
                            ...editingPlayer,
                            name: e.target.value
                          })
                        }}
                        type="text"
                        value={editingPlayer.name}
                      />
                    )}
                  </td>
                  <td className={styles.tableCell}>
                    {editingPlayer?.id !== player.id && player.rank}
                    {editingPlayer?.id === player.id && (
                      <input
                        onChange={e => {
                          setEditingPlayer({
                            ...editingPlayer,
                            rank: parseFloat(e.target.value)
                          })
                        }}
                        type="number"
                        value={editingPlayer.rank}
                      />
                    )}
                  </td>
                  <td className={cn(styles.tableCell, styles.tableOptionsCell)}>
                    <div className={styles.rowOptionsWrapper}>
                      <div className={styles.rowOptions}>
                        {editingPlayer?.id !== player.id && (
                          <>
                            <button onClick={edit(player)}>Edit</button>
                            <button onClick={deletePlayer(player)}>
                              Delete
                            </button>
                          </>
                        )}
                        {editingPlayer?.id === player.id && (
                          <>
                            <button onClick={saveEdit}>Save</button>{' '}
                            <button onClick={cancelEdit}>Cancel</button>
                          </>
                        )}
                      </div>
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
              onClick={prevPage}
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
              onClick={nextPage}
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
