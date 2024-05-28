function safeParse<t = any>(value: any) {
  try {
    return JSON.parse(value) as t
  } catch (err) {
    return undefined
  }
}

export { safeParse }
