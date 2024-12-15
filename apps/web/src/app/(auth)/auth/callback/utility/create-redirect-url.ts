export const createRedirectUrl = ({
  origin,
  path,
}: {
  origin: string
  path: string
}): string => {
  return new URL(path, origin).toString()
}
