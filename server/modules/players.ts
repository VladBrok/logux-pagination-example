import { isFirstOlder } from '@logux/core'
import type { BaseServer } from '@logux/server'

import {
  createPlayerAction,
  deletePlayerAction,
  loadPlayersPageAction,
  playerCreatedAction,
  playerDeletedAction,
  PLAYERS_CHANNEL,
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
  server.channel(PLAYERS_CHANNEL, {
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
      const player = await createPlayer(action.payload)
      await server.process(
        playerCreatedAction({
          player,
          senderClientId: ctx.clientId
        })
      )
    }
  })

  server.type(playerCreatedAction, {
    async access() {
      return false
    },
    resend() {
      return [PLAYERS_CHANNEL]
    }
  })

  server.type(updatePlayerAction, {
    async access() {
      return true
    },
    async process(ctx, action, meta) {
      const player = await findPlayer(action.payload.id)
      if (!player || isFirstOlder(meta, player.updatedAt.toString())) {
        return
      }

      await updatePlayer(action.payload)
    },
    resend() {
      return PLAYERS_CHANNEL
    }
  })

  server.type(deletePlayerAction, {
    async access() {
      return true
    },
    async process(ctx, action) {
      await deletePlayer(action.payload.id)
      await server.process(
        playerDeletedAction({
          id: action.payload.id,
          senderClientId: ctx.clientId
        })
      )
    },
    resend() {
      return PLAYERS_CHANNEL
    }
  })

  server.type(playerDeletedAction, {
    async access() {
      return false
    },
    resend() {
      return [PLAYERS_CHANNEL]
    }
  })
}
