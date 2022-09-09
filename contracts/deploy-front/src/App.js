import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import * as LBP from './contract/deploy/lbp';

// let selectedAccount;

function App() {
  const [isHidden, setIsHidden] = useState(true);
  const [lbpPoolAddress, setLbpPoolAddress] = useState('');
  const [mainLbpPoolAddress, setMainLbpPoolAddress] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')

  let provider = window.ethereum;
  const web3 = new Web3(provider);
  async function connect() {
    if (window.ethereum) {
       const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
       const walletAddress = accounts[0];
        
       setSelectedAccount(walletAddress);
       console.log(`Wallet: ${walletAddress}`);
    } else {
     console.log("No wallet");
    }
  }

  connect()
  const deployContract = async () => {
    connect()

    const data = await LBP.deploy(web3, selectedAccount, ownerAddress);
    if (!data) {
      console.log("Something went wrong!!");
    } else {
      setLbpPoolAddress(data);
      setIsHidden(false);
    }

  }

  const changeWeight = async () => {
    connect()

    const address = await LBP.addLBPPoolWeights(web3, lbpPoolAddress, selectedAccount);
    setMainLbpPoolAddress(address)
  }

  return (
    <div>
      <Stack spacing={2} direction="row" sx={{ display: 'flex', justifyContent: 'center', marginTop: '4em' }}>
      <Button variant="contained" onClick={deployContract}>Deploy</Button>
      {
        !isHidden &&
        <Button variant="outlined" onClick={changeWeight}>Change Weights</Button>
      }

    </Stack>
    <br/>
      <center><div>{mainLbpPoolAddress ? "LBP Pool Address = " + mainLbpPoolAddress : ""}</div></center>
    </div>

  );
}

export default App;
