import type {
  SimpleMathOperationParams,
  SimpleMathResult,
} from './types/simple-math'

export * from './types/simple-math'

export class SimpleMath {
  public add({ a, b }: SimpleMathOperationParams): SimpleMathResult {
    return a + b
  }

  public subtract({ a, b }: SimpleMathOperationParams): SimpleMathResult {
    return a - b
  }

  public multiply({ a, b }: SimpleMathOperationParams): SimpleMathResult {
    return a * b
  }

  public divide({ a, b }: SimpleMathOperationParams): SimpleMathResult {
    if (b === 0) {
      throw new Error('Cannot divide by zero')
    }
    return a / b
  }
}
