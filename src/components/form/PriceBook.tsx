/**
 * PriceBook — read-only product catalogue for Elevate agents
 * Correct pricing from Pricing Master Reference (March 2026)
 * Agent-facing descriptions — outcomes, not specs
 */

import React, { useState } from 'react';
import { Wifi, Zap, Shield, Radio, Globe, Router, Server, Gift, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  installPrice: string;
  icon: React.ReactNode;
  category: 'core' | 'addon';
  highlight?: boolean;
  badge?: string | null;
  note?: string | null;
  tags?: string[];
}

const PRODUCTS: Product[] = [
  // ── Core Products ────────────────────────────────────
  {
    id: 'integra-home',
    name: 'Integra Home',
    description: 'Ideal for the remote worker or home office that needs reliable internet without a phone line. Easy sell to anyone working from home in a rural or poorly connected area. One router, one SIM, done.',
    monthlyPrice: '£55',
    installPrice: '£900*',
    icon: <Wifi size={20} />,
    category: 'core',
    note: '*Launch offer until 31 March. Normal price £1,250 install.',
    tags: ['Rural', 'SME', 'Homeworker'],
  },
  {
    id: 'starlink-sdwan',
    name: 'Starlink SD-WAN',
    description: 'The answer to "we can\'t get a decent connection out here." Starlink satellite combined with cellular failover — perfect for farms, rural offices, and sites with zero fixed-line options. Customer supplies the Starlink dish.',
    monthlyPrice: '£80',
    installPrice: '£2,200',
    icon: <Globe size={20} />,
    category: 'core',
    note: 'Customer supplies Starlink dish.',
    tags: ['Rural', 'Construction', 'Hospitality'],
  },
  {
    id: 'integra-lite',
    name: 'Integra Lite',
    description: 'Two SIMs, two networks, one affordable price. Great for SMEs that need more than a single connection but don\'t need enterprise-grade bonding. Load-balances traffic across carriers automatically.',
    monthlyPrice: '£115',
    installPrice: '£1,250',
    icon: <Shield size={20} />,
    category: 'core',
    tags: ['SME', 'Retail', 'Hospitality'],
  },
  {
    id: 'integra-pro',
    name: 'Integra Pro',
    description: 'Your bread-and-butter product. Bonded 4G/5G across two carriers — aggregated speed, automatic failover, and enough bandwidth for 10–25 users. Sells into offices, retail, hospitality, and any SME that\'s had enough of unreliable broadband.',
    monthlyPrice: '£135',
    installPrice: '£2,200',
    icon: <Zap size={20} />,
    category: 'core',
    highlight: true,
    badge: 'Most Popular',
    tags: ['SME', 'Retail', 'Hospitality', 'Construction'],
  },
  {
    id: 'integra-ultrafast',
    name: 'Integra Ultrafast',
    description: 'For sites where bandwidth matters: large offices, manufacturing, multi-tenant buildings. Triple-SIM bonded with 5G priority — up to 450 Mbps. Position this against leased lines that take 90 days to install.',
    monthlyPrice: '£195',
    installPrice: '£2,800',
    icon: <Radio size={20} />,
    category: 'core',
    tags: ['SME', 'Construction', 'Retail'],
  },
  {
    id: 'integra-enterprise',
    name: 'Integra Enterprise',
    description: 'Position against leased lines — faster to deploy, more resilient, and with a 99.5% SLA. Quad-SIM enterprise-grade bonding platform with dedicated account manager. For critical-infrastructure customers: finance, healthcare, logistics, data centres.',
    monthlyPrice: '£400',
    installPrice: '£3,300',
    icon: <Server size={20} />,
    category: 'core',
    tags: ['SME', 'Construction'],
  },
  {
    id: 'starlink-b2b',
    name: 'Starlink Business-to-Business',
    description: 'Premium resilience for customers that want everything. Integra-supplied Starlink dish + 4G/5G bonded backup + SLA. Ideal for remote commercial sites, events, and customers who never want to go offline.',
    monthlyPrice: 'From £300',
    installPrice: '£1,500',
    icon: <Globe size={20} />,
    category: 'core',
    tags: ['Rural', 'Construction', 'Hospitality'],
  },

  // ── Add-Ons ───────────────────────────────────────────
  {
    id: 'static-ip',
    name: 'Static IP',
    description: 'Always try to add this. CCTV, VPNs, remote access, server hosting — if the customer has any of these, they need a static IP. Easy upsell on every deal.',
    monthlyPrice: '£10',
    installPrice: '—',
    icon: <Router size={20} />,
    category: 'addon',
    tags: ['SME', 'Retail'],
  },
  {
    id: 'p2p-radio',
    name: 'P2P Radio Link',
    description: 'Building-to-building wireless. One-off ~£200 install, no monthly fee. Useful for farms, campuses, construction sites — anywhere you need to bridge two buildings without digging.',
    monthlyPrice: '—',
    installPrice: '~£200/pair',
    icon: <Radio size={20} />,
    category: 'addon',
    note: 'One-off hardware + install cost. No monthly fee.',
    tags: ['Rural', 'Construction'],
  },
  {
    id: 'wifi-mesh',
    name: 'WiFi & Mesh Coverage',
    description: 'Add this to any office or hospitality site where coverage matters. Enterprise-grade access points — fully managed and monitored by Integra. Pricing depends on site size.',
    monthlyPrice: 'From £10',
    installPrice: 'From £400',
    icon: <Wifi size={20} />,
    category: 'addon',
    note: 'Pricing depends on site size and spec. Ask the Integra team.',
    tags: ['Hospitality', 'Retail', 'SME'],
  },
];

const ALL_TAGS = ['All', 'SME', 'Retail', 'Hospitality', 'Construction', 'Rural', 'Homeworker'];

export const PriceBook: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'core' | 'addon'>('all');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [circuits, setCircuits] = useState<number>(5);
  const [showCalculator, setShowCalculator] = useState(false);

  const filtered = PRODUCTS.filter((p) => {
    const categoryMatch = filter === 'all' || p.category === filter;
    const tagMatch = tagFilter === 'All' || (p.tags && p.tags.includes(tagFilter));
    return categoryMatch && tagMatch;
  });

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
        <p className="text-sm text-gray-500">All prices are standard retail, +VAT — your Elevate pricing is bespoke per opportunity</p>
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
        {filtered.map((product) => (
          <div
            key={product.id}
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
                    {product.highlight && product.badge && (
                      <span className="badge badge-primary text-xs">{product.badge}</span>
                    )}
                    {product.category === 'addon' && (
                      <span className="badge bg-gray-100 text-gray-500 text-xs">Add-on</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  {product.note && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">{product.note}</p>
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
                  <p className="text-lg font-bold text-integra-navy">
                    {product.monthlyPrice}
                    {product.monthlyPrice !== '—' && <span className="text-xs font-normal text-gray-500">/mo</span>}
                  </p>
                  <p className="text-xs text-gray-500">Install: {product.installPrice}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
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
