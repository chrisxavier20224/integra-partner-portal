/**
 * ReviewSummary — shows a read-only summary before submission
 */

import React from 'react';
import type { SubmissionFormData } from '@/types';
import {
  BUILDING_TYPE_LABELS,
  CONNECTIVITY_NEED_LABELS,
  URGENCY_LABELS,
  YES_NO_LABELS,
} from '@/types';

interface ReviewSummaryProps {
  formData: SubmissionFormData;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ formData }) => {
  const r = formData.requirements;

  return (
    <div className="space-y-6">
      {/* Agent */}
      <div className="card-static">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Sales Agent</h3>
        <p className="text-base font-medium text-integra-navy">{formData.agent_name}</p>
        <p className="text-sm text-gray-600">{formData.agent_email}</p>
      </div>

      {/* Company */}
      <div className="card-static">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">End User</h3>
        <p className="text-base font-medium text-integra-navy">{formData.company_name}</p>
        {formData.account_ref && (
          <p className="text-sm text-gray-600">Ref: {formData.account_ref}</p>
        )}
      </div>

      {/* Sites */}
      {formData.sites.map((site, i) => (
        <div key={site.id} className="card-static">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Site {i + 1}: {site.site_name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Address:</span>{' '}
              <span className="text-gray-600">{site.site_address}</span>
            </div>
            {site.site_coordinates && (
              <div>
                <span className="font-medium text-gray-700">Coordinates:</span>{' '}
                <span className="text-gray-600">{site.site_coordinates}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Building:</span>{' '}
              <span className="text-gray-600">{BUILDING_TYPE_LABELS[site.building_type]}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Buildings:</span>{' '}
              <span className="text-gray-600">{site.buildings_to_connect}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Requirements */}
      <div className="card-static">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Requirements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">Solution:</span>{' '}
            <span className="text-gray-600">
              {r.solution_type === 'permanent' ? 'Permanent' : `Temporary (${r.temp_duration})`}
            </span>
          </div>
          {r.users_at_location && (
            <div>
              <span className="font-medium text-gray-700">Users:</span>{' '}
              <span className="text-gray-600">{r.users_at_location}</span>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">Connectivity:</span>{' '}
            <span className="text-gray-600">{CONNECTIVITY_NEED_LABELS[r.connectivity_need]}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Static IP:</span>{' '}
            <span className="text-gray-600">{YES_NO_LABELS[r.static_ip_required]}</span>
          </div>
          {r.existing_connectivity && (
            <div>
              <span className="font-medium text-gray-700">Existing:</span>{' '}
              <span className="text-gray-600">{r.existing_connectivity}</span>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">WiFi:</span>{' '}
            <span className="text-gray-600">{YES_NO_LABELS[r.wifi_needed]}</span>
          </div>
        </div>
        {r.other_requirements && (
          <div className="mt-3 text-sm">
            <span className="font-medium text-gray-700">Other:</span>{' '}
            <span className="text-gray-600">{r.other_requirements}</span>
          </div>
        )}
      </div>

      {/* Urgency */}
      <div className="card-static">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Urgency</h3>
        <span className={`badge ${
          formData.urgency === 'emergency' ? 'badge-danger' :
          formData.urgency === 'priority' ? 'badge-warning' :
          'badge-primary'
        } text-sm`}>
          {URGENCY_LABELS[formData.urgency]}
        </span>
      </div>

      {/* Notes */}
      {formData.additional_notes && (
        <div className="card-static">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Additional Notes</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.additional_notes}</p>
        </div>
      )}
    </div>
  );
};
