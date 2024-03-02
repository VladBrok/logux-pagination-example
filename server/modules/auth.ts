import type { BaseServer } from '@logux/server/base-server'

export default function applyAuth(server: BaseServer): void {
  server.auth(() => {
    return true
  })
}
