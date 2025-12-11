"""
Brand Information Extractor
Extracts comprehensive business information from social media and websites
"""

import os
import json
import re
from datetime import datetime
from typing import Dict, Any, Optional
import requests
from bs4 import BeautifulSoup

# Import Lobstr.io extractor for social media extraction
try:
    from lobstr_extractor import LobstrExtractor
    LOBSTR_EXTRACTOR_AVAILABLE = True
except ImportError:
    LOBSTR_EXTRACTOR_AVAILABLE = False


class BrandExtractor:
    """Extract brand information from various sources"""

    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.lobstr_extractor = LobstrExtractor() if LOBSTR_EXTRACTOR_AVAILABLE else None

    def extract_from_urls(self, urls: Dict[str, str]) -> Dict[str, Any]:
        """
        Extract brand information from provided URLs
        Routes Facebook/Instagram to Graph API, websites to web scraping

        Args:
            urls: Dictionary with keys: facebook, instagram, website

        Returns:
            Dictionary with extracted brand information
        """
        extracted_info = {
            'raw_content': {},
            'metadata': {},
            'social_media_data': {},
            'extraction_timestamp': datetime.utcnow().isoformat()
        }

        # Extract from Facebook using Lobstr.io API
        if urls.get('facebook') and self.lobstr_extractor:
            try:
                print(f"📘 Extracting from Facebook (using Lobstr.io API): {urls['facebook']}")
                fb_data = self.lobstr_extractor.extract_from_facebook(urls['facebook'])
                extracted_info['social_media_data']['facebook'] = fb_data
            except Exception as e:
                print(f"❌ Facebook extraction error: {e}")
                extracted_info['social_media_data']['facebook'] = {'error': str(e)}

        # Extract from Instagram - Coming Soon
        if urls.get('instagram') and self.lobstr_extractor:
            try:
                print(f"📸 Instagram extraction - Coming Soon")
                ig_data = self.lobstr_extractor.extract_from_instagram(urls['instagram'])
                extracted_info['social_media_data']['instagram'] = ig_data
            except Exception as e:
                print(f"❌ Instagram extraction error: {e}")
                extracted_info['social_media_data']['instagram'] = {'error': str(e), 'status': 'coming_soon'}

        # Extract from Twitter - Coming Soon
        if urls.get('twitter') and self.lobstr_extractor:
            try:
                print(f"🐦 Twitter extraction - Coming Soon")
                twitter_data = self.lobstr_extractor.extract_from_twitter(urls['twitter'])
                extracted_info['social_media_data']['twitter'] = twitter_data
            except Exception as e:
                extracted_info['social_media_data']['twitter'] = {'error': str(e), 'status': 'coming_soon'}

        # Extract from LinkedIn - Coming Soon
        if urls.get('linkedin') and self.lobstr_extractor:
            try:
                print(f"💼 LinkedIn extraction - Coming Soon")
                linkedin_data = self.lobstr_extractor.extract_from_linkedin(urls['linkedin'])
                extracted_info['social_media_data']['linkedin'] = linkedin_data
            except Exception as e:
                extracted_info['social_media_data']['linkedin'] = {'error': str(e), 'status': 'coming_soon'}

        # Extract from website and other URLs using web scraping
        for source, url in urls.items():
            if source not in ['facebook', 'instagram', 'twitter', 'linkedin'] and url:
                try:
                    print(f"📥 Extracting from {source} (web scraping): {url}")
                    content = self._fetch_url_content(url)
                    extracted_info['raw_content'][source] = content
                    extracted_info['metadata'][source] = self._extract_metadata(content, url)
                except Exception as e:
                    print(f"❌ Error extracting from {source}: {e}")
                    extracted_info['raw_content'][source] = None

        # Analyze and structure the data using AI
        if any(extracted_info['raw_content'].values()) or extracted_info.get('social_media_data'):
            structured_data = self._analyze_with_ai(extracted_info)
            return structured_data
        else:
            raise Exception("Failed to extract content from any provided URL")

    def _fetch_url_content(self, url: str) -> str:
        """Fetch content from URL using requests + BeautifulSoup"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer"]):
            script.decompose()

        # Get text
        text = soup.get_text(separator=' ', strip=True)

        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)

        # Limit to first 5000 characters for AI analysis
        return text[:5000]

    def _extract_metadata(self, content: str, url: str) -> Dict[str, Any]:
        """Extract metadata from content"""
        metadata = {'url': url}

        # Extract email addresses
        emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', content)
        if emails:
            metadata['emails'] = list(set(emails))[:3]  # First 3 unique emails

        # Extract phone numbers (US format)
        phones = re.findall(r'\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', content)
        if phones:
            metadata['phones'] = list(set(phones))[:3]  # First 3 unique phones

        # Extract addresses (simple heuristic)
        address_pattern = r'\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)[,\s]+[A-Z]{2}\s+\d{5}'
        addresses = re.findall(address_pattern, content)
        if addresses:
            metadata['addresses'] = list(set(addresses))[:2]

        return metadata

    def _analyze_with_ai(self, extracted_info: Dict[str, Any]) -> Dict[str, Any]:
        """Use OpenAI to analyze and structure the extracted content"""

        if not self.openai_api_key:
            print("⚠️ OpenAI API key not found, using rule-based extraction")
            return self._rule_based_extraction(extracted_info)

        # Priority: Use Lobstr.io Facebook API data if available (most reliable)
        fb_data = extracted_info.get('social_media_data', {}).get('facebook', {})
        if fb_data and fb_data.get('source') in ['lobstr_facebook_api', 'facebook_graph_api']:
            print("✅ Using comprehensive Facebook API data from Lobstr.io")
            # Lobstr.io API already provides structured data
            return fb_data

        # Combine all extracted content
        combined_content = ""

        # Add social media data first (higher quality)
        for platform, data in extracted_info.get('social_media_data', {}).items():
            if data and not data.get('error'):
                combined_content += f"\n\n=== {platform.upper()} (Official API) ===\n"
                combined_content += json.dumps(data, indent=2)

        # Add web-scraped content
        for source, content in extracted_info['raw_content'].items():
            if content:
                combined_content += f"\n\n=== {source.upper()} ===\n{content}"

        # Combine all metadata
        all_metadata = {}
        for source, metadata in extracted_info['metadata'].items():
            for key, value in metadata.items():
                if key not in all_metadata:
                    all_metadata[key] = []
                if isinstance(value, list):
                    all_metadata[key].extend(value)
                else:
                    all_metadata[key].append(value)

        # Prepare prompt for AI analysis
        prompt = f"""Analyze the following business information extracted from their online presence and extract a comprehensive brand profile.

