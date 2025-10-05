# 🎧 Audio Summary Setup Guide

## Current Issue
The audio summary feature is showing an error because the ElevenLabs API key is not configured.

## Quick Fix

### 1. Get a Free ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up for a free account (no credit card required)
3. Navigate to [Settings → API Keys](https://elevenlabs.io/app/settings/api-keys)
4. Click "Create API Key"
5. Copy your API key

### 2. Update Your Environment Variables

Open `/Users/piyushsingh/HackUTA-2025/.env.local` and replace:

```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

With your actual API key:

```bash
ELEVENLABS_API_KEY=sk_your_actual_api_key_here
```

### 3. Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Test Again

1. Upload a syllabus PDF
2. Click "😂 Funny Summary"
3. Wait for the humorous summary to generate
4. The audio should now generate automatically
5. Click "Play" to listen

## Free Tier Limits

ElevenLabs free tier includes:
- ✅ 10,000 characters per month
- ✅ High-quality voices
- ✅ No credit card required

This is plenty for testing and personal use!

## Optional: Choose a Different Voice

You can also customize the voice by adding:

```bash
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Default: Rachel (American Female)
```

Popular voice IDs:
- `21m00Tcm4TlvDq8ikWAM` - Rachel (American Female)
- `pNInz6obpgDQGcFmaJgB` - Adam (American Male)
- `EXAVITQu4vr4xnSDxMaL` - Bella (British Female)
- `VR6AewLTigWG4xSOukaG` - Arnold (British Male)

Find more voices at [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)

## Troubleshooting

### Audio still not working after adding API key?

1. **Check API key format**: Should start with `sk_`
2. **Restart dev server**: Stop and start `npm run dev`
3. **Check browser console**: Press F12 → Console tab for errors
4. **Verify account**: Make sure your ElevenLabs account is active

### "Failed to generate audio" error?

- Check that you haven't exceeded your monthly character limit
- Verify the API key is valid and not expired
- Check your internet connection

---

**Note**: The audio feature is optional. You can still use all other features (PDF processing, calendar export, etc.) without an ElevenLabs API key!
