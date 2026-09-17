import { collection, query, where, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

const membersContainer = document.getElementById('membersContainer');
const addMemberBtn = document.getElementById('addMemberBtn');
const registerForm = document.getElementById('registerForm');
const segmentSelect = document.getElementById('segmentSelect');
const formAlert = document.getElementById('formAlert');

let memberCount = 0;

function createMemberRow(isRemovable = true) {
  memberCount++;
  const row = document.createElement('div');
  row.className = 'member-row';
  row.id = `memberRow_${memberCount}`;
  
  row.innerHTML = `
    <div class="form-group">
      <label>Name</label>
      <input type="text" class="form-control member-name" required placeholder="Member Name">
    </div>
    <div class="form-group">
      <label>Institution/ID</label>
      <input type="text" class="form-control member-inst" required placeholder="University / ID">
    </div>
    <div class="form-group">
      <label>Contact</label>
      <input type="text" class="form-control member-contact" required placeholder="Phone/Email">
    </div>
    ${isRemovable ? `<button type="button" class="remove-member-btn" onclick="document.getElementById('${row.id}').remove()">✕ Remove</button>` : `<div style="width: 82px;"></div>`}
  `;
  membersContainer.appendChild(row);
}

function showAlert(message, isError = true) {
  formAlert.textContent = message;
  formAlert.className = `alert show alert-${isError ? 'error' : 'success'}`;
  window.scrollTo(0, 0);
}

async function loadSegments() {
  try {
    const q = query(collection(db, "segments"), where("status", "in", ["upcoming", "live"]));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      segmentSelect.innerHTML = '<option value="">No active segments available</option>';
      return;
    }

    let options = '<option value="">-- Select a Segment --</option>';
    snap.forEach(doc => {
      options += `<option value="${doc.id}">${doc.data().name}</option>`;
    });
    segmentSelect.innerHTML = options;

    // Pre-select if URL has ?segment=id
    const urlParams = new URLSearchParams(window.location.search);
    const preselect = urlParams.get('segment');
    if (preselect) {
      segmentSelect.value = preselect;
    }
  } catch (error) {
    console.error("Error loading segments:", error);
    showAlert("Failed to load segments. Please try again later.");
  }
}

// Initialize minimum 4 members
function initMembers() {
  membersContainer.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    createMemberRow(false); // First 4 cannot be removed easily via button
  }
}

addMemberBtn.addEventListener('click', () => createMemberRow(true));

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.textContent;
  
  // Gather members
  const memberRows = membersContainer.querySelectorAll('.member-row');
  const members = [];
  
  memberRows.forEach(row => {
    const name = row.querySelector('.member-name').value.trim();
    const inst = row.querySelector('.member-inst').value.trim();
    const contact = row.querySelector('.member-contact').value.trim();
    
    if (name || inst || contact) {
      members.push({ name, institution: inst, contact });
    }
  });

  if (members.length < 4) {
    showAlert("A minimum of 4 members is required.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    // Check if team name exists in the same segment
    const teamName = document.getElementById('teamName').value.trim();
    const segmentId = segmentSelect.value;
    
    const duplicateCheck = query(collection(db, "teams"), 
      where("segmentId", "==", segmentId),
      where("teamName", "==", teamName)
    );
    const dupSnap = await getDocs(duplicateCheck);
    
    if (!dupSnap.empty) {
      showAlert("A team with this name is already registered for this segment.");
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    // Write to Firestore
    await addDoc(collection(db, "teams"), {
      teamName,
      segmentId,
      contactEmail: document.getElementById('contactEmail').value.trim(),
      members,
      status: "pending",
      createdAt: serverTimestamp()
    });

    showAlert("Registration submitted successfully! Please wait for admin approval.", false);
    registerForm.reset();
    initMembers();
  } catch (error) {
    console.error("Registration error:", error);
    showAlert("Failed to submit registration. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadSegments();
  initMembers();
});
