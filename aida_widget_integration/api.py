import frappe
import requests
import json
from frappe import _
from frappe.utils import cstr

@frappe.whitelist(allow_guest=True)
def chat_with_aida(message, session_id=None, user_hash=None, erp_credentials=None):
    """
    API endpoint to communicate with AIDA chat server
    This acts as a bridge between the widget and the main AIDA API server
    """
    try:
        # Default API server URL (can be configured)
        api_server_url = frappe.db.get_single_value('AIDA Widget Settings', 'api_server_url') or 'https://aida.mocxha.com'
        
        # Prepare payload for AIDA API - map 'message' to 'user_input' as expected by the server
        payload = {
            'user_input': message,  # The AIDA API server expects 'user_input', not 'message'
            'session_id': session_id
        }
        
        # Add user_hash if provided (for session management)
        if user_hash:
            payload['user_hash'] = user_hash
        
        # Add ERP credentials if provided
        if erp_credentials:
            if isinstance(erp_credentials, str):
                erp_credentials = json.loads(erp_credentials)
            payload['erp_credentials'] = erp_credentials
        
        # Make request to AIDA API server
        response = requests.post(
            f"{api_server_url}/chat",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            frappe.log_error(
                f"AIDA API Error: {response.status_code} - {response.text}",
                "AIDA Widget API Error"
            )
            return {
                'error': True,
                'message': f'API server returned error: {response.status_code}'
            }
            
    except requests.exceptions.ConnectionError:
        frappe.log_error(
            "Could not connect to AIDA API server",
            "AIDA Widget Connection Error"
        )
        return {
            'error': True,
            'message': 'Could not connect to AIDA API server. Please check if the server is running.'
        }
    except requests.exceptions.Timeout:
        frappe.log_error(
            "AIDA API request timed out",
            "AIDA Widget Timeout Error"
        )
        return {
            'error': True,
            'message': 'Request timed out. Please try again.'
        }
    except Exception as e:
        frappe.log_error(
            f"Unexpected error in AIDA widget: {str(e)}",
            "AIDA Widget Error"
        )
        return {
            'error': True,
            'message': 'An unexpected error occurred. Please try again.'
        }

@frappe.whitelist()
def get_widget_settings():
    """
    Get widget configuration settings
    """
    try:
        settings = frappe.get_single('AIDA Widget Settings')
        return {
            'api_server_url': settings.api_server_url or 'http://localhost:5000',
            'widget_enabled': settings.widget_enabled,
            'auto_open': settings.auto_open,
            'welcome_message': settings.welcome_message,
            'position': getattr(settings, 'position', 'bottom-right'),
            'theme': getattr(settings, 'theme', 'light'),
            'show_user_avatar': getattr(settings, 'show_user_avatar', False),
            'user_avatar_url': getattr(settings, 'user_avatar_url', ''),
            'sound_notifications': getattr(settings, 'sound_notifications', False),
            'conversation_logging': getattr(settings, 'conversation_logging', True),
            'connection_timeout': getattr(settings, 'connection_timeout', 30),
            'max_retries': getattr(settings, 'max_retries', 3),
            'debug_mode': getattr(settings, 'debug_mode', False)
        }
    except:
        # Return defaults if settings don't exist
        return {
            'api_server_url': 'https://aida.mocxha.com',
            'widget_enabled': True,
            'auto_open': False,
            'welcome_message': 'Hello! I\'m AIDA, your AI assistant. How can I help you today?',
            'position': 'bottom-right',
            'theme': 'light',
            'show_user_avatar': False,
            'user_avatar_url': '',
            'sound_notifications': False,
            'conversation_logging': True,
            'connection_timeout': 30,
            'max_retries': 3,
            'debug_mode': False
        }

@frappe.whitelist()
def save_widget_settings(api_server_url=None, widget_enabled=None, auto_open=None, welcome_message=None):
    """
    Save widget configuration settings
    """
    try:
        settings = frappe.get_single('AIDA Widget Settings')
        
        if api_server_url is not None:
            settings.api_server_url = api_server_url
        if widget_enabled is not None:
            settings.widget_enabled = widget_enabled
        if auto_open is not None:
            settings.auto_open = auto_open
        if welcome_message is not None:
            settings.welcome_message = welcome_message
            
        settings.save()
        frappe.db.commit()
        
        return {'success': True, 'message': 'Settings saved successfully'}
    except Exception as e:
        frappe.log_error(
            f"Error saving widget settings: {str(e)}",
            "AIDA Widget Settings Error"
        )
        return {'error': True, 'message': 'Failed to save settings'}

@frappe.whitelist()
def get_user_info():
    """
    Get current user information for the widget
    """
    return {
        'user': frappe.session.user,
        'full_name': frappe.get_value('User', frappe.session.user, 'full_name'),
        'site_url': frappe.utils.get_url(),
        'user_image': frappe.get_value('User', frappe.session.user, 'user_image')
    }

@frappe.whitelist()
def test_connection(api_server_url=None):
    """
    Test connection to AIDA API server
    """
    try:
        # Use provided URL or get from settings
        if not api_server_url:
            api_server_url = frappe.db.get_single_value('AIDA Widget Settings', 'api_server_url') or 'https://aida.mocxha.com'
        
        # Test health endpoint
        response = requests.get(
            f"{api_server_url}/health",
            timeout=10
        )
        
        if response.status_code == 200:
            try:
                data = response.json()
                return {
                    'success': True,
                    'message': 'Connection successful',
                    'server_status': data.get('status', 'unknown'),
                    'server_time': data.get('timestamp', 'unknown')
                }
            except:
                return {
                    'success': True,
                    'message': 'Connection successful (non-JSON response)',
                    'response_text': response.text[:100]
                }
        else:
            return {
                'success': False,
                'message': f'Server returned status code: {response.status_code}',
                'response_text': response.text[:100]
            }
            
    except requests.exceptions.ConnectionError:
        return {
            'success': False,
            'message': 'Could not connect to AIDA API server. Please check if the server is running and the URL is correct.'
        }
    except requests.exceptions.Timeout:
        return {
            'success': False,
            'message': 'Connection timed out. Please check the server URL and network connectivity.'
        }
    except Exception as e:
        frappe.log_error(
            f"Test connection error: {str(e)}",
            "AIDA Widget Test Connection Error"
        )
        return {
            'success': False,
            'message': f'Connection test failed: {str(e)}'
        }

@frappe.whitelist()
def initialize_session(erpnext_url=None, username=None, password=None, user_hash=None):
    """
    Initialize a session with the AIDA API server
    """
    try:
        # Get API server URL from settings
        api_server_url = frappe.db.get_single_value('AIDA Widget Settings', 'api_server_url') or 'https://aida.mocxha.com'
        
        # Use current session info if not provided
        if not erpnext_url:
            erpnext_url = frappe.utils.get_url()
        if not username:
            username = frappe.session.user
        
        # Validate that password is provided
        if not password:
            return {
                'error': True,
                'message': 'Password is required for session initialization. Please configure your credentials in the widget settings.'
            }
        
        # Prepare payload with actual credentials
        payload = {
            'erpnext_url': erpnext_url,
            'username': username,
            'password': password,
            'site_base_url': erpnext_url,
            'restore_session': True
        }
        
        # Add user_hash if provided
        if user_hash:
            payload['user_hash'] = user_hash
        
        # Make request to AIDA API server
        response = requests.post(
            f"{api_server_url}/init_session",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                'success': True,
                'session_id': result.get('session_id'),
                'message': result.get('message', 'Session initialized successfully'),
                'restored': result.get('restored', False)
            }
        else:
            # Log the detailed error but return a user-friendly message
            error_text = response.text if response.text else 'Unknown error'
            frappe.log_error(
                f"AIDA Session Init Error: {response.status_code} - {error_text}",
                "AIDA Widget Session Error"
            )
            return {
                'error': True,
                'message': f'Session initialization failed. Please check your AIDA server configuration and ERPNext credentials.'
            }
            
    except requests.exceptions.ConnectionError:
        frappe.log_error(
            "Could not connect to AIDA API server for session init",
            "AIDA Widget Connection Error"
        )
        return {
            'error': True,
            'message': 'Could not connect to AIDA API server. Please check if the server is running.'
        }
    except requests.exceptions.Timeout:
        frappe.log_error(
            "AIDA session init request timed out",
            "AIDA Widget Timeout Error"
        )
        return {
            'error': True,
            'message': 'Session initialization timed out. Please try again.'
        }
    except Exception as e:
        frappe.log_error(
            f"Unexpected error in AIDA session init: {str(e)}",
            "AIDA Widget Session Error"
        )
        return {
            'error': True,
            'message': 'An unexpected error occurred during session initialization.'
        }

@frappe.whitelist()
def check_session_status(session_id):
    """
    Check if a session is still active on the AIDA API server
    """
    try:
        # Get API server URL from settings
        api_server_url = frappe.db.get_single_value('AIDA Widget Settings', 'api_server_url') or 'http://localhost:5000'
        
        # Make request to AIDA API server session status endpoint
        response = requests.get(
            f"{api_server_url}/session_status/{session_id}",
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                'active': result.get('active', False),
                'last_access': result.get('last_access'),
                'message': 'Session status checked successfully'
            }
        else:
            return {
                'active': False,
                'message': f'Session check failed with status: {response.status_code}'
            }
            
    except requests.exceptions.ConnectionError:
        frappe.log_error(
            "Could not connect to AIDA API server for session status check",
            "AIDA Widget Connection Error"
        )
        return {
            'error': True,
            'message': 'Could not connect to AIDA API server. Please check if the server is running.'
        }
    except requests.exceptions.Timeout:
        frappe.log_error(
            "AIDA session status check timed out",
            "AIDA Widget Timeout Error"
        )
        return {
            'error': True,
            'message': 'Session status check timed out. Please try again.'
        }
    except Exception as e:
        frappe.log_error(
            f"Unexpected error in AIDA session status check: {str(e)}",
            "AIDA Widget Session Error"
        )
        return {
            'error': True,
            'message': 'An unexpected error occurred during session status check.'
        }

@frappe.whitelist()
def health_check():
    """
    Health check endpoint for the widget
    """
    return {
        'status': 'ok',
        'timestamp': frappe.utils.now(),
        'user': frappe.session.user
    }