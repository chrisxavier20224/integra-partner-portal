/**
 * SubmissionHistory — list of agent's past submissions
 */

import React, { useState, useEffect } from 'react';
import { Clock, Building2, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import type { Submission } from '@/types';
import { URGENCY_LABELS } from '@/types';
import { getSubmissions } from '@/services/supabaseClient';

interface SubmissionHistoryProps {
  agentId: string;
}

export const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ agentId }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSubmissions(agentId);
        setSubmissions(data);
      } catch (err) {
        console.warn('Failed to load submissions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [agentId]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 size={32} className="animate-spin text-integra-blue mx-auto mb-4" />
        <p className="text-gray-500">Loading submissions...</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-integra-navy mb-2">No Submissions Yet</h2>
        <p className="text-gray-500">Your submitted opportunities will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-integra-navy mb-1">My Submissions</h2>
        <p className="text-sm text-gray-500">{submissions.length} opportunit{submissions.length === 1 ? 'y' : 'ies'} submitted</p>
      </div>

      {submissions.map((sub) => (
        <div key={sub.id} className="card-static">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-integra-light rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-integra-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-integra-navy">{sub.company_name}</h3>
                <p className="text-xs font-mono text-integra-blue font-medium">{sub.elevate_ref}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {sub.sites.length} site{sub.sites.length > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(sub.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`badge ${
                sub.urgency === 'emergency' ? 'badge-danger' :
                sub.urgency === 'priority' ? 'badge-warning' :
                'badge-primary'
              }`}>
                {URGENCY_LABELS[sub.urgency].split(' (')[0]}
              </span>

              {sub.status === 'submitted' ? (
                <span className="badge badge-success">
                  <CheckCircle size={12} className="mr-1" />
                  Sent
                </span>
              ) : (
                <span className="badge badge-danger">
                  <AlertCircle size={12} className="mr-1" />
                  Failed
                </span>
              )}
            </div>
          </div>

          {/* Site names */}
          <div className="mt-3 flex flex-wrap gap-2">
            {sub.sites.map((site, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {site.site_name || `Site ${i + 1}`}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
