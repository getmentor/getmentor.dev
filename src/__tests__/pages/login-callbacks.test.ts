/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http'
import type { GetServerSideProps, GetServerSidePropsContext } from 'next'
import type { IncomingMessage, ServerResponse } from 'http'
import { getServerSideProps as mentorGSSP } from '@/pages/mentor/auth/callback'
import { getServerSideProps as adminGSSP } from '@/pages/admin/auth/callback'
import { getServerSideProps as menteeGSSP } from '@/pages/mentee/auth/callback'

function ctx(query: Record<string, string>, host = 'getmentor.dev') {
  const { req, res } = createMocks({ method: 'GET', headers: { host } })
  return {
    context: {
      req: req as unknown as IncomingMessage,
      res: res as unknown as ServerResponse,
      query,
    } as unknown as GetServerSidePropsContext,
    res: res as unknown as ServerResponse & { getHeader: (n: string) => unknown },
  }
}

const hex = (c: string): string => c.repeat(64)

const realms: [string, GetServerSideProps, string, string, string, string[]][] = [
  [
    'mentor',
    mentorGSSP,
    `mtk_${hex('a')}_1764059000`,
    'mentor_login_token',
    '/api/mentor/auth/verify',
    [`atk_${hex('a')}_1764059000`, `mntk_${hex('a')}`, 'mtk_short_1'],
  ],
  [
    'admin',
    adminGSSP,
    `atk_${hex('b')}_1764059000`,
    'admin_login_token',
    '/api/admin/auth/verify',
    [`mtk_${hex('b')}_1764059000`, `mntk_${hex('b')}`, 'atk_x_1'],
  ],
  [
    'mentee',
    menteeGSSP,
    `mntk_${hex('c')}`,
    'mentee_login_token',
    '/api/mentee/auth/verify',
    [`mtk_${hex('c')}_1764059000`, 'not-a-token'],
  ],
]

describe.each(realms)(
  '/%s/auth/callback getServerSideProps',
  (realm, gssp, token, cookieName, verifyPath, wrong) => {
    const callbackPath = `/${realm}/auth/callback`

    it('moves the token into an HttpOnly cookie scoped to the verify route and drops it from the URL', async () => {
      const { context, res } = ctx({ token })
      expect(await gssp(context)).toEqual({
        redirect: { destination: callbackPath, permanent: false },
      })
      const cookie = String(res.getHeader('Set-Cookie'))
      expect(cookie).toContain(`${cookieName}=${token}`)
      expect(cookie).toContain(`Path=${verifyPath}`)
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('SameSite=Lax')
      expect(cookie).toContain('Max-Age=900')
    })

    it.each(wrong)('drops a token of the wrong shape (%s) without storing it', async (bad) => {
      const { context, res } = ctx({ token: bad })
      expect(await gssp(context)).toEqual({
        redirect: { destination: callbackPath, permanent: false },
      })
      expect(res.getHeader('Set-Cookie')).toBeUndefined()
    })

    it('renders the page when there is no token in the URL', async () => {
      const { context } = ctx({})
      expect(await gssp(context)).toEqual({ props: {} })
    })
  }
)
