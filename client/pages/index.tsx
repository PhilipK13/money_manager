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
          router.push("https://moneymanager.auth.us-east-1.amazoncognito.com/login?response_type=token&client_id=8rhrojpcl1rsq9ekmh34oqhcu&redirect_uri=http://localhost:3000")
        }}
      >
        Login
      </Button>
    </div>
  )
}
