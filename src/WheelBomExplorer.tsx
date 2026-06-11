import React, { useState, useEffect, useMemo } from 'react';
import { Search, Database, Settings, Activity, Box, Info, ShieldAlert, Cpu, Layers, RefreshCw, FileText, CheckCircle, Sun, Moon } from 'lucide-react';

// 預設綁定的 Google Sheet CSV 網址
const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNz-FkFCaydBFpW3e39QnM2AyEs9-mmdn_-LfQXtpFTTsNaOWq702_wzAa5rasdS5fNEnsf4cGcNag/pub?output=csv";

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
        try {
          return JSON.stringify(val);
        } catch (e) {
          return 'Object';
        }
      }
      return String(val).trim();
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

export default function WheelBomExplorer() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); 
  const [hoveredPart, setHoveredPart] = useState(null);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Theme Dictionary
  const theme = isDarkMode ? {
    bg: "bg-[#06070a]",
    text: "text-gray-200",
    header: "bg-[#0a0c10]/95 border-cyan-950 shadow-[0_4px_30px_rgba(0,180,216,0.15)]",
    logoTitle: "text-gray-100",
    tabWrap: "bg-[#0f121d] border-[#1f2937]",
    tabActive: "bg-cyan-950 border-cyan-500/50 text-cyan-400",
    tabInactive: "text-gray-400 hover:text-gray-200",
    statText: "text-gray-500",
    statVal: "text-cyan-400",
    panel: "bg-[#0b0d14] border-[#1a1f2c]",
    inputWrap: "bg-[#05060b] border-[#1f2937] text-white placeholder-gray-500 focus:border-cyan-500",
    itemBg: "bg-[#05060b] border-gray-900 text-gray-400 hover:border-gray-800 hover:bg-[#0d0f17]",
    itemActiveBg: "bg-cyan-950/40 border-cyan-500 text-white shadow-[inset_0_0_10px_rgba(6,182,212,0.15)]",
    itemSKU: "text-gray-300",
    itemTag: "text-gray-400 bg-[#0f121d]",
    itemDesc: "text-gray-500",
    emptyIcon: "text-cyan-900/40",
    // 確保 skuCard 與 tableHeader 使用完全相同的漸層背景與邊框設定
    skuCard: "bg-gradient-to-r from-[#0c244d] via-[#0b101d] to-[#07090e] border border-cyan-900/60 shadow-xl",
    accentBar: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]",
    skuTitle: "text-white",
    skuDesc: "text-cyan-300/80",
    infoBox: "bg-[#05060b]/60 border-cyan-900/50 text-gray-200",
    infoLabel: "text-gray-500",
    svgPanel: "bg-[#07090e] border-cyan-950",
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
    tableHeader: "bg-gradient-to-r from-[#0c244d] via-[#0b101d] to-[#07090e] border-b border-cyan-900/60",
    tableHeadText: "text-gray-100",
    tableSubText: "text-cyan-400/70",
    tableVersion: "text-cyan-400/80 bg-cyan-950/50 border-cyan-900/50",
    thead: "bg-[#0f172a] text-cyan-400 border-cyan-950",
    tbody: "divide-y divide-[#131723] text-sm",
    tr: "hover:bg-[#121624]/60 bg-[#080a0f]/20",
    trHover: "bg-cyan-950/25 text-white font-bold",
    tdId: "text-gray-500",
    tdBorder: "border-cyan-950/10",
    tdText: "text-gray-300",
    skuBadge: "bg-[#0c1322] border-cyan-950 text-cyan-400",
    skuBadgeHover: "bg-cyan-950 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]",
    scrollbarTrack: "#06070a",
    scrollbarThumb: "#0891b2",
    scrollbarThumbHover: "#06b6d4"
  } : {
    bg: "bg-slate-50",
    text: "text-slate-800",
    header: "bg-white/95 border-cyan-200 shadow-sm",
    logoTitle: "text-slate-800",
    tabWrap: "bg-slate-100 border-slate-200",
    tabActive: "bg-cyan-50 border-cyan-400 text-cyan-700 shadow-sm",
    tabInactive: "text-slate-500 hover:text-slate-700",
    statText: "text-slate-500",
    statVal: "text-cyan-600",
    panel: "bg-white border-slate-200 shadow-sm",
    inputWrap: "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:bg-white",
    itemBg: "bg-white border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-cyan-50/30",
    itemActiveBg: "bg-cyan-50 border-cyan-400 text-cyan-900 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]",
    itemSKU: "text-slate-800",
    itemTag: "text-slate-500 bg-slate-100 border border-slate-200",
    itemDesc: "text-slate-500",
    emptyIcon: "text-slate-300",
    skuCard: "bg-gradient-to-r from-cyan-50 via-white to-slate-50 border border-slate-200 shadow-sm",
    accentBar: "bg-cyan-500 shadow-sm",
    skuTitle: "text-slate-800",
    skuDesc: "text-cyan-700/90",
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
    tableHeader: "bg-gradient-to-r from-cyan-50 via-white to-slate-50 border-b border-slate-200",
    tableHeadText: "text-slate-800",
    tableSubText: "text-slate-500",
    tableVersion: "text-slate-500 bg-white border-slate-200",
    thead: "bg-slate-100 text-cyan-800 border-slate-200",
    tbody: "divide-y divide-slate-100 text-sm",
    tr: "hover:bg-cyan-50/50 bg-white",
    trHover: "bg-cyan-50/80 text-cyan-950 font-bold",
    tdId: "text-slate-400",
    tdBorder: "border-slate-100",
    tdText: "text-slate-600",
    skuBadge: "bg-white border-slate-300 text-slate-600",
    skuBadgeHover: "bg-cyan-100 border-cyan-400 text-cyan-800 shadow-sm",
    scrollbarTrack: "#f8fafc",
    scrollbarThumb: "#cbd5e1",
    scrollbarThumbHover: "#94a3b8"
  };

  useEffect(() => {
    const savedUrl = localStorage.getItem('wheelBOM_sheetUrl') || DEFAULT_SHEET_URL;

    if (!(window as any).XLSX) {
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

      if (isXlsxCapable && (window as any).XLSX) {
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Failed to access spreadsheet.');
        
        const arrayBuffer = await response.arrayBuffer();
        const arrayData = new Uint8Array(arrayBuffer);
        const workbook = (window as any).XLSX.read(arrayData, { type: 'array' });
        
        let combinedData = [];
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = (window as any).XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          combinedData = [...combinedData, ...jsonData];
        });

        if (combinedData.length > 0) {
          const cleanedData = combinedData.filter(item => {
            const sku = findValue(item, ['SKU#', 'SKU', 'Wheel SKU', 'Part#', 'Part No.']);
            return sku && sku !== 'N/A' && String(sku).trim() !== '';
          });

          setData(cleanedData);
          localStorage.setItem('wheelBOM_sheetUrl', url);
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
        localStorage.setItem('wheelBOM_sheetUrl', url);
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
    const isRear = position.includes('REAR') || position === 'R';

    let ndsSku = 'N/A', dsSku = 'N/A', ndsQty = '16 PCS', dsQty = '16 PCS', ndsSpec = 'N/A', dsSpec = 'N/A', ndsQtyNum = 16, dsQtyNum = 16;

    if (isRear) {
      ndsSku = findValue(selectedSKU, ['Spoke NDS R SKU', 'Spoke NDS SKU']);
      if (ndsSku === 'N/A' || ndsSku === '') ndsSku = findValue(selectedSKU, ['Spoke NDS F SKU']);
      const q3 = findValue(selectedSKU, ['Quantity 3', 'Quantity3']);
      ndsQtyNum = q3 !== 'N/A' && q3 !== '' ? parseInt(q3, 10) : 16;
      ndsQty = `${ndsQtyNum} PCS`;
      const vendor3 = findValue(selectedSKU, ['Spoke Vendor 3', 'Spoke Vendor3', 'Spoke Vendor']);
      const spec3 = findValue(selectedSKU, ['Spoke Spec 3', 'Spoke Spec3', 'Spoke Spec']);
      const len3 = findValue(selectedSKU, ['Length 3', 'Length3']);
      const col3 = findValue(selectedSKU, ['Color 3', 'Color3', 'Color']);
      ndsSpec = `${vendor3 !== 'N/A' ? vendor3 : ''} ${spec3 !== 'N/A' ? spec3 : ''} ${col3 !== 'N/A' ? col3 : ''} | L: ${len3 !== 'N/A' ? len3 + 'mm' : 'TBD'}`.trim();

      dsSku = findValue(selectedSKU, ['Spoke DS R SKU', 'Spoke DS SKU']);
      if (dsSku === 'N/A' || dsSku === '') dsSku = findValue(selectedSKU, ['Spoke DS F SKU']);
      const q4 = findValue(selectedSKU, ['Quantity 4', 'Quantity4']);
      dsQtyNum = q4 !== 'N/A' && q4 !== '' ? parseInt(q4, 10) : 16;
      dsQty = `${dsQtyNum} PCS`;
      const vendor4 = findValue(selectedSKU, ['Spoke Vendor 4', 'Spoke Vendor4', 'Spoke Vendor2', 'Spoke Vendor']);
      const spec4 = findValue(selectedSKU, ['Spoke Spec 4', 'Spoke Spec4', 'Spoke Spec2', 'Spoke Spec']);
      const len4 = findValue(selectedSKU, ['Length 4', 'Length4', 'Length 2', 'Length']);
      const col4 = findValue(selectedSKU, ['Color 4', 'Color4', 'Color2', 'Color']);
      dsSpec = `${vendor4 !== 'N/A' ? vendor4 : ''} ${spec4 !== 'N/A' ? spec4 : ''} ${col4 !== 'N/A' ? col4 : ''} | L: ${len4 !== 'N/A' ? len4 + 'mm' : 'TBD'}`.trim();
    } else {
      ndsSku = findValue(selectedSKU, ['Spoke NDS F SKU', 'Spoke NDS SKU']);
      if (ndsSku === 'N/A' || ndsSku === '') ndsSku = findValue(selectedSKU, ['Spoke NDS F SKU']);
      const q1 = findValue(selectedSKU, ['Quantity', 'Quantity 1', 'Quantity1']);
      ndsQtyNum = q1 !== 'N/A' && q1 !== '' ? parseInt(q1, 10) : 16;
      ndsQty = `${ndsQtyNum} PCS`;
      const vendor1 = findValue(selectedSKU, ['Spoke Vendor']);
      const spec1 = findValue(selectedSKU, ['Spoke Spec', 'Spoke Spec1', 'Spoke Type']);
      const len1 = findValue(selectedSKU, ['Length', 'Length 1', 'Length1']);
      const col1 = findValue(selectedSKU, ['Color', 'Color1']);
      ndsSpec = `${vendor1 !== 'N/A' ? vendor1 : ''} ${spec1 !== 'N/A' ? spec1 : ''} ${col1 !== 'N/A' ? col1 : ''} | L: ${len1 !== 'N/A' ? len1 + 'mm' : 'TBD'}`.trim();

      dsSku = findValue(selectedSKU, ['Spoke DS F SKU', 'Spoke DS SKU']);
      if (dsSku === 'N/A' || dsSku === '') dsSku = findValue(selectedSKU, ['Spoke DS F SKU']);
      const q2 = findValue(selectedSKU, ['Quantity 2', 'Quantity2']);
      dsQtyNum = q2 !== 'N/A' && q2 !== '' ? parseInt(q2, 10) : 16;
      dsQty = `${dsQtyNum} PCS`;
      const vendor2 = findValue(selectedSKU, ['Spoke Vendor2', 'Spoke Vendor']);
      const spec2 = findValue(selectedSKU, ['Spoke Spec2', 'Spoke Spec']);
      const len2 = findValue(selectedSKU, ['Length 2', 'Length2']);
      const col2 = findValue(selectedSKU, ['Color2', 'Color']);
      dsSpec = `${vendor2 !== 'N/A' ? vendor2 : ''} ${spec2 !== 'N/A' ? spec2 : ''} ${col2 !== 'N/A' ? col2 : ''} | L: ${len2 !== 'N/A' ? len2 + 'mm' : 'TBD'}`.trim();
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

  return (
    <div className={`min-h-screen font-mono overflow-x-hidden transition-colors duration-300 custom-scrollbar ${theme.bg} ${theme.text}`}>
      
      <style>{`
        /* 全局滾動條與特定容器滾動條一併自訂，確保黑色主題美觀 */
        ::-webkit-scrollbar, .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track, .custom-scrollbar::-webkit-scrollbar-track { background: ${theme.scrollbarTrack}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb, .custom-scrollbar::-webkit-scrollbar-thumb { background: ${theme.scrollbarThumb}; border: 2px solid ${theme.scrollbarTrack}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover, .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${theme.scrollbarThumbHover}; }
      `}</style>

      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${theme.header}`}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded border border-cyan-500/40 flex items-center justify-center bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse">
              <Activity className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h1 className={`text-base md:text-xl font-bold tracking-[0.2em] ${theme.logoTitle}`}>WHEEL_SYS<span className="text-cyan-500">.BOM_EXPLORER</span></h1>
              <span className="text-xs text-cyan-600 block tracking-wider font-bold">FRONT-VIEW GEOMETRY CALLOUTS</span>
            </div>
          </div>

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

          <div className="flex items-center gap-4">
            <div className="text-right text-xs hidden sm:block font-bold">
              <div className={theme.statText}>DB_SOURCE: <span className="text-cyan-500">GOOGLE_SHEETS_LIVE</span></div>
              <div className={theme.statText}>TOTAL_LOADED: <span className={theme.statVal}>{data.length} SKUs</span></div>
            </div>
            {/* 切換 日間/夜間模式 Toggle Button */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`p-2.5 rounded border transition-all ${isDarkMode ? 'bg-[#0f121d] border-gray-800 text-yellow-500 hover:border-yellow-500/50' : 'bg-slate-100 border-slate-300 text-indigo-500 hover:border-indigo-400'}`}
              title="Toggle Day/Night Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 mb-6">
            <div className={`absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin ${isDarkMode ? 'border-cyan-950' : 'border-cyan-100'}`}></div>
            <div className={`absolute inset-2 rounded-full border border-dashed animate-ping ${isDarkMode ? 'border-cyan-800/40' : 'border-cyan-300/40'}`}></div>
            <div className="absolute inset-0 flex items-center justify-center text-cyan-500 text-xs font-bold">LOADING</div>
          </div>
          <p className={`text-sm tracking-[0.2em] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>SYNCING ALL WORKBOOK SHEETS (ALLOY & CARBON)...</p>
          <div className={`w-56 h-1.5 rounded overflow-hidden mt-4 ${isDarkMode ? 'bg-cyan-950' : 'bg-cyan-100'}`}>
            <div className="h-full bg-cyan-500 animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Panel: Search & List */}
          <div className={`lg:col-span-1 border rounded-lg p-5 flex flex-col h-fit transition-colors duration-300 ${theme.panel}`}>
            <div className="mb-4">
              <span className="text-xs text-cyan-500/80 block mb-2 font-bold tracking-wider">SEARCH_CONSOLE // FUZZY SEARCH</span>
              <div className="relative">
                <input
                  type="text"
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                  placeholder="Enter SKU / Description..."
                  className={`w-full rounded text-sm py-3 pl-10 pr-4 outline-none transition-colors font-mono ${theme.inputWrap}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="w-4 h-4 text-cyan-600 absolute left-3 top-3.5" />
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
                        <span className={`font-extrabold text-sm ${isSelected ? 'text-cyan-500' : theme.itemSKU}`}>{itemSKU}</span>
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
                <h2 className={`text-xl font-bold tracking-widest uppercase mb-3 ${isDarkMode ? 'text-cyan-600/70' : 'text-cyan-600'}`}>AWAITING_INPUT // SYSTEM STANDBY</h2>
                <p className={`text-sm max-w-lg leading-relaxed font-sans ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  Please select a wheel assembly from the left sidebar or enter a part number above for a fuzzy search.
                  The system will instantly analyze 726 Alloy & Carbon part numbers, rendering the front-view geometric structure and a one-page BOM table.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500 flex flex-col">
                
                {/* SKU Ref Header - 確保使用與 BOM 標題相同的漸層與霓虹側邊飾條 */}
                <div className={`relative overflow-hidden rounded-lg p-6 flex flex-col sm:flex-row justify-between sm:items-center transition-colors duration-300 ${theme.skuCard}`}>
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${theme.accentBar}`}></div>
                  <div className="pl-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-cyan-500 tracking-wider font-bold">SKU REFERENCE RECORD</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${isDarkMode ? 'bg-cyan-950 text-cyan-400 border-cyan-900' : 'bg-cyan-100 text-cyan-700 border-cyan-300'}`}>ACTIVE</span>
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
                      <span className="font-bold text-cyan-500 uppercase tracking-wider">{findValue(selectedSKU, ['Front / Rear', 'Front/Rear', 'F/R', 'Position'])}</span>
                    </div>
                    <div className={`p-3 rounded text-center min-w-[100px] border backdrop-blur-sm ${theme.infoBox}`}>
                      <span className={`text-xs block mb-0.5 font-bold ${theme.infoLabel}`}>MODEL</span>
                      <span className="font-bold">{findValue(selectedSKU, ['Model', 'Series'])}</span>
                    </div>
                  </div>
                </div>

                {/* SVG Blueprint Viewer */}
                <div className={`rounded-lg p-5 relative overflow-hidden flex flex-col border transition-colors duration-300 ${theme.svgPanel}`} style={{ backgroundImage: theme.svgGrid, backgroundSize: '15px 15px' }}>
                  <div className={`absolute top-3 left-4 text-xs flex items-center gap-1.5 tracking-[0.15em] z-10 font-bold ${isDarkMode ? 'text-cyan-600' : 'text-cyan-700'}`}>
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
                      <div className={`p-2 rounded border animate-pulse ${isDarkMode ? 'bg-cyan-950/40 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : 'bg-cyan-100 border-cyan-300 shadow-sm'}`}>
                        <Box className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`} />
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
                              <td className={`py-4 px-6 font-extrabold text-base border-r ${theme.tdBorder} ${isPartHovered ? 'text-cyan-500' : theme.tdId}`}>{row.id}</td>
                              <td className={`py-4 px-6 font-semibold border-r ${theme.tdBorder} ${theme.tdComponent}`}>{row.component}</td>
                              <td className={`py-4 px-6 border-r ${theme.tdBorder}`}>
                                <span className={`px-3 py-1.5 rounded border font-extrabold text-xs tracking-widest transition-all inline-block ${isPartHovered ? theme.skuBadgeHover : theme.skuBadge}`}>
                                  {row.sku && row.sku !== 'N/A' ? row.sku : 'NOT_FOUND'}
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
  );
}