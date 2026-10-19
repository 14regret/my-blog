import { useState, useRef, useEffect } from 'react'

// 配置歌单（这里的名字你可以随便改）
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
  const [currentIndex, setCurrentIndex] = useState(0) 
  const audioRef = useRef(null)

  // 监听歌曲切换：如果当前是播放状态，自动播放下一首
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      // 延迟 100ms 等待浏览器加载新的 src，然后播放
      const timer = setTimeout(() => {
        audioRef.current.play().catch(err => {
          console.log("浏览器拦截了自动播放，请重新点击唱片:", err)
          setIsPlaying(false) // 如果被拦截，将状态设为暂停
        })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, isPlaying])

  // 点击唱片：播放/暂停
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // 播放结束：自动切下一首
  const handleEnded = () => {
    // 计算下一首的索引（如果到结尾了，就回到第一首）
    setCurrentIndex((prevIndex) => (prevIndex + 1) % playlist.length)
    // 注意：这里不要改变 isPlaying 的状态，让它保持 true 触发上面的 useEffect
  }

  // 手动下拉切歌
  const handleSongChange = (e) => {
    const newIndex = Number(e.target.value)
    setCurrentIndex(newIndex)
    // 切换后保持当前的播放状态不变
  }

  return (
    <div className="music-player">
      <audio 
        ref={audioRef} 
        src={playlist[currentIndex].url} 
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div 
        className={`music-disc ${isPlaying ? 'rotating' : ''}`} 
        onClick={togglePlay}
        title={isPlaying ? "暂停音乐" : "播放音乐"}
      >
        💿
      </div>
      
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