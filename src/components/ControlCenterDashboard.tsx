import React, { useState } from 'react';
import { 
  BarChart3, 
  Activity, 
  Clock, 
  TrendingUp, 
  Package, 
  AlertCircle, 
  DollarSign, 
  FileText,
  Calendar,
  Layers,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

interface ControlCenterDashboardProps {
  onOpenReviewModal: () => void;
}

export const ControlCenterDashboard: React.FC<ControlCenterDashboardProps> = ({ onOpenReviewModal }) => {
  const [activeTab, setActiveTab] = useState<'sales-cash' | 'inventory' | 'receivables' | 'schedule'>('sales-cash');

  return (
    <section className="py-16 lg:py-24 bg-white border-t border-[#E4DFD5] relative" id="control-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C49A36] uppercase tracking-wider mb-3">
            <Activity className="w-3.5 h-3.5 text-[#0B1426]" />
            <span>Business Intelligence Demonstration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1426] tracking-tight">
            The Executive Control Center
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#526176] leading-relaxed max-w-2xl mx-auto">
            Consolidating sales, stock, receivables, and operational schedules into a single visual screen so owners can make decisions based on real data.
          </p>
        </div>

        {/* Prominent Sample Data Disclaimer Banner */}
        <div className="mb-6 p-3.5 bg-[#F6F5F1] border-l-4 border-[#0B1426] rounded-r-lg text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#C49A36] shrink-0 mt-0.5" />
          <div className="text-[#526176]">
            <strong className="text-[#0B1426] font-bold block mb-0.5">Illustrative dashboard — sample data</strong>
            This is an interactive demonstration illustrating how sales, inventory, receivables, and operational data can be structured into custom cockpits. The metrics and company names shown below are neutral illustrative samples, not live customer records.
          </div>
        </div>

        {/* Dashboard Frame (Light Theme) */}
        <div className="bg-[#F6F5F1] border border-[#E4DFD5] rounded-xl shadow-sm overflow-hidden">

          {/* Top Mock Window Bar */}
          <div className="px-5 py-3.5 bg-white border-b border-[#E4DFD5] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4DFD5]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4DFD5]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B1426]"></span>
              </div>
              <span className="text-xs font-medium text-[#526176] border-l border-[#E4DFD5] pl-3">
                UNIKORN360 · EXECUTIVE BI COCKPIT (SAMPLE VIEW)
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 bg-[#F6F5F1] border border-[#E4DFD5] text-[#0B1426] text-[10px] font-bold uppercase tracking-wider rounded">
                Sample Enterprise: Demo Fabrication &amp; Trading
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-5 pt-3 border-b border-[#E4DFD5] flex items-center gap-2 overflow-x-auto bg-[#F6F5F1]">
            {[
              { id: 'sales-cash', label: 'Sales & Revenue Overview' },
              { id: 'receivables', label: 'Receivables & Ageing (Sample)' },
              { id: 'inventory', label: 'Stock & Godowns (Sample)' },
              { id: 'schedule', label: 'Statutory & Operational Schedule' }
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#0B1426] text-[#0B1426]'
                    : 'border-transparent text-[#526176] hover:text-[#0B1426]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dashboard Body */}
          <div className="p-5 sm:p-7 space-y-6">

            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Metric 1 */}
              <div className="p-4 bg-white border border-[#E4DFD5] rounded-lg shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#526176]">
                    Month-to-Date Revenue
                  </span>
                  <DollarSign className="w-4 h-4 text-[#0B1426]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#0B1426]">
                  ₹42,85,400
                </div>
                <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12.4% vs previous month run rate</span>
                </p>
              </div>

              {/* Metric 2 */}
              <div className="p-4 bg-white border border-[#E4DFD5] rounded-lg shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#526176]">
                    Overdue Receivables
                  </span>
                  <Clock className="w-4 h-4 text-[#C49A36]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#0B1426]">
                  ₹14,20,000
                </div>
                <p className="text-xs text-[#C49A36] font-medium mt-1">
                  5 accounts overdue &gt; 45 days
                </p>
              </div>

              {/* Metric 3 */}
              <div className="p-4 bg-white border border-[#E4DFD5] rounded-lg shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#526176]">
                    Active Inventory
                  </span>
                  <Package className="w-4 h-4 text-[#0B1426]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#0B1426]">
                  ₹31,50,000
                </div>
                <p className="text-xs text-[#526176] mt-1">
                  Across 2 godowns · 4 items low stock
                </p>
              </div>

              {/* Metric 4 */}
              <div className="p-4 bg-white border border-[#E4DFD5] rounded-lg shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#526176]">
                    Next Statutory Filing
                  </span>
                  <Calendar className="w-4 h-4 text-[#0B1426]" />
                </div>
                <div className="text-base font-bold text-[#0B1426]">
                  GSTR-3B (Nov 20th)
                </div>
                <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ITC 2B reconciliation completed</span>
                </p>
              </div>
            </div>

            {/* TAB CONTENT 1: Sales & Revenue */}
            {activeTab === 'sales-cash' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 p-5 bg-white border border-[#E4DFD5] rounded-lg shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E4DFD5] pb-3">
                    <h4 className="text-xs font-bold text-[#0B1426] uppercase tracking-wider">
                      Monthly Inflow &amp; Order Pipeline Trend (Sample Data)
                    </h4>
                    <span className="text-[10px] text-[#526176]">Last 6 Months</span>
                  </div>

                  {/* Visual Bar representation */}
                  <div className="space-y-3 pt-2">
                    {[
                      { month: 'Jun', amount: '₹34.2L', pct: '65%' },
                      { month: 'Jul', amount: '₹38.5L', pct: '74%' },
                      { month: 'Aug', amount: '₹41.0L', pct: '82%' },
                      { month: 'Sep', amount: '₹39.4L', pct: '77%' },
                      { month: 'Oct', amount: '₹44.1L', pct: '88%' },
                      { month: 'Nov (Est)', amount: '₹46.5L', pct: '93%' }
                    ].map((row) => (
                      <div key={row.month} className="flex items-center gap-3 text-xs">
                        <span className="w-16 text-[#526176]">{row.month}</span>
                        <div className="flex-1 bg-[#F6F5F1] h-5 rounded overflow-hidden">
                          <div
                            className="bg-[#0B1426] h-full rounded transition-all"
                            style={{ width: row.pct }}
                          ></div>
                        </div>
                        <span className="w-16 text-right font-bold text-[#0B1426]">{row.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-white border border-[#E4DFD5] rounded-lg shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-[#0B1426] uppercase tracking-wider border-b border-[#E4DFD5] pb-2">
                    Revenue by Product Line
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[#0B1426] font-medium mb-1">
                        <span>Machined Components</span>
                        <span>48%</span>
                      </div>
                      <div className="w-full bg-[#F6F5F1] h-2 rounded"><div className="bg-[#0B1426] h-full rounded w-[48%]"></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[#0B1426] font-medium mb-1">
                        <span>Custom Fabrication</span>
                        <span>32%</span>
                      </div>
                      <div className="w-full bg-[#F6F5F1] h-2 rounded"><div className="bg-[#C49A36] h-full rounded w-[32%]"></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[#0B1426] font-medium mb-1">
                        <span>AMC &amp; Servicing</span>
                        <span>20%</span>
                      </div>
                      <div className="w-full bg-[#F6F5F1] h-2 rounded"><div className="bg-[#526176] h-full rounded w-[20%]"></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Receivables */}
            {activeTab === 'receivables' && (
              <div className="p-5 bg-white border border-[#E4DFD5] rounded-lg shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4DFD5] pb-3">
                  <h4 className="text-xs font-bold text-[#0B1426] uppercase tracking-wider">
                    Debtor Ageing Breakdown (Illustrative Analysis)
                  </h4>
                  <span className="text-[10px] text-[#526176]">Total Outstanding: ₹38.6 Lakhs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-[#F6F5F1] rounded-lg border border-[#E4DFD5]">
                    <span className="text-[10px] uppercase font-bold text-[#526176] block">0 – 30 Days</span>
                    <span className="text-base font-bold text-emerald-700">₹18,40,000</span>
                    <span className="text-[10px] text-[#526176] block mt-0.5">Regular credit cycle</span>
                  </div>
                  <div className="p-3 bg-[#F6F5F1] rounded-lg border border-[#E4DFD5]">
                    <span className="text-[10px] uppercase font-bold text-[#526176] block">31 – 60 Days</span>
                    <span className="text-base font-bold text-[#0B1426]">₹12,20,000</span>
                    <span className="text-[10px] text-[#526176] block mt-0.5">Follow-up triggered</span>
                  </div>
                  <div className="p-3 bg-[#F6F5F1] rounded-lg border border-[#E4DFD5]">
                    <span className="text-[10px] uppercase font-bold text-[#526176] block">61 – 90 Days</span>
                    <span className="text-base font-bold text-[#C49A36]">₹5,60,000</span>
                    <span className="text-[10px] text-[#526176] block mt-0.5">Hold further dispatch</span>
                  </div>
                  <div className="p-3 bg-[#F6F5F1] rounded-lg border border-[#E4DFD5]">
                    <span className="text-[10px] uppercase font-bold text-[#526176] block">90+ Days</span>
                    <span className="text-base font-bold text-red-700">₹2,40,000</span>
                    <span className="text-[10px] text-[#526176] block mt-0.5">Legal notice stage</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Inventory */}
            {activeTab === 'inventory' && (
              <div className="p-5 bg-white border border-[#E4DFD5] rounded-lg shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4DFD5] pb-3">
                  <h4 className="text-xs font-bold text-[#0B1426] uppercase tracking-wider">
                    Warehouse Stock &amp; Critical Reorder Thresholds (Sample Data)
                  </h4>
                  <span className="text-[10px] text-[#526176]">Godown A &amp; Godown B</span>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#E4DFD5] text-[#526176] text-xs">
                        <th className="pb-2">Item Description</th>
                        <th className="pb-2">Current Stock</th>
                        <th className="pb-2">Reorder Level</th>
                        <th className="pb-2">Holding Value</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4DFD5] text-[#0B1426]">
                      <tr>
                        <td className="py-2.5 font-medium">Mild Steel Sheets 2mm</td>
                        <td>120 Sheets</td>
                        <td>50 Sheets</td>
                        <td>₹2,80,000</td>
                        <td><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">Adequate</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Bearing Unit 6204-2RS</td>
                        <td>14 Units</td>
                        <td>25 Units</td>
                        <td>₹18,500</td>
                        <td><span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">Reorder Due</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Hydraulic Oil Grade 68</td>
                        <td>2 Barrels</td>
                        <td>3 Barrels</td>
                        <td>₹32,000</td>
                        <td><span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">Reorder Due</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Fasteners M10x50 High Tensile</td>
                        <td>1,200 Pcs</td>
                        <td>500 Pcs</td>
                        <td>₹24,000</td>
                        <td><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">Adequate</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: Schedule */}
            {activeTab === 'schedule' && (
              <div className="p-5 bg-white border border-[#E4DFD5] rounded-lg shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4DFD5] pb-3">
                  <h4 className="text-xs font-bold text-[#0B1426] uppercase tracking-wider">
                    Statutory &amp; Renewal Calendar (Sample View)
                  </h4>
                  <span className="text-[10px] text-[#526176]">Upcoming 60 Days</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg flex items-center justify-between">
                    <div>
                      <strong className="text-[#0B1426] block">GSTR-1 Outward Return</strong>
                      <span className="text-xs text-[#526176]">Statutory sales return upload deadline</span>
                    </div>
                    <span className="text-xs font-bold text-[#0B1426]">11th of every month</span>
                  </div>
                  <div className="p-3 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg flex items-center justify-between">
                    <div>
                      <strong className="text-[#0B1426] block">GSTR-3B Tax Offset &amp; Payment</strong>
                      <span className="text-xs text-[#526176]">Summary tax computation and ITC utilization</span>
                    </div>
                    <span className="text-xs font-bold text-[#0B1426]">20th of every month</span>
                  </div>
                  <div className="p-3 bg-[#F6F5F1] border border-[#E4DFD5] rounded-lg flex items-center justify-between">
                    <div>
                      <strong className="text-[#0B1426] block">Municipal Trade Licence Renewal</strong>
                      <span className="text-xs text-[#526176]">Annual local body operational certificate</span>
                    </div>
                    <span className="text-xs font-bold text-[#C49A36]">Due March 31</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer of Cockpit */}
          <div className="px-5 py-4 bg-white border-t border-[#E4DFD5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#526176]">
            <div>
              <span>Need a custom dashboard built around your chart of accounts and sales pipelines?</span>
            </div>
            <button
              type="button"
              onClick={onOpenReviewModal}
              className="px-5 py-2.5 bg-[#0B1426] hover:bg-[#172744] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discuss Custom Dashboard Setup</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
