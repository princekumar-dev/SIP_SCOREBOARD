/**
 * Premium Excel Export Utility for MSEC SIP Team Events
 *
 * Generates multi-tab Excel workbooks (.xlsx) with:
 *  - "S.No" as the starting column (1, 2, 3...)
 *  - Official SIP header banners (TRIBE FORMATION, VENUE NAME, CLASSES)
 *  - Both Horizontally and Vertically Centered Alignment for merged team cells (S.No, Code, Name, Group, Lead, Scores)
 *  - Each team member listed on their own row under TEAM MEMBERS and SECTION
 *  - Calculated event totals and overall arena standings
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
    sheetName: "GROUP 1",
    theme: "Creative & Design",
    venueBanner: "GROUP 1: KRS SEMINAR HALL",
    classesBanner: "CLASSES: AI & DS – A   CSE – A   Civil",
  },
  {
    groupName: "Group II",
    sheetName: "GROUP 2",
    theme: "Technology & Innovation",
    venueBanner: "GROUP 2: ECE SEMINAR HALL",
    classesBanner: "CLASSES: CYBER SECURITY   AI&DS B   IT A",
  },
  {
    groupName: "Group III",
    sheetName: "GROUP 3",
    theme: "Space & Cosmic",
    venueBanner: "GROUP 3: CIVIL SEMINAR HALL",
    classesBanner: "CLASSES: AI & ML   IT – C   EEE",
  },
  {
    groupName: "Group IV",
    sheetName: "GROUP 4",
    theme: "Legends & Mythology",
    venueBanner: "GROUP 4: MCW SEMINAR HALL",
    classesBanner: "CLASSES: ECE – A   CSE – B   MECH",
  },
  {
    groupName: "Group V",
    sheetName: "GROUP 5",
    theme: "Power & Energy",
    venueBanner: "GROUP 5: MS AUDITORIUM",
    classesBanner: "CLASSES: ECE – B   CSE – C   IT – B",
  },
];

/**
 * Applies horizontal & vertical alignment styles to all cells in a worksheet
 */
function applySheetStyles(
  ws: XLSX.WorkSheet,
  headerRowIdx: number,
  totalCols: number,
  eventsCount: number,
  isBlankTemplate: boolean = false
) {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:Z100");

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (!cell) continue;

      if (r < headerRowIdx) {
        // Banner rows: Centered horizontally and vertically, bold
        cell.s = {
          alignment: { vertical: "center", horizontal: "center", wrapText: true },
          font: { bold: true, sz: r === 0 ? 13 : 11 },
        };
      } else if (r === headerRowIdx) {
        // Table Headers: Centered horizontally and vertically, bold
        cell.s = {
          alignment: { vertical: "center", horizontal: "center", wrapText: true },
          font: { bold: true },
        };
      } else {
        // Data rows:
        // Col 0: S.No (Center, Center)
        // Col 1: Tribe Code (Center, Center)
        // Col 2: Team Name (Center, Center)
        // Col 3: Group (Center, Center)
        // Col 4: Team Lead (Center, Center)
        // Col 5: Team Member (Center vertical, Left horizontal)
        // Col 6: Department (Center vertical, Left horizontal)
        // Col 7: Class Section (Center, Center)
        // Col 8+: Scores & Total (Center, Center)
        if (c === 5 || c === 6) {
          cell.s = {
            alignment: { vertical: "center", horizontal: "left" },
          };
        } else {
          cell.s = {
            alignment: { vertical: "center", horizontal: "center" },
          };
        }
      }
    }
  }
}

/**
 * Builds rows, column widths, and cell merges for a specific venue group sheet
 */
