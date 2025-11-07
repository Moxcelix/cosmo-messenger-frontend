import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const StarBackground = () => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animationFrameId

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        const stars = []
        const starCount = 150

        class Star {
            constructor() {
                this.x = Math.random() * canvas.width
                this.y = Math.random() * canvas.height
                this.size = Math.random() * 2 + 0.5
                this.speed = Math.random() * 0.5 + 0.1
                this.opacity = Math.random() * 0.5 + 0.2
                this.twinkleSpeed = Math.random() * 0.02 + 0.01
                this.twinkleDirection = Math.random() > 0.5 ? 1 : -1
            }

            update() {
                this.y += this.speed
                if (this.y > canvas.height) {
                    this.y = 0
                    this.x = Math.random() * canvas.width
                }

                this.opacity += this.twinkleSpeed * this.twinkleDirection
                if (this.opacity <= 0.2 || this.opacity >= 0.7) {
                    this.twinkleDirection *= -1
                }
            }

            draw() {
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
                ctx.fill()
            }
        }

        for (let i = 0; i < starCount; i++) {
            stars.push(new Star())
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
            gradient.addColorStop(0, '#0f0f23')
            gradient.addColorStop(0.5, '#1a1a2e')
            gradient.addColorStop(1, '#16213e')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            stars.forEach(star => {
                star.update()
                star.draw()
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('resize', resizeCanvas)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
        />
    )
}

const FloatingParticle = ({ delay, duration, size }) => {
    return (
        <div
            className="absolute rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 backdrop-blur-sm"
            style={{
                width: size,
                height: size,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`
            }}
        />
    )
}

const HomePage = () => {
    const navigate = useNavigate()

    const particles = Array.from({ length: 15 }, (_, i) => (
        <FloatingParticle
            key={i}
            delay={i * 0.5}
            duration={15 + Math.random() * 10}
            size={20 + Math.random() * 80}
        />
    ))

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
            {/* Анимированный фон со звездами */}
            <StarBackground />
            
            {/* Плавающие частицы */}
            <div className="fixed inset-0 pointer-events-none">
                {particles}
            </div>

            {/* Основной контент */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 sm:px-8 lg:px-12"> {/* Увеличили отступы */}
                <div className="text-center w-full max-w-4xl mx-auto">
                    {/* Логотип и название */}
                    <div className="mb-8 mt-8 sm:mt-16"> 
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 px-2"> {/* Добавили px-2 */}
                            Cosmomessenger
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-300 mb-2 px-4"> 
                            by <span className="font-semibold text-purple-300">moxcelix</span>
                        </p>
                        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"> {/* Добавили px-4 на мобильных */}
                            Общайтесь со всей вселенной. Быстрые сообщения, надежное шифрование 
                            и космический дизайн для вашего комфортного общения.
                        </p>
                    </div>

                    {/* Статистика */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-2xl mx-auto px-2 sm:px-0"> 
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
                            <div className="text-2xl sm:text-3xl font-bold text-purple-300 mb-2">🚀</div>
                            <div className="text-xl sm:text-2xl font-bold mb-1">Мгновенно</div>
                            <div className="text-gray-400 text-xs sm:text-sm">Сообщения в реальном времени</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
                            <div className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">🔒</div>
                            <div className="text-xl sm:text-2xl font-bold mb-1">Безопасно</div>
                            <div className="text-gray-400 text-xs sm:text-sm">Шифрование отсутствует</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
                            <div className="text-2xl sm:text-3xl font-bold text-pink-300 mb-2">🌍</div>
                            <div className="text-xl sm:text-2xl font-bold mb-1">Глобально</div>
                            <div className="text-gray-400 text-xs sm:text-sm">Общайтесь по всему миру</div>
                        </div>
                    </div>

                    {/* Кнопка входа */}
                    <div className="space-y-4 px-4 sm:px-0"> 
                        <button
                            onClick={() => navigate('/login')}
                            className="group relative bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden w-full sm:w-auto" /* Сделали кнопку шире на мобильных */
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <span className="relative flex items-center justify-center space-x-2 sm:space-x-3">
                                <span>Начать общение</span>
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>
                        
                        <p className="text-gray-400 text-xs sm:text-sm">
                            Присоединяйтесь к космическому сообществу
                        </p>
                    </div>

                    {/* Дополнительная информация */}
                    <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left max-w-3xl mx-auto px-4 sm:px-0"> {/* Добавили отступы */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10">
                            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-purple-300">✨ Особенности</h3>
                            <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                                <li className="flex items-center space-x-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Личные сообщения</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Звуковое сопровождение</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Приятный интерфейс</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Веселье</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10">
                            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-blue-300">🛰️ Технологии</h3>
                            <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                                <li className="flex items-center space-x-2">
                                    <span className="text-yellow-400">⚡</span>
                                    <span>WebSocket соединения</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="text-yellow-400">⚡</span>
                                    <span>React 18 + Tailwind</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="text-yellow-400">⚡</span>
                                    <span>Golang бэкенд</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="text-yellow-400">⚡</span>
                                    <span>PostgreSQL</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Футер */}
                <footer className="mt-12 sm:mt-16 text-center text-gray-500 text-xs sm:text-sm px-4">
                    <p>© 2025 Cosmomessenger. Создано moxcelix</p>
                </footer>
            </div>

            {/* CSS анимации */}
            <style jsx>{`
                @keyframes float {
                    0% {
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0.7;
                    }
                    50% {
                        transform: translateY(-20px) rotate(180deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(0px) rotate(360deg);
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    )
}

export default HomePage