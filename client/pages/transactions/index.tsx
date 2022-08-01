import styles from '../../styles/Home.module.css'
import { useState, ChangeEvent, MouseEvent, useEffect, Key } from 'react';
import { useRouter } from 'next/router'
import { Button, useAuthenticator, TextField, SwitchField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import axios from 'axios';

import getToken from '../../utils/getToken';
import getUserAttributes from '../../utils/getUserAttributes';
import { Loader } from '@aws-amplify/ui-react';


type Transaction = {
  id: number;
  group_id: number;
  description: string;
  cost: number;
  splits: TransactionSplit[];
}

type TransactionSplit = {
  user_id: string;
  share: number;
}

interface User {
  id: string,
  name: string,
  email: string,
  picture: string
}

export default function transactions() {

  const router = useRouter();


  const {user} = useAuthenticator();
  const groupId = Number(router.query.groupid);
  
  interface User {
    id: string;
    name: string;
    email: string;
    picture: string;
  }

  interface TransactionSplit{
    user_id: string;
    share: number;
  }

  type SplitTransaction = {
    id: number;
    user_id: string;
    share: number;
  }
  
  const splitMap: Map<number, Array<SplitTransaction>> = new Map(); 
  
  const [splitMapState, setSplitMap] = useState(splitMap);
  const [groupUsersCopy, setGroupUsersCopy] = useState<User[] | []>([]);
  const [groupUsers, setGroupUsers] = useState<any>([]);
  const [groupUsersSplitting, setGroupUsersSpltting] = useState<any>([]);
  const [transactionsRetrieved, setTransactionsRetrieved] = useState([]);
  const [transactionSplitsRetrieved, setTransactionSplitsRetrieved] = useState<SplitTransaction[] | []>([]);

  const [manualSplit, setManualSplit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [disableCreate, setDisableCreate] = useState(false);
  const [dataRecieved, setDataRecieved] = useState(false);

  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');

  var lock = 0;

  //Runs once the user is logged in and verified, will only run once
  useEffect (() => {
    if(user && groupId && lock == 0) {
      lock = 1;
      getUsersFromGroup();
      getTransactions();
    }
  }, [user, groupId]);
 
   //Gets the users associated with groups
   const getUsersFromGroup = async () => {
    try {
      const resp = await axios.post(
        `/api/groups/getUsersFromGroup`,
        { group_id: groupId },
        { headers: { Authorization: `Bearer ${getToken(user)}` } }
      );
      
      setGroupUsers(resp.data);
      setGroupUsersCopy(resp.data);
    } catch (err) {
      console.log(err);
    }
  }

  const getTransactionSplits = async () => {
    try {
      const resp = await axios.post(
        `/api/transactions/retrieve/splits`,
        {
          group_id: groupId
        },
        { headers: { Authorization: `Bearer ${getToken(user)}` } }
      );
      
      if(resp.status >= 200 && resp.status < 300) {
        setTransactionSplitsRetrieved(resp.data);
      }
    } catch (err) {
      console.log(err);
    };
  }

  // Once the transaction splits are retrieved, this function will create a map of the splits
  useEffect(() => {
    if (transactionSplitsRetrieved.length > 0) {
      splitMapState.clear();
      for(var t in transactionSplitsRetrieved) {
        let temparr = splitMapState.get(transactionSplitsRetrieved[t].id);
        temparr ? temparr.push(transactionSplitsRetrieved[t]) : undefined;
        splitMapState.set(transactionSplitsRetrieved[t].id, temparr ? temparr : [transactionSplitsRetrieved[t]]);
      }
    }
  }, [transactionSplitsRetrieved]);


  //Gets the transactions associtated with the group
  const getTransactions = async () => {

    await getTransactionSplits();

    try {
      const resp = await axios.post(
        `/api/transactions/retrieve`,
        { group_id: groupId },
        { headers: { Authorization: `Bearer ${getToken(user)}` } },
      );
      setTransactionsRetrieved(resp.data);
      setDataRecieved(true);
    } catch (err) {
      console.log(err);
    } 
  }

  //Creates a new transaction associated with the group
  const createTransaction = async (e:  MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if(groupUsersSplitting.length < 2) {
      alert('You must split the transaction with at least 2 users');
      return;
    }
    setDisableCreate(true);
    const splits: TransactionSplit[] = [];
    var sharePercent = 100 / groupUsersSplitting.length;
    
    if (manualSplit) {
      
    } else {
      groupUsersSplitting.forEach((user: any) => {
        splits.push({user_id: user.id, share: sharePercent});
      })
    }

    try {
      const resp = await axios.post(
        `/api/transactions/create`,
        {
          description: description,
          cost: Number(cost),
          group_id: groupId,
          splits: splits,
        },
        { headers: { Authorization: `Bearer ${getToken(user)}` } }
      );
      console.log(resp);
      console.log(resp.status)
      if(resp.status >= 200 && resp.status < 300) {
        getTransactions();
        getTransactionSplits();
        getUsersFromGroup();
        setGroupUsersSpltting([]);
        setShowCreate(false);
        setDisableCreate(false);
      }
    } catch (err) {
      console.log(err);
    };
  }

  const displayTransactionUsers = (arr: SplitTransaction[] | undefined, cost: number) => {
    console.log(groupUsersCopy)
    if(arr) {
      return (
        <div className='flex flex-row space-x-4'>
          
          {arr.map((split: SplitTransaction, index:number) => (
            <div key={index} className='flex flex-col space-y-2'>
              <img 
                className="rounded-full hover:cursor-pointer" 
                src={groupUsersCopy.find((value: User) => {
                  return split.user_id === value.id;
                })?.picture} 
                alt={"Couldn't find valid user"} width="50px"/>
              <p>${(cost * split.share/100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )
    } else {
      return <div>Users couldn't be identified</div>
    }
    
  }

  const displayUsersCreate = (display: any[], location: string) => {
    if(display.length !== 0) {
      return (
        <div className='flex flex-row space-x-4'>
          {display.map((user: any) => (
            <div key={user.id} className='flex flex-col justify-center items-center'>
              <img onClick={async () => {
                handleSplit(user, location)
              }} 
              className="rounded-full border-2 hover:border-violet-600 hover:cursor-pointer" src={user.picture} alt={user.name} width="50px"/>
              <div className='text-center'>{user.name}</div>
            </div>
          ))}
        </div>
      )
    } else {
      return (<></>)
    } 
  }

  const handleSplit = (user: any, location: string) => {
    if(location === 'ns') {
    //User is not splitting so add them to the list
      setGroupUsersSpltting([...groupUsersSplitting, user])
      setGroupUsers(groupUsers.filter((filter:any) => {
        if(user.id !== filter.id){
          return true
        }
      }))
    } else {
      //User is splitting so remove them from the list
      setGroupUsers([...groupUsers, user])
      setGroupUsersSpltting(groupUsersSplitting.filter((filter:any) => {
        if(user.id !== filter.id) {
          return true;
        }}
      ))
    }
  }

  //Shows the create group form
  const showTransaction = () => {
    setShowCreate(true)
  }

  return (
    <div className="flex flex-col space-y-4">
      <h1>Current Transactions</h1>
      <div className="flex flex-col space-y-4">
        {/* Displays all the transactions that are part of this group */}
        {dataRecieved ? (
          
          transactionsRetrieved.map((transaction: Transaction) => (
            <a 
              className="flex flex-col space-y-4 border-cyan-800 hover:cursor-pointer border" 
              key={transaction.id}
            >
              <h2>{transaction.description}</h2>
              <p>Cost: {Number(transaction.cost).toFixed(2)}</p>
              {/* display the users names for each transaction using the transaction.id as a key for the splitMapState Map */}
              {displayTransactionUsers(splitMapState.get(transaction.id), transaction.cost)}
             
              

            </a>
          ))
         ) : (
          <Loader />
         )}
        
        
      </div>
      <Button
        onClick={showTransaction}
      >
          Create a transaction
      </Button>
      {showCreate && (
        <form>
          <TextField
            label="Description"
            placeholder="Description"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          />
          <TextField 
            label="Cost"
            placeholder="Cost"
            type="number"
            inputMode="numeric"
            //set an on change to get the current value rounded to 2 decimal places
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCost(e.target.value)}
          />
          <SwitchField 
            label="Split Manually" 
            isChecked={manualSplit}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setManualSplit(e.target.checked)}
          />
          <div>
            <h1>Not Splitting</h1>
            {displayUsersCreate(groupUsers, 'ns')}
          </div>
          <div>
            <h1>Splitting</h1>
            {displayUsersCreate(groupUsersSplitting, 's')}
          </div>
          <Button
            onClick={(e: MouseEvent<HTMLButtonElement>) => {createTransaction(e)}}
            disabled={disableCreate}
          >
            Create Transaction
          </Button>
        </form>
      )}
    </div>
  )

}
