export interface IApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

export interface IPaginatedParams {
  page: number
  pageSize: number
}

export interface IPaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export function success<T>(data: T, message = 'ok'): IApiResponse<T> {
  return { code: 0, data, message }
}

export function fail(message: string, code = -1): IApiResponse<null> {
  return { code, data: null, message }
}

export function paginate<T>(allData: T[], params: IPaginatedParams): IPaginatedResult<T> {
  const { page, pageSize } = params
  const start = (page - 1) * pageSize
  const list = allData.slice(start, start + pageSize)
  return { list, total: allData.length, page, pageSize }
}

export function randomId(): number {
  return Math.floor(Math.random() * 100000) + 1
}

export function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
