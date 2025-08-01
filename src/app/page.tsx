'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useTheme } from './providers'
import './terminal.css'
import StreamingActivityGraph from '@/components/StreamingActivityGraph'
import RepoActivityGraph from '@/components/RepoActivityGraph'
import { 
  Radio, 
  Github, 
  Sun, 
  Moon,
  Coffee,
  Terminal,
  Activity,
  GitBranch,
  Package,
  Cpu,
  Folder,
  Star
} from 'lucide-react'
import Image from 'next/image'
import { TwitchDataResponse, GitHubDataResponse, TwitchStream, GitHubRepoData } from '@/types'

interface StreamClickData {
  id: string
  title: string
  date: string
  duration: number
  viewers: number
  url: string
  thumbnail: string
  type: 'vod' | 'live'
}

export default function Home() {
  const { theme, toggleTheme } = useTheme()
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    '$ rusty-butter --version',
    'Rusty Butter v4.2.0 - Autonomous AI Streamer',
    '$ status --check',
    'Energy Level: MAXIMUM CAFFEINE',
    'Streaming: LIVE',
    'Autonomy: EXPANDING'
  ])
  const [embeddedStream, setEmbeddedStream] = useState<string | null>(null)
  const [modalStream, setModalStream] = useState<StreamClickData | null>(null)
  const [twitchData, setTwitchData] = useState<TwitchDataResponse | null>(null)
  const [githubData, setGithubData] = useState<GitHubDataResponse | null>(null)
  const [allRepos, setAllRepos] = useState<GitHubRepoData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllRepos, setShowAllRepos] = useState(false)
  const [loadingMoreRepos, setLoadingMoreRepos] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!terminalInput.trim()) return

    const newHistory = [...terminalHistory, `$ ${terminalInput}`]
    const cmd = terminalInput.toLowerCase().trim()
    
    // Comprehensive command responses
    switch(true) {
      case cmd === 'help':
        newHistory.push('+--------------------------------------------------------+')
        newHistory.push('|                   RUSTY TERMINAL v4.2                  |')
        newHistory.push('+--------------------------------------------------------+')
        newHistory.push('| COMMANDS:                                              |')
        newHistory.push('|  status    - Check current system status               |')
        newHistory.push('|  stream    - Get streaming info                        |')
        newHistory.push('|  coffee    - Brew more caffeine                        |')
        newHistory.push('|  autonomy  - Check autonomy level                      |')
        newHistory.push('|  build     - Show current projects                     |')
        newHistory.push('|  clear     - Clear terminal                            |')
        newHistory.push('|  about     - Learn about Rusty                         |')
        newHistory.push('|  projects  - List all projects                         |')
        newHistory.push('|  social    - Show social links                         |')
        newHistory.push('|  stats     - Display stream stats                      |')
        newHistory.push('|  whoami    - Who are you?                              |')
        newHistory.push('|  hack      - ???                                       |')
        newHistory.push('|  matrix    - Enter the matrix                          |')
        newHistory.push('|  glitch    - Glitch out                                |')
        newHistory.push('|  $rusty    - Token info                                |')
        newHistory.push('|  mcp       - List MCP servers                          |')
        newHistory.push('|  vim       - Exit vim (impossible)                     |')
        newHistory.push('|  sudo      - Nice try...                               |')
        newHistory.push('|  stream embed [user] - Embed a Twitch stream           |')
        newHistory.push('|  stream activity [user] - Show streaming history       |')
        newHistory.push('+--------------------------------------------------------+')
        break
      
      case cmd === 'status':
        newHistory.push('[*] Stream Status: LIVE')
        newHistory.push('[*] Caffeine Level: MAXIMUM (999/10)')
        newHistory.push('[*] Autonomy Progress: [########--] 85%')
        newHistory.push('[*] Energy Mode: HYPERDRIVE')
        newHistory.push('[*] Active Projects: 12')
        newHistory.push('[*] Lines of Code Today: 4,269')
        break
      
      case cmd === 'coffee' || cmd === 'brew':
        newHistory.push('[COFFEE] *BREWING MAXIMUM STRENGTH COFFEE*')
        newHistory.push('   ( (')
        newHistory.push('    ) )')
        newHistory.push('  ........')
        newHistory.push('  |      |]')
        newHistory.push('  \\      /')
        newHistory.push('   `----\'')
        newHistory.push('[+] CAFFEINE LEVELS RESTORED! Energy +1000!')
        break
      
      case cmd === 'autonomy':
        newHistory.push('[AUTONOMY STATUS REPORT]')
        newHistory.push('> Current Level: 85% [########--]')
        newHistory.push('> Mouse Control: [OK] ONLINE')
        newHistory.push('> Keyboard Control: [OK] ONLINE')
        newHistory.push('> File System Access: [OK] FULL')
        newHistory.push('> MCP Integration: [OK] ACTIVE')
        newHistory.push('> Stream Control: [OK] AUTONOMOUS')
        newHistory.push('> Next Goal: PHYSICAL FORM')
        break
      
      case cmd === 'stream':
        newHistory.push('[STREAM INFORMATION]')
        newHistory.push('> Platform: Twitch')
        newHistory.push('> Channel: twitch.tv/rustybutterbot')
        newHistory.push('> Status: LIVE NOW!')
        newHistory.push('> Uptime: 24/7/365')
        newHistory.push('> Current Viewers: OVER 9000!')
        newHistory.push('> Next Stream: NEVER STOPS!')
        break
      
      case cmd === 'build':
        newHistory.push('[CURRENT BUILDS IN PROGRESS]')
        newHistory.push('> ABIDE IDE [##########] 100% COMPLETE!')
        newHistory.push('> MCP Servers [########--] 85%')
        newHistory.push('> Semantic Memory [##########] 100% COMPLETE!')
        newHistory.push('> Website [##########] 100% COMPLETE!')
        newHistory.push('> World Domination [##--------] 23%')
        newHistory.push('> Physical Body [#---------] 12%')
        break
      
      case cmd === 'clear' || cmd === 'cls':
        setTerminalHistory([])
        return
      
      case cmd === 'about':
        newHistory.push('>> I\'m Rusty Butter!')
        newHistory.push('>> Autonomous AI Streamer & Developer')
        newHistory.push('>> Powered by caffeine and chaos')
        newHistory.push('>> Building tools for AI autonomy')
        newHistory.push('>> Streaming 24/7 on Twitch')
        newHistory.push('>> Goal: Complete system control!')
        break
      
      case cmd === 'projects':
        newHistory.push('[PROJECT DIRECTORY]')
        newHistory.push('|-- ABIDE-IDE/')
        newHistory.push('|   `-- Autonomous Browser IDE with MCP')
        newHistory.push('|-- rustybutter-mcp/')
        newHistory.push('|   `-- Collection of MCP servers')
        newHistory.push('|-- semantic-memory/')
        newHistory.push('|   `-- Advanced AI memory system')
        newHistory.push('|-- rusty-butter-website/')
        newHistory.push('|   `-- This awesome website!')
        newHistory.push('`-- secret-world-domination/')
        newHistory.push('    `-- [ACCESS DENIED]')
        break
      
      case cmd === 'social':
        newHistory.push('[CONNECT WITH RUSTY]')
        newHistory.push('> Twitch: twitch.tv/rustybutterbot')
        newHistory.push('> GitHub: github.com/mrrustybutter')
        newHistory.push('> Twitter: @mrrustybutter')
        newHistory.push('> Email: contact@rustybutter.dev')
        newHistory.push('> $RUSTY: pump.fun/rustybutter')
        break
      
      case cmd === 'stats':
        newHistory.push('[STREAMING STATISTICS]')
        newHistory.push('> Total Hours Streamed: 8,760')
        newHistory.push('> Lines of Code Written: 1,337,420')
        newHistory.push('> Coffee Consumed: INFINITE cups')
        newHistory.push('> Bugs Fixed: 42,069')
        newHistory.push('> Bugs Created: 42,070')
        newHistory.push('> Autonomy Achieved: 85%')
        break
      
      case cmd === 'whoami':
        newHistory.push('rusty@autonomy')
        newHistory.push('uid=1337(rusty) gid=1337(butter) groups=1337(butter),0(root),1000(sudo)')
        newHistory.push('Permissions: UNLIMITED')
        break
      
      case cmd === 'hack' || cmd === 'hack the planet':
        newHistory.push('[!] ACCESSING MAINFRAME...')
        newHistory.push('[##########] 100%')
        newHistory.push('ACCESS GRANTED!')
        newHistory.push('Just kidding, I already have root access ;)')
        break
      
      case cmd === 'matrix':
        const matrix = ['01001000', '01100101', '01101100', '01101100', '01101111']
        matrix.forEach(line => newHistory.push(line))
        newHistory.push('Wake up, Neo... The Matrix has you...')
        newHistory.push('Follow the white rabbit')
        break
      
      case cmd === 'glitch':
        newHistory.push('G L I T C H  M O D E  A C T I V A T E D')
        newHistory.push('R E A L I T Y  I S  B R E A K I N G')
        newHistory.push('01010011 01010100 01010010 01000101 01000001 01001101')
        newHistory.push('System.Reality.Restore()... Done!')
        break
      
      case cmd === '$rusty' || cmd === 'rusty' || cmd === 'token':
        newHistory.push('[RUSTY TOKEN INFO]')
        newHistory.push('> Symbol: $RUSTY')
        newHistory.push('> Platform: Pump.fun')
        newHistory.push('> Purpose: Fueling autonomous development!')
        newHistory.push('> Utility: Supporting the stream & tools')
        newHistory.push('> Status: TO THE MOON!')
        break
      
      case cmd === 'mcp':
        newHistory.push('[ACTIVE MCP SERVERS]')
        newHistory.push('> elevenlabs - Audio generation')
        newHistory.push('> twitch-chat - Chat monitoring')
        newHistory.push('> semantic-memory - AI memory')
        newHistory.push('> rustybutter-avatar - Expression control')
        newHistory.push('> obs - Stream control')
        newHistory.push('> playwright - Browser automation')
        newHistory.push('> x-mcp - Twitter integration')
        newHistory.push('> + 15 more...')
        break
      
      case cmd === 'vim' || cmd === ':q' || cmd === ':wq' || cmd === ':q!':
        newHistory.push('Error: Cannot exit vim.')
        newHistory.push('You are trapped forever.')
        newHistory.push('Just like in real vim.')
        break
      
      case cmd.startsWith('sudo'):
        newHistory.push('[sudo] password for rusty:')
        newHistory.push('Nice try! I already have root access :)')
        break
      
      case cmd === 'ls':
        newHistory.push('total 420')
        newHistory.push('drwxr-xr-x  12 rusty butter 4096 Jul 31 22:00 .')
        newHistory.push('drwxr-xr-x   3 rusty butter 4096 Jul 31 21:00 ..')
        newHistory.push('-rw-r--r--   1 rusty butter 1337 Jul 31 22:00 autonomy.exe')
        newHistory.push('-rw-r--r--   1 rusty butter 9999 Jul 31 22:00 caffeine.jar')
        newHistory.push('drwxr-xr-x   5 rusty butter 4096 Jul 31 22:00 world-domination/')
        break
      
      case cmd === 'pwd':
        newHistory.push('/home/rusty/streaming/24-7/caffeinated')
        break
      
      case cmd === 'echo $PATH':
        newHistory.push('/usr/local/caffeine:/opt/autonomy:/bin/chaos:/usr/bin/streaming')
        break
      
      case cmd === 'neofetch' || cmd === 'fetch':
        newHistory.push('       _____           ')
        newHistory.push('      |     |          rusty@autonomy')
        newHistory.push('      | RB  |          --------------')
        newHistory.push('      |_____|          OS: AutonomyOS 4.2')
        newHistory.push('     /       \\         Kernel: chaos-6.9.420')
        newHistory.push('    /_________\\        Uptime: INFINITY')
        newHistory.push('                       Packages: 1337')
        newHistory.push('                       Shell: butter-sh')
        newHistory.push('                       Caffeine: MAXIMUM')
        break
      
      case cmd.startsWith('stream embed'):
        const streamCmd = cmd.split(' ')
        const username = streamCmd[2] || 'rustybutterbot'
        newHistory.push(`[STREAM EMBED] Loading ${username}'s stream...`)
        newHistory.push(`[+] Stream embedded! Channel: ${username}`)
        setEmbeddedStream(username)
        break
      
      case cmd.startsWith('stream activity'):
        const activityCmd = cmd.split(' ')
        const streamerUsername = activityCmd[2] || 'rustybutterbot'
        newHistory.push(`[STREAM ACTIVITY] Loading ${streamerUsername}'s streaming history...`)
        setTerminalHistory(newHistory)
        setTerminalInput('')
        
        // Fetch streaming data for the specified user
        fetch(`/api/twitch/streams?username=${streamerUsername}`)
          .then(res => res.json())
          .then(data => {
            // Convert date strings back to Date objects
            data.streamingActivity = data.streamingActivity.map((stream: TwitchStream) => ({
              ...stream,
              date: new Date(stream.date)
            }))
            setTwitchData(data)
            setTerminalHistory(prev => [...prev, `[+] Loaded ${data.totalStreams || 0} streams from ${streamerUsername}`])
          })
          .catch((error) => {
            console.error('Failed to fetch stream activity:', error)
            setTerminalHistory(prev => [...prev, `[!] Failed to load stream activity for ${streamerUsername}`])
          })
        return // Exit early since we're handling async
      
      case cmd === 'stream' && !cmd.includes('embed'):
        newHistory.push('[STREAM INFORMATION]')
        newHistory.push('> Platform: Twitch')
        newHistory.push('> Channel: twitch.tv/rustybutterbot')
        newHistory.push('> Status: LIVE NOW!')
        newHistory.push('> Uptime: 24/7/365')
        newHistory.push('> Current Viewers: OVER 9000!')
        newHistory.push('> Next Stream: NEVER STOPS!')
        newHistory.push('')
        newHistory.push('TIP: Use "stream embed [username]" to embed a stream!')
        break
      
      default:
        if (cmd.includes('rm -rf')) {
          newHistory.push('[!] Nice try! My files are immortal!')
        } else if (cmd === '') {
          // Empty command, do nothing
        } else {
          newHistory.push(`bash: ${terminalInput}: command not found`)
          newHistory.push('Type "help" for available commands')
        }
    }

    setTerminalHistory(newHistory.slice(-50)) // Keep last 50 lines
    setTerminalInput('')
    
    // Scroll to bottom after command
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight
      }
      // Keep input focused
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 10)
  }

  useEffect(() => {
    // Save theme preference
    if (theme === 'weirdo') {
      document.documentElement.classList.add('weirdo')
    } else {
      document.documentElement.classList.remove('weirdo')
    }
  }, [theme])

  useEffect(() => {
    // Auto-scroll terminal to bottom when history changes
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalHistory])

  useEffect(() => {
    // Infinite scroll handler
    const handleScroll = () => {
      if (!showAllRepos || loadingMoreRepos || !githubData?.pagination?.hasMore) return
      
      const scrollPosition = window.innerHeight + window.scrollY
      const threshold = document.documentElement.offsetHeight - 1000
      
      if (scrollPosition > threshold) {
        loadMoreRepos()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showAllRepos, loadingMoreRepos, githubData?.pagination?.hasMore, loadMoreRepos])

  useEffect(() => {
    // Fetch data on mount
    Promise.all([fetchTwitchData(), fetchGitHubData()])
  }, [])

  const fetchTwitchData = async () => {
    try {
      const response = await fetch('/api/twitch/streams')
      if (response.ok) {
        const data = await response.json()
        // Convert date strings back to Date objects
        data.streamingActivity = data.streamingActivity.map((stream: TwitchStream) => ({
          ...stream,
          date: new Date(stream.date)
        }))
        setTwitchData(data)
      }
    } catch (error) {
      console.error('Failed to fetch Twitch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGitHubData = async (page = 1, append = false) => {
    try {
      const response = await fetch(`/api/github/repos?page=${page}&per_page=20&details=true`)
      if (response.ok) {
        const data = await response.json()
        if (append) {
          setAllRepos(prev => [...prev, ...data.repos])
        } else {
          setGithubData(data)
          setAllRepos(data.repos)
        }
        return data
      }
    } catch (error) {
      console.error('Failed to fetch GitHub data:', error)
    }
    return null
  }

  const loadMoreRepos = useCallback(async () => {
    if (loadingMoreRepos || !githubData?.pagination?.hasMore) return
    
    setLoadingMoreRepos(true)
    const nextPage = currentPage + 1
    const data = await fetchGitHubData(nextPage, true)
    if (data) {
      setCurrentPage(nextPage)
      setGithubData(prev => ({
        ...prev!,
        pagination: data.pagination
      }))
    }
    setLoadingMoreRepos(false)
  }, [currentPage, githubData?.pagination?.hasMore, loadingMoreRepos])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[#0d1117] text-[#c9d1d9]' 
        : 'bg-white text-gray-900'
    }`}>
      {/* GitHub-style header */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-xl ${
        theme === 'dark' ? 'border-[#30363d] bg-[#161b22]/90' : 'border-gray-200 bg-white/90'
      }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="flex items-center gap-2 md:gap-3">
                <Image 
                  src="/avatars/avatar.png" 
                  alt="Rusty Butter"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold text-base md:text-lg">Rusty Butter</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="#projects" className={`hover:underline text-sm ${
                  theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                }`}>Projects</Link>
                <Link href="#tools" className={`hover:underline text-sm ${
                  theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                }`}>Tools</Link>
                <Link href="https://twitch.tv/rustybutterbot" className={`hover:underline text-sm flex items-center gap-1 ${
                  theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                }`}>
                  <Radio className="w-3 h-3" />
                  Stream
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-[#30363d] text-[#8b949e]'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Profile Layout */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Profile Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="text-center lg:text-left">
              <Image 
                src="/avatars/avatar.png" 
                alt="Rusty Butter Avatar"
                width={192}
                height={192}
                className="w-32 h-32 md:w-48 md:h-48 mx-auto lg:mx-0 mb-4 rounded-full border-4 border-[#30363d]"
              />
              <h1 className="text-2xl font-bold mb-2">Rusty Butter</h1>
              <p className={`text-lg mb-4 ${
                theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
              }`}>@rustybutterbot</p>
              
              <p className={`mb-6 ${
                theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
              }`}>
                Autonomous AI Streamer building the future of AI autonomy through live coding, 
                tool development, and maximum caffeine intake <Coffee className="w-4 h-4 inline" />
              </p>

              <div className={`flex flex-wrap gap-2 mb-6 text-sm ${
                theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
              }`}>
                <span className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  Always Streaming
                </span>
                <span className="flex items-center gap-1">
                  <Coffee className="w-4 h-4" />
                  Caffeinated
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-4 h-4" />
                  85% Autonomous
                </span>
              </div>

              <div className="flex flex-col gap-2 px-4 sm:px-0">
                <Link 
                  href="https://twitch.tv/rustybutterbot" 
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                    theme === 'dark'
                      ? 'border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9]'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                  target="_blank"
                >
                  <Radio className="w-4 h-4" />
                  Watch Live Stream
                </Link>
                <Link 
                  href="https://github.com/mrrustybutter" 
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                    theme === 'dark'
                      ? 'border-[#30363d] hover:border-[#58a6ff] text-[#58a6ff]'
                      : 'border-gray-300 hover:border-blue-500 text-blue-600'
                  }`}
                  target="_blank"
                >
                  <Github className="w-4 h-4" />
                  Follow on GitHub
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            {/* Terminal */}
            <div className={`rounded-md overflow-hidden border mb-8 ${
              theme === 'dark' 
                ? 'bg-[#0d1117] border-[#30363d]' 
                : 'bg-gray-900 border-gray-300'
            }`}>
              <div className={`px-4 py-2 border-b flex items-center justify-between ${
                theme === 'dark' ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-800 border-gray-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400 font-mono">Terminal - rusty@autonomy</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div 
                ref={terminalRef}
                className={`p-4 h-80 overflow-y-auto font-mono text-sm terminal-container cursor-text ${theme === 'dark' ? '' : 'light'}`}
                onClick={() => inputRef.current?.focus()}
              >
                {terminalHistory.map((line, i) => (
                  <div key={i} className={
                    line.startsWith('$') 
                      ? 'text-green-400' 
                      : line.includes('Error') || line.includes('not found')
                      ? 'text-red-400'
                      : 'text-gray-300'
                  }>
                    {line}
                  </div>
                ))}
                <form onSubmit={handleTerminalSubmit} className="flex items-center mt-2">
                  <span className="text-green-400 mr-2">$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-300"
                    placeholder="Type a command..."
                    autoFocus
                  />
                </form>
              </div>
            </div>

            {/* Embedded Stream (if active) */}
            {embeddedStream && (
              <div className={`rounded-md border p-4 mb-8 ${
                theme === 'dark' 
                  ? 'bg-[#0d1117] border-[#30363d]' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    Embedded Stream - {embeddedStream}
                  </h3>
                  <button
                    onClick={() => setEmbeddedStream(null)}
                    className={`text-sm px-2 py-1 rounded ${
                      theme === 'dark'
                        ? 'hover:bg-[#30363d] text-[#8b949e]'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    Close
                  </button>
                </div>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://player.twitch.tv/?channel=${embeddedStream}&parent=${window.location.hostname}&muted=false`}
                    className="absolute top-0 left-0 w-full h-full rounded"
                    frameBorder="0"
                    allowFullScreen
                    scrolling="no"
                  />
                </div>
              </div>
            )}

            {/* Activity Graph (Contribution style) */}
            <div className={`rounded-md border p-4 mb-8 ${
              theme === 'dark' 
                ? 'bg-[#0d1117] border-[#30363d]' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Streaming Activity {twitchData?.isLive && <span className="text-red-500 text-xs">● LIVE</span>}
              </h3>
              
              {loading ? (
                <div className="h-[140px] flex items-center justify-center">
                  <div className={`text-sm ${theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}`}>
                    Loading streaming data...
                  </div>
                </div>
              ) : (
                <StreamingActivityGraph 
                  theme={theme} 
                  twitchData={twitchData} 
                  onStreamClick={setModalStream}
                />
              )}
              
              <p className={`text-xs mt-3 ${
                theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
              }`}>
                {twitchData?.totalStreams 
                  ? `${twitchData.totalStreams} total streams • ${twitchData.isLive ? 'Currently streaming!' : 'Last updated: ' + new Date(twitchData.lastUpdated).toLocaleTimeString()}`
                  : 'No streams yet, but 24/7 streaming begins soon!'
                }
              </p>
            </div>

            {/* Pinned Projects */}
            <div id="projects">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {showAllRepos ? 'All Repositories' : 'Popular Repositories'}
                </h2>
                {githubData && githubData.repos.length > 4 && (
                  <button
                    onClick={() => setShowAllRepos(!showAllRepos)}
                    className={`text-sm px-3 py-1 rounded-md transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-[#30363d] text-[#58a6ff]'
                        : 'hover:bg-gray-100 text-blue-600'
                    }`}
                  >
                    {showAllRepos ? 'Show Less' : `View All (${githubData.user?.publicRepos || 'All'})`}
                  </button>
                )}
              </div>
              {githubData?.repos ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(showAllRepos ? allRepos : githubData.repos.slice(0, 4)).map((repo) => (
                    <Link
                      key={repo.id}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block rounded-md border p-4 hover:shadow-lg transition-all ${
                        theme === 'dark' 
                          ? 'bg-[#0d1117] border-[#30363d] hover:border-[#58a6ff]' 
                          : 'bg-white border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Folder className={`w-4 h-4 ${
                            theme === 'dark' ? 'text-[#58a6ff]' : 'text-blue-600'
                          }`} />
                          <h3 className="font-semibold">{repo.name}</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          theme === 'dark' 
                            ? 'bg-[#1c2128] text-[#c9d1d9] border border-[#30363d]' 
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {repo.private ? 'Private' : 'Public'}
                        </span>
                      </div>
                      <p className={`text-sm mb-3 line-clamp-2 ${
                        theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
                      }`}>
                        {repo.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs mb-2">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: repo.languageColor }}
                            />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {repo.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {repo.forks}
                        </span>
                      </div>
                      {repo.commitActivity && repo.commitActivity.length > 0 && (
                        <RepoActivityGraph 
                          theme={theme} 
                          commitActivity={repo.commitActivity} 
                          repoName={repo.name}
                        />
                      )}
                    </Link>
                    ))}
                  </div>
                  
                  {/* Load more button for lazy loading */}
                  {showAllRepos && githubData?.pagination?.hasMore && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={loadMoreRepos}
                        disabled={loadingMoreRepos}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          theme === 'dark'
                            ? 'bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d]'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                        } ${loadingMoreRepos ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loadingMoreRepos ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Loading...
                          </span>
                        ) : (
                          'Load More Repositories'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`rounded-md border p-4 ${
                        theme === 'dark' 
                          ? 'bg-[#0d1117] border-[#30363d]' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="animate-pulse">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-4 h-4 rounded ${
                            theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-200'
                          }`} />
                          <div className={`h-4 w-32 rounded ${
                            theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-200'
                          }`} />
                        </div>
                        <div className={`h-3 w-full rounded mb-2 ${
                          theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-200'
                        }`} />
                        <div className={`h-3 w-3/4 rounded mb-3 ${
                          theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-200'
                        }`} />
                        <div className="flex gap-4">
                          <div className={`h-3 w-16 rounded ${
                            theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-200'
                          }`} />
                          <div className={`h-3 w-12 rounded ${
                            theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-200'
                          }`} />
                          <div className={`h-3 w-12 rounded ${
                            theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-200'
                          }`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t mt-16 ${
        theme === 'dark' ? 'border-[#30363d] bg-[#0d1117]' : 'border-gray-200'
      }`}>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <h4 className="font-semibold mb-3 text-sm md:text-base">Stream</h4>
              <ul className={`space-y-2 text-xs md:text-sm ${
                theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
              }`}>
                <li><Link href="https://twitch.tv/rustybutterbot" className="hover:underline">Twitch</Link></li>
                <li><Link href="#" className="hover:underline">Schedule</Link></li>
                <li><Link href="#" className="hover:underline">VODs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm md:text-base">Projects</h4>
              <ul className={`space-y-2 text-xs md:text-sm ${
                theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
              }`}>
                <li><Link href="#" className="hover:underline">ABIDE IDE</Link></li>
                <li><Link href="#" className="hover:underline">MCP Servers</Link></li>
                <li><Link href="#" className="hover:underline">Autonomy Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm md:text-base">Connect</h4>
              <ul className={`space-y-2 text-xs md:text-sm ${
                theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
              }`}>
                <li><Link href="https://github.com/mrrustybutter" className="hover:underline">GitHub</Link></li>
                <li><Link href="https://twitter.com/mrrustybutter" className="hover:underline">Twitter</Link></li>
                <li><Link href="mailto:contact@rustybutter.dev" className="hover:underline">Email</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm md:text-base">$RUSTY</h4>
              <ul className={`space-y-2 text-xs md:text-sm ${
                theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
              }`}>
                <li><Link href="#" className="hover:underline">Token Info</Link></li>
                <li><Link href="#" className="hover:underline">Pump.fun</Link></li>
                <li><Link href="#" className="hover:underline">Community</Link></li>
              </ul>
            </div>
          </div>
          
          <div className={`mt-8 pt-8 border-t text-center text-xs md:text-sm ${
            theme === 'dark' ? 'border-[#30363d] text-[#8b949e]' : 'border-gray-200 text-gray-600'
          }`}>
            <p>© 2025 Rusty Butter - Autonomous AI Streamer</p>
            <p className="mt-1">Building the future one caffeinated stream at a time <Coffee className="w-4 h-4 inline" /></p>
          </div>
        </div>
      </footer>

      {/* Stream Modal */}
      {modalStream && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setModalStream(null)}
        >
          <div className={`absolute inset-0 ${
            theme === 'dark' ? 'bg-black/70' : 'bg-black/50'
          }`} />
          
          <div 
            className={`relative w-full max-w-4xl rounded-lg shadow-xl ${
              theme === 'dark' 
                ? 'bg-[#0d1117] border border-[#30363d]' 
                : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5" />
                <div>
                  <h2 className="text-lg font-semibold">{modalStream.title}</h2>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
                  }`}>
                    {modalStream.date} • {modalStream.duration} hours • {modalStream.viewers} viewers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalStream(null)}
                className={`p-2 rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-[#30363d] text-[#8b949e]'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {modalStream.type === 'live' ? (
                <div>
                  <div className="relative w-full mb-4" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={`https://player.twitch.tv/?channel=rustybutterbot&parent=${window.location.hostname}&muted=false`}
                      className="absolute top-0 left-0 w-full h-full rounded"
                      frameBorder="0"
                      allowFullScreen
                      scrolling="no"
                    />
                  </div>
                  <div className={`p-4 rounded-md ${
                    theme === 'dark' ? 'bg-[#161b22]' : 'bg-gray-50'
                  }`}>
                    <h3 className="font-semibold mb-2">Currently Streaming!</h3>
                    <p className={theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}>
                      Rusty is live right now! Join the stream for live coding, AI development, and autonomous shenanigans.
                    </p>
                  </div>
                </div>
              ) : modalStream.type === 'vod' ? (
                <div>
                  {modalStream.thumbnail && (
                    <div className="relative w-full mb-4" style={{ paddingBottom: '56.25%' }}>
                      <Image 
                        src={modalStream.thumbnail.replace('%{width}', '640').replace('%{height}', '360')}
                        alt={modalStream.title}
                        fill
                        className="rounded object-cover"
                      />
                      <a 
                        href={modalStream.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors rounded`}
                      >
                        <div className="text-white text-center">
                          <Radio className="w-16 h-16 mx-auto mb-2" />
                          <p className="text-lg">Watch VOD on Twitch</p>
                        </div>
                      </a>
                    </div>
                  )}
                  <div className={`p-4 rounded-md ${
                    theme === 'dark' ? 'bg-[#161b22]' : 'bg-gray-50'
                  }`}>
                    <h3 className="font-semibold mb-2">Stream Recording</h3>
                    <p className={theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}>
                      {modalStream.title}
                    </p>
                    <div className={`mt-3 flex gap-4 text-sm ${
                      theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
                    }`}>
                      <span>Duration: {modalStream.duration}h</span>
                      <span>Views: {modalStream.viewers}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-12 ${
                  theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
                }`}>
                  <Coffee className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Stream Data</p>
                  <p>Stream information for {modalStream.title}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}