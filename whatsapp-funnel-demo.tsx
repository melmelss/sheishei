"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { verifyCpf } from "./actions" // Importa o Server Action

// Dados fictícios do usuário (USER_NAME e USER_DOB_OPTION foram removidos, o nome e nascimento virão da API)
const USER_CPF = "11750514974" // Este CPF será o "válido" para a simulação

const CheckIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" className="text-[#60d550] ml-1">
    <path
      fill="currentColor"
      d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
    />
  </svg>
)

export default function WhatsAppFunnelDemo() {
  const [conversation, setConversation] = useState<
    Array<{
      type: "bot" | "user" | "image" | "video" | "button-group" | "status-message" | "loading"
      content: string | string[] | { text: string; options: string[] }
      timestamp?: string
      avatar?: string
      isTyping?: boolean
    }>
  >([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [status, setStatus] = useState("Online")
  const [userName, setUserName] = useState<string | undefined>(undefined) // Usando useState para o nome do usuário
  const [userDob, setUserDob] = useState<string | undefined>(undefined) // Novo estado para a data de nascimento
  const [selectedPrizeOption, setSelectedPrizeOption] = useState<string | undefined>(undefined) // Novo estado para a opção de prêmio selecionada
  const [awaitingInput, setAwaitingInput] = useState<string | null>(null) // Novo estado para controlar o input de texto
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Referência para o objeto de áudio
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Inicializa o objeto de áudio uma vez
    audioRef.current = new Audio("/whatsapp-notification.mp3")
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const addMessage = useCallback((message: any) => {
    setConversation((prev) => {
      // Se a mensagem for do bot, tenta tocar o áudio
      if (message.type === "bot" && audioRef.current) {
        audioRef.current.play().catch((e) => console.error("Erro ao tocar áudio:", e))
      }
      return [
        ...prev,
        { ...message, timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) },
      ]
    })
  }, [])

  const simulateTyping = useCallback(async (duration = 1500) => {
    setIsTyping(true)
    setStatus("digitando...")
    await new Promise((resolve) => setTimeout(resolve, duration))
    setIsTyping(false)
    setStatus("Online")
  }, [])

  // Definir funnelSteps com useMemo para que seja recriado quando userName ou userDob mudar
  const funnelSteps = useMemo(
    () => [
      // Step 0: Initial Welcome & Info
      async () => {
        addMessage({ type: "status-message", content: "Esta é uma conta comercial e não recebe ligações" })
        await simulateTyping()
        addMessage({ type: "bot", content: "Parabéns! Você foi selecionada para o questionário Shein 17 anos..." })
        await simulateTyping()
        addMessage({
          type: "bot",
          content: "Olá! Seja bem vinda ao **questionário premiado** em comemoração aos 17 anos da Shein!",
        })
        await simulateTyping()
        addMessage({
          type: "bot",
          content: "Sou a Fernanda, atendente virtual da Shein e vou te auxiliar no seu **questionário premiado**! 🥰",
        })
        await simulateTyping()
        addMessage({
          type: "bot",
          content: `Hoje quarta-feira, ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} é o **último dia** para responder o questionário e resgatar a sua premiação caso esteja qualificada.`,
        })
        await simulateTyping()
        addMessage({
          type: "button-group",
          content: {
            text: "Clique aqui para iniciar o questionário",
            options: ["Clique aqui para iniciar o questionário"],
          },
        })
      },
      // Step 1: CPF Request & Verification
      async () => {
        await simulateTyping()
        addMessage({
          type: "bot",
          content: "Antes de prosseguirmos, devo informar que o questionário é limitado a 1 resposta por CPF.",
        })
        await simulateTyping()
        addMessage({ type: "bot", content: "Para começarmos, preciso que me informe o número do seu CPF." })
        setAwaitingInput("CPF") // Solicita input de CPF
      },
      async (userResponse: string) => {
        setAwaitingInput(null) // Esconde o input
        addMessage({ type: "loading", content: "Verificando CPF..." }) // Adiciona mensagem de carregamento
        const result = await verifyCpf(userResponse) // Chama o Server Action
        setConversation((prev) => prev.filter((msg) => msg.type !== "loading")) // Remove a mensagem de carregamento

        if (result.success) {
          setUserName(result.name) // Atualiza o estado com o nome da API
          setUserDob(result.nascimento) // Atualiza o estado com a data de nascimento da API
          addMessage({ type: "bot", content: result.message })
          await simulateTyping()
          addMessage({ type: "bot", content: "Seus dados estão qualificados para nosso questionário!" })
          await simulateTyping()
          // Usa o nome da API se disponível, caso contrário, usa um fallback genérico
          addMessage({
            type: "bot",
            content: `${result.name || "usuário"}, seu nome está correto?`,
          })
          addMessage({ type: "button-group", content: { text: "Sim", options: ["Sim"] } })
        } else {
          addMessage({ type: "bot", content: result.message })
          await simulateTyping()
          addMessage({ type: "bot", content: "Por favor, tente novamente ou entre em contato com o suporte." })
          setAwaitingInput("CPF") // Volta para a etapa de input de CPF
          setCurrentStep(1) // Reinicia o passo para o input de CPF
          return // Impede o avanço do funil
        }
      },
      // Step 2: Date of Birth Confirmation
      async () => {
        await simulateTyping()
        addMessage({
          type: "bot",
          content: "Para confirmar que realmente estamos falando com a pessoa certa, confirme sua data de nascimento:",
        })

        const dobOptions = []
        if (userDob) {
          dobOptions.push(`Opção 01 - ${userDob}`)
        } else {
          // Fallback se userDob não estiver disponível (ex: API não retornou)
          dobOptions.push("Opção 01 - 30/07/2000") // Data padrão
        }
        // Adiciona outras opções fixas incorretas
        dobOptions.push("Opção 02 - 22/04/1988")
        dobOptions.push("Opção 03 - 04/12/2001")

        addMessage({
          type: "button-group",
          content: {
            text: "Qual opção está correta?",
            options: dobOptions,
          },
        })
      },
      async () => {
        await simulateTyping()
        addMessage({
          type: "bot",
          \
