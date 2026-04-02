/**
 * PriceBook — read-only product catalogue for Elevate agents
 * v2: LB / Bonded architecture toggle with split pricing
 * Pricing from ELEVATE_SOLUTIONS.md (April 2026)
 * Agent-facing descriptions — outcomes, not specs
 */

import React, { useState } from 'react';
import { Wifi, Zap, Shield, Radio, Globe, Router, Server, Gift, Calculator, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Info, ArrowRight } from 'lucide-react';

type Architecture = 'lb' | 'bonded';

interface Product {
  id: string;
  name: string;
  description: string;
  lbDescription?: string;
  bondedDescription?: string;
  monthlyPrice: string;
  bondedMonthlyPrice?: string;
  installPrice: string;
  speedBadge: string;
  bondedSpeedBadge?: string;
  icon: React.ReactNode;
  category: 'core' | 'addon';
  highlight?: boolean;
  badge?: string | null;
  note?: string | null;
  tags?: string[];
  hasBonded: boolean;
  features: string[];
  bondedFeatures?: string[];
}

const PRODUCTS: Product[] = [
  // ── Core Products ────────────────────────────────────
  {
    id: 'integra-backup',
    name: 'Integra Backup',
    description: 'Single-network 4G/5G failover for existing broadband. When primary broadband fails, traffic automatically switches to cellular. Zero downtime.',
    monthlyPrice: 'From £52',
    installPrice: '£800',
    speedBadge: 'Up to 250 / 50 Mbps',
    icon: <Shield size={20} />,
    category: 'core',
    hasBonded: false,
    features: [
      'Single-network 4G/5G failover',
      'External antenna installed',
      '24/7 monitored',
      'Auto-failover when broadband drops',
    ],
    tags: ['Rural', 'SME', 'Retail', 'Homeworker'],
  },
  {
    id: 'integra-home',
    name: 'Integra Home',
    description: 'Ideal for the remote worker or home office that needs reliable internet without a phone line. Easy sell to anyone working from home in a rural or poorly connected area. One router, one SIM, done.',
    monthlyPrice: '£55',
    installPrice: '£900*',
    speedBadge: 'Up to 250 Mbps',
    icon: <Wifi size={20} />,
    category: 'core',
    hasBonded: false,
    note: '*Launch offer until 31 March. Normal price £1,250 install.',
    features: [
      'Single router, single SIM',
      'No phone line required',
      'Professional installation',
      'Ideal for remote workers',
    ],
    tags: ['Rural', 'SME', 'Homeworker'],
  },
  {
    id: 'starlink-sdwan',
    name: 'Starlink SD-WAN',
    description: 'The answer to "we can\'t get a decent connection out here." Starlink satellite combined with cellular failover — perfect for farms, rural offices, and sites with zero fixed-line options.',
    monthlyPrice: '£80',
    installPrice: '£2,200',
    speedBadge: 'Up to 200 Mbps',
    icon: <Globe size={20} />,
    category: 'core',
    hasBonded: false,
    note: 'Customer supplies Starlink dish.',
    features: [
      'Starlink + cellular failover',
      'No fixed-line required',
      'Works anywhere with sky view',
      'SD-WAN managed',
    ],
    tags: ['Rural', 'Construction', 'Hospitality'],
  },
  {
    id: 'integra-lite',
    name: 'Integra Lite',
    description: 'Two SIMs, two networks, one affordable price. Great for SMEs that need more than a single connection but don\'t need enterprise-grade speeds.',
    lbDescription: 'Load balances traffic across two carriers independently. Each connection runs separately — aggregate bandwidth across sessions.',
    bondedDescription: 'True Layer 2 bonding via Bondix on two carriers. A single download uses both connections simultaneously. Static IP included.',
    monthlyPrice: '£99',
    bondedMonthlyPrice: '£119',
    installPrice: '£1,100',
    speedBadge: '100 / 70 Mbps',
    bondedSpeedBadge: '100 / 70 Mbps',
    icon: <Shield size={20} />,
    category: 'core',
    hasBonded: true,
    features: [
      'Dual-network across two carriers',
      'Built-in failover',
      'Ideal for low-bandwidth sites',
      'Professional installation included',
    ],
    bondedFeatures: [
      'True L2 bonding via Bondix',
      'Single download uses full bandwidth',
      'Static IP included',
      'Professional installation included',
    ],
    tags: ['SME', 'Retail', 'Hospitality'],
  },
  {
    id: 'integra-pro',
    name: 'Integra Pro',
    description: 'Your bread-and-butter product. Dual-carrier 5G with enough bandwidth for 10–25 users. Sells into offices, retail, hospitality, and any SME that\'s had enough of unreliable broadband.',
    lbDescription: 'Dual 5G modems in a single box. Traffic distributed across carriers independently — no bonding server required.',
    bondedDescription: 'Dedicated bonding CPU + companion router. True L2 bonding via Bondix — a single TCP session uses the combined bandwidth of both carriers.',
    monthlyPrice: '£135',
    bondedMonthlyPrice: '£165',
    installPrice: '£2,200',
    speedBadge: '300 / 150 Mbps',
    bondedSpeedBadge: '300 / 150 Mbps',
    icon: <Zap size={20} />,
    category: 'core',
    highlight: true,
    badge: 'Most Popular',
    hasBonded: true,
    features: [
      'Multi-network load balancing',
      'Advanced failover',
      'Priority support',
      'Static IP available (£10/mo)',
    ],
    bondedFeatures: [
      'True L2 bonding via Bondix',
      'Single download uses full bandwidth',
      'Static IP included',
      'Priority support',
    ],
    tags: ['SME', 'Retail', 'Hospitality', 'Construction'],
  },
  {
    id: 'integra-ultrafast',
    name: 'Integra Ultrafast',
    description: 'For sites where bandwidth matters: large offices, manufacturing, multi-tenant buildings. Position this against leased lines that take 90 days to install.',
    lbDescription: 'Triple-carrier load balancing across two routers. Three independent connections for maximum aggregate throughput.',
    bondedDescription: 'Bonding CPU + dual-5G companion router. Three carriers bonded into a single encrypted tunnel — massive single-session throughput.',
    monthlyPrice: '£195',
    bondedMonthlyPrice: '£230',
    installPrice: '£2,800',
    speedBadge: '400 / 200 Mbps',
    bondedSpeedBadge: '400 / 200 Mbps',
    icon: <Radio size={20} />,
    category: 'core',
    hasBonded: true,
    features: [
      'Three-carrier load balancing',
      'Triple-network redundancy',
      '~2.4TB/month combined data',
      'Static IP available (£10/mo)',
    ],
    bondedFeatures: [
      'Three-carrier L2 bonding',
      'Single download uses all 3 carriers',
      'Static IP included',
      '~2.4TB/month combined data',
    ],
    tags: ['SME', 'Construction', 'Retail'],
  },
  {
    id: 'integra-enterprise',
    name: 'Integra Enterprise',
    description: 'Position against leased lines — faster to deploy, more resilient, and with a 99.5% SLA. For critical-infrastructure customers: finance, healthcare, logistics, data centres.',
    lbDescription: 'Quad-carrier load balancing across two dual-5G routers. Four independent connections with maximum aggregate bandwidth.',
    bondedDescription: 'Bonding CPU + dual-5G router + companion router. Four carriers bonded via Bondix for maximum single-session throughput. Dedicated account manager.',
    monthlyPrice: '£400',
    bondedMonthlyPrice: '£440',
    installPrice: '£3,300',
    speedBadge: '500 / 400 Mbps',
    bondedSpeedBadge: '500 / 400 Mbps',
    icon: <Server size={20} />,
    category: 'core',
    hasBonded: true,
    features: [
      'Four-carrier load balancing',
      'Quad-network redundancy',
      '~3.2TB/month combined data',
      'VPN and firewall ready',
    ],
    bondedFeatures: [
      'Four-carrier L2 bonding via Bondix',
      'Quad-network redundancy',
      'Static IP included',
      'VPN and firewall ready',
    ],
    tags: ['SME', 'Construction'],
  },
  {
    id: 'starlink-b2b',
    name: 'Starlink Business-to-Business',
    description: 'Premium resilience for customers that want everything. Integra-supplied Starlink dish + 4G/5G bonded backup + SLA. Ideal for remote commercial sites, events, and customers who never want to go offline.',
    monthlyPrice: 'From £300',
    installPrice: '£1,500',
    speedBadge: 'Up to 350 Mbps',
    icon: <Globe size={20} />,
    category: 'core',
    hasBonded: false,
    features: [
      'Starlink + cellular bonded backup',
      'Integra-supplied dish',
      'SLA-backed',
      'Premium resilience',
    ],
    tags: ['Rural', 'Construction', 'Hospitality'],
  },

  // ── Add-Ons ───────────────────────────────────────────
  {
    id: 'static-ip',
    name: 'Static IP',
    description: 'Always try to add this. CCTV, VPNs, remote access, server hosting — if the customer has any of these, they need a static IP. Easy upsell on every deal.',
    monthlyPrice: '£10',
    installPrice: '—',
    speedBadge: '',
    icon: <Router size={20} />,
    category: 'addon',
    hasBonded: false,
    features: [],
    tags: ['SME', 'Retail'],
  },
  {
    id: 'p2p-radio',
    name: 'P2P Radio Link',
    description: 'Building-to-building wireless. One-off ~£200 install, no monthly fee. Useful for farms, campuses, construction sites — anywhere you need to bridge two buildings without digging.',
    monthlyPrice: '—',
    installPrice: '~£200/pair',
    speedBadge: '',
    icon: <Radio size={20} />,
    category: 'addon',
    hasBonded: false,
    note: 'One-off hardware + install cost. No monthly fee.',
    features: [],
    tags: ['Rural', 'Construction'],
  },
  {
    id: 'wifi-mesh',
    name: 'WiFi & Mesh Coverage',
    description: 'Add this to any office or hospitality site where coverage matters. Enterprise-grade access points — fully managed and monitored by Integra. Pricing depends on site size.',
    monthlyPrice: 'From £10',
    installPrice: 'From £400',
    speedBadge: '',
    icon: <Wifi size={20} />,
    category: 'addon',
    hasBonded: false,
    note: 'Pricing depends on site size and spec. Ask the Integra team.',
    features: [],
    tags: ['Hospitality', 'Retail', 'SME'],
  },
];

