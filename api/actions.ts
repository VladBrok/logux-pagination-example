import { actionCreatorFactory } from 'typescript-fsa'

export const createAction = actionCreatorFactory()

export const PLAYERS_CHANNEL = 'players'

export const loadPlayersPageAction = createAction<{
  page: number
}>('players/loadPage')
