import { useState, useRef } from 'react'

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="music-player">
      {/* 隐藏原生音频标签，通过 ref 控制 */}
      <audio 
        ref={audioRef} 
        src="/bgm.mp3" 
        loop 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* 点击触发的唱片图标 */}
      <div 
        className={`music-disc ${isPlaying ? 'rotating' : ''}`} 
        onClick={togglePlay}
        title={isPlaying ? "暂停音乐" : "播放音乐"}
      >
        💿
      </div>
      
      <span style={{ color: '#cbd5e1', fontSize: '12px', marginLeft: '10px' }}>
        {isPlaying ? '正在播放...' : '点击播放音乐'}
      </span>
    </div>
  )
}