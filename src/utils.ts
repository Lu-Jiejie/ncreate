export function remove<T>(arr: T[], value: T) {
  const index = arr.indexOf(value)
  if (index !== -1)
    arr.splice(index, 1)

  return arr
}
