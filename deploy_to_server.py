#!/usr/bin/env python3
"""
AIDA Widget Integration - Server Deployment Script

This script copies the local app files to the server environment
where the diagnostic script is running.
"""

import os
import shutil
import sys
from pathlib import Path

def create_directory_structure(base_path):
    """Create the required directory structure"""
    directories = [
        'aida_widget_integration/aida_widget_integration',
        'aida_widget_integration/aida_widget_integration/doctype',
        'aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings',
        'aida_widget_integration/aida_widget_integration/config',
        'aida_widget_integration/aida_widget_integration/patches',
        'aida_widget_integration/aida_widget_integration/patches/v1_0'
    ]
    
    for directory in directories:
        dir_path = os.path.join(base_path, directory)
        os.makedirs(dir_path, exist_ok=True)
        print(f"✓ Created directory: {dir_path}")

def copy_files(source_base, target_base):
    """Copy files from local structure to server structure"""
    file_mappings = [
        # Source -> Target mappings
        ('aida_widget_integration/aida_widget_integration/modules.txt', 
         'aida_widget_integration/aida_widget_integration/modules.txt'),
        
        ('aida_widget_integration/aida_widget_integration/patches.txt', 
         'aida_widget_integration/aida_widget_integration/patches.txt'),
        
        ('aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/aida_widget_settings.json', 
         'aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/aida_widget_settings.json'),
        
        ('aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/aida_widget_settings.py', 
         'aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/aida_widget_settings.py'),
        
        ('aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/__init__.py', 
         'aida_widget_integration/aida_widget_integration/doctype/aida_widget_settings/__init__.py'),
        
        ('aida_widget_integration/config/__init__.py', 
         'aida_widget_integration/aida_widget_integration/config/__init__.py'),
        
        ('aida_widget_integration/aida_widget_integration/config/aida_widget_integration.py', 
         'aida_widget_integration/aida_widget_integration/config/aida_widget_integration.py'),
        
        ('aida_widget_integration/aida_widget_integration/patches/v1_0/create_aida_widget_settings.py', 
         'aida_widget_integration/aida_widget_integration/patches/v1_0/create_aida_widget_settings.py')
    ]
    
    for source_rel, target_rel in file_mappings:
        source_path = os.path.join(source_base, source_rel)
        target_path = os.path.join(target_base, target_rel)
        
        if os.path.exists(source_path):
            # Ensure target directory exists
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            shutil.copy2(source_path, target_path)
            print(f"✓ Copied: {source_rel} -> {target_rel}")
        else:
            print(f"✗ Source file not found: {source_path}")

def main():
    print("AIDA Widget Integration - Server Deployment")
    print("=" * 50)
    
    # Get paths
    current_dir = os.getcwd()
    print(f"Current directory: {current_dir}")
    
    # Ask for target directory
    target_dir = input("Enter target directory (e.g., /home/frappe/frappe-bench/apps): ").strip()
    if not target_dir:
        print("Target directory is required!")
        sys.exit(1)
    
    if not os.path.exists(target_dir):
        print(f"Target directory does not exist: {target_dir}")
        sys.exit(1)
    
    print(f"\nDeploying to: {target_dir}")
    
    # Create directory structure
    print("\n=== Creating Directory Structure ===")
    create_directory_structure(target_dir)
    
    # Copy files
    print("\n=== Copying Files ===")
    copy_files(current_dir, target_dir)
    
    print("\n=== Deployment Complete ===")
    print("Next steps:")
    print("1. Run the diagnostic script again to verify all files are in place")
    print("2. Install the app: bench --site [site-name] install-app aida_widget_integration")
    print("3. Run migration: bench --site [site-name] migrate")

if __name__ == "__main__":
    main()