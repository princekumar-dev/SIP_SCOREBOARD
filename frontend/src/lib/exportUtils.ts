/**
 * Utility functions for exporting multi-tab Excel workbooks (.xlsx)
 * with dedicated tabs for VENUE 1, VENUE 2, VENUE 3, VENUE 4, VENUE 5,
 * with each team member listed on their own individual row under TEAM MEMBERS.
 */

import * as XLSX from "xlsx";

export interface MasterExportData {
  timestamp: string;
  events: { id: string; eventName: string; maximumScore: number }[];
  tribes: {
    id: string;
    tribeCode: string;
    tribeName: string;
    groupName: string;
    theme: string;
    venueLocation: string;
    venueName: string;
    leader: { name: string; department: string; classSection: string } | null;
    memberCount: number;
    members: { name: string; department: string; classSection: string; isLeader: boolean }[];
    eventScores: { eventId: string; eventName: string; maximumScore: number; score: number | null; remarks: string }[];
    totalScore: number;
    rank: number | null;
  }[];
}

const GROUPS_CONFIG = [
  { groupName: "Group I", sheetName: "VENUE 1", theme: "Creative & Design", defaultLocation: "KRS Seminar Hall" },
  { groupName: "Group II", sheetName: "VENUE 2", theme: "Technology & Innovation", defaultLocation: "ECE Seminar Hall" },
  { groupName: "Group III", sheetName: "VENUE 3", theme: "Space & Cosmic", defaultLocation: "Civil Seminar Hall" },
  { groupName: "Group IV", sheetName: "VENUE 4", theme: "Legends & Mythology", defaultLocation: "MCW Seminar Hall" },
  { groupName: "Group V", sheetName: "VENUE 5", theme: "Power & Energy", defaultLocation: "MS Auditorium" },
];

/**
 * Builds rows for a specific venue group where each member is listed on an individual row
 */
function buildGroupSheetData(
  tribes: MasterExportData["tribes"],
  events: MasterExportData["events"],
  isBlankTemplate: boolean = false
) {
  const eventHeaders = events.map((e) => `${e.eventName} (Max ${e.maximumScore})`);
  const headers = [
    "Tribe Code",
    "Team Name",
    "Group",
    "Team Lead",
    "Team Members",
    "Department",
    "Class Section",
    ...eventHeaders,
    "Total Score",
  ];

  const dataRows: (string | number)[][] = [];

  tribes.forEach((t) => {
    const leadName = t.leader?.name || (t.members[0] ? t.members[0].name : "N/A");
    const scoreCells = events.map((e) => {
      if (isBlankTemplate) return "";
      const match = t.eventScores.find((es) => es.eventId === e.id);
      return match && match.score !== null ? match.score : 0;
    });
    const totalVal = isBlankTemplate ? "" : t.totalScore;

    if (t.members.length === 0) {
      // Tribe without members
      dataRows.push([
        t.tribeCode,
        t.tribeName,
        t.groupName,
        leadName,
        "No members listed",
        "",
        "",
        ...scoreCells,
        totalVal,
      ]);
    } else {
      // First member row contains Tribe Code, Team Name, Group, Team Lead, and Scores
      const firstMember = t.members[0];
      dataRows.push([
        t.tribeCode,
        t.tribeName,
        t.groupName,
        leadName,
        firstMember.name,
        firstMember.department || "",
        firstMember.classSection || "",
        ...scoreCells,
        totalVal,
      ]);

      // Subsequent members are listed one by one on their own row
      for (let i = 1; i < t.members.length; i++) {
        const m = t.members[i];
        dataRows.push([
          "",
          "",
          "",
          "",
          m.name,
          m.department || "",
          m.classSection || "",
          ...events.map(() => ""),
          "",
        ]);
      }
    }
  });

  return [headers, ...dataRows];
}

/**
 * 1. Comprehensive Multi-Sheet Excel Workbook (.xlsx)
 * Contains individual tabs: VENUE 1, VENUE 2, VENUE 3, VENUE 4, VENUE 5, plus OVERALL STANDINGS
 */
