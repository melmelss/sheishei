"use server"

/**
 * Verifica um CPF usando uma API externa.
 *
 * @param cpf O número do CPF a ser verificado.
 * @returns Um objeto com o status da verificação, uma mensagem e, opcionalmente, o nome do titular do CPF e data de nascimento.
 */
export async function verifyCpf(
  cpf: string,
): Promise<{ success: boolean; message: string; name?: string; nascimento?: string }> {
  const APELA_API_USER_HARDCODED = "4a0ce81f-db70-48f4-9c10-ce4849562176"

  try {
    const response = await fetch(`https://apela-api.tech/?user=${APELA_API_USER_HARDCODED}&cpf=${cpf}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`Erro na API externa (${response.status}): ${errorData}`)
      console.error("Dados de erro da API:", errorData)
      return { success: false, message: `Erro na verificação do CPF: ${response.statusText}.` }
    }

    const data = await response.json()

    // A API retorna 'status: 200' para sucesso e o nome no campo 'nome' e nascimento no campo 'nascimento'
    if (data.status === 200 && data.nome) {
      console.log("Nome retornado pela API:", data.nome)
      console.log("Nascimento retornado pela API:", data.nascimento) // Log para depuração
      return { success: true, message: "CPF verificado com sucesso!", name: data.nome, nascimento: data.nascimento }
    } else {
      // Se o status não for 200 ou o nome não estiver presente, considera falha
      console.warn("API retornou sucesso, mas sem nome ou status diferente de 200:", data)
      return { success: false, message: data.message || "CPF inválido ou não encontrado." }
    }
  } catch (error) {
    console.error("Erro ao chamar a API de CPF:", error)
    return { success: false, message: "Erro de rede ou ao processar a resposta da API." }
  }
}
