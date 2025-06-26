"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, MoreVertical, Phone, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function WhatsAppFraudDemo() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Olá! Bem-vindo à SHEIN Brasil! 🎉",
      isBot: true,
      timestamp: "14:30",
    },
    {
      id: 2,
      text: "Você foi selecionado para participar da nossa promoção especial!",
      isBot: true,
      timestamp: "14:30",
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [status, setStatus] = useState("online")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Ciclo do bot
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    function botCycle() {
      timeoutId = setTimeout(() => {
        setIsTyping(true)
        setStatus("digitando...")

        timeoutId = setTimeout(() => {
          setIsTyping(false)
          setStatus("online")

          if (Math.random() > 0.7) {
            const newMessage = {
              id: Date.now(),
              text: "Complete o questionário para ganhar seu prêmio! 🎁",
              isBot: true,
              timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            }
            setMessages((prev) => [...prev, newMessage])
          }
          botCycle()
        }, 2000)
      }, 8000)
    }

    botCycle()
    return () => clearTimeout(timeoutId)
  }, [])

  // Scroll automático para o fim das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10"
      style={{ height: '100dvh', maxHeight: '100dvh', width: '100vw' }}
    >
      {/* Header fixo com aceleração de hardware */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-[#005e54] text-white p-3 flex items-center gap-3 [transform:translateZ(0)]">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src="/placeholder.svg?height=40&width=40" alt="Shein Brasil" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">Shein Brasil</span>
              {/* Ícone de verificado */}
              <svg viewBox="0 0 18 18" height="16" width="16" className="text-green-400">
                <polygon
                  fill="currentColor"
                  points="9,16 7.1,16.9 5.8,15.2 3.7,15.1 3.4,13 1.5,12 2.2,9.9 1.1,8.2 2.6,6.7 2.4,4.6 4.5,4 5.3,2 7.4,2.4 9,1.1 10.7,2.4 12.7,2 13.6,4 15.6,4.6 15.5,6.7 17,8.2 15.9,9.9 16.5,12 14.7,13 14.3,15.1 12.2,15.2 10.9,16.9"
                />
                <polygon fill="white" points="13.1,7.3 12.2,6.5 8.1,10.6 5.9,8.5 5,9.4 8,12.4" />
              </svg>
            </div>
            <span className="text-xs opacity-75">{status}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Container centralizado com padding-top para não sobrepor o header */}
      <div className="relative w-full max-w-md h-full bg-white flex flex-col" style={{ maxHeight: '100dvh', height: '100dvh', paddingTop: 56 }}>
        {/* Aviso de Conta Comercial */}
        <div className="p-4 sticky top-[56px] z-10 bg-white">
          <div className="bg-[#d5f4f0] rounded-lg p-3 flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-[#4b5e63] flex items-center justify-center text-white text-xs">i</div>
            <span className="text-[#53676b]">Esta é uma conta comercial e não recebe ligações</span>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="flex">
              <div className="bg-white border rounded-lg p-3 max-w-[80%] shadow-sm">
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                  {/* Ícone de check duplo falso */}
                  <svg width="16" height="12" viewBox="0 0 16 12" className="text-green-500">
                    <path
                      fill="currentColor"
                      d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {/* Indicador de digitando */}
          {isTyping && (
            <div className="flex">
              <div className="bg-white border rounded-lg p-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Área de Input */}
        <div className="p-4 bg-gray-50 sticky bottom-0 z-10">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border">
            <Input placeholder="Digite uma mensagem" className="border-0 focus-visible:ring-0 flex-1" />
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Aviso de Demonstração */}
        <div className="bg-red-100 border-t border-red-200 p-3 sticky bottom-0 z-20">
          <p className="text-red-800 text-xs text-center font-semibold">
            ⚠️ DEMONSTRAÇÃO DE FRAUDE - NÃO É O WHATSAPP REAL
          </p>
        </div>
      </div>
    </div>
  )
}
