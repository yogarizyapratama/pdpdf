import Link from 'next/link'
import { FileText, Github, Twitter, Mail, Shield } from 'lucide-react'
import PrivacyBadge from '@/components/PrivacyBadge'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    tools: [
      { href: '/merge-pdf', label: 'Merge PDF' },
      { href: '/split-pdf', label: 'Split PDF' },
      { href: '/compress-pdf', label: 'Compress PDF' },
      { href: '/convert-pdf', label: 'Convert PDF' },
    ],
    // company: [
    //   { href: '/about', label: 'About' },
    //   { href: '/privacy', label: 'Privacy Policy' },
    //   { href: '/terms', label: 'Terms of Service' },
    //   { href: '/contact', label: 'Contact' },
    // ],
    social: [
      { href: '#', label: 'GitHub', icon: Github },
      { href: '#', label: 'Twitter', icon: Twitter },
      { href: '#', label: 'Email', icon: Mail },
    ],
  }

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                PDF All-in-One
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Professional PDF tools for all your document needs. Merge, split, compress, convert, and edit PDFs with ease.
            </p>
            <div className="flex space-x-4">
              {footerLinks.social.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* PDF Tools */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Popular Tools
            </h3>
            <ul className="space-y-2">
              {footerLinks.tools.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          {/* <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Ad Space Placeholder */}
          <div className="md:col-span-1">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                Advertisement Space
              </p>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">300x250 Ad</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © {currentYear} PDF All-in-One. All rights reserved.
              </p>
              {/* <div className="hidden md:block">
                <PrivacyBadge />
              </div> */}
            </div>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2 md:mt-0">
              Professional PDF processing tools for everyone.
            </p>
          </div>
          
          {/* Mobile Privacy Badge */}
          {/* <div className="md:hidden flex justify-center mt-4">
            <PrivacyBadge />
          </div> */}
        </div>
      </div>
    </footer>
  )
}
