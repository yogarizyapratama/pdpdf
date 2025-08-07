'use client';
import React, { useState, useEffect } from 'react';
import { useToast } from './GlobalToast';

interface UserPreferences {
  autoCompress: boolean;
  defaultQuality: 'low' | 'medium' | 'high';
  showTooltips: boolean;
  autoSave: boolean;
  language: 'en' | 'es' | 'fr' | 'de';
  animations: boolean;
}

const UserSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    autoCompress: false,
    defaultQuality: 'medium',
    showTooltips: true,
    autoSave: true,
    language: 'en',
    animations: true
  });
  const { showToast } = useToast();

  useEffect(() => {
    const savedPrefs = localStorage.getItem('user-preferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    localStorage.setItem('user-preferences', JSON.stringify(newPrefs));
    showToast('Preferences updated!', 'success');
  };

  const resetPreferences = () => {
    const defaultPrefs: UserPreferences = {
      autoCompress: false,
      defaultQuality: 'medium',
      showTooltips: true,
      autoSave: true,
      language: 'en',
      animations: true
    };
    setPreferences(defaultPrefs);
    localStorage.setItem('user-preferences', JSON.stringify(defaultPrefs));
    showToast('Preferences reset to defaults!', 'info');
  };

  const exportPreferences = () => {
    const data = JSON.stringify(preferences, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pdf-tools-preferences.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Preferences exported!', 'success');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-50 px-3 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 text-sm font-medium"
        title="User Settings"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">⚙️ Settings</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Auto Compress */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Auto-compress large files
                  </label>
                  <button
                    onClick={() => updatePreference('autoCompress', !preferences.autoCompress)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.autoCompress ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        preferences.autoCompress ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Default Quality */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Default compression quality
                  </label>
                  <select
                    value={preferences.defaultQuality}
                    onChange={(e) => updatePreference('defaultQuality', e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="low">Low (Smaller file)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Better quality)</option>
                  </select>
                </div>

                {/* Show Tooltips */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Show helpful tooltips
                  </label>
                  <button
                    onClick={() => updatePreference('showTooltips', !preferences.showTooltips)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.showTooltips ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        preferences.showTooltips ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto Save */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Auto-save work in progress
                  </label>
                  <button
                    onClick={() => updatePreference('autoSave', !preferences.autoSave)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.autoSave ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        preferences.autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Animations */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Enable animations
                  </label>
                  <button
                    onClick={() => updatePreference('animations', !preferences.animations)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.animations ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        preferences.animations ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) => updatePreference('language', e.target.value as 'en' | 'es' | 'fr' | 'de')}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={resetPreferences}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={exportPreferences}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                >
                  Export
                </button>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                <strong>💡 Tip:</strong> Your preferences are saved locally and persist across sessions.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSettings;
