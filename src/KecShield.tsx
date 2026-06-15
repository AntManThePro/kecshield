import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, X, Download, AlertCircle, CheckCircle2, Clock, User, FileText, Upload, Eye, EyeOff, Trash2, Menu, Home, Settings, BarChart3 } from 'lucide-react';

const NEXUS = {
  green: '#00ff87',
  cyan: '#60efff',
  pink: '#ff0080',
  yellow: '#ffcc00',
  dark: '#0a0e27',
  darker: '#050812',
  grid: 'rgba(0, 255, 135, 0.05)'
};

const TWC_CATEGORIES = {
  attendance: {
    name: 'Attendance Violations',
    risk: 'HIGH',
    docs: ['Attendance records', 'Written warnings', 'Policy acknowledgment'],
    color: NEXUS.pink,
    examples: ['Excessive tardiness', 'No-call/no-show', 'Unexcused absence', 'Left early without auth']
  },
  insubordination: {
    name: 'Insubordination',
    risk: 'CRITICAL',
    docs: ['Witness statements', 'Written warnings', 'Incident details'],
    color: NEXUS.pink,
    examples: ['Refused direct instruction', 'Disrespectful conduct', 'Hung up on manager']
  },
  safety: {
    name: 'Safety Violations',
    risk: 'CRITICAL',
    docs: ['Safety policies', 'Training records', 'Photos/videos', 'Witness statements'],
    color: NEXUS.yellow,
    examples: ['No PPE used', 'Unsafe ladder use', 'Chemical violation', 'Equipment misuse']
  },
  jobAbandon: {
    name: 'Job Abandonment',
    risk: 'CRITICAL',
    docs: ['Communication logs', 'Schedule records', 'Attendance records'],
    color: NEXUS.pink,
    examples: ['Stopped reporting', 'Missed multiple shifts', 'No response to contact']
  },
  policy: {
    name: 'Policy Violations',
    risk: 'HIGH',
    docs: ['Written policies', 'Signed acknowledgments', 'Prior warnings'],
    color: NEXUS.cyan,
    examples: ['Procedure failure', 'Improper checkout', 'Missing reports', 'Unauthorized asset use']
  },
  dishonesty: {
    name: 'Theft or Dishonesty',
    risk: 'CRITICAL',
    docs: ['Investigation records', 'Witness statements', 'Photos/videos', 'Receipts'],
    color: NEXUS.pink,
    examples: ['Theft', 'Falsified records', 'Timecard fraud', 'Expense fraud']
  },
  harassment: {
    name: 'Harassment or Conduct',
    risk: 'CRITICAL',
    docs: ['Complaints', 'Investigation', 'Witness statements'],
    color: NEXUS.pink,
    examples: ['Threats', 'Harassment', 'Fighting', 'Discrimination']
  },
  drug: {
    name: 'Drug or Alcohol',
    risk: 'CRITICAL',
    docs: ['Written policy', 'Test results', 'Chain-of-custody'],
    color: NEXUS.yellow,
    examples: ['Positive test', 'Refusal to test', 'Possession at work', 'Working impaired']
  },
  performance: {
    name: 'Excessive Performance Issues',
    risk: 'MEDIUM',
    docs: ['Performance records', 'Coaching sessions', 'Prior warnings'],
    color: NEXUS.cyan,
    examples: ['Repeated mistakes', 'Failed to meet standards', 'Low productivity']
  },
  voluntary: {
    name: 'Voluntary Quit',
    risk: 'MEDIUM',
    docs: ['Resignation letter', 'Offered accommodations', 'Work availability docs'],
    color: NEXUS.green,
    examples: ['Unsafe complaint', 'Medical', 'Family emergency', 'Hours reduced']
  }
};

