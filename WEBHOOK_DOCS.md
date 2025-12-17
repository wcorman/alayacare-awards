# Webhook Integration Documentation

## Overview
A webhook endpoint is available to send vote request data to Airtable. This webhook can be triggered via a URL that includes the confirmation token.

## Airtable Webhook Endpoint
```
https://hooks.airtable.com/workflows/v1/genericWebhook/appoyGieFsL8edtK1/wflhDkDFreErcLy7s/wtrwPlqUYe3Xs3SNQ
```

## How to Trigger the Webhook

### Via Email Link

Include this URL in your Airtable email automation:

**Local Development:**
```
http://localhost:3000/api/webhook/trigger?token={CONFIRMATION_TOKEN}
```

**Production:**
```
https://your-domain.com/api/webhook/trigger?token={CONFIRMATION_TOKEN}
```

Replace `{CONFIRMATION_TOKEN}` with the actual confirmation token from the Email Confirmations table.

### Example Usage in Airtable Email

In your Airtable automation email, you can include a link like:

```html
<a href="http://localhost:3000/api/webhook/trigger?token={{Confirmation Token}}">
  Trigger Webhook
</a>
```

Or as a tracking pixel (invisible):

```html
<img src="http://localhost:3000/api/webhook/trigger?token={{Confirmation Token}}" width="1" height="1" />
```

## Payload Structure

When the webhook URL is called, it sends the following JSON payload to Airtable:

```json
{
  "voterEmail": "voter@example.com",
  "nominee": {
    "id": "recXXXXXXXXXX",
    "name": "Nominee Full Name",
    "category": "Category Name",
    "description": "Nomination reason/description",
    "imageUrl": "https://ucarecdn.com/...",
    "currentVotes": 42
  },
  "timestamp": "2025-12-17T13:19:23.749Z",
  "eventType": "vote_request"
}
```

## Data Fields

### Voter Information
- **voterEmail**: The email address from the confirmation record

### Nominee Information (all from Airtable)
- **id**: Airtable record ID of the nominee
- **name**: Full name of the nominee
- **category**: Award category (e.g., "Best Caregiver", "Rising Star")
- **description**: The nomination reason/description
- **imageUrl**: Profile photo URL from Uploadcare (or null if no photo)
- **currentVotes**: Current vote count for this nominee

### Metadata
- **timestamp**: ISO 8601 timestamp of when the webhook was triggered
- **eventType**: Always "vote_request" for identification

## User Experience

### Success Flow
When the webhook URL is accessed successfully:
1. Vote is confirmed in Airtable
2. Webhook is sent to Airtable workflow
3. User is redirected to: `http://localhost:3000/?vote=confirmed&nominee=Jane+Smith&category=Best+Caregiver`
4. A popup appears with:
   - ✅ Success checkmark
   - "Thank you for confirming your vote for **Jane Smith**"
   - Category name
   - "Vote for Others" button (links to /categories)
   - "Close" button

### Error Flow
If there's an error, user is redirected to home page with error parameter:
- Missing token: `/?error=missing_token`
- Invalid token: `/?error=invalid_token`
- Missing data: `/?error=missing_data`
- Nominee not found: `/?error=nominee_not_found`
- Server error: `/?error=server_error`

## Workflow

1. User clicks "Vote" on a nominee card
2. User enters their email address
3. System creates confirmation record in Airtable (with token)
4. Airtable automation sends email with webhook trigger URL
5. **When the webhook URL is accessed** (e.g., email opened or link clicked):
   - ✅ Updates "Vote Confirmed" checkbox to **true**
   - ✅ Sets "Confirmed At" timestamp (e.g., "2025-12-17T13:53:26.000Z")
   - ✅ Updates or creates Voting Record with the nominee
   - ✅ Sends webhook to Airtable workflow with complete data
6. Vote is counted and webhook data is received by Airtable

## What Happens When the URL is Accessed

The webhook trigger performs these actions automatically:

1. **Validates the token** - Looks up the confirmation record
2. **Confirms the vote** - Updates Email Confirmations record:
   - Sets `Vote Confirmed` = `true`
   - Sets `Confirmed At` = current timestamp (ISO 8601 format)
3. **Updates voting record** - Adds nominee to voter's voted list
4. **Sends webhook** - Fires webhook to Airtable with complete data
5. **Returns success** - Confirms all actions completed

## Error Handling


- Webhook failures are logged but return appropriate HTTP status codes
- Invalid tokens return 404 errors
- Missing data returns 400 errors
- Server errors return 500 errors

## Testing

Test the webhook endpoint with:

```bash
curl "http://localhost:3000/api/webhook/trigger?token=YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with an actual confirmation token from your Email Confirmations table.

