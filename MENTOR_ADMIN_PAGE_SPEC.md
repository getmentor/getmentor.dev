# GetMentor.dev — Mentor Admin Page

**Frontend Specification (Next.js Pages Router + React + Tailwind)**

---

## 1. Objective

Implement a protected **Mentor Admin web interface** that allows mentors to:

* View active mentoring requests.
* View past mentoring requests.
* Inspect full request details.
* Change request status according to a defined workflow.
* Decline requests with a predefined reason and optional comment.
* Perform basic client-side search.

This specification covers **frontend implementation only**.
The backend (Golang API) is assumed to expose all required endpoints and enforce authorization rules.

---

## 2. Technology Stack

* **Next.js – Pages Router**
* **React**
* **Tailwind CSS**
* **SSR + CSR hybrid**

  * SSR: authentication gate + layout rendering
  * CSR: data loading and interactions

---

## 3. Users and Access

### Mentor

* Authenticated user.
* Has access to `/mentor/*` routes.
* Can only see and modify requests assigned to them (backend responsibility).

### Public / Unauthenticated

* No access to mentor routes or protected APIs.

---

## 4. Authentication (Passwordless)

### 4.1 Login Flow

Mentors authenticate using a **passwordless flow**.

Supported mechanisms:

* Mentor enters **email** on the website.
* Backend sends either:

  * a **magic link**, or
  * a **one-time token** (manual entry).
* Alternatively, mentor may receive a link/token via **Telegram bot**
  (out of scope, but frontend flow must support tokens coming from external delivery).

The agent may choose **the simplest secure implementation**.

---

### 4.2 Required Pages

* `/mentor/login`

  * Email input
  * Submit → triggers token/link delivery
  * Optional token input field (only if required by chosen flow)

* `/mentor/auth/callback`

  * Reads token from URL or query
  * Exchanges token for an authenticated session
  * Redirects to `/mentor` on success

---

### 4.3 Session Handling

* Session TTL: **24 hours**
* Token refresh allowed while session is active
* If session expires:

  * Redirect to `/mentor/login`
  * Show “Session expired” message

**Token storage strategy**

* The agent should choose the **simplest secure approach**:

  * Prefer **HttpOnly cookies**
  * Fallback allowed if backend constraints require it

---

## 5. Request Domain Model

### 5.1 Request Type

```ts
export class MentorClientRequest {
  id: string;
  email: string;
  name: string;
  telegram: string;
  details: string;
  level: string;
  createdAt: Date;
  modifiedAt: Date;
  statusChangedAt: Date;
  scheduledAt: Date;
  review: string;
  status: "pending" | "contacted" | "working" | "done" | "declined" | "unavailable";
  mentorId: string;
  review_url: string;
}
```

---

### 5.2 Fields to Display

**Visible in lists**

* name
* email
* level (enum, mentee seniority)
* short excerpt of `details`
* status
* createdAt

**Visible in details**

* all above
* full `details`
* telegram (used as contact method)
* review + review_url (if present)
* timestamps (createdAt, statusChangedAt)

---

### 5.3 Sorting

* All lists sorted by **createdAt ascending**.

---

## 6. Status Model

### 6.1 Statuses

* `pending`
* `contacted`
* `working`
* `done`
* `declined`
* `unavailable`

---

### 6.2 Grouping

**Active Requests**

* pending
* contacted
* working

**Past Requests**

* done
* declined
* unavailable

---

### 6.3 Transitions

* `pending → contacted → working → done`
* `declined` allowed from **any state except `done`**

Backend enforces validity; frontend reflects backend response.

---

## 7. Mentor Admin UI

### 7.1 Layout

Common layout for all mentor pages (except login):

* Top navigation or sidebar:

  * Active Requests
  * Past Requests
  * Logout

Design must be:

* Minimal
* Professional
* Functional
* Responsive (desktop-first, mobile supported)

---

## 8. Active Requests Page (`/mentor`)

### 8.1 Behavior

* Default page after login.
* Loads **asynchronously on page load**.
* Shows:

  * loading state
  * empty state
  * error state

---

### 8.2 List Requirements

Each item shows:

* name
* email
* level
* short details excerpt
* status badge
* createdAt

Actions:

* Click row or “View” → Request Details

---

### 8.3 Search

* Client-side only
* Case-insensitive
* Matches:

  * name
  * email
  * telegram
  * details
  * id
* No backend calls

---

## 9. Past Requests Page (`/mentor/past`)

### 9.1 Loading

* **Must not load until user navigates to this page**
* Asynchronous fetch
* Loading + empty + error states

---

### 9.2 Pagination

* Backend returns **all past requests at once**
* Frontend implements **client-side pagination**
* Infinite scroll is acceptable

---

### 9.3 Search

Same behavior as Active Requests (client-side).

---

## 10. Request Details Page (`/mentor/requests/[id]`)

### 10.1 Content

* Full request information
* Contact data (email, telegram)
* Status badge
* Review and review link (if present)
* Timestamps

---

### 10.2 Actions

* Change status according to workflow
* Decline request:

  * confirmation modal
  * predefined decline reasons
  * optional free-text comment

---

### 10.3 Post-action behavior

* Status updates immediately on success
* Request moves between Active/Past lists if needed
* On failure:

  * show error
  * keep UI consistent with server state

---

## 11. Decline Flow

### 11.1 UI Requirements

* Modal dialog
* Required:

  * predefined decline reason (dropdown)
* Optional:

  * comment text area

### 11.2 Submission

* Disable submit while request is in progress
* Handle validation errors from backend

---

## 12. API Expectations (Frontend Contracts)

(Exact URLs may differ; names are illustrative.)

### Auth

* `POST /auth/mentor/request-login`
* `POST /auth/mentor/verify`
* `POST /auth/logout` (optional)

### Requests

* `GET /mentor/requests?group=active`
* `GET /mentor/requests?group=past`
* `GET /mentor/requests/{id}`
* `POST /mentor/requests/{id}/status`
* `POST /mentor/requests/{id}/decline`

All endpoints require authentication.

---

## 13. Security Requirements

* All `/mentor/*` routes protected
* Route guarding via:

  * `getServerSideProps` auth check
* All API calls include auth credentials
* Handle:

  * 401 / 403 → logout + redirect to login

---

## 14. Localization

* UI language: **Russian only**
* Dates formatted in Russian locale
* Relative or absolute time formatting allowed (agent chooses)

---

## 15. Non-functional Requirements

* Active list supports ~10 items
* Past list supports 100+ items
* Accessible:

  * keyboard navigation
  * focus management
* Clear empty/error states

---

## 16. Explicit Constraints

* No mentee accounts
* No in-platform messaging
* No server-side search
* No assumptions beyond this spec

---

## 17. Deliverables

The AI agent must produce:

* Next.js Pages Router implementation
* React components
* Tailwind-based layout and styling
* Authentication flow
* All described pages and interactions