import { useEffect, useState, useRef, useCallback } from 'react'
import Logo from '../components/Logo'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TRANSITION } from '../styles/colors'
import { Room, RoomEvent, Track } from 'livekit-client'

// One participant's video + audio, attached from their LiveKit tracks.
function ParticipantTile({ participant, isLocal, tick }) {
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const [camOff, setCamOff] = useState(true)

  useEffect(() => {
    const camPub = participant.getTrackPublication(Track.Source.Camera)
    const micPub = participant.getTrackPublication(Track.Source.Microphone)
    const hasVideo = !!(camPub && camPub.track && !camPub.isMuted)
    setCamOff(!hasVideo)

    if (hasVideo && videoRef.current) camPub.track.attach(videoRef.current)
    if (!isLocal && micPub && micPub.track && audioRef.current) micPub.track.attach(audioRef.current)

    return () => {
      if (camPub && camPub.track && videoRef.current) camPub.track.detach(videoRef.current)
      if (!isLocal && micPub && micPub.track && audioRef.current) micPub.track.detach(audioRef.current)
    }
  }, [participant, isLocal, tick])

  const name = participant.name || (isLocal ? 'You' : 'Guest')
  const initial = (name || '?').charAt(0).toUpperCase()
  const micPub = participant.getTrackPublication(Track.Source.Microphone)
  const muted = !micPub || micPub.isMuted

  return (
    <div style={{ position: 'relative', background: '#141019', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16 / 10', border: '1px solid rgba(255,255,255,0.08)', minWidth: 0 }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: camOff ? 'none' : 'block', transform: isLocal ? 'scaleX(-1)' : 'none' }}
      />
      {!isLocal && <audio ref={audioRef} autoPlay />}
      {camOff && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#6D28D9,#5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '800', color: '#fff' }}>{initial}</div>
        </div>
      )}
      <div style={{ position: 'absolute', left: '10px', bottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.55)', borderRadius: '50px', padding: '4px 10px' }}>
        {muted && <span style={{ fontSize: '11px' }}>🔇</span>}
        <span style={{ fontSize: '12px', color: '#fff', fontWeight: '600', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}{isLocal ? ' (you)' : ''}</span>
      </div>
    </div>
  )
}

export default function VideoCall() {
  const { roomId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const roomRef = useRef(null)
  const [status, setStatus] = useState('connecting') // connecting | connected | error
  const [errorMsg, setErrorMsg] = useState('')
  const [tiles, setTiles] = useState([])
  const [tick, setTick] = useState(0)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [elapsed, setElapsed] = useState(0)

  const displayName = profile?.full_name || 'Guest'

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  const refresh = useCallback((room) => {
    const list = [{ p: room.localParticipant, isLocal: true }]
    room.remoteParticipants.forEach((p) => list.push({ p, isLocal: false }))
    setTiles(list)
    setTick((t) => t + 1)
  }, [])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    let room

    async function connect() {
      try {
        const { data, error } = await supabase.functions.invoke('livekit-token', {
          body: { room: roomId, displayName },
        })
        if (error) throw new Error('Could not reach the video service.')
        if (!data?.ok) throw new Error(data?.error || 'Could not start the call.')
        if (cancelled) return

        room = new Room({ adaptiveStream: true, dynacast: true })
        roomRef.current = room

        const bump = () => !cancelled && refresh(room)
        room
          .on(RoomEvent.ParticipantConnected, bump)
          .on(RoomEvent.ParticipantDisconnected, bump)
          .on(RoomEvent.TrackSubscribed, bump)
          .on(RoomEvent.TrackUnsubscribed, bump)
          .on(RoomEvent.TrackMuted, bump)
          .on(RoomEvent.TrackUnmuted, bump)
          .on(RoomEvent.LocalTrackPublished, bump)
          .on(RoomEvent.LocalTrackUnpublished, bump)
          .on(RoomEvent.Disconnected, () => { if (!cancelled) navigate(-1) })

        await room.connect(data.url, data.token)
        if (cancelled) { room.disconnect(); return }

        await room.localParticipant.setCameraEnabled(true)
        await room.localParticipant.setMicrophoneEnabled(true)
        setMicOn(true); setCamOn(true)
        setStatus('connected')
        refresh(room)
      } catch (e) {
        if (!cancelled) { setErrorMsg(e?.message || 'Something went wrong.'); setStatus('error') }
      }
    }

    connect()
    return () => {
      cancelled = true
      if (room) room.disconnect()
      roomRef.current = null
    }
  }, [user, roomId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Session timer (runs once connected)
  useEffect(() => {
    if (status !== 'connected') return
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [status])

  const toggleMic = async () => {
    const room = roomRef.current; if (!room) return
    const next = !micOn
    await room.localParticipant.setMicrophoneEnabled(next)
    setMicOn(next); setTick((t) => t + 1)
  }
  const toggleCam = async () => {
    const room = roomRef.current; if (!room) return
    const next = !camOn
    await room.localParticipant.setCameraEnabled(next)
    setCamOn(next); setTick((t) => t + 1)
  }
  const leave = () => {
    if (window.confirm('Leave this session? The call will continue for other participants.')) {
      if (roomRef.current) roomRef.current.disconnect()
      navigate(-1)
    }
  }

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  if (!user) return null

  const cols = tiles.length <= 1 ? 1 : tiles.length <= 4 ? 2 : 3

  return (
    <div style={{ height: '100vh', background: '#0B0B0B', fontFamily: 'Tahoma, Geneva, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* HEADER */}
      <div style={{ background: '#0B0B0B', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/dashboard" style={{ display: 'inline-block', textDecoration: 'none', flexShrink: 0 }}>
            <Logo variant="blue" height={28} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(109,40,217,0.3)', borderRadius: '50px', padding: '4px 12px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: status === 'connected' ? '#6D28D9' : '#6B7280', animation: status === 'connected' ? 'blink 1s ease-in-out infinite' : 'none', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#6D28D9', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{status === 'connected' ? 'Live' : 'Connecting'}</span>
          </div>
          {status === 'connected' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px', padding: '4px 12px' }}>
              <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>⏱</span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9CA3AF', fontWeight: '600', letterSpacing: '0.05em' }}>{formatTime(elapsed)}</span>
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1px' }}>Video Session</div>
          <div style={{ fontSize: '11px', color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{roomId}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#141019', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#FFFFFF' }}>{profile?.full_name?.charAt(0)}</div>
            )}
            <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '500', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name?.split(' ')[0]}</span>
          </div>
          <button onClick={leave} style={{ padding: '8px 18px', background: '#6D28D9', color: '#FFFFFF', border: 'none', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', transition: TRANSITION, boxShadow: '0 2px 8px rgba(0,0,0,0.17)' }}>Leave call</button>
        </div>
      </div>

      {/* STAGE */}
      <div style={{ flex: 1, position: 'relative', background: '#0B0B0B', overflow: 'hidden' }}>

        {status === 'connecting' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '1px solid rgba(255,255,255,0.15)' }}>🎥</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>Connecting to session…</div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>Please allow camera and microphone access when prompted</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0, 1, 2].map((i) => (<div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6D28D9', animation: `dot 1.4s ease-in-out ${i * 0.2}s infinite` }} />))}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', padding: '2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(192,54,44,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>⚠️</div>
            <div style={{ textAlign: 'center', maxWidth: '360px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>Couldn’t join the call</div>
              <div style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.6 }}>{errorMsg}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#6D28D9', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Try again</button>
              <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: 'transparent', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Go back</button>
            </div>
          </div>
        )}

        {status === 'connected' && (
          <div style={{ position: 'absolute', inset: 0, padding: '16px', overflowY: 'auto' }}>
            {tiles.length <= 1 && (
              <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, textAlign: 'center', color: '#6B7280', fontSize: '13px', zIndex: 1 }}>Waiting for others to join…</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '14px', maxWidth: '1100px', margin: '0 auto', minHeight: '100%', alignContent: 'center' }}>
              {tiles.map(({ p, isLocal }) => (
                <ParticipantTile key={p.sid || p.identity} participant={p} isLocal={isLocal} tick={tick} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CONTROL BAR */}
      {status === 'connected' && (
        <div style={{ background: '#0B0B0B', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexShrink: 0 }}>
          <button onClick={toggleMic} title={micOn ? 'Mute' : 'Unmute'} style={ctrlStyle(!micOn)}>
            <span style={{ fontSize: '18px' }}>{micOn ? '🎙️' : '🔇'}</span>
          </button>
          <button onClick={toggleCam} title={camOn ? 'Turn camera off' : 'Turn camera on'} style={ctrlStyle(!camOn)}>
            <span style={{ fontSize: '18px' }}>{camOn ? '📹' : '🚫'}</span>
          </button>
          <button onClick={leave} title="Leave" style={{ ...ctrlStyle(false), background: '#C0362C', width: 'auto', padding: '0 20px', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📞</span>
            <span style={{ fontSize: '13px', color: '#fff', fontWeight: '700' }}>Leave</span>
          </button>
        </div>
      )}

      {/* PRIVACY BAR */}
      <div style={{ background: '#0B0B0B', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '6px 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px' }}>🔒</span>
        <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>Private &amp; secure · Never share personal contact details · Keep all communication on Stuumo</span>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes dot   { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  )
}

function ctrlStyle(active) {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '48px', height: '48px', borderRadius: '50px',
    background: active ? '#C0362C' : 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
    fontFamily: 'inherit', transition: 'background 0.15s',
  }
}
