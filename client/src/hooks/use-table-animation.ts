import { useAutoAnimate } from '@formkit/auto-animate/react'

export function useTableAnimation(): [
  React.RefCallback<Element>,
  (enabled: boolean) => void
] {
  return useAutoAnimate((el, action) => {
    let keyframes: Keyframe[] = []

    if (action === 'add') {
      keyframes = [
        { opacity: 0, transform: 'translateX(20%)' },
        { opacity: 1, transform: 'translateX(0)' }
      ]
    }

    if (action === 'remove') {
      keyframes = [
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: 'translateX(20%)' }
      ]
    }

    return new KeyframeEffect(el, keyframes, {
      duration: 400,
      easing: 'ease-in-out'
    })
  })
}
