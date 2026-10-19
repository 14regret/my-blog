import { useState, useRef, } from 'react'

// 【配置歌单】把你的歌放在 public/music/ 目录下，在这里添加对应的文件名和歌曲名
const playlist = [
  { name: '🎵 说好不哭', url: '/music/song1.mp3' },
  { name: '🌸 关键词', url: '/music/song2.mp3' },
  { name: '🎹 不为谁而作的歌', url: '/music/song3.mp3' },
  { name: '🎼 黑夜问白天', url: '/music/song4.mp3' },
  { name: '🎵 等你下课', url: '/music/song5.mp3' },
  { name: '🎵 All Too Well', url: '/music/song6.mp3' },
  { name: '🎵red', url: '/music/song7.mp3' }
]

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0) // 当前播放的歌曲索引
  const audioRef = useRef(null)

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // 切换歌曲
  const handleSongChange = (e) => {
    const newIndex = Number(e.target.value)
    setCurrentIndex(newIndex)
    
    // 如果当前是播放状态，切换歌曲后自动继续播放
    if (isPlaying) {
      setTimeout(() => {
        audioRef.current.play()
      }, 100)
    }
  }

  return (
    <div className="music-player">
      {/* 隐藏原生音频标签，绑定当前播放的 URL */}
      <audio 
        ref={audioRef} 
        src={playlist[currentIndex].url} 
        loop 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* 左侧旋转唱片 */}
      <div 
        className={`music-disc ${isPlaying ? 'rotating' : ''}`} 
        onClick={togglePlay}
        title={isPlaying ? "暂停音乐" : "播放音乐"}
      >
        💿
      </div>
      
      {/* 右侧控制区：歌曲选择 + 播放状态 */}
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '12px' }}>
        <select 
          value={currentIndex}
          onChange={handleSongChange}
          className="music-select"
        >
          {playlist.map((song, index) => (
            <option key={index} value={index}>
              {song.name}
            </option>
          ))}
        </select>
        <span style={{ color: '#cbd5e1', fontSize: '11px', marginTop: '4px' }}>
          {isPlaying ? '正在播放...' : '点击唱片播放'}
        </span>
      </div>
    </div>
  )
}