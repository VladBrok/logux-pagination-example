import { actionCreatorFactory } from 'typescript-fsa'

import type { Player, PlayersPageResponse } from '.'

export const createAction = actionCreatorFactory()

export const PLAYERS_CHANNEL = 'players'

export const loadPlayersPageAction = createAction<{
  page: number
}>('players/loadPage')

export const playersPageLoadedAction =
  createAction<PlayersPageResponse>('players/pageLoaded')

export const createPlayerAction = createAction<Player>('players/create')
export const playerCreatedAction = createAction<{
  player: Player
  senderClientId: string
}>('players/created')

export const updatePlayerAction = createAction<Player>('players/update')

export const deletePlayerAction = createAction<{ id: string }>('players/delete')
export const playerDeletedAction = createAction<{
  id: string
  senderClientId: string
}>('players/deleted')
