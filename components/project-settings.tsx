'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ProjectSettings } from '@/components/create-project'

interface ProjectSettingsProps {
  settings: ProjectSettings
  onSettingsChange: (settings: ProjectSettings) => void
}

export default function ProjectSettingsComponent({
  settings,
  onSettingsChange,
}: ProjectSettingsProps) {
  const updateSetting = <K extends keyof ProjectSettings>(
    key: K,
    value: ProjectSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Background Style
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { value: 'auto', label: 'AI Auto-Select', desc: 'Let AI choose the best background' },
            { value: 'modern', label: 'Modern', desc: 'Clean, minimalist design' },
            { value: 'traditional', label: 'Traditional', desc: 'Arabic/Islamic patterns' },
            { value: 'lifestyle', label: 'Lifestyle', desc: 'Real-life scene' },
            { value: 'plain', label: 'Plain Color', desc: 'Solid background' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateSetting('backgroundStyle', option.value as any)}
              className={`
                p-4 border-2 rounded-lg text-left transition-all
                ${
                  settings.backgroundStyle === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
            </button>
          ))}
        </div>

        {settings.backgroundStyle !== 'auto' && (
          <div className="mt-3">
            <Label htmlFor="customPrompt">Custom Background Prompt (Optional)</Label>
            <Input
              id="customPrompt"
              placeholder="E.g., luxury marble surface with gold accents"
              value={settings.customBackgroundPrompt || ''}
              onChange={(e) => updateSetting('customBackgroundPrompt', e.target.value)}
              className="mt-1"
            />
          </div>
        )}
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          Video Duration
        </Label>
        <div className="grid grid-cols-4 gap-3">
          {[5, 10, 15, 30].map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => updateSetting('videoDuration', duration as any)}
              className={`
                p-3 border-2 rounded-lg font-medium transition-all
                ${
                  settings.videoDuration === duration
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {duration}s
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          Background Music
        </Label>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => updateSetting('includeMusic', true)}
            className={`
              flex-1 p-3 border-2 rounded-lg font-medium transition-all
              ${
                settings.includeMusic
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            Include Music
          </button>
          <button
            type="button"
            onClick={() => updateSetting('includeMusic', false)}
            className={`
              flex-1 p-3 border-2 rounded-lg font-medium transition-all
              ${
                !settings.includeMusic
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            No Music
          </button>
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          Marketing Copy Languages
        </Label>
        <div className="space-y-2">
          {[
            { value: 'english', label: 'English' },
            { value: 'arabic', label: 'Arabic (العربية)' },
          ].map((lang) => (
            <label
              key={lang.value}
              className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={settings.languages.includes(lang.value as any)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateSetting('languages', [...settings.languages, lang.value as any])
                  } else {
                    updateSetting(
                      'languages',
                      settings.languages.filter((l) => l !== lang.value)
                    )
                  }
                }}
                className="w-4 h-4"
              />
              <span className="font-medium">{lang.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