EXTRACTED CONTENT:
{combined_content}

DETECTED CONTACT INFO:
Emails: {all_metadata.get('emails', [])}
Phones: {all_metadata.get('phones', [])}
Addresses: {all_metadata.get('addresses', [])}

Please extract and structure the following information in JSON format:

{{
  "company_name": "The official business name",
  "business_description": "A concise description of what the business does",
  "industry": "The industry or sector",
  "brand_voice": "How the brand communicates (e.g., professional, friendly, technical)",
  "tone_guidelines": "Specific tone characteristics (e.g., warm, empathetic, authoritative)",
  "target_audience": "Who their customers are",
  "brand_personality": "Key personality traits of the brand",
  "key_products": ["List of main products or offerings"],
  "key_services": ["List of main services"],
  "company_values": ["Core values mentioned"],
  "unique_selling_points": ["What makes them different"],
  "contact_info": {{
    "phone": "Primary phone number",
    "email": "Primary email",
    "address": "Physical address",
    "website": "Website URL"
  }},
  "business_hours": "Operating hours if mentioned",
  "social_media": {{
    "facebook": "Facebook URL if different from input",
    "instagram": "Instagram handle or URL",
    "twitter": "Twitter handle or URL",
    "linkedin": "LinkedIn URL"
  }},
  "logo_url": "Logo image URL if found",
  "common_customer_questions": ["Frequently mentioned questions or topics"],
  "brand_keywords": ["Keywords that define the brand"]
}}

Return ONLY valid JSON. If information is not available, use null."""

        try:
            # Call OpenAI API
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.openai_api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'gpt-4o-mini',
                    'messages': [
                        {'role': 'system', 'content': 'You are a brand analysis expert. Extract structured business information from web content.'},
                        {'role': 'user', 'content': prompt}
                    ],
                    'temperature': 0.3,
                    'max_tokens': 2000
                },
                timeout=30
            )

            response.raise_for_status()
            result = response.json()

            # Parse AI response
            ai_content = result['choices'][0]['message']['content']

            # Extract JSON from response (handle markdown code blocks)
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', ai_content, re.DOTALL)
            if json_match:
                structured_data = json.loads(json_match.group(1))
            else:
                # Try direct JSON parse
                structured_data = json.loads(ai_content)

            # Add extraction metadata
            structured_data['extracted_at'] = datetime.utcnow().isoformat()
            structured_data['extraction_source'] = 'ai_analysis'
            structured_data['sources_analyzed'] = list(extracted_info['raw_content'].keys())

            return structured_data

        except Exception as e:
            print(f"❌ AI analysis failed: {e}")
            print("⚠️ Falling back to rule-based extraction")
            return self._rule_based_extraction(extracted_info)

    def _rule_based_extraction(self, extracted_info: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based extraction if AI fails"""

        # Combine all metadata
        all_emails = []
        all_phones = []
        all_addresses = []

        for metadata in extracted_info['metadata'].values():
            all_emails.extend(metadata.get('emails', []))
            all_phones.extend(metadata.get('phones', []))
            all_addresses.extend(metadata.get('addresses', []))

        return {
            'company_name': None,
            'business_description': 'Business information extracted from online presence',
            'industry': None,
            'brand_voice': 'Professional and customer-focused',
            'tone_guidelines': 'Clear, helpful, and accessible',
            'target_audience': 'General consumers',
            'brand_personality': 'Reliable and approachable',
            'key_products': [],
            'key_services': [],
            'company_values': ['Quality', 'Customer Service'],
            'unique_selling_points': [],
            'contact_info': {
                'phone': all_phones[0] if all_phones else None,
                'email': all_emails[0] if all_emails else None,
                'address': all_addresses[0] if all_addresses else None,
                'website': extracted_info['metadata'].get('website', {}).get('url')
            },
            'business_hours': None,
            'social_media': {},
            'logo_url': None,
            'common_customer_questions': [],
            'brand_keywords': [],
            'extracted_at': datetime.utcnow().isoformat(),
            'extraction_source': 'rule_based',
            'sources_analyzed': list(extracted_info['raw_content'].keys())
        }


def extract_brand_info(urls: Dict[str, str]) -> Dict[str, Any]:
    """
    Main extraction function

    Args:
        urls: Dictionary with social media and website URLs

    Returns:
        Structured brand information
    """
    extractor = BrandExtractor()
    return extractor.extract_from_urls(urls)
