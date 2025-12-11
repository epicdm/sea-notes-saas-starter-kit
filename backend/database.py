"""
Database models and connection for multi-tenant voice agent platform.
"""

from sqlalchemy import create_engine, Column, String, Text, Float, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./voice_agents.db')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    """User accounts."""
    __tablename__ = 'users'

    # Note: Prisma uses camelCase column names
    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    emailVerified = Column('emailVerified', DateTime, nullable=True)
    name = Column(String(255))
    image = Column(String(255), nullable=True)
    password = Column(String(255), nullable=True)  # nullable for OAuth users
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    isActive = Column('isActive', Boolean, default=True, nullable=False)
    onboardingCompleted = Column('onboardingCompleted', Boolean, default=False, nullable=False)

    # Relationships
    agents = relationship('AgentConfig', back_populates='user', cascade='all, delete-orphan')
    phone_numbers = relationship('PhoneMapping', back_populates='user', cascade='all, delete-orphan')
    call_logs = relationship('CallLog', back_populates='user')
    sip_configs = relationship('SIPConfig', back_populates='user', cascade='all, delete-orphan')
    brand_profile = relationship('BrandProfile', back_populates='user', uselist=False, cascade='all, delete-orphan')
    personas = relationship('Persona', back_populates='user', cascade='all, delete-orphan')

class BrandProfile(Base):
    """Brand profile for company identity and brand voice."""
    __tablename__ = 'brand_profiles'

    # Core Identity
    id = Column(String(36), primary_key=True)
    userId = Column('userId', String(36), ForeignKey('users.id'), nullable=False)

    # Company Info
    companyName = Column('companyName', String(255), nullable=False)
    industry = Column(String(100))
    logoUrl = Column('logoUrl', Text)

    # Social Media Links
    facebookUrl = Column('facebookUrl', Text)
    instagramUrl = Column('instagramUrl', Text)
    linkedinUrl = Column('linkedinUrl', Text)
    twitterUrl = Column('twitterUrl', Text)
    websiteUrl = Column('websiteUrl', Text)

    # AI-Extracted Brand Data (JSONB)
    # Structure: {business_description, brand_voice, tone_guidelines, target_audience,
    #            key_products[], key_services[], company_values[], unique_selling_points[],
    #            common_questions[], brand_personality, extracted_at, extraction_source}
    brandData = Column('brandData', JSONB)

    # Manual Overrides
    customBrandVoice = Column('customBrandVoice', Text)
    customToneGuidelines = Column('customToneGuidelines', Text)

    # Do's and Don'ts (JSONB)
    # Structure: {dos: string[], donts: string[]}
    dosAndDonts = Column('dosAndDonts', JSONB)

    # Settings
    autoExtractEnabled = Column('autoExtractEnabled', Boolean, default=True, nullable=False)
    lastExtractionAt = Column('lastExtractionAt', DateTime)

    # Metadata
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship('User', back_populates='brand_profile')
    agents = relationship('AgentConfig', back_populates='brand_profile')

