import type { DonateItem } from '@/types'

const donates: DonateItem[] = [
  {
    name: 'Patreon',
    description: 'Донатить через Patreon',
    linkUrl: 'https://www.patreon.com/getmentor',
    image: {
      url: '/images/patreon.png',
      width: 200,
      height: (1188 / 6834) * 200,
    },
  },
  {
    name: 'Tinkoff',
    description: 'Перевод на карту',
    linkUrl: 'https://t.tb.ru/pm_short/sVXu3fk6nL',
    image: {
      url: '/images/tinkoff.png',
      width: 160,
      height: (462 / 1500) * 160,
    },
    qrCode: {
      url: '/images/tbank-qr.png',
      width: 1110,
      height: 918,
    },
  },
  {
    name: 'Paypal',
    description: 'Оплатить через PayPal',
    linkUrl: 'https://paypal.me/glamcoder',
    image: {
      url: '/images/paypal.png',
      width: 200,
      height: (664 / 2200) * 200,
    },
  },
]

export default donates
