# AIDA Widget Integration Troubleshooting Guide

## Common Issues and Solutions

### 1. Session Initialization Failed (500 Error)

**Error Message:**
```
Session initialization failed: Error: Session initialization failed: 500
Mocxha connection failed: . Please check URL and credentials.
```

**Root Cause:**
The AIDA API server cannot authenticate with your Mocxha instance.

**Solutions:**

#### Option A: Configure API Keys (Recommended)
1. **Generate API Keys in Mocxha:**
   - Go to User Profile → API Access
   - Generate API Key and API Secret
   - Save the credentials securely

2. **Update AIDA Server Configuration:**
   - Modify your AIDA server to use the generated API keys
   - Ensure the Mocxha URL is accessible from the AIDA server

#### Option B: Use Demo Mode
1. **Configure AIDA Server for Demo:**
   - Set up AIDA server to work in demo mode
   - Use mock authentication for testing

#### Option C: Network Configuration
1. **Check Network Connectivity:**
   - Ensure AIDA server can reach Mocxha URL
   - Verify firewall settings
   - Check if Mocxha is accessible from AIDA server's network

2. **Update Mocxha URL:**
   - Use the correct external URL if AIDA server is remote
   - Example: `http://46.62.138.17:8002` instead of `localhost`

## Installation Issues

### Packaging/Build Errors

**Symptoms:**
- `NoVersionError: Cannot package module without a version string`
- `metadata-generation-failed` errors
- `flit_core.common.NoVersionError` during installation

**Solutions:**
1. **Use Manual Installation Method:**
   ```bash
   cd /path/to/your/bench/apps
   git clone https://github.com/Shamlan321-pro/aida_widget_integration
   cd /path/to/your/bench
   ./env/bin/pip install -e apps/aida_widget_integration
   bench --site [site-name] install-app aida_widget_integration
   ```

2. **Alternative: Use setuptools instead of flit:**
   - The app now includes both `pyproject.toml` and `setup.py` for compatibility
   - If flit fails, setuptools will be used as fallback

3. **Verify Python Version:**
   ```bash
   python3 --version  # Should be 3.10 or higher
   ```

### App Installation Fails

**Symptoms:**
- `bench get-app` command fails
- Permission denied errors
- Network connectivity issues

**Solutions:**
1. **Check Network Connection:**
   ```bash
   ping github.com
   curl -I https://github.com/Shamlan321-pro/aida_widget_integration
   ```

2. **Verify Bench Setup:**
   ```bash
   bench --version
   bench list-apps
   ```

3. **Check Permissions:**
   ```bash
   ls -la /path/to/your/bench/apps/
   sudo chown -R $(whoami):$(whoami) /path/to/your/bench/
   ```

4. **Manual Installation:**
   ```bash
   cd /path/to/your/bench/apps
   git clone https://github.com/Shamlan321-pro/aida_widget_integration
   cd /path/to/your/bench
   bench --site [site-name] install-app aida_widget_integration
   ```

### 2. DocType ImportError / "DocType AIDA Widget Settings not found"

**Error Message:**
```
ImportError: AIDA Widget Settings
DocType AIDA Widget Settings not found
```

**Solutions:**

#### Quick Fix Script:
1. **Run the automated fix script:**
   ```bash
   cd aida_widget_integration
   python fix_doctype_issue.py
   ```
   Follow the prompts and enter your site name when asked.

#### Manual Solution:
1. **Run migration:**
   ```bash
   bench --site [your-site-name] migrate
   ```

2. **Reload DocType:**
   ```bash
   bench --site [your-site-name] reload-doctype "AIDA Widget Settings"
   ```

3. **Clear cache:**
   ```bash
   bench --site [your-site-name] clear-cache
   bench --site [your-site-name] clear-website-cache
   ```

4. **Build assets:**
   ```bash
   bench build
   ```

5. **Restart Frappe bench:**
   ```bash
   bench restart
   ```

