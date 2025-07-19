import frappe
from frappe.model.utils.rename_field import rename_field
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def execute():
    """Create AIDA Widget Settings DocType if it doesn't exist"""
    
    # Check if DocType exists
    if not frappe.db.exists('DocType', 'AIDA Widget Settings'):
        print("Creating AIDA Widget Settings DocType...")
        
        # Import and create the DocType
        from frappe.modules.import_file import import_file_by_path
        import os
        
        # Get the path to the DocType JSON file
        doctype_path = frappe.get_app_path('aida_widget_integration', 'aida_widget_integration', 'doctype', 'aida_widget_settings', 'aida_widget_settings.json')
        
        if os.path.exists(doctype_path):
            import_file_by_path(doctype_path)
            print("AIDA Widget Settings DocType created successfully")
        else:
            print(f"DocType JSON file not found at: {doctype_path}")
    else:
        print("AIDA Widget Settings DocType already exists")
    
    # Create default settings document if it doesn't exist
    if not frappe.db.exists('AIDA Widget Settings', 'AIDA Widget Settings'):
        print("Creating default AIDA Widget Settings document...")
        
        doc = frappe.new_doc('AIDA Widget Settings')
        doc.widget_enabled = 1
        doc.auto_open = 0
        doc.api_server_url = 'https://aida.mocxha.com'
        doc.welcome_message = "Hello! I'm AIDA, your AI assistant. How can I help you today?"
        doc.widget_position = 'Bottom Right'
        doc.widget_theme = 'Default'
        doc.show_user_avatar = 1
        doc.user_avatar_url = ''
        doc.sound_notifications = 0
        doc.connection_timeout = 30
        doc.max_retries = 3
        doc.debug_mode = 0
        doc.conversation_logging = 1
        
        doc.insert(ignore_permissions=True)
        print("Default AIDA Widget Settings document created")
    else:
        print("AIDA Widget Settings document already exists")