/**
 * Utility functions for exporting arena data, blank score evaluation templates,
 * member rosters, and leaderboard matrices to Excel/CSV with UTF-8 BOM.
 */

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

function triggerDownload(content: string, filename: string, mimeType = "text/csv;charset=utf-8;") {
  // \uFEFF is UTF-8 Byte Order Mark (BOM) ensuring Microsoft Excel reads characters and commas properly
  const blob = new Blob(["\uFEFF" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * 1. Comprehensive Master Arena Report (Excel/CSV)
 * Includes: Rank, Tribe Code, Tribe Name, Group, Theme, Venue Hall, Team Lead, Team Members List, Event 1, Event 2, Event 3, Total Score
 */
export function downloadMasterArenaExcel(data: MasterExportData) {
  const eventHeaders = data.events.map((e) => `${e.eventName} (Max ${e.maximumScore})`);

  const headers = [
    "Rank",
    "Tribe Code",
    "Tribe Name",
    "Group",
    "Theme",
    "Host Venue / Hall",
    "Team Lead Name",
    "Team Lead Department",
    "Team Lead Section",
    "Total Members",
    "All Team Members (Name - Dept - Sec)",
    ...eventHeaders,
    "Total Score (Points)",
  ];

  const rows = data.tribes.map((t) => {
    const membersSummary = t.members
      .map((m, idx) => `${idx + 1}. ${m.name}${m.department ? ` (${m.department}${m.classSection ? ` - ${m.classSection}` : ""})` : ""}${m.isLeader ? " [LEAD]" : ""}`)
      .join(" | ");

    const scoreCells = data.events.map((e) => {
      const match = t.eventScores.find((es) => es.eventId === e.id);
      return match && match.score !== null ? match.score : 0;
    });

    return [
      t.rank ? `#${t.rank}` : "Unranked",
      t.tribeCode,
      t.tribeName,
      t.groupName,
      t.theme,
      t.venueLocation,
      t.leader?.name || "N/A",
      t.leader?.department || "N/A",
      t.leader?.classSection || "N/A",
      t.memberCount,
      membersSummary,
      ...scoreCells,
      t.totalScore,
    ].map(escapeCsv).join(",");
  });

  const csvContent = [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
  const dateStr = new Date().toISOString().split("T")[0];
  triggerDownload(csvContent, `MSEC_SIP_Arena_Master_Scores_${dateStr}.csv`);
}

/**
 * 2. Blank Score Entry Template for Offline Evaluation (Excel/CSV)
 * Evaluators can fill scores into this sheet during live rounds.
 */
export function downloadOfflineScoreTemplate(data: MasterExportData, filterGroup?: string) {
  const tribes = filterGroup && filterGroup !== "all"
    ? data.tribes.filter((t) => t.groupName.toLowerCase() === filterGroup.toLowerCase())
    : data.tribes;

  const eventHeaders = data.events.map((e) => `${e.eventName} (Score / ${e.maximumScore})`);

  const headers = [
    "Tribe Code",
    "Tribe Name",
    "Group",
    "Theme",
    "Venue Hall",
    "Team Lead",
    ...eventHeaders,
    "Total Score",
    "Judge Remarks / Feedback",
  ];

  const rows = tribes.map((t) => {
    return [
      t.tribeCode,
      t.tribeName,
      t.groupName,
      t.theme,
      t.venueLocation,
      t.leader?.name || "",
      ...data.events.map(() => ""), // Blank score box for offline scoring
      "", // Blank total formula/box
      "", // Blank remarks
    ].map(escapeCsv).join(",");
  });

  const groupTag = filterGroup && filterGroup !== "all" ? `_${filterGroup.replace(/\s+/g, "_")}` : "_All_Groups";
  const csvContent = [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
  triggerDownload(csvContent, `SIP_Arena_Offline_Score_Template${groupTag}.csv`);
}

/**
 * 3. Tribe & Members Directory (Excel/CSV)
 * Full roster of students mapped by Tribe, Department, and Section.
 */
export function downloadMembersDirectoryExcel(data: MasterExportData) {
  const headers = [
    "Tribe Code",
    "Tribe Name",
    "Group",
    "Theme",
    "Member Name",
    "Department",
    "Class Section",
    "Role",
  ];

  const rows: string[] = [];
  data.tribes.forEach((t) => {
    if (t.members.length === 0) {
      rows.push([
        t.tribeCode,
        t.tribeName,
        t.groupName,
        t.theme,
        "No members listed",
        "",
        "",
        "",
      ].map(escapeCsv).join(","));
    } else {
      t.members.forEach((m) => {
        rows.push([
          t.tribeCode,
          t.tribeName,
          t.groupName,
          t.theme,
          m.name,
          m.department,
          m.classSection,
          m.isLeader ? "Team Leader" : "Team Member",
        ].map(escapeCsv).join(","));
      });
    }
  });

  const csvContent = [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
  const dateStr = new Date().toISOString().split("T")[0];
  triggerDownload(csvContent, `MSEC_SIP_Tribes_Members_Roster_${dateStr}.csv`);
}
