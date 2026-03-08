import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useReels, type Reel } from '../hooks/useReels'
import './ReelsPage.css'

export default function ReelsPage() {
  const { user } = useAuth()
  const { list, loading, error, uploading, upload } = useReels()
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

  const handleUploadClick = () => {
    if (!user) return
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
      if (previewRef.current) previewRef.current.srcObject = stream
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

  const handleSubmitUpload = async () => {
    if (!selectedFile) {
      alert('영상 파일을 선택하거나 카메라로 촬영해 주세요.')
      return
    }
    const success = await upload(selectedFile, title || undefined)
    if (success) {
      setModalOpen(false)
      setTitle('')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      alert('업로드에 실패했습니다.')
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

      <div className="reels-feed">
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
            <ReelSlide key={reel.id} reel={reel} />
          ))
        )}
      </div>

      {modalOpen && (
        <div className="reels-modal-overlay" onClick={handleCloseModal}>
          <div className="reels-modal reels-modal-wide" onClick={(e) => e.stopPropagation()}>
            <h3 className="reels-modal-title">영상 업로드</h3>

            {!cameraMode ? (
              <>
                <p className="reels-modal-label">파일에서 선택</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="reels-modal-file"
                />
                <p className="reels-modal-divider">또는</p>
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

function ReelSlide({ reel }: { reel: Reel }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div className="reels-slide">
      <video
        ref={videoRef}
        src={reel.video_url}
        className="reels-video"
        playsInline
        muted
        loop
        preload="metadata"
        onLoadedData={() => videoRef.current?.play().catch(() => {})}
      />
      {reel.title && <p className="reels-slide-title">{reel.title}</p>}
    </div>
  )
}
