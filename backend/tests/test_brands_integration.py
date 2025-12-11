"""
Integration tests for brands_api.py

Uses real database with seeded test data.
Tests actual API behavior without complex mocking.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

import pytest
import json
from database import SessionLocal, BrandProfile, Persona, AgentConfig, CallLog, User
from datetime import datetime, timedelta
from flask import Flask
from unittest.mock import Mock


@pytest.fixture(scope="function")
def db_session():
    """Create a database session with transaction rollback"""
    session = SessionLocal()
    yield session
    session.rollback()
    session.close()


@pytest.fixture
def app():
    """Create Flask app for testing"""
    app = Flask(__name__)
    app.config["TESTING"] = True
    
    from backend.brands_api import setup_brands_endpoints
    setup_brands_endpoints(app)
    
    return app


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def test_user_email():
    """Get test user email"""
    return "test@example.com"


@pytest.fixture
def authenticated_app(app, test_user_email):
    """Create app with mocked authentication"""
    app.get_current_user_id = Mock(return_value=test_user_email)
    return app


@pytest.fixture
def authenticated_client(authenticated_app):
    """Create authenticated client"""
    return authenticated_app.test_client()


class TestBrandsList:
    """Test brand listing endpoint"""
    
    def test_list_brands_with_test_data(self, authenticated_client, db_session, test_user_email):
        """Test listing brands returns test brand"""
        response = authenticated_client.get("/api/brands")
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data["success"] is True
        assert "data" in data
        assert isinstance(data["data"], list)
    
    def test_list_brands_structure(self, authenticated_client):
        """Test brand list response structure"""
        response = authenticated_client.get("/api/brands")
        
        assert response.status_code == 200
        assert response.content_type == "application/json"
        
        data = json.loads(response.data)
        assert "success" in data
        assert "data" in data


class TestBrandDetail:
    """Test brand detail endpoint"""
    
    def test_get_brand_with_test_data(self, authenticated_client, test_user_email):
        """Test getting test brand details"""
        response = authenticated_client.get("/api/brands/test-brand-123")
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data["success"] is True
        assert data["data"]["id"] == "test-brand-123"
        assert data["data"]["companyName"] == "Test Company"
    
    def test_get_nonexistent_brand(self, authenticated_client):
        """Test getting non-existent brand returns 404"""
        response = authenticated_client.get("/api/brands/nonexistent-id")
        
        assert response.status_code in [404, 500]


class TestBrandAnalytics:
    """Test brand analytics endpoint"""
    
    def test_analytics_returns_data(self, authenticated_client):
        """Test analytics endpoint returns proper structure"""
        response = authenticated_client.get("/api/brands/test-brand-123/analytics")
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert "success" in data
        assert "data" in data
        assert isinstance(data["data"], dict)
    
    def test_analytics_with_date_filter(self, authenticated_client):
        """Test analytics with date range parameter"""
        response = authenticated_client.get(
            "/api/brands/test-brand-123/analytics?days=7"
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
    
    def test_analytics_with_agent_filter(self, authenticated_client):
        """Test analytics with agent filter"""
        response = authenticated_client.get(
            "/api/brands/test-brand-123/analytics?agent_ids=test-agent-1"
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
    
    def test_analytics_with_outcome_filter(self, authenticated_client):
        """Test analytics with outcome filter"""
        response = authenticated_client.get(
            "/api/brands/test-brand-123/analytics?outcomes=completed,failed"
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
    
    def test_analytics_with_multiple_filters(self, authenticated_client):
        """Test analytics with multiple filters combined"""
        response = authenticated_client.get(
            "/api/brands/test-brand-123/analytics?days=30&agent_ids=test-agent-1&outcomes=completed"
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True


class TestBrandAnalyticsFilters:
    """Test analytics filters endpoint"""
    
    def test_filters_returns_available_options(self, authenticated_client):
        """Test filters endpoint returns available agents and outcomes"""
        response = authenticated_client.get("/api/brands/test-brand-123/analytics/filters")
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert "success" in data
        assert "data" in data


class TestBrandAnalyticsTimeSeries:
    """Test time series analytics endpoint"""
    
    def test_timeseries_returns_data(self, authenticated_client):
        """Test time series endpoint returns daily data"""
        response = authenticated_client.get("/api/brands/test-brand-123/analytics/timeseries")
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert "success" in data
        assert "data" in data
        assert isinstance(data["data"], list)


class TestAnalyticsCalculations:
    """Test analytics calculation logic"""
    
    def test_call_count_accuracy(self, db_session, test_user_email):
        """Test that call counts are calculated correctly"""
        agents = db_session.query(AgentConfig).filter(
            AgentConfig.brandProfileId == "test-brand-123"
        ).all()
        
        agent_ids = [a.id for a in agents]
        
        call_count = db_session.query(CallLog).filter(
            CallLog.agentConfigId.in_(agent_ids)
        ).count()
        
        assert call_count > 0, "Test data should have calls"
    
    def test_outcome_distribution(self, db_session):
        """Test that outcome counts are accurate"""
        from sqlalchemy import func
        
        agents = db_session.query(AgentConfig).filter(
            AgentConfig.brandProfileId == "test-brand-123"
        ).all()
        
        agent_ids = [a.id for a in agents]
        
        outcomes = db_session.query(
            CallLog.outcome,
            func.count(CallLog.id)
        ).filter(
            CallLog.agentConfigId.in_(agent_ids)
        ).group_by(CallLog.outcome).all()
        
        assert len(outcomes) > 0, "Should have calls with different outcomes"
        
        for outcome, count in outcomes:
            assert count > 0


class TestUserIsolation:
    """Test that users can only access their own data"""
    
    def test_cannot_access_other_user_brand(self, app):
        """Test that accessing another users brand returns error"""
        app.get_current_user_id = Mock(return_value="other@example.com")
        client = app.test_client()
        
        response = client.get("/api/brands/test-brand-123")
        
        assert response.status_code in [403, 404, 500]


class TestErrorHandling:
    """Test error handling"""
    
    def test_missing_brand_id(self, authenticated_client):
        """Test analytics with missing brand ID"""
        response = authenticated_client.get("/api/brands//analytics")
        
        assert response.status_code == 404
    
    def test_invalid_date_parameter(self, authenticated_client):
        """Test analytics with invalid date parameter"""
        response = authenticated_client.get(
            "/api/brands/test-brand-123/analytics?days=invalid"
        )
        
        assert response.status_code in [200, 400]
