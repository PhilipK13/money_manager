import Link from 'next/link'
import { Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/router'

export default 
function Home() {

  const router = useRouter();

  return (
    <div className='flex justify-center items-center h-screen flex-col'>
      <h1>Money Manager</h1>
      <Button
        loadingText="Loading..."
        onClick={(e) => {
          e.preventDefault();
          router.push("/Authentication/Auth")
        }}
      >
        Login
      </Button>
      
    </div>
  )
}