class Persona(Base):
    """Reusable personality templates for AI agents with multi-channel support."""
    __tablename__ = 'personas'

    # Core Identity
    id = Column(String(36), primary_key=True)
    userId = Column('userId', String(36), ForeignKey('users.id'), nullable=True)  # NULL for system templates
    brandProfileId = Column('brandProfileId', String(36), ForeignKey('brand_profiles.id'), nullable=True)

    # Basic Info
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    description = Column(Text)

    # Personality Configuration
    instructions = Column(Text, nullable=False)

    # Personality Traits (JSONB)
    # Structure: string[] - e.g., ["helpful", "patient", "empathetic"]
    personalityTraits = Column('personalityTraits', JSONB)

    # Communication Style
    tone = Column(String(50))  # professional, friendly, casual, formal, empathetic
    languageStyle = Column('languageStyle', String(50))  # concise, detailed, conversational

    # Multi-Channel Configuration
    # Voice configuration: {voice_id, provider, model, speed, stability}
    voiceConfig = Column('voiceConfig', JSONB)

    # Capabilities: array of enabled channels ["voice", "chat", "whatsapp", "email", "sms"]
    capabilities = Column(JSONB, default='["voice"]', nullable=False)

    # Tools: array of tool configurations [{name, description, parameters, enabled}]
    tools = Column(JSONB, default='[]', nullable=False)

    # Suggested Voice (optional - legacy field, use voiceConfig instead)
    suggestedVoice = Column('suggestedVoice', String(100))

    # Usage Tracking
    agentCount = Column('agentCount', Integer, default=0, nullable=False)

    # Meta
    isTemplate = Column('isTemplate', Boolean, default=False, nullable=False)

    # Metadata
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship('User', back_populates='personas')
    brand_profile = relationship('BrandProfile', foreign_keys=[brandProfileId])
    agents = relationship('AgentConfig', back_populates='persona')
    phone_numbers = relationship('PersonaPhoneNumber', back_populates='persona', cascade='all, delete-orphan')

class PersonaTemplate(Base):
    """System-provided persona templates for quick agent creation."""
    __tablename__ = 'persona_templates'

    # Core Identity
    id = Column(String(36), primary_key=True)

    # Template Info
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text)

    # Template Data (Complete persona configuration)
    # Structure: {name, type, instructions, voice_config, capabilities, tools, personality_traits, tone, language_style}
    templateData = Column('templateData', JSONB, nullable=False)

    # Visual
    previewImage = Column('previewImage', Text)  # URL or path to preview image

    # Status
    isActive = Column('isActive', Boolean, default=True, nullable=False)

    # Metadata
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class PersonaPhoneNumber(Base):
    """Maps personas to phone numbers for voice and SMS channels."""
    __tablename__ = 'personas_phone_numbers'

    # Core Identity
    id = Column(String(36), primary_key=True)

    # References
    personaId = Column('personaId', String(36), ForeignKey('personas.id', ondelete='CASCADE'), nullable=False)
    phoneNumber = Column('phoneNumber', String(20), nullable=False)

    # Channel Configuration
    channelType = Column('channelType', String(20), nullable=False)  # voice, sms
    isPrimary = Column('isPrimary', Boolean, default=False, nullable=False)

    # Metadata
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    persona = relationship('Persona', back_populates='phone_numbers')

