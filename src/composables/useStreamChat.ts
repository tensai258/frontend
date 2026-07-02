import { ref } from 'vue'
import { storage } from '@/utils/storage'

export function useStreamChat() {
  const streaming = ref(false)
  const streamContent = ref('')
  const error = ref('')

  const sendStreamMessage = async (
    message: string,
    onChunk: (chunk: string) => void,
    onComplete: (fullContent: string) => void,
    onError?: (err: string) => void
  ) => {
    streaming.value = true
    streamContent.value = ''
    error.value = ''

    try {
      const token = storage.get<string>('token')
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法读取响应流')
      }

      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              onComplete(fullContent)
              streaming.value = false
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                fullContent += parsed.content
                streamContent.value = fullContent
                onChunk(parsed.content)
              }
              if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch {
              // 非JSON数据，直接追加
              if (data.trim()) {
                fullContent += data
                streamContent.value = fullContent
                onChunk(data)
              }
            }
          }
        }
      }

      onComplete(fullContent)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : '流式请求失败'
      error.value = errMsg
      onError?.(errMsg)
    } finally {
      streaming.value = false
    }
  }

  return {
    streaming,
    streamContent,
    error,
    sendStreamMessage
  }
}
