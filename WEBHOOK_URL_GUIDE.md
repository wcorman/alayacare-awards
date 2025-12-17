# Quick Reference: Webhook URL for Emails

## The URL to Include in Your Airtable Email

### Local Development
```
http://localhost:3000/api/webhook/trigger?token={{Confirmation Token}}
```

### Production (replace with your actual domain)
```
https://your-production-domain.com/api/webhook/trigger?token={{Confirmation Token}}
```

---

## How to Use in Airtable Email Automation

### Option 1: As a Visible Link
```html
<a href="http://localhost:3000/api/webhook/trigger?token={{Confirmation Token}}">
  Click here to notify us
</a>
```

### Option 2: As an Invisible Tracking Pixel (Recommended)
This fires automatically when the email is opened:

```html
<img src="http://localhost:3000/api/webhook/trigger?token={{Confirmation Token}}" width="1" height="1" style="display:none;" />
```

### Option 3: In Airtable Automation "Send Email" Action
In the email body HTML, add:

```html
<img src="http://localhost:3000/api/webhook/trigger?token={{Confirmation Token}}" width="1" height="1" alt="" />
```


## What This Does

When the URL is accessed (link clicked or email opened):

### 1. **Confirms the Vote** ✅
- Updates the Email Confirmations record:
  - Sets "Vote Confirmed" checkbox to **true**
  - Sets "Confirmed At" to current timestamp (e.g., "2025-12-17T13:53:26.000Z")
- Updates or creates the Voting Record with the nominee

### 2. **Sends Webhook** 📤
- Looks up the confirmation record using the token
- Fetches the complete nominee data from Airtable
- Sends a webhook to your Airtable workflow with:
  - Voter email
  - Nominee name, category, description, image, votes
  - Timestamp

**Important:** This URL both confirms the vote AND sends the webhook in one action!

---


## Testing

To test with a real token from your database:

1. Go to your Airtable "Email Confirmations" table
2. Copy a "Confirmation Token" value
3. Visit in browser:
   ```
   http://localhost:3000/api/webhook/trigger?token=PASTE_TOKEN_HERE
   ```
4. You should be redirected to the home page
5. A popup will appear saying "Thank you for confirming your vote for [Nominee Name]"
6. The popup includes:
   - ✅ Success checkmark
   - Nominee name and category
   - "Vote for Others" button
   - "Close" button
7. Check your Airtable:
   - "Vote Confirmed" should be checked ✅
   - "Confirmed At" should have a timestamp
   - Your webhook workflow should have received the data

---

## What Users See

When someone clicks the link in the email or the email is opened (with tracking pixel):

1. **Redirect happens** - User goes to your app homepage
2. **Popup appears** - Beautiful success message with:
   - Green checkmark icon
   - "Thank you!"
   - "Your vote has been confirmed for **[Nominee Name]**"
   - Category name
   - "Vote for Others" button (encourages more engagement!)
   - "Close" button

---

## Important Notes

- ✅ The webhook function is still in place
- ✅ It's NOT called when the vote form is submitted
- ✅ It's ONLY called when this URL is accessed
- ✅ The URL can be included in your Airtable email automation
- ✅ Use `{{Confirmation Token}}` in Airtable to insert the actual token value
