import { useClient } from '@logux/client/react'
import { useEffect } from 'react'

export function useSubscription(
  channel: string,
  setIsLoading: (value: boolean) => void
): void {
  const client = useClient()

  useEffect(() => {
    setIsLoading(true)
    client
      .sync({
        channel,
        type: 'logux/subscribe'
      })
      .finally(() => {
        setIsLoading(false)
      })

    return () => {
      client.sync({
        channel,
        type: 'logux/unsubscribe'
      })
    }
  }, [])
}
