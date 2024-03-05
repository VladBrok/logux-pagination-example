import { useClient } from '@logux/client/react'
import { parseId } from '@logux/core'
import type { Unsubscribe } from 'nanoevents'
import { useEffect, useState } from 'react'

import { PER_PAGE, type Player } from '../../../../api'
import {
  createPlayerAction,
  deletePlayerAction,
  loadPlayersPageAction,
  playerCreatedAction,
  playerDeletedAction,
  PLAYERS_CHANNEL,
  playersPageLoadedAction,
  updatePlayerAction
} from '../../../../api/actions.js'
import { useSubscription } from '../../hooks/use-subscription'
import { useTableAnimation } from '../../hooks/use-table-animation'
import { Pagination } from '../Pagination/Pagination'
import { PlayersTableRow } from '../PlayersTableRow/PlayersTableRow'
import { Spinner } from '../Spinner/Spinner'
import { TableOptions } from '../TableOptions/TableOptions'

import styles from './PlayersTable.module.css'

export function PlayersTable(): JSX.Element {
  const [players, setPlayers] = useState<Player[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const client = useClient()
  const [updatingPlayersAnimation, setUpdatingPlayersAnimation] = useState<
    string[]
  >([])
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
          setPlayers(prev =>
            prev.map(x => (x.id === action.payload.id ? action.payload : x))
          )
          setUpdatingPlayersAnimation(prev =>
            prev.filter(x => x !== action.payload.id)
          )
        }, 1000)
      })
    )

    sub.push(client.type(playerDeletedAction, refreshCurrentPage))

    sub.push(client.type(playerCreatedAction, refreshCurrentPage))

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

  const refreshCurrentPage = (action: {
    payload: { senderClientId: string }
  }): void => {
    updatePage(
      page,
      client.clientId === action.payload.senderClientId
        ? setIsUpdating
        : () => {}
    )
  }

  const deletePlayer = (player: Player): void => {
    setPlayers(data => data.filter(x => x.id !== player.id))
    setIsUpdating(true)
    client.sync(deletePlayerAction({ id: player.id })).catch(() => {
      setIsUpdating(false)
    })
  }

  const saveEditedPlayer = (edited: Player): void => {
    setPlayers(data =>
      data.map(player => (player.id === edited.id ? edited : player))
    )
    client.sync(updatePlayerAction(edited))
  }

  const createPlayer = async (player: Player): Promise<void> => {
    setIsUpdating(true)
    client.sync(createPlayerAction(player)).catch(() => {
      setIsUpdating(false)
    })
    if (players.length < PER_PAGE) {
      setPlayers(data => [...data, player])
    }
  }

  return (
    <div className={styles.content}>
      <h2 className={styles.tableTitle}>All Players</h2>
      <TableOptions isUpdating={isUpdating} onCreatePlayer={createPlayer} />
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
                  <PlayersTableRow
                    isUpdating={updatingPlayersAnimation.includes(player.id)}
                    onDeletePlayer={() => {
                      deletePlayer(player)
                    }}
                    onSaveEdit={saveEditedPlayer}
                    player={player}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          onNextPage={nextPage}
          onPrevPage={prevPage}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
