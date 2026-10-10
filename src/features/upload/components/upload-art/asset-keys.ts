import type { DraftAsset } from './types'

export function buildAssetKeys(assets: DraftAsset[]): string[] {
  const seen = new Map<string, number>()
  return assets.map((asset) => {
    const count = seen.get(asset.original_url) ?? 0
    seen.set(asset.original_url, count + 1)
    return `${asset.original_url}#${count}`
  })
}
