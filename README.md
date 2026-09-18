# 🤖 ArenaX — Robotics Tournament Manager

**A web-based platform to manage multi-segment robotics tournaments with live, real-time scoring.**

🔗 **Live Demo:** [utsho2628.github.io/ArenaX](https://utsho2628.github.io/ArenaX/)

---

## 📖 About

ArenaX is a lightweight tournament management system built for university and inter-university robotics competitions — Line Follower Robot (LFR), Sumo/Soccer Bot, Drone Race, Project Showcase, and any other segment an organizer wants to run.

Instead of tracking scores on paper or spreadsheets, ArenaX gives every competition a **public, real-time leaderboard**: the moment an organizer enters a score, it updates live on every viewer's screen — no refresh needed.

The project was built as a university software engineering project, with a strong requirement for a real, connected cloud database — satisfied here using **Cloud Firestore**.

---

## ✨ Features

**For visitors / participants (no account needed):**
- 📝 Register a team under any open segment (minimum 4 members required)
- 🏆 View the live leaderboard, filterable by segment, updating in real time
- ✅ Duplicate team-name protection within a segment

**For the organizer (Admin, single account):**
- 🔐 Secure email/password login
- 🎯 Create, edit, and manage competition segments (`upcoming` / `live` / `completed`)
- 👥 Review team registrations — approve or reject each one
- 📊 Enter and update scores per team, per segment, with optional round/stage labels

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES Modules) — no framework, no build step |
| Database | [Cloud Firestore](https://firebase.google.com/docs/firestore) (Firebase) |
| Authentication | Firebase Authentication (Email/Password) |
| Hosting | GitHub Pages (static hosting) |

ArenaX is intentionally framework-free and build-tool-free: every page is a plain `.html` file that loads the Firebase SDK directly from Google's CDN, so it runs as-is on GitHub Pages with zero configuration.

---

## 📂 Project Structure

```
ArenaX/
├── index.html              # Public homepage
├── register.html           # Public team registration
├── leaderboard.html        # Public live leaderboard
├── login.html               # Admin login
├── admin/
│   ├── index.html           # Admin dashboard
│   ├── segments.html         # Manage competition segments
│   ├── teams.html            # Review & approve/reject teams
│   └── scores.html           # Enter / update scores
├── css/style.css
├── js/
│   ├── firebase-config.js
│   ├── auth.js
│   ├── register.js
│   ├── leaderboard.js
│   └── admin/
│       ├── segments.js
│       ├── teams.js
│       └── scores.js
└── firestore.rules          # Database security rules
```

---

## 🗄️ Database Schema (Cloud Firestore)

| Collection | Purpose | Key fields |
|---|---|---|
| `segments` | Each competition segment | `name`, `code`, `status`, `description` |
| `teams` | Each team registration | `teamName`, `segmentId`, `members[]`, `status` |
| `scores` | Each score entry | `segmentId`, `teamId`, `score`, `stage` |

There is no `users` collection — ArenaX has exactly one privileged role (Admin), identified by a hardcoded UID in `firestore.rules` rather than a database lookup, keeping the access-control model as simple as possible.

Access control is enforced entirely at the database level via **Firestore Security Rules** — not just hidden UI — so public visitors can read leaderboard data and submit registrations, but only the Admin account can approve teams, manage segments, or write scores.

---

## 🚀 How to Use

### As a visitor
1. Open the [live site](https://utsho2628.github.io/ArenaX/).
2. Click **Register a Team**, pick a segment, fill in your team name and at least 4 members, and submit. Your registration goes in as `pending`.
3. Once the organizer approves your team, check the **Leaderboard** page any time — scores update live as the tournament progresses.

### As the Admin
1. Go to `/login.html` and sign in with the admin account.
2. **Segments** — create the competition segments for the tournament.
3. **Teams** — review pending registrations and approve or reject them.
4. **Scores** — select a segment and an approved team, enter the score, and save. The public leaderboard reflects it instantly.

---

## ⚙️ Running Your Own Copy

1. Create a free [Firebase](https://console.firebase.google.com/) project.
2. Enable **Authentication → Email/Password**, and manually create one admin user (Firebase does not offer public sign-up here by design).
3. Enable **Firestore Database**, then publish the rules from `firestore.rules` — replacing the placeholder with your admin user's UID.
4. Copy your Firebase Web config into `js/firebase-config.js`.
5. Serve the folder with any static server (e.g. VS Code's Live Server) — opening `index.html` directly via `file://` will not work, since ES Modules require an HTTP origin.
6. Deploy by pushing to GitHub and enabling **Pages** in the repository settings.

---

## 🔮 Future Improvements

- Multiple judge/admin roles scoped to individual segments
- Email notifications on approval/rejection and score updates
- Exportable results/certificates (PDF)
- Bracket-style elimination rounds
- Support for multiple tournaments in one deployment

---

## 👤 Author

**Utsho Kumar Dey**
CSE, Northern University of Business and Technology, Khulna (NUBTK)
[GitHub](https://github.com/UTSHO2628) · [LinkedIn](https://www.linkedin.com/in/utsho-kumar-dey-98bb04260/)
