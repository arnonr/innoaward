# Direct File & Image Upload for Contestant Artifacts — Short Design Spec

**Date:** 2026-11-05  
**Scope Size:** Small-to-Medium Focused Change (Short Design)

## 1. Intent & Why
Replace manual URL-pasting in Step 3 of the Submission Form (and the Round 2 Late Artifact Updater in the Status Dossier modal) with direct drag-and-drop file/image uploading to the project's Bun/Elysia server so contestants can upload all 5 required/optional competition files directly without hosting files on external drives first.

## 2. Goals, Non-Goals, and Anti-Goals
- **Goals:**
  - Support direct file upload to the server for all 5 submission artifact slots:
    1. **Proposal PDF** (`proposalPdfUrl`): `.pdf` (up to 30 MB)
    2. **Presentation Video (2–3 min)** (`videoUrl`): `.mp4, .webm, .mov` (up to 300 MB)
    3. **Prototype Cover Image** (`coverImage`): `.jpg, .jpeg, .png, .webp` (up to 15 MB) — while keeping the 3 quick sample image buttons for demo convenience
    4. **Poster** (`posterUrl`): `.pdf, .jpg, .jpeg, .png, .webp` (up to 30 MB) — both in Step 3 and in the Round 2 Status Dossier late-upload form
    5. **Presentation Slides** (`presentationUrl`): `.pdf, .ppt, .pptx` (up to 50 MB) — both in Step 3 and in the Round 2 Status Dossier late-upload form
  - Provide real-time `0%–100%` upload progress via `XMLHttpRequest`, file type/size validation via `react-dropzone`, inline previews (image thumbnail, video player preview, document badge + open link), and one-click file replacement/removal.
  - Serve uploaded files from the Bun/Elysia backend (`/api/uploads/files/:year/:slot/:filename`) with HTTP Range (`206 Partial Content`) support so uploaded videos stream and scrub smoothly in the Judge Workspace and Hall of Fame player.
- **Non-Goals:**
  - External cloud object storage (S3/R2) configuration or transcoding pipelines.
  - Database schema migrations (`Submission` already stores URL/path strings for all 5 artifacts).
- **Anti-Goals:**
  - Blocking form draft saving while a file is not yet required, or losing already-uploaded file paths when navigating between Step 1, Step 2, and Step 3.

## 3. Constraints
- Frontend uses `React 19.2.8` + `Vite 8.2.0` (`react-dropzone` must install cleanly without peer-dependency issues).
- Uploaded files must resolve properly in both local development (`http://localhost:5173` + `http://localhost:3001/api`) and production via `getAssetUrl()`.
- Upload endpoint (`POST /api/uploads/artifact`) must require an authenticated user (`authPlugin`) and validate slot name, MIME type / extension, and maximum file size before writing to `server/uploads/<year>/<slot>/`.

## 4. Approaches Considered
1. **Approach 1 (Selected): `react-dropzone` + Reusable `<ArtifactUploadField />` + XHR Progress + Bun Native Disk Storage & Range Streaming**
   - *Pros:* Full React 19 compatibility, seamless Dark Glassmorphism styling, real-time upload progress bar per slot, native `Bun.write()` / `Bun.file()` streaming.
   - *Cons:* Custom progress card UI (built with existing CSS tokens and `lucide-react` icons).
2. **Approach 2: `FilePond` (`react-filepond`)**
   - *Rejected:* Heavy opinionated CSS clashes with the 5-slot modal layout and has React 19 peer dependency friction.
3. **Approach 3: `Uppy` (`@uppy/react`)**
   - *Rejected:* Oversized bundle for 5 dedicated single-file slots.

## 5. Architecture & Decisions
- **Backend (`server/src/modules/uploads/uploads.controller.ts`):**
  - `POST /api/uploads/artifact`: Authenticated multipart endpoint accepting `file` (`File`), `slot` (`proposal | video | image | poster | presentation`), and optional `year`. Validates extension/MIME and max size, writes to `server/uploads/<year>/<slot>/<timestamp>-<uuid>-<safeName>`, and returns `{ success: true, data: { url: '/api/uploads/files/<year>/<slot>/<filename>', originalName, size, mimeType, slot } }`.
  - `GET /api/uploads/files/:year/:slot/:filename`: Sanitizes path segments against traversal, serves `Bun.file(filePath)` with proper `Content-Type`, `Accept-Ranges: bytes`, and HTTP `206 Partial Content` byte-range slicing for video scrubbing.
- **Frontend (`client/src/components/ArtifactUploadField.jsx` & `client/src/App.jsx`):**
  - Reusable `<ArtifactUploadField />` built on `useDropzone` from `react-dropzone`.
  - Shows drag-and-drop zone with accepted formats & max size hint, active XHR progress bar (`0%–100%`), uploaded file card with preview (thumbnail for images, inline mini-player for videos, PDF/Slide icon + open button for documents), and "เปลี่ยนไฟล์" / "ลบไฟล์" actions.
  - Integrated into all 5 slots of Step 3 (`showPortalModal`), the 2 late-upload slots (`posterUrl`, `presentationUrl`) in `showStatusModal`, and Judge Workspace artifact links via `getAssetUrl()`.
