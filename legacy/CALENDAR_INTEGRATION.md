# 📅 Calendar Integration Guide

## ✅ What Works NOW

### Export to .ics File (Apple Calendar, Google Calendar, Outlook)

After processing a syllabus, you can now:

1. **Click "Export to Calendar"** button in the modal
2. **Download .ics file** automatically
3. **Open the file** to add events to:
   - 🍎 **Apple Calendar** (Mac/iPhone/iPad)
   - 📧 **Google Calendar** (import .ics file)
   - 📧 **Outlook** (import .ics file)
   - 📧 **Any calendar app** that supports .ics format

### Features Included in Export:

- ✅ Event title with emoji (📝 Assignment, 📊 Exam, etc.)
- ✅ Due dates and times
- ✅ Descriptions
- ✅ Location (if provided)
- ✅ Course code as category
- ✅ Priority levels
- ✅ **Automatic reminders** (1 day before each event)

### How to Use:

#### On Mac (Apple Calendar):
1. Process your syllabus in SyllabusSync
2. Click "Export to Calendar"
3. Double-click the downloaded `.ics` file
4. Apple Calendar opens automatically
5. Click "Add" to import all events

#### On Google Calendar:
1. Process your syllabus in SyllabusSync
2. Click "Export to Calendar"
3. Go to [Google Calendar](https://calendar.google.com)
4. Click ⚙️ Settings → Import & Export
5. Click "Select file from your computer"
6. Choose the downloaded `.ics` file
7. Select which calendar to import to
8. Click "Import"

#### On iPhone/iPad:
1. Process your syllabus in SyllabusSync
2. Click "Export to Calendar"
3. Tap the downloaded `.ics` file
4. Tap "Add All" in Calendar app

## ⏳ What's Coming (Google Calendar Direct Sync)

### Backend Ready (Needs OAuth Setup):

```
POST /calendar/sync/{syllabus_id}  - Sync directly to Google Calendar
GET  /calendar/events              - Get all calendar events
DELETE /calendar/events/{event_id} - Delete specific event
```

### To Enable Direct Google Calendar Sync:

1. **Set up Google OAuth 2.0**
   - Create OAuth credentials in Google Cloud Console
   - Add authorized redirect URIs
   - Enable Google Calendar API

2. **Update Backend**
   - Add OAuth flow in `backend/services/calendar_service.py`
   - Store user tokens in Firebase
   - Implement token refresh

3. **Update Frontend**
   - Add Google Sign-In button
   - Handle OAuth callback
   - Store tokens securely

4. **User Flow**
   - User clicks "Sync to Google Calendar"
   - Redirected to Google login
   - Grant calendar permissions
   - Events automatically added to Google Calendar

## 📊 Current vs Future

| Feature | Current Status | Notes |
|---------|---------------|-------|
| Export to .ics | ✅ Working | Works with all calendar apps |
| Apple Calendar | ✅ Working | One-click import |
| Google Calendar Import | ✅ Working | Manual import via .ics |
| Outlook Import | ✅ Working | Manual import via .ics |
| Direct Google Sync | ⏳ Backend Ready | Needs OAuth setup |
| Calendar View UI | ✅ Working | Beautiful calendar interface |
| Event Editing | ✅ Working | Edit before export |
| Reminders | ✅ Included | 1 day before each event |

## 🔧 Technical Details

### .ics Format

The exported file follows the **iCalendar (RFC 5545)** standard:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SyllabusSync//EN
BEGIN:VEVENT
UID:unique-event-id
DTSTART:20250115T090000Z
DTEND:20250115T100000Z
SUMMARY:📝 Assignment 1
DESCRIPTION:Complete chapter 1 exercises
LOCATION:Room 101
CATEGORIES:CS-101
PRIORITY:5
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder: Assignment 1 due tomorrow
END:VALARM
END:VEVENT
END:VCALENDAR
```

### Supported Calendar Apps

- ✅ Apple Calendar (macOS, iOS, iPadOS)
- ✅ Google Calendar (web, Android, iOS)
- ✅ Microsoft Outlook (Windows, Mac, web)
- ✅ Mozilla Thunderbird
- ✅ Yahoo Calendar
- ✅ Any app supporting RFC 5545

## 🎯 Recommendations

### For Now:
**Use the .ics export** - it's universal and works everywhere!

### For Production:
1. Implement Google OAuth for direct sync
2. Add Microsoft Graph API for Outlook sync
3. Add Apple Calendar sync via CalDAV
4. Support multiple calendar accounts

## 🐛 Troubleshooting

### .ics file won't open
- Make sure you have a calendar app installed
- Try right-click → Open With → Calendar

### Events not importing
- Check date formats in the .ics file
- Ensure calendar app is up to date
- Try importing to a different calendar

### Reminders not working
- Check calendar app notification settings
- Ensure notifications are enabled for the calendar

## 📝 Example Usage

```typescript
// In your frontend code
import { downloadICS } from './utils/calendar';

// Export events
const events = [...]; // Your parsed events
const courseName = "Computer Science 101";
downloadICS(events, courseName);

// File downloads as: Computer_Science_101_calendar.ics
```

---

**Status**: ✅ Export to .ics working  
**Next**: Implement Google OAuth for direct sync  
**Updated**: October 4, 2025
