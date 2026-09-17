import { collection, query, where, orderBy, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

const segmentFilter = document.getElementById('segmentFilter');
const leaderboardBody = document.getElementById('leaderboardBody');

let unsubscribeScores = null;
let teamNamesMap = {}; // Maps teamId -> teamName

async function loadSegments() {
  try {
    const q = query(collection(db, "segments"), where("status", "in", ["live", "completed", "upcoming"]));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      segmentFilter.innerHTML = '<option value="">No segments found</option>';
      return;
    }

    let options = '<option value="">-- Select a Segment --</option>';
    snap.forEach(doc => {
      options += `<option value="${doc.id}">${doc.data().name}</option>`;
    });
    segmentFilter.innerHTML = options;

  } catch (error) {
    console.error("Error loading segments:", error);
    segmentFilter.innerHTML = '<option value="">Error loading segments</option>';
  }
}

async function loadTeamNames(segmentId) {
  teamNamesMap = {};
  const q = query(collection(db, "teams"), where("segmentId", "==", segmentId), where("status", "==", "approved"));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    teamNamesMap[doc.id] = doc.data().teamName;
  });
}

function renderLeaderboard(scoresData) {
  if (scoresData.length === 0) {
    leaderboardBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No scores recorded yet for this segment.</td></tr>`;
    return;
  }

  // Sort locally by score descending (if not already sorted by firestore)
  scoresData.sort((a, b) => b.score - a.score);

  let html = '';
  scoresData.forEach((row, index) => {
    // Only display if team is approved and mapped
    const teamName = teamNamesMap[row.teamId] || `Unknown Team (ID: ${row.teamId})`;
    const rank = index + 1;
    let rankHtml = `<span>${rank}</span>`;
    
    // Highlight top 3
    if (rank === 1) rankHtml = `<span style="color: #fbbf24; font-weight: bold;">🥇 1</span>`;
    if (rank === 2) rankHtml = `<span style="color: #94a3b8; font-weight: bold;">🥈 2</span>`;
    if (rank === 3) rankHtml = `<span style="color: #b45309; font-weight: bold;">🥉 3</span>`;

    html += `
      <tr>
        <td>${rankHtml}</td>
        <td style="font-weight: 500;">${teamName}</td>
        <td><span class="badge" style="background: rgba(255,255,255,0.1);">${row.stage || '-'}</span></td>
        <td style="text-align: right; font-size: 1.2rem; font-weight: 700; color: var(--primary-color);">${row.score}</td>
      </tr>
    `;
  });
  
  leaderboardBody.innerHTML = html;
}

function watchLeaderboard(segmentId) {
  // Clean up previous listener
  if (unsubscribeScores) {
    unsubscribeScores();
  }

  if (!segmentId) {
    leaderboardBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Select a segment to view live scores.</td></tr>`;
    return;
  }

  leaderboardBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Loading live data...</td></tr>`;

  // First, fetch the team names mapping
  loadTeamNames(segmentId).then(() => {
    // Set up real-time listener for scores
    const q = query(
      collection(db, "scores"),
      where("segmentId", "==", segmentId),
      orderBy("score", "desc")
    );

    unsubscribeScores = onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      renderLeaderboard(rows);
    }, (error) => {
      console.error("Live listener error:", error);
      leaderboardBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error connecting to live leaderboard.</td></tr>`;
    });
  }).catch(err => {
    console.error("Error setting up leaderboard:", err);
    leaderboardBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error loading team data.</td></tr>`;
  });
}

segmentFilter.addEventListener('change', (e) => {
  watchLeaderboard(e.target.value);
});

// Init
document.addEventListener('DOMContentLoaded', loadSegments);