const KecShield = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('kec_incidents');
    return saved ? JSON.parse(saved) : [];
  });
  const [crews, setCrews] = useState(() => {
    const saved = localStorage.getItem('kec_crews');
    return saved ? JSON.parse(saved) : ['Crew A', 'Crew B', 'Crew C', 'Crew D'];
  });

  const [newIncident, setNewIncident] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    category: 'attendance',
    crew: 'Crew A',
    employee: '',
    description: '',
    witnesses: '',
    evidence: [],
    docStatus: {}
  });

  const [expandedIncident, setExpandedIncident] = useState(null);
  const [showLogger, setShowLogger] = useState(false);
  const fileInputRef = useRef(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('kec_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('kec_crews', JSON.stringify(crews));
  }, [crews]);

  const addIncident = () => {
    if (!newIncident.employee || !newIncident.description) {
      alert('Employee name and description required');
      return;
    }

    const incident = {
      id: Date.now(),
      ...newIncident,
      timestamp: new Date(`${newIncident.date}T${newIncident.time}`).toISOString(),
      docStatus: Object.fromEntries(
        TWC_CATEGORIES[newIncident.category].docs.map(d => [d, false])
      )
    };

    setIncidents([incident, ...incidents]);
    setNewIncident({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      category: 'attendance',
      crew: 'Crew A',
      employee: '',
      description: '',
      witnesses: '',
      evidence: [],
      docStatus: {}
    });
    setShowLogger(false);
  };

  const deleteIncident = (id) => {
    if (confirm('Delete incident? This cannot be undone.')) {
      setIncidents(incidents.filter(i => i.id !== id));
      setExpandedIncident(null);
    }
  };

  const updateDocStatus = (incidentId, doc, status) => {
    setIncidents(incidents.map(i =>
      i.id === incidentId
        ? { ...i, docStatus: { ...i.docStatus, [doc]: status } }
        : i
    ));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setNewIncident({
          ...newIncident,
          evidence: [...newIncident.evidence, {
            name: file.name,
            type: file.type,
            size: file.size,
            data: evt.target.result,
            timestamp: new Date().toISOString()
          }]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateTWCReport = () => {
    const report = incidents.map(inc => {
      const cat = TWC_CATEGORIES[inc.category];
      const docsCollected = Object.values(inc.docStatus).filter(Boolean).length;
      const docsRequired = cat.docs.length;
      return `
INCIDENT REPORT #${inc.id}
Date: ${inc.date} Time: ${inc.time}
Category: ${cat.name}
Employee: ${inc.employee}
Crew: ${inc.crew}
Description: ${inc.description}
Witnesses: ${inc.witnesses || 'None documented'}
Documentation: ${docsCollected}/${docsRequired} collected
Evidence Files: ${inc.evidence.length}
---`;
    }).join('\n\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `TWC_Report_${new Date().toISOString().slice(0, 10)}.txt`);
    element.click();
  };

  // Dashboard
  const Dashboard = () => {
    const stats = {
      total: incidents.length,
      critical: incidents.filter(i => TWC_CATEGORIES[i.category].risk === 'CRITICAL').length,
      thisWeek: incidents.filter(i => {
        const d = new Date(i.date);
        const today = new Date();
        return (today - d) / (1000 * 60 * 60 * 24) <= 7;
      }).length,
      documented: incidents.filter(i => Object.values(i.docStatus).some(Boolean)).length
    };

    const byCategory = Object.fromEntries(
      Object.entries(TWC_CATEGORIES).map(([key, val]) => [
        key,
        incidents.filter(i => i.category === key).length
      ])
    );

    return (
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Incidents', value: stats.total, color: NEXUS.cyan },
            { label: 'Critical Risk', value: stats.critical, color: NEXUS.pink },
            { label: 'This Week', value: stats.thisWeek, color: NEXUS.yellow },
            { label: 'Documented', value: stats.documented, color: NEXUS.green }
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border"
              style={{
                borderColor: stat.color,
                backgroundColor: `${stat.color}08`,
                boxShadow: `0 0 20px ${stat.color}20`
              }}
            >
              <div style={{ color: stat.color }} className="text-xs font-mono uppercase">
                {stat.label}
              </div>
              <div style={{ color: stat.color }} className="text-3xl font-bold mt-2">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        <div
          className="p-6 rounded-lg border"
          style={{
            borderColor: NEXUS.cyan,
            backgroundColor: `${NEXUS.cyan}05`,
            boxShadow: `0 0 30px ${NEXUS.cyan}15`
          }}
        >
          <h3 style={{ color: NEXUS.green }} className="font-mono font-bold mb-4 text-sm">
            INCIDENTS BY CATEGORY
          </h3>
          <div className="space-y-3">
            {Object.entries(byCategory).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span style={{ color: NEXUS.cyan }} className="font-mono">
                  {TWC_CATEGORIES[key].name}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 rounded-full" style={{ backgroundColor: `${NEXUS.cyan}20` }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(count * 20, 100)}%`,
                        backgroundColor: TWC_CATEGORIES[key].color
                      }}
                    />
                  </div>
                  <span style={{ color: TWC_CATEGORIES[key].color }} className="font-bold w-4">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div>
          <h3 style={{ color: NEXUS.green }} className="font-mono font-bold mb-4 text-sm">
            RECENT INCIDENTS
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {incidents.slice(0, 10).map(inc => (
              <div
                key={inc.id}
                onClick={() => setExpandedIncident(inc.id)}
                className="p-3 rounded cursor-pointer border transition-all hover:shadow-lg"
                style={{
                  borderColor: TWC_CATEGORIES[inc.category].color,
                  backgroundColor: `${TWC_CATEGORIES[inc.category].color}08`,
                  cursor: 'pointer'
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div style={{ color: TWC_CATEGORIES[inc.category].color }} className="font-bold text-sm">
                      {TWC_CATEGORIES[inc.category].name}
                    </div>
                    <div style={{ color: NEXUS.cyan }} className="text-xs font-mono mt-1">
                      {inc.employee} • {inc.date} • {inc.crew}
                    </div>
                  </div>
                  <div
                    style={{ color: NEXUS.yellow }}
                    className="text-xs font-mono font-bold px-2 py-1 rounded"
                  >
                    {TWC_CATEGORIES[inc.category].risk}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowLogger(!showLogger)}
          className="w-full py-3 rounded-lg font-mono font-bold transition-all hover:shadow-lg"
          style={{
            backgroundColor: NEXUS.green,
            color: NEXUS.darker,
            boxShadow: `0 0 20px ${NEXUS.green}40`
          }}
        >
          <Plus className="inline mr-2" size={16} />
          NEW INCIDENT
        </button>
      </div>
    );
  };

  // Incident Logger
  const IncidentLogger = () => {
    const category = TWC_CATEGORIES[newIncident.category];

    return (
      <div className="space-y-6">
        <h2 style={{ color: NEXUS.green }} className="font-mono font-bold text-xl">
          INCIDENT DOCUMENTATION
        </h2>

        {/* Category & Crew */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={{ color: NEXUS.cyan }} className="text-xs font-mono font-bold block mb-2">
              INCIDENT CATEGORY
            </label>
            <select
              value={newIncident.category}
              onChange={(e) => setNewIncident({ ...newIncident, category: e.target.value })}
              className="w-full p-3 rounded-lg border font-mono text-sm"
              style={{
                borderColor: NEXUS.cyan,
                backgroundColor: NEXUS.darker,
                color: NEXUS.cyan
              }}
            >
              {Object.entries(TWC_CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ color: NEXUS.cyan }} className="text-xs font-mono font-bold block mb-2">
              CREW
            </label>
            <select
              value={newIncident.crew}
              onChange={(e) => setNewIncident({ ...newIncident, crew: e.target.value })}
              className="w-full p-3 rounded-lg border font-mono text-sm"
              style={{
                borderColor: NEXUS.cyan,
                backgroundColor: NEXUS.darker,
                color: NEXUS.cyan
              }}
            >
              {crews.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={{ color: NEXUS.cyan }} className="text-xs font-mono font-bold block mb-2">
              DATE
            </label>
            <input
              type="date"
              value={newIncident.date}
              onChange={(e) => setNewIncident({ ...newIncident, date: e.target.value })}
              className="w-full p-3 rounded-lg border font-mono text-sm"
              style={{
                borderColor: NEXUS.cyan,
                backgroundColor: NEXUS.darker,
                color: NEXUS.cyan
              }}
            />
          </div>

          <div>
            <label style={{ color: NEXUS.cyan }} className="text-xs font-mono font-bold block mb-2">
              TIME
            </label>
            <input
              type="time"
              value={newIncident.time}
              onChange={(e) => setNewIncident({ ...newIncident, time: e.target.value })}
              className="w-full p-3 rounded-lg border font-mono text-sm"
              style={{
                borderColor: NEXUS.cyan,
                backgroundColor: NEXUS.darker,
                color: NEXUS.cyan
              }}
            />
          </div>
        </div>

        {/* Employee */}
        <div>
          <label style={{ color: NEXUS.cyan }} className="text-xs font-mono font-bold block mb-2">
            EMPLOYEE NAME
          </label>
          <input
            type="text"
            placeholder="Full name"
            value={newIncident.employee}
            onChange={(e) => setNewIncident({ ...newIncident, employee: e.target.value })}
            className="w-full p-3 rounded-lg border font-mono text-sm"
            style={{
              borderColor: NEXUS.cyan,
              backgroundColor: NEXUS.darker,
              color: NEXUS.cyan
            }}
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ color: NEXUS.cyan }} className="text-xs font-mono font-bold block mb-2">
            INCIDENT DESCRIPTION
          </label>
          <textarea
            placeholder="Detailed description of what happened..."
            value={newIncident.description}
            onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
            className="w-full p-3 rounded-lg border font-mono text-sm h-24 resize-none"
            style={{
              borderColor: NEXUS.cyan,
              backgroundColor: NEXUS.darker,
              color: NEXUS.cyan
            }}
          />
        </div>

        {/* Witnesses */}
        <div>
          <label style={{ color: NEXUS.cyan }} className="text-xs font-mono font-bold block mb-2">
            WITNESSES (OPTIONAL)
          </label>
          <input
            type="text"
            placeholder="Names of witnesses, comma-separated"
            value={newIncident.witnesses}
            onChange={(e) => setNewIncident({ ...newIncident, witnesses: e.target.value })}
            className="w-full p-3 rounded-lg border font-mono text-sm"
            style={{
              borderColor: NEXUS.cyan,
              backgroundColor: NEXUS.darker,
              color: NEXUS.cyan
            }}
          />
        </div>

        {/* Evidence Upload */}
        <div>
          <label style={{ color: NEXUS.cyan }} className="text-xs font-mono font-bold block mb-2">
            EVIDENCE (PHOTOS/DOCUMENTS)
          </label>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 rounded-lg border-2 border-dashed transition-all flex items-center justify-center gap-2"
            style={{
              borderColor: NEXUS.yellow,
              backgroundColor: `${NEXUS.yellow}08`,
              color: NEXUS.yellow
            }}
          >
            <Upload size={16} />
            <span className="font-mono text-sm">Click to upload or drag</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />

          {newIncident.evidence.length > 0 && (
            <div className="mt-3 space-y-2">
              {newIncident.evidence.map((file, i) => (
                <div
                  key={i}
                  className="p-2 rounded flex items-center justify-between text-sm"
                  style={{
                    backgroundColor: `${NEXUS.yellow}15`,
                    borderLeft: `3px solid ${NEXUS.yellow}`
                  }}
                >
                  <span style={{ color: NEXUS.yellow }} className="font-mono truncate">
                    {file.name}
                  </span>
                  <button
                    onClick={() => setNewIncident({
                      ...newIncident,
                      evidence: newIncident.evidence.filter((_, j) => j !== i)
                    })}
                    className="hover:opacity-70"
                  >
                    <X size={14} style={{ color: NEXUS.pink }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Guide */}
        <div
          className="p-4 rounded-lg border"
          style={{
            borderColor: category.color,
            backgroundColor: `${category.color}08`
          }}
        >
          <div style={{ color: category.color }} className="font-mono font-bold text-sm mb-2">
            {category.name.toUpperCase()} — Risk Level: {category.risk}
          </div>
          <div style={{ color: NEXUS.cyan }} className="text-xs space-y-1 mb-3">
            <div className="font-bold">Documentation Required:</div>
            {category.docs.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 ml-2">
                <span>•</span>
                <span>{doc}</span>
              </div>
            ))}
          </div>
          <div style={{ color: NEXUS.yellow }} className="text-xs space-y-1">
            <div className="font-bold">Common Examples:</div>
            {category.examples.map((ex, i) => (
              <div key={i} className="flex items-center gap-2 ml-2">
                <span>•</span>
                <span>{ex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={addIncident}
            className="flex-1 py-3 rounded-lg font-mono font-bold transition-all hover:shadow-lg"
            style={{
              backgroundColor: NEXUS.green,
              color: NEXUS.darker,
              boxShadow: `0 0 20px ${NEXUS.green}40`
            }}
          >
            <Plus className="inline mr-2" size={16} />
            LOG INCIDENT
          </button>
          <button
            onClick={() => setShowLogger(false)}
            className="flex-1 py-3 rounded-lg font-mono font-bold border transition-all"
            style={{
              borderColor: NEXUS.cyan,
              color: NEXUS.cyan
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  };

  // Incident Details View
  const IncidentDetailsView = () => {
    const incident = incidents.find(i => i.id === expandedIncident);
    if (!incident) return null;

    const category = TWC_CATEGORIES[incident.category];

    return (
      <div className="space-y-6">
        <button
          onClick={() => setExpandedIncident(null)}
          style={{ color: NEXUS.cyan }}
          className="font-mono text-sm hover:underline flex items-center gap-1"
        >
          ← Back to list
        </button>

        {/* Header */}
        <div
          className="p-6 rounded-lg border"
          style={{
            borderColor: category.color,
            backgroundColor: `${category.color}08`,
            boxShadow: `0 0 30px ${category.color}15`
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div style={{ color: category.color }} className="font-mono font-bold text-sm">
                {category.name}
              </div>
              <div style={{ color: NEXUS.cyan }} className="font-mono text-xs mt-2 space-y-1">
                <div>Employee: <span style={{ color: NEXUS.green }}>{incident.employee}</span></div>
                <div>Crew: <span style={{ color: NEXUS.green }}>{incident.crew}</span></div>
                <div>Date/Time: <span style={{ color: NEXUS.green }}>{incident.date} {incident.time}</span></div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: category.color,
                color: NEXUS.darker
              }}
              className="px-3 py-1 rounded font-mono text-xs font-bold"
            >
              {category.risk}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 style={{ color: NEXUS.green }} className="font-mono font-bold text-sm mb-2">
            DESCRIPTION
          </h3>
          <p style={{ color: NEXUS.cyan }} className="text-sm leading-relaxed bg-opacity-30 p-4 rounded border"
            style={{ borderColor: NEXUS.cyan, backgroundColor: `${NEXUS.cyan}08` }}>
            {incident.description}
          </p>
        </div>

        {/* Witnesses */}
        {incident.witnesses && (
          <div>
            <h3 style={{ color: NEXUS.green }} className="font-mono font-bold text-sm mb-2">
              WITNESSES
            </h3>
            <p style={{ color: NEXUS.cyan }} className="text-sm">{incident.witnesses}</p>
          </div>
        )}

        {/* Documentation Checklist */}
        <div>
          <h3 style={{ color: NEXUS.green }} className="font-mono font-bold text-sm mb-3">
            DOCUMENTATION STATUS
          </h3>
          <div className="space-y-2">
            {category.docs.map((doc, i) => (
              <div
                key={i}
                className="p-3 rounded flex items-center justify-between border"
                style={{
                  borderColor: incident.docStatus[doc] ? NEXUS.green : NEXUS.cyan,
                  backgroundColor: incident.docStatus[doc] ? `${NEXUS.green}08` : `${NEXUS.cyan}08`
                }}
              >
                <span style={{ color: NEXUS.cyan }} className="text-sm">{doc}</span>
                <button
                  onClick={() => updateDocStatus(incident.id, doc, !incident.docStatus[doc])}
                  className="transition-all hover:scale-110"
                >
                  {incident.docStatus[doc] ? (
                    <CheckCircle2 size={20} style={{ color: NEXUS.green }} />
                  ) : (
                    <AlertCircle size={20} style={{ color: NEXUS.pink }} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence */}
        {incident.evidence.length > 0 && (
          <div>
            <h3 style={{ color: NEXUS.green }} className="font-mono font-bold text-sm mb-3">
              EVIDENCE FILES ({incident.evidence.length})
            </h3>
            <div className="space-y-2">
              {incident.evidence.map((file, i) => (
                <div
                  key={i}
                  className="p-3 rounded flex items-center justify-between text-sm border"
                  style={{
                    borderColor: NEXUS.yellow,
                    backgroundColor: `${NEXUS.yellow}08`
                  }}
                >
                  <span style={{ color: NEXUS.yellow }} className="font-mono truncate">
                    {file.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Button */}
        <button
          onClick={() => deleteIncident(incident.id)}
          className="w-full py-3 rounded-lg font-mono font-bold transition-all hover:opacity-80"
          style={{
            backgroundColor: `${NEXUS.pink}20`,
            color: NEXUS.pink,
            border: `1px solid ${NEXUS.pink}`
          }}
        >
          <Trash2 className="inline mr-2" size={16} />
          DELETE INCIDENT
        </button>
      </div>
    );
  };

  // Categories Guide
  const CategoriesGuide = () => (
    <div className="space-y-4">
      <h2 style={{ color: NEXUS.green }} className="font-mono font-bold text-xl mb-6">
        TWC VIOLATION CATEGORIES & DEFENSE GUIDE
      </h2>

      <div className="space-y-3 max-h-[70vh] overflow-y-auto">
        {Object.entries(TWC_CATEGORIES).map(([key, cat]) => (
          <details
            key={key}
            className="p-4 rounded-lg border group cursor-pointer transition-all"
            style={{
              borderColor: cat.color,
              backgroundColor: `${cat.color}08`
            }}
          >
            <summary className="flex items-center justify-between font-bold">
              <div>
                <div style={{ color: cat.color }}>{cat.name}</div>
                <div style={{ color: NEXUS.yellow }} className="text-xs font-mono mt-1">
                  Risk: {cat.risk}
                </div>
              </div>
              <ChevronDown
                size={20}
                style={{ color: cat.color }}
                className="group-open:rotate-180 transition-transform"
              />
            </summary>

            <div className="mt-4 space-y-3">
              <div>
                <div style={{ color: NEXUS.green }} className="text-xs font-mono font-bold mb-2">
                  DOCUMENTATION REQUIRED
                </div>
                <ul style={{ color: NEXUS.cyan }} className="text-xs space-y-1 ml-2">
                  {cat.docs.map((doc, i) => (
                    <li key={i} className="flex gap-2">
                      <span>✓</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ color: NEXUS.green }} className="text-xs font-mono font-bold mb-2">
                  COMMON EXAMPLES
                </div>
                <ul style={{ color: NEXUS.cyan }} className="text-xs space-y-1 ml-2">
                  {cat.examples.map((ex, i) => (
                    <li key={i} className="flex gap-2">
                      <span>•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="p-3 rounded text-xs"
                style={{
                  backgroundColor: `${cat.color}15`,
                  borderLeft: `3px solid ${cat.color}`,
                  color: NEXUS.cyan
                }}
              >
                <span className="font-bold">Defense Strategy:</span> Document everything immediately. Get witness statements in writing. Maintain consistent enforcement across all crew members. Keep clear written policies signed by employees.
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Top Tips */}
      <div
        className="p-6 rounded-lg border mt-6"
        style={{
          borderColor: NEXUS.green,
          backgroundColor: `${NEXUS.green}08`
        }}
      >
        <h3 style={{ color: NEXUS.green }} className="font-mono font-bold text-sm mb-4">
          TOP 5 WAYS TO WIN AT TWC
        </h3>
        <ol style={{ color: NEXUS.cyan }} className="text-xs space-y-2 ml-2 font-mono">
          <li><span style={{ color: NEXUS.yellow }}>1.</span> Clear written policy – signed by employee</li>
          <li><span style={{ color: NEXUS.yellow }}>2.</span> Employee signed acknowledgment – keep on file</li>
          <li><span style={{ color: NEXUS.yellow }}>3.</span> Prior warnings documented – per policy</li>
          <li><span style={{ color: NEXUS.yellow }}>4.</span> Consistent enforcement – same rules for all crews</li>
          <li><span style={{ color: NEXUS.yellow }}>5.</span> Detailed incident documentation – date, time, witnesses, description</li>
        </ol>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen font-mono"
      style={{ backgroundColor: NEXUS.darker, color: NEXUS.cyan }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          borderColor: NEXUS.green,
          backgroundColor: NEXUS.dark,
          boxShadow: `0 0 40px ${NEXUS.green}20`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: NEXUS.green }}
            />
            <h1 style={{ color: NEXUS.green }} className="text-2xl font-black">
              KEC SHIELD
            </h1>
            <span style={{ color: NEXUS.cyan }} className="text-xs">
              /// TWC Defense & Incident Documentation
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="border-b"
        style={{
          borderColor: NEXUS.cyan,
          backgroundColor: `${NEXUS.cyan}05`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex gap-1 py-2">
          {[
            { id: 'dashboard', icon: Home, label: 'DASHBOARD' },
            { id: 'categories', icon: FileText, label: 'CATEGORIES' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowLogger(false);
                setExpandedIncident(null);
              }}
              className={`px-4 py-2 rounded-t font-mono font-bold text-xs transition-all flex items-center gap-2 border-b-2 ${
                activeTab === tab.id ? 'border-b-2' : ''
              }`}
              style={{
                color: activeTab === tab.id ? NEXUS.green : NEXUS.cyan,
                borderColor: activeTab === tab.id ? NEXUS.green : 'transparent',
                backgroundColor: activeTab === tab.id ? `${NEXUS.green}15` : 'transparent'
              }}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {showLogger ? (
          <IncidentLogger />
        ) : expandedIncident ? (
          <IncidentDetailsView />
        ) : activeTab === 'dashboard' ? (
          <Dashboard />
        ) : (
          <CategoriesGuide />
        )}
      </div>

      {/* Export Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={generateTWCReport}
          className="p-4 rounded-lg font-mono font-bold transition-all hover:shadow-lg animate-pulse"
          style={{
            backgroundColor: NEXUS.yellow,
            color: NEXUS.darker,
            boxShadow: `0 0 30px ${NEXUS.yellow}50`
          }}
        >
          <Download size={20} />
        </button>
      </div>
    </div>
  );
};

export default KecShield;
