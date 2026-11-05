import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileText,
  Film,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Plus,
  Layers,
} from 'lucide-react';
import {
  ARTIFACT_SLOT_CONFIG,
  validateArtifactFile,
  formatFileSize,
  detectArtifactPreviewKind,
  extractArtifactDisplayName,
} from './artifactUploadUtils';

export default function ArtifactUploadField({
  slot = 'proposal',
  id,
  label,
  badgeText,
  badgeColor = 'var(--emerald-300)',
  value = '',
  onChange,
  apiBase = 'http://localhost:3001/api',
  authToken = '',
  year = '2569',
  disabled = false,
  resolveUrl,
  children,
}) {
  const config = ARTIFACT_SLOT_CONFIG[slot] || ARTIFACT_SLOT_CONFIG.proposal;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadedMeta, setUploadedMeta] = useState(null);

  const uploadFileToServer = useCallback(
    (file) => {
      const check = validateArtifactFile(file, slot);
      if (!check.valid) {
        setUploadError(check.error);
        return;
      }

      setUploadError('');
      setUploading(true);
      setProgress(1);

      const formData = new FormData();
      formData.append('slot', slot);
      formData.append('year', String(year || '2569'));
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      const endpoint = `${String(apiBase).replace(/\/+$/, '')}/uploads/artifact`;
      xhr.open('POST', endpoint, true);

      if (authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const pct = Math.min(99, Math.max(1, Math.round((event.loaded / event.total) * 100)));
          setProgress(pct);
        }
      };

      xhr.onload = () => {
        setUploading(false);
        let parsed = null;
        try {
          parsed = JSON.parse(xhr.responseText || '{}');
        } catch {
          parsed = null;
        }

        if (xhr.status >= 200 && xhr.status < 300 && parsed?.success && parsed?.data?.url) {
          setProgress(100);
          setUploadedMeta({
            originalName: parsed.data.originalName || file.name,
            size: parsed.data.size || file.size,
            mimeType: parsed.data.mimeType || file.type,
          });
          if (onChange) {
            onChange(parsed.data.url);
          }
        } else {
          setProgress(0);
          setUploadError(
            parsed?.message || `อัปโหลดไฟล์ไม่สำเร็จ (รหัสสถานะ ${xhr.status || 'Network Error'})`
          );
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setProgress(0);
        setUploadError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์อัปโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
      };

      xhr.send(formData);
    },
    [apiBase, authToken, onChange, slot, year]
  );

  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (disabled || uploading) return;
      if (acceptedFiles && acceptedFiles.length > 0) {
        uploadFileToServer(acceptedFiles[0]);
        return;
      }
      if (fileRejections && fileRejections.length > 0) {
        const firstRejected = fileRejections[0]?.file;
        if (firstRejected) {
          const check = validateArtifactFile(firstRejected, slot);
          setUploadError(
            check.error ||
              `ชนิดหรือขนาดไฟล์ไม่ถูกต้อง (รองรับ ${config.extensionsLabel} สูงสุด ${config.maxSizeLabel})`
          );
        }
      }
    },
    [config.extensionsLabel, config.maxSizeLabel, disabled, slot, uploadFileToServer, uploading]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: config.accept,
    maxSize: config.maxSizeBytes,
    multiple: false,
    disabled: disabled || uploading,
    noClick: Boolean(value),
  });

  const resolvedUrl = value ? (resolveUrl ? resolveUrl(value) : value) : '';
  const previewKind = detectArtifactPreviewKind(value);
  const displayName =
    uploadedMeta?.originalName || extractArtifactDisplayName(value) || config.labelTh;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}{' '}
          {badgeText && (
            <span style={{ color: badgeColor, fontSize: '0.76rem', fontWeight: 600 }}>
              {badgeText}
            </span>
          )}
        </label>
      )}

      <div
        {...getRootProps()}
        className={`artifact-dropzone ${isDragActive ? 'drag-active' : ''} ${
          value ? 'has-file' : ''
        } ${disabled ? 'is-disabled' : ''}`}
      >
        <input {...getInputProps({ id })} />

        {!value && !uploading && (
          <div className="artifact-dropzone-empty">
            <div className="artifact-dropzone-icon-badge">
              {slot === 'video' ? (
                <Film className="w-5 h-5" />
              ) : slot === 'presentation' ? (
                <Layers className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="artifact-dropzone-copy">
              <div className="artifact-dropzone-title">
                {isDragActive ? 'ปล่อยไฟล์เพื่ออัปโหลดขึ้นเซิร์ฟเวอร์ทันที...' : config.hintTh}
              </div>
              <div className="artifact-dropzone-meta">
                รองรับไฟล์: <strong>{config.extensionsLabel}</strong> • ขนาดสูงสุด{' '}
                <strong>{config.maxSizeLabel}</strong>
              </div>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              className="btn-outline-cyan"
              style={{ padding: '7px 14px', fontSize: '0.8rem', minHeight: '38px', flexShrink: 0 }}
            >
              <Plus className="w-4 h-4" />
              <span>เลือกไฟล์จากเครื่อง</span>
            </button>
          </div>
        )}

        {uploading && (
          <div className="artifact-upload-progress-box" role="status" aria-live="polite">
            <div className="artifact-upload-progress-header">
              <span>กำลังอัปโหลด {config.labelTh} เข้าสู่เซิร์ฟเวอร์...</span>
              <strong>{progress}%</strong>
            </div>
            <div className="artifact-upload-progress-track">
              <div
                className="artifact-upload-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {value && !uploading && (
          <div className="artifact-uploaded-card" onClick={(e) => e.stopPropagation()}>
            <div className="artifact-uploaded-main">
              {previewKind === 'image' && (
                <img
                  src={resolvedUrl}
                  alt={displayName}
                  className="artifact-uploaded-thumb"
                />
              )}

              {previewKind === 'video' && (
                <video
                  src={resolvedUrl}
                  controls
                  preload="metadata"
                  className="artifact-uploaded-video"
                />
              )}

              {previewKind !== 'image' && previewKind !== 'video' && (
                <div className="artifact-uploaded-doc-badge">
                  <FileText className="w-5 h-5" />
                </div>
              )}

              <div className="artifact-uploaded-info">
                <div className="artifact-uploaded-filename">
                  <CheckCircle2
                    className="w-4 h-4"
                    style={{ color: 'var(--emerald-400)', flexShrink: 0 }}
                  />
                  <span>{displayName}</span>
                </div>
                <div className="artifact-uploaded-submeta">
                  {uploadedMeta?.size ? `${formatFileSize(uploadedMeta.size)} • ` : ''}
                  <span>อัปโหลดเข้าเซิร์ฟเวอร์เรียบร้อยแล้ว</span>
                </div>
              </div>
            </div>

            <div className="artifact-uploaded-actions">
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-outline-cyan"
                style={{ padding: '6px 12px', fontSize: '0.76rem', minHeight: '34px', textDecoration: 'none' }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>เปิดดูไฟล์</span>
              </a>
              <button
                type="button"
                disabled={disabled}
                onClick={open}
                className="btn-outline-cyan"
                style={{ padding: '6px 12px', fontSize: '0.76rem', minHeight: '34px' }}
              >
                <span>เปลี่ยนไฟล์</span>
              </button>
              <button
                type="button"
                disabled={disabled}
                aria-label={`ลบไฟล์ ${config.labelTh}`}
                onClick={() => {
                  setUploadedMeta(null);
                  setUploadError('');
                  if (onChange) onChange('');
                }}
                className="member-remove-btn"
                style={{ minWidth: '36px', minHeight: '34px' }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div
          role="alert"
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(225, 29, 72, 0.16)',
            border: '1px solid rgba(251, 113, 133, 0.45)',
            color: '#FDA4AF',
            fontSize: '0.79rem',
          }}
        >
          {uploadError}
        </div>
      )}

      {children}
    </div>
  );
}
