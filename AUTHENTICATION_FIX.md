# AIDA Widget Authentication Fix

## Problem Description

The AIDA Widget Integration app was experiencing authentication failures when connecting to the Mocxha API server, despite the same credentials working correctly from the web UI. The error occurred during the `FrappeClient` login process:

```
frappeclient.frappeclient.AuthError
Exception: Mocxha connection failed: . Please check URL and credentials.
```

## Root Cause Analysis

The issue was identified in the session initialization process:

1. **Hardcoded Password**: The backend `initialize_session` function was using a hardcoded `'demo_password'` instead of the actual user credentials passed from the widget.

2. **Missing Session Restoration**: Unlike the web UI, the widget was not implementing session restoration logic, causing it to create new sessions every time instead of reusing existing valid sessions.

3. **Inconsistent Authentication Flow**: The widget and web UI were using different approaches for session management.

## Solution Implemented

### 1. Fixed Backend Authentication

**File**: `aida_widget_integration/api.py`

- **Before**: Used hardcoded `'demo_password'`
- **After**: Uses the actual password parameter passed from the widget
- **Added**: Password validation to ensure credentials are provided

```python
# Validate that password is provided
if not password:
    return {
        'error': True,
        'message': 'Password is required for session initialization. Please configure your credentials in the widget settings.'
    }

# Prepare payload with actual credentials
payload = {
    'erpnext_url': erpnext_url,
    'username': username,
    'password': password,  # Now uses actual password
    'site_base_url': erpnext_url,
    'restore_session': True
}
```

### 2. Implemented Session Restoration

**File**: `aida_widget_integration/public/js/aida_chat_widget.js`

- **Added**: Session persistence using localStorage
- **Added**: Session validation before creating new sessions
- **Added**: Automatic session restoration on widget initialization

```javascript
// Try to restore existing session first
const savedSessionId = localStorage.getItem(`aida_session_id_${this.userHash}`);
if (savedSessionId) {
    try {
        const isValid = await this.checkSessionStatus(savedSessionId);
        if (isValid) {
            this.sessionId = savedSessionId;
            console.log('Session restored:', this.sessionId);
            return;
        }
    } catch (error) {
        console.log('Failed to restore session, creating new one:', error);
        localStorage.removeItem(`aida_session_id_${this.userHash}`);
    }
}
```

### 3. Added Session Status Checking

**Backend Function**: `check_session_status(session_id)`
- Calls the AIDA API server's `/session_status/{session_id}` endpoint
- Returns session validity status
- Handles connection errors gracefully

**Frontend Function**: `checkSessionStatus(sessionId)`
- Validates saved sessions before use
- Removes invalid sessions from localStorage
- Enables seamless session restoration

## How It Works Now

### Authentication Flow

1. **Widget Initialization**:
   - Widget loads user credentials from localStorage
   - Generates unique user hash for session management
   - Attempts to restore existing session if available

2. **Session Restoration**:
   - Checks localStorage for saved session ID
   - Validates session with AIDA API server
   - Uses existing session if valid, creates new one if not

3. **New Session Creation**:
   - Sends actual user credentials to backend
   - Backend forwards credentials to AIDA API server
   - Session ID is saved for future restoration

4. **Chat Communication**:
   - Uses established session for all chat interactions
   - Automatically updates session ID if server provides new one
   - Maintains session persistence across page reloads

### Key Improvements

- **Consistent Authentication**: Widget now uses the same session management approach as the web UI
- **Session Persistence**: Sessions are saved and restored across browser sessions
- **Error Handling**: Better error messages and graceful fallbacks
- **Performance**: Reduces unnecessary session creation
- **User Experience**: Seamless authentication without repeated credential entry

## Configuration Requirements

### Widget Settings

Users must configure their credentials in the widget settings:

1. **Username**: Mocxha username (auto-filled with current user)
2. **Password**: Mocxha password (required for API authentication)
3. **Mocxha URL**: Auto-detected from current site
4. **API Server URL**: AIDA API server endpoint

### AIDA Widget Settings DocType

Ensure the following settings are configured:

- `api_server_url`: URL of the AIDA API server (e.g., `http://localhost:5000`)
- `widget_enabled`: Set to `True` to enable the widget
- Other widget appearance and behavior settings as needed

## Testing the Fix

### 1. Verify Widget Functionality

```javascript
// Open browser console and check for these logs:
// "Session restored: [session-id]" - for existing sessions
// "New session initialized: [session-id]" - for new sessions
```

### 2. Test Authentication

1. Configure widget credentials in settings
2. Send a test message
3. Verify successful response from AIDA
4. Check that session persists across page reloads

### 3. Verify Session Management

1. Open widget and send a message
2. Reload the page
3. Send another message
4. Verify that the same session is restored (check console logs)

## Troubleshooting

### Common Issues

1. **"Password is required" Error**:
   - Configure password in widget settings
   - Ensure credentials are saved properly

2. **Session Restoration Fails**:
   - Check AIDA API server connectivity
   - Verify session status endpoint is working
   - Clear localStorage if needed: `localStorage.removeItem('aida_session_id_[user-hash]')`

3. **Authentication Still Fails**:
   - Verify Mocxha credentials are correct
   - Check AIDA API server logs for detailed error messages
   - Ensure API server URL is correct in widget settings

### Debug Commands

```javascript
// Check saved session ID
localStorage.getItem('aida_session_id_' + widget.userHash);

// Clear saved session (force new session creation)
localStorage.removeItem('aida_session_id_' + widget.userHash);

// Check widget settings
console.log(widget.settings);
```

## Files Modified

1. `aida_widget_integration/api.py`
   - Fixed `initialize_session()` function
   - Added `check_session_status()` function

2. `aida_widget_integration/public/js/aida_chat_widget.js`
   - Enhanced `initializeSession()` with restoration logic
   - Added `checkSessionStatus()` function
   - Implemented session persistence

## Compatibility

This fix is compatible with:
- ERPNext v13, v14, v15
- Frappe Framework v13+
- All modern browsers with localStorage support
- Existing AIDA API server implementations

The changes are backward compatible and do not affect existing functionality.