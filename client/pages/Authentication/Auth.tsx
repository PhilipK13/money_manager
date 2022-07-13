import styles from '../../styles/Home.module.css'
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/router'
import { Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { cursorTo } from 'readline';

export default function Auth() {

//Current auth link: https://moneymanager.auth.us-east-1.amazoncognito.com/login?response_type=token&client_id=8rhrojpcl1rsq9ekmh34oqhcu&redirect_uri=http://localhost:3000

const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <div className="flex flex-col space-y-4">
      <Button onClick={(e) => {
        e.preventDefault();
        router.push("https://moneymanager.auth.us-east-1.amazoncognito.com/login?response_type=token&client_id=8rhrojpcl1rsq9ekmh34oqhcu&redirect_uri=http://localhost:3000")
      }}>
        
      </Button>
    </div>
  )
}
