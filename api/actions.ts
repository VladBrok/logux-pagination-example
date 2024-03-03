import { actionCreatorFactory } from 'typescript-fsa'

import type { Player } from '.'

export const createAction = actionCreatorFactory()

export const PLAYERS_CHANNEL = 'players'

export const loadPlayersPageAction = createAction<{
  page: number
}>('players/loadPage')

export const createPlayerAction = createAction<Player>('players/create')
