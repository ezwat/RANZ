"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Info, Eye, Loader2 } from "lucide-react"

interface IPData {
  ip: string
  country: string
  region: string
  city: string
  timestamp: string
  browser?: string
  os?: string
  device?: string
}

export default function IPGrabber() {
  const [ipData, setIpData] = useState<IPData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const captureIP = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100))

        const response = await fetch("/api/capture-ip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        setIpData(data)
      } catch (error) {
        console.error("Error capturing IP:", error)
        setError(error instanceof Error ? error.message : "Failed to capture IP")
      } finally {
        setLoading(false)
      }
    }

    captureIP()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        captureIP()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing connection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-300">
          <CardHeader>
            <CardTitle className="text-red-600">Error Capturing IP</CardTitle>
            <CardDescription>There was a problem capturing your connection information</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Eye className="h-8 w-8 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-900">IP Captured</h1>
          </div>
          <p className="text-gray-600">Your connection information has been logged</p>
        </div>

        <Alert className="mb-6 border-red-200 bg-red-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Notice:</strong> Your IP address and location data have been automatically captured and logged for
            security monitoring purposes. This information has been sent to our tracking system.
          </AlertDescription>
        </Alert>

        {ipData && (
          <Card className="mb-6 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Captured Information
              </CardTitle>
              <CardDescription>The following data has been logged and transmitted:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">IP Address</label>
                  <p className="font-mono text-sm bg-red-100 p-2 rounded border">{ipData.ip}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="font-mono text-sm bg-red-100 p-2 rounded border">{ipData.country}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Region</label>
                  <p className="font-mono text-sm bg-red-100 p-2 rounded border">{ipData.region}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="font-mono text-sm bg-red-100 p-2 rounded border">{ipData.city || "Unknown"}</p>
                </div>
                {ipData.browser && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Browser</label>
                    <p className="font-mono text-sm bg-red-100 p-2 rounded border">{ipData.browser}</p>
                  </div>
                )}
                {ipData.os && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Operating System</label>
                    <p className="font-mono text-sm bg-red-100 p-2 rounded border">{ipData.os}</p>
                  </div>
                )}
                {ipData.device && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Device Type</label>
                    <p className="font-mono text-sm bg-red-100 p-2 rounded border">{ipData.device}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Captured At</label>
                  <p className="font-mono text-sm bg-red-100 p-2 rounded border">
                    {new Date(ipData.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Status:</strong> ✅ Data successfully transmitted to monitoring system
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              Information Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600 space-y-2">
            <p>
              <strong>Automatic Collection:</strong> This system automatically captures visitor IP addresses for
              security and analytics purposes.
            </p>
            <p>
              <strong>Data Usage:</strong> Collected information is used for monitoring, security analysis, and traffic
              analytics.
            </p>
            <p>
              <strong>Transmission:</strong> Your data has been securely transmitted to our monitoring infrastructure.
            </p>
            <p>
              <strong>Legal Basis:</strong> Data collection is performed under legitimate interest for security
              monitoring.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
