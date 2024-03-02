export const subprotocol = '1.0.0'

export const PER_PAGE = 5

export type Player = {
  id: string
  name: string
  rank: number
}

export type PlayersPageResponse = {
  page: number
  players: Player[]
  totalPages: number
}
