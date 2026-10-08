'use client'

import React, { Fragment, useMemo } from 'react'
import { AssetBlock } from './asset-block'
import { EmptyBlock } from './empty-block'
import { InsertDivider } from './insert-divider'
import type { DraftAsset, ModalKind } from './types'

interface UploadArtCanvasProps {
  assets:       DraftAsset[]
  onInsert:     (index: number, modal: ModalKind) => void
  onMove:       (from: number, to: number) => void
  onEditAsset?: (index: number) => void
  onDeleteAsset: (index: number) => void
}

function buildAssetKeys(assets: DraftAsset[]): string[] {
  const seen = new Map<string, number>()
  return assets.map((asset) => {
    const count = seen.get(asset.original_url) ?? 0
    seen.set(asset.original_url, count + 1)
    return `${asset.original_url}#${count}`
  })
}

export function UploadArtCanvas({ assets, onInsert, onMove, onEditAsset, onDeleteAsset }: UploadArtCanvasProps) {
  const keys = useMemo(() => buildAssetKeys(assets), [assets])

  return (
    <div className="flex w-full flex-col gap-6">
      {assets.map((asset, index) => (
        <Fragment key={keys[index]}>
          <AssetBlock
            asset={asset}
            index={index}
            isFirst={index === 0}
            isLast={index === assets.length - 1}
            onMove={onMove}
            onEditAsset={onEditAsset}
            onDeleteAsset={onDeleteAsset}
          />
          <InsertDivider
            label={`Add media after item ${index + 1}`}
            onSelect={(modal) => onInsert(index + 1, modal)}
          />
        </Fragment>
      ))}

      <EmptyBlock onSelect={(modal) => onInsert(assets.length, modal)} />
      <InsertDivider
        label="Add media at the end"
        onSelect={(modal) => onInsert(assets.length, modal)}
      />
    </div>
  )
}
