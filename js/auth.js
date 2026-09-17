import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

// This file is used on admin pages to ensure only an authenticated admin can view them.
// If the user is not authenticated, they are redirected to /login.html

export function requireAuth() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Not logged in, redirect
      // Calculate correct path based on whether we are in admin/ folder or root
      const isRoot = window.location.pathname.includes('/login.html');
      if (!isRoot) {
        window.location.href = '../login.html';
      }
    }
  });
}

export function handleLogout() {
  signOut(auth).then(() => {
    window.location.href = '../index.html';
  }).catch((error) => {
    console.error("Error logging out", error);
  });
}

// Automatically bind logout buttons if they exist
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
});