function buildGroupSheet(
  gConfig: (typeof GROUPS_CONFIG)[0],
  tribes: MasterExportData["tribes"],
  events: MasterExportData["events"],
  isBlankTemplate: boolean = false
) {
  const eventHeaders = events.map((e) => `${e.eventName} (Max ${e.maximumScore})`);
  const headers = [
    "S.No",
    "Tribe Code",
    "Team Name",
    "Group",
    "Team Lead",
    "Team Members",
    "Department",
    "Class Section",
    ...eventHeaders,
    "Total Score",
    ...(isBlankTemplate ? ["Judge Remarks / Feedback"] : []),
  ];

  const totalCols = headers.length;

  // Header Banner Rows matching SIP specifications
  const titleRow1 = new Array(totalCols).fill("");
  titleRow1[0] = "MSEC STUDENT INDUCTION PROGRAMME (SIP)";

  const titleRow2 = new Array(totalCols).fill("");
  titleRow2[0] = "TRIBE FORMATION & EVALUATION SCORECARD";

  const titleRow3 = new Array(totalCols).fill("");
  titleRow3[0] = `${gConfig.venueBanner}  ·  (${gConfig.theme})`;

  const titleRow4 = new Array(totalCols).fill("");
  titleRow4[0] = gConfig.classesBanner;

  const spacerRow = new Array(totalCols).fill("");

  const allRows: (string | number)[][] = [
    titleRow1,
    titleRow2,
    titleRow3,
    titleRow4,
    spacerRow,
    headers,
  ];

  const headerRowIdx = 5;

  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } },
  ];

  tribes.forEach((t, tIdx) => {
    const startRowIdx = allRows.length;
    const memberCount = t.members.length > 0 ? t.members.length : 1;
    const endRowIdx = startRowIdx + memberCount - 1;

    const sno = tIdx + 1;
    const leadName = t.leader?.name || (t.members[0] ? t.members[0].name : "N/A");
    const scoreCells = events.map((e) => {
      if (isBlankTemplate) return "";
      const match = t.eventScores.find((es) => es.eventId === e.id);
      return match && match.score !== null ? match.score : 0;
    });
    const totalVal = isBlankTemplate ? "" : t.totalScore;
    const extraBlank = isBlankTemplate ? [""] : [];

    if (t.members.length === 0) {
      allRows.push([
        sno,
        t.tribeCode,
        t.tribeName,
        t.groupName,
        leadName,
        "No members listed",
        "",
        "",
        ...scoreCells,
        totalVal,
        ...extraBlank,
      ]);
    } else {
      const firstMember = t.members[0];
      allRows.push([
        sno,
        t.tribeCode,
        t.tribeName,
        t.groupName,
        leadName,
        firstMember.name,
        firstMember.department || "",
        firstMember.classSection || "",
        ...scoreCells,
        totalVal,
        ...extraBlank,
      ]);

      for (let i = 1; i < t.members.length; i++) {
        const m = t.members[i];
        allRows.push([
          "",
          "",
          "",
          "",
          "",
          m.name,
          m.department || "",
          m.classSection || "",
          ...events.map(() => ""),
          "",
          ...extraBlank,
        ]);
      }

      // Vertical cell merges across the team's member block
      if (memberCount > 1) {
        merges.push({ s: { r: startRowIdx, c: 0 }, e: { r: endRowIdx, c: 0 } }); // S.No
        merges.push({ s: { r: startRowIdx, c: 1 }, e: { r: endRowIdx, c: 1 } }); // Tribe Code
        merges.push({ s: { r: startRowIdx, c: 2 }, e: { r: endRowIdx, c: 2 } }); // Team Name
        merges.push({ s: { r: startRowIdx, c: 3 }, e: { r: endRowIdx, c: 3 } }); // Group
        merges.push({ s: { r: startRowIdx, c: 4 }, e: { r: endRowIdx, c: 4 } }); // Team Lead

        events.forEach((_, evIdx) => {
          merges.push({ s: { r: startRowIdx, c: 8 + evIdx }, e: { r: endRowIdx, c: 8 + evIdx } });
        });
        merges.push({ s: { r: startRowIdx, c: 8 + events.length }, e: { r: endRowIdx, c: 8 + events.length } }); // Total Score

        if (isBlankTemplate) {
          merges.push({ s: { r: startRowIdx, c: 9 + events.length }, e: { r: endRowIdx, c: 9 + events.length } }); // Remarks
        }
      }
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws["!merges"] = merges;

  ws["!cols"] = [
    { wch: 8 },  // S.No
    { wch: 14 }, // Tribe Code
    { wch: 26 }, // Team Name
    { wch: 12 }, // Group
    { wch: 24 }, // Team Lead
    { wch: 28 }, // Team Members
    { wch: 20 }, // Department
    { wch: 16 }, // Class Section
    ...events.map(() => ({ wch: 24 })), // Events
    { wch: 16 }, // Total Score
    ...(isBlankTemplate ? [{ wch: 30 }] : []),
  ];

  applySheetStyles(ws, headerRowIdx, totalCols, events.length, isBlankTemplate);

  return ws;
}

/**
 * 1. Comprehensive Master Multi-Sheet Excel Workbook (.xlsx)
 */
export function downloadMasterArenaExcel(data: MasterExportData) {
  const wb = XLSX.utils.book_new();

  // 1. Overall Leaderboard Sheet
  const overallHeaders = [
    "S.No",
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
  title1[0] = "MSEC STUDENT INDUCTION PROGRAMME (SIP)";

  const title2 = new Array(overallHeaders.length).fill("");
  title2[0] = "OVERALL ARENA LEADERBOARD & STANDINGS";

  const title3 = new Array(overallHeaders.length).fill("");
  title3[0] = "5 Groups · 5 Live Venue Halls · 90 Tribes";

  const spacer = new Array(overallHeaders.length).fill("");

  const overallRows: (string | number)[][] = [
    title1,
    title2,
    title3,
    spacer,
    overallHeaders,
  ];

  const overallMerges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: overallHeaders.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: overallHeaders.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: overallHeaders.length - 1 } },
  ];

  overallSorted.forEach((t, idx) => {
    const startRowIdx = overallRows.length;
    const memberCount = t.members.length > 0 ? t.members.length : 1;
    const endRowIdx = startRowIdx + memberCount - 1;

    const sno = idx + 1;
    const leadName = t.leader?.name || (t.members[0] ? t.members[0].name : "N/A");
    const scoreCells = data.events.map((e) => {
      const match = t.eventScores.find((es) => es.eventId === e.id);
      return match && match.score !== null ? match.score : 0;
    });
    const rankLabel = t.totalScore > 0 ? `#${idx + 1}` : "Unranked";

    if (t.members.length === 0) {
      overallRows.push([
        sno,
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
        sno,
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
          "",
          m.name,
          m.department || "",
          m.classSection || "",
          ...data.events.map(() => ""),
          "",
        ]);
      }

      if (memberCount > 1) {
        overallMerges.push({ s: { r: startRowIdx, c: 0 }, e: { r: endRowIdx, c: 0 } }); // S.No
        overallMerges.push({ s: { r: startRowIdx, c: 1 }, e: { r: endRowIdx, c: 1 } }); // Rank
        overallMerges.push({ s: { r: startRowIdx, c: 2 }, e: { r: endRowIdx, c: 2 } }); // Code
        overallMerges.push({ s: { r: startRowIdx, c: 3 }, e: { r: endRowIdx, c: 3 } }); // Team Name
        overallMerges.push({ s: { r: startRowIdx, c: 4 }, e: { r: endRowIdx, c: 4 } }); // Group
        overallMerges.push({ s: { r: startRowIdx, c: 5 }, e: { r: endRowIdx, c: 5 } }); // Venue
        overallMerges.push({ s: { r: startRowIdx, c: 6 }, e: { r: endRowIdx, c: 6 } }); // Lead
        data.events.forEach((_, evIdx) => {
          overallMerges.push({ s: { r: startRowIdx, c: 10 + evIdx }, e: { r: endRowIdx, c: 10 + evIdx } });
        });
        overallMerges.push({ s: { r: startRowIdx, c: 10 + data.events.length }, e: { r: endRowIdx, c: 10 + data.events.length } }); // Total
      }
    }
  });

  const wsOverall = XLSX.utils.aoa_to_sheet(overallRows);
  wsOverall["!merges"] = overallMerges;
  wsOverall["!cols"] = [
    { wch: 8 },  // S.No
    { wch: 10 }, // Rank
    { wch: 14 }, // Code
    { wch: 26 }, // Team Name
    { wch: 12 }, // Group
    { wch: 22 }, // Venue
    { wch: 24 }, // Lead
    { wch: 28 }, // Member
    { wch: 20 }, // Dept
    { wch: 16 }, // Sec
    ...data.events.map(() => ({ wch: 24 })),
    { wch: 16 },
  ];

  applySheetStyles(wsOverall, 4, overallHeaders.length, data.events.length, false);
  XLSX.utils.book_append_sheet(wb, wsOverall, "OVERALL STANDINGS");

  // 2. Individual Venue Sheets (VENUE 1 to VENUE 5)
  GROUPS_CONFIG.forEach((g) => {
    const groupTribes = data.tribes.filter((t) => t.groupName.toLowerCase() === g.groupName.toLowerCase());
    const ws = buildGroupSheet(g, groupTribes, data.events, false);
    XLSX.utils.book_append_sheet(wb, ws, g.sheetName);
  });

  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `MSEC_SIP_Arena_Scorecard_${dateStr}.xlsx`);
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
      "S.No",
      "Tribe Code",
      "Team Name",
      "Group",
      "Team Lead",
      "Member Name",
      "Department",
      "Class Section",
      "Role",
    ];

    const title1 = new Array(headers.length).fill("");
    title1[0] = "MSEC STUDENT INDUCTION PROGRAMME (SIP)";

    const title2 = new Array(headers.length).fill("");
    title2[0] = "TRIBE FORMATION — STUDENT MEMBER ROSTER";

    const title3 = new Array(headers.length).fill("");
    title3[0] = g.venueBanner;

    const title4 = new Array(headers.length).fill("");
    title4[0] = g.classesBanner;

    const spacer = new Array(headers.length).fill("");

    const rows: (string | number)[][] = [
      title1,
      title2,
      title3,
      title4,
      spacer,
      headers,
    ];

    const dirMerges: XLSX.Range[] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } },
    ];

    groupTribes.forEach((t, tIdx) => {
      const startRowIdx = rows.length;
      const sno = tIdx + 1;
      const leadName = t.leader?.name || (t.members[0] ? t.members[0].name : "N/A");
      const memberCount = t.members.length > 0 ? t.members.length : 1;
      const endRowIdx = startRowIdx + memberCount - 1;

      if (t.members.length === 0) {
        rows.push([sno, t.tribeCode, t.tribeName, t.groupName, leadName, "No members listed", "", "", ""]);
      } else {
        const firstM = t.members[0];
        rows.push([
          sno,
          t.tribeCode,
          t.tribeName,
          t.groupName,
          leadName,
          firstM.name,
          firstM.department || "",
          firstM.classSection || "",
          firstM.isLeader ? "Team Leader" : "Team Member",
        ]);

        for (let i = 1; i < t.members.length; i++) {
          const m = t.members[i];
          rows.push([
            "",
            "",
            "",
            "",
            "",
            m.name,
            m.department || "",
            m.classSection || "",
            m.isLeader ? "Team Leader" : "Team Member",
          ]);
        }

        if (memberCount > 1) {
          dirMerges.push({ s: { r: startRowIdx, c: 0 }, e: { r: endRowIdx, c: 0 } });
          dirMerges.push({ s: { r: startRowIdx, c: 1 }, e: { r: endRowIdx, c: 1 } });
          dirMerges.push({ s: { r: startRowIdx, c: 2 }, e: { r: endRowIdx, c: 2 } });
          dirMerges.push({ s: { r: startRowIdx, c: 3 }, e: { r: endRowIdx, c: 3 } });
          dirMerges.push({ s: { r: startRowIdx, c: 4 }, e: { r: endRowIdx, c: 4 } });
        }
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!merges"] = dirMerges;
    ws["!cols"] = [
      { wch: 8 },  // S.No
      { wch: 14 }, // Code
      { wch: 26 }, // Team Name
      { wch: 12 }, // Group
      { wch: 24 }, // Team Lead
      { wch: 28 }, // Member Name
      { wch: 22 }, // Dept
      { wch: 16 }, // Sec
      { wch: 16 }, // Role
    ];

    applySheetStyles(ws, 5, headers.length, 0, false);
    XLSX.utils.book_append_sheet(wb, ws, g.sheetName);
  });

  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `MSEC_SIP_Tribes_Members_MultiVenue_${dateStr}.xlsx`);
}
