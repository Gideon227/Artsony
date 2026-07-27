export function DetailSkeleton() {
  return (
    <div className="border-2 border-gray-50 rounded-xl bg-white p-4 flex flex-col gap-y-6 animate-pulse" aria-busy="true" aria-label="Loading order details">
      <div className="h-7 w-48 bg-gray-50 rounded" />
      <div className="flex justify-between">
        <div className="h-16 w-64 bg-gray-50 rounded" />
        <div className="h-16 w-72 bg-gray-50 rounded" />
      </div>
      <div className="h-24 w-full bg-gray-50 rounded" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-50 rounded-xl" />
        ))}
      </div>
      <div className="h-40 w-full bg-gray-50 rounded" />
    </div>
  )
}