class AgentConfig(Base):
    """Agent configurations per user."""
    __tablename__ = 'agent_configs'

    # Core Identity - NOTE: Using camelCase to match Prisma database schema
    id = Column(String(36), primary_key=True)
    userId = Column('userId', String(36), ForeignKey('users.id'), nullable=False)
    agentId = Column('agentId', String(255), unique=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)

    # Three-Entity Architecture References
    agentType = Column('agentType', String(50), default='inbound')  # inbound, outbound, hybrid
    personaId = Column('personaId', String(36), ForeignKey('personas.id'))  # References persona
    brandProfileId = Column('brandProfileId', String(36), ForeignKey('brand_profiles.id'))  # References brand profile

    # Instructions (can be computed from persona + brand, or stored for legacy agents)
    instructions = Column(Text, nullable=False)
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    isActive = Column('isActive', Boolean, default=True, nullable=False)

    # Agent file management
    filePath = Column('filePath', String(512))
    status = Column(String(50), default='created')

    # Core Configuration
    agentMode = Column('agentMode', String(50), default='standard')
    language = Column(String(10), default='en-US')
    temperature = Column(Float, default=0.7)

    # LLM Configuration
    llmProvider = Column('llmProvider', String(100), default='openai')
    llmModel = Column('llmModel', String(100), default='gpt-4o-mini')

    # STT Configuration (Standard mode only)
    sttProvider = Column('sttProvider', String(100), default='deepgram')
    sttModel = Column('sttModel', String(100), default='nova-2')
    sttLanguage = Column('sttLanguage', String(10), default='en')

    # TTS Configuration (Standard mode only)
    ttsProvider = Column('ttsProvider', String(100), default='openai')
    ttsModel = Column('ttsModel', String(100))
    ttsVoiceId = Column('ttsVoiceId', String(100))
    voice = Column(String(50), default='alloy')  # Kept for backward compatibility

    # Realtime API Configuration
    realtimeVoice = Column('realtimeVoice', String(50), default='alloy')

    # VAD Configuration
    vadEnabled = Column('vadEnabled', Boolean, default=True, nullable=False)
    vadProvider = Column('vadProvider', String(50), default='silero')

    # Turn Detection
    turnDetectionModel = Column('turnDetectionModel', String(50), default='multilingual')

    # Noise Cancellation
    noiseCancellationEnabled = Column('noiseCancellationEnabled', Boolean, default=True, nullable=False)
    noiseCancellationType = Column('noiseCancellationType', String(50), default='BVC')

    # Advanced Session Options
    preemptiveGeneration = Column('preemptiveGeneration', Boolean, default=False, nullable=False)
    resumeFalseInterruption = Column('resumeFalseInterruption', Boolean, default=False, nullable=False)
    falseInterruptionTimeout = Column('falseInterruptionTimeout', Float, default=1.0)
    minInterruptionDuration = Column('minInterruptionDuration', Float, default=0.2)

    # Greeting Configuration
    greetingEnabled = Column('greetingEnabled', Boolean, default=True, nullable=False)
    greetingMessage = Column('greetingMessage', Text)

    # Multi-Channel Configuration
    # Channels: {voice: {phone_numbers: []}, chat: {widget_id}, whatsapp: {phone}, email: {address}, sms: {phone}}
    channels = Column(JSONB, default='{}', nullable=False)

    # Deployment Mode: production, demo, testing
    deploymentMode = Column('deploymentMode', String(50), default='production')

    # Custom Instructions: Agent-specific overrides that merge with persona instructions
    customInstructions = Column('customInstructions', Text)

    # Relationships
    user = relationship('User', back_populates='agents')
    persona = relationship('Persona', back_populates='agents')
    brand_profile = relationship('BrandProfile', back_populates='agents')
    phone_mappings = relationship('PhoneMapping', back_populates='agent')
    call_logs = relationship('CallLog', back_populates='agent')

class PhoneMapping(Base):
    """Phone number to agent mappings."""
    __tablename__ = 'phone_mappings'

    # NOTE: Using camelCase to match Prisma database schema
    id = Column(String(36), primary_key=True)
    userId = Column('userId', String(36), ForeignKey('users.id'), nullable=False)
    agentConfigId = Column('agentConfigId', String(36), ForeignKey('agent_configs.id'), nullable=False)
    phoneNumber = Column('phoneNumber', String(20), unique=True, nullable=False)
    sipTrunkId = Column('sipTrunkId', String(100))
    sipConfigId = Column('sipConfigId', String(36), ForeignKey('sip_configs.id'))
    isActive = Column('isActive', Boolean, default=True, nullable=False)
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship('User', back_populates='phone_numbers')
    agent = relationship('AgentConfig', back_populates='phone_mappings')
    sip_config = relationship('SIPConfig', back_populates='phone_mappings')

