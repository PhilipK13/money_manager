import styles from '../../styles/Home.module.css'
import { useState, ChangeEvent, MouseEvent, useEffect, Key } from 'react';
import { useRouter } from 'next/router'
import { Button, useAuthenticator, TextField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import getToken from '../../utils/getToken';
import axios from 'axios';


export default function Home() {

  type Group = {
    id: Key;
    name: string;
    description: string;
  };

  const {user} = useAuthenticator();

  const [usersCurrentGroups, setUsersCurrentGroups] = useState([]);
  const [showGroupCreate, setShowGroupCreate] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')

  var lock = 0;

  //Runs once the user is logged in and verified, will only run once
  useEffect(() => {
    if(user && lock == 0) {
      lock = 1;
      getUsersGroups();
    }
  }, [user]);
 
  //Gets the users groups from the database
  const getUsersGroups = async () => {
    try {
      const resp = await axios.get(
        `/api/groups/getGroups`,
        { headers: { Authorization: `Bearer ${getToken(user)}` } }
      );
      setUsersCurrentGroups(resp.data);
    } catch (err) {
      console.log(err);
    }
  }

  //Creates a new group associated with the user
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
      console.log(resp);
      console.log(resp.status)
      if(resp.status === 200) {
        getUsersGroups();  
        setShowGroupCreate(false);
      }
    } catch (err) {
      console.log(err);
    };
  }

  //Shows the create group form
  const showGroup = () => {
    setShowGroupCreate(true)
  }

  return (
    <div className="flex flex-col space-y-4">
      <h1>Current Groups</h1>
      <div className="flex flex-col space-y-4">
        {/* Displays all the groups the user is in using the name in the order of id */}
        {usersCurrentGroups.map((group: Group) => (
          <div className="flex flex-col space-y-4" key={group.id}>
            <h2>{group.name}</h2>
            <p>{group.description}</p>
          </div>
        ))}
      </div>
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
          >
            Create Group
          </Button>
        </div>
      )}
    </div>
  )
}
