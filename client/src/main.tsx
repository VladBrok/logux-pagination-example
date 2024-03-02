import { badge, badgeEn, confirm, CrossTabClient, log } from '@logux/client'
import { badgeStyles } from '@logux/client/badge/styles'
import { ClientContext } from '@logux/client/react'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { subprotocol } from '../../api/index.js'
import App from './App.tsx'

import './index.css'

const loguxServer = `${
  window.location.protocol.endsWith('s') ? 'wss' : 'ws'
}://localhost:31337`

const client = new CrossTabClient({
  allowDangerousProtocol: true,
  server: loguxServer,
  subprotocol,
  userId: ''
})

badge(client, { messages: badgeEn, styles: badgeStyles })
log(client)
confirm(client)

client.start()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ClientContext.Provider value={client}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ClientContext.Provider>
)
