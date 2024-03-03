import { delay } from 'nanodelay'

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

async function pause(): Promise<void> {
  await delay(2000)
}

export async function findPlayer(id: string): Promise<Player | undefined> {
  await pause()
  return players.find(pl => pl.id === id)
}

export async function deletePlayer(id: string): Promise<void> {
  await pause()
  players = players.filter(it => it.id !== id)
}

export async function createPlayer(player: Player): Promise<Player> {
  await pause()
  players.push(player)
  return player
}

export async function updatePlayer(player: Partial<Player>): Promise<void> {
  await pause()
  players = players.map(pl => {
    if (pl.id !== player.id) return pl
    return { ...pl, ...player }
  })
}

export async function getPlayersPage(
  page: number
): Promise<PlayersPageResponse> {
  await pause()
  return {
    page,
    players: players.slice(
      (page - 1) * PER_PAGE,
      (page - 1) * PER_PAGE + PER_PAGE
    ),
    totalPages: Math.ceil(players.length / PER_PAGE)
  }
}
