import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NavHeader from '@/components/layout/NavHeader'

jest.mock('@/components/layout/PromoBanner', () => ({
  __esModule: true,
  default: () => null,
}))

describe('NavHeader login menu', () => {
  it('desktop: a "Войти" button opens a menu with mentor and mentee login', async () => {
    const { container } = render(<NavHeader />)
    const desktop = container.querySelector('nav') as HTMLElement
    const button = within(desktop).getByRole('button', { name: /Войти/ })
    expect(within(desktop).queryByRole('menuitem')).not.toBeInTheDocument()

    await userEvent.click(button)
    const items = within(desktop).getAllByRole('menuitem')
    expect(items.map((i) => i.textContent)).toEqual(['Войти как ментор', 'Войти как ученик'])
    expect(items[0]).toHaveAttribute('href', '/mentor/login')
    expect(items[1]).toHaveAttribute('href', '/mentee/login')
  })

  it('mobile: two plain links, no dropdown', () => {
    const { container } = render(<NavHeader />)
    // The mobile drawer list is rendered first, the desktop <nav> list second.
    const [mobile, desktop] = Array.from(container.querySelectorAll('ul'))
    expect(desktop.closest('nav')).not.toBeNull()
    expect(mobile.closest('nav')).toBeNull()
    expect(within(mobile).queryByRole('button')).not.toBeInTheDocument()
    expect(within(mobile).getByRole('link', { name: 'Войти как ментор' })).toHaveAttribute(
      'href',
      '/mentor/login'
    )
    expect(within(mobile).getByRole('link', { name: 'Войти как ученик' })).toHaveAttribute(
      'href',
      '/mentee/login'
    )
  })
})
