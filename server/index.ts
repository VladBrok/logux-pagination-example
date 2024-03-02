import { Server } from '@logux/server'

import { subprotocol } from '../api/index.js'

const server = new Server(
  Server.loadOptions(process, {
    fileUrl: import.meta.url,
    subprotocol,
    supports: subprotocol
  })
)

server
  .autoloadModules(
    process.env.NODE_ENV === 'production'
      ? 'modules/*.js'
      : ['modules/*.ts', '!modules/*.test.ts']
  )
  .then(() => {
    server.listen()
  })
