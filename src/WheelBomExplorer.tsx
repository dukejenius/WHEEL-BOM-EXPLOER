import React, { useState, useEffect, useMemo } from 'react';
import { Search, Database, Settings, Activity, Box, Info, ShieldAlert, Cpu, Layers, RefreshCw, FileText, CheckCircle, Sun, Moon } from 'lucide-react';

// 預設綁定的 Google Sheet CSV 網址
const ENCODED_URL = "aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvZS8yUEFDWC0xdlROei1Ga0ZDYXlkQkZwVzNlMzlRbk0yQXlFczktbW1kbl8tTGZRWHRwRlRUc05hT1dxNzAyX3d6QWE1cmFzZFM1Zk5FbnNmNGNHY05hZy9wdWI/b3V0cHV0PWNzdg==";
const DEFAULT_SHEET_URL = atob(ENCODED_URL);

// 定義 5 款自訂主題色系
const PALETTES = [
  { id: 'cyan', hex: '#06b6d4', name: 'Cyan' },
  { id: 'emerald', hex: '#10b981', name: 'Emerald' },
  { id: 'violet', hex: '#8b5cf6', name: 'Violet' },
  { id: 'amber', hex: '#f59e0b', name: 'Amber' },
  { id: 'rose', hex: '#f43f5e', name: 'Rose' },
];

// 動態生成完整 Theme Dictionary 的核心引擎
const getTheme = (isDark, c) => {
  const rgbMap = {
    cyan: '6,182,212',
    emerald: '16,185,129',
    violet: '139,92,246',
    amber: '245,158,11',
    rose: '244,63,94'
  };
  const thumbMap = {
    cyan: { t: '#0891b2', h: '#06b6d4' },
    emerald: { t: '#059669', h: '#10b981' },
    violet: { t: '#7c3aed', h: '#8b5cf6' },
    amber: { t: '#d97706', h: '#f59e0b' },
    rose: { t: '#e11d48', h: '#f43f5e' }
  };
  const rgb = rgbMap[c] || rgbMap['cyan'];
  const thumb = thumbMap[c] || thumbMap['cyan'];

  return isDark ? {
    bg: "bg-[#06070a]",
    text: "text-gray-200",
    header: `bg-[#0a0c10]/95 border-${c}-950 shadow-[0_4px_30px_rgba(${rgb},0.15)]`,
    logoTitle: "text-gray-100",
    tabWrap: "bg-[#0f121d] border-[#1f2937]",
    tabActive: `bg-${c}-950 border-${c}-500/50 text-${c}-400`,
    tabInactive: "text-gray-400 hover:text-gray-200",
    statText: "text-gray-500",
    statVal: `text-${c}-400`,
    panel: "bg-[#0b0d14] border-[#1a1f2c]",
    inputWrap: `bg-[#05060b] border-[#1f2937] text-white placeholder-gray-500 focus:border-${c}-500`,
    itemBg: "bg-[#05060b] border-gray-900 text-gray-400 hover:border-gray-800 hover:bg-[#0d0f17]",
    itemActiveBg: `bg-${c}-950/40 border-${c}-500 text-white shadow-[inset_0_0_10px_rgba(${rgb},0.15)]`,
    itemSKU: "text-gray-300",
    itemTag: "text-gray-400 bg-[#0f121d]",
    itemDesc: "text-gray-500",
    emptyIcon: `text-${c}-900/40`,
    skuCard: `bg-gradient-to-r from-${c}-950/40 via-[#0b101d] to-[#07090e] border border-${c}-900/60 shadow-xl`,
    accentBar: `bg-${c}-400 shadow-[0_0_10px_rgba(${rgb},0.8)]`,
    skuTitle: "text-white",
    skuDesc: `text-${c}-300/80`,
    infoBox: `bg-[#05060b]/60 border-${c}-900/50 text-gray-200`,
    infoLabel: "text-gray-500",
    svgPanel: `bg-[#07090e] border-${c}-950`,
    svgGrid: "radial-gradient(#1e293b 0.75px, transparent 0.75px)",
    svgAxis: "#111827",
    svgTapeBase: "#11131e",
    svgBaseRim: "#1f2937",
    svgBaseHook: "#334155",
    svgBaseInner: "#1e293b",
    svgSpokeBase: "#334155",
    svgNipBase: "#1f2937",
    svgValveBase: "#4b5563",
    svgHubBase: "#1e293b",
    svgHubHole: "#334155",
    svgHubCenter: "#0b0d14",
    svgHubAxle: "#06070a",
    svgTextBase: "#475569",
    tableHeader: `bg-gradient-to-r from-${c}-950/50 via-[#0b101d] to-[#07090e] border-b border-${c}-900/60`,
    tableHeadText: "text-gray-100",
    tableSubText: `text-${c}-400/70`,
    tableVersion: `text-${c}-400/80 bg-${c}-950/50 border-${c}-900/50`,
    thead: `bg-[#0f172a] text-${c}-400 border-${c}-950`,
    tbody: "divide-y divide-[#131723] text-sm",
    tr: "hover:bg-[#121624]/60 bg-[#080a0f]/20",
    trHover: `bg-${c}-950/25 text-white font-bold`,
    tdId: "text-gray-500",
    tdBorder: `border-${c}-950/10`,
    tdComponent: "",
    tdDesc: "",
    tdQty: "",
    skuBadge: `bg-[#0c1322] border-${c}-950 text-${c}-400`,
    skuBadgeHover: `bg-${c}-950 border-${c}-400 text-${c}-400 shadow-[0_0_10px_rgba(${rgb},0.4)]`,
    scrollbarTrack: "#06070a",
    scrollbarThumb: thumb.t,
    scrollbarThumbHover: thumb.h,
    iconWrap: `bg-${c}-500/10 shadow-[0_0_12px_rgba(${rgb},0.3)] border border-${c}-500/40`,
    iconMain: `text-${c}-500`,
    loaderRing: `border-${c}-950 border-t-${c}-500`,
    loaderPing: `border-${c}-800/40`,
    loaderText: `text-${c}-500`,
    loaderTrack: `bg-${c}-950`,
    loaderBar: `bg-${c}-500`,
  } : {
    bg: "bg-slate-50",
    text: "text-slate-800",
    header: `bg-white/95 border-${c}-200 shadow-sm`,
    logoTitle: "text-slate-800",
    tabWrap: "bg-slate-100 border-slate-200",
    tabActive: `bg-${c}-50 border-${c}-400 text-${c}-700 shadow-sm`,
    tabInactive: "text-slate-500 hover:text-slate-700",
    statText: "text-slate-500",
    statVal: `text-${c}-600`,
    panel: "bg-white border-slate-200 shadow-sm",
    inputWrap: `bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-${c}-500 focus:bg-white`,
    itemBg: `bg-white border-slate-200 text-slate-600 hover:border-${c}-300 hover:bg-${c}-50/30`,
    itemActiveBg: `bg-${c}-50 border-${c}-400 text-${c}-900 shadow-[inset_0_0_10px_rgba(${rgb},0.1)]`,
    itemSKU: "text-slate-800",
    itemTag: "text-slate-500 bg-slate-100 border border-slate-200",
    itemDesc: "text-slate-500",
    emptyIcon: "text-slate-300",
    skuCard: `bg-gradient-to-r from-${c}-50 via-white to-slate-50 border border-slate-200 shadow-sm`,
    accentBar: `bg-${c}-500 shadow-sm`,
    skuTitle: "text-slate-800",
    skuDesc: `text-${c}-700/90`,
    infoBox: "bg-slate-50 border-slate-200 text-slate-700",
    infoLabel: "text-slate-400",
    svgPanel: "bg-slate-50 border-slate-200 shadow-inner",
    svgGrid: "radial-gradient(#cbd5e1 0.75px, transparent 0.75px)",
    svgAxis: "#e2e8f0",
    svgTapeBase: "#f8fafc",
    svgBaseRim: "#94a3b8",
    svgBaseHook: "#64748b",
    svgBaseInner: "#e2e8f0",
    svgSpokeBase: "#cbd5e1",
    svgNipBase: "#94a3b8",
    svgValveBase: "#94a3b8",
    svgHubBase: "#cbd5e1",
    svgHubHole: "#94a3b8",
    svgHubCenter: "#ffffff",
    svgHubAxle: "#f8fafc",
    svgTextBase: "#94a3b8",
    tableHeader: `bg-gradient-to-r from-${c}-50 via-white to-slate-50 border-b border-slate-200`,
    tableHeadText: "text-slate-800",
    tableSubText: "text-slate-500",
    tableVersion: "text-slate-500 bg-white border-slate-200",
    thead: `bg-slate-100 text-${c}-800 border-slate-200`,
    tbody: "divide-y divide-slate-100 text-sm",
    tr: `hover:bg-${c}-50/50 bg-white`,
    trHover: `bg-${c}-50/80 text-${c}-950 font-bold`,
    tdId: "text-slate-400",
    tdBorder: "border-slate-100",
    tdComponent: "",
    tdDesc: "",
    tdQty: "",
    skuBadge: "bg-white border-slate-300 text-slate-600",
    skuBadgeHover: `bg-${c}-100 border-${c}-400 text-${c}-800 shadow-sm`,
    scrollbarTrack: "#f8fafc",
    scrollbarThumb: "#cbd5e1",
    scrollbarThumbHover: "#94a3b8",
    iconWrap: `bg-${c}-100 border border-${c}-300 shadow-sm`,
    iconMain: `text-${c}-600`,
    loaderRing: `border-${c}-100 border-t-${c}-500`,
    loaderPing: `border-${c}-300/40`,
    loaderText: `text-${c}-600`,
    loaderTrack: `bg-${c}-100`,
    loaderBar: `bg-${c}-500`,
  };
};

