/**
 * Parses a ReadableStream into a stream of parsed JSON objects
 *
 * @example
 * ```ts
 * const response = await fetch('https://api.example.com/stream');
 * const jsonStream = streamParser<{ id: string; data: any }>(response.body);
 *
 * const reader = jsonStream.getReader();
 * while (true) {
 *   const { done, value } = await reader.read();
 *   if (done) break;
 *   console.log(value); // Parsed JSON object
 * }
 * ```
 */
export const streamParser = <T>(stream: ReadableStream): ReadableStream<T> => {
  const textDecoder = new TextDecoder()
  let buffer = ''

  return new ReadableStream({
    async start(controller) {
      const reader = stream.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            if (buffer) {
              try {
                controller.enqueue(JSON.parse(buffer))
              } catch (e) {
                controller.error(new Error('Failed to parse remaining buffer'))
              }
            }
            controller.close()
            break
          }

          buffer += textDecoder.decode(value, { stream: true })
          const lines = buffer.split('\n')

          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim()) {
              try {
                controller.enqueue(JSON.parse(line))
              } catch (e) {
                controller.error(new Error('Failed to parse stream data'))
              }
            }
          }
        }
      } catch (error) {
        controller.error(error)
      }
    },
  })
}