class CallLog(Base):
    """Call history and outcome records (enhanced version)."""
    __tablename__ = 'call_logs'

    # NOTE: Using camelCase to match Prisma database schema
    id = Column(String(36), primary_key=True)
    userId = Column('userId', String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    agentConfigId = Column('agentConfigId', String(36), ForeignKey('agent_configs.id', ondelete='SET NULL'), nullable=True, index=True)

    # LiveKit Identifiers
    livekitRoomName = Column('livekitRoomName', String(255), nullable=True, index=True)
    livekitRoomSid = Column('livekitRoomSid', String(100), nullable=True, unique=True, index=True)

    # Call Direction
    direction = Column(String(20), nullable=True, index=True)  # 'inbound' or 'outbound'

    # Contact Information
    phoneNumber = Column('phoneNumber', String(20), nullable=True, index=True)

    # SIP Integration
    sipCallId = Column('sipCallId', String(255), nullable=True)

    # Legacy fields (kept for compatibility)
    roomName = Column('roomName', String(255), nullable=True)
    durationSeconds = Column('durationSeconds', Integer, nullable=True)

    # Duration and Timestamps
    duration = Column(Integer, nullable=True)  # Duration in seconds
    startedAt = Column('startedAt', DateTime, default=datetime.utcnow, nullable=False, index=True)
    endedAt = Column('endedAt', DateTime, nullable=True, index=True)

    # Call Status and Outcome
    status = Column(String(50), default='active', nullable=False, index=True)  # 'active' or 'ended'
    outcome = Column(String(50), nullable=True, index=True)  # 'completed', 'no_answer', 'busy', 'failed', 'voicemail'

    # Recording and Metadata
    recordingUrl = Column('recordingUrl', String(512), nullable=True)
    call_metadata = Column('call_metadata', JSONB, nullable=True)  # Additional call metadata

    # Billing
    cost = Column('cost', String(20), nullable=True)  # Decimal stored as string

    # Timestamps
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False, index=True)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship('User', back_populates='call_logs')
    agent = relationship('AgentConfig', back_populates='call_logs')
    events = relationship('LiveKitCallEvent', back_populates='call_log', cascade='all, delete-orphan')

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'userId': self.userId,
            'agentConfigId': self.agentConfigId,
            'livekitRoomName': self.livekitRoomName,
            'livekitRoomSid': self.livekitRoomSid,
            'direction': self.direction,
            'phoneNumber': self.phoneNumber,
            'sipCallId': self.sipCallId,
            'duration': self.duration or self.durationSeconds,
            'startedAt': self.startedAt.isoformat() if self.startedAt else None,
            'endedAt': self.endedAt.isoformat() if self.endedAt else None,
            'status': self.status,
            'outcome': self.outcome,
            'recordingUrl': self.recordingUrl,
            'metadata': self.call_metadata,
            'cost': self.cost,
            'createdAt': self.createdAt.isoformat() if self.createdAt else None,
            'updatedAt': self.updatedAt.isoformat() if self.updatedAt else None
        }

class LiveKitCallEvent(Base):
    """LiveKit webhook event log with idempotency protection."""
    __tablename__ = 'livekit_call_events'

    # Primary Key
    id = Column(String(36), primary_key=True)

    # Multi-Tenant Foreign Key (CASCADE)
    userId = Column('userId', String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)

    # Call Log Reference (CASCADE)
    callLogId = Column('callLogId', String(36), ForeignKey('call_logs.id', ondelete='CASCADE'), nullable=True, index=True)

    # Idempotency Key (UNIQUE constraint)
    eventId = Column('eventId', String(100), nullable=False, unique=True, index=True)

    # Event Details
    event = Column(String(50), nullable=False, index=True)
    roomName = Column('roomName', String(255), nullable=False, index=True)
    roomSid = Column('roomSid', String(100), nullable=True, index=True)

    # Participant Details
    participantIdentity = Column('participantIdentity', String(255), nullable=True)
    participantSid = Column('participantSid', String(100), nullable=True, index=True)

    # Event Timestamp (from LiveKit)
    timestamp = Column(Integer, nullable=False, index=True)

    # Full Payload (JSONB for flexible querying)
    rawPayload = Column('rawPayload', JSONB, nullable=False)

    # Processing Status
    processed = Column('processed', Integer, default=1, nullable=False)
    errorMessage = Column('errorMessage', Text, nullable=True)

    # Timestamps
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False, index=True)
    processedAt = Column('processedAt', DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship('User')
    call_log = relationship('CallLog', back_populates='events')

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'userId': self.userId,
            'callLogId': self.callLogId,
            'eventId': self.eventId,
            'event': self.event,
            'roomName': self.roomName,
            'roomSid': self.roomSid,
            'participantIdentity': self.participantIdentity,
            'participantSid': self.participantSid,
            'timestamp': self.timestamp,
            'rawPayload': self.rawPayload,
            'processed': self.processed,
            'errorMessage': self.errorMessage,
            'createdAt': self.createdAt.isoformat() if self.createdAt else None,
            'processedAt': self.processedAt.isoformat() if self.processedAt else None
        }

