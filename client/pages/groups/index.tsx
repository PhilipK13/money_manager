import styles from '../../styles/Home.module.css'
import { useState, ChangeEvent, MouseEvent, useEffect, Key } from 'react';
import { useRouter } from 'next/router'
import { Button, useAuthenticator, TextField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import getToken from '../../utils/getToken';
import axios from 'axios';

export default function groups() {

  const router = useRouter();

  type Group = {
    id: number;
    name: string;
    description: string;
  };

  const {user} = useAuthenticator();

  const [myMap, setMyMap] = useState(new Map());
  const [usersCurrentGroups, setUsersCurrentGroups] = useState([]);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [disableGroupCreate, setDisableGroupCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  var lock = 0;

  //Runs once the user is logged in and verified, will only run once
  useEffect(() => {
    if(user && lock == 0) {
      lock = 1;
      getUsersGroups();
    }
  }, [user]);
 
  //Gets the users associated with groups
  const getUsersFromGroup = async (groups: any) => {
    
    for(let i = 0; i < groups.length; i++) {
      try {
        const resp = await axios.post(
          `/api/groups/getUsersFromGroup`,
          { group_id: groups[i].id },
          { headers: { Authorization: `Bearer ${getToken(user)}` } }
        );
        setMyMap(myMap.set(groups[i].id, resp.data));
      } catch (err) {
        console.log(err);
      }
    }
    
    console.log(myMap);
    
  }

  //Gets the users groups from the database
  const getUsersGroups = async () => {
    try {
      const resp = await axios.get(
        `/api/groups/retrieve`,
        { headers: { Authorization: `Bearer ${getToken(user)}` } }
      );
      await getUsersFromGroup(resp.data);
      setUsersCurrentGroups(resp.data);
      
    } catch (err) {
      console.log(err);
    }
  }


  //Returns the picture for all the users in the group
  const displayUsers = (groupId: number) => {
    console.log(groupId)
    var users = myMap.get(groupId);
    console.log(users);
    return (
      <div className='flex flex-row space-x-4'>
        {users.map((user: any) => (
          <img className="rounded-full" src={user.picture} alt={user.name} width="50px"/>
        ))}
      </div>
    )
  }

  //Creates a new group associated with the user
  const createGroup = async (e:  MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDisableGroupCreate(true);
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
      console.log(resp.status);
      if(resp.status === 200) {
        getUsersGroups();
        setShowGroupCreate(false);
        setDisableGroupCreate(false);
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

          <a 
            className="flex flex-col space-y-4 border-cyan-800 hover:cursor-pointer border" 
            key={group.id}
            onClick={() => {
              router.push({
                pathname: `/transactions`,
                query: { groupid: group.id },
              })
            }}
          >
            {console.log("Count")}
            <h2>Name: {group.name}</h2>
            <p>Description: {group.description}</p>
            {/* display the users names from the userlist map that has a key of the group id */}
            {displayUsers(group.id)}
          </a>
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
            disabled={disableGroupCreate}
          >
            Create Group
          </Button>
        </div>
      )}
    </div>
  )
}
