Product Requirements Document (PRD)

MSEC SIP Arena --- Live Tribe Scoreboard & Host Control Platform

Product Name: MSEC SIP Arena
Product Type: Web-based live scoreboard and score management
platform
Institution: Meenakshi Sundararajan Engineering College (MSEC)
Program: Student Induction Program (SIP) 2026--27
Primary Users: Students, Tribe Heads, Venue Hosts, SIP Coordinators,
Super Admin
Status: Product Specification / Development Ready
Version: 1.0

1. Product Overview

MSEC SIP Arena is a web-based live scoring platform designed for the
Student Induction Program (SIP) 2026--27 at Meenakshi Sundararajan
Engineering College.

The platform will manage 90 multidisciplinary tribes across 5
venues, provide venue-wise and overall leaderboards, and allow
authorized hosts/coordinators to enter and update event scores in real
time.

The system must be designed around a central principle:

One Tribe → One Current Venue → Multiple Event Scores → Automatic
Total → Automatic Ranking

The platform should work equally well on: - Projector / TV screens at
venues - Student mobile phones - Faculty/coordinator laptops - Admin
desktops

The visual identity should follow the supplied SIP poster direction:
deep purple, royal purple, gold/yellow, cream/white, with a premium
institutional and technology-oriented appearance.

2. Source-Based SIP Structure

The supplied SIP guidelines define five venue groups, with 18
multidisciplinary tribes per venue.

Group       Venue          Theme                     Venue Location         Tribes

Group I     Venue 1        Creative & Design         KRS Seminar Hall           18
Group II    Venue 2        Technology & Innovation   ECE Seminar Hall           18
Group III   Venue 3        Space & Cosmic            Civil Seminar Hall         18
Group IV    Venue 4        Legends & Mythology       MCW Seminar Hall           18
Group V     Venue 5        Power & Energy            MS Auditorium              18
Total   5 Venues   ---                       ---                    90

The SIP document also states that tribe grouping is permanent, tribe
names are intended to remain unchanged after approval, and the same
tribe identity continues across SIP activities.
fileciteturn0file0L15-L20

The five venue themes and their concepts are: - Creative & Design
--- aesthetics, innovation, visual harmony and modern architecture.
fileciteturn0file0L4-L9 - Technology & Innovation ---
next-generation computation, intelligent systems and digital
transformation. fileciteturn0file0L47-L52 - Space & Cosmic ---
galactic exploration, stellar engineering and deep-space concepts.
fileciteturn0file0L91-L96 - Legends & Mythology --- heroic
leadership, mythology, resilience and strategic wisdom.
fileciteturn0file0L135-L140 - Power & Energy --- electrical
energy, renewable resources, sustainability and dynamic power.
fileciteturn0file0L178-L183

The SIP document identifies activities including Tear Down Lab, Poster
Presentation, Career Quest, Sports and Valedictory as part of the
continuing SIP journey. fileciteturn0file0L18-L20

3. Problem Statement

The SIP program requires scores to be collected from multiple activities
while tribes are distributed across multiple venues.

A manual or spreadsheet-based process creates several problems:

Scores may be entered inconsistently.

Venue-wise rankings are difficult to maintain manually.

Overall rankings require repeated calculations.

Students cannot easily access live scores.

Hosts need a simple way to update individual tribe scores.

Moving a tribe between venues can create data inconsistencies.

There is limited visibility into score changes and corrections.

Projector displays require a dedicated, highly readable scoreboard
view.

MSEC SIP Arena solves this by creating a single source of truth for
tribe, venue, event and score data.

4. Product Goals

4.1 Primary Goals

Manage all 90 SIP tribes in one system.

Support 5 venue groups.

Allow tribes to be assigned or reassigned to venues.

Display a venue-specific leaderboard.

Display a global/overall leaderboard.

Allow authorized hosts to update individual event scores.

Automatically calculate total scores.

Automatically calculate rankings.

Provide real-time score updates to public screens.

Maintain an audit history of score changes.

Provide a projector/TV-friendly scoreboard mode.

Provide mobile-friendly access for students.

4.2 Secondary Goals

Provide fast tribe search.

Show event-wise score breakdowns.

Show tribe members and venue information.

Provide venue-level operational visibility.

Prevent unauthorized score or venue changes.

Make the system reusable for future SIP events.

5. Non-Goals

The first version will NOT attempt to:

Replace official college student-management systems.

Manage attendance unless explicitly added later.

Manage academic marks.

Automatically judge or evaluate student performance.