class SIPConfig(Base):
    """SIP server configurations per user."""
    __tablename__ = 'sip_configs'

    # NOTE: Using camelCase to match Prisma database schema
    id = Column(String(36), primary_key=True)
    userId = Column('userId', String(36), ForeignKey('users.id'), nullable=False)
    name = Column(String(255), nullable=False)
    sipUrl = Column('sipUrl', String(255), nullable=False)
    sipUsername = Column('sipUsername', String(255))
    sipPassword = Column('sipPassword', String(255))
    sipTransport = Column('sipTransport', String(50), default='tcp', nullable=False)
    trunkId = Column('trunkId', String(100))
    isDefault = Column('isDefault', Boolean, default=False, nullable=False)
    inboundEnabled = Column('inboundEnabled', Boolean, default=True, nullable=False)
    outboundEnabled = Column('outboundEnabled', Boolean, default=True, nullable=False)
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship('User', back_populates='sip_configs')
    phone_mappings = relationship('PhoneMapping', back_populates='sip_config')

class LiveKitAgent(Base):
    """LiveKit infrastructure agents (physical processes)."""
    __tablename__ = 'livekit_agents'

    id = Column(String(36), primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    status = Column(String(50), default='stopped', nullable=False)
    filepath = Column(String(500), nullable=False)
    pid = Column(Integer, nullable=True)
    port = Column(Integer, nullable=True)
    livekit_url = Column(String(255), nullable=True)
    region = Column(String(50), default='us-east', nullable=True)
    capacity = Column(Integer, default=100, nullable=False)
    current_load = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_health_check = Column(DateTime, nullable=True)
    version = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)


class CallTranscript(Base):
    """
    Call transcript metadata and summary.
    One transcript per call_log.
    """
    __tablename__ = 'call_transcripts'

    # Primary key
    id = Column(String(36), primary_key=True)

    # Foreign keys
    userId = Column('userId', String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    callLogId = Column('callLogId', String(36), ForeignKey('call_logs.id', ondelete='CASCADE'), nullable=False, unique=True, index=True)

    # Transcript metadata
    language = Column(String(10), nullable=True)
    duration = Column(Float, nullable=True)
    segmentCount = Column('segmentCount', Integer, default=0)

    # Analysis fields
    sentiment = Column(String(20), nullable=True)
    summary = Column(Text, nullable=True)
    keywords = Column(JSONB, nullable=True)

    # Status tracking
    status = Column(String(20), default='processing')
    errorMessage = Column('errorMessage', Text, nullable=True)

    # Timestamps
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False, index=True)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completedAt = Column('completedAt', DateTime, nullable=True)

    # Relationships
    segments = relationship('TranscriptSegment', back_populates='transcript', cascade='all, delete-orphan', order_by='TranscriptSegment.startTime')
    call_log = relationship('CallLog', foreign_keys=[callLogId])

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'id': self.id,
            'userId': self.userId,
            'callLogId': self.callLogId,
            'language': self.language,
            'duration': self.duration,
            'segmentCount': self.segmentCount,
            'sentiment': self.sentiment,
            'summary': self.summary,
            'keywords': self.keywords,
            'status': self.status,
            'errorMessage': self.errorMessage,
            'createdAt': self.createdAt.isoformat() if self.createdAt else None,
            'updatedAt': self.updatedAt.isoformat() if self.updatedAt else None,
            'completedAt': self.completedAt.isoformat() if self.completedAt else None,
            'segments': [seg.to_dict() for seg in self.segments] if self.segments else []
        }


