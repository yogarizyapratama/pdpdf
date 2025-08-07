import React from 'react';

const PrivacyBadge: React.FC = () => (
  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full shadow text-green-800 dark:text-green-300 text-sm font-semibold w-fit mx-auto mt-4">
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.657 1.343 3 3 3s3-1.343 3-3zm0 0c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.657-1.343 3-3 3s-3-1.343-3-3zm0 0v2m0 4v2m0-6v2" /></svg>
    Privacy & Security Verified
  </div>
);

export default PrivacyBadge;
