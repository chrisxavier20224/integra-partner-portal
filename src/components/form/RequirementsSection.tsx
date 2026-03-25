/**
 * RequirementsSection — connectivity requirements fields
 */

import React from 'react';
import type { Requirements, SolutionType, ConnectivityNeed, YesNoNotSure } from '@/types';
import { CONNECTIVITY_NEED_LABELS, YES_NO_LABELS } from '@/types';

interface RequirementsSectionProps {
  requirements: Requirements;
  onChange: (updates: Partial<Requirements>) => void;
}

export const RequirementsSection: React.FC<RequirementsSectionProps> = ({
  requirements,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Solution Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label form-label-required">Solution Type</label>
          <select
            className="form-select"
            value={requirements.solution_type}
            onChange={(e) => onChange({ solution_type: e.target.value as SolutionType })}
          >
            <option value="permanent">Permanent</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>

        {/* Conditional: Duration */}
        {requirements.solution_type === 'temporary' && (
          <div>
            <label className="form-label form-label-required">Duration</label>
            <input
              type="text"
              className="form-input"
              placeholder='e.g. "3 months", "6 weeks"'
              value={requirements.temp_duration}
              onChange={(e) => onChange({ temp_duration: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Connectivity Need (merged use case + primary/backup) */}
      <div>
        <label className="form-label form-label-required">What is the connectivity for?</label>
        <select
          className="form-select"
          value={requirements.connectivity_need}
          onChange={(e) => onChange({ connectivity_need: e.target.value as ConnectivityNeed })}
        >
          {Object.entries(CONNECTIVITY_NEED_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Users & Existing Connectivity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Number of Users at Location</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 25, 100+"
            value={requirements.users_at_location}
            onChange={(e) => onChange({ users_at_location: e.target.value })}
          />
          <p className="form-help">Helps us size the solution</p>
        </div>

        <div>
          <label className="form-label">Existing Connectivity</label>
          <input
            type="text"
            className="form-input"
            placeholder='e.g. "BT Openreach FTTC 40/10" or "None"'
            value={requirements.existing_connectivity}
            onChange={(e) => onChange({ existing_connectivity: e.target.value })}
          />
        </div>
      </div>

      {/* Static IP & WiFi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label form-label-required">Static IP Required?</label>
          <select
            className="form-select"
            value={requirements.static_ip_required}
            onChange={(e) => onChange({ static_ip_required: e.target.value as YesNoNotSure })}
          >
            {Object.entries(YES_NO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label form-label-required">WiFi Coverage Needed?</label>
          <select
            className="form-select"
            value={requirements.wifi_needed}
            onChange={(e) => onChange({ wifi_needed: e.target.value as YesNoNotSure })}
          >
            {Object.entries(YES_NO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Other Requirements */}
      <div>
        <label className="form-label">Any Other Requirements</label>
        <textarea
          className="form-textarea"
          rows={3}
          placeholder="Anything else we should know about..."
          value={requirements.other_requirements}
          onChange={(e) => onChange({ other_requirements: e.target.value })}
        />
      </div>
    </div>
  );
};
