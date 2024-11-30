import { MAX_ATTEMPTS } from './security'

export const getShakeAnimation = (
  remainingAttempts: number,
  prefersReduced: boolean,
) => {
  if (prefersReduced) {
    return {
      shake: {
        opacity: [1, 0.7, 1],
        transition: { duration: 0.5 },
      },
    }
  }

  // Intensity increases as attempts decrease
  const intensity = (MAX_ATTEMPTS - remainingAttempts + 1) * 4
  return {
    shake: {
      x: [
        0,
        -intensity,
        intensity,
        -intensity,
        intensity,
        -(intensity / 2),
        intensity / 2,
        -(intensity / 4),
        intensity / 4,
        0,
      ],
      transition: { duration: 0.5 },
    },
  }
}
