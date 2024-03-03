import {
  PER_PAGE,
  type Player,
  type PlayersPageResponse
} from '../api/index.js'

let players: Player[] = [
  { id: '1', name: 'Jack', rank: 20 },
  { id: '2', name: 'John', rank: 30 },
  { id: '3', name: 'Emily', rank: 45 },
  { id: '4', name: 'Sarah', rank: 50 },
  { id: '5', name: 'Michael', rank: 25 },
  { id: '6', name: 'Emma', rank: 40 },
  { id: '7', name: 'James', rank: 45 }
]

export function findPlayer(id: string): Promise<Player | undefined> {
  return Promise.resolve(players.find(pl => pl.id === id))
}

export function deletePlayer(id: string): Promise<void> {
  players = players.filter(it => it.id !== id)
  return Promise.resolve()
}

export function createPlayer(player: Player): Promise<Player> {
  players.push(player)
  return Promise.resolve(player)
}

export function updatePlayer(player: Partial<Player>): Promise<void> {
  players = players.map(pl => {
    if (pl.id !== player.id) return pl
    return { ...pl, ...player }
  })
  return Promise.resolve()
}

export function getPlayersPage(page: number): Promise<PlayersPageResponse> {
  return Promise.resolve({
    page,
    players: players.slice(
      (page - 1) * PER_PAGE,
      (page - 1) * PER_PAGE + PER_PAGE
    ),
    totalPages: Math.ceil(players.length / PER_PAGE)
  })
}
