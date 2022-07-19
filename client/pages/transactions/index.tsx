import styles from '../../styles/Home.module.css'
import { useState, ChangeEvent, MouseEvent, useEffect, Key } from 'react';
import { useRouter } from 'next/router'
import { Button, useAuthenticator, TextField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import axios from 'axios';

import getToken from '../../utils/getToken';
import getUserAttributes from '../../utils/getUserAttributes';


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



export default function transactions() {

  const router = useRouter();


  const {user} = useAuthenticator();
  const groupId = Number(router.query.groupid);
  
  interface TransactionSplit{
    user_id: string;
    share: number;
  }

  const [transactionsRetrieved, setTransactionsRetrieved] = useState([]);
  const [showCreate, setShowCreate] = useState(false)
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [splits, setSplits] = useState([])

  var lock = 0;

  //Runs once the user is logged in and verified, will only run once
  useEffect(() => {
    if(user && groupId && lock == 0) {
      lock = 1;
      getTransactions();
    }
  }, [user, groupId]);
 
  //Gets the users groups from the database
  const getTransactions = async () => {
    try {
      const resp = await axios.post(
        `/api/transactions/retrieve`,
        { group_id: groupId },
        { headers: { Authorization: `Bearer ${getToken(user)}` } },
      );
      setTransactionsRetrieved(resp.data);
    } catch (err) {
      console.log(err);
    }
  }

  //Creates a new group associated with the user
  const createTransaction = async (e:  MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const splits: TransactionSplit[] = [];
    const userId = getUserAttributes(user)?.sub
    splits.push({user_id: userId, share: 100});
    
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
      if(resp.status === 201) {
        getTransactions();  
        setShowCreate(false);
      }
    } catch (err) {
      console.log(err);
    };
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
        {transactionsRetrieved.map((transaction: Transaction) => (
          <a 
            className="flex flex-col space-y-4 border-cyan-800 hover:cursor-pointer border" 
            key={transaction.id}
          >
            <h2>{transaction.description}</h2>
            <p>Cost: {Number(transaction.cost).toFixed(2)}</p>
          </a>
        ))}
      </div>
      <Button
        onClick={showTransaction}
      >
          Create a transaction
      </Button>
      {showCreate && (
        <div>
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
          <Button
            onClick={(e: MouseEvent<HTMLButtonElement>) => {createTransaction(e)}}
          >
            Create Transaction
          </Button>
        </div>
      )}
    </div>
  )
}
