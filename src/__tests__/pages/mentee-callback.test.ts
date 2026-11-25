/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http'
import type { GetServerSidePropsContext } from 'next'
import type { IncomingMessage, ServerResponse } from 'http'
import { getServerSideProps } from '@/pages/mentee/auth/callback'

function ctx(query: Record<string, string>): {
  context: GetServerSidePropsContext
  res: ServerResponse & { getHeader: (n: string) => unknown }
} {
  const { req, res } = createMocks({ method: 'GET', headers: { host: 'getmentor.dev' } })
  return {
    context: {
      req: req as unknown as IncomingMessage,
      res: res as unknown as ServerResponse,
      query,
      resolvedUrl: '/mentee/auth/callback',
    } as unknown as GetServerSidePropsContext,
    res: res as unknown as ServerResponse & { getHeader: (n: string) => unknown },
  }
}

describe('/mentee/auth/callback getServerSideProps', () => {
  const TOKEN = `mntk_${'c'.repeat(64)}`

  it('moves the token into an HttpOnly cookie scoped to the verify route and drops it from the URL', async () => {
    const { context, res } = ctx({ token: TOKEN })
    const result = await getServerSideProps(context)
    expect(result).toEqual({ redirect: { destination: '/mentee/auth/callback', permanent: false } })
    const cookie = String(res.getHeader('Set-Cookie'))
    expect(cookie).toContain(`mentee_login_token=${TOKEN}`)
    expect(cookie).toContain('Path=/api/mentee/auth/verify')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).toContain('Max-Age=900')
  })

  it('drops a malformed token from the URL without storing it', async () => {
    const { context, res } = ctx({ token: 'not-a-token' })
    const result = await getServerSideProps(context)
    expect(result).toEqual({ redirect: { destination: '/mentee/auth/callback', permanent: false } })
    expect(res.getHeader('Set-Cookie')).toBeUndefined()
  })

  it('renders the page when there is no token in the URL', async () => {
    const { context } = ctx({})
    expect(await getServerSideProps(context)).toEqual({ props: {} })
  })
})
