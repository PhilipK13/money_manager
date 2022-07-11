import Link from 'next/link'

export default 
function Home() {
  return (
    <div className='flex justify-center items-center h-screen flex-col'>
      <h1>Money Manager</h1>
      <div className='button_ghost'>
        <Link href="/Authentication/Auth">
          <a>Login ass</a>
        </Link>
      </div>
    </div>
  )
}