export function downloadMasterArenaExcel(data: MasterExportData) {
  const wb = XLSX.utils.book_new();

  // 1. Overall Leaderboard Sheet
  const overallHeaders = [
    "Rank",
    "Tribe Code",
    "Team Name",
    "Group",
    "Venue Hall",
    "Team Lead",
    "Team Members",
    "Department",
    "Class Section",
    ...data.events.map((e) => `${e.eventName} (Max ${e.maximumScore})`),
    "Total Score",
  ];

  const overallSorted = [...data.tribes].sort(
    (a, b) => b.totalScore - a.totalScore || a.tribeCode.localeCompare(b.tribeCode)
  );

  const overallRows: (string | number)[][] = [];
  overallSorted.forEach((t, idx) => {
    const leadName = t.leader?.name || (t.members[0] ? t.members[0].name : "N/A");
    const scoreCells = data.events.map((e) => {
      const match = t.eventScores.find((es) => es.eventId === e.id);
      return match && match.score !== null ? match.score : 0;
    });
    const rankLabel = t.totalScore > 0 ? `#${idx + 1}` : "Unranked";

    if (t.members.length === 0) {
      overallRows.push([
        rankLabel,
        t.tribeCode,
        t.tribeName,
        t.groupName,
        t.venueLocation,
        leadName,
        "No members listed",
        "",
        "",
        ...scoreCells,
        t.totalScore,
      ]);
    } else {
      const firstM = t.members[0];
      overallRows.push([
        rankLabel,
        t.tribeCode,
        t.tribeName,
        t.groupName,
        t.venueLocation,
        leadName,
        firstM.name,
        firstM.department || "",
        firstM.classSection || "",
        ...scoreCells,
        t.totalScore,
      ]);

      for (let i = 1; i < t.members.length; i++) {
        const m = t.members[i];
        overallRows.push([
          "",
          "",
          "",
          "",
          "",
          "",
          m.name,
          m.department || "",
          m.classSection || "",
          ...data.events.map(() => ""),
          "",
        ]);
      }
    }
  });

  const wsOverall = XLSX.utils.aoa_to_sheet([overallHeaders, ...overallRows]);
  wsOverall["!cols"] = [
    { wch: 10 }, // Rank
    { wch: 12 }, // Tribe Code
    { wch: 24 }, // Team Name
    { wch: 12 }, // Group
    { wch: 22 }, // Venue
    { wch: 22 }, // Team Lead
    { wch: 26 }, // Team Member
    { wch: 18 }, // Dept
    { wch: 14 }, // Sec
    ...data.events.map(() => ({ wch: 22 })),
    { wch: 14 }, // Total
  ];
  XLSX.utils.book_append_sheet(wb, wsOverall, "OVERALL STANDINGS");

  // 2. Individual Venue Sheets (VENUE 1 to VENUE 5)
  GROUPS_CONFIG.forEach((g) => {
    const groupTribes = data.tribes.filter((t) => t.groupName.toLowerCase() === g.groupName.toLowerCase());
    const sheetData = buildGroupSheetData(groupTribes, data.events, false);
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    ws["!cols"] = [
      { wch: 12 }, // Tribe Code
      { wch: 24 }, // Team Name
      { wch: 12 }, // Group
      { wch: 22 }, // Team Lead
      { wch: 26 }, // Team Member
      { wch: 18 }, // Dept
      { wch: 14 }, // Sec
      ...data.events.map(() => ({ wch: 22 })), // Events
      { wch: 14 }, // Total Score
    ];

    XLSX.utils.book_append_sheet(wb, ws, g.sheetName);
  });

  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `MSEC_SIP_Arena_MultiVenue_Scores_${dateStr}.xlsx`);
}

/**
 * 2. Blank Multi-Sheet Offline Score Entry Template (.xlsx)
 * Contains individual tabs: VENUE 1, VENUE 2, VENUE 3, VENUE 4, VENUE 5
 */
export function downloadOfflineScoreTemplate(data: MasterExportData, filterGroup?: string) {
  const wb = XLSX.utils.book_new();

  if (filterGroup && filterGroup !== "all") {
    const gConfig = GROUPS_CONFIG.find((g) => g.groupName.toLowerCase() === filterGroup.toLowerCase()) || {
      groupName: filterGroup,
      sheetName: filterGroup,
    };
    const groupTribes = data.tribes.filter((t) => t.groupName.toLowerCase() === filterGroup.toLowerCase());
    const sheetData = buildGroupSheetData(groupTribes, data.events, true);
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [
      { wch: 12 },
      { wch: 24 },
      { wch: 12 },
      { wch: 22 },
      { wch: 26 },
      { wch: 18 },
      { wch: 14 },
      ...data.events.map(() => ({ wch: 22 })),
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, gConfig.sheetName);
    const tag = filterGroup.replace(/\s+/g, "_");
    XLSX.writeFile(wb, `SIP_Offline_Score_Template_${tag}.xlsx`);
  } else {
    GROUPS_CONFIG.forEach((g) => {
      const groupTribes = data.tribes.filter((t) => t.groupName.toLowerCase() === g.groupName.toLowerCase());
      const sheetData = buildGroupSheetData(groupTribes, data.events, true);
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      ws["!cols"] = [
        { wch: 12 },
        { wch: 24 },
        { wch: 12 },
        { wch: 22 },
        { wch: 26 },
        { wch: 18 },
        { wch: 14 },
        ...data.events.map(() => ({ wch: 22 })),
        { wch: 14 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, g.sheetName);
    });

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `SIP_Arena_Offline_Score_Template_All_Venues_${dateStr}.xlsx`);
  }
}

/**
 * 3. Tribe & Members Directory (.xlsx with Venue Tabs)
 */
export function downloadMembersDirectoryExcel(data: MasterExportData) {
  const wb = XLSX.utils.book_new();

  GROUPS_CONFIG.forEach((g) => {
    const groupTribes = data.tribes.filter((t) => t.groupName.toLowerCase() === g.groupName.toLowerCase());
    const headers = [
      "Tribe Code",
      "Team Name",
      "Group",
      "Member Name",
      "Department",
      "Class Section",
      "Role",
    ];

    const rows: (string | number)[][] = [];
    groupTribes.forEach((t) => {
      if (t.members.length === 0) {
        rows.push([t.tribeCode, t.tribeName, t.groupName, "No members listed", "", "", ""]);
      } else {
        t.members.forEach((m) => {
          rows.push([
            t.tribeCode,
            t.tribeName,
            t.groupName,
            m.name,
            m.department || "",
            m.classSection || "",
            m.isLeader ? "Team Leader" : "Team Member",
          ]);
        });
      }
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = [
      { wch: 12 },
      { wch: 24 },
      { wch: 12 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, g.sheetName);
  });

  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `MSEC_SIP_Tribes_Members_MultiVenue_${dateStr}.xlsx`);
}
