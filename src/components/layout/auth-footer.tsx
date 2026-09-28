import React from 'react'
import Link from 'next/link'

const AuthFooter = () => {
  return (
    <footer className="hidden font-poppins lg:flex mt-auto mx-auto pt-10 gap-6">
      {[
        ['Privacy', '/privacy'],
        ['Terms & Conditions', '/terms'],
        ['FAQ', '/faq'],
        ['About', '/about'],
      ].map(([label, href]) => (
        <Link
          key={label}
          href={href!}
          className="p-2 text-nowrap text-body-s font-medium tracking-wide text-body hover:text-primary-500 transition-colors"
        >
          {label}
        </Link>
      ))}
      <button
        type="button"
        className="p-2 cursor-pointer text-nowrap text-body-s font-medium tracking-wide text-body hover:text-action-hover transition-colors"
      >
        Language
      </button>
    </footer>
  )
}

export default AuthFooter