Generate scores using AI.

Allow students to edit their own scores.

Allow public users to modify any data.

6. User Roles

6.1 Public User / Student

Can: - View overall leaderboard. - View venue-wise leaderboard. - Search
tribes. - Open tribe profiles. - View event-wise scores. - View current
venue. - View current rank.

Cannot: - Edit scores. - Change venue assignments. - Modify tribe
information.

6.2 Venue Host

A Venue Host is responsible for score entry for a specific venue.

Can: - Log in. - View assigned venue. - View tribes in the venue. -
Enter event scores. - Edit scores for authorized teams. - View venue
leaderboard. - Search tribes. - View score history.

Cannot: - Delete tribes. - Move tribes between venues unless explicitly
authorized. - Modify another venue's scores. - Manage users. - Change
system settings.

6.3 Coordinator

Can: - Manage assigned venue. - Enter/edit scores. - Review rankings. -
Review score history. - Manage venue-specific event data. - Review tribe
information.

6.4 Super Admin

Full access.

Can: - Create/edit/delete tribes. - Assign tribes to venues. - Move
tribes between venues. - Create and manage events. - Configure scoring
rules. - Manage hosts and coordinators. - Edit scores. - View all
leaderboards. - View audit logs. - Lock/unlock venue assignments. -
Manage system configuration.

7. Core Functional Requirements

FR-01 --- Tribe Management

The system shall allow administrators to:

Create a tribe.

Assign a unique Tribe ID.

Store tribe name.

Store tribe group.

Assign a venue.

Add tribe members.

Edit tribe details.

Search tribes.

View tribe profile.

Required Tribe Fields

Tribe ID
Tribe Name
Group
Venue ID
Theme
Status
Members
Created At
Updated At

8. Venue Management

The system shall support exactly five initial venue groups.

Venue Configuration

Venue 1
Theme: Creative & Design
Location: KRS Seminar Hall
Group: Group I

Venue 2
Theme: Technology & Innovation
Location: ECE Seminar Hall
Group: Group II

Venue 3
Theme: Space & Cosmic
Location: Civil Seminar Hall
Group: Group III

Venue 4
Theme: Legends & Mythology
Location: MCW Seminar Hall
Group: Group IV

Venue 5
Theme: Power & Energy
Location: MS Auditorium
Group: Group V

The venue data above follows the supplied SIP document.
fileciteturn0file0L30-L35 fileciteturn0file0L75-L79
fileciteturn0file0L119-L123 fileciteturn0file0L163-L167
fileciteturn0file0L206-L210

9. Dynamic Venue Assignment

Venue assignment must be stored against the tribe.

Example:

Tribe: SIP-001
Name: Pixel Pioneers
Current Venue: Venue 1

If the administrator changes:

Venue 1 → Venue 3

the system shall automatically:

Update the tribe's current venue.

Remove the tribe from Venue 1's active leaderboard.

Add the tribe to Venue 3's active leaderboard.

Preserve all previous scores.

Preserve score history.

Recalculate venue rankings.

Keep the tribe in the overall leaderboard.

Important Rule

A tribe's scores must belong to the tribe, not the venue.

This ensures that moving a tribe does not erase or duplicate its scores.

10. Event Management

Administrators shall be able to create and manage SIP scoring events.

Initial event candidates based on the supplied SIP material include:

Tear Down Lab

Poster Presentation

Career Quest

Sports

Valedictory

The exact scoring weights/maxima must be configurable rather than
hard-coded unless officially provided by the SIP coordinators.

Event Fields

Event ID
Event Name
Description
Maximum Score
Status
Start Date
End Date
Created At
Updated At

11. Score Management

Scores shall be stored at the:

Tribe + Event

level.

Example:

Pixel Pioneers

Tear Down Lab          90
Poster Presentation    85
Career Quest            95
Sports                  80
Valedictory             90
--------------------------
TOTAL                  440

The total must be calculated automatically.

Score Formula

Total Score =
SUM(All Valid Event Scores)

The total must never be manually editable.

12. Score Entry Workflow

Host workflow:

LOGIN
  ↓
SELECT / OPEN ASSIGNED VENUE
  ↓
SEARCH TRIBE
  ↓
OPEN TRIBE
  ↓
SELECT EVENT
  ↓
ENTER SCORE
  ↓
OPTIONALLY ENTER REMARK
  ↓
SAVE
  ↓
VALIDATE SCORE
  ↓
STORE SCORE
  ↓
RECALCULATE TOTAL
  ↓
