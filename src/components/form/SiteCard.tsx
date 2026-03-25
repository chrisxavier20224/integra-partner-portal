/**
 * SiteCard — repeatable site detail section
 */

import React from 'react';
import { Trash2, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import type { Site, BuildingType } from '@/types';
import { BUILDING_TYPE_LABELS } from '@/types';

interface SiteCardProps {
  site: Site;
  index: number;
  isOnly: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (updates: Partial<Site>) => void;
  onRemove: () => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  index,
  isOnly,
  isExpanded,
  onToggle,
  onChange,
  onRemove,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Collapse Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-integra-blue" />
          <span className="font-medium text-sm text-integra-navy">
            {site.site_name || `Site ${index + 1}`}
          </span>
          {site.site_address && (
            <span className="text-xs text-gray-500 hidden sm:inline">
              — {site.site_address.substring(0, 40)}{site.site_address.length > 40 ? '...' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isOnly && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove site"
            >
              <Trash2 size={16} />
            </button>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Site Name */}
          <div>
            <label className="form-label form-label-required">Site Name / Label</label>
            <input
              type="text"
              className="form-input"
              placeholder='e.g. "Head Office", "Warehouse 2", "Site A"'
              value={site.site_name}
              onChange={(e) => onChange({ site_name: e.target.value })}
            />
          </div>

          {/* Address */}
          <div>
            <label className="form-label form-label-required">Site Address</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Full address including postcode"
              value={site.site_address}
              onChange={(e) => onChange({ site_address: e.target.value })}
            />
          </div>

          {/* Coordinates */}
          <div>
            <label className="form-label">Site Coordinates</label>
            <input
              type="text"
              className="form-input"
              placeholder="Lat, Long (e.g. 53.4808, -2.2426)"
              value={site.site_coordinates}
              onChange={(e) => onChange({ site_coordinates: e.target.value })}
            />
            <div className="mt-1.5 p-3 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-xs font-medium text-integra-blue mb-1">How to get coordinates from Google Maps:</p>
              <ol className="text-xs text-gray-600 space-y-0.5 list-decimal list-inside">
                <li>Open <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-integra-blue underline">Google Maps</a> and find the site location</li>
                <li>Right-click on the exact building or location</li>
                <li>Click the coordinates at the top of the menu to copy them</li>
                <li>Paste them into the field above</li>
              </ol>
              <p className="text-xs text-gray-500 mt-1">Providing coordinates speeds up our survey process significantly.</p>
            </div>
          </div>

          {/* Building Type & Buildings Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label form-label-required">Building Type</label>
              <select
                className="form-select"
                value={site.building_type}
                onChange={(e) => onChange({ building_type: e.target.value as BuildingType })}
              >
                {Object.entries(BUILDING_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Buildings to Connect</label>
              <input
                type="number"
                className="form-input"
                min={1}
                max={50}
                value={site.buildings_to_connect}
                onChange={(e) => onChange({ buildings_to_connect: parseInt(e.target.value) || 1 })}
              />
              <p className="form-help">For campus / multi-building sites</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
