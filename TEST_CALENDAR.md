# 🧪 Testing the Calendar Feature

## Quick Start Guide

### 1. Start the Next.js Development Server

```bash
cd /Users/piyushsingh/HackUTA-2025
npm run dev
```

The app will start at `http://localhost:3000`

### 2. Test the Calendar Feature

#### Step-by-Step Testing:

1. **Open your browser** to `http://localhost:3000`

2. **Log in** (if authentication is enabled)

3. **Upload a Syllabus PDF**
   - Click the upload area or drag & drop a PDF file
   - The PDF should be a course syllabus with assignments, exams, and projects

4. **Process the PDF**
   - Click the "Process File" button
   - Wait for the AI to extract data (takes 5-15 seconds)

5. **Review Parsed Events**
   - You'll see a modal/section showing extracted assignments, exams, and projects
   - Each event will have:
     - Title
     - Due date
     - Type (Assignment, Exam, Project)
     - Icon and color coding

6. **Go to Calendar**
   - Click the **"Continue to Calendar"** button at the bottom right
   - This will navigate to `/calendar`

7. **View Your Calendar**
   - See all events displayed in a monthly calendar view
   - Events are color-coded:
     - 🔵 Blue = Assignments
     - 🔴 Red = Exams
     - 🟡 Yellow = Quizzes
     - 🟣 Purple = Projects
     - 🟢 Green = Lectures

8. **Export to Calendar App**
   - Click **"📥 Export to Calendar"** button
   - A `.ics` file will download
   - Open it to import into:
     - Apple Calendar (Mac/iPhone)
     - Google Calendar
     - Outlook
     - Any calendar app

9. **Navigate Calendar**
   - Use **"← Previous"** and **"Next →"** buttons to change months
   - Click **"Today"** to jump to current date
   - Click on any event to see details

10. **Return Home**
    - Click **"← Back to Home"** button to upload another syllabus

## 🐛 Troubleshooting

### If PDF processing fails:
- Check that `GEMINI_API_KEY` is set in `.env.local`
- Ensure the PDF is less than 10MB
- Make sure the PDF contains text (not just images)

### If calendar doesn't show events:
- Make sure you clicked "Continue to Calendar" button
- Check browser console for errors (F12 → Console tab)
- Verify sessionStorage has data:
  ```javascript
  console.log(sessionStorage.getItem('syllabusCalendarData'))
  ```

### If .ics export doesn't work:
- Check browser console for errors
- Try a different browser (Chrome, Firefox, Safari all work)
- Make sure pop-ups aren't blocked

## 📝 Test PDFs

If you don't have a syllabus PDF handy, you can:
1. Use any course syllabus PDF from your courses
2. Create a simple test PDF with sample content:
   - Course Name: Computer Science 101
   - Assignments with due dates
   - Exam dates
   - Project deadlines

## 🎯 Expected Behavior

### Processing:
- ✅ PDF uploads successfully
- ✅ AI extracts assignments, exams, projects
- ✅ Events display in results modal
- ✅ Event counts are accurate

### Calendar View:
- ✅ Events appear on correct dates
- ✅ Colors match event types
- ✅ Navigation works smoothly
- ✅ Event details show in modal on click
- ✅ Today's date is highlighted

### Export:
- ✅ .ics file downloads
- ✅ File opens in calendar app
- ✅ Events import correctly
- ✅ Reminders are included

## 📸 Screenshots to Capture

When testing, verify these UI elements:
1. File upload area with drag & drop
2. Parsed events modal showing all assignments
3. Calendar page with events displayed
4. Event detail modal
5. .ics file download confirmation

---

**Status**: Ready to test! 🚀
**Created**: October 5, 2025
