/**
 * Utility functions for exporting multi-tab Excel workbooks (.xlsx)
 * with dedicated tabs for VENUE 1, VENUE 2, VENUE 3, VENUE 4, VENUE 5,
 * with styled header banner:
 *   TRIBE FORMATION
 *   VENUE X: [HALL NAME]
 *   CLASSES: [DEPARTMENTS / SECTIONS]
 *
 * Each team member is listed on their own individual row under TEAM MEMBERS.
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
  {
    groupName: "Group I",
    sheetName: "VENUE 1",
    theme: "Creative & Design",
    venueBanner: "VENUE 1: KRS SEMINAR HALL",
    classesBanner: "CLASSES: AI & DS – A   CSE – A   Civil",
  },
  {
    groupName: "Group II",
    sheetName: "VENUE 2",
    theme: "Technology & Innovation",
    venueBanner: "VENUE 2: ECE SEMINAR HALL",
    classesBanner: "CLASSES: CYBER SECURITY   AI&DS B   IT A",
  },
  {
    groupName: "Group III",
    sheetName: "VENUE 3",
    theme: "Space & Cosmic",
    venueBanner: "VENUE 3: CIVIL SEMINAR HALL",
    classesBanner: "CLASSES: AI & ML   IT – C   EEE",
  },
  {
    groupName: "Group IV",
    sheetName: "VENUE 4",
    theme: "Legends & Mythology",
    venueBanner: "VENUE 4: MCW SEMINAR HALL",
    classesBanner: "CLASSES: ECE – A   CSE – B   MECH",
  },
  {
    groupName: "Group V",
    sheetName: "VENUE 5",
    theme: "Power & Energy",
    venueBanner: "VENUE 5: MS AUDITORIUM",
    classesBanner: "CLASSES: ECE – B   CSE – C   IT – B",
  },
];

/**
 * Builds rows and merges for a specific venue group
 */
function buildGroupSheet(
  gConfig: (typeof GROUPS_CONFIG)[0],
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

  const totalCols = headers.length;

  // Title Banner Rows
  const titleRow1 = new Array(totalCols).fill("");
  titleRow1[0] = "TRIBE FORMATION";

  const titleRow2 = new Array(totalCols).fill("");
  titleRow2[0] = gConfig.venueBanner;

  const titleRow3 = new Array(totalCols).fill("");
  titleRow3[0] = gConfig.classesBanner;

  const spacerRow = new Array(totalCols).fill("");

  const allRows: (string | number)[][] = [
    titleRow1,
    titleRow2,
    titleRow3,
    spacerRow,
    headers,
  ];

  tribes.forEach((t) => {
    const leadName = t.leader?.name || (t.members[0] ? t.members[0].name : "N/A");
    const scoreCells = events.map((e) => {
      if (isBlankTemplate) return "";
      const match = t.eventScores.find((es) => es.eventId === e.id);
      return match && match.score !== null ? match.score : 0;
    });
    const totalVal = isBlankTemplate ? "" : t.totalScore;

    if (t.members.length === 0) {
      allRows.push([
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
      const firstMember = t.members[0];
      allRows.push([
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

      for (let i = 1; i < t.members.length; i++) {
        const m = t.members[i];
        allRows.push([
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

  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Set merged headers across the top 3 banner rows
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
  ];

  ws["!cols"] = [
    { wch: 14 }, // Tribe Code
    { wch: 26 }, // Team Name
    { wch: 12 }, // Group
    { wch: 24 }, // Team Lead
    { wch: 28 }, // Team Members
    { wch: 20 }, // Department
    { wch: 16 }, // Class Section
    ...events.map(() => ({ wch: 24 })), // Events
    { wch: 16 }, // Total Score
  ];

  return ws;
}

/**
 * 1. Comprehensive Multi-Sheet Excel Workbook (.xlsx)
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

  const title1 = new Array(overallHeaders.length).fill("");
  title1[0] = "MSEC SIP ARENA — OVERALL SCOREBOARD & LEADERBOARD";

  const title2 = new Array(overallHeaders.length).fill("");
  title2[0] = "5 Groups · 5 Live Venue Halls · 90 Tribes";

  const spacer = new Array(overallHeaders.length).fill("");

  const overallRows: (string | number)[][] = [
    title1,
    title2,
    spacer,
    overallHeaders,
  ];

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

  const wsOverall = XLSX.utils.aoa_to_sheet(overallRows);
  wsOverall["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: overallHeaders.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: overallHeaders.length - 1 } },
  ];
  wsOverall["!cols"] = [
    { wch: 10 },
    { wch: 14 },
    { wch: 26 },
    { wch: 12 },
    { wch: 22 },
    { wch: 24 },
    { wch: 28 },
    { wch: 20 },
    { wch: 16 },
    ...data.events.map(() => ({ wch: 24 })),
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsOverall, "OVERALL STANDINGS");

  // 2. Individual Venue Sheets (VENUE 1 to VENUE 5)
  GROUPS_CONFIG.forEach((g) => {
    const groupTribes = data.tribes.filter((t) => t.groupName.toLowerCase() === g.groupName.toLowerCase());
    const ws = buildGroupSheet(g, groupTribes, data.events, false);
    XLSX.utils.book_append_sheet(wb, ws, g.sheetName);
  });

  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `MSEC_SIP_Arena_Scores_${dateStr}.xlsx`);
}

/**
 * 2. Blank Multi-Sheet Offline Score Entry Template (.xlsx)
 */
export function downloadOfflineScoreTemplate(data: MasterExportData, filterGroup?: string) {
  const wb = XLSX.utils.book_new();

  if (filterGroup && filterGroup !== "all") {
    const gConfig = GROUPS_CONFIG.find((g) => g.groupName.toLowerCase() === filterGroup.toLowerCase()) || {
      groupName: filterGroup,
      sheetName: filterGroup,
      theme: "Theme",
      venueBanner: `VENUE: ${filterGroup}`,
      classesBanner: "CLASSES: ALL",
    };
    const groupTribes = data.tribes.filter((t) => t.groupName.toLowerCase() === filterGroup.toLowerCase());
    const ws = buildGroupSheet(gConfig, groupTribes, data.events, true);
    XLSX.utils.book_append_sheet(wb, ws, gConfig.sheetName);
    const tag = filterGroup.replace(/\s+/g, "_");
    XLSX.writeFile(wb, `SIP_Offline_Score_Template_${tag}.xlsx`);
  } else {
    GROUPS_CONFIG.forEach((g) => {
      const groupTribes = data.tribes.filter((t) => t.groupName.toLowerCase() === g.groupName.toLowerCase());
      const ws = buildGroupSheet(g, groupTribes, data.events, true);
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

    const title1 = new Array(headers.length).fill("");
    title1[0] = "TRIBE FORMATION — STUDENT MEMBER ROSTER";

    const title2 = new Array(headers.length).fill("");
    title2[0] = g.venueBanner;

    const title3 = new Array(headers.length).fill("");
    title3[0] = g.classesBanner;

    const spacer = new Array(headers.length).fill("");

    const rows: (string | number)[][] = [
      title1,
      title2,
      title3,
      spacer,
      headers,
    ];

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

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
    ];
    ws["!cols"] = [
      { wch: 14 },
      { wch: 26 },
      { wch: 12 },
      { wch: 28 },
      { wch: 22 },
      { wch: 16 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, g.sheetName);
  });

  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `MSEC_SIP_Tribes_Members_MultiVenue_${dateStr}.xlsx`);
}
