"""
Enhanced Brand Information Extractor
Extracts comprehensive business information including Open Graph, JSON-LD, and meta tags
"""

import os
import json
import re
from datetime import datetime
from typing import Dict, Any, Optional, List
import requests
from bs4 import BeautifulSoup


class EnhancedBrandExtractor:
    """Extract brand information with comprehensive metadata parsing"""

    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')

    def extract_from_urls(self, urls: Dict[str, str]) -> Dict[str, Any]:
        """
        Extract brand information from provided URLs with enhanced metadata

        Args:
            urls: Dictionary with keys: facebook, instagram, website

        Returns:
            Dictionary with extracted brand information
        """
        extracted_info = {
            'raw_content': {},
            'metadata': {},
            'structured_data': {},
            'open_graph': {},
            'extraction_timestamp': datetime.utcnow().isoformat()
        }

        # Extract from each URL
        for source, url in urls.items():
            if url:
                try:
                    print(f"📥 Extracting from {source}: {url}")

                    # Fetch HTML content
                    html_content = self._fetch_html(url)
                    soup = BeautifulSoup(html_content, 'html.parser')

                    # Extract structured data
                    extracted_info['structured_data'][source] = self._extract_structured_data(soup)

                    # Extract Open Graph tags
                    extracted_info['open_graph'][source] = self._extract_open_graph(soup)

                    # Extract text content
                    text_content = self._extract_text_content(soup)
                    extracted_info['raw_content'][source] = text_content

                    # Extract metadata (emails, phones, addresses)
                    extracted_info['metadata'][source] = self._extract_metadata(soup, text_content, url)

                    print(f"✅ Found structured data: {len(extracted_info['structured_data'][source])} items")
                    print(f"✅ Found Open Graph tags: {len(extracted_info['open_graph'][source])} tags")

                except Exception as e:
                    print(f"❌ Error extracting from {source}: {e}")
                    import traceback
                    traceback.print_exc()
                    extracted_info['raw_content'][source] = None

        # Analyze and structure the data using AI
        if any(extracted_info['raw_content'].values()):
            structured_data = self._analyze_with_ai(extracted_info)
            return structured_data
        else:
            raise Exception("Failed to extract content from any provided URL")

    def _fetch_html(self, url: str) -> str:
        """Fetch HTML content from URL"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }

        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.text

    def _extract_structured_data(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract JSON-LD structured data (Schema.org)"""
        structured_data = []

        # Find all JSON-LD script tags
        json_ld_scripts = soup.find_all('script', type='application/ld+json')

        for script in json_ld_scripts:
            try:
                data = json.loads(script.string)
                structured_data.append(data)
                print(f"  📋 Found JSON-LD: {data.get('@type', 'Unknown')}")
            except (json.JSONDecodeError, AttributeError) as e:
                continue

        return structured_data

    def _extract_open_graph(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract Open Graph meta tags"""
        og_data = {}

        # Standard Open Graph tags
        og_tags = [
            'og:title', 'og:description', 'og:image', 'og:url', 'og:type',
            'og:site_name', 'og:locale', 'og:street-address', 'og:locality',
            'og:region', 'og:postal-code', 'og:country-name', 'og:email',
            'og:phone_number', 'og:fax_number', 'og:latitude', 'og:longitude'
        ]

        for tag in og_tags:
            meta = soup.find('meta', property=tag)
            if meta and meta.get('content'):
                og_data[tag] = meta.get('content')
                print(f"  🏷️  {tag}: {meta.get('content')[:50]}...")

        # Facebook-specific meta tags
        fb_tags = [
            'fb:app_id', 'fb:page_id', 'fb:admins',
            'place:location:latitude', 'place:location:longitude',
            'business:contact_data:street_address', 'business:contact_data:locality',
            'business:contact_data:region', 'business:contact_data:postal_code',
            'business:contact_data:country_name', 'business:contact_data:email',
            'business:contact_data:phone_number', 'business:contact_data:fax_number',
            'business:contact_data:website', 'business:hours:day', 'business:hours:start',
            'business:hours:end'
        ]

        for tag in fb_tags:
            meta = soup.find('meta', property=tag)
            if meta and meta.get('content'):
                og_data[tag] = meta.get('content')
                print(f"  🏷️  {tag}: {meta.get('content')}")

        # Twitter Card tags (often more complete than OG)
        twitter_tags = [
            'twitter:title', 'twitter:description', 'twitter:image',
            'twitter:site', 'twitter:creator'
        ]

        for tag in twitter_tags:
            meta = soup.find('meta', attrs={'name': tag})
            if meta and meta.get('content'):
                og_data[tag] = meta.get('content')

        # Standard meta tags
        standard_tags = ['description', 'keywords', 'author']
        for tag in standard_tags:
            meta = soup.find('meta', attrs={'name': tag})
            if meta and meta.get('content'):
                og_data[f'meta:{tag}'] = meta.get('content')

        return og_data

    def _extract_text_content(self, soup: BeautifulSoup) -> str:
        """Extract visible text content from page"""
        # Remove script, style, nav, footer elements
        for element in soup(["script", "style", "nav", "footer", "noscript"]):
            element.decompose()

        # Get text
        text = soup.get_text(separator=' ', strip=True)

        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)

        # Limit to first 5000 characters for AI analysis
        return text[:5000]

    def _extract_metadata(self, soup: BeautifulSoup, content: str, url: str) -> Dict[str, Any]:
        """Extract metadata from content and HTML"""
        metadata = {'url': url}

        # Extract email addresses from both text and HTML
        emails = set()

        # From text content
        text_emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', content)
        emails.update(text_emails)

        # From mailto links
        for link in soup.find_all('a', href=re.compile(r'^mailto:')):
            email = link.get('href').replace('mailto:', '').split('?')[0]
            emails.add(email)

        if emails:
            metadata['emails'] = list(emails)[:3]

        # Extract phone numbers (multiple formats)
        phones = set()

        # US format
        us_phones = re.findall(r'\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', content)
        phones.update(us_phones)

        # International format
        intl_phones = re.findall(r'\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}', content)
        phones.update(intl_phones)

        # From tel: links
        for link in soup.find_all('a', href=re.compile(r'^tel:')):
            phone = link.get('href').replace('tel:', '')
            phones.add(phone)

        if phones:
            metadata['phones'] = list(phones)[:3]

        # Extract addresses (multiple patterns)
        addresses = set()

        # US address pattern
        us_address = r'\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)[,\s]+[A-Za-z\s]+[,\s]+[A-Z]{2}\s+\d{5}'
        us_addresses = re.findall(us_address, content)
        addresses.update(us_addresses)

        # Look for address in microdata
        for element in soup.find_all(attrs={'itemprop': 'address'}):
            addresses.add(element.get_text(strip=True))

        if addresses:
            metadata['addresses'] = list(addresses)[:2]

        # Extract business hours from various formats
        hours_patterns = [
            r'(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*:?\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)',
            r'(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*:?\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)'
        ]

        for pattern in hours_patterns:
            hours = re.findall(pattern, content)
            if hours:
                metadata['business_hours'] = hours
                break

        return metadata

    def _analyze_with_ai(self, extracted_info: Dict[str, Any]) -> Dict[str, Any]:
        """Use OpenAI to analyze and structure the extracted content"""

        if not self.openai_api_key:
            print("⚠️ OpenAI API key not found, using enhanced rule-based extraction")
            return self._enhanced_rule_based_extraction(extracted_info)

        # Combine all extracted content for AI analysis
        combined_content = self._prepare_content_for_ai(extracted_info)

        # Prepare prompt for AI analysis
        prompt = f"""Analyze the following business information extracted from their online presence and extract a comprehensive brand profile.

{combined_content}

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
    "facebook": "Facebook URL",
    "instagram": "Instagram URL",
    "twitter": "Twitter URL",
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
            structured_data['extraction_source'] = 'ai_analysis_enhanced'
            structured_data['sources_analyzed'] = list(extracted_info['raw_content'].keys())

            return structured_data

        except Exception as e:
            print(f"❌ AI analysis failed: {e}")
            print("⚠️ Falling back to enhanced rule-based extraction")
            return self._enhanced_rule_based_extraction(extracted_info)

    def _prepare_content_for_ai(self, extracted_info: Dict[str, Any]) -> str:
        """Prepare extracted content for AI analysis"""
        sections = []

        # Add text content
        for source, content in extracted_info['raw_content'].items():
            if content:
                sections.append(f"\n\n=== TEXT FROM {source.upper()} ===\n{content}")

        # Add Open Graph data
        for source, og_data in extracted_info.get('open_graph', {}).items():
            if og_data:
                sections.append(f"\n\n=== OPEN GRAPH FROM {source.upper()} ===")
                for key, value in og_data.items():
                    sections.append(f"{key}: {value}")

        # Add structured data (JSON-LD)
        for source, structured_list in extracted_info.get('structured_data', {}).items():
            if structured_list:
                sections.append(f"\n\n=== STRUCTURED DATA FROM {source.upper()} ===")
                sections.append(json.dumps(structured_list, indent=2))

        # Add metadata
        for source, metadata in extracted_info.get('metadata', {}).items():
            if metadata:
                sections.append(f"\n\n=== METADATA FROM {source.upper()} ===")
                sections.append(json.dumps(metadata, indent=2))

        return '\n'.join(sections)

    def _enhanced_rule_based_extraction(self, extracted_info: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced fallback rule-based extraction using structured data"""
        result = {
            'company_name': None,
            'business_description': None,
            'industry': None,
            'brand_voice': 'Professional and customer-focused',
            'tone_guidelines': 'Clear, helpful, and accessible',
            'target_audience': None,
            'brand_personality': 'Reliable and approachable',
            'key_products': [],
            'key_services': [],
            'company_values': [],
            'unique_selling_points': [],
            'contact_info': {},
            'business_hours': None,
            'social_media': {},
            'logo_url': None,
            'common_customer_questions': [],
            'brand_keywords': []
        }

        # Extract from Open Graph tags
        for source, og_data in extracted_info.get('open_graph', {}).items():
            if not result['company_name'] and 'og:title' in og_data:
                result['company_name'] = og_data['og:title']

            if not result['business_description'] and 'og:description' in og_data:
                result['business_description'] = og_data['og:description']

            if not result['logo_url'] and 'og:image' in og_data:
                result['logo_url'] = og_data['og:image']

            # Extract contact info from OG tags
            if 'og:phone_number' in og_data:
                result['contact_info']['phone'] = og_data['og:phone_number']
            if 'business:contact_data:phone_number' in og_data:
                result['contact_info']['phone'] = og_data['business:contact_data:phone_number']

            if 'og:email' in og_data:
                result['contact_info']['email'] = og_data['og:email']
            if 'business:contact_data:email' in og_data:
                result['contact_info']['email'] = og_data['business:contact_data:email']

            # Extract address from OG tags
            address_parts = []
            for addr_field in ['street_address', 'locality', 'region', 'postal_code', 'country_name']:
                og_field = f'business:contact_data:{addr_field}'
                if og_field in og_data:
                    address_parts.append(og_data[og_field])
            if address_parts:
                result['contact_info']['address'] = ', '.join(address_parts)

        # Extract from JSON-LD structured data
        for source, structured_list in extracted_info.get('structured_data', {}).items():
            for data in structured_list:
                if data.get('@type') in ['Organization', 'LocalBusiness', 'Corporation']:
                    if not result['company_name'] and 'name' in data:
                        result['company_name'] = data['name']

                    if not result['business_description'] and 'description' in data:
                        result['business_description'] = data['description']

                    if not result['logo_url'] and 'logo' in data:
                        result['logo_url'] = data['logo']

                    # Extract address from structured data
                    if 'address' in data and isinstance(data['address'], dict):
                        addr = data['address']
                        address_parts = [
                            addr.get('streetAddress', ''),
                            addr.get('addressLocality', ''),
                            addr.get('addressRegion', ''),
                            addr.get('postalCode', '')
                        ]
                        result['contact_info']['address'] = ', '.join(filter(None, address_parts))

                    # Extract contact info
                    if 'telephone' in data:
                        result['contact_info']['phone'] = data['telephone']
                    if 'email' in data:
                        result['contact_info']['email'] = data['email']

        # Extract from metadata
        all_emails = []
        all_phones = []
        all_addresses = []

        for source, metadata in extracted_info.get('metadata', {}).items():
            if 'emails' in metadata:
                all_emails.extend(metadata['emails'])
            if 'phones' in metadata:
                all_phones.extend(metadata['phones'])
            if 'addresses' in metadata:
                all_addresses.extend(metadata['addresses'])
            if 'business_hours' in metadata:
                result['business_hours'] = ', '.join(metadata['business_hours'])

        # Fill in contact info if not already set
        if not result['contact_info'].get('phone') and all_phones:
            result['contact_info']['phone'] = all_phones[0]
        if not result['contact_info'].get('email') and all_emails:
            result['contact_info']['email'] = all_emails[0]
        if not result['contact_info'].get('address') and all_addresses:
            result['contact_info']['address'] = all_addresses[0]

        # Add extraction metadata
        result['extracted_at'] = datetime.utcnow().isoformat()
        result['extraction_source'] = 'rule_based_enhanced'
        result['sources_analyzed'] = list(extracted_info['raw_content'].keys())

        return result


def extract_brand_info(urls: Dict[str, str]) -> Dict[str, Any]:
    """
    Main extraction function using enhanced extractor

    Args:
        urls: Dictionary with social media and website URLs

    Returns:
        Structured brand information
    """
    extractor = EnhancedBrandExtractor()
    return extractor.extract_from_urls(urls)
