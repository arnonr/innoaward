# Direct File & Image Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable contestants to upload all 5 competition artifacts (`Proposal PDF`, `2–3 min Video`, `Prototype Image`, `Poster`, `Presentation Slides`) directly to the Bun/Elysia server using `react-dropzone` with real-time progress bars, inline previews, and HTTP Range video streaming.

**Architecture:** A new `uploadsController` module on the Bun/Elysia backend (`POST /api/uploads/artifact` and `GET /api/uploads/files/:year/:slot/:filename`) validates and persists files to `server/uploads/<year>/<slot>/` and serves them with byte-range streaming. On the frontend, a reusable `<ArtifactUploadField />` component powered by `react-dropzone` and `XMLHttpRequest` replaces manual URL inputs in Step 3 of the submission form and the Round 2 late-upload form, storing the returned `/api/uploads/files/...` path directly in existing `Submission` fields.

**Tech Stack:** Bun, Elysia.js, React 19.2.8, `react-dropzone`, `lucide-react`, Node test runner (`node --test`), Bun test runner (`bun test`).

**Spec:** `docs/superpowers/specs/2026-11-05-direct-artifact-upload-design.md`

## Global Constraints

- Support direct file upload to the server for all 5 submission artifact slots: `proposal` (`.pdf`, 30 MB), `video` (`.mp4, .webm, .mov`, 300 MB), `image` (`.jpg, .jpeg, .png, .webp`, 15 MB), `poster` (`.pdf, .jpg, .jpeg, .png, .webp`, 30 MB), `presentation` (`.pdf, .ppt, .pptx`, 50 MB).
- Frontend uses `React 19.2.8` + `Vite 8.2.0` (`react-dropzone` must install cleanly without peer-dependency issues).
- Uploaded files must resolve properly in both local development (`http://localhost:5173` + `http://localhost:3001/api`) and production via `getAssetUrl()`.
- Upload endpoint (`POST /api/uploads/artifact`) must require an authenticated user (`authPlugin`) and validate slot name, MIME type / extension, and maximum file size before writing to `server/uploads/<year>/<slot>/`.

## Review Focus

- Path traversal via `:year`, `:slot`, or `:filename` in `GET /api/uploads/files/:year/:slot/:filename` must be rejected with HTTP `400` or `404` and never read outside `server/uploads/`.
- Unauthenticated `POST /api/uploads/artifact` requests must be rejected with HTTP `401`.
- Uploading a file with a disallowed extension for a given slot (e.g., `.exe` or `.mp4` into `proposal`) or exceeding the slot's size limit must be rejected with HTTP `400` and a clear Thai error message.
- HTTP `Range: bytes=0-1023` requests to `GET /api/uploads/files/:year/video/:filename` must return HTTP `206 Partial Content` with `Content-Range` and `Accept-Ranges: bytes` so video scrubbing works in browsers.
- Existing `getAssetUrl(path)` in `client/src/App.jsx` must resolve `/api/uploads/files/...` against the backend server origin while still resolving public static assets (`/osbi-poster.jpg`, `/docs/...`) against Vite `BASE_URL`.

---

### Task 1: Backend Artifact Upload & HTTP Range Streaming Module

**Files:**
- Create: `server/src/modules/uploads/uploads.controller.ts`
- Modify: `server/src/index.ts`
- Test: `server/tests/uploads.test.ts`

**Interfaces:**
- Produces:
  - `POST /api/uploads/artifact` (multipart form-data: `file: File`, `slot: 'proposal' | 'video' | 'image' | 'poster' | 'presentation'`, `year?: string`) -> `{ success: true, data: { url: string, slot: string, originalName: string, size: number, mimeType: string } }`
  - `GET /api/uploads/files/:year/:slot/:filename` -> binary `Response` (`200 OK` or `206 Partial Content` with `Accept-Ranges: bytes`)

- [ ] **Step 1: Write the failing backend upload & streaming tests in `server/tests/uploads.test.ts`**

```typescript
import { describe, expect, it } from 'bun:test';
import { app } from '../src/index';

describe('Artifact Uploads Controller', () => {
  it('rejects unauthenticated upload with 401', async () => {
    const form = new FormData();
    form.append('slot', 'proposal');
    form.append('file', new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'test.pdf', { type: 'application/pdf' }));
    const res = await app.handle(new Request('http://localhost/api/uploads/artifact', { method: 'POST', body: form }));
    expect(res.status).toBe(401);
  });

  it('uploads valid PDF, rejects invalid extension, and serves uploaded file with Range 206 support', async () => {
    // Register/login a test user and test POST /api/uploads/artifact + GET /api/uploads/files/:year/:slot/:filename
  });
});
```

