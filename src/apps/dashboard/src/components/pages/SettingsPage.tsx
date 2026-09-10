import React, { useEffect, useState } from 'react'
import { ImagePlus, Save } from 'lucide-react'
import { useRole } from '@/lib/RoleContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSiteSettings, updateSiteSettings, type SiteSettings } from '@/lib/db/settings'

export function SettingsPage() {
  const { can } = useRole()
  const canWrite = can('write')

  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch(() => setError('Failed to load settings.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('key', 'site')
      if (selectedFile) {
        formData.append('heroImage', selectedFile)
      } else if (removeImage) {
        formData.append('heroImage', '')
      }
      const updated = await updateSiteSettings(settings.id, formData)
      setSettings(updated)
      setSelectedFile(null)
      setRemoveImage(false)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure public site content from the dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero image</CardTitle>
          <p className="text-sm text-muted-foreground">
            The image behind the headline on the homepage. When left empty the site
            falls back to the built-in hero image.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {settings?.heroImageUrl ? (
                    <img
                      src={settings.heroImageUrl}
                      alt="Current hero"
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="size-8 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  {canWrite ? (
                    <>
                      <Label htmlFor="heroImage">Replace hero image</Label>
                      <Input
                        id="heroImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setSelectedFile(e.target.files?.[0] ?? null)
                          if (e.target.files?.[0]) setRemoveImage(false)
                        }}
                      />
                      {settings?.heroImage && !selectedFile && (
                        <div className="flex items-center gap-2">
                          <input
                            id="removeHeroImage"
                            type="checkbox"
                            checked={removeImage}
                            onChange={(e) => setRemoveImage(e.target.checked)}
                            className="size-4 rounded border-input"
                          />
                          <Label htmlFor="removeHeroImage" className="text-xs text-muted-foreground font-normal cursor-pointer">
                            Remove current image (use built-in fallback)
                          </Label>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {settings?.heroImage ? 'A custom hero image is set.' : 'Using the built-in hero image.'}
                    </p>
                  )}
                </div>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              {canWrite && (
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="gap-1.5">
                    <Save className="size-4" /> {saving ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}