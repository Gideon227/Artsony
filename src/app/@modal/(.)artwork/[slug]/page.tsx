import ArtworkModalRoute from '@/features/artwork/components/artwork-modal-route'

export default function InterceptedArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ArtworkModalRoute params={params} />
}
