# Quick Start Guide - Testing the Enhanced Chat Assistant

## Prerequisites

1. **Backend Running**: The AI backend must be running on `http://localhost:8000`
2. **GROQ API Key**: Make sure `.env` file has `GROQ_API_KEY` set
3. **Frontend Running**: The React frontend on `http://localhost:5173` or `http://localhost:3000`

## Step 1: Start the Backend

```bash
cd ai-backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://localhost:8000
INFO:     Task extractor initialized successfully
```

## Step 2: Test Backend with Test Script

Open a new terminal:

```bash
cd ai-backend
python test_session_management.py
```

This will run 4 test scenarios. Expected output:
```
✅ Server is running
✅ TEST SCENARIO 1 PASSED!
✅ TEST SCENARIO 2 PASSED!
✅ TEST SCENARIO 3 PASSED!
✅ TEST SCENARIO 4 PASSED!
```

## Step 3: Start the Frontend

```bash
cd frontend
npm run dev
```

## Step 4: Manual Testing in Browser

### Test Case 1: Task Without Due Date

1. **Open chat assistant** (click chat icon)
2. **Type**: "I need to study for my math exam"
3. **Expected**:
   - AI asks "When is your math exam?"
   - See info message: "I'm gathering information for 1 task(s)"
   - NO confirmation card appears yet ✓
4. **Type**: "It's next Friday"
5. **Expected**:
   - See confirmation card with task details
   - Buttons: [✓] and [✗] appear
   - Task shows: date, category, priority
6. **Click** the green checkmark [✓]
7. **Expected**:
   - Success message: "✅ Task created: 'Study for math exam'"
   - Task appears in your to-do list
   - Confirmation card disappears after 2 seconds

### Test Case 2: Complete Information Upfront

1. **Type**: "I need to submit my project report by tomorrow"
2. **Expected**:
   - Confirmation card appears immediately
   - No follow-up question needed
3. **Click** [✓] to confirm
4. **Expected**:
   - Task created in to-do list

### Test Case 3: Cancel Task

1. **Type**: "Buy groceries tomorrow"
2. **Wait** for confirmation card
3. **Click** the red X [✗]
4. **Expected**:
   - Message: "🚫 Cancelled: 'Buy groceries'"
   - Task NOT added to to-do list

### Test Case 4: Multiple Tasks

1. **Type**: "I need to buy groceries tomorrow and study for exam on Monday"
2. **Expected**:
   - 2 confirmation cards appear
   - "Confirm All" and "Cancel All" buttons at bottom
3. **Click** "Confirm All"
4. **Expected**:
   - Both tasks created
   - 2 success messages

### Test Case 5: Session Persistence

1. **Type**: "I have some work to do"
2. **Wait** for AI response (should ask what work)
3. **Refresh the page** (press F5)
4. **Open chat again**
5. **Type**: "Prepare a presentation"
6. **Expected**:
   - AI remembers context (for up to 1 hour)
   - Asks for due date
7. **Type**: "This Friday"
8. **Expected**:
   - Complete task appears in confirmation

### Test Case 6: Missing Description

1. **Type**: "I have something to do next Monday"
2. **Expected**:
   - AI asks "What do you need to do next Monday?"
   - Task pending with dueDate but no description
3. **Type**: "Prepare presentation slides"
4. **Expected**:
   - Complete task appears in confirmation

## Step 5: Verify in To-Do List

After confirming tasks:
1. Navigate to your to-do list page
2. Verify tasks appear with correct:
   - Description
   - Due date
   - Category (Personal/Work/Study)
   - Priority

## Troubleshooting

### Issue: Backend won't start

**Error**: `GROQ_API_KEY not found`

**Solution**:
```bash
cd ai-backend
cp .env.example .env
# Edit .env and add your GROQ API key
nano .env  # or use your preferred editor
```

### Issue: Tasks created without confirmation

**Check**: 
- Is frontend updated?
- Look for confirmation cards in chat
- Check browser console for errors

### Issue: Session not persisting

**Check**:
1. Backend logs for session ID
2. Browser console for sessionId being sent
3. Session timeout (default: 1 hour)

**Debug**:
```javascript
// In browser console
console.log(sessionId);  // Should show a UUID
```

### Issue: AI creates tasks without due date

**Check**:
- Backend `task_extractor.py` has updated system prompt
- Look at the response - should see `pendingTasks` instead of `tasks`

**Debug**:
```bash
# Check backend logs
tail -f ai-backend.log
```

### Issue: Follow-up questions not working

**Check**:
- `needsFollowUp` field in response
- `followUpQuestion` field populated
- Frontend shows follow-up message

## Expected Behavior Summary

| User Input | Expected Result |
|------------|----------------|
| Task without due date | AI asks for date, NO confirmation yet |
| Task without description | AI asks what task is, NO confirmation yet |
| Complete task info | Confirmation card appears immediately |
| User provides missing info | Task completes, confirmation card appears |
| User clicks [✓] | Task created, success message |
| User clicks [✗] | Task cancelled, info message |
| User refreshes during conversation | Context maintained (within 1 hour) |

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Test script passes all 4 scenarios
- [ ] Frontend displays chat assistant
- [ ] Task without due date triggers follow-up
- [ ] Complete task shows confirmation card
- [ ] Confirm button creates task
- [ ] Cancel button discards task
- [ ] Multiple tasks show batch buttons
- [ ] Session persists after page refresh
- [ ] Tasks appear correctly in to-do list

## Performance Test

Test with rapid messages:

1. Type 5 different tasks quickly
2. All should get proper follow-ups
3. Sessions should handle without crashes
4. Memory usage should be stable

## Clean Up

After testing:

1. **Clear chat**: Click trash icon in chat header
2. **Check to-do list**: Remove test tasks if needed
3. **Backend logs**: Check for any errors
4. **Session cleanup**: Wait 1 hour or restart backend

## Next Steps

Once testing is complete:

1. ✅ Verify all test cases pass
2. ✅ Check for any console errors
3. ✅ Review created tasks in to-do list
4. ✅ Monitor backend logs for warnings
5. 📝 Report any issues found
6. 🚀 Ready for production!

## Support Files

- **Technical Details**: `CHANGELOG_SESSION_MANAGEMENT.md`
- **UI Guide**: `UI_GUIDE.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Test Script**: `test_session_management.py`

Happy Testing! 🎉
