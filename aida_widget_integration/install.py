import frappe
from frappe import _

def after_install():
    """Called after the app is installed"""
    create_default_settings()
    print("AIDA Widget Integration app installed successfully!")

def create_default_settings():
    """Create default AIDA Widget Settings"""
    try:
        # Check if settings already exist
        if frappe.db.exists('AIDA Widget Settings', 'AIDA Widget Settings'):
            print("AIDA Widget Settings already exist, skipping creation.")
            return
        
        # Create new settings document
        settings = frappe.get_doc({
            'doctype': 'AIDA Widget Settings',
            'name': 'AIDA Widget Settings',
            'widget_enabled': 1,
            'auto_open': 0,
            'api_server_url': 'https://aida.mocxha.com',
            'welcome_message': "Hello! I'm AIDA, your AI assistant. How can I help you today?",
            'widget_position': 'Bottom Right',
            'widget_theme': 'Default',
            'show_user_avatar': 1,
            'enable_sound_notifications': 0,
            'connection_timeout': 30,
            'max_retries': 3,
            'debug_mode': 0,
            'log_conversations': 1
        })
        
        settings.insert(ignore_permissions=True)
        frappe.db.commit()
        
        print("Default AIDA Widget Settings created successfully.")
        
    except Exception as e:
        frappe.log_error(
            f"Error creating default AIDA Widget Settings: {str(e)}",
            "AIDA Widget Installation Error"
        )
        print(f"Error creating default settings: {str(e)}")

def before_uninstall():
    """Called before the app is uninstalled"""
    try:
        # Clean up any cached data
        frappe.cache().delete_key("aida_widget_settings")
        print("AIDA Widget cache cleared.")
    except Exception as e:
        print(f"Error during cleanup: {str(e)}")

def after_migrate():
    """Called after migration"""
    # Ensure settings exist after migration
    create_default_settings()