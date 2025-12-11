"""
Lobstr.io API Integration for Social Media Data Extraction
Uses Lobstr.io API to extract comprehensive business data from Facebook pages
"""

import os
import json
import time
from typing import Dict, Any, Optional
import requests
from datetime import datetime


class LobstrExtractor:
    """Extract brand information using Lobstr.io API"""

    def __init__(self):
        self.api_key = os.getenv('LOBSTR_API_KEY', 'b337fdbf3ba212d0a800bedd995f511e9236849e')
        self.base_url = 'https://api.lobstr.io/v1'

    def extract_from_facebook(self, facebook_url: str) -> Dict[str, Any]:
        """
        Extract business information from Facebook page using Lobstr.io API

        Args:
            facebook_url: Facebook page URL (e.g., https://www.facebook.com/ladupigny)

        Returns:
            Dictionary with extracted business information
        """
        print(f"📘 Extracting from Facebook using Lobstr.io API: {facebook_url}")

        try:
            # Step 1: Create extraction task
            task_id = self._create_facebook_task(facebook_url)
            print(f"✅ Task created: {task_id}")

            # Step 2: Wait for task completion
            result = self._wait_for_task_completion(task_id)
            print(f"✅ Task completed, parsing results")

            # Step 3: Transform to our standard format
            return self._transform_lobstr_data(result, facebook_url)

        except Exception as e:
            print(f"❌ Lobstr.io extraction failed: {e}")
            return {
                'source': 'lobstr_facebook_failed',
                'url': facebook_url,
                'error': str(e),
                'note': 'Lobstr.io API extraction failed'
            }

    def _create_facebook_task(self, url: str) -> str:
        """Create a Facebook scraping task via Lobstr.io API"""

        # Typical Lobstr.io API format (adjust based on actual docs)
        endpoint = f"{self.base_url}/tasks"

        payload = {
            'api_key': self.api_key,
            'type': 'facebook_page',
            'url': url,
            'data_points': [
                'name',
                'description',
                'about',
                'category',
                'phone',
                'email',
                'address',
                'website',
                'hours',
                'logo',
                'cover_photo',
                'rating',
                'fan_count'
            ]
        }

        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

        try:
            response = requests.post(endpoint, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()

            # Extract task ID from response
            task_id = data.get('task_id') or data.get('id') or data.get('run_hash')

            if not task_id:
                raise Exception(f"No task ID in response: {data}")

            return task_id

        except requests.exceptions.RequestException as e:
            print(f"⚠️ Lobstr.io API request failed: {e}")
            # Fallback: Return mock data for development
            return self._get_fallback_data(url)

    def _wait_for_task_completion(self, task_id: str, max_wait: int = 60) -> Dict[str, Any]:
        """Wait for Lobstr.io task to complete and retrieve results"""

        endpoint = f"{self.base_url}/tasks/{task_id}"
        headers = {'Authorization': f'Bearer {self.api_key}'}

        start_time = time.time()

        while time.time() - start_time < max_wait:
            try:
                response = requests.get(endpoint, headers=headers, timeout=10)
                response.raise_for_status()
                data = response.json()

                status = data.get('status') or data.get('state')

                if status in ['completed', 'done', 'finished', 'success']:
                    # Return the results
                    return data.get('result') or data.get('data') or data

                elif status in ['failed', 'error']:
                    raise Exception(f"Task failed: {data.get('error')}")

                # Still processing, wait and retry
                print(f"⏳ Task status: {status}, waiting...")
                time.sleep(3)

            except requests.exceptions.RequestException as e:
                print(f"⚠️ Error checking task status: {e}")
                break

        raise Exception(f"Task did not complete within {max_wait} seconds")

    def _get_fallback_data(self, url: str) -> Dict[str, Any]:
        """Fallback method when API is not available (for development)"""

        print("⚠️ Using fallback extraction (Lobstr.io API not available)")

        # Extract page name from URL
        page_name = url.split('/')[-1].split('?')[0]

        return {
            'source': 'lobstr_fallback',
            'url': url,
            'company_name': page_name.replace('-', ' ').replace('.', ' ').title(),
            'note': 'Limited fallback data - Lobstr.io API integration pending'
        }

    def _transform_lobstr_data(self, lobstr_data: Dict[str, Any], url: str) -> Dict[str, Any]:
        """Transform Lobstr.io response to our standard format"""

        result = {
            'source': 'lobstr_facebook_api',
            'url': url,
            'company_name': lobstr_data.get('name') or lobstr_data.get('page_name'),
            'business_description': lobstr_data.get('about') or lobstr_data.get('description'),
            'industry': lobstr_data.get('category'),
            'contact_info': {},
            'social_media': {
                'facebook': url
            },
            'metadata': {}
        }

        # Extract phone
        if lobstr_data.get('phone'):
            result['contact_info']['phone'] = lobstr_data['phone']

        # Extract email
        if lobstr_data.get('email'):
            result['contact_info']['email'] = lobstr_data['email']

        # Extract address
        if lobstr_data.get('address'):
            if isinstance(lobstr_data['address'], str):
                result['contact_info']['address'] = lobstr_data['address']
            elif isinstance(lobstr_data['address'], dict):
                # Structured address
                addr_parts = [
                    lobstr_data['address'].get('street'),
                    lobstr_data['address'].get('city'),
                    lobstr_data['address'].get('state'),
                    lobstr_data['address'].get('zip'),
                    lobstr_data['address'].get('country')
                ]
                result['contact_info']['address'] = ', '.join(filter(None, addr_parts))

        # Extract website
        if lobstr_data.get('website'):
            result['website'] = lobstr_data['website']
            result['contact_info']['website'] = lobstr_data['website']

        # Extract business hours
        if lobstr_data.get('hours'):
            result['business_hours'] = lobstr_data['hours']

        # Extract logo
        if lobstr_data.get('logo') or lobstr_data.get('profile_picture'):
            result['logo_url'] = lobstr_data.get('logo') or lobstr_data['profile_picture']

        # Extract cover photo
        if lobstr_data.get('cover_photo'):
            result['metadata']['cover_photo'] = lobstr_data['cover_photo']

        # Extract social metrics
        if lobstr_data.get('fan_count') or lobstr_data.get('likes'):
            result['metadata']['fan_count'] = lobstr_data.get('fan_count') or lobstr_data['likes']

        if lobstr_data.get('rating') or lobstr_data.get('overall_star_rating'):
            result['metadata']['rating'] = lobstr_data.get('rating') or lobstr_data['overall_star_rating']

        # Add extraction timestamp
        result['extracted_at'] = datetime.utcnow().isoformat()

        return result

    def extract_from_instagram(self, instagram_url: str) -> Dict[str, Any]:
        """Instagram extraction - Coming Soon"""
        print(f"📸 Instagram extraction: {instagram_url}")
        return {
            'source': 'lobstr_instagram_coming_soon',
            'url': instagram_url,
            'status': 'coming_soon',
            'note': 'Instagram extraction will be available soon via Lobstr.io API'
        }

    def extract_from_twitter(self, twitter_url: str) -> Dict[str, Any]:
        """Twitter/X extraction - Coming Soon"""
        print(f"🐦 Twitter extraction: {twitter_url}")
        return {
            'source': 'lobstr_twitter_coming_soon',
            'url': twitter_url,
            'status': 'coming_soon',
            'note': 'Twitter extraction will be available soon via Lobstr.io API'
        }

    def extract_from_linkedin(self, linkedin_url: str) -> Dict[str, Any]:
        """LinkedIn extraction - Coming Soon"""
        print(f"💼 LinkedIn extraction: {linkedin_url}")
        return {
            'source': 'lobstr_linkedin_coming_soon',
            'url': linkedin_url,
            'status': 'coming_soon',
            'note': 'LinkedIn extraction will be available soon via Lobstr.io API'
        }


def extract_from_social_media_lobstr(urls: Dict[str, str]) -> Dict[str, Any]:
    """
    Extract brand information from social media URLs using Lobstr.io API

    Args:
        urls: Dictionary with keys like 'facebook', 'instagram', 'twitter', 'linkedin', 'website'

    Returns:
        Consolidated brand information
    """
    extractor = LobstrExtractor()
    results = {}

    # Extract from Facebook (available now)
    if urls.get('facebook'):
        try:
            results['facebook'] = extractor.extract_from_facebook(urls['facebook'])
        except Exception as e:
            print(f"❌ Facebook extraction failed: {e}")
            results['facebook'] = {
                'error': str(e),
                'note': 'Facebook extraction failed'
            }

    # Instagram - Coming Soon
    if urls.get('instagram'):
        results['instagram'] = extractor.extract_from_instagram(urls['instagram'])

    # Twitter - Coming Soon
    if urls.get('twitter'):
        results['twitter'] = extractor.extract_from_twitter(urls['twitter'])

    # LinkedIn - Coming Soon
    if urls.get('linkedin'):
        results['linkedin'] = extractor.extract_from_linkedin(urls['linkedin'])

    return results
