export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
}

export const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export const getShakeAnimation = (intensity: number) => ({
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
})

export const getReducedShakeAnimation = () => ({
  shake: {
    opacity: [1, 0.7, 1],
    transition: { duration: 0.5 },
  },
})
