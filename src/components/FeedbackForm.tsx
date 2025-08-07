'use client';
import React, { useState } from 'react';
import { useToast } from './GlobalToast';

const FeedbackForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showToast('Please select a rating before submitting.', 'warning');
      return;
    }
    if (!message.trim()) {
      showToast('Please enter your feedback.', 'warning');
      return;
    }
    
    // Simulate feedback submission
    showToast('Thank you for your feedback! It helps us improve.', 'success');
    setIsOpen(false);
    setRating(0);
    setMessage('');
    setEmail('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-6 z-50 px-4 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 font-semibold"
        title="Give Feedback"
      >
        ⭐ Feedback
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Your Feedback Matters! ⭐</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    How was your experience?
                  </label>
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {rating === 0 && 'Click to rate'}
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tell us more:
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What did you like? What could be improved?"
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email (optional):
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
                  >
                    Submit Feedback
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <strong>💡 Your feedback helps us:</strong>
                <ul className="mt-1 ml-4 list-disc">
                  <li>Improve existing features</li>
                  <li>Add new tools you need</li>
                  <li>Fix bugs and issues</li>
                  <li>Make the app more user-friendly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackForm;