RECALCULATE RANK
  ↓
PUBLISH REAL-TIME UPDATE

13. Score Validation

The system shall validate:

Score cannot be negative.

Score cannot exceed event maximum.

Score must be numeric.

Event must exist.

Tribe must exist.

User must have permission to update the score.

Duplicate score records for the same tribe/event must be prevented.

If a score is invalid:

Score must be between 0 and 100.

The maximum should come dynamically from the event configuration.

14. Score Correction

Hosts/coordinators may correct scores if authorized.

Example:

Previous Score: 85
New Score: 90
Reason: Manual entry correction
Updated By: Host 03
Updated At: 10:42 AM

Every correction must create an audit record.

15. Audit Log

Every sensitive action must be logged.

Actions to log

Score created.

Score updated.

Score deleted.

Tribe created.

Tribe edited.

Venue changed.

Event created.

Event edited.

User created.

User permission changed.

Venue locked/unlocked.

Audit Record

Log ID
User ID
Action
Entity Type
Entity ID
Old Value
New Value
Reason
Timestamp
IP / Session Metadata (if required)

16. Leaderboard System

The platform shall provide two primary leaderboard types.

16.1 Venue Leaderboard

Shows only tribes currently assigned to the selected venue.

Example:

TECHNOLOGY & INNOVATION
ECE SEMINAR HALL

RANK   TRIBE                SCORE
1      Neural Knights       485
2      Byte Brigade         462
3      Future Forge         451
4      Cyber Sentinels      430
5      Code Crafters        425

16.2 Overall Leaderboard

Shows all active tribes across all five venues.

OVERALL SIP LEADERBOARD

RANK   TRIBE              VENUE             SCORE
1      Neural Knights     Technology        485
2      Pixel Pioneers     Creative          472
3      Orion Voyagers     Space             465
4      Phoenix Legion     Mythology         451
5      Volt Vanguard      Energy            447

17. Ranking Rules

Ranking shall be generated automatically from total score.

Default ranking:

Higher Total Score = Higher Rank

The system should support configurable tie-breaking later.

Recommended future tie-breaking order:

Higher total score.

Higher score in the latest completed event.

Higher score in the previous event.

Shared rank if no tie-breaker resolves the tie.

Tie-breaking must be configurable by the Super Admin.

18. Public Scoreboard Mode

A dedicated route shall be provided:

/scoreboard

Purpose:

Projector display.

LED display.

TV display.

Venue monitor.

Requirements

Full-screen layout.

Large typography.

High contrast.

Minimal controls.

Auto-refresh/realtime updates.

Current venue prominently displayed.

Last updated timestamp.

Top-ranked tribes highlighted.

Optional scrolling leaderboard.

Example:

MSEC
STUDENT INDUCTION PROGRAM 2026–27

TECHNOLOGY & INNOVATION
ECE SEMINAR HALL

          LIVE SCOREBOARD

01   NEURAL KNIGHTS             485
02   BYTE BRIGADE               462
03   FUTURE FORGE               451
04   CYBER SENTINELS            430
05   CODE CRAFTERS              425

● LIVE
LAST UPDATED: 10:42 AM

19. Public Mobile View

Students accessing the system from phones shall receive a responsive
interface.

Main sections:

Home
Overall
Venues
Tribes
Search

A student should be able to find a tribe in a few interactions.

20. Tribe Profile Page

Route:

/tribe/:tribeId

Display:

TRIBE NAME
Tribe ID
Current Venue
Theme
Current Rank
Total Score

EVENT SCORES

Tear Down Lab       90
Poster Presentation 85
Career Quest        95
Sports              80
Valedictory         90

TOTAL               440

MEMBERS
- Member 1
- Member 2
- Member 3
...

21. Venue Page

Route:

/venue/:venueId

Display:

Venue name.

Group.

Theme.

Location.

Number of tribes.

Live ranking.

Top tribes.

Full ranking.

Last update.

Optional theme artwork.

22. Search

Global search shall support:

Tribe Name
Tribe ID
Member Name
Venue

Example:

Search: "Neural"

Result:
Neural Knights
SIP-024
Technology & Innovation
ECE Seminar Hall
Score: 485
Rank: #1

23. Admin Dashboard

Route:

/admin

Dashboard cards:

TOTAL TRIBES          90
TOTAL VENUES           5
ACTIVE EVENTS          X
SCORES ENTERED         X

Venue summary:

Venue 1   18 Tribes
Venue 2   18 Tribes
Venue 3   18 Tribes
Venue 4   18 Tribes
Venue 5   18 Tribes

