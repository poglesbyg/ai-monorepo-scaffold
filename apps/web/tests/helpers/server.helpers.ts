import { dev } from 'astro'
import { envField } from 'astro/config'

let devServer: Awaited<ReturnType<typeof dev>> | null = null

/**
 * Starts the Astro dev server for testing
 */
export async function startTestServer(): Promise<
  Awaited<ReturnType<typeof dev>>
> {
  if (devServer) {
    throw new Error('Test server is already running')
  }

  devServer = await dev({
    root: '.',
    mode: 'development',
    integrations: [],
    server: {
      port: 4321, // Use consistent port for testing
    },
    env: {
      schema: {
        DATABASE_URL: envField.string({
          context: 'server',
          access: 'secret',
          default: 'postgres://localhost:5432/processpilot-test',
        }),
      },
    },
  })

  return devServer
}

/**
 * Stops the test server
 */
export async function stopTestServer(): Promise<void> {
  if (!devServer) {
    throw new Error('Test server is not running')
  }

  await devServer.stop()
  devServer = null
}

/**
 * Gets the base URL for the test server
 */
export function getTestServerUrl(): string {
  if (!devServer) {
    throw new Error('Test server is not running')
  }

  // Default Astro dev server port is 4321
  return 'http://localhost:4321'
}

/**
 * Makes a request to the test server
 */
export async function fetchTestEndpoint(
  path: string,
  options?: RequestInit,
): Promise<Response> {
  const url = `${getTestServerUrl()}${path}`
  return await fetch(url, options)
}
