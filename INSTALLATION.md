# AIDA Widget Integration - Installation Guide

## Prerequisites

1. **Mocxha/Frappe Framework**: Ensure you have a working Mocxha installation
2. **AIDA API Server**: The main AIDA API server should be running on port 5000
3. **Bench**: Frappe bench should be installed and configured
4. **Permissions**: Administrative access to the Mocxha site
5. **Python**: Python 3.10 or higher

## Installation Steps

### Method 1: Install from GitHub (Recommended)

```bash
# Navigate to your bench directory
cd /path/to/your/bench

# Install the app from GitHub
bench get-app aida_widget_integration https://github.com/Shamlan321-pro/aida_widget_integration

# Install the app on your site
bench --site [your-site-name] install-app aida_widget_integration
```

### Method 2: Manual Installation (If Method 1 Fails)

If you encounter packaging errors during installation, try this manual approach:

```bash
# Clone the repository manually
cd /path/to/your/bench/apps
git clone https://github.com/Shamlan321-pro/aida_widget_integration

# Install using pip in development mode
cd /path/to/your/bench
./env/bin/pip install -e apps/aida_widget_integration

# Install the app on your site
bench --site [your-site-name] install-app aida_widget_integration
```

### Method 3: Local Installation

```bash
# Navigate to your bench directory
cd /path/to/your/bench

# Install the app from the local directory
bench get-app aida_widget_integration /path/to/aida_widget_integration

# Or if you're in the app directory
bench get-app aida_widget_integration .

# Install the app on your site
bench --site [your-site-name] install-app aida_widget_integration
```

### Final Steps (For All Methods)

```bash
# Restart bench to load the new app
bench restart

# Clear cache
bench --site [your-site-name] clear-cache

# Rebuild assets
bench build
```

### 3. Verify Installation

1. **Check App Installation**:
   ```bash
   bench --site [your-site-name] list-apps
   ```
   You should see `aida_widget_integration` in the list.

2. **Check DocType Creation**:
   - Login to your Mocxha site
   - Go to **Setup > Customize > DocType List**
   - Search for "AIDA Widget Settings"
   - The DocType should be present

3. **Verify Widget Appearance**:
   - Navigate to any page in Mocxha
   - You should see a floating chat button in the bottom-right corner
   - Click the button to open the chat widget

## Configuration

### 1. Configure Widget Settings

1. **Access Settings**:
   - Go to **Setup > AIDA Widget Settings**
   - Or search for "AIDA Widget Settings" in the awesome bar

2. **Basic Configuration**:
   - **Widget Enabled**: Check to enable the widget
   - **Auto Open**: Check to auto-open widget on page load
   - **API Server URL**: Set to your AIDA API server (default: `https://aida.mocxha.com`)
   - **Welcome Message**: Customize the initial greeting

3. **Test Connection**:
   - **Use the Test Connection button** to verify connectivity:
     - Click "Test Connection" in the API Server URL section
     - Wait for the status indicator:
       - ✅ **Success**: Connection established successfully
       - ❌ **Error**: Connection failed (check URL and server status)
       - ⏳ **Loading**: Testing in progress
     - This helps diagnose connection issues before using the widget

4. **Appearance Settings**:
   - **Widget Position**: Choose from bottom-right, bottom-left, top-right, top-left
   - **Widget Theme**: Select light or dark theme
   - **User Avatar URL**: Set custom avatar for users
   - **Sound Notifications**: Enable/disable sound alerts

5. **Advanced Settings**:
   - **Connection Timeout**: API request timeout (default: 30 seconds)
   - **Max Retries**: Maximum retry attempts for failed requests
   - **Debug Mode**: Enable for troubleshooting
   - **Conversation Logging**: Enable to log conversations

### 2. API Server Configuration

Ensure your AIDA API server is configured to accept requests from your Mocxha domains:

1. **CORS Configuration**: Update your API server to allow requests from your Mocxha domains
2. **Network Access**: Ensure the Mocxha server can reach the API server on port 5000
3. **Firewall Rules**: Configure firewall to allow communication between servers

## Multi-Domain Setup

For multiple Mocxha instances:

1. **Install on Each Instance**:
   - Install the app on each Mocxha site
   - Configure the same API server URL on all instances

2. **Shared API Server**:
   - Keep one central AIDA API server running
   - All Mocxha instances will connect to this server
   - User sessions and chat history will be synced across instances

3. **Domain-Specific Settings**:
   - Each Mocxha instance can have its own widget settings
   - Customize appearance and behavior per domain

## Troubleshooting

### Widget Not Appearing

1. **Check App Installation**:
   ```bash
   bench --site [your-site-name] list-apps
   ```

2. **Verify Settings**:
   - Ensure "Widget Enabled" is checked in AIDA Widget Settings
   - Check browser console for JavaScript errors

3. **Clear Cache**:
   ```bash
   bench --site [your-site-name] clear-cache
   bench build
   ```

### Connection Issues

1. **API Server Status**:
   - Verify AIDA API server is running: `curl http://localhost:5000/health`
   - Check server logs for errors

2. **Network Connectivity**:
   - Test connection from Mocxha server to API server
   - Check firewall and network configurations

3. **CORS Issues**:
   - Ensure API server allows requests from Mocxha domain
   - Check browser network tab for CORS errors

### Chat History Not Syncing

1. **User Hash Generation**:
   - Verify Mocxha URL and username are consistent
   - Check browser localStorage for saved data

2. **API Server Logs**:
   - Check API server logs for session-related errors
   - Verify user hash is being sent correctly

### Performance Issues

1. **Optimize Settings**:
   - Reduce connection timeout if network is fast
   - Disable debug mode in production
   - Limit conversation logging if not needed

2. **Server Resources**:
   - Monitor API server CPU and memory usage
   - Consider scaling if handling many concurrent users

## Development Setup

For developers wanting to modify the app:

1. **Development Mode**:
   ```bash
   bench --site [your-site-name] set-config developer_mode 1
   bench restart
   ```

2. **Watch for Changes**:
   ```bash
   bench watch
   ```

3. **Testing**:
   ```bash
   # Run Python tests
   cd apps/aida_widget_integration
   python -m pytest aida_widget_integration/test_widget.py
   
   # Test API endpoints
   bench --site [your-site-name] console
   ```

## Security Considerations

1. **API Security**:
   - Use HTTPS for production API server
   - Implement proper authentication and authorization
   - Validate all input data

2. **Mocxha Security**:
   - Ensure proper user permissions
   - Regularly update Mocxha and the widget app
   - Monitor for security vulnerabilities

3. **Data Privacy**:
   - Review conversation logging settings
   - Implement data retention policies
   - Ensure compliance with privacy regulations

## Support

For issues and support:

1. **Check Logs**:
   - Mocxha logs: `bench logs`
   - API server logs: Check your API server documentation
   - Browser console: F12 > Console tab

2. **Documentation**:
   - Refer to the main README.md file
   - Check Frappe/Mocxha documentation

3. **Community**:
   - Mocxha Community Forum
   - GitHub Issues (if applicable)

## Uninstallation

To remove the app:

```bash
# Uninstall from site
bench --site [your-site-name] uninstall-app aida_widget_integration

# Remove app from bench
bench remove-app aida_widget_integration

# Restart services
bench restart
```

**Note**: Uninstalling will remove all widget settings and cached data. Chat history stored on the API server will remain intact.