Recent activity:

10:42  Neural Knights score updated
10:40  Pixel Pioneers score updated
10:38  Orion Voyagers score updated

24. Admin Team Management

Table:

ID       TRIBE              VENUE              SCORE
----------------------------------------------------
SIP001   Pixel Pioneers     Creative            285
SIP002   Byte Brigade       Technology           310
SIP003   Orion Voyagers     Space                298
SIP004   Phoenix Legion     Mythology            321
SIP005   Volt Vanguard      Energy               276

Actions:

View
Edit
Move Venue
Scores
Members

25. Venue Lock

Super Admin shall be able to lock venue assignment.

Unlocked

Hosts with permission can modify allowed assignments.

Locked

Venue assignments cannot be changed.

Only authorized Super Admin users can unlock.

Example:

VENUE ASSIGNMENT STATUS

Venue 1     🔒 LOCKED
Venue 2     🔒 LOCKED
Venue 3     🔓 UNLOCKED
Venue 4     🔒 LOCKED
Venue 5     🔒 LOCKED

This reduces accidental venue changes during live operations.

26. Real-Time Updates

Score updates should propagate to connected public screens without
requiring manual page refresh.

Recommended implementation options:

Supabase Realtime

WebSockets

Socket.IO

Example:

Host updates:

Neural Knights
Poster Presentation
100 → 110

        ↓

Database updated

        ↓

Realtime event

        ↓

All connected clients receive update

        ↓

Leaderboard recalculates

        ↓

Public screen updates

27. UI / UX Requirements

Visual Direction

The interface should be inspired by the supplied MSEC SIP poster.

Primary Visual Palette

Deep Purple
Royal Purple
Gold / Yellow
Cream / Off-white
Dark Navy / Black text

Design Principles

Premium institutional appearance.

Clean modern dashboard.

Strong typography.

Gold accents.

Purple navigation.

Cream/white content areas.

Subtle circuit/technology patterns.

Avoid excessive gradients.

Avoid clutter.

Maintain readability from a distance.

28. Venue Theme Visuals

Each venue can have subtle visual motifs while maintaining the common
MSEC purple/gold brand.

Venue 1 --- Creative & Design

Visual elements: - Blueprint lines. - Grid systems. - Pixel elements. -
Design shapes.

Venue 2 --- Technology & Innovation

Visual elements: - Circuit traces. - Digital nodes. - Binary patterns. -
Code-inspired graphics.

Venue 3 --- Space & Cosmic

Visual elements: - Stars. - Orbits. - Constellations. - Planetary
curves.

Venue 4 --- Legends & Mythology

Visual elements: - Shields. - Geometric motifs. - Heroic forms. -
Myth-inspired patterns.

Venue 5 --- Power & Energy

Visual elements: - Energy waves. - Lightning-inspired lines. -
Electrical circuits. - Renewable-energy motifs.

These visual themes should remain subtle so that the overall platform
still feels like one unified MSEC product.

29. Recommended Page Structure

Public

/
├── /leaderboard
├── /scoreboard
├── /overall
├── /venues
│   ├── /venue/1
│   ├── /venue/2
│   ├── /venue/3
│   ├── /venue/4
│   └── /venue/5
├── /tribes
├── /tribe/:id
└── /search

Admin

/admin
/admin/teams
/admin/teams/:id
/admin/venues
/admin/events
/admin/scores
/admin/users
/admin/audit
/admin/settings

30. Suggested Database Schema

venues

id
group_name
venue_name
theme
location
description
is_locked
created_at
updated_at

tribes

id
tribe_code
tribe_name
venue_id
status
created_at
updated_at

members

id
tribe_id
name
department
class_section
created_at
updated_at

events

id
event_name
description
maximum_score
status
start_date
end_date
created_at
updated_at

scores

id
tribe_id
event_id
score
remarks
entered_by
created_at
updated_at

users

id
name
email
role
venue_id
status
created_at
updated_at

audit_logs

id
user_id
action
entity_type
entity_id
old_value
new_value
reason
created_at

31. Database Relationships

VENUE
  │
  │ 1
  │
  └──────────< TRIBES
                  │
                  │ 1
                  │
                  ├──────────< MEMBERS
                  │
                  └──────────< SCORES >────────── EVENTS

A user may also be assigned to a venue:

VENUE ───────< USERS

32. API Requirements

Public APIs

