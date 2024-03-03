import { LoguxNotFoundError } from '@logux/actions'
import type { BaseServer } from '@logux/server'

import {
  createPlayerAction,
  deletePlayerAction,
  loadPlayersPageAction,
  playersPageLoadedAction,
  updatePlayerAction
} from '../../api/actions.js'
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
      return playersPageLoadedAction(playersPage)
    }
  })

  server.type(loadPlayersPageAction, {
    async access() {
      return true
    },
    async process(ctx, action) {
      const playersPage = await getPlayersPage(action.payload.page)
      await ctx.sendBack(playersPageLoadedAction(playersPage))
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

  server.type(updatePlayerAction, {
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

  server.type(deletePlayerAction, {
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
