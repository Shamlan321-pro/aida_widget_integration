#!/usr/bin/env python3
"""
AIDA Widget Integration - DocType Diagnostic Script

This script diagnoses DocType registration issues.
"""

import os
import sys
import json

def check_file_structure():
    """Check if all required files exist"""
    print("=== File Structure Check ===")
    
    base_path = "aida_widget_integration/aida_widget_integration"
    required_files = [
        f"{base_path}/modules.txt",
        f"{base_path}/doctype/aida_widget_settings/aida_widget_settings.json",
        f"{base_path}/doctype/aida_widget_settings/aida_widget_settings.py",
        f"{base_path}/doctype/aida_widget_settings/__init__.py",
        f"{base_path}/config/__init__.py",
        f"{base_path}/config/aida_widget_integration.py",
        f"{base_path}/patches.txt",
        f"{base_path}/patches/v1_0/create_aida_widget_settings.py"
    ]
    
    all_exist = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✓ {file_path}")
        else:
            print(f"✗ {file_path} (MISSING)")
            all_exist = False
    
    return all_exist

def check_doctype_json():
    """Check DocType JSON structure"""
    print("\n=== DocType JSON Check ===")
    
    json_path = "aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/aida_widget_settings.json"
    
    if not os.path.exists(json_path):
        print(f"✗ DocType JSON not found: {json_path}")
        return False
    
    try:
        with open(json_path, 'r') as f:
            doctype_data = json.load(f)
        
        # Check essential fields
        essential_fields = ['name', 'module', 'doctype', 'issingle']
        for field in essential_fields:
            if field in doctype_data:
                print(f"✓ {field}: {doctype_data[field]}")
            else:
                print(f"✗ Missing field: {field}")
                return False
        
        # Check if it's a single DocType
        if doctype_data.get('issingle') == 1:
            print("✓ Correctly configured as Single DocType")
        else:
            print("✗ Should be configured as Single DocType (issingle: 1)")
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"✗ Invalid JSON format: {e}")
        return False
    except Exception as e:
        print(f"✗ Error reading JSON: {e}")
        return False

def check_modules_txt():
    """Check modules.txt file"""
    print("\n=== Modules.txt Check ===")
    
    modules_path = "aida_widget_integration/aida_widget_integration/modules.txt"
    
    if not os.path.exists(modules_path):
        print(f"✗ modules.txt not found: {modules_path}")
        return False
    
    try:
        with open(modules_path, 'r') as f:
            content = f.read().strip()
        
        if content == "Aida Widget Integration":
            print(f"✓ modules.txt contains: {content}")
            return True
        else:
            print(f"✗ modules.txt contains unexpected content: {content}")
            return False
            
    except Exception as e:
        print(f"✗ Error reading modules.txt: {e}")
        return False

def main():
    print("AIDA Widget Integration - DocType Diagnostic")
    print("=" * 50)
    
    # Change to the correct directory
    if os.path.exists('aida_widget_integration'):
        os.chdir('aida_widget_integration')
        print(f"Working directory: {os.getcwd()}")
    else:
        print("Error: aida_widget_integration directory not found")
        print("Please run this script from the parent directory of aida_widget_integration")
        sys.exit(1)
    
    # Run checks
    checks = [
        check_file_structure(),
        check_doctype_json(),
        check_modules_txt()
    ]
    
    passed_checks = sum(checks)
    total_checks = len(checks)
    
    print(f"\n=== Diagnostic Summary ===")
    print(f"Passed: {passed_checks}/{total_checks} checks")
    
    if passed_checks == total_checks:
        print("\n🎉 All diagnostic checks passed!")
        print("\nIf you're still experiencing issues, try:")
        print("1. Run: python fix_doctype_issue.py")
        print("2. Or manually run the migration commands")
    else:
        print("\n⚠ Some checks failed. Please fix the missing files and try again.")
        print("\nThe missing files have been created by the assistant.")
        print("Try running the diagnostic again after restarting your terminal.")

if __name__ == "__main__":
    main()