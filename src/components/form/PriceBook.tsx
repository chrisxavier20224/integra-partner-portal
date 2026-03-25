/**
 * PriceBook — read-only product catalogue for Elevate agents
 * Pulls from a static config (or could be HubSpot products API in future)
 */

import React, { useState } from 'react';
import { Wifi, Zap, Shield, Radio, Globe, Router, Server } from 'lucide-react';

interface Product {
  name: string;
  description: string;
  monthlyPrice: string;
  installPrice: string;
  icon: React.ReactNode;
  category: 'core' | 'addon';
  highlight?: boolean;
}

const PRODUCTS: Product[] = [
  {
    name: 'Integra Home',
    description: 'Single 4G/5G router for home workers and light business use. Ideal for remote employees needing reliable backup connectivity.',
    monthlyPrice: '£49.99',
    installPrice: '£199.99',
    icon: <Wifi size={20} />,
    category: 'core',
  },
  {
    name: 'Starlink SD-WAN',
    description: 'Starlink satellite combined with cellular failover. Perfect for rural business locations with no fixed-line options.',
    monthlyPrice: '£99.99',
    installPrice: '£399.99',
    icon: <Globe size={20} />,
    category: 'core',
  },
  {
    name: 'Integra Lite',
    description: 'Dual-network load-balancing solution. Two SIMs across different carriers for light business resilience at a lower cost.',
    monthlyPrice: '£89.99',
    installPrice: '£299.99',
    icon: <Shield size={20} />,
    category: 'core',
  },
  {
    name: 'Integra Pro',
    description: 'Bonded 4G/5G SD-WAN with dual SIMs. Our most popular business product — aggregated bandwidth with automatic failover.',
    monthlyPrice: '£149.99',
    installPrice: '£399.99',
    icon: <Zap size={20} />,
    category: 'core',
    highlight: true,
  },
  {
    name: 'Integra Ultrafast',
    description: 'Triple-SIM bonded solution with 5G priority. Maximum bandwidth for demanding applications and multi-user sites.',
    monthlyPrice: '£199.99',
    installPrice: '£499.99',
    icon: <Radio size={20} />,
    category: 'core',
  },
  {
    name: 'Integra Enterprise',
    description: 'Quad-SIM bonded SD-WAN with Bondix platform. Enterprise-grade with SLA-backed performance for critical operations.',
    monthlyPrice: '£299.99',
    installPrice: '£599.99',
    icon: <Server size={20} />,
    category: 'core',
  },
  {
    name: 'Starlink Business-to-Business',
    description: 'Starlink business plan with 4G/5G bonded backup. Premium satellite + cellular for maximum resilience.',
    monthlyPrice: '£349.99',
    installPrice: '£799.99',
    icon: <Globe size={20} />,
    category: 'core',
  },
  {
    name: 'Static IP',
    description: 'Dedicated static IP address for remote access, VPN, CCTV, and server hosting.',
    monthlyPrice: '£10.00',
    installPrice: '—',
    icon: <Router size={20} />,
    category: 'addon',
  },
  {
    name: 'P2P Radio Link Management',
    description: 'Point-to-point wireless link management for building-to-building connectivity.',
    monthlyPrice: '£2.00',
    installPrice: '£420.00',
    icon: <Radio size={20} />,
    category: 'addon',
  },
  {
    name: 'Mesh AP Management',
    description: 'Managed mesh access point for extending WiFi coverage across larger sites.',
    monthlyPrice: '£2.00',
    installPrice: '£80.00',
    icon: <Wifi size={20} />,
    category: 'addon',
  },
];

export const PriceBook: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'core' | 'addon'>('all');

  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-integra-navy mb-1">Price Book</h2>
        <p className="text-sm text-gray-500">Integra Networks product catalogue — all prices exclude VAT</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all' as const, label: 'All Products' },
          { id: 'core' as const, label: 'Core Solutions' },
          { id: 'addon' as const, label: 'Add-ons' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-integra-blue text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((product) => (
          <div
            key={product.name}
            className={`card-static flex items-start gap-4 ${
              product.highlight ? 'ring-2 ring-integra-blue ring-opacity-50' : ''
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              product.highlight ? 'bg-integra-blue text-white' : 'bg-integra-light text-integra-blue'
            }`}>
              {product.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-integra-navy flex items-center gap-2">
                    {product.name}
                    {product.highlight && (
                      <span className="badge badge-primary text-xs">Most Popular</span>
                    )}
                    {product.category === 'addon' && (
                      <span className="badge bg-gray-100 text-gray-500 text-xs">Add-on</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-integra-navy">{product.monthlyPrice}<span className="text-xs font-normal text-gray-500">/mo</span></p>
                  <p className="text-xs text-gray-500">Install: {product.installPrice}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="alert alert-info">
        <p className="text-sm">
          Prices shown are standard retail (ex-VAT). Elevate partner pricing is bespoke per opportunity.
          Submit the opportunity and the Integra team will prepare a tailored proposal.
        </p>
      </div>
    </div>
  );
};
