"""
Seed Funnel Templates

Creates 5 production-ready funnel templates:
1. Simple Lead Capture - Quick contact collection
2. Appointment Booking - 3-step booking flow
3. Product Demo Request - Demo scheduling with qualification
4. Survey + Callback - Qualification survey with callback
5. Emergency Contact Form - Instant callback trigger
"""

import logging
import uuid
from datetime import datetime
from sqlalchemy import text

logger = logging.getLogger(__name__)


def seed_templates(db_session):
    """Seed 5 funnel templates"""
    logger.info("🌱 Seeding funnel templates...")

    # Default theme for all templates
    default_theme = {
        "primaryColor": "#3b82f6",
        "secondaryColor": "#1e40af",
        "accentColor": "#f59e0b",
        "fontFamily": "Inter, sans-serif",
        "fontSize": "16px",
        "buttonStyle": "rounded",
        "backgroundType": "gradient",
        "backgroundImage": None
    }

    # ==================================================
    # Template 1: Simple Lead Capture
    # ==================================================
    template1_id = str(uuid.uuid4())
    template1 = {
        "funnel": {
            "funnelType": "lead_capture",
            "themeConfig": {
                **default_theme,
                "primaryColor": "#10b981",
                "secondaryColor": "#059669"
            },
            "seoConfig": {
                "title": "Get Your Free Consultation",
                "description": "Schedule a free consultation with our expert team today.",
                "ogImage": "/templates/lead-capture-og.jpg"
            },
            "trackingConfig": {}
        },
        "pages": [
            {
                "pageOrder": 0,
                "pageType": "landing",
                "name": "Contact Form",
                "content": {
                    "headline": "Get Your Free Consultation",
                    "subheadline": "Connect with our experts and discover how we can help you achieve your goals.",
                    "bodyText": "Fill out the form below and we'll get back to you within 24 hours.",
                    "ctaText": "Get Started Now",
                    "sections": [
                        {
                            "type": "hero",
                            "content": "Transform your business with expert guidance",
                            "order": 1
                        },
                        {
                            "type": "benefits",
                            "content": ["Free consultation", "Expert guidance", "Custom solutions", "24-hour response"],
                            "order": 2
                        }
                    ]
                },
                "formFields": [
                    {
                        "fieldType": "text",
                        "name": "firstName",
                        "label": "First Name",
                        "placeholder": "John",
                        "required": True,
                        "validation": "^[a-zA-Z ]+$"
                    },
                    {
                        "fieldType": "text",
                        "name": "lastName",
                        "label": "Last Name",
                        "placeholder": "Doe",
                        "required": True,
                        "validation": "^[a-zA-Z ]+$"
                    },
                    {
                        "fieldType": "email",
                        "name": "email",
                        "label": "Email Address",
                        "placeholder": "john@example.com",
                        "required": True,
                        "validation": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
                    },
                    {
                        "fieldType": "phone",
                        "name": "phone",
                        "label": "Phone Number",
                        "placeholder": "+1 (555) 000-0000",
                        "required": True,
                        "validation": "^[+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,9}$"
                    }
                ]
            },
            {
                "pageOrder": 1,
                "pageType": "thank_you",
                "name": "Thank You",
                "content": {
                    "headline": "Thank You!",
                    "subheadline": "We've received your information and will contact you shortly.",
                    "bodyText": "Our team typically responds within 24 hours. Check your email for a confirmation.",
                    "sections": [
                        {
                            "type": "next_steps",
                            "content": ["Check your email", "We'll call you soon", "Prepare your questions"],
                            "order": 1
                        }
                    ]
                },
                "formFields": []
            }
        ]
    }

    # ==================================================
    # Template 2: Appointment Booking
    # ==================================================
    template2_id = str(uuid.uuid4())
    template2 = {
        "funnel": {
            "funnelType": "appointment_booking",
            "themeConfig": {
                **default_theme,
                "primaryColor": "#6366f1",
                "secondaryColor": "#4f46e5"
            },
            "seoConfig": {
                "title": "Schedule Your Appointment",
                "description": "Book a time that works for you with our easy scheduling system.",
                "ogImage": "/templates/appointment-og.jpg"
            },
            "trackingConfig": {}
        },
        "pages": [
            {
                "pageOrder": 0,
                "pageType": "form",
                "name": "Your Information",
                "content": {
                    "headline": "Schedule Your Appointment",
                    "subheadline": "Let's get started with your basic information.",
                    "bodyText": "We need just a few details to schedule your appointment.",
                    "ctaText": "Continue to Calendar",
                    "sections": []
                },
                "formFields": [
                    {"fieldType": "text", "name": "firstName", "label": "First Name", "placeholder": "John", "required": True},
                    {"fieldType": "text", "name": "lastName", "label": "Last Name", "placeholder": "Doe", "required": True},
                    {"fieldType": "email", "name": "email", "label": "Email", "placeholder": "john@example.com", "required": True},
                    {"fieldType": "phone", "name": "phone", "label": "Phone", "placeholder": "+1 (555) 000-0000", "required": True}
                ]
            },
            {
                "pageOrder": 1,
                "pageType": "form",
                "name": "Select Date & Time",
                "content": {
                    "headline": "Choose Your Preferred Time",
                    "subheadline": "Select a date and time that works best for you.",
                    "bodyText": "All times shown are in your local timezone.",
                    "ctaText": "Confirm Appointment",
                    "sections": []
                },
                "formFields": [
                    {
                        "fieldType": "date",
                        "name": "appointmentDate",
                        "label": "Appointment Date",
                        "placeholder": "Select date",
                        "required": True
                    },
                    {
                        "fieldType": "select",
                        "name": "appointmentTime",
                        "label": "Appointment Time",
                        "placeholder": "Select time",
                        "required": True,
                        "options": ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
                    },
                    {
                        "fieldType": "textarea",
                        "name": "notes",
                        "label": "Additional Notes",
                        "placeholder": "Anything else we should know?",
                        "required": False
                    }
                ]
            },
            {
                "pageOrder": 2,
                "pageType": "call_scheduled",
                "name": "Appointment Confirmed",
                "content": {
                    "headline": "Appointment Confirmed!",
                    "subheadline": "We've sent a calendar invite to your email.",
                    "bodyText": "You'll receive a reminder 24 hours before your appointment.",
                    "sections": [
                        {
                            "type": "confirmation",
                            "content": "Check your email for the calendar invite",
                            "order": 1
                        }
                    ]
                },
                "formFields": []
            }
        ]
    }

    # ==================================================
    # Template 3: Product Demo Request
    # ==================================================
    template3_id = str(uuid.uuid4())
    template3 = {
        "funnel": {
            "funnelType": "product_inquiry",
            "themeConfig": {
                **default_theme,
                "primaryColor": "#8b5cf6",
                "secondaryColor": "#7c3aed"
            },
            "seoConfig": {
                "title": "Request a Product Demo",
                "description": "See our product in action with a personalized demo.",
                "ogImage": "/templates/demo-og.jpg"
            },
            "trackingConfig": {}
        },
        "pages": [
            {
                "pageOrder": 0,
                "pageType": "form",
                "name": "Contact Information",
                "content": {
                    "headline": "Request Your Free Demo",
                    "subheadline": "See how our product can transform your workflow.",
                    "bodyText": "Tell us about yourself and we'll customize the demo to your needs.",
                    "ctaText": "Continue",
                    "sections": []
                },
                "formFields": [
                    {"fieldType": "text", "name": "firstName", "label": "First Name", "required": True},
                    {"fieldType": "text", "name": "lastName", "label": "Last Name", "required": True},
                    {"fieldType": "email", "name": "email", "label": "Work Email", "required": True},
                    {"fieldType": "phone", "name": "phone", "label": "Phone", "required": True},
                    {"fieldType": "text", "name": "company", "label": "Company Name", "required": True},
                    {
                        "fieldType": "select",
                        "name": "role",
                        "label": "Your Role",
                        "required": True,
                        "options": ["Executive", "Manager", "Developer", "Designer", "Sales", "Other"]
                    }
                ]
            },
            {
                "pageOrder": 1,
                "pageType": "form",
                "name": "Product Interest",
                "content": {
                    "headline": "What Are You Interested In?",
                    "subheadline": "Select all features you'd like to see in the demo.",
                    "bodyText": "This helps us customize the demo to your specific needs.",
                    "ctaText": "Schedule Demo",
                    "sections": []
                },
                "formFields": [
                    {
                        "fieldType": "checkbox",
                        "name": "interests",
                        "label": "Features of Interest",
                        "required": True,
                        "options": [
                            "Analytics & Reporting",
                            "Team Collaboration",
                            "Automation",
                            "Integrations",
                            "Mobile Apps",
                            "API Access"
                        ]
                    },
                    {"fieldType": "textarea", "name": "challenges", "label": "What challenges are you trying to solve?", "required": False}
                ]
            },
            {
                "pageOrder": 2,
                "pageType": "call_scheduled",
                "name": "Demo Scheduled",
                "content": {
                    "headline": "Your Demo Is Scheduled!",
                    "subheadline": "We're excited to show you what we can do.",
                    "bodyText": "Our team will reach out within 24 hours to confirm the best time for your demo.",
                    "sections": []
                },
                "formFields": []
            }
        ]
    }

    # ==================================================
    # Template 4: Survey + Callback
    # ==================================================
    template4_id = str(uuid.uuid4())
    template4 = {
        "funnel": {
            "funnelType": "survey",
            "themeConfig": {
                **default_theme,
                "primaryColor": "#ec4899",
                "secondaryColor": "#db2777"
            },
            "seoConfig": {
                "title": "Quick Survey",
                "description": "Help us understand your needs better with this quick survey.",
                "ogImage": "/templates/survey-og.jpg"
            },
            "trackingConfig": {}
        },
        "pages": [
            {
                "pageOrder": 0,
                "pageType": "form",
                "name": "Qualification Survey",
                "content": {
                    "headline": "Let's Find the Right Solution",
                    "subheadline": "Answer a few quick questions to help us serve you better.",
                    "bodyText": "This will only take 2 minutes.",
                    "ctaText": "Continue",
                    "sections": []
                },
                "formFields": [
                    {
                        "fieldType": "select",
                        "name": "businessSize",
                        "label": "Company Size",
                        "required": True,
                        "options": ["1-10 employees", "11-50 employees", "51-200 employees", "201-1000 employees", "1000+ employees"]
                    },
                    {
                        "fieldType": "select",
                        "name": "budget",
                        "label": "Monthly Budget",
                        "required": True,
                        "options": ["Under $1,000", "$1,000-$5,000", "$5,000-$10,000", "$10,000-$50,000", "$50,000+"]
                    },
                    {
                        "fieldType": "select",
                        "name": "timeline",
                        "label": "When do you need a solution?",
                        "required": True,
                        "options": ["Immediately", "Within 1 month", "1-3 months", "3-6 months", "Just exploring"]
                    },
                    {
                        "fieldType": "radio",
                        "name": "currentSolution",
                        "label": "Are you currently using a similar product?",
                        "required": True,
                        "options": ["Yes", "No"]
                    },
                    {
                        "fieldType": "textarea",
                        "name": "primaryGoal",
                        "label": "What's your primary goal?",
                        "placeholder": "Tell us what you're trying to achieve...",
                        "required": True
                    }
                ]
            },
            {
                "pageOrder": 1,
                "pageType": "form",
                "name": "Contact Information",
                "content": {
                    "headline": "Great! Let's Schedule Your Callback",
                    "subheadline": "Provide your contact details and we'll call you back.",
                    "bodyText": "Based on your answers, we have the perfect solution for you.",
                    "ctaText": "Schedule Callback",
                    "sections": []
                },
                "formFields": [
                    {"fieldType": "text", "name": "firstName", "label": "First Name", "required": True},
                    {"fieldType": "text", "name": "lastName", "label": "Last Name", "required": True},
                    {"fieldType": "email", "name": "email", "label": "Email", "required": True},
                    {"fieldType": "phone", "name": "phone", "label": "Phone", "required": True},
                    {
                        "fieldType": "select",
                        "name": "preferredTime",
                        "label": "Preferred Callback Time",
                        "required": True,
                        "options": ["Morning (9am-12pm)", "Afternoon (12pm-5pm)", "Evening (5pm-8pm)"]
                    }
                ]
            },
            {
                "pageOrder": 2,
                "pageType": "call_scheduled",
                "name": "Callback Scheduled",
                "content": {
                    "headline": "Callback Scheduled!",
                    "subheadline": "We'll call you during your preferred time window.",
                    "bodyText": "Our team has been notified and will reach out soon. Thank you for taking the time to complete our survey!",
                    "sections": []
                },
                "formFields": []
            }
        ]
    }

    # ==================================================
    # Template 5: Emergency Contact Form
    # ==================================================
    template5_id = str(uuid.uuid4())
    template5 = {
        "funnel": {
            "funnelType": "lead_capture",
            "themeConfig": {
                **default_theme,
                "primaryColor": "#ef4444",
                "secondaryColor": "#dc2626",
                "accentColor": "#fbbf24"
            },
            "seoConfig": {
                "title": "Emergency Contact - Immediate Response",
                "description": "Get immediate assistance from our emergency response team.",
                "ogImage": "/templates/emergency-og.jpg"
            },
            "trackingConfig": {}
        },
        "pages": [
            {
                "pageOrder": 0,
                "pageType": "landing",
                "name": "Emergency Contact",
                "content": {
                    "headline": "Emergency Support Available 24/7",
                    "subheadline": "We'll contact you within 30 seconds of submission.",
                    "bodyText": "Fill out the form below for immediate assistance. Our emergency response team is standing by.",
                    "ctaText": "Get Immediate Help",
                    "sections": [
                        {
                            "type": "urgency",
                            "content": "⚡ Immediate 30-second response time",
                            "order": 1
                        },
                        {
                            "type": "availability",
                            "content": "🕐 24/7 availability",
                            "order": 2
                        }
                    ]
                },
                "formFields": [
                    {"fieldType": "text", "name": "name", "label": "Your Name", "placeholder": "Full name", "required": True},
                    {"fieldType": "phone", "name": "phone", "label": "Phone Number", "placeholder": "+1 (555) 000-0000", "required": True},
                    {
                        "fieldType": "textarea",
                        "name": "message",
                        "label": "Brief Description",
                        "placeholder": "Describe your situation in 2-3 sentences...",
                        "required": True
                    }
                ]
            },
            {
                "pageOrder": 1,
                "pageType": "thank_you",
                "name": "Help Is On The Way",
                "content": {
                    "headline": "Help Is On The Way!",
                    "subheadline": "Your emergency request has been received.",
                    "bodyText": "Our team will call you within 30 seconds. Please keep your phone nearby.",
                    "sections": [
                        {
                            "type": "alert",
                            "content": "📞 Expect a call within 30 seconds",
                            "order": 1
                        },
                        {
                            "type": "instructions",
                            "content": "Keep your phone nearby and be ready to answer",
                            "order": 2
                        }
                    ]
                },
                "formFields": []
            }
        ]
    }

    # Insert templates
    import json
    templates = [
        (template1_id, "Simple Lead Capture", "lead_capture",
         "Quick contact collection form ideal for general inquiries and consultations. Single-page design with essential contact fields.",
         template1),
        (template2_id, "Appointment Booking", "appointment",
         "Complete 3-step appointment scheduling flow with calendar integration and confirmation emails.",
         template2),
        (template3_id, "Product Demo Request", "demo",
         "Multi-step demo request flow with qualification questions and feature interest selection.",
         template3),
        (template4_id, "Survey + Callback", "survey",
         "Qualification survey followed by callback scheduling. Perfect for lead qualification and needs assessment.",
         template4),
        (template5_id, "Emergency Contact Form", "emergency",
         "High-urgency contact form with 30-second callback promise. Ideal for emergency services and urgent support.",
         template5)
    ]

    for template_id, name, category, description, template_data in templates:
        db_session.execute(text("""
            INSERT INTO funnel_templates (id, name, category, description, "templateData", "isActive", "createdAt", "updatedAt")
            VALUES (:id, :name, :category, :description, CAST(:template_data AS JSONB), TRUE, NOW(), NOW())
        """), {
            'id': template_id,
            'name': name,
            'category': category,
            'description': description,
            'template_data': json.dumps(template_data)
        })
        logger.info(f"  ✅ Created template: {name}")

    db_session.commit()
    logger.info("✅ All 5 funnel templates seeded successfully!")


if __name__ == "__main__":
    """Run seed script standalone"""
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    from database import SessionLocal
    import logging

    logging.basicConfig(level=logging.INFO)
    logger.info("Running seed_funnel_templates.py...")

    db = SessionLocal()
    try:
        seed_templates(db)
        logger.info("✅ Templates seeded successfully!")
    except Exception as e:
        logger.error(f"❌ Seeding failed: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()
