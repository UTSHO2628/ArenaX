import { requireAuth } from "../auth.js";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { db } from "../firebase-config.js";

requireAuth();

const segmentForm = document.getElementById('segmentForm');
const segmentsBody = document.getElementById('segmentsBody');
const formAlert = document.getElementById('formAlert');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');

let segmentsData = {}; // Keep locally for quick editing

function showAlert(msg, isError = true) {
  formAlert.textContent = msg;
  formAlert.className = `alert show alert-${isError ? 'error' : 'success'}`;
  setTimeout(() => { formAlert.classList.remove('show'); }, 3000);
}

async function loadSegments() {
  try {
    const snap = await getDocs(collection(db, "segments"));
    if (snap.empty) {
      segmentsBody.innerHTML = '<tr><td colspan="3" class="text-center">No segments found.</td></tr>';
      return;
    }

    segmentsData = {};
    let html = '';
    snap.forEach(docSnap => {
      const data = docSnap.data();
      segmentsData[docSnap.id] = data;
      html += `
        <tr>
          <td><strong>${data.name}</strong> <span class="text-muted">(${data.code})</span></td>
          <td><span class="badge badge-${data.status}">${data.status.toUpperCase()}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-secondary edit-btn" data-id="${docSnap.id}" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">Edit</button>
            <button class="btn btn-danger delete-btn" data-id="${docSnap.id}" style="padding: 0.25rem 0.75rem; font-size: 0.8rem; margin-left: 0.5rem;">Delete</button>
          </td>
        </tr>
      `;
    });
    segmentsBody.innerHTML = html;
    
    // Attach event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEdit));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDelete));

  } catch (err) {
    console.error("Error loading segments:", err);
    segmentsBody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error loading data.</td></tr>';
  }
}

function handleEdit(e) {
  const id = e.target.getAttribute('data-id');
  const data = segmentsData[id];
  
  document.getElementById('segmentId').value = id;
  document.getElementById('name').value = data.name;
  document.getElementById('code').value = data.code;
  document.getElementById('description').value = data.description || '';
  document.getElementById('status').value = data.status;
  
  formTitle.textContent = "Edit Segment";
  submitBtn.textContent = "Update Segment";
  cancelBtn.style.display = 'block';
  window.scrollTo(0, 0);
}

function resetForm() {
  segmentForm.reset();
  document.getElementById('segmentId').value = '';
  formTitle.textContent = "Create New Segment";
  submitBtn.textContent = "Save Segment";
  cancelBtn.style.display = 'none';
}

cancelBtn.addEventListener('click', resetForm);

async function handleDelete(e) {
  if (!confirm("Are you sure you want to delete this segment? This action cannot be undone.")) return;
  
  const id = e.target.getAttribute('data-id');
  try {
    await deleteDoc(doc(db, "segments", id));
    showAlert("Segment deleted.", false);
    loadSegments();
  } catch (err) {
    console.error("Error deleting segment:", err);
    showAlert("Error deleting segment.");
  }
}

segmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('segmentId').value;
  const segmentData = {
    name: document.getElementById('name').value.trim(),
    code: document.getElementById('code').value.trim(),
    description: document.getElementById('description').value.trim(),
    status: document.getElementById('status').value,
    updatedAt: serverTimestamp()
  };

  try {
    submitBtn.disabled = true;
    if (id) {
      await updateDoc(doc(db, "segments", id), segmentData);
      showAlert("Segment updated successfully.", false);
    } else {
      segmentData.createdAt = serverTimestamp();
      await addDoc(collection(db, "segments"), segmentData);
      showAlert("Segment created successfully.", false);
    }
    resetForm();
    loadSegments();
  } catch (err) {
    console.error("Error saving segment:", err);
    showAlert("Failed to save segment.");
  } finally {
    submitBtn.disabled = false;
  }
});

// Init
document.addEventListener('DOMContentLoaded', loadSegments);
