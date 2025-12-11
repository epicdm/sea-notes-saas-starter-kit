"""
Improved unit tests for brands_api.py

Uses simpler mocking strategy focused on testing what matters:
- Endpoint registration
- Response structure
- Error handling
"""

import pytest
import json
from unittest.mock import Mock, patch, MagicMock, PropertyMock
from flask import Flask
from datetime import datetime


@pytest.fixture
def app():
    """Create Flask app for testing"""
    app = Flask(__name__)
    app.config['TESTING'] = True

    # Mock get_current_user_id
    app.get_current_user_id = Mock(return_value="test@example.com")

    # Import and setup after creating app
    from backend.brands_api import setup_brands_endpoints
    setup_brands_endpoints(app)

    return app


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


class TestEndpointRegistration:
    """Test that all endpoints are properly registered"""

    def test_list_brands_endpoint_exists(self, client):
        """Test /api/brands endpoint is registered"""
        response = client.get('/api/brands')
        # Should not be 404
        assert response.status_code != 404

    def test_get_brand_endpoint_exists(self, client):
        """Test /api/brands/<id> endpoint is registered"""
        response = client.get('/api/brands/test-id')
        # Should not be 404 (may be 500 or other error, but registered)
        assert response.status_code != 404

    def test_analytics_endpoint_exists(self, client):
        """Test /api/brands/<id>/analytics endpoint is registered"""
        response = client.get('/api/brands/test-id/analytics')
        # Should not be 404
        assert response.status_code != 404

    def test_filters_endpoint_exists(self, client):
        """Test /api/brands/<id>/analytics/filters endpoint is registered"""
        response = client.get('/api/brands/test-id/analytics/filters')
        # Should not be 404
        assert response.status_code != 404


class TestResponseStructure:
    """Test API response structure and format"""

    @patch('backend.brands_api.SessionLocal')
    def test_list_brands_returns_json_structure(self, mock_session_local, client):
        """Test list brands returns proper JSON structure"""
        # Setup mock
        mock_db = MagicMock()
        mock_session_local.return_value = mock_db
        mock_db.query.return_value.filter.return_value.all.return_value = []

        response = client.get('/api/brands')

        # Should return 200 OK
        assert response.status_code == 200

        # Should be JSON
        assert response.content_type == 'application/json'

        # Parse JSON
        data = json.loads(response.data)

        # Should have success field
        assert 'success' in data
        assert isinstance(data['success'], bool)

        # Should have data field
        assert 'data' in data
        assert isinstance(data['data'], list)

    @patch('backend.brands_api.SessionLocal')
    def test_analytics_response_has_required_fields(self, mock_session_local, client):
        """Test analytics returns required fields"""
        # Setup mocks
        mock_db = MagicMock()
        mock_session_local.return_value = mock_db

        # Mock brand exists
        mock_brand = MagicMock()
        mock_brand.id = "test-brand"
        mock_brand.user_email = "test@example.com"

        # Configure query chain to return brand then empty lists
        query_mock = MagicMock()
        query_mock.filter.return_value.first.return_value = mock_brand
        query_mock.filter.return_value.all.return_value = []
        query_mock.join.return_value = query_mock
        query_mock.filter.return_value = query_mock
        query_mock.all.return_value = []
        query_mock.count.return_value = 0

        mock_db.query.return_value = query_mock

        response = client.get('/api/brands/test-brand/analytics')

        # Should return 200 OK
        assert response.status_code == 200

        data = json.loads(response.data)

        # Check structure
        assert data['success'] is True
        assert 'data' in data

        # Check required fields exist
        required_fields = [
            'total_calls',
            'success_rate',
            'avg_duration',
            'total_cost'
        ]

        for field in required_fields:
            assert field in data['data'], f"Missing required field: {field}"


class TestErrorHandling:
    """Test error handling and edge cases"""

    @patch('backend.brands_api.SessionLocal')
    def test_nonexistent_brand_returns_404(self, mock_session_local, client):
        """Test accessing nonexistent brand returns 404"""
        mock_db = MagicMock()
        mock_session_local.return_value = mock_db

        # Brand not found
        mock_db.query.return_value.filter.return_value.first.return_value = None

        response = client.get('/api/brands/nonexistent-id')

        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['success'] is False

    @patch('backend.brands_api.SessionLocal')
    def test_wrong_user_access_returns_403(self, mock_session_local, client):
        """Test accessing another user's brand returns 403"""
        mock_db = MagicMock()
        mock_session_local.return_value = mock_db

        # Brand exists but owned by different user
        mock_brand = MagicMock()
        mock_brand.user_email = "other@example.com"

        mock_db.query.return_value.filter.return_value.first.return_value = mock_brand

        response = client.get('/api/brands/test-id')

        assert response.status_code == 403
        data = json.loads(response.data)
        assert data['success'] is False

    @patch('backend.brands_api.SessionLocal')
    def test_database_error_returns_500(self, mock_session_local, client):
        """Test database errors return 500"""
        mock_db = MagicMock()
        mock_session_local.return_value = mock_db

        # Simulate database error
        mock_db.query.side_effect = Exception("Database connection failed")

        response = client.get('/api/brands')

        assert response.status_code == 500
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'error' in data


class TestQueryParameters:
    """Test query parameter handling"""

    @patch('backend.brands_api.SessionLocal')
    def test_analytics_accepts_days_parameter(self, mock_session_local, client):
        """Test analytics endpoint accepts days parameter"""
        mock_db = MagicMock()
        mock_session_local.return_value = mock_db

        # Setup mocks
        mock_brand = MagicMock()
        mock_brand.id = "test-brand"
        mock_brand.user_email = "test@example.com"

        query_mock = MagicMock()
        query_mock.filter.return_value.first.return_value = mock_brand
        query_mock.filter.return_value.all.return_value = []
        query_mock.join.return_value = query_mock
        query_mock.filter.return_value = query_mock
        query_mock.all.return_value = []
        query_mock.count.return_value = 0
        mock_db.query.return_value = query_mock

        # Test with different days values
        for days in [7, 30, 90]:
            response = client.get(f'/api/brands/test-brand/analytics?days={days}')
            assert response.status_code == 200


class TestDataTransformation:
    """Test data transformation and formatting"""

    @patch('backend.brands_api.SessionLocal')
    def test_empty_data_returns_zero_values(self, mock_session_local, client):
        """Test empty dataset returns appropriate zero values"""
        mock_db = MagicMock()
        mock_session_local.return_value = mock_db

        # Setup mocks for empty data
        mock_brand = MagicMock()
        mock_brand.id = "test-brand"
        mock_brand.user_email = "test@example.com"

        query_mock = MagicMock()
        query_mock.filter.return_value.first.return_value = mock_brand
        query_mock.filter.return_value.all.return_value = []
        query_mock.join.return_value = query_mock
        query_mock.filter.return_value = query_mock
        query_mock.all.return_value = []
        query_mock.count.return_value = 0
        mock_db.query.return_value = query_mock

        response = client.get('/api/brands/test-brand/analytics')

        assert response.status_code == 200
        data = json.loads(response.data)

        # Check zero values
        assert data['data']['total_calls'] == 0
        assert data['data']['total_cost'] == "$0.00"
        assert data['data']['avg_duration'] == 0


# Run with: pytest backend/tests/test_brands_api.py -v --cov=backend.brands_api
if __name__ == '__main__':
    pytest.main([__file__, '-v'])
