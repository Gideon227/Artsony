import Link from 'next/link'

const LINKS: [string, string][] = [
  ['Privacy', '/privacy'],
  ['Terms & Conditions', '/terms'],
  ['FAQ', '/faq'],
  ['About', '/about'],
]

export function CheckoutFooterLinks() {
  return (
    <div className="flex items-center justify-center gap-6 border-t border-gray-50 py-8 font-poppins text-[13px] text-gray-400">
      {LINKS.map(([label, href]) => (
        <Link key={href} href={href} className="hover:text-gray-600 transition-colors">
          {label}
        </Link>
      ))}
      <button type="button" className="hover:text-gray-600 transition-colors">
        Language
      </button>
    </div>
  )
}