// --- CSV Parser ---
const parseCSV = (str) => {
  const arr = [];
  let quote = false;
  let row = 0, col = 0;
  for (let c = 0; c < str.length; c++) {
    let cc = str[c], nc = str[c + 1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';
    if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
    if (cc === '"') { quote = !quote; continue; }
    if (cc === ',' && !quote) { ++col; continue; }
    if (cc === '\r' && nc === '\n' && !quote) { ++row; col = 0; ++c; continue; }
    if (cc === '\n' && !quote) { ++row; col = 0; continue; }
    if (cc === '\r' && !quote) { ++row; col = 0; continue; }
    arr[row][col] += cc;
  }
  if (arr.length < 2) return [];
  const headers = arr[0].map(h => h.trim());
  return arr.slice(1).filter(r => r.length > 1 && r[0]).map(row => {
    let obj = {};
    row.forEach((val, i) => {
      if (headers[i]) {
        obj[headers[i]] = val ? val.trim() : '';
      }
    });
    return obj;
  });
};

const findValue = (row, keys) => {
  if (!row) return 'N/A';
  for (let k of keys) {
    const foundKey = Object.keys(row).find(
      x => x.toLowerCase().replace(/[^a-z0-9#]/g, '') === k.toLowerCase().replace(/[^a-z0-9#]/g, '')
    );
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      const val = row[foundKey];
      if (typeof val === 'object') {
        try { return JSON.stringify(val); } catch (e) { return 'Object'; }
      }
      const strVal = String(val).trim();
      const upperVal = strVal.toUpperCase();
      // 關鍵修復：排除無效字串 (NA, N/A, -)，使其能順利觸發備用欄位機制
      if (strVal !== '' && upperVal !== 'NA' && upperVal !== 'N/A' && upperVal !== '-') {
        return strVal;
      }
    }
  }
  return 'N/A';
};

const fallbackMockData = [
  {
    "SKU#": "180586",
    "Part Description": "WHEEL SYNTHESIS CARBON ENDURO 29 CB RATCHET FRONT 20X110 BOOST",
    "Model": "ENDURO",
    "Level": "7",
    "RIM SKU F": "90302",
    "RIM SKU R": "NA",
    "Hub SKU F": "20668",
    "Hub SKU R": "NA",
    "Front / Rear": "FRONT",
    "Rim material": "CARBON",
    "Rim inner width F": "31.5",
    "Hub supplier / Type": "KT _ Ratchet",
    "Hub type": "6 bolt",
    "Spoke NDS F SKU": "99376",
    "Spoke DS F SKU": "99822",
    "Spoke Vendor": "Sapim",
    "Spoke Spec": "D-light",
    "Nipple SKU": "99384",
    "Nipple material / dimension": "Polyax Brass 14mm",
    "Valve SKU": "99390",
    "Valve Spec": "FVTL-TP1-35mm",
    "Tape SKU F": "99389",
    "width (mm) F": "32"
  }
];

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); 
  const [hoveredPart, setHoveredPart] = useState(null);
  
  // Theme State (Default to Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Accent Color State
  const [themeColor, setThemeColor] = useState('cyan');
  
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_URL);

  useEffect(() => {
    let savedUrl = DEFAULT_SHEET_URL;
    try {
      savedUrl = localStorage.getItem('wheelBOM_sheetUrl') || DEFAULT_SHEET_URL;
      const savedMode = localStorage.getItem('wheelBOM_darkMode');
      if (savedMode !== null) setIsDarkMode(JSON.parse(savedMode));
      const savedColor = localStorage.getItem('wheelBOM_themeColor');
      if (savedColor) setThemeColor(savedColor);
    } catch (e) {
      console.warn("LocalStorage blocked by environment.");
    }
    
    setSheetUrl(savedUrl);

    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      script.async = true;
      script.onload = () => fetchData(savedUrl);
      script.onerror = () => fetchData(savedUrl);
      document.head.appendChild(script);
    } else {
      fetchData(savedUrl);
    }
  }, []);

  useEffect(() => {
    const ENCODED_URL = "aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvZS8yUEFDWC0xdlROei1Ga0ZDYXlkQkZwVzNlMzlRbk0yQXlFczktbW1kbl8tTGZRWHRwRlRUc05hT1dxNzAyX3d6QWE1cmFzZFM1Zk5FbnNmNGNHY05hZy9wdWI/b3V0cHV0PWNzdg==";
    const defaultUrl = atob(ENCODED_URL);
    let savedUrl = defaultUrl;

    try {
      localStorage.setItem('wheelBOM_darkMode', JSON.stringify(isDarkMode));
      localStorage.setItem('wheelBOM_themeColor', themeColor);
    } catch (e) {
      console.warn('LocalStorage write blocked by external environment.');
    }

    try {
      document.documentElement.style.setProperty('background-color', isDarkMode ? '#06070a' : '#f8fafc', 'important');
      document.body.style.setProperty('background-color', isDarkMode ? '#06070a' : '#f8fafc', 'important');
    } catch (e) {
      console.warn('DOM background sync skipped.');
    }
  }, [isDarkMode, themeColor]);

  // 獨立的按鈕點擊處理，防止事件氣泡被外部截斷
  const handleToggleTheme = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDarkMode(prev => !prev);
  };

  const fetchData = async (url) => {
    if (!url) return;
    setLoading(true);
    try {
      let fetchUrl = url;
      let isXlsxCapable = false;

      if (url.includes('output=csv')) {
        fetchUrl = url.replace('output=csv', 'output=xlsx');
        isXlsxCapable = true;
      } else if (url.includes('output=xlsx') || url.endsWith('.xlsx')) {
        isXlsxCapable = true;
      }

      if (isXlsxCapable && window.XLSX) {
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Failed to access spreadsheet.');
        
        const arrayBuffer = await response.arrayBuffer();
        const arrayData = new Uint8Array(arrayBuffer);
        const workbook = window.XLSX.read(arrayData, { type: 'array' });
        
        let combinedData = [];
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          combinedData = [...combinedData, ...jsonData];
        });

        if (combinedData.length > 0) {
          const cleanedData = combinedData.filter(item => {
            const sku = findValue(item, ['SKU#', 'SKU', 'Wheel SKU', 'Part#', 'Part No.']);
            return sku && sku !== 'N/A' && String(sku).trim() !== '';
          });

          setData(cleanedData);
          try { localStorage.setItem('wheelBOM_sheetUrl', url); } catch (e) {}
          setSelectedSKU(null);
          setSearchQuery('');
          setLoading(false);
          return;
        }
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to access spreadsheet.');
      const csvText = await response.text();
      const parsedData = parseCSV(csvText);
      if (parsedData.length > 0) {
        setData(parsedData);
        try { localStorage.setItem('wheelBOM_sheetUrl', url); } catch (e) {}
        setSelectedSKU(null);
        setSearchQuery('');
      } else {
        throw new Error('Spreadsheet format invalid.');
      }
    } catch (err) {
      console.error(err);
      setData(fallbackMockData);
      setSelectedSKU(null);
      setSearchQuery('');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let result = data;
    if (activeTab === 'ALLOY') {
      result = result.filter(item => {
        const desc = String(findValue(item, ['Part Description', 'Description', 'Wheel Description'])).toUpperCase();
        const rimMat = String(findValue(item, ['Rim material'])).toUpperCase();
        return desc.includes('ALLOY') || rimMat.includes('ALLOY');
      });
    } else if (activeTab === 'CARBON') {
      result = result.filter(item => {
        const desc = String(findValue(item, ['Part Description', 'Description', 'Wheel Description'])).toUpperCase();
        const rimMat = String(findValue(item, ['Rim material'])).toUpperCase();
        return desc.includes('CARBON') || rimMat.includes('CARBON');
      });
    }

    const queryStr = String(searchQuery || '').trim();
    if (!queryStr) return [];
    
    const q = queryStr.toLowerCase();
    return result.filter(item => {
      const sku = String(findValue(item, ['SKU#', 'SKU', 'Wheel SKU', 'Part#', 'Part No.'])).toLowerCase();
      const desc = String(findValue(item, ['Part Description', 'Description', 'Wheel Description'])).toLowerCase();
      const model = String(findValue(item, ['Model', 'Series'])).toLowerCase();
      return sku.includes(q) || desc.includes(q) || model.includes(q);
    });
  }, [searchQuery, data, activeTab]);

  const handleSelectSKU = (item) => {
    setSelectedSKU(item);
    const skuVal = findValue(item, ['SKU#', 'SKU', 'Wheel SKU', 'Part#', 'Part No.']);
    setSearchQuery(skuVal !== 'N/A' ? String(skuVal) : '');
  };

  const rimSKU = useMemo(() => {
    if (!selectedSKU) return 'N/A';
    const rimSKUF = findValue(selectedSKU, ['RIM SKU F', 'Rim SKU F']);
    const rimSKUR = findValue(selectedSKU, ['RIM SKU R', 'Rim SKU R']);
    const position = findValue(selectedSKU, ['Front / Rear', 'Front/Rear', 'F/R', 'Position', 'F_R']).toUpperCase();
    if (position.includes('FRONT') || position === 'F') {
      return rimSKUF !== 'N/A' && rimSKUF !== '' ? rimSKUF : (rimSKUR !== 'N/A' ? rimSKUR : 'N/A');
    } else if (position.includes('REAR') || position === 'R') {
      return rimSKUR !== 'N/A' && rimSKUR !== '' ? rimSKUR : (rimSKUF !== 'N/A' ? rimSKUF : 'N/A');
    } else {
      if (rimSKUF !== 'N/A' && rimSKUF !== '') return rimSKUF;
      if (rimSKUR !== 'N/A' && rimSKUR !== '') return rimSKUR;
      return 'N/A';
    }
  }, [selectedSKU]);

  const hubSKU = useMemo(() => {
    if (!selectedSKU) return 'N/A';
    const hubSKUF = findValue(selectedSKU, ['Hub SKU F', 'Hub SKU F']);
    const hubSKUR = findValue(selectedSKU, ['Hub SKU R', 'Hub SKU R']);
    const position = findValue(selectedSKU, ['Front / Rear', 'Front/Rear', 'F/R', 'Position', 'F_R']).toUpperCase();
    if (position.includes('FRONT') || position === 'F') {
      return hubSKUF !== 'N/A' && hubSKUF !== '' ? hubSKUF : (hubSKUR !== 'N/A' ? hubSKUR : 'N/A');
    } else if (position.includes('REAR') || position === 'R') {
      return hubSKUR !== 'N/A' && hubSKUR !== '' ? hubSKUR : (hubSKUF !== 'N/A' ? hubSKUF : 'N/A');
    } else {
      if (hubSKUF !== 'N/A' && hubSKUF !== '') return hubSKUF;
      if (hubSKUR !== 'N/A' && hubSKUR !== '') return hubSKUR;
      return 'N/A';
    }
  }, [selectedSKU]);

  const tapeSKU = useMemo(() => {
    if (!selectedSKU) return 'N/A';
    const tapeSKUF = findValue(selectedSKU, ['Tape SKU F', 'Tape SKU F']);
    const tapeSKUR = findValue(selectedSKU, ['Tape SKU R', 'Tape SKU R']);
    const position = findValue(selectedSKU, ['Front / Rear', 'Front/Rear', 'F/R', 'Position', 'F_R']).toUpperCase();
    if (position.includes('FRONT') || position === 'F') {
      return tapeSKUF !== 'N/A' && tapeSKUF !== '' ? tapeSKUF : (tapeSKUR !== 'N/A' ? tapeSKUR : 'N/A');
    } else if (position.includes('REAR') || position === 'R') {
      return tapeSKUR !== 'N/A' && tapeSKUR !== '' ? tapeSKUR : (tapeSKUF !== 'N/A' ? tapeSKUF : 'N/A');
    } else {
      if (tapeSKUF !== 'N/A' && tapeSKUF !== '') return tapeSKUF;
      if (tapeSKUR !== 'N/A' && tapeSKUR !== '') return tapeSKUR;
      return 'N/A';
    }
  }, [selectedSKU]);

  const spokeDetails = useMemo(() => {
    if (!selectedSKU) {
      return { ndsSku: 'N/A', dsSku: 'N/A', ndsQty: '16 PCS', dsQty: '16 PCS', ndsSpec: 'N/A', dsSpec: 'N/A', totalNipples: 32 };
    }
    const position = findValue(selectedSKU, ['Front / Rear', 'Front/Rear', 'F/R', 'Position', 'F_R']).toUpperCase();
    const rimMat = String(findValue(selectedSKU, ['Rim material', 'Material'])).toUpperCase();
    const isRear = position.includes('REAR') || position === 'R';
    const isCarbon = rimMat.includes('CARBON');

    // 動態格式化 Spoke 技術規格：Alloy 顯示 Vendor，Carbon 隱藏 Vendor
    const formatSpec = (vendor, spec, color, len) => {
      const v = vendor !== 'N/A' && vendor ? vendor : '';
      const s = spec !== 'N/A' && spec ? spec : '';
      const c = color !== 'N/A' && color ? color : '';
      const l = len !== 'N/A' && len ? `${len}mm` : 'TBD';
      
      let parts = [];
      if (!isCarbon && v) parts.push(v);
      if (s) parts.push(s);
      if (c) parts.push(c);
      
      const leftPart = parts.join(' ').trim();
      return leftPart ? `${leftPart} | L: ${l}` : `NA | L: ${l}`;
    };

    let ndsSku = 'N/A', dsSku = 'N/A', ndsQty = '16 PCS', dsQty = '16 PCS', ndsSpec = 'N/A', dsSpec = 'N/A', ndsQtyNum = 16, dsQtyNum = 16;

    if (isRear) {
      ndsSku = findValue(selectedSKU, ['Spoke NDS R SKU', 'Spoke NDS SKU', 'SPOKE - NDS R SKU', 'Spoke NDS F SKU']);
      const q3 = findValue(selectedSKU, ['Quantity 3', 'Quantity3']);
      ndsQtyNum = q3 !== 'N/A' && q3 !== '' ? parseInt(q3, 10) : 16;
      ndsQty = `${ndsQtyNum} PCS`;
      
      const vendor3 = findValue(selectedSKU, ['Spoke Vendor 3', 'Spoke Vendor3', 'Spoke Vendor', 'Vendor 3', 'Vendor']);
      const spec3 = findValue(selectedSKU, ['Type3', 'Spoke Spec 3', 'Spoke Spec3', 'Spoke Spec', 'Spoke Type', 'Type']);
      const len3 = findValue(selectedSKU, ['Length3', 'Length 3', 'SPOKE - NDS R', 'Length']);
      const col3 = findValue(selectedSKU, ['Color3', 'Color 3', 'Color']);
      ndsSpec = formatSpec(vendor3, spec3, col3, len3);

      dsSku = findValue(selectedSKU, ['Spoke DS R SKU', 'Spoke DS SKU', 'SPOKE - DS R SKU', 'Spoke NDS R SKU', 'Spoke NDS SKU', 'Spoke DS F SKU']);
      const q4 = findValue(selectedSKU, ['Quantity 4', 'Quantity4']);
      dsQtyNum = q4 !== 'N/A' && q4 !== '' ? parseInt(q4, 10) : 16;
      dsQty = `${dsQtyNum} PCS`;
      
      const vendor4 = findValue(selectedSKU, ['Spoke Vendor 4', 'Spoke Vendor4', 'Spoke Vendor 2', 'Vendor 4', 'Vendor 2', 'Spoke Vendor 3', 'Spoke Vendor', 'Vendor']);
      const spec4 = findValue(selectedSKU, ['Type4', 'Spoke Spec 4', 'Spoke Spec4', 'Spoke Spec 2', 'Type2', 'Type3', 'Type', 'Spoke Spec', 'Spoke Type']); 
      const len4 = findValue(selectedSKU, ['Length4', 'Length 4', 'SPOKE - DS R', 'Length2', 'Length 2', 'Length3', 'Length 3', 'Length']); 
      const col4 = findValue(selectedSKU, ['Color4', 'Color 4', 'Color2', 'Color 2', 'Color3', 'Color 3', 'Color']);
      dsSpec = formatSpec(vendor4, spec4, col4, len4);
      
    } else {
      ndsSku = findValue(selectedSKU, ['Spoke NDS F SKU', 'Spoke NDS SKU', 'SPOKE - NDS F SKU']);
      const q1 = findValue(selectedSKU, ['Quantity', 'Quantity 1', 'Quantity1']);
      ndsQtyNum = q1 !== 'N/A' && q1 !== '' ? parseInt(q1, 10) : 16;
      ndsQty = `${ndsQtyNum} PCS`;
      
      const vendor1 = findValue(selectedSKU, ['Spoke Vendor 1', 'Spoke Vendor1', 'Spoke Vendor', 'Vendor']);
      const spec1 = findValue(selectedSKU, ['Type', 'Spoke Spec 1', 'Spoke Spec1', 'Spoke Spec', 'Spoke Type']);
      // 關鍵更新：加入 SPOKE - NDS F 獲取特殊存放的長度資料
      const len1 = findValue(selectedSKU, ['Length', 'Length 1', 'Length1', 'SPOKE - NDS F']);
      const col1 = findValue(selectedSKU, ['Color', 'Color 1', 'Color1']);
      ndsSpec = formatSpec(vendor1, spec1, col1, len1);

      dsSku = findValue(selectedSKU, ['Spoke DS F SKU', 'Spoke DS SKU', 'SPOKE - DS F SKU', 'Spoke NDS F SKU']);
      const q2 = findValue(selectedSKU, ['Quantity 2', 'Quantity2']);
      dsQtyNum = q2 !== 'N/A' && q2 !== '' ? parseInt(q2, 10) : 16;
      dsQty = `${dsQtyNum} PCS`;
      
      const vendor2 = findValue(selectedSKU, ['Spoke Vendor 2', 'Spoke Vendor2', 'Spoke Vendor', 'Vendor 2', 'Vendor']);
      const spec2 = findValue(selectedSKU, ['Type2', 'Spoke Spec 2', 'Spoke Spec2', 'Type', 'Spoke Spec', 'Spoke Type']);
      // 關鍵更新：加入 SPOKE - DS F 獲取特殊存放的長度資料
      const len2 = findValue(selectedSKU, ['Length2', 'Length 2', 'SPOKE - DS F', 'Length']);
      const col2 = findValue(selectedSKU, ['Color2', 'Color 2', 'Color']);
      dsSpec = formatSpec(vendor2, spec2, col2, len2);
    }
    
    const totalNipples = (isNaN(ndsQtyNum) ? 16 : ndsQtyNum) + (isNaN(dsQtyNum) ? 16 : dsQtyNum);
    return { ndsSku, dsSku, ndsQty, dsQty, ndsSpec, dsSpec, totalNipples };
  }, [selectedSKU]);

  const currentBOM = useMemo(() => {
    if (!selectedSKU) return [];
    
    const rimMat = findValue(selectedSKU, ['Rim material']);
    const rimWidth = findValue(selectedSKU, ['Rim inner width F', 'Rim inner width R', 'Rim inner width']);
    const hubSupplier = findValue(selectedSKU, ['Hub supplier / Type', 'Hub supplier', 'Hub Spec']);
    const hubType = findValue(selectedSKU, ['Hub type', 'Hub Spec']);
    const nippleSKU = findValue(selectedSKU, ['Nipple SKU', 'Nipple Part#']);
    const nippleDetail = findValue(selectedSKU, ['Nipple material / dimension', 'Nipple Spec']);
    const tapeWidth = findValue(selectedSKU, ['width (mm) F', 'width (mm) R', 'Tape Width']);
    const valveSKU = findValue(selectedSKU, ['Valve SKU', 'Valve Part#']);
    const valveSpec = findValue(selectedSKU, ['Valve Spec', 'Valve Description']);

    return [
      { id: '01', partKey: 'rim', component: 'Rim', sku: rimSKU, desc: `${rimMat} | Inner Width ${rimWidth}mm`, qty: '1 PC' },
      { id: '02', partKey: 'hub', component: 'Hub Assembly', sku: hubSKU, desc: `${hubSupplier} / ${hubType}`, qty: '1 PC' },
      { id: '03', partKey: 'spokes', component: 'Spoke NDS', sku: spokeDetails.ndsSku, desc: spokeDetails.ndsSpec, qty: spokeDetails.ndsQty },
      { id: '04', partKey: 'spokes', component: 'Spoke DS', sku: spokeDetails.dsSku, desc: spokeDetails.dsSpec, qty: spokeDetails.dsQty },
      { id: '05', partKey: 'nipples', component: 'Nipple', sku: nippleSKU, desc: nippleDetail, qty: `${spokeDetails.totalNipples} PCS` },
      { id: '06', partKey: 'tape', component: 'Tubeless Rim Tape', sku: tapeSKU, desc: `High-tension tape | Width ${tapeWidth}mm`, qty: '1 ROLL' },
      { id: '07', partKey: 'valve', component: 'Tubeless Valve', sku: valveSKU, desc: valveSpec, qty: '1 PC' },
    ];
  }, [selectedSKU, rimSKU, hubSKU, spokeDetails, tapeSKU]);

  const spokeGeometry = useMemo(() => {
    const spokes = [];
    const numSpokes = 32;
    const rFlange = 38; 
    const rRim = 145;   
    const cx = 250;     
    const cy = 180;     

    for (let i = 0; i < numSpokes; i++) {
      const angleF = (i * 360 / numSpokes) * (Math.PI / 180);
      const crossOffset = i % 2 === 0 ? 5 : -5;
      const angleR = ((i + crossOffset) * 360 / numSpokes) * (Math.PI / 180);
      const x1 = cx + rFlange * Math.cos(angleF);
      const y1 = cy + rFlange * Math.sin(angleF);
      const x2 = cx + rRim * Math.cos(angleR);
      const y2 = cy + rRim * Math.sin(angleR);
      spokes.push({ x1, y1, x2, y2 });
    }
    return spokes;
  }, []);

  const theme = getTheme(isDarkMode, themeColor);
 
