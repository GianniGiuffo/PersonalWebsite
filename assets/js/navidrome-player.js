(() => {
  const players = document.querySelectorAll('[data-navidrome-player]')

  const formatTime = (value) => {
    if (!Number.isFinite(value) || value < 0) return '0:00'
    const seconds = Math.floor(value % 60).toString().padStart(2, '0')
    const minutes = Math.floor(value / 60)
    return `${minutes}:${seconds}`
  }

  players.forEach((player) => {
    const audio = player.querySelector('audio')
    const toggle = player.querySelector('[data-player-toggle]')
    const range = player.querySelector('[data-player-range]')
    const current = player.querySelector('[data-player-current]')
    const duration = player.querySelector('[data-player-duration]')
    const startAt = Number(player.dataset.startAt || 0)
    let startApplied = false

    if (!audio || !toggle || !range || !current || !duration) return

    const applyStart = () => {
      if (startApplied || !Number.isFinite(audio.duration)) return
      audio.currentTime = Math.min(startAt, Math.max(0, audio.duration - 0.1))
      startApplied = true
    }

    const updateTimeline = () => {
      const total = Number.isFinite(audio.duration) ? audio.duration : Number(audio.dataset.duration || 0)
      range.max = total || 0
      range.value = audio.currentTime || 0
      current.textContent = formatTime(audio.currentTime)
      duration.textContent = formatTime(total)
    }

    toggle.addEventListener('click', async () => {
      if (audio.paused) {
        players.forEach((other) => {
          if (other === player) return
          const otherAudio = other.querySelector('audio')
          if (otherAudio && !otherAudio.paused) otherAudio.pause()
        })

        applyStart()
        try {
          await audio.play()
        } catch (_) {
          player.dataset.playing = 'false'
        }
      } else {
        audio.pause()
      }
    })

    range.addEventListener('input', () => {
      audio.currentTime = Number(range.value)
      startApplied = true
      updateTimeline()
    })

    audio.addEventListener('loadedmetadata', () => {
      applyStart()
      updateTimeline()
    })
    audio.addEventListener('durationchange', updateTimeline)
    audio.addEventListener('timeupdate', updateTimeline)
    audio.addEventListener('play', () => {
      player.dataset.playing = 'true'
      toggle.setAttribute('aria-label', player.dataset.pauseLabel)
    })
    audio.addEventListener('pause', () => {
      player.dataset.playing = 'false'
      toggle.setAttribute('aria-label', player.dataset.playLabel)
    })
    audio.addEventListener('ended', () => {
      startApplied = false
      player.dataset.playing = 'false'
    })
    audio.addEventListener('error', () => {
      player.dataset.playing = 'false'
      toggle.disabled = true
      toggle.setAttribute('aria-label', player.dataset.unavailableLabel)
    })

    current.textContent = formatTime(startAt)
    duration.textContent = formatTime(Number(audio.dataset.duration || 0))
    range.value = startAt
  })
})()
