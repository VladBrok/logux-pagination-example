import { faker } from '@faker-js/faker'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useClient } from '@logux/client/react'
import { parseId } from '@logux/core'
import cn from 'classnames'
import type { Unsubscribe } from 'nanoevents'
import { useEffect, useRef, useState } from 'react'

import type { Player } from '../../api'
import {
  createPlayerAction,
  deletePlayerAction,
  loadPlayersPageAction,
  playersPageLoadedAction,
  updatePlayerAction
} from '../../api/actions.js'

import styles from './App.module.css'

function App(): JSX.Element {
  const [players, setPlayers] = useState<Player[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingPlayer, setEditingPlayer] = useState<Player>()
  const client = useClient()
  const [newPlayerAdded, setNewPlayerAdded] = useState<Player>()
  const [newPlayerAddedShown, setNewPlayerAddedShown] = useState(false)
  const [updatingPlayersAnimation, setUpdatingPlayersAnimation] = useState<
    string[]
  >([])
  const addTimeoutId = useRef<NodeJS.Timeout>()
  const [animationParent] = useAutoAnimate((el, action) => {
    let keyframes: Keyframe[] = []
    if (action === 'add') {
      keyframes = [
        { opacity: 0, transform: 'translateX(20%)' },
        { opacity: 1, transform: 'translateX(0)' }
      ]
    }
    if (action === 'remove') {
      keyframes = [
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: 'translateX(20%)' }
      ]
    }
    return new KeyframeEffect(el, keyframes, {
      duration: 400,
      easing: 'ease-in-out'
    })
  })

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
      client.type(playersPageLoadedAction, action => {
        setPlayers(action.payload.players)
        setPage(action.payload.page)
        setTotalPages(action.payload.totalPages)

        if (
          action.payload.page > action.payload.totalPages &&
          action.payload.totalPages > 0
        ) {
          updatePage(action.payload.totalPages)
        }
      })
    )

    sub.push(
      client.type(updatePlayerAction, (action, meta) => {
        if (client.clientId === parseId(meta.id).clientId) {
          return
        }

        setUpdatingPlayersAnimation(prev => [...prev, action.payload.id])
        setTimeout(() => {
          setPlayers(data =>
            data.map(x => (x.id === action.payload.id ? action.payload : x))
          )
          setUpdatingPlayersAnimation(prev =>
            prev.filter(x => x !== action.payload.id)
          )
        }, 1000)
      })
    )

    sub.push(
      client.type(deletePlayerAction, () => {
        refreshPage()
      })
    )

    sub.push(
      client.type(createPlayerAction, () => {
        refreshPage()
      })
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
    client.sync(
      loadPlayersPageAction({
        page: newPage
      })
    )
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
      client.sync(deletePlayerAction({ id: player.id }))
    }

  const cancelEdit = (): void => {
    setEditingPlayer(undefined)
  }

  const saveEdit = (): void => {
    if (!editingPlayer) {
      return
    }

    setPlayers(data =>
      data.map(player =>
        player.id === editingPlayer.id ? editingPlayer : player
      )
    )
    setEditingPlayer(undefined)
    client.sync(updatePlayerAction(editingPlayer))
  }

  const addPlayer = (): void => {
    const player: Player = {
      id: faker.string.uuid(),
      name: faker.person.firstName(),
      rank: faker.number.int({ max: 100, min: 1 })
    }
    client.sync(createPlayerAction(player))

    clearTimeout(addTimeoutId.current)
    addTimeoutId.current = setTimeout(() => {
      setNewPlayerAddedShown(false)
    }, 2000)

    setNewPlayerAdded(player)
    setNewPlayerAddedShown(true)
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
          <button className={styles.button} onClick={addPlayer}>
            Add random player
          </button>
          <span
            className={cn(styles.playerAdded, {
              [styles.playerAddedVisible]: newPlayerAddedShown
            })}
          >
            Added new player: {newPlayerAdded?.name}
          </span>
        </div>
        <div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableRow}>
                  <th className={styles.tableHeaderCell}>ID</th>
                  <th className={styles.tableHeaderCell}>Name</th>
                  <th className={styles.tableHeaderCell}>Rank</th>
                  <th className={styles.tableHeaderCell}></th>
                </tr>
              </thead>
              <tbody ref={animationParent}>
                {players.map(player => (
                  <tr className={styles.tableRow} key={player.id}>
                    <td className={styles.tableCell}>
                      {player.id.slice(0, 6)}
                    </td>
                    <td className={styles.tableCell}>
                      {editingPlayer?.id !== player.id && (
                        <span
                          className={cn(styles.cellData, {
                            [styles.cellDataFaded]:
                              updatingPlayersAnimation.includes(player.id)
                          })}
                        >
                          {player.name}
                        </span>
                      )}
                      {editingPlayer?.id === player.id && (
                        <input
                          className={styles.input}
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
                      {editingPlayer?.id !== player.id && (
                        <span
                          className={cn(styles.cellData, {
                            [styles.cellDataFaded]:
                              updatingPlayersAnimation.includes(player.id)
                          })}
                        >
                          {player.rank}
                        </span>
                      )}
                      {editingPlayer?.id === player.id && (
                        <input
                          className={styles.input}
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
                    <td
                      className={cn(styles.tableCell, styles.tableOptionsCell)}
                    >
                      <div className={styles.rowOptionsWrapper}>
                        <div className={styles.rowOptions}>
                          {editingPlayer?.id !== player.id && (
                            <>
                              <button
                                className={styles.button}
                                onClick={edit(player)}
                              >
                                Edit
                              </button>
                              <button
                                className={styles.button}
                                onClick={deletePlayer(player)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {editingPlayer?.id === player.id && (
                            <>
                              <button
                                className={styles.button}
                                onClick={saveEdit}
                              >
                                Save
                              </button>{' '}
                              <button
                                className={styles.button}
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.paginationContainer}>
            <button
              className={cn(styles.paginationButton, styles.button)}
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
              className={cn(styles.paginationButton, styles.button)}
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
