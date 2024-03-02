import { badge, badgeEn, confirm, CrossTabClient, log } from '@logux/client'
import { badgeStyles } from '@logux/client/badge/styles'
import { useEffect, useState } from 'react'

import { subprotocol } from '../../../api/index.js'

const loguxServer = `${
  window.location.protocol.endsWith('s') ? 'wss' : 'ws'
}://${window.location.host}/logux`

const fakeClient = new CrossTabClient({
  allowDangerousProtocol: true,
  server: loguxServer,
  subprotocol,
  userId: ''
})

export function useLoguxClient(): CrossTabClient {
  const [clientState, setClient] = useState(fakeClient)

  useEffect(() => {
    const client = new CrossTabClient({
      allowDangerousProtocol: true,
      server: loguxServer,
      subprotocol,
      userId: ''
    })

    badge(client, { messages: badgeEn, styles: badgeStyles })
    log(client)
    confirm(client)

    setClient(client)

    return () => {
      client.destroy()
    }
  })

  return clientState
}
