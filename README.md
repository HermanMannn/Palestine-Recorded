*Preserving Identity, One Story at a Time.*

Palestine Recorded (PalRec) is a web-based platform dedicated to preserving the rich tapestry of Palestinian heritage, culture, and traditions. By providing an unabridged record of historical events supported by unbiased, verified sources, alongside a dynamic space for community testimonies, PalRec aims to reclaim narratives often overshadowed by conflict.

Demo Accessible through: https://palrec.lovable.app/timeline (as of May 2026)

Table of Contents
-----------------

*   [Overview](#overview)
*   [Key Features](#key-features)
*   [The Dual-Timeline System](#the-dual-timeline-system)
*   [Platform Ecosystem](#platform-ecosystem)
*   [Getting Started](#getting-started)
*   [Development Setup](#development-setup)
*   [Testing](#testing)
*   [Team](#team)

Overview
--------
For decades, the narrative surrounding Palestine has been dominated by conflict, often obscuring the vibrant reality of its people. PalRec serves as a digital archive and social hub, merging verified historical data with community-contributed media to create a comprehensive and authentic record of Palestinian life. The platform leverages modern web technologies to ensure accessibility, integrity, and engaging user experiences.

Key Features
------------

*   **Interactive Historical Map:** Navigate centuries of Palestinian history through an intuitive, map-based interface.
*   **Dual-Timeline Approach:** Explore history through verified institutional records or personal community testimonies.
*   **Community Social Feed:** Share stories, photographs, and memories in a dedicated social space.
*   **PalGrid:** Learn Palestinian culture and terminology through a daily interactive word puzzle.
*   **Reputation System:** Earn points for contributing verified and meaningful content to the platform.
*   **Robust Moderation:** Maintain historical integrity through AI-assisted and human moderation.

The Dual-Timeline System
------------------------

PalRec's core innovation is its dual-timeline architecture, providing two distinct but complementary lenses on history:

### 1. The Verified Timeline

An authoritative record of historical events mapped geographically.

*   **Curated Data:** Events are sourced from verified historical texts, academic journals, and recognized archives.
*   **Geospatial Navigation:** Events are plotted on a map of Palestine, allowing users to explore history by location and era.
*   **Detailed Context:** Each event includes comprehensive descriptions, dates, and links to verified external sources (e.g., Wikipedia, Britannica) for further reading.

### 2. The Community Timeline

A dynamic, living archive driven by the Palestinian diaspora and supporters.

*   **Personal Testimonies:** Users can upload family archives, photographs, oral histories, and personal accounts.
*   **Social Interaction:** Engage with content through likes, comments, and shares within the platform's messaging system.
*   **Moderated Integrity:** All submissions undergo strict moderation to prevent misinformation and ensure alignment with the platform's mission.

Platform Ecosystem
------------------

PalRec is more than just a timeline; it's a comprehensive ecosystem designed for engagement and education:

*   **Community Hub & Messaging:** Connect with researchers, historians, and individuals through a dedicated messaging system.
*   **PalGrid Cultural Puzzle:** A daily game designed to teach users about Palestinian cities, cultural items, historical figures, and traditions in an engaging format.
*   **Future Integrations:** Plans include AI-driven chatbots for research assistance and blockchain integration to confirm the authorship and legitimacy of historical records.

Getting Started
---------------

### Prerequisites

Ensure you have the following installed before proceeding:

*   **Node.js** (v18.x or higher)
*   **npm** (or **yarn**)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YourOrganization/PalRec.git
    cd PalRec
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).


Development Setup
-----------------

The project is structured using modern web development practices:

*   **Frontend Framework:** React 18
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Map Integration:** Mapbox/OpenStreetMap via `mapEvents` module
*   **Backend Services:** Firebase (Realtime Database, Storage, Authentication).

### Project Structure (Key Areas)

*   `src/components/`: Reusable React components (e.g., `Navbar.jsx`, `EventDetails.jsx`, `RightToolbar.jsx`).
*   `src/pages/`: Main application views (e.g., `About.jsx`, `SocialFeed.jsx`, `TimelineSidebar.jsx`, `PalGrid.tsx`, `Messages.jsx`).
*   `src/lib/`: Utility functions and shared logic (e.g., `mapEvents.js`).
*   `src/firebase.js`: Firebase initialization and configuration.

Testing
-------

PalRec employs a comprehensive testing strategy to ensure data integrity and platform stability.

### Testing Phases

1.  **Unit Testing:** Focuses on individual components (e.g., PalGrid logic, UI rendering, reputation calculation).
2.  **Integration Testing:** Verifies data flow between the UI, Firebase Backend, and Map modules.
3.  **Validation Testing (Black-Box):** Ensures the platform meets all Software Requirements Specification (SRS) criteria, focusing on user workflows and historical accuracy.
4.  **High-Order Testing:** Includes security audits, performance profiling (target load time < 1s), stress testing, and compatibility checks across modern browsers and mobile devices.

*Testing is overseen by the Internal Testing Group (ITG) consisting of senior students from the University of Sharjah.*

Team
----

PalRec is developed by **Midas Software Solutions**, under the leadership of Dr. Manar Abu Talib at the University of Sharjah
===========================
