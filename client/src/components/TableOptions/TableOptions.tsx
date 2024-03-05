import { faker } from '@faker-js/faker'
import cn from 'classnames'
import { useRef, useState } from 'react'

import type { Player } from '../../../../api'

import styles from './TableOptions.module.css'

export interface TableOptionsProps {
  isUpdating: boolean
  onCreatePlayer: (player: Player) => void
}

export function TableOptions({
  isUpdating,
  onCreatePlayer
}: TableOptionsProps): JSX.Element {
  const [newPlayerAdded, setNewPlayerAdded] = useState<Player>()
  const [newPlayerAddedShown, setNewPlayerAddedShown] = useState(false)
  const addTimeoutId = useRef<NodeJS.Timeout>()

  const createPlayer = async (): Promise<void> => {
    const player: Player = {
      id: faker.string.uuid(),
      name: faker.person.firstName(),
      rank: faker.number.int({ max: 100, min: 1 }),
      updatedAt: Date.now()
    }

    clearTimeout(addTimeoutId.current)
    addTimeoutId.current = setTimeout(() => {
      setNewPlayerAddedShown(false)
    }, 1500)
    setNewPlayerAdded(player)
    setNewPlayerAddedShown(true)

    onCreatePlayer(player)
  }

  return (
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
      {isUpdating && <div className={styles.updateIndicator}>Updating...</div>}
    </div>
  )
}