6. **Reinstall app** (if above steps don't work):
   ```bash
   bench --site [your-site-name] uninstall-app aida_widget_integration
   bench --site [your-site-name] install-app aida_widget_integration
   bench --site [your-site-name] migrate
   ```

### 3. Widget Not Appearing

**Possible Causes:**
- Widget is disabled in settings
- JavaScript/CSS files not loaded
- Browser cache issues

**Solutions:**
1. **Check Widget Settings:**
   - Go to Setup → AIDA Widget Settings
   - Ensure "Enable Widget" is checked

2. **Clear Browser Cache:**
   - Hard refresh (Ctrl+F5)
   - Clear browser cache and cookies

3. **Check Console for Errors:**
   - Open browser developer tools
   - Look for JavaScript errors in console

### 4. Authentication Issues

**Error Message:**
```
frappeclient.frappeclient.AuthError
Mocxha connection failed
Widget authentication fails
```

**Cause:** Widget credentials not properly configured or session restoration issues.

**Solutions:**
1. **Check the comprehensive authentication fix:**
   - See `AUTHENTICATION_FIX.md` for detailed solution
   - Ensure widget credentials are properly configured
   - Verify session restoration is working

2. **Configure widget credentials:**
   - Open widget settings
   - Enter correct Mocxha username and password
   - Save settings and test connection

3. **Clear session cache if needed:**
   ```javascript
   // In browser console
   localStorage.removeItem('aida_session_id_' + widget.userHash);
   ```

4. **Verify API server connectivity:**
   - Test connection in widget settings
   - Check AIDA API server logs
   - Ensure correct API server URL

### 5. Server Deployment Issues

**Error Message:**
```
✗ aida_widget_integration/aida_widget_integration/modules.txt (MISSING)
✗ aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/aida_widget_settings.json (MISSING)
```

**Cause:** App files are not properly deployed on the server.

**Solutions:**
1. **Use the automated deployment script:**
   ```bash
   python3 deploy_to_server.py
   ```

2. **Follow the complete deployment guide:**
   - See `SERVER_DEPLOYMENT_GUIDE.md` for detailed instructions
   - Choose from automated, manual, or Git-based deployment

3. **Verify deployment:**
   ```bash
   python3 diagnose_doctype.py
   ```

### 6. Connection Test Failures

**Error Message:**
```
Could not connect to AIDA API server
```

**Solutions:**
1. **Verify AIDA Server Status:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check Server URL:**
   - Ensure correct URL in widget settings
   - Use external IP if server is remote

3. **Firewall Configuration:**
   - Open required ports (default: 5000)
   - Configure network security groups

### 7. Chat Messages Not Working

**Possible Issues:**
- Session not initialized
- API server connection problems
- Authentication failures

**Solutions:**
1. **Check Browser Console:**
   - Look for session initialization errors
   - Verify API call responses

2. **Test Connection:**
   - Use the "Test Connection" button in widget settings
   - Verify server health endpoint

3. **Review Server Logs:**
   - Check AIDA server logs for authentication errors
   - Verify ERPNext connectivity from server

## Configuration Checklist

### ERPNext Side
- [ ] AIDA Widget Integration app installed
- [ ] Widget enabled in settings
- [ ] API server URL configured correctly
- [ ] User has necessary permissions
- [ ] Browser cache cleared

### AIDA Server Side
- [ ] Server running and accessible
- [ ] Health endpoint responding
- [ ] ERPNext URL reachable from server
- [ ] Authentication configured properly
- [ ] MongoDB connection working

### Network Configuration
- [ ] Firewall ports open
- [ ] CORS configured if needed
- [ ] SSL certificates valid (if using HTTPS)
- [ ] Network connectivity between services

## Getting Help

If you continue to experience issues:

1. **Check Logs:**
   - ERPNext error logs
   - AIDA server logs
   - Browser console errors

2. **Run Validation Script:**
   ```bash
   cd aida_widget_integration
   python validate_installation.py
   ```

3. **Provide Debug Information:**
   - Error messages
   - Server logs
   - Network configuration
   - ERPNext and AIDA versions

## Advanced Configuration

### Custom Authentication
For production environments, implement proper authentication:

1. **API Key Management:**
   - Generate unique API keys per user
   - Implement key rotation
   - Use secure storage

2. **Session Management:**
   - Configure session timeouts
   - Implement session cleanup
   - Handle session restoration

3. **Security Considerations:**
   - Use HTTPS in production
   - Implement rate limiting
   - Configure proper CORS policies
   - Enable audit logging