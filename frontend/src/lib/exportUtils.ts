/**
 * Utility functions for exporting multi-tab Excel workbooks (.xlsx)
 * with dedicated tabs for VENUE 1, VENUE 2, VENUE 3, VENUE 4, VENUE 5,
 * containing:
 * - Tribe Code
 * - Team Name
 * - Group
 * - Team Lead
 * - Team Members
 * - List of Event Names (e.g. Tear Down Lab, Poster Presentation, Problem Hunt)
 * - Total Score (Summation of all events)
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
 * Builds rows for a specific group of tribes
 */
function buildGroupSheetData(
  tribes: MasterExportData["tribes"],
  events: MasterExportData["events"],
  isBlankTemplate: boolean = false
) {
  // Headers: Tribe Code | Team Name | Group | Team Lead | Team Members | [Events...] | Total Score
  const eventHeaders = events.map((e) => `${e.eventName} (Max ${e.maximumScore})`);
  const headers = [
    "Tribe Code",
    "Team Name",
    "Group",
    "Team Lead",
    "Team Members",
    ...eventHeaders,
    "Total Score",
  ];

  const dataRows = tribes.map((t, rowIdx) => {
    // Lead name
    const leadName = t.leader?.name || (t.members[0] ? t.members[0].name : "N/A");

    // All members comma-separated
    const membersList = t.members
      .map((m) => `${m.name}${m.department ? ` (${m.department}${m.classSection ? ` - ${m.classSection}` : ""})` : ""}`)
      .join(", ");

    // Scores
    const scoreCells = events.map((e) => {
      if (isBlankTemplate) return "";
      const match = t.eventScores.find((es) => es.eventId === e.id);
      return match && match.score !== null ? match.score : 0;
    });

    const totalVal = isBlankTemplate ? "" : t.totalScore;

    return [
      t.tribeCode,
      t.tribeName,
      t.groupName,
      leadName,
      membersList || "None listed",
      ...scoreCells,
      totalVal,
    ];
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
    ...data.events.map((e) => `${e.eventName} (Max ${e.maximumScore})`),
    "Total Score",
  ];

  const overallSorted = [...data.tribes].sort((a, b) => b.totalScore - a.totalScore || a.tribeCode.localeCompare(b.tribeCode));
  const overallRows = overallSorted.map((t, idx) => {
    const leadName = t.leader?.name || (t.members[0] ? t.members[0].name : "N/A");
    const membersList = t.members.map((m) => m.name).join(", ");
    const scoreCells = data.events.map((e) => {
      const match = t.eventScores.find((es) => es.eventId === e.id);
      return match && match.score !== null ? match.score : 0;
    });

    return [
      t.totalScore > 0 ? `#${idx + 1}` : "Unranked",
      t.tribeCode,
      t.tribeName,
      t.groupName,
      t.venueLocation,
      leadName,
      membersList || "None listed",
      ...scoreCells,
      t.totalScore,
    ];
  });

  const wsOverall = XLSX.utils.aoa_to_sheet([overallHeaders, ...overallRows]);
  XLSX.utils.book_append_sheet(wb, wsOverall, "OVERALL STANDINGS");

  // 2. Individual Venue Sheets (VENUE 1 to VENUE 5)
  GROUPS_CONFIG.forEach((g) => {
    const groupTribes = data.tribes.filter((t) => t.groupName.toLowerCase() === g.groupName.toLowerCase());
    const sheetData = buildGroupSheetData(groupTribes, data.events, false);
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths for readability
    ws["!cols"] = [
      { wch: 12 }, // Tribe Code
      { wch: 24 }, // Team Name
      { wch: 12 }, // Group
      { wch: 22 }, // Team Lead
      { wch: 55 }, // Team Members
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
 * Evaluators can fill scores offline for each event.
 */
export function downloadOfflineScoreTemplate(data: MasterExportData, filterGroup?: string) {
  const wb = XLSX.utils.book_new();

  if (filterGroup && filterGroup !== "all") {
    // Single Group / Venue Template
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
      { wch: 55 },
      ...data.events.map(() => ({ wch: 22 })),
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, gConfig.sheetName);
    const tag = filterGroup.replace(/\s+/g, "_");
    XLSX.writeFile(wb, `SIP_Offline_Score_Template_${tag}.xlsx`);
  } else {
    // All 5 Venues in separate sheets!
    GROUPS_CONFIG.forEach((g) => {
      const groupTribes = data.tribes.filter((t) => t.groupName.toLowerCase() === g.groupName.toLowerCase());
      const sheetData = buildGroupSheetData(groupTribes, data.events, true);
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      ws["!cols"] = [
        { wch: 12 },
        { wch: 24 },
        { wch: 12 },
        { wch: 22 },
        { wch: 55 },
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
