import { LoguxNotFoundError } from '@logux/actions'
import type { BaseServer } from '@logux/server'
import { addSyncMap } from '@logux/server'

import type { Player } from '../../api/index.js'
import { createPlayer, deletePlayer, findPlayer, updatePlayer } from '../db.js'

const modelName = 'players'

export default (server: BaseServer): void => {
  addSyncMap<Player>(server, modelName, {
    async access() {
      return true
    },

    async change(ctx, id, fields) {
      const player = await findPlayer(id)

      if (!player) throw new LoguxNotFoundError()

      await updatePlayer({ id, ...fields })
    },

    async create(ctx, id, fields) {
      await createPlayer(fields)
    },

    async delete(ctx, id) {
      await deletePlayer(id)
    }
  })
}
