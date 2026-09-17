import { requireAuth } from "../auth.js";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { db } from "../firebase-config.js";

requireAuth();

const teamsBody = document.getElementById('teamsBody');
const segmentFilter = document.getElementById('segmentFilter');
const actionAlert = document.getElementById('actionAlert');

let allTeams = [];

function showAlert(msg, isError = true) {
  actionAlert.textContent = msg;
  actionAlert.className = `alert show alert-${isError ? 'error' : 'success'}`;
  setTimeout(() => { actionAlert.classList.remove('show'); }, 3000);
}

async function loadSegmentsFilter() {
  try {
    const snap = await getDocs(collection(db, "segments"));
    let options = '<option value="all">All Segments</option>';
    snap.forEach(docSnap => {
      options += `<option value="${docSnap.id}">${docSnap.data().name}</option>`;
    });
    segmentFilter.innerHTML = options;
  } catch (err) {
    console.error("Error loading segments filter:", err);
  }
}

async function loadTeams() {
  teamsBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading teams...</td></tr>';
  try {
    const snap = await getDocs(collection(db, "teams"));
    allTeams = [];
    snap.forEach(docSnap => {
      allTeams.push({ id: docSnap.id, ...docSnap.data() });
    });
    
    // Initial sort by status (pending first) then date
    allTeams.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return 0;
    });

    renderTeams();
  } catch (err) {
    console.error("Error loading teams:", err);
    teamsBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading teams.</td></tr>';
  }
}

function renderTeams() {
  const filterVal = segmentFilter.value;
  const filtered = filterVal === 'all' 
    ? allTeams 
    : allTeams.filter(t => t.segmentId === filterVal);

  if (filtered.length === 0) {
    teamsBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No teams found.</td></tr>';
    return;
  }

  let html = '';
  filtered.forEach(team => {
    let actionButtons = '';
    
    if (team.status === 'pending') {
      actionButtons = `
        <button class="btn btn-secondary action-btn" data-action="approve" data-id="${team.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: rgba(16, 185, 129, 0.2); color: #10b981; border: none;">Approve</button>
        <button class="btn btn-secondary action-btn" data-action="reject" data-id="${team.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-left: 0.25rem; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: none;">Reject</button>
      `;
    } else {
      actionButtons = `<button class="btn btn-danger action-btn" data-action="delete" data-id="${team.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>`;
    }

    html += `
      <tr>
        <td><strong>${team.teamName}</strong></td>
        <td style="font-size: 0.9rem;">${team.contactEmail}</td>
        <td>${team.members ? team.members.length : 0} members</td>
        <td><span class="badge badge-${team.status}">${team.status.toUpperCase()}</span></td>
        <td style="text-align: right;">${actionButtons}</td>
      </tr>
    `;
  });

  teamsBody.innerHTML = html;
  
  // Attach listeners
  document.querySelectorAll('.action-btn').forEach(btn => btn.addEventListener('click', handleAction));
}

async function handleAction(e) {
  const id = e.target.getAttribute('data-id');
  const action = e.target.getAttribute('data-action');
  
  try {
    if (action === 'approve') {
      await updateDoc(doc(db, "teams", id), { status: 'approved' });
      showAlert("Team approved.", false);
    } else if (action === 'reject') {
      await updateDoc(doc(db, "teams", id), { status: 'rejected' });
      showAlert("Team rejected.", false);
    } else if (action === 'delete') {
      if (!confirm("Delete this team registration permanently?")) return;
      await deleteDoc(doc(db, "teams", id));
      showAlert("Team deleted.", false);
    }
    
    loadTeams(); // Reload to refresh list
  } catch (err) {
    console.error("Action error:", err);
    showAlert("Action failed.");
  }
}

segmentFilter.addEventListener('change', renderTeams);

document.addEventListener('DOMContentLoaded', () => {
  loadSegmentsFilter();
  loadTeams();
});
