'use client'

import { useState } from 'react'
import { Settings, X, MessageCircle, Bug, HelpCircle, Keyboard } from 'lucide-react'
import BugReportButton from './BugReportButton'
import FeedbackForm from './FeedbackForm'
import OnboardingTour from './OnboardingTour'
import KeyboardShortcuts from './KeyboardShortcuts'
import QuickActions from './QuickActions'

export default function FloatingToolPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>(null)

  const tools = [
    {
      id: 'feedback',
      icon: MessageCircle,
      label: 'Feedback',
      component: FeedbackForm
    },
    {
      id: 'bug-report',
      icon: Bug,
      label: 'Report Bug',
      component: BugReportButton
    },
    {
      id: 'tour',
      icon: HelpCircle,
      label: 'Tour',
      component: OnboardingTour
    },
    {
      id: 'shortcuts',
      icon: Keyboard,
      label: 'Shortcuts',
      component: KeyboardShortcuts
    },
    {
      id: 'quick-actions',
      icon: Settings,
      label: 'Quick Actions',
      component: QuickActions
    }
  ]

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110
            ${isOpen 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          `}
          aria-label={isOpen ? 'Close tools panel' : 'Open tools panel'}
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Settings className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Floating Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-30 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-64">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Help & Tools
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Access help resources and tools
            </p>
          </div>

          <div className="space-y-2">
            {tools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <button
                  key={tool.id}
                  onClick={() => setActivePanel(activePanel === tool.id ? null : tool.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${activePanel === tool.id
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{tool.label}</span>
                </button>
              )
            })}
          </div>

          {/* Mini disclaimer */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Click outside to close panel
            </p>
          </div>
        </div>
      )}

      {/* Backdrop - close panel when clicked */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Active Panel Components (Hidden but still functional) */}
      <div className="hidden">
        <BugReportButton />
        <FeedbackForm />
        <OnboardingTour />
        <KeyboardShortcuts />
        <QuickActions />
      </div>
    </>
  )
}
