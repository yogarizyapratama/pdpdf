'use client';
import React, { useState } from 'react';
import { useToast } from './GlobalToast';

const HelpCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  const faqs = [
    {
      q: "How do I merge multiple PDF files?",
      a: "Go to Merge PDF, upload your files, drag to reorder them, then click 'Merge & Download'."
    },
    {
      q: "Is my data secure when using these tools?",
      a: "Yes! All processing happens in your browser. Files are never uploaded to our servers."
    },
    {
      q: "What file formats are supported for conversion?",
      a: "We support PDF, JPG, PNG, Word, Excel, PowerPoint, and HTML formats."
    },
    {
      q: "Can I use these tools on mobile devices?",
      a: "Absolutely! Our tools are optimized for both desktop and mobile use."
    },
    {
      q: "How do I sign a PDF?",
      a: "Upload your PDF, choose 'Draw Signature' or 'Text Signature', place it on the page, and click 'Sign & Download'."
    },
    {
      q: "How do I compress a PDF?",
      a: "Use the Compress PDF tool, upload your file, choose compression level, and download the optimized version."
    }
  ];

  const handleFeatureRequest = () => {
    showToast('Feature request submitted! We appreciate your feedback.', 'success');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        data-help-center
        className="fixed bottom-20 right-6 z-50 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 font-semibold"
        title="Help & Support"
      >
        ❓ Help
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Help Center & FAQ</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Frequently Asked Questions</h3>
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b pb-3 dark:border-gray-600">
                    <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-1">
                      {faq.q}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {faq.a}
                    </p>
                  </div>
                ))}

                <div className="flex gap-2 mt-6 pt-4">
                  <button
                    onClick={handleFeatureRequest}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                  >
                    🚀 Request Feature
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText('support@pdfallinone.com');
                      showToast('Support email copied to clipboard!', 'info');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
                  >
                    📧 Contact Support
                  </button>
                </div>

                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                  <strong>💡 Pro Tip:</strong> Use keyboard shortcuts for faster workflow:
                  <ul className="mt-1 ml-4 list-disc">
                    <li>Ctrl+Z: Undo last action</li>
                    <li>Ctrl+Y: Redo action</li>
                    <li>Ctrl+S: Save/Download</li>
                    <li>N: New signature (in signing mode)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpCenter;
