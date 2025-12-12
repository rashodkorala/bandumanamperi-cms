"use client"

import * as React from "react"
import { useState } from "react"
import {
  IconUser,
  IconShield,
  IconBell,
  IconDatabase,
  IconPalette,
  IconKey,
  IconCloudDownload,
  IconWorld,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export function Settings() {
  const [isLoading, setIsLoading] = useState(false)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Rashod korala",
    siteDescription: "Professional Photography & Content Management",
    siteUrl: "https://rashodkorala.com",
    adminEmail: "admin@rashodkorala.com",
    timezone: "UTC",
    language: "en",
  })

  // User Profile
  const [profileSettings, setProfileSettings] = useState({
    displayName: "",
    email: "",
    bio: "",
    website: "",
    location: "",
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "30",
    requireStrongPassword: true,
    apiKey: "",
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    projectUpdates: true,
    photoUploads: true,
    analyticsReports: false,
    weeklyDigest: true,
  })

  // Storage Settings
  const [storageSettings, setStorageSettings] = useState({
    maxFileSize: "10",
    allowedFileTypes: "jpg,jpeg,png,gif,webp,pdf,mp4",
    storageProvider: "local",
    autoOptimizeImages: true,
  })

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system",
    accentColor: "blue",
    compactMode: false,
  })

  const handleSave = async (section: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success(`${section} settings saved successfully`)
    } catch (error) {
      toast.error(`Failed to save ${section} settings`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your CMS configuration and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <IconWorld className="size-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <IconUser className="size-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <IconShield className="size-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <IconBell className="size-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <IconDatabase className="size-4" />
            <span className="hidden sm:inline">Storage</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <IconPalette className="size-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <IconKey className="size-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <IconCloudDownload className="size-4" />
            <span className="hidden sm:inline">Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your site's basic information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={generalSettings.siteName}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                  }
                  placeholder="Your site name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      siteDescription: e.target.value,
                    })
                  }
                  placeholder="A brief description of your site"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={generalSettings.siteUrl}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })
                  }
                  placeholder="https://yoursite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={generalSettings.adminEmail}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, adminEmail: e.target.value })
                  }
                  placeholder="admin@yoursite.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) =>
                      setGeneralSettings({ ...generalSettings, timezone: value })
                    }
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) =>
                      setGeneralSettings({ ...generalSettings, language: value })
                    }
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSave("General")}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profileSettings.displayName}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, displayName: e.target.value })
                  }
                  placeholder="Your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, email: e.target.value })
                  }
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileSettings.bio}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileSettings.website}
                    onChange={(e) =>
                      setProfileSettings({ ...profileSettings, website: e.target.value })
                    }
                    placeholder="https://yoursite.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileSettings.location}
                    onChange={(e) =>
                      setProfileSettings({ ...profileSettings, location: e.target.value })
                    }
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSave("Profile")}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Checkbox
                    id="twoFactor"
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        twoFactorEnabled: checked === true,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Select
                    value={securitySettings.sessionTimeout}
                    onValueChange={(value) =>
                      setSecuritySettings({ ...securitySettings, sessionTimeout: value })
                    }
                  >
                    <SelectTrigger id="sessionTimeout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="strongPassword">Require Strong Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce password complexity requirements
                    </p>
                  </div>
                  <Checkbox
                    id="strongPassword"
                    checked={securitySettings.requireStrongPassword}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        requireStrongPassword: checked === true,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKey"
                      type="password"
                      value={securitySettings.apiKey}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, apiKey: e.target.value })
                      }
                      placeholder="Generate or view API key"
                      readOnly
                    />
                    <Button variant="outline" onClick={() => toast.info("API key generation coming soon")}>
                      Generate
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use this key to authenticate API requests
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSave("Security")}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Checkbox
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked === true,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="projectUpdates">Project Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when projects are updated
                    </p>
                  </div>
                  <Checkbox
                    id="projectUpdates"
                    checked={notificationSettings.projectUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        projectUpdates: checked === true,
                      })
                    }
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="photoUploads">Photo Uploads</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new photos are uploaded
                    </p>
                  </div>
                  <Checkbox
                    id="photoUploads"
                    checked={notificationSettings.photoUploads}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        photoUploads: checked === true,
                      })
                    }
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analyticsReports">Analytics Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly analytics reports
                    </p>
                  </div>
                  <Checkbox
                    id="analyticsReports"
                    checked={notificationSettings.analyticsReports}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        analyticsReports: checked === true,
                      })
                    }
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of activity
                    </p>
                  </div>
                  <Checkbox
                    id="weeklyDigest"
                    checked={notificationSettings.weeklyDigest}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        weeklyDigest: checked === true,
                      })
                    }
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSave("Notifications")}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Settings */}
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
              <CardDescription>
                Configure file upload and storage preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Select
                    value={storageSettings.maxFileSize}
                    onValueChange={(value) =>
                      setStorageSettings({ ...storageSettings, maxFileSize: value })
                    }
                  >
                    <SelectTrigger id="maxFileSize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 MB</SelectItem>
                      <SelectItem value="10">10 MB</SelectItem>
                      <SelectItem value="25">25 MB</SelectItem>
                      <SelectItem value="50">50 MB</SelectItem>
                      <SelectItem value="100">100 MB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={storageSettings.allowedFileTypes}
                    onChange={(e) =>
                      setStorageSettings({
                        ...storageSettings,
                        allowedFileTypes: e.target.value,
                      })
                    }
                    placeholder="jpg,jpeg,png,gif,webp"
                  />
                  <p className="text-sm text-muted-foreground">
                    Comma-separated list of allowed file extensions
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storageProvider">Storage Provider</Label>
                  <Select
                    value={storageSettings.storageProvider}
                    onValueChange={(value) =>
                      setStorageSettings({ ...storageSettings, storageProvider: value })
                    }
                  >
                    <SelectTrigger id="storageProvider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="cloudinary">Cloudinary</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoOptimize">Auto-Optimize Images</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically optimize uploaded images
                    </p>
                  </div>
                  <Checkbox
                    id="autoOptimize"
                    checked={storageSettings.autoOptimizeImages}
                    onCheckedChange={(checked) =>
                      setStorageSettings({
                        ...storageSettings,
                        autoOptimizeImages: checked === true,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSave("Storage")}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your CMS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={appearanceSettings.theme}
                    onValueChange={(value) =>
                      setAppearanceSettings({ ...appearanceSettings, theme: value })
                    }
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <Select
                    value={appearanceSettings.accentColor}
                    onValueChange={(value) =>
                      setAppearanceSettings({ ...appearanceSettings, accentColor: value })
                    }
                  >
                    <SelectTrigger id="accentColor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compactMode">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a more compact layout
                    </p>
                  </div>
                  <Checkbox
                    id="compactMode"
                    checked={appearanceSettings.compactMode}
                    onCheckedChange={(checked) =>
                      setAppearanceSettings({
                        ...appearanceSettings,
                        compactMode: checked === true,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSave("Appearance")}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Manage API keys and webhook configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKeyDisplay">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKeyDisplay"
                      type="password"
                      value={securitySettings.apiKey || "sk_live_••••••••••••••••"}
                      readOnly
                    />
                    <Button variant="outline" onClick={() => toast.info("API key generation coming soon")}>
                      Generate New
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Keep your API key secure and never share it publicly
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://yoursite.com/webhook"
                  />
                  <p className="text-sm text-muted-foreground">
                    URL to receive webhook notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    placeholder="Enter webhook secret"
                  />
                  <p className="text-sm text-muted-foreground">
                    Secret key for webhook authentication
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSave("API")}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Export</CardTitle>
              <CardDescription>
                Export your data or configure automatic backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a complete backup of your CMS data
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => toast.info("Export functionality coming soon")}
                    >
                      Export All Data
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toast.info("Export functionality coming soon")}
                    >
                      Export Projects
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toast.info("Export functionality coming soon")}
                    >
                      Export Photos
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">Automatic Backups</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schedule automatic backups of your data
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup your data on a schedule
                      </p>
                    </div>
                    <Checkbox id="autoBackup" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="backupFrequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                  <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Irreversible and destructive actions
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => toast.error("This action is not implemented")}
                  >
                    Delete All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

