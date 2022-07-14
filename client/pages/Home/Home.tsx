import styles from '../../styles/Home.module.css'
import { useState, ChangeEvent, MouseEvent } from 'react';
import { useRouter } from 'next/router'
import { Button, useAuthenticator, TextField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import getToken from '../../utils/getToken';
import axios from 'axios';


export default function Home() {

  const {user} = useAuthenticator();

  const createGroup = async (e:  MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const resp = await axios.post(
        `/api/groups/create`,
        {
          description: groupDescription,
          name: groupName,
        },
        { headers: { Authorization: `Bearer ${getToken(user)}` } }
      );
    } catch (err) {
      console.log(err);
    };
  }

  const showGroup = () => {
    setShowGroupCreate(true)
  }

  const [showGroupCreate, setShowGroupCreate] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')

  return (
    <div className="flex flex-col space-y-4">
      <Button
        onClick={showGroup}
      >
          Create a group
      </Button>
      {showGroupCreate && (
        <div>
          <TextField 
            label="Group Name"
            placeholder="Group Name"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
          />
          <TextField 
            label="Group Description"
            placeholder="Group Description"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setGroupDescription(e.target.value)}
          />
          <Button
            onClick={(e: MouseEvent<HTMLButtonElement>) => {createGroup(e)}}
          />
        </div>
      )}
    </div>
  )
}
