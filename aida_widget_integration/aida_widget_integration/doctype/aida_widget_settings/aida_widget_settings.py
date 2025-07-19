# Copyright (c) 2024, op and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class AidaWidgetSettings(Document):
    def validate(self):
        """Validate the settings before saving"""
        # Validate API server URL format
        if self.api_server_url:
            if not (self.api_server_url.startswith('http://') or self.api_server_url.startswith('https://')):
                frappe.throw("API Server URL must start with http:// or https://")
        
        # Validate timeout values
        if self.connection_timeout and self.connection_timeout < 5:
            frappe.throw("Connection timeout must be at least 5 seconds")
        
        if self.max_retries and self.max_retries < 0:
            frappe.throw("Max retries cannot be negative")
    
    def on_update(self):
        """Called after the document is updated"""
        # Clear cache to ensure new settings are loaded
        frappe.cache().delete_key("aida_widget_settings")
        
        # Log the settings update
        if self.debug_mode:
            frappe.log_error(
                f"AIDA Widget Settings updated by {frappe.session.user}",
                "AIDA Widget Settings Update"
            )

@frappe.whitelist()
def get_settings():
    """Get AIDA Widget Settings with caching"""
    settings = frappe.cache().get_value("aida_widget_settings")
    
    if not settings:
        try:
            doc = frappe.get_single('AIDA Widget Settings')
            settings = {
                'widget_enabled': doc.widget_enabled,
                'auto_open': doc.auto_open,
                'api_server_url': doc.api_server_url,
                'welcome_message': doc.welcome_message,
                'widget_position': doc.widget_position,
                'widget_theme': doc.widget_theme,
                'show_user_avatar': doc.show_user_avatar,
                'user_avatar_url': getattr(doc, 'user_avatar_url', ''),
                'sound_notifications': getattr(doc, 'sound_notifications', False),
                'connection_timeout': doc.connection_timeout,
                'max_retries': doc.max_retries,
                'debug_mode': doc.debug_mode,
                'conversation_logging': getattr(doc, 'conversation_logging', True)
            }
            
            # Cache for 5 minutes
            frappe.cache().set_value("aida_widget_settings", settings, expires_in_sec=300)
        except:
            # Return defaults if settings don't exist
            settings = {
                'widget_enabled': True,
                'auto_open': False,
                'api_server_url': 'https://aida.mocxha.com',
                'welcome_message': 'Hello! I\'m AIDA, your AI assistant. How can I help you today?',
                'widget_position': 'Bottom Right',
                'widget_theme': 'Default',
                'show_user_avatar': True,
                'user_avatar_url': '',
                'sound_notifications': False,
                'connection_timeout': 30,
                'max_retries': 3,
                'debug_mode': False,
                'conversation_logging': True
            }
    
    return settings