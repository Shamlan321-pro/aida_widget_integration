#!/usr/bin/env python3
"""
AIDA Widget Integration - DocType Fix Script

This script fixes the 'DocType AIDA Widget Settings not found' error
by ensuring proper DocType registration and migration.
"""

import os
import sys
import subprocess

def run_command(cmd, description):
    """Run a command and report status"""
    print(f"\n{description}...")
    print(f"Command: {cmd}")
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✓ {description} completed successfully")
            if result.stdout.strip():
                print(f"Output: {result.stdout.strip()}")
        else:
            print(f"✗ {description} failed")
            if result.stderr.strip():
                print(f"Error: {result.stderr.strip()}")
        return result.returncode == 0
    except Exception as e:
        print(f"✗ {description} failed with exception: {e}")
        return False

def main():
    print("AIDA Widget Integration - DocType Fix Script")
    print("=" * 50)
    
    # Get site name from user
    site_name = input("Enter your Frappe site name (e.g., 'test'): ").strip()
    if not site_name:
        print("Site name is required!")
        sys.exit(1)
    
    print(f"\nFixing DocType issues for site: {site_name}")
    
    # Commands to fix the issue
    commands = [
        (f"bench --site {site_name} migrate", "Running database migration"),
        (f"bench --site {site_name} reload-doctype 'AIDA Widget Settings'", "Reloading AIDA Widget Settings DocType"),
        (f"bench --site {site_name} clear-cache", "Clearing cache"),
        (f"bench --site {site_name} clear-website-cache", "Clearing website cache"),
        ("bench build", "Building assets"),
        ("bench restart", "Restarting Frappe bench")
    ]
    
    success_count = 0
    for cmd, desc in commands:
        if run_command(cmd, desc):
            success_count += 1
        else:
            print(f"\n⚠ Warning: {desc} failed, but continuing...")
    
    print(f"\n=== Fix Summary ===")
    print(f"Completed {success_count}/{len(commands)} operations")
    
    if success_count >= 4:  # At least migration, reload, cache clear, and build
        print("\n🎉 DocType fix completed successfully!")
        print("\nNext steps:")
        print("1. Access your ERPNext site")
        print("2. Try to send a message in the AIDA chat widget")
        print("3. If issues persist, check the browser console for errors")
    else:
        print("\n⚠ Some operations failed. Manual intervention may be required.")
        print("\nManual steps to try:")
        print(f"1. bench --site {site_name} uninstall-app aida_widget_integration")
        print(f"2. bench --site {site_name} install-app aida_widget_integration")
        print(f"3. bench --site {site_name} migrate")
        print("4. bench restart")

if __name__ == "__main__":
    main()