const tailwindHack = `
bg-cyan-50 bg-cyan-100 bg-cyan-400 bg-cyan-500 bg-cyan-950
bg-cyan-50/30 bg-cyan-50/50 bg-cyan-50/80
bg-cyan-950/25 bg-cyan-950/40 bg-cyan-950/50

border-cyan-200 border-cyan-300 border-cyan-400 border-cyan-500 border-cyan-900 border-cyan-950
border-cyan-500/50 border-cyan-900/50 border-cyan-900/60 border-cyan-950/10

text-cyan-300 text-cyan-400 text-cyan-500 text-cyan-600 text-cyan-700 text-cyan-800 text-cyan-950
text-cyan-300/80 text-cyan-400/70 text-cyan-400/80 text-cyan-700/90

bg-emerald-50 bg-emerald-100 bg-emerald-400 bg-emerald-500 bg-emerald-950
bg-emerald-50/30 bg-emerald-50/50 bg-emerald-50/80
bg-emerald-950/25 bg-emerald-950/40 bg-emerald-950/50

border-emerald-200 border-emerald-300 border-emerald-400 border-emerald-500 border-emerald-900 border-emerald-950
border-emerald-500/50 border-emerald-900/50 border-emerald-900/60 border-emerald-950/10

text-emerald-300 text-emerald-400 text-emerald-500 text-emerald-600 text-emerald-700 text-emerald-800 text-emerald-950
text-emerald-300/80 text-emerald-400/70 text-emerald-400/80 text-emerald-700/90

bg-violet-50 bg-violet-100 bg-violet-400 bg-violet-500 bg-violet-950
bg-violet-50/30 bg-violet-50/50 bg-violet-50/80
bg-violet-950/25 bg-violet-950/40 bg-violet-950/50

border-violet-200 border-violet-300 border-violet-400 border-violet-500 border-violet-900 border-violet-950
border-violet-500/50 border-violet-900/50 border-violet-900/60 border-violet-950/10

text-violet-300 text-violet-400 text-violet-500 text-violet-600 text-violet-700 text-violet-800 text-violet-950
text-violet-300/80 text-violet-400/70 text-violet-400/80 text-violet-700/90

bg-amber-50 bg-amber-100 bg-amber-400 bg-amber-500 bg-amber-950
bg-amber-50/30 bg-amber-50/50 bg-amber-50/80
bg-amber-950/25 bg-amber-950/40 bg-amber-950/50

border-amber-200 border-amber-300 border-amber-400 border-amber-500 border-amber-900 border-amber-950
border-amber-500/50 border-amber-900/50 border-amber-900/60 border-amber-950/10

text-amber-300 text-amber-400 text-amber-500 text-amber-600 text-amber-700 text-amber-800 text-amber-950
text-amber-300/80 text-amber-400/70 text-amber-400/80 text-amber-700/90

bg-rose-50 bg-rose-100 bg-rose-400 bg-rose-500 bg-rose-950
bg-rose-50/30 bg-rose-50/50 bg-rose-50/80
bg-rose-950/25 bg-rose-950/40 bg-rose-950/50

border-rose-200 border-rose-300 border-rose-400 border-rose-500 border-rose-900 border-rose-950
border-rose-500/50 border-rose-900/50 border-rose-900/60 border-rose-950/10

text-rose-300 text-rose-400 text-rose-500 text-rose-600 text-rose-700 text-rose-800 text-rose-950
text-rose-300/80 text-rose-400/70 text-rose-400/80 text-rose-700/90
`;

  return (
    <>
  <div className="hidden">
    {tailwindHack}
  </div>

    <div className={`min-h-screen font-mono overflow-x-clip transition-colors duration-300 custom-scrollbar ${theme.bg} ${theme.text}`}>
      
      {/* 使用純 CSS 自動同步整個畫面的背景，解決瀏覽器原生的白底問題 */}
      <style dangerouslySetInnerHTML={{__html: `
        body, html {
          background-color: ${isDarkMode ? '#06070a' : '#f8fafc'} !important;
          color: ${isDarkMode ? '#e5e7eb' : '#1e293b'} !important;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* 全局滾動條與特定容器滾動條一併自訂，確保主題美觀 */
        ::-webkit-scrollbar, .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track, .custom-scrollbar::-webkit-scrollbar-track { background: ${theme.scrollbarTrack}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb, .custom-scrollbar::-webkit-scrollbar-thumb { background: ${theme.scrollbarThumb}; border: 2px solid ${theme.scrollbarTrack}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover, .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${theme.scrollbarThumbHover}; }
      `}} />
    

      {/* Header - 加入 lg:sticky 讓手機版不固定，桌機版固定 */}
      <header className={`lg:sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${theme.header}`}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded flex items-center justify-center animate-pulse ${theme.iconWrap}`}>
              <Activity className={`w-6 h-6 ${theme.iconMain}`} />
            </div>
            <div>
              <h1 className={`text-base md:text-xl font-bold tracking-[0.2em] ${theme.logoTitle}`}>WHEEL_SYS<span className={theme.iconMain}>.BOM_EXPLORER</span></h1>
              <span className={`text-xs block tracking-wider font-bold ${theme.searchTitle}`}>FRONT-VIEW GEOMETRY CALLOUTS</span>
            </div>
          </div>

          {/* 導航區塊 */}
          <div className="flex items-center gap-4">
            
            <div className={`hidden md:flex p-1 rounded border text-sm gap-1 ${theme.tabWrap}`}>
              <button onClick={() => setActiveTab('ALL')} className={`px-4 py-1.5 rounded transition-all font-semibold ${activeTab === 'ALL' ? theme.tabActive : theme.tabInactive}`}>
                ALL ({data.length})
              </button>
              <button onClick={() => setActiveTab('ALLOY')} className={`px-4 py-1.5 rounded transition-all font-semibold ${activeTab === 'ALLOY' ? theme.tabActive : theme.tabInactive}`}>
                ALLOY
              </button>
              <button onClick={() => setActiveTab('CARBON')} className={`px-4 py-1.5 rounded transition-all font-semibold ${activeTab === 'CARBON' ? theme.tabActive : theme.tabInactive}`}>
                CARBON
              </button>
            </div>

            <div className="text-right text-xs hidden sm:block font-bold ml-2">
              <div className={theme.statText}>DB_SOURCE: <span className={theme.iconMain}>GOOGLE_SHEETS_LIVE</span></div>
              <div className={theme.statText}>TOTAL_LOADED: <span className={theme.statVal}>{data.length} SKUs</span></div>
            </div>

            <div className="h-6 w-px bg-gray-600/30 mx-2 hidden sm:block"></div>

            {/* 5 款主題色系切換器 */}
            <div className={`hidden md:flex items-center gap-2.5 pr-2`}>
              {PALETTES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setThemeColor(p.id)}
                  className={`w-4 h-4 rounded-full transition-all ${themeColor === p.id ? 'scale-125 ring-2 ring-offset-2' : 'hover:scale-110 opacity-50 hover:opacity-100'}`}
                  style={{ 
                    backgroundColor: p.hex,
                    '--tw-ring-color': p.hex,
                    '--tw-ring-offset-color': isDarkMode ? '#0a0c10' : '#ffffff'
                  }}
                  title={`Switch to ${p.name} Theme`}
                />
              ))}
            </div>

            {/* 切換 日間/夜間模式 Toggle Button */}
            <button 
              type="button"
              onClick={handleToggleTheme} 
              className={`p-2.5 rounded border transition-all cursor-pointer relative z-50 ${isDarkMode ? 'bg-[#0f121d] border-gray-800 text-yellow-500 hover:border-yellow-500/50' : 'bg-slate-100 border-slate-300 text-indigo-500 hover:border-indigo-400'}`}
              title="Toggle Day/Night Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 pointer-events-none" /> : <Moon className="w-5 h-5 pointer-events-none" />}
            </button>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 mb-6">
            <div className={`absolute inset-0 rounded-full border-4 animate-spin ${theme.loaderRing}`}></div>
            <div className={`absolute inset-2 rounded-full border border-dashed animate-ping ${theme.loaderPing}`}></div>
            <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${theme.loaderText}`}>LOADING</div>
          </div>
          <p className={`text-sm tracking-[0.2em] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>SYNCING ALL WORKBOOK SHEETS (ALLOY & CARBON)...</p>
          <div className={`w-56 h-1.5 rounded overflow-hidden mt-4 ${theme.loaderTrack}`}>
            <div className={`h-full animate-pulse ${theme.loaderBar}`} style={{ width: '70%' }}></div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* 左側：料號搜尋與清單選取區 - 將 sticky 改為 lg:sticky 讓手機版不固定 */}
          <div className={`lg:col-span-1 border rounded-lg p-5 flex flex-col h-fit self-start transition-colors duration-300 lg:sticky lg:top-28 z-40 ${theme.panel}`}>
            <div className="mb-4">
              <span className={`text-xs block mb-2 font-bold tracking-wider ${theme.searchTitle}`}>SEARCH_CONSOLE // FUZZY SEARCH</span>
              <div className="relative">
                <input
                  type="text"
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                  placeholder="Enter SKU / Description..."
                  className={`w-full rounded text-sm py-3 pl-10 pr-4 outline-none transition-colors font-mono ${theme.inputWrap}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className={`w-4 h-4 absolute left-3 top-3.5 ${theme.searchIcon}`} />
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className={`flex md:hidden p-1 rounded border text-xs mb-3 ${theme.tabWrap}`}>
              <button onClick={() => setActiveTab('ALL')} className={`flex-1 py-2 rounded text-center font-bold ${activeTab === 'ALL' ? theme.tabActive : theme.tabInactive}`}>ALL</button>
              <button onClick={() => setActiveTab('ALLOY')} className={`flex-1 py-2 rounded text-center font-bold ${activeTab === 'ALLOY' ? theme.tabActive : theme.tabInactive}`}>ALLOY</button>
              <button onClick={() => setActiveTab('CARBON')} className={`flex-1 py-2 rounded text-center font-bold ${activeTab === 'CARBON' ? theme.tabActive : theme.tabInactive}`}>CARBON</button>
            </div>

            <div className="h-[210px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              <span className={`text-xs block pb-2 border-b sticky top-0 font-bold z-10 ${isDarkMode ? 'border-[#1a1f2c] bg-[#0b0d14] text-gray-400' : 'border-slate-200 bg-white text-slate-500'}`}>
                SHOWING: {filteredData.length} MATCHES
              </span>
              {filteredData.length === 0 ? (
                <div className="text-center py-16 text-sm flex flex-col items-center justify-center gap-3">
                  <Cpu className={`w-8 h-8 animate-pulse ${theme.emptyIcon}`} />
                  <span className={`tracking-widest font-bold ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Please enter keyword above</span>
                </div>
              ) : (
                filteredData.map((item, idx) => {
                  const itemSKU = findValue(item, ['SKU#', 'SKU', 'Wheel SKU', 'Part#', 'Part No.']);
                  const itemDesc = findValue(item, ['Part Description', 'Description', 'Wheel Description']);
                  const isSelected = selectedSKU && findValue(selectedSKU, ['SKU#', 'SKU']) === itemSKU;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectSKU(item)}
                      className={`w-full text-left p-3.5 rounded border transition-all text-sm font-mono flex flex-col ${isSelected ? theme.itemActiveBg : theme.itemBg}`}
                    >
                      <div className="flex justify-between items-center w-full mb-1.5">
                        <span className={`font-extrabold text-sm ${isSelected ? theme.iconMain : theme.itemSKU}`}>{itemSKU}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${theme.itemTag}`}>{findValue(item, ['Model', 'Series'])}</span>
                      </div>
                      <span className={`text-xs truncate w-full font-sans leading-relaxed ${theme.itemDesc}`}>{itemDesc}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Display */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            
            {/* Awaiting Input */}
            {!selectedSKU ? (
              <div className={`h-[730px] flex flex-col items-center justify-center border border-dashed rounded-xl p-10 text-center transition-colors duration-300 ${isDarkMode ? 'border-cyan-900/30 bg-[#0a0c12]/20' : 'border-slate-300 bg-slate-50/50'}`}>
                <Cpu className={`w-20 h-20 mb-6 animate-pulse ${theme.emptyIcon}`} />
                <h2 className={`text-xl font-bold tracking-widest uppercase mb-3 ${theme.searchIcon}`}>AWAITING_INPUT // SYSTEM STANDBY</h2>
                <p className={`text-sm max-w-lg leading-relaxed font-sans ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  Please select a wheel assembly from the left sidebar or enter a part number above for a fuzzy search.
                  The system will instantly analyze 726 Alloy & Carbon part numbers, rendering the front-view geometric structure and a one-page BOM table.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500 flex flex-col">
                
                {/* SKU Ref Header */}
                <div className={`relative overflow-hidden rounded-lg p-6 flex flex-col sm:flex-row justify-between sm:items-center transition-colors duration-300 ${theme.skuCard}`}>
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${theme.accentBar}`}></div>
                  <div className="pl-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs tracking-wider font-bold ${theme.iconMain}`}>SKU REFERENCE RECORD</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${theme.skuBadge}`}>ACTIVE</span>
                    </div>
                    <h2 className={`text-3xl font-bold font-mono tracking-tight flex items-center gap-2 ${theme.skuTitle}`}>
                      {findValue(selectedSKU, ['SKU#', 'SKU', 'Wheel SKU'])}
                    </h2>
                    <p className={`text-sm mt-1.5 max-w-2xl font-sans leading-relaxed ${theme.skuDesc}`}>
                      {findValue(selectedSKU, ['Part Description', 'Description', 'Wheel Description'])}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex gap-4 text-sm font-sans z-10">
                    <div className={`p-3 rounded text-center min-w-[100px] border backdrop-blur-sm ${theme.infoBox}`}>
                      <span className={`text-xs block mb-0.5 font-bold ${theme.infoLabel}`}>POSITION</span>
                      <span className={`font-bold uppercase tracking-wider ${theme.iconMain}`}>{findValue(selectedSKU, ['Front / Rear', 'Front/Rear', 'F/R', 'Position'])}</span>
                    </div>
                    <div className={`p-3 rounded text-center min-w-[100px] border backdrop-blur-sm ${theme.infoBox}`}>
                      <span className={`text-xs block mb-0.5 font-bold ${theme.infoLabel}`}>MODEL</span>
                      <span className="font-bold">{findValue(selectedSKU, ['Model', 'Series'])}</span>
                    </div>
                  </div>
                </div>

                {/* SVG Blueprint Viewer */}
                <div className={`rounded-lg p-5 relative overflow-hidden flex flex-col border transition-colors duration-300 ${theme.svgPanel}`} style={{ backgroundImage: theme.svgGrid, backgroundSize: '15px 15px' }}>
                  <div className={`absolute top-3 left-4 text-xs flex items-center gap-1.5 tracking-[0.15em] z-10 font-bold ${theme.searchIcon}`}>
                    <FileText className="w-4 h-4" /> FRONT-VIEW INTERACTIVE RADIAL SYSTEM // GEOMETRIC SYNCHRONIZER
                  </div>
                  
                  <div className="w-full pt-4 pb-2">
                    <div className="w-full relative">
                      <svg viewBox="0 0 1100 360" className="w-full h-auto drop-shadow-sm transition-all duration-300">
                        
                        <line x1="250" y1="20" x2="250" y2="340" stroke={theme.svgAxis} strokeWidth="1" strokeDasharray="5,5" />
                        <line x1="40" y1="180" x2="480" y2="180" stroke={theme.svgAxis} strokeWidth="1" strokeDasharray="5,5" />
                        
                        {/* 06_Tape */}
                        <circle 
                          cx="250" cy="180" r="150" 
                          fill="none" 
                          stroke={hoveredPart === 'tape' ? 'url(#tapeGlow)' : theme.svgTapeBase} 
                          strokeWidth={hoveredPart === 'tape' ? '12' : '6'} 
                          strokeDasharray="15,5"
                          className="transition-all duration-300 cursor-pointer"
                          onMouseEnter={() => setHoveredPart('tape')}
                          onMouseLeave={() => setHoveredPart(null)}
                        />

                        {/* 01_Rim */}
                        <g className="cursor-pointer" onMouseEnter={() => setHoveredPart('rim')} onMouseLeave={() => setHoveredPart(null)}>
                          <circle cx="250" cy="180" r="172" fill="none" stroke={hoveredPart === 'rim' ? '#8b5cf6' : theme.svgBaseRim} strokeWidth="1.5" className="transition-all duration-300" />
                          <circle cx="250" cy="180" r="162" fill="none" stroke={hoveredPart === 'rim' ? '#8b5cf6' : theme.svgBaseHook} strokeWidth="5" className="transition-all duration-300" />
                          <circle cx="250" cy="180" r="145" fill="none" stroke={hoveredPart === 'rim' ? '#8b5cf6' : theme.svgBaseInner} strokeWidth="10" className="transition-all duration-300" style={{ filter: hoveredPart === 'rim' ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))' : 'none' }} />
                        </g>

                        {/* 03 & 04 Spokes */}
                        <g className="cursor-pointer" onMouseEnter={() => setHoveredPart('spokes')} onMouseLeave={() => setHoveredPart(null)}>
                          {spokeGeometry.map((spoke, idx) => (
                            <line 
                              key={idx}
                              x1={spoke.x1} y1={spoke.y1} x2={spoke.x2} y2={spoke.y2}
                              stroke={hoveredPart === 'spokes' ? '#3b82f6' : theme.svgSpokeBase}
                              strokeWidth={hoveredPart === 'spokes' ? '2.5' : '1.2'}
                              className="transition-all duration-300"
                              style={{ filter: hoveredPart === 'spokes' ? 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.6))' : 'none' }}
                            />
                          ))}
                        </g>

                        {/* 05_Nipples */}
                        <g className="cursor-pointer" onMouseEnter={() => setHoveredPart('nipples')} onMouseLeave={() => setHoveredPart(null)}>
                          {[...Array(32)].map((_, i) => {
                            const angle = (i * 360 / 32) * (Math.PI / 180);
                            const rNip = 145;
                            const nx = 250 + rNip * Math.cos(angle);
                            const ny = 180 + rNip * Math.sin(angle);
                            return (
                              <circle 
                                key={i} cx={nx} cy={ny} 
                                r={hoveredPart === 'nipples' ? '5.5' : '3'} 
                                fill={hoveredPart === 'nipples' ? '#10b981' : theme.svgNipBase} 
                                stroke="#10b981" strokeWidth="0.8"
                                className="transition-all duration-300"
                              />
                            );
                          })}
                        </g>

                        {/* 07_Valve */}
                        <g transform="translate(250, 180) rotate(135) translate(0, -145)" className="cursor-pointer" onMouseEnter={() => setHoveredPart('valve')} onMouseLeave={() => setHoveredPart(null)}>
                          <rect x="-3" y="0" width="6" height="30" fill="none" stroke={hoveredPart === 'valve' ? '#ec4899' : theme.svgValveBase} strokeWidth="1.5" className="transition-all duration-300" />
                          <line x1="-3" y1="10" x2="3" y2="10" stroke={hoveredPart === 'valve' ? '#ec4899' : theme.svgValveBase} strokeWidth="1" />
                          <line x1="-3" y1="20" x2="3" y2="20" stroke={hoveredPart === 'valve' ? '#ec4899' : theme.svgValveBase} strokeWidth="1" />
                          <rect x="-5" y="-3" width="10" height="6" fill={hoveredPart === 'valve' ? '#ec4899' : theme.svgNipBase} stroke="#ec4899" strokeWidth="1" />
                        </g>

                        {/* 02_Hub */}
                        <g className="cursor-pointer" onMouseEnter={() => setHoveredPart('hub')} onMouseLeave={() => setHoveredPart(null)}>
                          <circle cx="250" cy="180" r="45" fill={theme.svgHubCenter} stroke={hoveredPart === 'hub' ? '#0ea5e9' : theme.svgHubBase} strokeWidth="2" className="transition-all duration-300" />
                          {[...Array(16)].map((_, i) => {
                            const angle = (i * 360 / 16) * (Math.PI / 180);
                            const hx = 250 + 38 * Math.cos(angle);
                            const hy = 180 + 38 * Math.sin(angle);
                            return <circle key={i} cx={hx} cy={hy} r="1.5" fill={hoveredPart === 'hub' ? '#0ea5e9' : theme.svgHubHole} />;
                          })}
                          <circle cx="250" cy="180" r="28" fill="none" stroke={hoveredPart === 'hub' ? '#0ea5e9' : theme.svgHubBase} strokeWidth="1.5" strokeDasharray="4,4" className="transition-all duration-300" />
                          {[...Array(6)].map((_, i) => {
                            const angle = (i * 360 / 6) * (Math.PI / 180);
                            const bx = 250 + 20 * Math.cos(angle);
                            const by = 180 + 20 * Math.sin(angle);
                            return <circle key={i} cx={bx} cy={by} r="2" fill={hoveredPart === 'hub' ? '#0ea5e9' : theme.svgNipBase} stroke="#0ea5e9" strokeWidth="0.5" />;
                          })}
                          <circle cx="250" cy="180" r="12" fill={theme.svgHubAxle} stroke={hoveredPart === 'hub' ? '#0ea5e9' : theme.svgValveBase} strokeWidth="2" className="transition-all duration-300" />
                        </g>

                        {/* Callout Lines */}
                        <polyline points="370,80 500,80 570,80" fill="none" stroke={hoveredPart === 'rim' ? '#8b5cf6' : theme.svgTextBase} strokeWidth="1.2" className="transition-all duration-300" />
                        <circle cx="370" cy="80" r="3" fill="#8b5cf6" />
                        <text x="580" y="73" fill={theme.svgTextBase} fontSize="18" fontWeight="bold" className="tracking-wider">01_RIM PROFILE</text>
                        <text x="580" y="93" fill={hoveredPart === 'rim' ? '#8b5cf6' : theme.svgTextBase} fontSize="19" fontWeight="bold" className="font-mono transition-all duration-300">PN: {rimSKU}</text>

                        <polyline points="275,195 450,150 570,150" fill="none" stroke={hoveredPart === 'hub' ? '#0ea5e9' : theme.svgTextBase} strokeWidth="1.2" className="transition-all duration-300" />
                        <circle cx="275" cy="195" r="3" fill={hoveredPart === 'hub' ? '#0ea5e9' : theme.svgTextBase} className="transition-all duration-300" />
                        <text x="580" y="143" fill={theme.svgTextBase} fontSize="18" fontWeight="bold" className="tracking-wider">02_HUB ASSEMBLY</text>
                        <text x="580" y="163" fill={hoveredPart === 'hub' ? '#0ea5e9' : theme.svgTextBase} fontSize="19" fontWeight="bold" className="font-mono transition-all duration-300">PN: {hubSKU}</text>

                        <polyline points="340,240 480,210 570,210" fill="none" stroke={hoveredPart === 'spokes' ? '#3b82f6' : theme.svgTextBase} strokeWidth="1.2" className="transition-all duration-300" />
                        <circle cx="340" cy="240" r="3" fill="#3b82f6" />
                        <text x="580" y="203" fill={theme.svgTextBase} fontSize="18" fontWeight="bold" className="tracking-wider">03/04_SPOKES</text>
                        <text x="580" y="224" fill={hoveredPart === 'spokes' ? '#3b82f6' : theme.svgTextBase} fontSize="17" fontWeight="bold" className="font-mono transition-all duration-300">
                          NDS: {spokeDetails.ndsSku} / DS: {spokeDetails.dsSku}
                        </text>

                        <polyline points="383,285 500,285 570,285" fill="none" stroke={hoveredPart === 'nipples' ? '#10b981' : theme.svgTextBase} strokeWidth="1.2" className="transition-all duration-300" />
                        <circle cx="383" cy="285" r="3" fill="#10b981" />
                        <text x="580" y="278" fill={theme.svgTextBase} fontSize="18" fontWeight="bold" className="tracking-wider">05_NIPPLES</text>
                        <text x="580" y="298" fill={hoveredPart === 'nipples' ? '#10b981' : theme.svgTextBase} fontSize="19" fontWeight="bold" className="font-mono transition-all duration-300">PN: {findValue(selectedSKU, ['Nipple SKU', 'Nipple Part#'])}</text>

                        <polyline points="250,30 420,30 570,30" fill="none" stroke={hoveredPart === 'tape' ? '#a855f7' : theme.svgTextBase} strokeWidth="1.2" className="transition-all duration-300" />
                        <circle cx="250" cy="30" r="3" fill="#a855f7" />
                        <text x="580" y="23" fill={theme.svgTextBase} fontSize="18" fontWeight="bold" className="tracking-wider">06_RIM TAPE</text>
                        <text x="580" y="43" fill={hoveredPart === 'tape' ? '#a855f7' : theme.svgTextBase} fontSize="19" fontWeight="bold" className="font-mono transition-all duration-300">PN: {tapeSKU}</text>

                        <polyline points="342,272 450,330 570,330" fill="none" stroke={hoveredPart === 'valve' ? '#ec4899' : theme.svgTextBase} strokeWidth="1.2" className="transition-all duration-300" />
                        <circle cx="342" cy="272" r="3" fill="#ec4899" />
                        <text x="580" y="323" fill={theme.svgTextBase} fontSize="18" fontWeight="bold" className="tracking-wider">07_VALVE STEM</text>
                        <text x="580" y="343" fill={hoveredPart === 'valve' ? '#ec4899' : theme.svgTextBase} fontSize="19" fontWeight="bold" className="font-mono transition-all duration-300">PN: {findValue(selectedSKU, ['Valve SKU', 'Valve Part#'])}</text>

                        <text x="40" y="340" fill={theme.svgTextBase} fontSize="13">SECTION A-A / REVISION REV.B</text>

                        <defs>
                          <radialGradient id="tapeGlow">
                            <stop offset="60%" stopColor="#a855f7" stopOpacity="1" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Table Section - 強制統一為 Calibri 字體 */}
                <div className={`border rounded-lg overflow-hidden flex-1 shadow-md transition-colors duration-300 font-['Calibri',_sans-serif] ${theme.panel}`}>
                  <div className={`relative overflow-hidden px-6 py-5 flex items-center justify-between border-b ${theme.tableHeader}`}>
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${theme.accentBar}`}></div>
                    <div className="flex items-center gap-3.5 pl-2">
                      <div className={`p-2 rounded border animate-pulse ${theme.iconWrap}`}>
                        <Box className={`w-5 h-5 ${theme.iconMain}`} />
                      </div>
                      <div>
                        <h3 className={`text-base font-black tracking-[0.15em] uppercase ${theme.tableHeadText}`}>SYSTEM BILL OF MATERIALS</h3>
                        <span className={`text-[10px] font-['Calibri',_sans-serif] font-bold block mt-0.5 tracking-wider ${theme.tableSubText}`}>FULL SECURE COMPONENT PARSED ARCHIVE</span>
                      </div>
                    </div>
                    <span className={`text-xs font-['Calibri',_sans-serif] px-2.5 py-1 rounded border font-bold tracking-wider ${theme.tableVersion}`}>
                      SPEC_VERSION: G-SHEET_REV_1.10
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className={`uppercase text-xs tracking-widest font-extrabold transition-colors duration-300 ${theme.thead}`}>
                          <th className="py-4 px-6 w-20 border-r border-inherit">Item</th>
                          <th className="py-4 px-6 border-r border-inherit">Component Part</th>
                          <th className="py-4 px-6 border-r border-inherit">Part Number</th>
                          <th className="py-4 px-6 border-r border-inherit">Technical Specifications</th>
                          <th className="py-4 px-6 text-center w-32">Req Qty</th>
                        </tr>
                      </thead>
                      <tbody className={theme.tbody}>
                        {currentBOM.map((row) => {
                          const isPartHovered = hoveredPart === row.partKey;
                          return (
                            <tr 
                              key={row.id} 
                              onMouseEnter={() => setHoveredPart(row.partKey)}
                              onMouseLeave={() => setHoveredPart(null)}
                              className={`transition-all duration-150 cursor-pointer ${isPartHovered ? theme.trHover : theme.tr}`}
                            >
                              <td className={`py-4 px-6 font-extrabold text-base border-r ${theme.tdBorder} ${isPartHovered ? theme.iconMain : theme.tdId}`}>{row.id}</td>
                              <td className={`py-4 px-6 font-semibold border-r ${theme.tdBorder} ${theme.tdComponent}`}>{row.component}</td>
                              <td className={`py-4 px-6 border-r ${theme.tdBorder}`}>
                                <span className={`px-3 py-1.5 rounded border font-extrabold text-xs tracking-widest transition-all inline-block ${isPartHovered ? theme.skuBadgeHover : theme.skuBadge}`}>
                                  {row.sku && row.sku !== 'N/A' ? row.sku : 'N/A'}
                                </span>
                              </td>
                              <td className={`py-4 px-6 font-semibold leading-relaxed border-r ${theme.tdBorder} ${theme.tdDesc}`}>{row.desc}</td>
                              <td className={`py-4 px-6 text-center font-bold ${theme.tdQty}`}>{row.qty}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
    
      )}
    </div>
    </>
  );
}