const ALL_TAGS = ['All', 'SME', 'Retail', 'Hospitality', 'Construction', 'Rural', 'Homeworker'];

export const PriceBook: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'core' | 'addon'>('all');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [architecture, setArchitecture] = useState<Architecture>('lb');
  const [circuits, setCircuits] = useState<number>(5);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showArchInfo, setShowArchInfo] = useState(false);

  const filtered = PRODUCTS.filter((p) => {
    const categoryMatch = filter === 'all' || p.category === filter;
    const tagMatch = tagFilter === 'All' || (p.tags && p.tags.includes(tagFilter));
    return categoryMatch && tagMatch;
  });

  const getMonthlyPrice = (product: Product) => {
    if (architecture === 'bonded' && product.bondedMonthlyPrice) {
      return product.bondedMonthlyPrice;
    }
    return product.monthlyPrice;
  };

  const getSpeedBadge = (product: Product) => {
    if (architecture === 'bonded' && product.bondedSpeedBadge) {
      return product.bondedSpeedBadge;
    }
    return product.speedBadge;
  };

  const getDescription = (product: Product) => {
    if (architecture === 'bonded' && product.bondedDescription) {
      return product.bondedDescription;
    }
    if (architecture === 'lb' && product.lbDescription) {
      return product.lbDescription;
    }
    return product.description;
  };

  const getFeatures = (product: Product) => {
    if (architecture === 'bonded' && product.bondedFeatures) {
      return product.bondedFeatures;
    }
    return product.features;
  };

  return (
    <div className="space-y-6">
      {/* ── Earn While You Sell Banner ── */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl p-5 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Gift size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">Earn £50 for every circuit that goes live</h3>
            <p className="text-sm text-green-100 mt-1">
              For every Integra circuit that goes live, you receive a £50 gift voucher — your choice of retailer.
            </p>
            <p className="text-sm text-green-100 mt-1">
              Choose from: <strong>Ocado</strong> • <strong>Amazon</strong> • <strong>John Lewis</strong> • <strong>M&S</strong> • <strong>ASOS</strong> • <strong>Love2Shop</strong>
            </p>
            <p className="text-xs text-green-200 mt-2">
              No cap. 10 circuits = £500. 50 circuits = £2,500. Vouchers issued monthly.
            </p>

            {/* Earnings Calculator Toggle */}
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="mt-3 flex items-center gap-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 transition-colors"
            >
              <Calculator size={16} />
              Earnings Calculator
              {showCalculator ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showCalculator && (
              <div className="mt-3 bg-white/10 rounded-lg p-4">
                <label className="text-sm text-green-100 block mb-2">
                  How many circuits could you bring live this year?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={circuits}
                    onChange={(e) => setCircuits(parseInt(e.target.value))}
                    className="flex-1 accent-white"
                  />
                  <span className="text-2xl font-bold w-12 text-center">{circuits}</span>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-3xl font-bold">£{(circuits * 50).toLocaleString()}</p>
                  <p className="text-sm text-green-200">in vouchers per year</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Margin Protection Note ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium">💰 Your margin is built into every proposal.</p>
        <p className="text-sm text-blue-700 mt-1">
          The prices shown here are standard retail (+VAT). When you submit an opportunity, the Integra team builds your
          Elevate margin into the proposal before it goes to the customer. You never compete on price — your margin is protected.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-integra-navy mb-1">Products & Pricing</h2>
        <p className="text-sm text-gray-500">SD-WAN solutions — load balanced or bonded. All prices standard retail, +VAT — your Elevate pricing is bespoke per opportunity</p>
      </div>

      {/* ── Architecture Toggle ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Architecture:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setArchitecture('lb')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  architecture === 'lb'
                    ? 'bg-integra-blue text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Load Balanced
              </button>
              <button
                onClick={() => setArchitecture('bonded')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  architecture === 'bonded'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Bonded (L2)
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowArchInfo(!showArchInfo)}
            className="flex items-center gap-1.5 text-sm text-integra-blue hover:text-blue-700 font-medium transition-colors"
          >
            <Info size={16} />
            What's the difference?
          </button>
        </div>

        {/* Architecture explainer */}
        {showArchInfo && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`rounded-lg p-4 border-2 ${architecture === 'lb' ? 'border-integra-blue bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
              <h4 className="font-semibold text-integra-navy flex items-center gap-2">
                Load Balanced (SD-WAN)
                {architecture === 'lb' && <span className="text-xs bg-integra-blue text-white px-2 py-0.5 rounded-full">Selected</span>}
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                Traffic is distributed across multiple carriers independently. Each SIM connects to the internet on its own. A single download uses one carrier at a time — aggregate throughput is the sum of all carriers across sessions.
              </p>
              <ul className="mt-3 space-y-1">
                <li className="text-xs text-gray-500 flex items-center gap-1.5">✓ No bonding server needed</li>
                <li className="text-xs text-gray-500 flex items-center gap-1.5">✓ Lower monthly cost</li>
                <li className="text-xs text-gray-500 flex items-center gap-1.5">✓ Great for multi-user sites</li>
                <li className="text-xs text-gray-500 flex items-center gap-1.5">✗ Single sessions limited to one carrier's speed</li>
              </ul>
            </div>
            <div className={`rounded-lg p-4 border-2 ${architecture === 'bonded' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
              <h4 className="font-semibold text-integra-navy flex items-center gap-2">
                Bonded (Bondix L2)
                {architecture === 'bonded' && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">Selected</span>}
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                All carriers are bonded into encrypted tunnels through a cloud bonding server. A single download uses the combined bandwidth of all carriers simultaneously. Static public IP included.
              </p>
              <ul className="mt-3 space-y-1">
                <li className="text-xs text-gray-500 flex items-center gap-1.5">✓ True combined bandwidth per session</li>
                <li className="text-xs text-gray-500 flex items-center gap-1.5">✓ Static IP included</li>
                <li className="text-xs text-gray-500 flex items-center gap-1.5">✓ Best for large file transfers & VPN</li>
                <li className="text-xs text-gray-500 flex items-center gap-1.5">✓ Encrypted tunnels per carrier</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Category filter tabs */}
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

      {/* Use-case tag filter */}
      <div className="flex flex-wrap gap-2">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setTagFilter(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              tagFilter === tag
                ? 'bg-integra-navy text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((product) => {
          const isBondedView = architecture === 'bonded';
          const showBondedUnavailable = isBondedView && !product.hasBonded && product.category === 'core';
          const accentColor = isBondedView && product.hasBonded ? 'emerald' : 'blue';

          return (
            <div
              key={product.id}
              className={`card-static flex items-start gap-4 transition-opacity ${
                product.highlight && !showBondedUnavailable ? `ring-2 ${isBondedView ? 'ring-emerald-500' : 'ring-integra-blue'} ring-opacity-50` : ''
              } ${showBondedUnavailable ? 'opacity-50' : ''}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                product.highlight && !showBondedUnavailable
                  ? `${isBondedView && product.hasBonded ? 'bg-emerald-600' : 'bg-integra-blue'} text-white`
                  : `bg-integra-light ${isBondedView && product.hasBonded ? 'text-emerald-600' : 'text-integra-blue'}`
              }`}>
                {product.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-integra-navy flex items-center gap-2 flex-wrap">
                      {product.name}
                      {product.highlight && !showBondedUnavailable && product.badge && (
                        <span className={`badge text-xs ${isBondedView && product.hasBonded ? 'bg-emerald-100 text-emerald-700' : 'badge-primary'}`}>{product.badge}</span>
                      )}
                      {product.category === 'addon' && (
                        <span className="badge bg-gray-100 text-gray-500 text-xs">Add-on</span>
                      )}
                      {/* Architecture badge removed — toggle handles this */}
                      {showBondedUnavailable && (
                        <span className="badge bg-gray-100 text-gray-500 text-xs">Load Balanced only</span>
                      )}
                    </h3>

                    {/* Speed badge */}
                    {getSpeedBadge(product) && (
                      <div className="mt-1.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isBondedView && product.hasBonded
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Zap size={12} />
                          {getSpeedBadge(product)}
                        </span>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mt-2">{getDescription(product)}</p>

                    {/* Features */}
                    {getFeatures(product).length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {getFeatures(product).map((feature, i) => (
                          <li key={i} className="text-sm text-gray-500 flex items-center gap-1.5">
                            <span className={`${isBondedView && product.hasBonded ? 'text-emerald-500' : 'text-integra-blue'}`}>✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    {product.note && (
                      <p className="text-xs text-amber-600 mt-2 font-medium">{product.note}</p>
                    )}
                    {product.tags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    {!showBondedUnavailable ? (
                      <>
                        <p className={`text-lg font-bold ${isBondedView && product.hasBonded ? 'text-emerald-700' : 'text-integra-navy'}`}>
                          {getMonthlyPrice(product)}
                          {getMonthlyPrice(product) !== '—' && <span className="text-xs font-normal text-gray-500">/mo</span>}
                        </p>
                        <p className="text-xs text-gray-400">(+VAT)</p>
                        <p className="text-xs text-gray-500 mt-1">Install: {product.installPrice}</p>
                        {isBondedView && product.hasBonded && product.monthlyPrice !== product.bondedMonthlyPrice && (
                          <p className="text-xs text-gray-400 mt-0.5">LB: {product.monthlyPrice}/mo</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 italic">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="alert alert-info">
        <p className="text-sm">
          All prices shown are standard retail (+VAT), for reference only. As an Elevate partner, your pricing is
          bespoke per opportunity and will always include your margin. Submit the opportunity and the Integra team will
          respond with a tailored proposal within your chosen SLA.
        </p>
      </div>
    </div>
  );
};
