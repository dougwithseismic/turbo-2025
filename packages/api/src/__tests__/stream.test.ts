import { describe, it, expect } from 'vitest'
import { streamParser } from '../stream.js'

async function readStream<T>(stream: ReadableStream<T>): Promise<T[]> {
  const reader = stream.getReader()
  const results: T[] = []
  let done, value
  do {
    ;({ done, value } = await reader.read())
    if (!done && value !== undefined) {
      results.push(value)
    }
  } while (!done)
  return results
}

describe('streamParser', () => {
  it('should parse streamed JSON objects', async () => {
    const chunks = [
      '{"event":"start"}\n',
      '{"data":"chunk1"}\n',
      '{"data":"chunk2"}\n',
      '{"event":"end"}\n',
    ]
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
        controller.close()
      },
    })

    const parsedStream = streamParser<any>(stream)
    const results = await readStream(parsedStream)

    expect(results).toEqual([
      { event: 'start' },
      { data: 'chunk1' },
      { data: 'chunk2' },
      { event: 'end' },
    ])
  })

  it('should handle incomplete JSON objects', async () => {
    const chunks = ['{"data":"chunk', '1"}\n{"data":"chunk2"}\n']
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
        controller.close()
      },
    })

    const parsedStream = streamParser<any>(stream)
    const results = await readStream(parsedStream)

    expect(results).toEqual([{ data: 'chunk1' }, { data: 'chunk2' }])
  })

  it('should throw error on invalid JSON', async () => {
    const chunks = ['{invalid json}\n']
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
        controller.close()
      },
    })

    const parsedStream = streamParser<any>(stream)
    await expect(readStream(parsedStream)).rejects.toThrowError(
      'Failed to parse stream data',
    )
  })
})
