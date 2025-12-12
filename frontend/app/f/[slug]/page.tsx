'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button, Input, Textarea, Card, CardBody, CardHeader } from '@heroui/react';

interface FormField {
  fieldType: string;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: string;
  options?: Array<{ label: string; value: string }>;
}

interface FunnelPage {
  id: string;
  pageOrder: number;
  pageType: string;
  name: string;
  content: {
    headline?: string;
    subheadline?: string;
    bodyText?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaStyle?: string;
    sections?: Array<{
      type: string;
      content: any;
      order: number;
    }>;
  };
  formFields?: FormField[];
}

interface Funnel {
  id: string;
  name: string;
  slug: string;
  description?: string;
  funnelType: string;
  themeConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    buttonStyle?: string;
  };
  seoConfig?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  pages: FunnelPage[];
}

export default function FunnelPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load funnel data
  useEffect(() => {
    const loadFunnel = async () => {
      try {
        const response = await fetch(`http://localhost:5001/f/${slug}`);
        if (!response.ok) {
          throw new Error('Funnel not found');
        }
        const data = await response.json();
        setFunnel(data);

        // Set page title and meta
        if (data.seoConfig?.title) {
          document.title = data.seoConfig.title;
        }
      } catch (error) {
        console.error('Error loading funnel:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFunnel();
  }, [slug]);

  // Apply theme
  useEffect(() => {
    if (!funnel?.themeConfig) return;

    const theme = funnel.themeConfig;
    const root = document.documentElement;

    if (theme.primaryColor) {
      root.style.setProperty('--funnel-primary', theme.primaryColor);
    }
    if (theme.secondaryColor) {
      root.style.setProperty('--funnel-secondary', theme.secondaryColor);
    }
    if (theme.fontFamily) {
      root.style.setProperty('--funnel-font', theme.fontFamily);
    }
  }, [funnel]);

  const validateField = (field: FormField, value: string): string | null => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (value && field.fieldType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Invalid email format';
      }
    }

    if (value && field.fieldType === 'phone') {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(value)) {
        return 'Invalid phone number format';
      }
    }

    if (value && field.validation) {
      try {
        const regex = new RegExp(field.validation);
        if (!regex.test(value)) {
          return `${field.label} format is invalid`;
        }
      } catch (e) {
        console.error('Invalid regex pattern:', field.validation);
      }
    }

    return null;
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!funnel) return;

    const currentPage = funnel.pages[currentPageIndex];
    const fields = currentPage.formFields || [];

    // Validate all fields
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      const error = validateField(field, formData[field.name] || '');
      if (error) {
        newErrors[field.name] = error;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5001/f/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: currentPage.id,
          form_data: formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.field) {
          setErrors({ [errorData.field]: errorData.error });
        } else {
          throw new Error(errorData.error || 'Submission failed');
        }
        return;
      }

      const result = await response.json();
      setSubmitted(true);

      // Move to next page or thank you page
      const nextPageIndex = currentPageIndex + 1;
      if (nextPageIndex < funnel.pages.length) {
        setCurrentPageIndex(nextPageIndex);
        setFormData({});
        setErrors({});
        setSubmitted(false);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ _general: 'Failed to submit form. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    const commonProps = {
      label: field.label,
      placeholder: field.placeholder || field.label,
      value,
      onChange: (e: any) => handleFieldChange(field.name, e.target.value),
      isRequired: field.required,
      isInvalid: !!error,
      errorMessage: error,
      className: 'mb-4'
    };

    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            key={field.name}
            type={field.fieldType === 'phone' ? 'tel' : field.fieldType}
            {...commonProps}
          />
        );

      case 'textarea':
        return (
          <Textarea
            key={field.name}
            minRows={3}
            {...commonProps}
          />
        );

      case 'select':
        return (
          <select
            key={field.name}
            className="w-full p-2 border rounded-lg mb-4"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody>
            <h1 className="text-2xl font-bold mb-2">Funnel Not Found</h1>
            <p className="text-gray-600">The requested funnel could not be found or is not published.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const currentPage = funnel.pages[currentPageIndex];
  const isThankYouPage = currentPage.pageType === 'thank_you';

  return (
    <div
      className="min-h-screen bg-gray-50 py-12 px-4"
      style={{ fontFamily: funnel.themeConfig?.fontFamily || 'inherit' }}
    >
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="flex-col items-start gap-2 pb-4">
            {currentPage.content.headline && (
              <h1
                className="text-3xl font-bold"
                style={{ color: funnel.themeConfig?.primaryColor || 'inherit' }}
              >
                {currentPage.content.headline}
              </h1>
            )}
            {currentPage.content.subheadline && (
              <p className="text-xl text-gray-600">
                {currentPage.content.subheadline}
              </p>
            )}
          </CardHeader>

          <CardBody className="gap-4">
            {currentPage.content.imageUrl && (
              <img
                src={currentPage.content.imageUrl}
                alt={currentPage.content.headline || 'Funnel image'}
                className="w-full h-auto rounded-lg mb-6"
              />
            )}

            {currentPage.content.bodyText && (
              <div
                className="prose max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: currentPage.content.bodyText }}
              />
            )}

            {/* Render custom sections */}
            {currentPage.content.sections?.map((section, idx) => (
              <div key={idx} className="mb-4">
                {section.type === 'urgency' && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="font-bold text-red-700">{section.content.text}</p>
                  </div>
                )}
                {section.type === 'benefits' && (
                  <ul className="list-disc list-inside space-y-2">
                    {section.content.benefits?.map((benefit: string, i: number) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {!isThankYouPage && currentPage.formFields && currentPage.formFields.length > 0 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {currentPage.formFields.map(field => renderFormField(field))}

                {errors._general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {errors._general}
                  </div>
                )}

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  fullWidth
                  isLoading={submitting}
                  style={{
                    backgroundColor: funnel.themeConfig?.primaryColor || undefined,
                    borderRadius: funnel.themeConfig?.buttonStyle === 'rounded' ? '9999px' : '0.5rem'
                  }}
                >
                  {submitting ? 'Submitting...' : (currentPage.content.ctaText || 'Submit')}
                </Button>
              </form>
            )}

            {isThankYouPage && (
              <div className="text-center py-8">
                <p className="text-lg text-gray-700 mb-4">
                  {currentPage.content.bodyText || 'Thank you for your submission!'}
                </p>
                {currentPage.content.sections?.some(s => s.type === 'urgency') && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mt-4">
                    <p className="font-bold text-green-700">
                      We'll contact you within 30 seconds!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Page progress indicator */}
            {funnel.pages.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {funnel.pages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-8 rounded ${
                      idx === currentPageIndex
                        ? 'bg-blue-600'
                        : idx < currentPageIndex
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
