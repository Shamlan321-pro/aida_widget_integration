import frappe
import unittest
import json
from unittest.mock import patch, MagicMock
from aida_widget_integration.api import chat_with_aida, get_widget_settings, save_widget_settings

class TestAidaWidget(unittest.TestCase):
    
    def setUp(self):
        """Set up test environment"""
        self.test_message = "Hello, AIDA!"
        self.test_session_id = "test_session_123"
        self.test_user_hash = "test_hash_456"
        self.test_credentials = {
            "url": "https://test.mocxha.com",
            "username": "test_user",
            "password": "test_password"
        }
    
    @patch('aida_widget_integration.api.requests.post')
    def test_chat_with_aida_success(self, mock_post):
        """Test successful chat with AIDA API"""
        # Mock successful API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'response': 'Hello! How can I help you?',
            'session_id': 'new_session_789'
        }
        mock_post.return_value = mock_response
        
        # Test the function
        result = chat_with_aida(
            message=self.test_message,
            session_id=self.test_session_id,
            user_hash=self.test_user_hash,
            erp_credentials=json.dumps(self.test_credentials)
        )
        
        # Assertions
        self.assertIsInstance(result, dict)
        self.assertEqual(result['response'], 'Hello! How can I help you?')
        self.assertEqual(result['session_id'], 'new_session_789')
        
        # Verify API call was made correctly
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        self.assertIn('/chat', call_args[0][0])
        
    @patch('aida_widget_integration.api.requests.post')
    def test_chat_with_aida_connection_error(self, mock_post):
        """Test connection error handling"""
        # Mock connection error
        mock_post.side_effect = Exception("Connection refused")
        
        # Test the function
        result = chat_with_aida(
            message=self.test_message,
            session_id=self.test_session_id,
            user_hash=self.test_user_hash
        )
        
        # Assertions
        self.assertIsInstance(result, dict)
        self.assertTrue(result.get('error'))
        self.assertIn('error', result.get('message', '').lower())
    
    @patch('aida_widget_integration.api.requests.post')
    def test_chat_with_aida_api_error(self, mock_post):
        """Test API error response handling"""
        # Mock API error response
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        mock_post.return_value = mock_response
        
        # Test the function
        result = chat_with_aida(
            message=self.test_message,
            session_id=self.test_session_id,
            user_hash=self.test_user_hash
        )
        
        # Assertions
        self.assertIsInstance(result, dict)
        self.assertTrue(result.get('error'))
        self.assertIn('500', result.get('message', ''))
    
    def test_get_widget_settings_default(self):
        """Test getting default widget settings"""
        # Test when no settings exist
        result = get_widget_settings()
        
        # Assertions
        self.assertIsInstance(result, dict)
        self.assertIn('api_server_url', result)
        self.assertIn('widget_enabled', result)
        self.assertEqual(result['api_server_url'], 'https://aida.mocxha.com')
        self.assertTrue(result['widget_enabled'])
    
    @patch('frappe.get_single')
    def test_get_widget_settings_from_db(self, mock_get_single):
        """Test getting widget settings from database"""
        # Mock settings document
        mock_settings = MagicMock()
        mock_settings.api_server_url = 'http://custom-server:8000'
        mock_settings.widget_enabled = True
        mock_settings.auto_open = False
        mock_settings.welcome_message = 'Custom welcome message'
        mock_get_single.return_value = mock_settings
        
        # Test the function
        result = get_widget_settings()
        
        # Assertions
        self.assertIsInstance(result, dict)
        self.assertEqual(result['api_server_url'], 'http://custom-server:8000')
        self.assertTrue(result['widget_enabled'])
        self.assertFalse(result['auto_open'])
        self.assertEqual(result['welcome_message'], 'Custom welcome message')
    
    @patch('frappe.get_single')
    @patch('frappe.db.commit')
    def test_save_widget_settings(self, mock_commit, mock_get_single):
        """Test saving widget settings"""
        # Mock settings document
        mock_settings = MagicMock()
        mock_get_single.return_value = mock_settings
        
        # Test the function
        result = save_widget_settings(
            api_server_url='http://new-server:9000',
            widget_enabled=False,
            welcome_message='New welcome message'
        )
        
        # Assertions
        self.assertIsInstance(result, dict)
        self.assertTrue(result.get('success'))
        self.assertEqual(result.get('message'), 'Settings saved successfully')
        
        # Verify settings were updated
        self.assertEqual(mock_settings.api_server_url, 'http://new-server:9000')
        self.assertFalse(mock_settings.widget_enabled)
        self.assertEqual(mock_settings.welcome_message, 'New welcome message')
        
        # Verify save and commit were called
        mock_settings.save.assert_called_once()
        mock_commit.assert_called_once()

class TestWidgetJavaScript(unittest.TestCase):
    """Test JavaScript widget functionality (conceptual tests)"""
    
    def test_user_hash_generation(self):
        """Test user hash generation logic"""
        # This would test the JavaScript hash generation if we had a JS test runner
        # For now, we'll test the concept
        
        url = "https://test.mocxha.com"
        username = "test_user"
        hash_string = f"{url}:{username}"
        
        # Simple hash function (similar to JS implementation)
        hash_value = 0
        for char in hash_string:
            hash_value = ((hash_value << 5) - hash_value) + ord(char)
            hash_value = hash_value & 0xFFFFFFFF  # Convert to 32-bit
        
        user_hash = str(abs(hash_value))
        
        # Assertions
        self.assertIsInstance(user_hash, str)
        self.assertTrue(len(user_hash) > 0)
        
        # Same input should produce same hash
        hash_value2 = 0
        for char in hash_string:
            hash_value2 = ((hash_value2 << 5) - hash_value2) + ord(char)
            hash_value2 = hash_value2 & 0xFFFFFFFF
        
        user_hash2 = str(abs(hash_value2))
        self.assertEqual(user_hash, user_hash2)
    
    def test_settings_validation(self):
        """Test settings validation logic"""
        # Test valid URL
        valid_urls = [
            "https://aida.mocxha.com",
            "https://api.example.com",
            "http://192.168.1.100:8080"
        ]
        
        for url in valid_urls:
            self.assertTrue(url.startswith('http://') or url.startswith('https://'))
        
        # Test invalid URL
        invalid_urls = [
            "ftp://example.com",
            "localhost:5000",
            "example.com"
        ]
        
        for url in invalid_urls:
            self.assertFalse(url.startswith('http://') or url.startswith('https://'))

if __name__ == '__main__':
    # Run tests
    unittest.main()