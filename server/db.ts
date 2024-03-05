import { delay } from 'nanodelay'

import {
  PER_PAGE,
  type Player,
  type PlayersPageResponse
} from '../api/index.js'

let players: Player[] = [
  {
    id: 'd6cc4e27-b849-46b2-819c-2f53e4b9c794',
    name: 'Jack',
    rank: 20,
    updatedAt: 1564508138460
  },
  {
    id: 'f3dc7a8f-17e2-4e7b-9b82-7a9cfd8cb367',
    name: 'John',
    rank: 30,
    updatedAt: 1564508138460
  },
  {
    id: 'aab8aef5-1f4c-4b71-b50f-4f4257d9ef81',
    name: 'Emily',
    rank: 45,
    updatedAt: 1564508138460
  },
  {
    id: '5ed4bcb9-7be3-4b8c-8d3e-e1030e0be109',
    name: 'Sarah',
    rank: 50,
    updatedAt: 1564508138460
  },
  {
    id: '1a9aebcf-05fc-4c05-950f-cb4797dab6db',
    name: 'Michael',
    rank: 25,
    updatedAt: 1564508138460
  },
  {
    id: '837d7a51-d25e-4e14-b36d-39e03d6f3d05',
    name: 'Emma',
    rank: 40,
    updatedAt: 1564508138460
  },
  {
    id: '6d7ff908-df7d-4fc0-897f-6b6f76c472d1',
    name: 'James',
    rank: 45,
    updatedAt: 1564508138460
  }
]

async function pause(): Promise<void> {
  await delay(500)
}

export async function findPlayer(id: string): Promise<Player | undefined> {
  await pause()
  return players.find(it => it.id === id)
}

export async function deletePlayer(id: string): Promise<void> {
  await pause()
  players = players.filter(it => it.id !== id)
}

export async function createPlayer(player: Player): Promise<Player> {
  await pause()
  players.push({ ...player, updatedAt: Date.now() })
  return player
}

export async function updatePlayer(player: Partial<Player>): Promise<void> {
  await pause()
  players = players.map(x => {
    if (x.id !== player.id) return x
    return { ...x, ...player, updatedAt: Date.now() }
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
