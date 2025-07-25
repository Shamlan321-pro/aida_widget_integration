#!/usr/bin/env python3
"""
AIDA Widget Integration - Installation Validation Script

This script validates that the AIDA Widget Integration app is properly installed
and configured in a Frappe/ERPNext environment.

Usage:
    python validate_installation.py
    
Or from within Frappe bench:
    bench --site [site-name] execute aida_widget_integration.validate_installation.main
"""

import os
import sys
import json
import requests
from urllib.parse import urljoin

try:
    import frappe
    FRAPPE_AVAILABLE = True
except ImportError:
    FRAPPE_AVAILABLE = False
    print("Warning: Frappe not available. Running basic validation only.")

def check_file_exists(file_path, description):
    """Check if a file exists and report status"""
    if os.path.exists(file_path):
        print(f"✓ {description}: {file_path}")
        return True
    else:
        print(f"✗ {description}: {file_path} (NOT FOUND)")
        return False

def check_directory_structure():
    """Validate the app directory structure"""
    print("\n=== Directory Structure Validation ===")
    
    base_path = os.path.dirname(os.path.abspath(__file__))
    app_path = os.path.join(base_path, 'aida_widget_integration')
    
    required_files = [
        ('hooks.py', os.path.join(app_path, 'hooks.py')),
        ('__init__.py', os.path.join(app_path, '__init__.py')),
        ('api.py', os.path.join(app_path, 'api.py')),
        ('install.py', os.path.join(app_path, 'install.py')),
        ('modules.txt', os.path.join(app_path, 'modules.txt')),
        ('Widget CSS', os.path.join(app_path, 'public', 'css', 'aida_chat_widget.css')),
        ('Widget JS', os.path.join(app_path, 'public', 'js', 'aida_chat_widget.js')),
        ('DocType JSON', os.path.join(app_path, 'aida_widget_integration', 'doctype', 'aida_widget_settings', 'aida_widget_settings.json')),
        ('DocType Python', os.path.join(app_path, 'aida_widget_integration', 'doctype', 'aida_widget_settings', 'aida_widget_settings.py')),
    ]
    
    all_files_exist = True
    for description, file_path in required_files:
        if not check_file_exists(file_path, description):
            all_files_exist = False
    
    return all_files_exist

def validate_hooks_configuration():
    """Validate hooks.py configuration"""
    print("\n=== Hooks Configuration Validation ===")
    
    try:
        base_path = os.path.dirname(os.path.abspath(__file__))
        hooks_path = os.path.join(base_path, 'aida_widget_integration', 'hooks.py')
        
        with open(hooks_path, 'r', encoding='utf-8') as f:
            hooks_content = f.read()
        
        # Check for required configurations
        checks = [
            ('App includes CSS', 'app_include_css' in hooks_content and 'aida_chat_widget.css' in hooks_content),
            ('App includes JS', 'app_include_js' in hooks_content and 'aida_chat_widget.js' in hooks_content),
            ('After install hook', 'after_install' in hooks_content),
            ('Before uninstall hook', 'before_uninstall' in hooks_content),
        ]
        
        all_checks_passed = True
        for description, check_result in checks:
            if check_result:
                print(f"✓ {description}")
            else:
                print(f"✗ {description}")
                all_checks_passed = False
        
        return all_checks_passed
        
    except Exception as e:
        print(f"✗ Error reading hooks.py: {e}")
        return False

def validate_doctype_structure():
    """Validate DocType JSON structure"""
    print("\n=== DocType Structure Validation ===")
    
    try:
        base_path = os.path.dirname(os.path.abspath(__file__))
        doctype_path = os.path.join(
            base_path, 'aida_widget_integration', 'aida_widget_integration', 
            'doctype', 'aida_widget_settings', 'aida_widget_settings.json'
        )
        
        with open(doctype_path, 'r', encoding='utf-8') as f:
            doctype_data = json.load(f)
        
        # Check required fields
        required_fields = [
            'widget_enabled', 'auto_open', 'api_server_url', 'welcome_message',
            'widget_position', 'widget_theme', 'user_avatar_url', 'sound_notifications',
            'connection_timeout', 'max_retries', 'debug_mode', 'conversation_logging'
        ]
        
        existing_fields = [field['fieldname'] for field in doctype_data.get('fields', [])]
        
        all_fields_present = True
        for field in required_fields:
            if field in existing_fields:
                print(f"✓ Field: {field}")
            else:
                print(f"✗ Field: {field} (MISSING)")
                all_fields_present = False
        
        return all_fields_present
        
    except Exception as e:
        print(f"✗ Error reading DocType JSON: {e}")
        return False

