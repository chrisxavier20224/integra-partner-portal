/**
 * SubmissionForm — the main multi-section opportunity form
 */

import React, { useState, useCallback } from 'react';
import { Plus, Send, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { SubmissionFormData, Site, Requirements, UrgencyLevel, Agent } from '@/types';
import { createEmptySite, createEmptyFormData, URGENCY_LABELS, URGENCY_SLA } from '@/types';
import { SiteCard } from './SiteCard';
import { RequirementsSection } from './RequirementsSection';
import { ReviewSummary } from './ReviewSummary';
import { submitOpportunity, type SubmissionResult } from '@/services/hubspotApi';
import { saveSubmission, generateElevateRef } from '@/services/supabaseClient';

interface SubmissionFormProps {
  agent: Agent;
  onSubmitted: () => void;
}

type FormStep = 'details' | 'sites' | 'requirements' | 'urgency' | 'review';

const STEPS: { id: FormStep; label: string }[] = [
  { id: 'details', label: 'End User' },
  { id: 'sites', label: 'Sites' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'urgency', label: 'Urgency' },
  { id: 'review', label: 'Review' },
];

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ agent, onSubmitted }) => {
  const [formData, setFormData] = useState<SubmissionFormData>(createEmptyFormData(agent));
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set([formData.sites[0].id]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmissionResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const step = STEPS[currentStep];

  // ── Field Updates ───────────────────────────────────────────
  const updateField = useCallback(<K extends keyof SubmissionFormData>(
    field: K,
    value: SubmissionFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateSite = useCallback((siteId: string, updates: Partial<Site>) => {
    setFormData((prev) => ({
      ...prev,
      sites: prev.sites.map((s) => (s.id === siteId ? { ...s, ...updates } : s)),
    }));
  }, []);

  const addSite = useCallback(() => {
    const newSite = createEmptySite();
    setFormData((prev) => ({ ...prev, sites: [...prev.sites, newSite] }));
    setExpandedSites((prev) => new Set([...prev, newSite.id]));
  }, []);

  const removeSite = useCallback((siteId: string) => {
    setFormData((prev) => ({
      ...prev,
      sites: prev.sites.filter((s) => s.id !== siteId),
    }));
    setExpandedSites((prev) => {
      const next = new Set(prev);
      next.delete(siteId);
      return next;
    });
  }, []);

  const updateRequirements = useCallback((updates: Partial<Requirements>) => {
    setFormData((prev) => ({
      ...prev,
      requirements: { ...prev.requirements, ...updates },
    }));
  }, []);

  // ── Validation ──────────────────────────────────────────────
  const validateStep = (stepId: FormStep): string[] => {
    const errors: string[] = [];

    switch (stepId) {
      case 'details':
        if (!formData.company_name.trim()) errors.push('End user name is required');
        break;

      case 'sites':
        formData.sites.forEach((site, i) => {
          if (!site.site_name.trim()) errors.push(`Site ${i + 1}: Name is required`);
          if (!site.site_address.trim()) errors.push(`Site ${i + 1}: Address is required`);
        });
        break;

      case 'requirements':
        if (formData.requirements.solution_type === 'temporary' && !formData.requirements.temp_duration.trim()) {
          errors.push('Duration is required for temporary solutions');
        }
        break;

      case 'urgency':
        // Urgency always has a default
        break;

      case 'review':
        // All prior steps should be valid
        break;
    }

    return errors;
  };

  // ── Navigation ──────────────────────────────────────────────
  const goNext = () => {
    const errors = validateStep(step.id);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setValidationErrors([]);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Generate ELEV-ID first
      const elevateRef = await generateElevateRef();

      const result = await submitOpportunity(
        elevateRef,
        formData.agent_name,
        formData.agent_email,
        formData.company_name,
        formData.account_ref,
        formData.sites,
        formData.requirements,
        formData.urgency,
        formData.additional_notes,
      );

      setSubmitResult(result);

      // Save to Supabase
      try {
        await saveSubmission(
          agent.id,
          elevateRef,
          formData.company_name,
          formData.account_ref,
          formData.sites,
          formData.requirements,
          formData.urgency,
          formData.additional_notes,
          result.dealId,
          result.errors.length === 0 ? 'submitted' : 'failed',
        );
      } catch (err) {
        console.warn('Failed to save submission to Supabase:', err);
      }

      if (result.errors.length === 0) {
        // Success — show confirmation
      } else if (result.dealId) {
        // Partial success (deal created but note/association failed)
        setSubmitError(`Warning: ${result.errors.join('; ')}`);
      } else {
        setSubmitError(`Submission failed: ${result.errors.join('; ')}`);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────
  if (submitResult && submitResult.dealId && !submitError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-integra-navy mb-2">Opportunity Submitted</h2>
        <div className="inline-block bg-integra-light border border-gray-200 rounded-lg px-4 py-2 mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Reference</p>
          <p className="text-lg font-bold text-integra-blue font-mono">{submitResult.elevateRef}</p>
        </div>
        <p className="text-gray-600 mb-2">
          Deal created for <strong>{formData.company_name}</strong>
          {formData.sites.length > 1 ? ` (${formData.sites.length} sites)` : ''}
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Use <strong>{submitResult.elevateRef}</strong> as your reference for this opportunity.
          The Integra team will review and be in touch.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setFormData(createEmptyFormData(agent));
              setCurrentStep(0);
              setSubmitResult(null);
              setSubmitError(null);
            }}
            className="btn-primary"
          >
            <Send size={16} className="mr-2" />
            Submit Another
          </button>
          <button onClick={onSubmitted} className="btn-secondary">
            View My Submissions
          </button>
        </div>
      </div>
    );
  }

  // ── Form Render ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (i < currentStep) {
                  setCurrentStep(i);
                  setValidationErrors([]);
                }
              }}
              disabled={i > currentStep}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                ${i === currentStep
                  ? 'bg-integra-blue text-white shadow-md'
                  : i < currentStep
                    ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <span className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-xs font-bold">
                {i < currentStep ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-0.5 ${i < currentStep ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="alert alert-error">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              {validationErrors.map((err, i) => (
                <p key={i} className="text-sm">{err}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div className="alert alert-error">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm">{submitError}</p>
          </div>
        </div>
      )}

      {/* ── Step Content ─────────────────────────────────────── */}

      {/* Step 1: End User Details */}
      {step.id === 'details' && (
        <div className="card-static space-y-6">
          <div>
            <h2 className="text-xl font-bold text-integra-navy mb-1">End User Details</h2>
            <p className="text-sm text-gray-500">Who is this opportunity for?</p>
          </div>

          {/* Agent info strip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-integra-blue rounded-full flex items-center justify-center text-white font-bold text-xs">
              {agent.full_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-integra-navy">{agent.full_name}</p>
              <p className="text-xs text-gray-500">{agent.email}</p>
            </div>
          </div>

          <div>
            <label className="form-label form-label-required">End User Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="End user / customer name"
              value={formData.company_name}
              onChange={(e) => updateField('company_name', e.target.value)}
              autoFocus
            />
            <p className="form-help">This becomes the deal name in our system</p>
          </div>

          <div>
            <label className="form-label">Account Reference</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your internal reference (optional)"
              value={formData.account_ref}
              onChange={(e) => updateField('account_ref', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 2: Sites */}
      {step.id === 'sites' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-integra-navy mb-1">Site Details</h2>
            <p className="text-sm text-gray-500">Where does the customer need connectivity?</p>
          </div>

          {formData.sites.map((site, index) => (
            <SiteCard
              key={site.id}
              site={site}
              index={index}
              isOnly={formData.sites.length === 1}
              isExpanded={expandedSites.has(site.id)}
              onToggle={() => {
                setExpandedSites((prev) => {
                  const next = new Set(prev);
                  if (next.has(site.id)) next.delete(site.id);
                  else next.add(site.id);
                  return next;
                });
              }}
              onChange={(updates) => updateSite(site.id, updates)}
              onRemove={() => removeSite(site.id)}
            />
          ))}

          <button
            type="button"
            onClick={addSite}
            className="btn-ghost w-full border-2 border-dashed border-gray-300 hover:border-integra-blue py-3"
          >
            <Plus size={18} className="mr-2" />
            Add Another Site
          </button>
        </div>
      )}

      {/* Step 3: Requirements */}
      {step.id === 'requirements' && (
        <div className="card-static space-y-6">
          <div>
            <h2 className="text-xl font-bold text-integra-navy mb-1">Requirements</h2>
            <p className="text-sm text-gray-500">What does the customer need?</p>
          </div>
          <RequirementsSection
            requirements={formData.requirements}
            onChange={updateRequirements}
          />
        </div>
      )}

      {/* Step 4: Urgency & SLA */}
      {step.id === 'urgency' && (
        <div className="card-static space-y-6">
          <div>
            <h2 className="text-xl font-bold text-integra-navy mb-1">Service Level & Notes</h2>
            <p className="text-sm text-gray-500">Select the service level for this opportunity. SLA timelines begin once we have all required information.</p>
          </div>

          <div>
            <label className="form-label form-label-required">Service Level</label>
            <div className="space-y-3">
              {(Object.entries(URGENCY_LABELS) as [UrgencyLevel, string][]).map(([value, label]) => (
                <label
                  key={value}
                  className={`
                    block p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${formData.urgency === value
                      ? value === 'emergency'
                        ? 'border-red-500 bg-red-50'
                        : value === 'priority'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-integra-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="urgency"
                      value={value}
                      checked={formData.urgency === value}
                      onChange={() => updateField('urgency', value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      formData.urgency === value ? 'border-integra-blue' : 'border-gray-300'
                    }`}>
                      {formData.urgency === value && (
                        <div className="w-2 h-2 rounded-full bg-integra-blue" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-integra-navy">{label}</span>
                      <p className="text-xs text-gray-600 mt-0.5">{URGENCY_SLA[value]}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Note:</strong> All SLA timelines are from receipt of complete information (coordinates, site access details).
                Priority and Emergency service levels may carry additional charges. Timelines are subject to site accessibility and equipment availability.
              </p>
            </div>
          </div>

          <div>
            <label className="form-label">Additional Notes</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Anything else we should know..."
              value={formData.additional_notes}
              onChange={(e) => updateField('additional_notes', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step.id === 'review' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-integra-navy mb-1">Review & Submit</h2>
            <p className="text-sm text-gray-500">Check everything looks right before submitting</p>
          </div>
          <ReviewSummary formData={formData} />
        </div>
      )}

      {/* ── Navigation Buttons ───────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={goBack}
          disabled={currentStep === 0}
          className="btn-secondary"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back
        </button>

        <span className="text-sm text-gray-500">
          Step {currentStep + 1} of {STEPS.length}
        </span>

        {currentStep === STEPS.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-1.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} className="mr-1.5" />
                Submit Opportunity
              </>
            )}
          </button>
        ) : (
          <button onClick={goNext} className="btn-primary">
            Next
            <ArrowRight size={16} className="ml-1.5" />
          </button>
        )}
      </div>
    </div>
  );
};
