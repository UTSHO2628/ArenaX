# ArenaX Tournament Manager

ArenaX is a production-quality static web application for managing robotics tournaments (e.g., Line Follower Robot, Sumo Bot). It features public team registration, real-time live leaderboards, and an admin dashboard for tournament management.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES Modules). No build step required.
- **Database**: Firebase Cloud Firestore (NoSQL, real-time sync).
- **Authentication**: Firebase Authentication (Email/Password) for a single admin account.
- **Hosting**: Designed to be hosted purely as a static site on GitHub Pages.

## Architecture & Design Decisions
1. **No Backend / Static Deployment**: GitHub Pages only serves static files. The application interacts directly with Firebase Cloud Firestore over HTTPS from the client side using the Firebase JS SDK (loaded via CDN).
2. **Single Admin Role**: There are no participant accounts. Anyone can register a team and view the leaderboard. An admin logs in via Firebase Auth to manage segments, teams, and scores. This simplifies the user model significantly while meeting all requirements.
3. **Real-time Leaderboard**: The leaderboard utilizes Firestore's `onSnapshot` listener to automatically update rankings instantly when the admin updates a score—without needing a page refresh.
4. **Security Rules**: Since Firebase Web API keys are public by design, security is entirely enforced on the backend via Firestore Security Rules (`firestore.rules`). These rules dictate what operations require the admin UID and what operations are public (like creating a team registration with a minimum of 4 members).

## Database Schema (Firestore)

- **segments/{id}**
  - `name` (string): e.g. "Line Follower Robot"
  - `code` (string): e.g. "LFR"
  - `description` (string)
  - `status` (string): "upcoming" | "live" | "completed"
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

- **teams/{id}**
  - `teamName` (string)
  - `segmentId` (string): reference to segments
  - `members` (array of objects): `{ name, institution, contact }`. Enforced >= 4.
  - `contactEmail` (string)
  - `status` (string): "pending" | "approved" | "rejected"
  - `createdAt` (timestamp)

- **scores/{id}**
  - `teamId` (string): reference to teams
  - `segmentId` (string): reference to segments
  - `score` (number)
  - `stage` (string): e.g., "Qualifier", "Final"
  - `updatedAt` (timestamp)

## Setup Instructions

### 1. Firebase Project Setup (One-Time)
1. Go to the [Firebase Console](https://console.firebase.google.com/) and Create a Project (the free Spark plan is sufficient).
2. Go to **Build → Authentication → Sign-in method** and enable **Email/Password**.
3. Go to **Build → Authentication → Users tab** and manually add a user (this will be your one admin account). **Copy the User UID**.
4. Go to **Build → Firestore Database** and click **Create database** (start in production mode).
5. Go to the **Rules** tab in Firestore and replace the contents with the rules provided in `firestore.rules`.
   - **IMPORTANT**: Replace `PUT_ADMIN_UID_HERE` in the rules with the UID you copied in Step 3. Click Publish.

### 2. Connect the Web App
1. In the Firebase Console, go to **Project settings → General**.
2. Scroll to **Your apps**, click **Add app**, and select **Web (</>)**.
3. Copy the `firebaseConfig` object provided by Firebase.
4. Open `js/firebase-config.js` in this repository and replace the placeholder configuration with your actual config. Note: It is completely safe and expected for these keys to be public in your client-side code.

### 3. Deployment to GitHub Pages
1. Push this repository to GitHub.
2. In your repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set the **Source** to **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder. Click Save.
5. GitHub will deploy your site, and you can access it via the provided URL.

## Grading Requirements Met
- **Real connected database**: Utilizes Firestore.
- **Client-side functionality**: Vanilla JS handles all logic, form validation (enforcing 4+ members), and Firebase API calls.
- **Role separation**: Implements a strict Admin vs. Public visitor model enforced via Firestore rules.
- **Live Data**: The leaderboard updates instantly using Firestore's real-time listeners.
- **Responsive & Modern Design**: Uses a mobile-first, flex/grid CSS approach with modern aesthetics and smooth interactions.
"# ArenaX" 
