import { Button, useAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/router'
import { Auth } from 'aws-amplify';
import {CognitoHostedUIIdentityProvider} from "@aws-amplify/auth"

export default 
function Home() {

  const router = useRouter();
  const {user} = useAuthenticator()

  if(!user) {
    return (
      <div className='flex justify-center items-center h-screen flex-col'>
        <h1>Money Manager</h1>
        <Button
          loadingText="Loading..."
          onClick={(e) => {
            e.preventDefault();
            Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })
          }}
        >
          Login
        </Button>
      </div>
    )
  } else {
    router.push('/Home/Home')
  }

  return (
    <div className='flex justify-center items-center h-screen flex-col'>
      Loading...
    </div>
  )

  
}