class TranscriptSegment(Base):
    """
    Individual transcript segment (utterance).
    Multiple segments per transcript.
    """
    __tablename__ = 'transcript_segments'

    # Primary key
    id = Column(String(36), primary_key=True)

    # Foreign key
    transcriptId = Column('transcriptId', String(36), ForeignKey('call_transcripts.id', ondelete='CASCADE'), nullable=False, index=True)

    # Segment identification
    sequenceNumber = Column('sequenceNumber', Integer, nullable=False)
    speaker = Column(String(20), nullable=False)
    speakerId = Column('speakerId', String(100), nullable=True)

    # Timing
    startTime = Column('startTime', Float, nullable=False)
    endTime = Column('endTime', Float, nullable=False)

    # Content
    text = Column(Text, nullable=False)
    confidence = Column(Float, nullable=True)

    # Metadata
    language = Column(String(10), nullable=True)
    isFinal = Column('isFinal', Boolean, default=True)
    segment_metadata = Column('segment_metadata', JSONB, nullable=True)

    # Timestamps
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    transcript = relationship('CallTranscript', back_populates='segments')

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'id': self.id,
            'transcriptId': self.transcriptId,
            'sequenceNumber': self.sequenceNumber,
            'speaker': self.speaker,
            'speakerId': self.speakerId,
            'startTime': self.startTime,
            'endTime': self.endTime,
            'text': self.text,
            'confidence': self.confidence,
            'language': self.language,
            'isFinal': self.isFinal,
            'metadata': self.segment_metadata,
            'createdAt': self.createdAt.isoformat() if self.createdAt else None
        }

# ============================================
# Lead Capture Funnel Models (Sprint 2)
# ============================================

class Funnel(Base):
    """Lead capture funnel configuration."""
    __tablename__ = 'funnels'

    # Core Identity
    id = Column(String(36), primary_key=True)
    userId = Column('userId', String(36), ForeignKey('users.id'), nullable=False)

    # Basic Info
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text)

    # Configuration
    funnelType = Column('funnelType', String(50), default='lead_capture', nullable=False)
    # Types: lead_capture, appointment_booking, survey, product_inquiry

    isPublished = Column('isPublished', Boolean, default=False, nullable=False)
    customDomain = Column('customDomain', String(255))

    # Theme Configuration (JSONB)
    # Structure: {primaryColor, secondaryColor, accentColor, fontFamily, fontSize, buttonStyle, backgroundImage, backgroundType}
    themeConfig = Column('themeConfig', JSONB)

    # SEO Configuration (JSONB)
    # Structure: {title, description, ogImage, ogTitle, ogDescription, twitterCard, twitterImage}
    seoConfig = Column('seoConfig', JSONB)

    # Tracking Configuration (JSONB)
    # Structure: {googleAnalyticsId, facebookPixelId, linkedInInsightTag, customScripts[]}
    trackingConfig = Column('trackingConfig', JSONB)

    # Metadata
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship('User', foreign_keys=[userId])
    pages = relationship('FunnelPage', back_populates='funnel', cascade='all, delete-orphan')
    submissions = relationship('FunnelSubmission', back_populates='funnel', cascade='all, delete-orphan')
    funnel_leads = relationship('FunnelLead', back_populates='funnel')


