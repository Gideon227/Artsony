export async function openDocumentAfter(resolveUrl: () => Promise<string>): Promise<boolean> {
  const target = window.open('', '_blank')

  try {
    const url = await resolveUrl()
    if (target) {
      target.opener = null
      target.location.href = url
    } else {
      window.location.assign(url)
    }
    return true
  } catch {
    target?.close()
    return false
  }
}
