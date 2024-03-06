import cn from 'classnames'
import { useState } from 'react'

import type { Player } from '../../../../api'

import styles from './PlayersTableRow.module.css'

export interface PlayersTableRowProps {
  isUpdating: boolean
  onDeletePlayer: () => void
  onSaveEdit: (editingPlayer: Player) => void
  player: Player
}

export function PlayersTableRow({
  isUpdating,
  onDeletePlayer,
  onSaveEdit,
  player
}: PlayersTableRowProps): JSX.Element {
  const [editingPlayer, setEditingPlayer] = useState<Player>()

  const cancelEdit = (): void => {
    setEditingPlayer(undefined)
  }

  const edit = (): void => {
    setEditingPlayer(player)
  }

  const saveEdit = (): void => {
    if (!editingPlayer) {
      return
    }
    onSaveEdit(editingPlayer)
    setEditingPlayer(undefined)
  }

  const updateName = (name: string): void => {
    if (!editingPlayer) {
      return
    }
    setEditingPlayer({
      ...editingPlayer,
      name
    })
  }

  const updateRank = (rank: string): void => {
    if (!editingPlayer) {
      return
    }
    setEditingPlayer({
      ...editingPlayer,
      rank: parseFloat(rank)
    })
  }

  const isEditing = (): boolean => {
    return editingPlayer?.id === player.id
  }

  return (
    <>
      <td className={styles.tableCell}>{player.id.slice(0, 5)}</td>
      <td className={styles.tableCell}>
        {!isEditing() && (
          <span
            className={cn(styles.cellData, {
              [styles.cellDataFaded]: isUpdating
            })}
          >
            {player.name}
          </span>
        )}
        {isEditing() && (
          <input
            className={styles.input}
            onChange={e => {
              updateName(e.target.value)
            }}
            type="text"
            value={editingPlayer?.name}
          />
        )}
      </td>
      <td className={styles.tableCell}>
        {!isEditing() && (
          <span
            className={cn(styles.cellData, {
              [styles.cellDataFaded]: isUpdating
            })}
          >
            {player.rank}
          </span>
        )}
        {isEditing() && (
          <input
            className={styles.input}
            onChange={e => {
              updateRank(e.target.value)
            }}
            type="number"
            value={editingPlayer?.rank}
          />
        )}
      </td>
      <td className={cn(styles.tableCell, styles.tableOptionsCell)}>
        <div className={styles.rowOptionsWrapper}>
          <div className={styles.rowOptions}>
            {!isEditing() && (
              <>
                <button className={'button'} onClick={edit}>
                  Edit
                </button>
                <button className={'button'} onClick={onDeletePlayer}>
                  Delete
                </button>
              </>
            )}
            {isEditing() && (
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
    </>
  )
}
