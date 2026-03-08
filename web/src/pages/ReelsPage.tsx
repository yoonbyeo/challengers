import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useReels, type Reel } from '../hooks/useReels'
import { useReelLikes } from '../hooks/useReelLikes'
import { useSaveReel } from '../hooks/useSaveReel'
import { useFollow } from '../hooks/useFollow'
import { useAuthorProfile } from '../hooks/useAuthorProfile'
import { useReelComments } from '../hooks/useReelComments'
import './ReelsPage.css'

export default function ReelsPage() {
  const { user } = useAuth()
  const { list, loading, error, uploading, upload, deleteReel, refresh, clearError } = useReels()
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [cameraMode, setCameraMode] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const previewRef = useRef<HTMLVideoElement>(null)
  const feedRef = useRef<HTMLDivElement>(null)

  const handleUploadClick = () => {
    if (!user) return
    clearError()
    setModalOpen(true)
    setTitle('')
    setSelectedFile(null)
    setCameraMode(false)
    setCameraError(null)
    setRecording(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      setCameraMode(false)
    } else setSelectedFile(null)
  }

  const startCamera = async () => {
    setCameraError(null)
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      setCameraMode(true)
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : '카메라/마이크 접근이 거부되었습니다.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (previewRef.current) previewRef.current.srcObject = null
    setCameraMode(false)
    setRecording(false)
  }

  const startRecording = () => {
    if (!streamRef.current) return
    recordedChunksRef.current = []
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'
    const recorder = new MediaRecorder(streamRef.current, { mimeType })
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType })
      const file = new File([blob], `recorded-${Date.now()}.webm`, { type: blob.type })
      setSelectedFile(file)
      stopCamera()
    }
    recorder.start(1000)
    setRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
  }

  useEffect(() => {
    if (!modalOpen) {
      stopCamera()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current = null
      }
    }
  }, [modalOpen])

  useEffect(() => {
    if (!cameraMode || !streamRef.current) return
    const video = previewRef.current
    if (video) {
      video.srcObject = streamRef.current
      video.play().catch(() => {})
    }
    return () => {
      if (video) video.srcObject = null
    }
  }, [cameraMode])

  const handleSubmitUpload = async () => {
    if (!selectedFile) {
      alert('영상 파일을 선택하거나 카메라로 촬영해 주세요.')
      return
    }
    const result = await upload(selectedFile, title || undefined)
    if (result.success) {
      setModalOpen(false)
      setTitle('')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      alert(`업로드에 실패했습니다. ${result.message || ''}`.trim())
    }
  }

  const handleCloseModal = () => {
    if (!uploading) {
      stopCamera()
      setModalOpen(false)
    }
  }

  return (
    <div className="reels-page">
      {user && (
        <button
          type="button"
          className="reels-upload-btn"
          onClick={handleUploadClick}
          disabled={uploading}
          aria-label="영상 업로드"
        >
          {uploading ? '업로드 중...' : '영상 업로드'}
        </button>
      )}

      <div ref={feedRef} className="reels-feed">
        {loading ? (
          <div className="reels-slide reels-loading">
            <p>로딩 중...</p>
          </div>
        ) : error ? (
          <div className="reels-slide reels-error">
            <p>{error}</p>
          </div>
        ) : list.length === 0 ? (
          <div className="reels-slide reels-empty">
            <p>아직 올라온 영상이 없습니다.</p>
            {user && <p className="reels-empty-hint">영상 업로드 버튼으로 첫 영상을 올려 보세요.</p>}
          </div>
        ) : (
          list.map((reel) => (
            <ReelSlide
              key={reel.id}
              reel={reel}
              feedRef={feedRef}
              currentUserId={user?.id ?? null}
              onDelete={deleteReel}
              onDeleted={refresh}
            />
          ))
        )}
      </div>

      {modalOpen && (
        <div className="reels-modal-overlay" onClick={handleCloseModal}>
          <div className="reels-modal reels-modal-wide" onClick={(e) => e.stopPropagation()}>
            <h3 className="reels-modal-title">영상 업로드</h3>

            {!cameraMode ? (
              <>
                <div className="reels-modal-section">
                  <p className="reels-modal-label">파일에서 선택</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="reels-modal-file"
                  />
                </div>
                <div className="reels-modal-divider">
                  <span className="reels-modal-divider-line" />
                  <span className="reels-modal-divider-text">또는</span>
                  <span className="reels-modal-divider-line" />
                </div>
                <button type="button" className="reels-modal-camera-btn" onClick={startCamera}>
                  카메라로 촬영
                </button>
              </>
            ) : (
              <div className="reels-camera-box">
                <video ref={previewRef} className="reels-camera-preview" autoPlay muted playsInline />
                {cameraError && <p className="reels-camera-error">{cameraError}</p>}
                <div className="reels-camera-actions">
                  {!recording ? (
                    <>
                      <button type="button" className="reels-modal-cancel" onClick={stopCamera}>
                        취소
                      </button>
                      <button type="button" className="reels-modal-record-btn" onClick={startRecording}>
                        촬영 시작
                      </button>
                    </>
                  ) : (
                    <button type="button" className="reels-modal-stop-btn" onClick={stopRecording}>
                      촬영 종료
                    </button>
                  )}
                </div>
              </div>
            )}

            {error && <p className="reels-modal-error">{error}</p>}
            {selectedFile && (
              <>
                <p className="reels-modal-filename">{selectedFile.name}</p>
                <input
                  type="text"
                  placeholder="제목 (선택)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="reels-modal-input"
                />
                <div className="reels-modal-actions">
                  <button type="button" className="reels-modal-cancel" onClick={handleCloseModal} disabled={uploading}>
                    취소
                  </button>
                  <button type="button" className="reels-modal-submit" onClick={handleSubmitUpload} disabled={uploading}>
                    {uploading ? '업로드 중...' : '업로드'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ReelSlide({
  reel,
  feedRef,
  currentUserId,
  onDelete,
  onDeleted,
}: {
  reel: Reel
  feedRef: React.RefObject<HTMLDivElement | null>
  currentUserId: string | null
  onDelete?: (reelId: string) => Promise<{ success: boolean; message?: string }>
  onDeleted?: () => void
}) {
  const slideRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [commentOpen, setCommentOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const { likeCount, isLiked, toggleLike, toggling: likeToggling } = useReelLikes(reel.id)
  const { isSaved, toggleSave, toggling: saveToggling } = useSaveReel(reel.id)
  const { isFollowing, toggleFollow, toggling: followToggling } = useFollow(reel.user_id)
  const { displayName } = useAuthorProfile(reel.user_id)
  const { comments, loading: commentsLoading, submitting, addComment, deleteComment } = useReelComments(reel.id)
  const isOwn = currentUserId === reel.user_id

  useEffect(() => {
    const feed = feedRef.current
    const slide = slideRef.current
    const video = videoRef.current
    if (!feed || !slide || !video) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== slide) return
          if (entry.isIntersecting) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { root: feed, threshold: 0.5 }
    )
    observer.observe(slide)
    return () => observer.disconnect()
  }, [feedRef, reel.id])

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}?reel=${reel.id}`
    if (navigator.share) {
      navigator.share({ title: reel.title || '릴스', url }).catch(() => {
        navigator.clipboard.writeText(url).then(() => alert('링크가 복사되었습니다.'))
      })
    } else {
      navigator.clipboard.writeText(url).then(() => alert('링크가 복사되었습니다.'))
    }
  }, [reel.id, reel.title])

  const handleDelete = useCallback(async () => {
    if (!onDelete || !confirm('이 영상을 삭제할까요?')) return
    const result = await onDelete(reel.id)
    if (result.success) onDeleted?.()
    else alert(result.message || '삭제에 실패했습니다.')
  }, [reel.id, onDelete, onDeleted])

  const handleSubmitComment = useCallback(async () => {
    const result = await addComment(commentText)
    if (result.success) setCommentText('')
    else alert(result.message || '댓글 작성에 실패했습니다.')
  }, [addComment, commentText])

  return (
    <div ref={slideRef} className="reels-slide">
      <video
        ref={videoRef}
        src={reel.video_url}
        className="reels-video"
        playsInline
        muted
        loop
        preload="metadata"
      />
      <div className="reels-slide-info">
        <div className="reels-slide-author">
          <span className="reels-slide-author-avatar">{displayName.charAt(0)}</span>
          <span className="reels-slide-author-name">{displayName}</span>
          {!isOwn && currentUserId && (
            <button
              type="button"
              className="reels-slide-follow-btn"
              onClick={() => toggleFollow()}
              disabled={followToggling}
            >
              {isFollowing ? '팔로우 중' : '팔로우'}
            </button>
          )}
        </div>
        {reel.title && <p className="reels-slide-title">{reel.title}</p>}
      </div>
      <div className="reels-slide-actions">
        <button
          type="button"
          className="reels-action-btn"
          onClick={() => toggleLike()}
          disabled={likeToggling}
          aria-label="좋아요"
        >
          <span className="reels-action-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span className="reels-action-count">{likeCount}</span>
        </button>
        <button
          type="button"
          className="reels-action-btn"
          onClick={() => setCommentOpen((o) => !o)}
          aria-label="댓글"
        >
          <span className="reels-action-icon">💬</span>
          <span className="reels-action-count">{comments.length}</span>
        </button>
        <button type="button" className="reels-action-btn" onClick={handleShare} aria-label="공유">
          <span className="reels-action-icon">↗️</span>
          <span>공유</span>
        </button>
        <button
          type="button"
          className="reels-action-btn"
          onClick={() => toggleSave()}
          disabled={saveToggling}
          aria-label="저장"
        >
          <span className="reels-action-icon">{isSaved ? '🔖' : '📑'}</span>
          <span>{isSaved ? '저장됨' : '저장'}</span>
        </button>
        {isOwn && onDelete && (
          <button type="button" className="reels-action-btn reels-action-delete" onClick={handleDelete} aria-label="삭제">
            <span className="reels-action-icon">🗑️</span>
            <span>삭제</span>
          </button>
        )}
      </div>

      {commentOpen && (
        <div className="reels-comment-panel">
          <div className="reels-comment-header">
            <span>댓글 {comments.length}개</span>
            <button type="button" className="reels-comment-close" onClick={() => setCommentOpen(false)} aria-label="닫기">
              ✕
            </button>
          </div>
          <div className="reels-comment-list">
            {commentsLoading ? (
              <p className="reels-comment-loading">로딩 중...</p>
            ) : comments.length === 0 ? (
              <p className="reels-comment-empty">아직 댓글이 없습니다.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="reels-comment-item">
                  <div className="reels-comment-body">
                    <span className="reels-comment-author">{c.author_display_name}</span>
                    <span className="reels-comment-text">{c.body}</span>
                  </div>
                  {currentUserId === c.user_id && (
                    <button
                      type="button"
                      className="reels-comment-delete"
                      onClick={() => deleteComment(c.id)}
                      aria-label="댓글 삭제"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {currentUserId && (
            <div className="reels-comment-input-wrap">
              <input
                type="text"
                className="reels-comment-input"
                placeholder="댓글 입력..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
              />
              <button
                type="button"
                className="reels-comment-submit"
                onClick={handleSubmitComment}
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? '등록 중...' : '등록'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
