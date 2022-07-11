import styles from '../../styles/Home.module.css'

export default function Auth() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className="text-3xl font-bold underline">
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>
        
      </main>
    </div>
  )
}