GET /api/venues
GET /api/venues/:id
GET /api/leaderboard
GET /api/leaderboard/venue/:id
GET /api/tribes
GET /api/tribes/:id
GET /api/tribes/:id/scores
GET /api/events

Admin APIs

POST   /api/admin/tribes
PUT    /api/admin/tribes/:id
DELETE /api/admin/tribes/:id

PUT    /api/admin/tribes/:id/venue

POST   /api/admin/events
PUT    /api/admin/events/:id
DELETE /api/admin/events/:id

POST   /api/admin/scores
PUT    /api/admin/scores/:id

GET    /api/admin/audit

Authentication must be required for all admin endpoints.

33. Authentication & Authorization

Recommended:

Supabase Auth or equivalent.

Email/password authentication.

Role-based access control.

Venue-level permissions.

Secure session management.

Authorization Example

Super Admin
    ↓
All Venues
    ↓
All Teams
    ↓
All Scores

Venue Host
    ↓
Assigned Venue
    ↓
Assigned Teams
    ↓
Authorized Scores

34. Security Requirements

The platform shall:

Protect all admin routes.

Validate permissions server-side.

Never trust client-side role checks alone.

Prevent unauthorized score modification.

Prevent public score modification.

Sanitize user input.

Validate score ranges.

Log sensitive operations.

Protect authentication credentials.

Use HTTPS in production.

Use database-level access policies where supported.

35. Performance Requirements

The system should support:

At least 90 active tribes.

Multiple simultaneous public viewers.

Multiple venue hosts entering scores.

Real-time leaderboard updates.

Fast leaderboard loading.

Mobile and desktop access.

Target:

Initial page load: < 3 seconds under normal conditions
Leaderboard update: near real-time
Search response: < 1 second under normal conditions

These are product targets and may be adjusted after deployment testing.

36. Reliability Requirements

Because the scoreboard may be used during live events:

Score saving must be reliable.

Failed score submissions must show clear errors.

Hosts should never receive a false success state.

Duplicate submissions should be safely handled.

The system should recover gracefully from temporary connection loss.

Public scoreboard should display the last successfully synchronized
state.

37. Responsive Design

The platform must support:

Mobile

Student phone
Host phone/tablet

Tablet

Venue coordinator tablet

Desktop

Admin dashboard
Coordinator dashboard

Large Display

Projector
TV
LED screen

38. Accessibility

The interface should provide:

High contrast.

Large text in scoreboard mode.

Clear rank indicators.

Avoid color-only meaning.

Keyboard-friendly admin navigation.

Descriptive labels.

Touch-friendly controls.

Responsive layouts.

39. Empty / Loading / Error States

Every major page must have proper states.

Loading

Loading live leaderboard...

No scores

No scores have been published yet.

Search not found

No tribe found.
Try searching by tribe name or Tribe ID.

Connection problem

Connection temporarily unavailable.
Showing the latest synchronized scores.

Permission error

You do not have permission to perform this action.

40. Scoreboard Sorting & Filtering

Public users should be able to:

Select venue.

View all venues.

Search tribe.

Sort by rank.

Optionally filter by event.

Default:

Sort by Total Score DESC

41. Live Indicator

Public scoreboard should display:

● LIVE

When the connection is unavailable:

○ OFFLINE
Last synchronized: 10:42 AM

This makes the state of the displayed data clear.

42. Optional Advanced Features

These are not required for MVP but can be added later.

42.1 Score Change Animation

When a tribe's score increases:

+20

appears briefly beside the score.

42.2 Rank Change

↑ +2

or

↓ -1

42.3 Top 3 Podium

       🥇
   NEURAL KNIGHTS
       485

🥈 BYTE BRIGADE       🥉 FUTURE FORGE
    462                    451

42.4 Full-Screen Auto Rotation

A projector can rotate:

Overall
↓
Venue 1
↓
Venue 2
↓
Venue 3
↓
Venue 4
↓
Venue 5

42.5 Export

Admin can export:

CSV

Excel

PDF

for official records.

43. MVP Definition

The Minimum Viable Product must include:

Public

Home page.

Overall leaderboard.

Venue leaderboard.

Tribe search.

Tribe profile.

Responsive design.

Scoreboard display.

Admin

Authentication.

Tribe management.

Venue assignment.

Event management.

Score entry.

Score editing.

Automatic totals.

Automatic ranking.

Audit log.

Infrastructure

Database.

Authentication.

Realtime updates.

Role-based authorization.

44. MVP Acceptance Criteria

The MVP is considered successful when:

AC-01

Admin can create and manage 90 tribes.

AC-02

