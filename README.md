# Vercel IP Grabber

A high-accuracy IP grabber built with Next.js that automatically captures visitor information and sends it to Discord.

## Quick Deploy to Vercel

1. **Download this project** using the "Download Code" button
2. **Extract the ZIP file** to a folder on your computer
3. **Create a new repository** on GitHub and upload all the files
4. **Go to [Vercel](https://vercel.com)** and import your GitHub repository
5. **Add your Discord webhook URL** as an environment variable named `DISCORD_WEBHOOK_URL`
6. **Deploy!** Your IP grabber will be live instantly

## Features

- 🎯 **Instant IP Capture**: Automatically grabs IPs when visitors arrive
- 🌍 **Accurate Geolocation**: Uses Vercel's built-in geolocation for precise location data
- 📱 **Device Detection**: Captures browser, OS, and device information
- 🔔 **Discord Integration**: Sends rich formatted messages to your Discord webhook
- ⚡ **Vercel Optimized**: Built specifically for Vercel's platform
- 🔒 **Legal Compliance**: Includes proper privacy notices

## Environment Variables

You need to set this environment variable in Vercel:

- `DISCORD_WEBHOOK_URL`: Your Discord webhook URL

## What Gets Captured

- IP Address (with multiple detection methods)
- Country, Region, City
- Coordinates (with Google Maps link)
- Browser and Operating System
- Device Type (Desktop/Mobile/Tablet)
- Language Preferences
- Timezone
- Timestamp
- User Agent
- Do Not Track preference

## Legal Notice

This tool includes proper privacy notices and legal compliance features. Make sure to comply with local privacy laws when using this tool.

## Support

If you need help, create an issue in the GitHub repository.
