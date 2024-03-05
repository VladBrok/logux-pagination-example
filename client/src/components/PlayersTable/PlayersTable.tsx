import { faker } from '@faker-js/faker'
import { useClient } from '@logux/client/react'
import { parseId } from '@logux/core'
import cn from 'classnames'
import type { Unsubscribe } from 'nanoevents'
import { useEffect, useRef, useState } from 'react'

import { PER_PAGE, type Player } from '../../../../api'
import {
  PLAYERS_CHANNEL,
  createPlayerAction,
  deletePlayerAction,
  loadPlayersPageAction,
  playerCreatedAction,
  playerDeletedAction,
  playersPageLoadedAction,
  updatePlayerAction
} from '../../../../api/actions.js'
import { useSubscription } from '../../hooks/use-subscription'
import { useTableAnimation } from '../../hooks/use-table-animation'
import { Pagination } from '../Pagination/Pagination'
import { Spinner } from '../Spinner/Spinner'

import styles from './PlayersTable.module.css'

export function PlayersTable(): JSX.Element {
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
  const [animationParent] = useTableAnimation()
  const [isLoadingPage, setIsLoadingPage] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useSubscription(PLAYERS_CHANNEL, setIsLoadingPage)

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

    sub.push(client.type(playerDeletedAction, refreshPage))

    sub.push(client.type(playerCreatedAction, refreshPage))

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

  const updatePage = (
    newPage: number,
    setIsLoading = setIsLoadingPage
  ): void => {
    setPage(newPage)
    setIsLoading(true)
    client
      .sync(
        loadPlayersPageAction({
          page: newPage
        })
      )
      .finally(() => {
        setIsLoading(false)
      })
  }

  const refreshPage = (action: {
    payload: { senderClientId: string }
  }): void => {
    updatePage(
      page,
      client.clientId === action.payload.senderClientId
        ? setIsUpdating
        : () => {}
    )
  }

  const edit =
    (player: Player): (() => void) =>
    (): void => {
      setEditingPlayer(player)
    }

  const deletePlayer =
    (player: Player): (() => void) =>
    (): void => {
      setPlayers(data => data.filter(x => x.id !== player.id))
      setIsUpdating(true)
      client.sync(deletePlayerAction({ id: player.id })).catch(() => {
        setIsUpdating(false)
      })
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

  const createPlayer = async (): Promise<void> => {
    const player: Player = {
      id: faker.string.uuid(),
      name: faker.person.firstName(),
      rank: faker.number.int({ max: 100, min: 1 }),
      updatedAt: Date.now()
    }

    setIsUpdating(true)
    client.sync(createPlayerAction(player)).catch(() => {
      setIsUpdating(false)
    })

    clearTimeout(addTimeoutId.current)
    addTimeoutId.current = setTimeout(() => {
      setNewPlayerAddedShown(false)
    }, 2000)
    setNewPlayerAdded(player)
    setNewPlayerAddedShown(true)

    if (players.length < PER_PAGE) {
      setPlayers(data => [...data, player])
    }
  }

  return (
    <div className={styles.content}>
      <h2 className={styles.tableTitle}>All Players</h2>
      <div className={styles.tableOptions}>
        <button className={'button'} onClick={createPlayer}>
          Add random player
        </button>
        <span
          className={cn(styles.playerAdded, {
            [styles.playerAddedVisible]: newPlayerAddedShown
          })}
        >
          Added new player: {newPlayerAdded?.name}
        </span>
        {isUpdating && (
          <div className={styles.updateIndicator}>Updating...</div>
        )}
      </div>
      <div>
        <div className={styles.tableWrapper}>
          {isLoadingPage && (
            <div className={styles.tableSpinner}>
              <Spinner />
            </div>
          )}
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
                  <td className={styles.tableCell}>{player.id.slice(0, 6)}</td>
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
                  <td className={cn(styles.tableCell, styles.tableOptionsCell)}>
                    <div className={styles.rowOptionsWrapper}>
                      <div className={styles.rowOptions}>
                        {editingPlayer?.id !== player.id && (
                          <>
                            <button className={'button'} onClick={edit(player)}>
                              Edit
                            </button>
                            <button
                              className={'button'}
                              onClick={deletePlayer(player)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {editingPlayer?.id === player.id && (
                          <>
                            <button className={'button'} onClick={saveEdit}>
                              Save
                            </button>{' '}
                            <button className={'button'} onClick={cancelEdit}>
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

        <Pagination
          nextPage={nextPage}
          page={page}
          prevPage={prevPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
