"use client"

import { useState, useEffect } from "react"
import { Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function WhatsAppFraudDemo() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Parabéns! Você foi selecionada para o questionário Shein 17 anos...",
      isBot: true,
    },
    {
      id: 2,
      text: "Olá! Seja bem vinda ao **questionário premiado** em comemoração aos 17 anos da Shein!",
      isBot: true,
    },
    {
      id: 3,
      text: "Sou a Fernanda, atendente virtual da Shein e vou te auxiliar no seu **questionário premiado**! 🥰",
      isBot: true,
    },
    {
      id: 4,
      text: `Hoje quarta-feira, ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} é o **último dia** para responder o questionário e resgatar a sua premiação caso esteja qualificada.`,
      isBot: true,
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [status, setStatus] = useState("Online")

  // Simula o bot "digitando" e adicionando mensagens
  useEffect(() => {
    const typingInterval = setInterval(() => {
      setIsTyping(true)
      setStatus("digitando...")
      setTimeout(() => {
        setIsTyping(false)
        setStatus("Online")
      }, 2000) // Simula digitação por 2 segundos
    }, 8000) // A cada 8 segundos, o bot "digita"

    return () => clearInterval(typingInterval)
  }, [])

  const CheckIcon = () => (
    <svg width="16" height="12" viewBox="0 0 16 12" className="text-[#60d550] ml-1">
      <path
        fill="currentColor"
        d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
      />
    </svg>
  )

  useEffect(() => {
    // Script para criar a barra superior (user-bar)
    const criarBarra = () => {
      const userBar = document.createElement("div")
      userBar.className = "user-bar"
      const backButton = document.createElement("div")
      backButton.className = "back"
      backButton.innerHTML = '<i class="zmdi zmdi-arrow-left"></i>'
      // Removido: backButton.addEventListener("click", () => { window.location.href = "..." });
      const avatar = document.createElement("div")
      avatar.className = "avatar"
      avatar.innerHTML = '<img src="/placeholder.svg?height=40&width=40" alt="Shein Brasil">' // Usando placeholder
      const name = document.createElement("div")
      name.className = "name"
      name.innerHTML =
        '<span class="font-semibold text-base">Shein Brasil</span> <span data-testid="psa-verified" data-icon="psa-verified" class=""><svg viewBox="0 0 18 18" height="16" width="16" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enableBackground="new 0 0 18 18" xmlSpace="preserve"><polygon id="Star-2" fill="#00DA60" points="9,16 7.1,16.9 5.8,15.2 3.7,15.1 3.4,13 1.5,12 2.2,9.9 1.1,8.2 2.6,6.7 2.4,4.6 4.5,4 5.3,2 7.4,2.4 9,1.1 10.7,2.4 12.7,2 13.6,4 15.6,4.6 15.5,6.7 17,8.2 15.9,9.9 16.5,12 14.7,13 14.3,15.1 12.2,15.2 10.9,16.9 "></polygon><polygon id="Check-Icon" fill="#FFFFFF" points="13.1,7.3 12.2,6.5 8.1,10.6 5.9,8.5 5,9.4 8,12.4 "></polygon></svg></span><span class="status">online</span>'
      const moreActions = document.createElement("div")
      moreActions.className = "actions more"
      moreActions.innerHTML = '<i class="zmdi zmdi-more-vert"></i>'
      const attachmentAction = document.createElement("div")
      attachmentAction.className = "actions attachment"
      attachmentAction.innerHTML = '<i class="zmdi zmdi-attachment-alt"></i>'
      const phoneAction = document.createElement("div")
      phoneAction.className = "actions"
      phoneAction.innerHTML = '<i class="zmdi zmdi-phone"></i>'
      // Removido: phoneAction.addEventListener("click", () => { window.location.href = "..." });
      userBar.appendChild(backButton)
      userBar.appendChild(avatar)
      userBar.appendChild(name)
      userBar.appendChild(moreActions)
      userBar.appendChild(attachmentAction)
      userBar.appendChild(phoneAction)
      const elementoPai = document.querySelector("#__next")
      if (elementoPai) {
        elementoPai.insertBefore(userBar, elementoPai.firstChild)
      }
    }
    criarBarra()

    // Script de redirecionamento para mobile (comportamento original)
    // Removido: redirectToMobile() function and its call

    // Scripts de proteção anti-devtools e anti-inspeção (comportamento original)
    // Removidos: document.addEventListener("contextmenu"), document.onkeypress, document.onmousedown, document.onkeydown

    // Scripts de pixel e UTMify (comportamento original)
    // Removidos: pixelScript1, noscriptPixel, pixelScript2

    // Link para Material Design Iconic Font (mantido para os ícones visuais)
    const fontLink = document.createElement("link")
    fontLink.rel = "stylesheet"
    fontLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.2.0/css/material-design-iconic-font.min.css"
    document.head.appendChild(fontLink)

    // Script disable-devtool-auto (removido)

    return () => {
      // Limpeza dos scripts adicionados dinamicamente
      document.head.removeChild(fontLink)
      const userBar = document.querySelector(".user-bar")
      if (userBar) {
        userBar.remove()
      }
    }
  }, [])

  return (
    <div className="max-w-md mx-auto bg-white h-screen flex flex-col overflow-hidden">
      {/* Estilos CSS brutos do código original (mantidos para o visual) */}
      <style jsx global>{`
        .hide {
          display: none !important;
        }
        typebot-standard {
          position: relative;
          z-index: 9999;
        }
        #__next {
          position: relative;
          z-index: 9999;
        }
        .user-bar {
          width: 100%;
          height: 55px;
          background: #005e54;
          color: #fff;
          padding: 0;
          font-size: 24px;
          position: fixed;
          z-index: 99999;
          display: block;
          top: 0;
        }
        .user-bar:after {
          content: "";
          display: table;
          clear: both;
        }
        .user-bar div {
          float: left;
          transform: translateY(-50%);
          position: relative;
          top: 50%;
          margin-left: 10px;
        }
        .user-bar .actions {
          float: right;
          margin: 0 0 0 20px;
        }
        .user-bar .actions.more {
          margin: 0 12px 0 32px;
        }
        .user-bar .actions.attachment {
          margin: 0 0 0 30px;
        }
        .user-bar .actions.attachment i {
          display: block;
          transform: rotate(-45deg);
        }
        .user-bar .avatar {
          margin: 0 0 0 5px;
          width: 36px;
          height: 36px;
        }
        .user-bar .avatar img {
          border-radius: 50%;
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .user-bar .name {
          font-size: 17px;
          font-weight: 600;
          text-overflow: ellipsis;
          letter-spacing: 0.3px;
          margin: 0 0 0 8px;
          overflow: hidden;
          white-space: nowrap;
          width: 150px;
        }
        .user-bar .status {
          display: block;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0;
        }
        .typebot-input .typebot-button .send-icon {
          display: none;
        }
        .typebot-input {
          max-width: 100% !important;
          width: 100% !important;
          position: fixed;
          bottom: 0;
          align-items: center;
          z-index: 999;
          right: 0;
          margin-bottom: 20px;
          background-color: white;
          border-radius: 50px;
          box-shadow: 1 2px 1px -1px rgba(0, 0, 0, 0.2);
          height: 50px;
          padding-right: 0px !important;
        }
        .disabled\\:opacity-50:disabled {
          opacity: 100%;
        }
      `}</style>
      {/* O header será injetado pelo script criarBarra() */}
      <div className="h-[55px] bg-[#005e54] flex-shrink-0"></div> {/* Placeholder para o header injetado */}
      {/* Área de Mensagens com Background */}
      <div
        className="flex-1 p-4 space-y-3 overflow-y-auto"
        style={{
          backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-06-18%20at%2014.34.07-n1JVr8rJPFPHI7nd7iyUTWY5aaySge.jpeg)`, // Usando a imagem fornecida como background
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#ece5dd", // Fallback color
        }}
      >
        {/* Aviso de Conta Comercial */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#e0f2f1] rounded-lg p-2 flex items-center gap-2 text-sm max-w-[90%]">
            <div className="w-5 h-5 rounded-full bg-[#4b5e63] flex items-center justify-center text-white text-xs">
              i
            </div>
            <span className="text-[#53676b]">Esta é uma conta comercial e não recebe ligações</span>
          </div>
        </div>

        {messages.map((message, index) => (
          <div key={message.id} className="flex justify-start items-end">
            {index === 0 && ( // Apenas mostra o avatar para a primeira mensagem
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 bg-white flex items-center justify-center">
                <img src="/placeholder.svg?height=20&width=20" alt="Shein Logo" className="w-5 h-5 object-contain" />
              </div>
            )}
            <div
              className={`relative bg-white rounded-lg p-2 max-w-[85%] shadow-sm ${
                index === 0 ? "rounded-tl-none" : "rounded-bl-none"
              }`}
              style={{
                borderRadius: "0.5rem",
                borderBottomLeftRadius: index === 0 ? "0.5rem" : "0.1rem",
                borderTopLeftRadius: index === 0 ? "0.1rem" : "0.5rem",
                borderBottomRightRadius: "0.5rem",
                borderTopRightRadius: "0.5rem",
              }}
            >
              <p
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
              />
              <div className="absolute bottom-0 right-1 flex items-center">
                <CheckIcon />
              </div>
            </div>
          </div>
        ))}

        {/* Indicador de digitando (simulado via React, pois o script original depende do Typebot) */}
        {isTyping && (
          <div className="flex justify-start items-end">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 bg-white flex items-center justify-center">
              <img src="/placeholder.svg?height=20&width=20" alt="Shein Logo" className="w-5 h-5 object-contain" />
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
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

        {/* Botão de Ação */}
        <div className="flex justify-center mt-4">
          <Button className="bg-[#25d366] hover:bg-[#1da851] text-white font-bold py-3 px-6 rounded-full text-base shadow-lg">
            Clique aqui para iniciar o questionário
          </Button>
        </div>
      </div>
      {/* Área de Input */}
      <div className="p-2 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
        <Input
          placeholder="Digite uma mensagem"
          className="flex-1 bg-white rounded-full px-4 py-2 border-0 focus-visible:ring-0"
        />
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Paperclip className="h-5 w-5" />
        </Button>
      </div>
      {/* Aviso de Demonstração */}
      <div className="bg-red-100 border-t border-red-200 p-2">
        <p className="text-red-800 text-xs text-center font-semibold">
          ⚠️ DEMONSTRAÇÃO DE FRAUDE - NÃO É O WHATSAPP REAL
        </p>
      </div>
    </div>
  )
}
