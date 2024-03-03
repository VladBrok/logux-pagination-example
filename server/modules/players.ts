import { LoguxNotFoundError } from '@logux/actions'
import type { BaseServer } from '@logux/server'

import { createPlayerAction, loadPlayersPageAction } from '../../api/actions.js'
import {
  createPlayer,
  deletePlayer,
  findPlayer,
  getPlayersPage,
  updatePlayer
} from '../db.js'

export default (server: BaseServer): void => {
  server.channel('players', {
    access() {
      return true
    },
    async load() {
      const playersPage = await getPlayersPage(1)
      return {
        payload: playersPage,
        type: 'players/pageLoaded'
      }
    }
  })

  server.type(loadPlayersPageAction, {
    async access() {
      return true
    },
    async process(ctx, action) {
      const playersPage = await getPlayersPage(action.payload.page)
      await ctx.sendBack({
        payload: playersPage,
        type: 'players/pageLoaded'
      })
    }
  })

  server.type(createPlayerAction, {
    async access() {
      return true
    },
    async process(ctx, action) {
      await createPlayer(action.payload)
    },
    resend() {
      return 'players'
    }
  })

  server.type('players/update', {
    async access() {
      return true
    },
    async process(ctx, action) {
      const player = await findPlayer(action.payload.id)

      if (!player) throw new LoguxNotFoundError()

      await updatePlayer(action.payload)
    },
    resend() {
      return 'players'
    }
  })

  server.type('players/delete', {
    async access() {
      return true
    },
    async process(ctx, action) {
      await deletePlayer(action.payload.id)
    },
    resend() {
      return 'players'
    }
  })
}