- [ ] **Step 2: Run `bun test tests/uploads.test.ts` to verify it fails**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/uploads.test.ts`
Expected: FAIL with `404` on `/api/uploads/artifact`.

- [ ] **Step 3: Implement `uploadsController` in `server/src/modules/uploads/uploads.controller.ts` and mount in `server/src/index.ts`**

Implement `SLOT_RULES` (`proposal`: `['.pdf']`, 30MB; `video`: `['.mp4', '.webm', '.mov']`, 300MB; `image`: `['.jpg', '.jpeg', '.png', '.webp']`, 15MB; `poster`: `['.pdf', '.jpg', '.jpeg', '.png', '.webp']`, 30MB; `presentation`: `['.pdf', '.ppt', '.pptx']`, 50MB), sanitize path segments with `/^[a-zA-Z0-9._-]+$/`, write files via `Bun.write()`, and serve `GET /api/uploads/files/:year/:slot/:filename` with `Bun.file().slice(start, end + 1)` when `Range` header is present. Also add `server/uploads/` to `.gitignore`.

- [ ] **Step 4: Run `bun test` to verify all backend tests pass**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test`
Expected: PASS

- [ ] **Step 5: Commit Task 1**

```bash
git add .gitignore server/src/modules/uploads/uploads.controller.ts server/src/index.ts server/tests/uploads.test.ts
git commit -m "feat(server): add artifact file upload and HTTP range streaming endpoints"
```

---

### Task 2: Frontend `react-dropzone` Utilities & `<ArtifactUploadField />` Component

**Files:**
- Modify: `client/package.json`
- Create: `client/src/components/artifactUploadUtils.js`
- Create: `client/src/components/ArtifactUploadField.jsx`
- Create: `client/src/components/artifactUpload.test.mjs`

**Interfaces:**
- Consumes: `POST /api/uploads/artifact`
- Produces:
  - `ARTIFACT_SLOT_CONFIG`
  - `validateArtifactFile(file, slot)` -> `{ valid: boolean, error: string }`
  - `formatFileSize(bytes)` -> `string`
  - `resolveServerUploadUrl(path, apiBase, baseUrl)` -> `string`
  - `detectArtifactPreviewKind(url)` -> `'image' | 'video' | 'pdf' | 'slides' | 'none'`
  - `<ArtifactUploadField slot id label required badgeText badgeColor value onChange apiBase authToken year disabled />`

- [ ] **Step 1: Install `react-dropzone` and write failing unit tests in `client/src/components/artifactUpload.test.mjs`**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && npm install react-dropzone`
Test `ARTIFACT_SLOT_CONFIG`, `validateArtifactFile`, `formatFileSize`, `resolveServerUploadUrl`, and `detectArtifactPreviewKind`.

- [ ] **Step 2: Run `node --test src/components/artifactUpload.test.mjs` to verify it fails**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && node --test src/components/artifactUpload.test.mjs`
Expected: FAIL with `Cannot find module './artifactUploadUtils.js'`.

- [ ] **Step 3: Implement `client/src/components/artifactUploadUtils.js` and `client/src/components/ArtifactUploadField.jsx`**

Use `useDropzone` from `react-dropzone` and `XMLHttpRequest` for real-time upload percentage (`0%–100%`), drag-over highlight state, inline image/video/PDF/slide preview card, and replace/remove buttons.

- [ ] **Step 4: Run `node --test src/components/*.test.mjs` to verify tests pass**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && node --test src/components/*.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit Task 2**

```bash
git add client/package.json client/package-lock.json client/src/components/artifactUploadUtils.js client/src/components/ArtifactUploadField.jsx client/src/components/artifactUpload.test.mjs
git commit -m "feat(client): add react-dropzone ArtifactUploadField component and upload helpers"
```

---

### Task 3: Integrate `<ArtifactUploadField />` Across Submission Step 3, Status Dossier, and Judge Workspace

**Files:**
- Modify: `client/src/App.jsx`
- Modify: `client/src/index.css`
- Modify: `client/src/components/submissionDossierUtils.test.mjs`

**Interfaces:**
- Consumes: `<ArtifactUploadField />`, `resolveServerUploadUrl` from Task 2

- [ ] **Step 1: Write failing integration tests in `client/src/components/submissionDossierUtils.test.mjs`**

Assert that `App.jsx` imports `ArtifactUploadField`, renders `<ArtifactUploadField` for all 5 slots (`proposal`, `video`, `image`, `poster`, `presentation`) in Step 3 and in the Round 2 late-artifact editor, and uses `resolveServerUploadUrl` inside `getAssetUrl`.

- [ ] **Step 2: Run `node --test src/components/submissionDossierUtils.test.mjs` to verify it fails**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && node --test src/components/submissionDossierUtils.test.mjs`
Expected: FAIL

- [ ] **Step 3: Update `client/src/App.jsx` and `client/src/index.css`**

Wire `<ArtifactUploadField />` into Step 3 (all 5 slots, keeping the 3 preset sample image chips on Slot 3), the Round 2 late-upload form in `showStatusModal` (`poster` and `presentation`), update `getAssetUrl` to delegate `/api/uploads/` paths via `resolveServerUploadUrl`, and use `getAssetUrl()` on Judge Workspace artifact links. Add dropzone and progress bar CSS rules in `client/src/index.css`.

- [ ] **Step 4: Run unit tests, `impeccable detect`, and production build**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && node --test src/components/*.test.mjs && npm run build`
Expected: PASS

- [ ] **Step 5: Commit Task 3**

```bash
git add client/src/App.jsx client/src/index.css client/src/components/submissionDossierUtils.test.mjs
git commit -m "feat(ui): integrate direct file and image upload in submission form and dossier"
```
