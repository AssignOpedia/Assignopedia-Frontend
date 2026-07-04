import { useEffect, useState } from "react";
import { FaChartBar, FaChartPie, FaCode, FaLayerGroup, FaWallet } from "react-icons/fa";
import { getPortalResource } from "../../utils/portalDataApi";
import AdminPortalLayout from "./AdminPortalLayout";

const fallbackRevenue = [
  { month: "Jan", value: "$210K", height: 48 },
  { month: "Feb", value: "$246K", height: 58 },
  { month: "Mar", value: "$288K", height: 70 },
  { month: "Apr", value: "$301K", height: 74 },
  { month: "May", value: "$336K", height: 86 },
  { month: "Jun", value: "$352K", height: 92 },
];

const codes = [
  { code: "ERP-2407", client: "Northstar Retail", price: "$42,000", deadline: "24 Jun" },
  { code: "LMS-1182", client: "EduPrime", price: "$31,500", deadline: "29 Jun" },
  { code: "CRM-9014", client: "CloudAxis", price: "$56,800", deadline: "04 Jul" },
  { code: "FIN-4412", client: "MetroLedger", price: "$27,200", deadline: "08 Jul" },
];

function AdminRevenue({ activePage, onNavigate }) {
  const [revenue, setRevenue] = useState(fallbackRevenue);

  useEffect(() => {
    getPortalResource("revenue", fallbackRevenue).then((data) => {
      setRevenue(Array.isArray(data) && data.length ? data : fallbackRevenue);
    });
  }, []);

  const latestRevenue = revenue[revenue.length - 1]?.value || "$0";

  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="Financial control"
      title="Revenue Tracking"
      description="Track monthly collections, team-wise contribution, client distribution, and priced deliverables."
      onNavigate={onNavigate}
      action={<button type="button"><FaWallet /> Export Revenue</button>}
    >
      <section className="admin-card-grid compact-grid">
        <article className="admin-stat-card"><div><FaWallet /></div><span>Monthly Revenue</span><strong>{latestRevenue}</strong><small>Latest backend month</small></article>
        <article className="admin-stat-card"><div><FaLayerGroup /></div><span>Top Team</span><strong>Sales</strong><small>$128K closed</small></article>
        <article className="admin-stat-card"><div><FaChartPie /></div><span>Client Retention</span><strong>94%</strong><small>+3% QoQ</small></article>
        <article className="admin-stat-card"><div><FaCode /></div><span>Active Codes</span><strong>28</strong><small>12 billing-ready</small></article>
      </section>

      <section className="admin-content-grid">
        <article className="admin-panel revenue-overview wide-panel">
          <div className="admin-panel-heading">
            <div><span>Monthly</span><h2>Monthly Revenue</h2></div>
            <FaChartBar />
          </div>
          <div className="revenue-chart revenue-chart-tall">
            {revenue.map((bar) => (
              <div key={bar.month}><span style={{ height: `${bar.height}%` }} /><small>{bar.month}<b>{bar.value}</b></small></div>
            ))}
          </div>
        </article>

        <article className="admin-panel side-panel">
          <div className="admin-panel-heading">
            <div><span>Teams</span><h2>Team-wise Revenue</h2></div>
            <FaLayerGroup />
          </div>
          <div className="team-grid">
            {["Sales", "Delivery", "Support", "Consulting"].map((team, index) => (
              <div key={team}><span>{team}</span><strong>{["$128K", "$96K", "$54K", "$74K"][index]}</strong><small>{["+18%", "+11%", "+6%", "+9%"][index]}</small></div>
            ))}
          </div>
        </article>

        <article className="admin-panel wide-panel">
          <div className="admin-panel-heading">
            <div><span>Billing</span><h2>Code, Price, Deadline Table</h2></div>
            <FaCode />
          </div>
          <div className="admin-table">
            <div className="admin-table-head"><span>Code</span><span>Client</span><span>Price</span><span>Deadline</span></div>
            {codes.map((item) => (
              <div className="admin-table-row" key={item.code}><strong>{item.code}</strong><span>{item.client}</span><span>{item.price}</span><span>{item.deadline}</span></div>
            ))}
          </div>
        </article>

        <article className="admin-panel side-panel">
          <div className="admin-panel-heading">
            <div><span>Clients</span><h2>Client Statistics</h2></div>
            <FaChartPie />
          </div>
          <div className="client-stat-layout"><div className="client-donut"><strong>132</strong><small>Clients</small></div></div>
        </article>
      </section>
    </AdminPortalLayout>
  );
}

export default AdminRevenue;
