# AIDA Widget Integration - Server Deployment Guide

## Issue Analysis

The diagnostic script shows that the app files are missing on the server, indicating the app wasn't properly deployed or installed. This guide provides step-by-step instructions to resolve this issue.

## Problem Summary

The diagnostic output shows:
```
✗ aida_widget_integration/aida_widget_integration/modules.txt (MISSING)
✗ aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/aida_widget_settings.json (MISSING)
✗ aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/aida_widget_settings.py (MISSING)
```

This indicates the app structure is not properly deployed on the server.

## Solution Options

### Option 1: Automated Deployment (Recommended)

1. **Upload the deployment script to your server:**
   ```bash
   scp deploy_to_server.py frappe@your-server:/home/frappe/
   ```

2. **Run the deployment script on the server:**
   ```bash
   ssh frappe@your-server
   cd /home/frappe
   python3 deploy_to_server.py
   # When prompted, enter: /home/frappe/frappe-bench/apps
   ```

3. **Install the app:**
   ```bash
   cd /home/frappe/frappe-bench
   bench --site [your-site-name] install-app aida_widget_integration
   bench --site [your-site-name] migrate
   bench restart
   ```

### Option 2: Manual File Transfer

1. **Create the directory structure on the server:**
   ```bash
   ssh frappe@your-server
   cd /home/frappe/frappe-bench/apps
   mkdir -p aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings
   mkdir -p aida_widget_integration/aida_widget_integration/config
   mkdir -p aida_widget_integration/aida_widget_integration/patches/v1_0
   ```

2. **Copy essential files from your local machine:**
   ```bash
   # Copy modules.txt
   scp aida_widget_integration/aida_widget_integration/modules.txt frappe@your-server:/home/frappe/frappe-bench/apps/aida_widget_integration/aida_widget_integration/
   
   # Copy patches.txt
   scp aida_widget_integration/aida_widget_integration/patches.txt frappe@your-server:/home/frappe/frappe-bench/apps/aida_widget_integration/aida_widget_integration/
   
   # Copy DocType files
   scp aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/* frappe@your-server:/home/frappe/frappe-bench/apps/aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/
   
   # Copy config files
   scp aida_widget_integration/config/__init__.py frappe@your-server:/home/frappe/frappe-bench/apps/aida_widget_integration/aida_widget_integration/config/
   scp aida_widget_integration/aida_widget_integration/config/aida_widget_integration.py frappe@your-server:/home/frappe/frappe-bench/apps/aida_widget_integration/aida_widget_integration/config/
   
   # Copy patch files
   scp aida_widget_integration/aida_widget_integration/patches/v1_0/create_aida_widget_settings.py frappe@your-server:/home/frappe/frappe-bench/apps/aida_widget_integration/aida_widget_integration/patches/v1_0/
   ```

3. **Install the app:**
   ```bash
   ssh frappe@your-server
   cd /home/frappe/frappe-bench
   bench --site [your-site-name] install-app aida_widget_integration
   bench --site [your-site-name] migrate
   bench restart
   ```

### Option 3: Git-based Deployment (Best Practice)

1. **Push your code to a Git repository:**
   ```bash
   # From your local machine
   cd aida_widget_integration
   git add .
   git commit -m "Complete app structure with all required files"
   git push origin main
   ```

2. **Clone/pull on the server:**
   ```bash
   ssh frappe@your-server
   cd /home/frappe/frappe-bench/apps
   
   # If first time:
   git clone [your-repo-url] aida_widget_integration
   
   # If updating:
   cd aida_widget_integration
   git pull origin main
   ```

3. **Install the app:**
   ```bash
   cd /home/frappe/frappe-bench
   bench --site [your-site-name] install-app aida_widget_integration
   bench --site [your-site-name] migrate
   bench restart
   ```

## Verification Steps

1. **Run the diagnostic script again:**
   ```bash
   cd /home/frappe/frappe-bench/apps/aida_widget_integration
   python3 diagnose_doctype.py
   ```
   
   You should see:
   ```
   ✓ All files found
   ✓ DocType JSON is valid
   ✓ modules.txt contains: Aida Widget Integration
   ```

2. **Check if the app is installed:**
   ```bash
   bench --site [your-site-name] list-apps
   ```
   
   You should see `aida_widget_integration` in the list.

3. **Verify DocType exists:**
   ```bash
   bench --site [your-site-name] console
   ```
   
   In the console:
   ```python
   import frappe
   frappe.db.exists('DocType', 'AIDA Widget Settings')
   # Should return 'AIDA Widget Settings'
   ```

## Troubleshooting

### If installation fails:

1. **Check app structure:**
   ```bash
   find /home/frappe/frappe-bench/apps/aida_widget_integration -name "*.json" -o -name "*.py" | head -10
   ```

2. **Check for errors:**
   ```bash
   tail -f /home/frappe/frappe-bench/logs/bench.log
   ```

3. **Force reinstall:**
   ```bash
   bench --site [your-site-name] uninstall-app aida_widget_integration --force
   bench --site [your-site-name] install-app aida_widget_integration
   bench --site [your-site-name] migrate
   ```

### If DocType still not found:

1. **Manually reload DocType:**
   ```bash
   bench --site [your-site-name] reload-doctype "AIDA Widget Settings"
   ```

2. **Clear cache:**
   ```bash
   bench --site [your-site-name] clear-cache
   bench --site [your-site-name] clear-website-cache
   ```

3. **Rebuild:**
   ```bash
   bench build
   bench restart
   ```

## Next Steps

After successful deployment:

1. Access your Mocxha site
2. Go to Setup → AIDA Widget Settings
3. Configure the widget settings
4. Test the chat widget functionality

## Support

If you continue to experience issues:

1. Run the diagnostic script and share the output
2. Check the Frappe logs for specific error messages
3. Verify all file permissions are correct
4. Ensure the Frappe bench is running the latest version