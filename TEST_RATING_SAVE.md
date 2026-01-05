# Testing Rating Save Functionality

## Step 1: Open Browser DevTools
- Press **F12** to open Developer Tools
- Go to **Console** tab
- Keep this visible while testing

## Step 2: Open Application and Navigate to Applicant
1. Login as employer
2. Go to Applicant Tracking System (ATS)
3. Click on an applicant to open the details

## Step 3: Watch Console Logs
When you open an applicant, you should see:
```
Loading detailed ratings for applicant: [ID] {technical: X, cultural: X, communication: X, experience: X} from applicant data: {technical: X, cultural: X, communication: X, experience: X}
```

## Step 4: Change a Rating
Click on any star in the Detailed Ratings section (Technical Skills, Cultural Fit, Communication, Experience Level)

### Expected Console Output:
```
Rating changed: technical to 5 Updated ratings: {technical: 5, cultural: 0, communication: 0, experience: 0}
Overall rating calculated: 1  (average: 5+0+0+0 / 4 = 1.25 rounded to 1)
```

### After ~1 second (debounce delay):
```
Saving detailed ratings: {rating: X, detailedRatings: {technical: X, ...}} to: http://localhost:5000/api/v1/applications/[ID]/rating
✓ Detailed ratings saved successfully: {technical: X, ...}
```

## Step 5: Look for Visual Feedback
- **Saving...** text should appear briefly below the rating stars
- **✓ Saved** checkmark should appear for 2 seconds
- If you don't see these, check the browser console for errors

## Step 6: Verify Database Persistence
1. Open another applicant (different candidate)
2. Go back to the first applicant
3. Check if the ratings you set are still there

### Expected Console Output When Returning:
```
Loading detailed ratings for applicant: [SAME ID] {technical: [YOUR VALUE], ...} from applicant data: {technical: [YOUR VALUE], ...}
```

## Troubleshooting

### If you see "Saving..." but no success message:
**Problem:** Network error or backend not responding
- Check Network tab (F12 → Network)
- Look for PUT request to `/api/v1/applications/[ID]/rating`
- Check if it returns 200 status or an error code

### If you see error in console like "401" or "403":
**Problem:** Authentication issue
- Check that token is valid: `localStorage.getItem('token')` in console
- Make sure you're logged in as employer
- Try logging out and back in

### If ratings aren't saving but no error shown:
**Problem:** Silent failure - likely backend issue
- Check Backend logs: `npm run logs` or check server console
- Verify the endpoint `/api/v1/applications/:id/rating` is working
- Make sure MongoDB is connected

### If ratings save but don't persist on refresh:
**Problem:** Data not actually saving to database
- Check backend console for any errors during save
- Check if user has permission (employer ownership check)
- Verify MongoDB is properly storing the data: `db.applications.findOne({_id: ObjectId("[ID]")})`

## Expected Behavior
1. ✅ Ratings update immediately in UI
2. ✅ "Saving..." indicator appears
3. ✅ "✓ Saved" appears after success
4. ✅ Ratings persist when you switch applicants and come back
5. ✅ Console shows "Saving..." message followed by success message