Every tribe can be assigned to one of five venues.

AC-03

Admin can move a tribe between venues without losing scores.

AC-04

A host can enter a score for an authorized tribe/event.

AC-05

The system prevents scores above the configured maximum.

AC-06

Total score is automatically calculated.

AC-07

Venue rankings update automatically.

AC-08

Overall rankings update automatically.

AC-09

Public users cannot modify scores.

AC-10

Score changes are recorded in the audit log.

AC-11

Public scoreboard reflects score changes in real time.

AC-12

The interface works on mobile, desktop and projector displays.

45. Example End-to-End Scenario

Initial State

Pixel Pioneers
Venue: Creative & Design
Total: 250
Rank: #5

Host enters score

Event: Poster Presentation
Score: 90

System:

Save score
    ↓
Total = 340
    ↓
Recalculate Venue 1 ranking
    ↓
Recalculate Overall ranking
    ↓
Write audit log
    ↓
Broadcast realtime update

Team moves venue

Creative & Design
        ↓
Space & Cosmic

System:

Update tribe.venue_id
        ↓
Preserve score records
        ↓
Remove from Venue 1 leaderboard
        ↓
Add to Venue 3 leaderboard
        ↓
Recalculate ranks

No score data is duplicated or lost.

46. Recommended Technology Stack

Frontend

Next.js
TypeScript
Tailwind CSS
shadcn/ui

Backend / Database

Supabase
PostgreSQL
Supabase Auth
Supabase Realtime

Deployment

Vercel
+
Supabase

Optional

Zod              → Validation
React Hook Form  → Admin forms
Lucide React     → Icons
Recharts         → Admin analytics

47. High-Level Architecture

                         USERS
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       STUDENTS         HOSTS           SUPER ADMIN
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
                    NEXT.JS APPLICATION
                           │
              ┌────────────┴────────────┐
              │                         │
       PUBLIC SCOREBOARD            ADMIN PANEL
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
                    SUPABASE BACKEND
                           │
             ┌─────────────┼─────────────┐
             │             │             │
         PostgreSQL       Auth        Realtime
             │
       ┌─────┼─────┬─────┬─────┐
       │     │     │     │     │
     Venues Tribes Events Scores Logs

48. Product Success Metrics

The system should be evaluated using:

100% of active tribes represented correctly.

100% of score updates validated.

No unauthorized score modifications.

Venue leaderboard reflects current assignments.

Overall leaderboard reflects current totals.

Score updates appear on public displays with minimal delay.

Hosts can update a score in a few interactions.

Students can find their tribe quickly.

48A. Final Technology Decision

The production implementation shall use the following architecture:

Layer

Technology

Frontend

React + Next.js App Router

Rendering

SSR / React Server Components

Language

TypeScript

UI

Tailwind CSS + shadcn/ui

Backend

Python FastAPI

API

REST API + WebSockets

ORM

SQLAlchemy

Validation

Pydantic + Zod

Database

PostgreSQL

Migrations

Alembic

Server

Uvicorn

Authentication

FastAPI-compatible token/session auth

Architectural Principle

React/Next.js handles presentation and SSR.

FastAPI handles business logic, authorization, scoring and data operations.

PostgreSQL is the source of truth.

WebSockets provide live scoreboard updates.

React / Next.js SSR
        │
        │ REST
        ▼
     FastAPI
        │
        ├──── WebSockets ────► Live Scoreboards
        │
        ▼
   PostgreSQL

49. Future Scalability

Although the initial SIP configuration is:

5 Venues
90 Tribes

the database should not hard-code these numbers.

The platform should support:

Future Event
    ↓
Different number of venues
    ↓
Different number of tribes
    ↓
Different events
    ↓
Different scoring systems

This allows MSEC to reuse the same platform for future induction
programs, competitions and inter-department events.

50. Final Product Vision

MSEC SIP Arena should become a single, trusted digital scoreboard for
the entire Student Induction Program.

The product should make scoring:

Fast → Accurate → Transparent → Live → Easy to manage

The final experience should feel like a professional institutional
competition platform rather than a spreadsheet.

Core Product Loop

TRIBE
  ↓
VENUE
  ↓
EVENT
  ↓
SCORE
  ↓
AUTOMATIC TOTAL
  ↓
VENUE RANK
  ↓
OVERALL RANK
  ↓
LIVE PUBLIC DISPLAY

Brand Direction

MSEC SIP ARENA

90 Tribes • 5 Venues • One Journey

Purple. Gold. Institutional. Live.