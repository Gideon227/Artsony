import { PackageSearch } from 'lucide-react'

export function EmptyDetailState() {
  return (
    <div className="border-2 border-gray-50 rounded-xl bg-white h-full min-h-[400px] flex flex-col items-center justify-center gap-y-3 text-center">
      <PackageSearch size={40} className="text-gray-200" />
      <p className="font-poppins text-body-s text-body">Select an order to view its details</p>
    </div>
  )
}