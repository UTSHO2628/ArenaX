import { requireAuth } from "../auth.js";
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { db } from "../firebase-config.js";

requireAuth();

const segmentSelect = document.getElementById('segmentSelect');
const teamSelect = document.getElementById('teamSelect');
const scoreForm = document.getElementById('scoreForm');
const formAlert = document.getElementById('formAlert');
const submitBtn = document.getElementById('submitBtn');

let scoresCache = {}; // Cache existing scores to populate the form

function showAlert(msg, isError = true) {
  formAlert.textContent = msg;
  formAlert.className = `alert show alert-${isError ? 'error' : 'success'}`;
  setTimeout(() => { formAlert.classList.remove('show'); }, 3000);
}

async function loadSegments() {
  try {
    const snap = await getDocs(collection(db, "segments"));
    let options = '<option value="">-- Select a Segment --</option>';
    snap.forEach(docSnap => {
      options += `<option value="${docSnap.id}">${docSnap.data().name}</option>`;
    });
    segmentSelect.innerHTML = options;
  } catch (err) {
    console.error("Error loading segments:", err);
  }
}

async function loadTeamsForSegment(segmentId) {
  if (!segmentId) {
    teamSelect.innerHTML = '<option value="">Select a segment first</option>';
    teamSelect.disabled = true;
    return;
  }

  try {
    teamSelect.innerHTML = '<option value="">Loading teams...</option>';
    teamSelect.disabled = true;

    // Load approved teams
    const teamQ = query(collection(db, "teams"), where("segmentId", "==", segmentId), where("status", "==", "approved"));
    const teamSnap = await getDocs(teamQ);
    
    // Load existing scores for this segment
    scoresCache = {};
    const scoreQ = query(collection(db, "scores"), where("segmentId", "==", segmentId));
    const scoreSnap = await getDocs(scoreQ);
    scoreSnap.forEach(sDoc => {
      const sData = sDoc.data();
      scoresCache[sData.teamId] = sData;
    });

    if (teamSnap.empty) {
      teamSelect.innerHTML = '<option value="">No approved teams in this segment</option>';
      return;
    }

    let options = '<option value="">-- Select a Team --</option>';
    teamSnap.forEach(docSnap => {
      options += `<option value="${docSnap.id}">${docSnap.data().teamName}</option>`;
    });
    teamSelect.innerHTML = options;
    teamSelect.disabled = false;
    
    // Reset form inputs
    document.getElementById('score').value = '';
    document.getElementById('stage').value = '';

  } catch (err) {
    console.error("Error loading teams:", err);
    teamSelect.innerHTML = '<option value="">Error loading teams</option>';
  }
}

segmentSelect.addEventListener('change', (e) => {
  loadTeamsForSegment(e.target.value);
});

teamSelect.addEventListener('change', (e) => {
  const teamId = e.target.value;
  if (!teamId) return;

  // Auto-fill existing score if present
  if (scoresCache[teamId]) {
    document.getElementById('score').value = scoresCache[teamId].score;
    document.getElementById('stage').value = scoresCache[teamId].stage || '';
  } else {
    document.getElementById('score').value = '';
    document.getElementById('stage').value = '';
  }
});

scoreForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const segmentId = segmentSelect.value;
  const teamId = teamSelect.value;
  const scoreVal = parseFloat(document.getElementById('score').value);
  const stageVal = document.getElementById('stage').value.trim();

  if (!segmentId || !teamId) {
    showAlert("Please select a segment and a team.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    // We use a composite key for the score document ID: segmentId_teamId
    // This ensures only one score document exists per team per segment.
    const scoreDocId = `${segmentId}_${teamId}`;
    
    await setDoc(doc(db, "scores", scoreDocId), {
      segmentId,
      teamId,
      score: scoreVal,
      stage: stageVal,
      updatedAt: serverTimestamp()
    });

    // Update cache
    scoresCache[teamId] = { score: scoreVal, stage: stageVal };
    
    showAlert("Score updated successfully on the live leaderboard!", false);
  } catch (err) {
    console.error("Error saving score:", err);
    showAlert("Failed to save score.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Update Score';
  }
});

document.addEventListener('DOMContentLoaded', loadSegments);