class FunnelPage(Base):
    """Individual page within a funnel."""
    __tablename__ = 'funnel_pages'

    # Core Identity
    id = Column(String(36), primary_key=True)
    funnelId = Column('funnelId', String(36), ForeignKey('funnels.id'), nullable=False)

    # Page Configuration
    pageOrder = Column('pageOrder', Integer, default=0, nullable=False)
    pageType = Column('pageType', String(50), nullable=False)
    # Types: landing, form, thank_you, call_scheduled

    name = Column(String(255), nullable=False)

    # Page Content (JSONB)
    # Structure: {headline, subheadline, bodyText, imageUrl, videoUrl, ctaText, ctaStyle, sections: [{type, content, order}]}
    content = Column(JSONB, nullable=False)

    # Form Fields (JSONB array)
    # Structure: [{fieldType, name, label, placeholder, required, validation, options}]
    formFields = Column('formFields', JSONB)

    # Metadata
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    funnel = relationship('Funnel', back_populates='pages')
    submissions = relationship('FunnelSubmission', back_populates='page')


class FunnelLead(Base):
    """Captured lead information from funnels."""
    __tablename__ = 'funnel_leads'

    # Core Identity
    id = Column(String(36), primary_key=True)
    userId = Column('userId', String(36), ForeignKey('users.id'), nullable=False)  # Funnel owner
    funnelId = Column('funnelId', String(36), ForeignKey('funnels.id'), nullable=True)  # NULL for manual entry
    source = Column(String(50), default='funnel', nullable=False)
    # Sources: funnel, manual, api, import

    # Contact Information
    firstName = Column('firstName', String(255))
    lastName = Column('lastName', String(255))
    email = Column(String(255))
    phone = Column(String(50))
    company = Column(String(255))

    # Custom Fields (JSONB) - Flexible storage for additional data
    customFields = Column('customFields', JSONB)

    # Lead Management
    status = Column(String(50), default='new', nullable=False)
    # Statuses: new, contacted, qualified, unqualified, converted, lost

    assignedAgentId = Column('assignedAgentId', String(36), ForeignKey('agent_configs.id'), nullable=True)
    leadScore = Column('leadScore', Integer, default=0, nullable=False)  # 0-100

    # Tags (JSONB array of strings)
    tags = Column(JSONB, default='[]')

    # Metadata
    createdAt = Column('createdAt', DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column('updatedAt', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship('User', foreign_keys=[userId])
    funnel = relationship('Funnel', back_populates='funnel_leads')
    assigned_agent = relationship('AgentConfig', foreign_keys=[assignedAgentId])
    submissions = relationship('FunnelSubmission', foreign_keys='FunnelSubmission.leadId', back_populates='funnel_lead')


class FunnelSubmission(Base):
    """Complete form submission tracking."""
    __tablename__ = 'funnel_submissions'

    # Core Identity
    id = Column(String(36), primary_key=True)
    funnelId = Column('funnelId', String(36), ForeignKey('funnels.id'), nullable=False)
    leadId = Column('leadId', String(36), ForeignKey('funnel_leads.id'), nullable=True)  # Created after submission processing
    pageId = Column('pageId', String(36), ForeignKey('funnel_pages.id'), nullable=False)

    # Submission Data (JSONB) - Complete form data as submitted
    submissionData = Column('submissionData', JSONB, nullable=False)

    # Tracking Information
    ipAddress = Column('ipAddress', String(45))  # IPv6 support
    userAgent = Column('userAgent', Text)
    referrer = Column(Text)

    # UTM Parameters (JSONB)
    # Structure: {utmSource, utmMedium, utmCampaign, utmTerm, utmContent}
    utmParams = Column('utmParams', JSONB)

    # Metadata
    submittedAt = Column('submittedAt', DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    funnel = relationship('Funnel', back_populates='submissions')
    funnel_lead = relationship('FunnelLead', back_populates='submissions')
    page = relationship('FunnelPage', back_populates='submissions')


class ExportLog(Base):
    """Audit log for CSV exports."""
    __tablename__ = 'export_logs'

    # Core Identity
    id = Column(String(36), primary_key=True)
    userId = Column('user_id', String(36), ForeignKey('users.id'), nullable=False)

    # Export Details
    exportType = Column('export_type', String(50), nullable=False)  # calls|agents|phone_numbers|analytics
    filters = Column(JSONB)  # Filter parameters used
    rowCount = Column('row_count', Integer)  # Number of rows exported
    fileSizeBytes = Column('file_size_bytes', Integer)  # Size of export in bytes

    # Tracking
    ipAddress = Column('ip_address', String(45))
    userAgent = Column('user_agent', Text)
    createdAt = Column('created_at', DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship('User')


def generate_brand_context(brand_profile):
    """
    Generate brand context string from brand profile for agent instructions.
    Used to compute agent instructions: persona.instructions + brand_context
    """
    if not brand_profile:
        return ""

    brand_data = brand_profile.brandData or {}
    context_parts = []

    # Company name
    context_parts.append(f"Company: {brand_profile.companyName}")

    # Brand voice (custom or extracted)
    brand_voice = brand_profile.customBrandVoice or brand_data.get('brand_voice')
    if brand_voice:
        context_parts.append(f"Brand Voice: {brand_voice}")

    # Tone guidelines
    tone = brand_profile.customToneGuidelines or brand_data.get('tone_guidelines')
    if tone:
        context_parts.append(f"Communication Style: {tone}")

    # Target audience
    if brand_data.get('target_audience'):
        context_parts.append(f"Target Audience: {brand_data['target_audience']}")

    # Key products
    if brand_data.get('key_products'):
        products = ', '.join(brand_data['key_products'])
        context_parts.append(f"Key Products: {products}")

    # Key services
    if brand_data.get('key_services'):
        services = ', '.join(brand_data['key_services'])
        context_parts.append(f"Key Services: {services}")

    # Company values
    if brand_data.get('company_values'):
        values = ', '.join(brand_data['company_values'])
        context_parts.append(f"Company Values: {values}")

    # Do's and Don'ts
    dos_and_donts = brand_profile.dosAndDonts or {}
    if dos_and_donts.get('dos'):
        dos = '\n'.join([f"- {d}" for d in dos_and_donts['dos']])
        context_parts.append(f"\nDo's:\n{dos}")

    if dos_and_donts.get('donts'):
        donts = '\n'.join([f"- {d}" for d in dos_and_donts['donts']])
        context_parts.append(f"\nDon'ts:\n{donts}")

    return '\n'.join(context_parts)


def compute_agent_instructions(agent, db_session):
    """
    Compute full agent instructions from three-layer architecture.

    Layer 1: Brand Context (company-level brand voice and guidelines)
    Layer 2: Persona Instructions (role-specific behavior and knowledge)
    Layer 3: Custom Instructions (agent-specific overrides and additions)

    Returns:
        - agent.instructions if personaId is null (legacy agent)
        - brand_context + persona.instructions + customInstructions if personaId is set
    """
    # Legacy agents without persona
    if not agent.personaId:
        return agent.instructions

    # Get persona
    persona = db_session.query(Persona).filter(Persona.id == agent.personaId).first()
    if not persona:
        return agent.instructions  # Fallback

    # Get brand profile
    brand_profile = None
    if agent.brandProfileId:
        brand_profile = db_session.query(BrandProfile).filter(
            BrandProfile.id == agent.brandProfileId
        ).first()
    elif agent.userId:
        # Fallback to user's brand profile if not explicitly set
        brand_profile = db_session.query(BrandProfile).filter(
            BrandProfile.userId == agent.userId
        ).first()

    # Generate brand context
    brand_context = generate_brand_context(brand_profile) if brand_profile else ""

    # Layer 1 + Layer 2: Combine brand context with persona instructions
    if brand_context:
        base_instructions = f"{brand_context}\n\n{persona.instructions}"
    else:
        base_instructions = persona.instructions

    # Layer 3: Add agent-specific custom instructions if provided
    if agent.customInstructions:
        return f"{base_instructions}\n\nAdditional Instructions:\n{agent.customInstructions}"

    return base_instructions


def init_db():
    """Initialize database and create tables."""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        return db
    finally:
        pass

if __name__ == '__main__':
    init_db()
