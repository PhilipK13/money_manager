import styles from '../../styles/Home.module.css'
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/router'
import { Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { cursorTo } from 'readline';

export default function Auth() {

  const [email, setEmail] = useState('');

  return (
    <div className="flex flex-col space-y-4">
      
    </div>
  )
}
