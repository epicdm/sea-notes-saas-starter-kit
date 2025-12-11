"""
Social Media Brand Extractor using Official APIs
Extracts business information from Facebook and Instagram using Graph API
"""

import os
import json
import re
from typing import Dict, Any, Optional
import requests
from urllib.parse import urlparse


class SocialMediaExtractor:
    """Extract brand information from social media using official APIs"""

    def __init__(self):
        self.fb_access_token = os.getenv('FACEBOOK_ACCESS_TOKEN')
        self.openai_api_key = os.getenv('OPENAI_API_KEY')

    def extract_from_facebook(self, facebook_url: str) -> Dict[str, Any]:
        """
        Extract business information from Facebook Page using Graph API

        Args:
            facebook_url: Facebook page URL (e.g., https://www.facebook.com/ladupigny)

        Returns:
            Dictionary with extracted business information
        """
        # Extract page ID/username from URL
        page_id = self._extract_facebook_page_id(facebook_url)

        if not page_id:
            raise ValueError(f"Could not extract Facebook page ID from URL: {facebook_url}")

        print(f"📘 Extracting Facebook page: {page_id}")

        # If no access token, try to get public data via web scraping
        if not self.fb_access_token:
            print("⚠️ No Facebook access token found. Using limited public extraction.")
            return self._extract_facebook_public(facebook_url, page_id)

        # Use Graph API with access token
        return self._extract_facebook_api(page_id)

    def _extract_facebook_page_id(self, url: str) -> Optional[str]:
        """Extract page ID or username from Facebook URL"""
        # Remove query parameters and trailing slashes
        url = url.split('?')[0].rstrip('/')

        # Common patterns:
        # https://www.facebook.com/ladupigny
        # https://www.facebook.com/pages/Company-Name/123456789
        # https://facebook.com/profile.php?id=123456789

        # Check for profile.php?id= pattern
        if 'profile.php' in url and 'id=' in url:
            match = re.search(r'id=(\d+)', url)
            if match:
                return match.group(1)

        # Extract from path
        path_parts = urlparse(url).path.strip('/').split('/')

        if not path_parts:
            return None

        # Skip 'pages' if present
        if path_parts[0] == 'pages' and len(path_parts) > 2:
            # Format: /pages/Name/ID
            return path_parts[-1]  # Return the ID

        # Otherwise, first part is the page username/ID
        return path_parts[0]

    def _extract_facebook_api(self, page_id: str) -> Dict[str, Any]:
        """Extract business info using Facebook Graph API"""

        # Fields to request from Graph API
        # See: https://developers.facebook.com/docs/graph-api/reference/page/
        fields = [
            'id',
            'name',
            'about',
            'category',
            'category_list',
            'description',
            'emails',
            'phone',
            'website',
            'location',
            'hours',
            'mission',
            'company_overview',
            'products',
            'general_info',
            'picture.type(large)',
            'cover',
            'username',
            'link',
            'fan_count',
            'rating_count',
            'overall_star_rating',
            'price_range',
            'single_line_address'
        ]

        api_url = f"https://graph.facebook.com/v18.0/{page_id}"
        params = {
            'fields': ','.join(fields),
            'access_token': self.fb_access_token
        }

        try:
            response = requests.get(api_url, params=params, timeout=30)
            response.raise_for_status()
            fb_data = response.json()

            print(f"✅ Successfully fetched Facebook page data")
            print(f"   Name: {fb_data.get('name')}")
            print(f"   Category: {fb_data.get('category')}")

            # Transform to our standard format
            return self._transform_facebook_data(fb_data)

        except requests.exceptions.HTTPError as e:
            print(f"❌ Facebook Graph API error: {e}")
            if e.response.status_code == 400:
                print("⚠️ Invalid page ID or access token")
            elif e.response.status_code == 190:
                print("⚠️ Access token expired or invalid")
            raise Exception(f"Facebook API error: {e}")

    def _extract_facebook_public(self, url: str, page_id: str) -> Dict[str, Any]:
        """
        Fallback: Extract publicly available data without access token
        Uses Open Graph meta tags from public page
        """
        print(f"📘 Attempting public extraction from: {url}")

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        try:
            # Try to access the public page
            response = requests.get(url, headers=headers, timeout=30, allow_redirects=False)

            # Facebook redirects to login for some pages
            if response.status_code in [301, 302, 303, 307, 308]:
                print("⚠️ Facebook is redirecting (likely requiring login)")
                # Return minimal data
                return {
                    'source': 'facebook',
                    'page_id': page_id,
                    'url': url,
                    'company_name': page_id.replace('-', ' ').replace('.', ' ').title(),
                    'note': 'Limited data - Facebook Graph API token recommended'
                }

            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')

            # Extract Open Graph tags
            og_data = {}
            for meta in soup.find_all('meta', property=re.compile(r'^og:')):
                prop = meta.get('property')
                content = meta.get('content')
                if prop and content:
                    og_data[prop] = content

            return {
                'source': 'facebook_public',
                'page_id': page_id,
                'url': url,
                'company_name': og_data.get('og:title'),
                'description': og_data.get('og:description'),
                'logo_url': og_data.get('og:image'),
                'note': 'Limited public data - Facebook Graph API token recommended'
            }

        except Exception as e:
            print(f"❌ Public extraction failed: {e}")
            return {
                'source': 'facebook_failed',
                'page_id': page_id,
                'url': url,
                'company_name': page_id.replace('-', ' ').replace('.', ' ').title(),
                'note': 'Extraction failed - Facebook Graph API token required'
            }

    def _transform_facebook_data(self, fb_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform Facebook Graph API response to our standard format"""

        result = {
            'source': 'facebook_graph_api',
            'company_name': fb_data.get('name'),
            'business_description': fb_data.get('about') or fb_data.get('description') or fb_data.get('company_overview'),
            'industry': fb_data.get('category'),
            'website': fb_data.get('website'),
            'contact_info': {},
            'social_media': {
                'facebook': fb_data.get('link'),
                'facebook_username': fb_data.get('username')
            },
            'logo_url': None,
            'metadata': {}
        }

        # Extract phone
        if fb_data.get('phone'):
            result['contact_info']['phone'] = fb_data['phone']

        # Extract email
        if fb_data.get('emails') and len(fb_data['emails']) > 0:
            result['contact_info']['email'] = fb_data['emails'][0]

        # Extract address from location
        if fb_data.get('location'):
            location = fb_data['location']
            address_parts = []

            if location.get('street'):
                address_parts.append(location['street'])
            if location.get('city'):
                address_parts.append(location['city'])
            if location.get('state'):
                address_parts.append(location['state'])
            if location.get('zip'):
                address_parts.append(location['zip'])
            if location.get('country'):
                address_parts.append(location['country'])

            if address_parts:
                result['contact_info']['address'] = ', '.join(address_parts)

            # Add latitude/longitude if available
            if location.get('latitude') and location.get('longitude'):
                result['metadata']['coordinates'] = {
                    'latitude': location['latitude'],
                    'longitude': location['longitude']
                }

        # Single line address (if available and no location)
        if not result['contact_info'].get('address') and fb_data.get('single_line_address'):
            result['contact_info']['address'] = fb_data['single_line_address']

        # Extract business hours
        if fb_data.get('hours'):
            result['business_hours'] = fb_data['hours']

        # Extract logo from picture
        if fb_data.get('picture') and fb_data['picture'].get('data'):
            result['logo_url'] = fb_data['picture']['data'].get('url')

        # Extract cover photo
        if fb_data.get('cover') and fb_data['cover'].get('source'):
            result['metadata']['cover_photo'] = fb_data['cover']['source']

        # Additional metadata
        result['metadata']['facebook_id'] = fb_data.get('id')
        result['metadata']['fan_count'] = fb_data.get('fan_count')
        result['metadata']['rating'] = fb_data.get('overall_star_rating')
        result['metadata']['rating_count'] = fb_data.get('rating_count')
        result['metadata']['price_range'] = fb_data.get('price_range')
        result['metadata']['mission'] = fb_data.get('mission')

        # Category list (detailed categories)
        if fb_data.get('category_list'):
            result['metadata']['categories'] = [cat.get('name') for cat in fb_data['category_list']]

        # Products/Services
        if fb_data.get('products'):
            result['key_products'] = fb_data['products']

        return result

    def extract_from_instagram(self, instagram_url: str) -> Dict[str, Any]:
        """
        Extract business information from Instagram using Instagram Graph API

        Note: Requires Instagram Business Account and Facebook Page connection
        """
        print(f"📸 Instagram extraction: {instagram_url}")

        if not self.fb_access_token:
            print("⚠️ No Facebook access token found. Instagram Business API requires Facebook token.")
            return {
                'source': 'instagram_failed',
                'url': instagram_url,
                'note': 'Instagram Business API requires Facebook access token'
            }

        # Instagram Graph API requires Instagram Business Account ID
        # This is more complex and requires page-to-instagram account mapping
        # For now, return placeholder indicating API is available

        return {
            'source': 'instagram_limited',
            'url': instagram_url,
            'note': 'Instagram Business API integration available but requires additional setup'
        }


def extract_from_social_media(urls: Dict[str, str]) -> Dict[str, Any]:
    """
    Extract brand information from social media URLs

    Args:
        urls: Dictionary with keys like 'facebook', 'instagram', 'website'

    Returns:
        Consolidated brand information
    """
    extractor = SocialMediaExtractor()
    results = {}

    # Extract from Facebook
    if urls.get('facebook'):
        try:
            results['facebook'] = extractor.extract_from_facebook(urls['facebook'])
        except Exception as e:
            print(f"❌ Facebook extraction failed: {e}")
            results['facebook'] = {
                'error': str(e),
                'note': 'Facebook Graph API extraction failed'
            }

    # Extract from Instagram
    if urls.get('instagram'):
        try:
            results['instagram'] = extractor.extract_from_instagram(urls['instagram'])
        except Exception as e:
            print(f"❌ Instagram extraction failed: {e}")
            results['instagram'] = {
                'error': str(e),
                'note': 'Instagram extraction failed'
            }

    return results


# Example usage and setup instructions
def print_setup_instructions():
    """Print setup instructions for Facebook Graph API"""
    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                   FACEBOOK GRAPH API SETUP INSTRUCTIONS                    ║
╚════════════════════════════════════════════════════════════════════════════╝

To extract comprehensive business information from Facebook pages, you need to
set up a Facebook App and get an access token.

STEP 1: Create a Facebook App
────────────────────────────────────────────────────────────────────────────
1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Choose "Business" as the app type
4. Fill in app details (name, contact email)
5. Click "Create App"

STEP 2: Get an Access Token
────────────────────────────────────────────────────────────────────────────
1. In your app dashboard, go to "Tools" → "Graph API Explorer"
2. Select your app from the dropdown
3. Click "Generate Access Token"
4. Grant required permissions:
   - pages_show_list
   - pages_read_engagement
   - pages_read_user_content
5. Copy the generated access token

STEP 3: Add Token to Environment
────────────────────────────────────────────────────────────────────────────
Add this line to your .env file:

FACEBOOK_ACCESS_TOKEN='your_access_token_here'

STEP 4: (Optional) Get Long-Lived Token
────────────────────────────────────────────────────────────────────────────
Short-lived tokens expire in ~1 hour. To get a long-lived token (60 days):

1. Go to: https://developers.facebook.com/tools/debug/accesstoken/
2. Paste your token
3. Click "Extend Access Token"
4. Copy the new long-lived token
5. Update your .env file with the new token

WHAT YOU CAN EXTRACT:
────────────────────────────────────────────────────────────────────────────
✅ Company name and description
✅ Business category and industry
✅ Contact information (phone, email, address)
✅ Business hours
✅ Logo and cover photos
✅ Website URL
✅ Fan count and ratings
✅ Mission statement
✅ Products and services

TESTING:
────────────────────────────────────────────────────────────────────────────
Test your token with:

curl "https://graph.facebook.com/v18.0/ladupigny?fields=name,about,phone,emails&access_token=YOUR_TOKEN"

For more info: https://developers.facebook.com/docs/graph-api/reference/page/
""")


if __name__ == '__main__':
    print_setup_instructions()
