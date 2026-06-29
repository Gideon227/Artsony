export function SellerDivider({ name }: { name: string }) {
  return (
    <div className="flex items-center">
      <div className="rounded-full border border-gray-100 bg-white px-5 py-2 font-poppins text-[13px] text-gray-500">
        By: <span className="font-poppins font-medium text-body-s text-heading">{name}</span>
      </div>
    </div>
  )
}