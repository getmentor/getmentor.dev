import Link from "next/link";
import styles from './Card.module.css'

export function Card(props) {
  const {
    children,
    linkUrl,
    imageUrl,
    extras,
  } = props

  return (
    <div className={styles.card}>
      <div className={styles.inner}>
        <div
          className={styles.header}
          style={{ backgroundImage: 'url(' + imageUrl + ')' }}
        >
          <div className={styles.extras}>
            {extras}
          </div>

          <div className={styles.content}>
            {children}
          </div>

          <div className={styles.overlay} style={{ background: 'rgba(0,0,0,0.4)' }}></div>
        </div>

        <Link href={linkUrl}>
          <a className={styles.link} target="_blank" rel="noreferrer"></a>
        </Link>
      </div>
    </div>
  )
}
