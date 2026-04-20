# Gmail Integration Setup Guide

This guide walks you through setting up Gmail OAuth integration for the Smart Focus Inbox application.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top and select **"New Project"**
3. Enter project name: `smart-focus-inbox` (or your preferred name)
4. Click **"Create"** and wait for the project to be created
5. Select your new project from the dropdown

## Step 2: Enable Gmail API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Gmail API"**
3. Click on the Gmail API result
4. Click **"Enable"** button
5. You should see "API enabled" confirmation

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **OAuth 2.0 Client IDs**
3. If prompted, click **"Configure Consent Screen"** first:
   - Choose **User Type: External**
   - Click **"Create"**
   - Fill in:
     - **App name**: Smart Focus Inbox
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click **"Save & Continue"** through all screens
   - Click **"Back to Credentials"**

4. Now create the OAuth 2.0 Client ID:
   - Click **"+ Create Credentials"** → **OAuth 2.0 Client IDs**
   - Select **Application type: Web application**
   - Enter **Name**: `smart-focus-inbox-web`
   - Under **Authorized redirect URIs**, add:
     - `http://localhost:8080/gmail-callback` (default local development port for this project)
     - `http://localhost:5173/gmail-callback` (alternative if you change the Vite port)
     - `http://localhost:5174/gmail-callback` (alternative port)
     - `https://yourdomain.com/gmail-callback` (for production)
   - Click **"Create"**

5. Copy your credentials:
   - **Client ID** (saves for `.env` file)
   - **Client Secret** (saves for `.env` file)

## Step 4: Configure Environment Variables

1. In the project root, create or edit `.env` file
2. Add the Gmail credentials:

```env
# Gmail OAuth Configuration
VITE_GMAIL_CLIENT_ID=your_client_id_here
VITE_GMAIL_CLIENT_SECRET=your_client_secret_here
VITE_GMAIL_REDIRECT_URI=http://localhost:8080/gmail-callback
```

Replace:
- `your_client_id_here` with your Client ID
- `your_client_secret_here` with your Client Secret
- `http://localhost:8080/gmail-callback` with the exact callback URL you registered in Google Cloud

## Step 5: Add Scopes (if needed)

The app requests these Gmail scopes:
- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
- `https://www.googleapis.com/auth/gmail.modify` - Modify labels (optional)

These are safe and required for the app to function.

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

2. Navigate to the app (usually `http://localhost:8080`)

3. Sign up or log in

4. Click **"Connect Gmail"** button on the Profile Setup page

5. You'll be redirected to Google's login page

6. Grant permission when prompted

7. You'll be redirected back to the app and Gmail messages will start syncing

## Troubleshooting

### "Invalid client ID" error
- Check that you've added the correct Client ID to `.env`
- Make sure the redirect URI matches exactly (including protocol and port)

### "Client not registered" error
- Verify the Google Cloud Project has Gmail API enabled
- Check that you created OAuth 2.0 credentials (not just API key)

### Messages not loading after connection
- Check browser console for errors (F12 → Console tab)
- Make sure your Gmail account is not using 2-factor authentication (or use app password)
- Try disconnecting and reconnecting Gmail

### CORS errors
- This is expected if you're making requests client-side
- For production, move the `exchangeCodeForToken` call to your backend server

## Security Notes

⚠️ **Important**: In production:
1. Move the `exchangeCodeForToken` function to your backend
2. Never expose your Client Secret on the frontend
3. Use secure token storage (not localStorage)
4. Implement token refresh logic for access tokens that expire

## Backend Integration (Optional)

For production, create a backend API endpoint:

```typescript
// Backend example (Node.js/Express)
app.post('/api/gmail/callback', async (req, res) => {
  const { code } = req.body;
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: JSON.stringify({
      code,
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET, // Keep secret!
      redirect_uri: process.env.GMAIL_REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });
  
  const tokens = await response.json();
  // Save tokens securely, return only access token to frontend
  res.json({ accessToken: tokens.access_token });
});
```

## Next Steps

- ✅ Gmail integration is complete
- Next: Add WhatsApp integration
- Next: Add LinkedIn integration
- Next: Set up message storage in Supabase

## Support

For issues with:
- **Google OAuth**: See [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- **Gmail API**: See [Gmail API Documentation](https://developers.google.com/gmail/api/guides)
- **App issues**: Check the browser console for error messages