def test_api_server_connection():
    """Test connection to AIDA API server"""
    print("\n=== API Server Connection Test ===")
    
    api_urls = [
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ]
    
    for api_url in api_urls:
        try:
            health_url = urljoin(api_url, '/health')
            response = requests.get(health_url, timeout=5)
            
            if response.status_code == 200:
                print(f"✓ API Server reachable at: {api_url}")
                try:
                    data = response.json()
                    print(f"  Status: {data.get('status', 'Unknown')}")
                except:
                    print(f"  Response: {response.text[:100]}")
                return True
            else:
                print(f"✗ API Server at {api_url} returned status: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"✗ Cannot connect to API Server at: {api_url}")
        except requests.exceptions.Timeout:
            print(f"✗ Timeout connecting to API Server at: {api_url}")
        except Exception as e:
            print(f"✗ Error connecting to API Server at {api_url}: {e}")
    
    return False

def validate_frappe_integration():
    """Validate Frappe-specific integration"""
    if not FRAPPE_AVAILABLE:
        print("\n=== Frappe Integration Validation ===")
        print("⚠ Frappe not available - skipping Frappe-specific tests")
        return True
    
    print("\n=== Frappe Integration Validation ===")
    
    try:
        # Check if app is installed
        installed_apps = frappe.get_installed_apps()
        if 'aida_widget_integration' in installed_apps:
            print("✓ App is installed in Frappe")
        else:
            print("✗ App is not installed in Frappe")
            return False
        
        # Check if DocType exists
        if frappe.db.exists('DocType', 'AIDA Widget Settings'):
            print("✓ AIDA Widget Settings DocType exists")
        else:
            print("✗ AIDA Widget Settings DocType not found")
            return False
        
        # Test API endpoints
        try:
            from aida_widget_integration.aida_widget_integration.doctype.aida_widget_settings.aida_widget_settings import get_settings
            settings = get_settings()
            print(f"✓ Settings retrieval works: {len(settings)} settings loaded")
        except Exception as e:
            print(f"✗ Error retrieving settings: {e}")
            return False
        
        # Test API bridge functions
        try:
            from aida_widget_integration.api import test_connection, health_check
            health_result = health_check()
            if health_result.get('status') == 'ok':
                print("✓ Health check endpoint works")
            else:
                print("✗ Health check endpoint failed")
                return False
        except Exception as e:
            print(f"✗ Error testing API endpoints: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"✗ Error in Frappe integration validation: {e}")
        return False

def validate_javascript_syntax():
    """Basic JavaScript syntax validation"""
    print("\n=== JavaScript Syntax Validation ===")
    
    try:
        base_path = os.path.dirname(os.path.abspath(__file__))
        js_path = os.path.join(base_path, 'aida_widget_integration', 'public', 'js', 'aida_chat_widget.js')
        
        with open(js_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
        
        # Basic syntax checks
        checks = [
            ('Class definition', 'class AidaChatWidget' in js_content),
            ('Constructor method', 'constructor(' in js_content),
            ('Init method', 'init(' in js_content),
            ('Send message method', 'sendMessage(' in js_content),
            ('Frappe call usage', 'frappe.call(' in js_content),
            ('Event listeners', 'addEventListener(' in js_content),
        ]
        
        all_checks_passed = True
        for description, check_result in checks:
            if check_result:
                print(f"✓ {description}")
            else:
                print(f"✗ {description}")
                all_checks_passed = False
        
        return all_checks_passed
        
    except Exception as e:
        print(f"✗ Error reading JavaScript file: {e}")
        return False

def main():
    """Main validation function"""
    print("AIDA Widget Integration - Installation Validation")
    print("=" * 50)
    
    validation_results = [
        check_directory_structure(),
        validate_hooks_configuration(),
        validate_doctype_structure(),
        validate_javascript_syntax(),
        test_api_server_connection(),
        validate_frappe_integration(),
    ]
    
    print("\n" + "=" * 50)
    print("VALIDATION SUMMARY")
    print("=" * 50)
    
    passed_tests = sum(validation_results)
    total_tests = len(validation_results)
    
    if passed_tests == total_tests:
        print(f"✓ All {total_tests} validation tests PASSED")
        print("\n🎉 AIDA Widget Integration is properly installed and configured!")
        print("\nNext steps:")
        print("1. Restart your Frappe bench: bench restart")
        print("2. Clear cache: bench --site [site-name] clear-cache")
        print("3. Build assets: bench build")
        print("4. Access ERPNext and look for the floating chat widget")
        return True
    else:
        print(f"✗ {total_tests - passed_tests} out of {total_tests} validation tests FAILED")
        print("\n❌ Please fix the issues above before using the widget.")
        print("\nTroubleshooting:")
        print("1. Ensure all files are properly created")
        print("2. Check that the AIDA API server is running")
        print("3. Verify Frappe app installation")
        print("4. Review the installation guide in INSTALLATION.md")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)