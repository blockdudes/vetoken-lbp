const API_URL = "https://eth-goerli.g.alchemy.com/v2/E53Vf_-Y1JiS7vFLqKO90m9vNAbhk58h"
const LBP_FACTORY_CONTRACT_ADDRESS = "0xb48Cc42C45d262534e46d5965a9Ac496F1B7a830"

const PUBLIC_KEY = "0xddf809c183EA9e5a268fFfEe5a6C26fc6e2fc525"
const PRIVATE_KEY = "49c9a17b9e705a0749cd2a0d358bec619a6e056e343c4d10c4619b93a83b9369"

const currentTime = parseInt(Date.now() / 1000)
const oneWeek = 60 * 60  * 24 * 7
const data = {
    name: "veToken Finance",
    symbol: "VE3D",
    veTokenAddress: "0x5631d8eA427129e15bDa68F0F9227C149bD29Dcf",
    ethAddress: "0x8c9e6c40d3402480ACE624730524fACC5482798c",
    startWeights: [
        "50000000000000000",
        "950000000000000000",
    ],
    endWeights: [
        "950000000000000000",
        "50000000000000000",
    ],
    ownerAddress: "0xddf809c183EA9e5a268fFfEe5a6C26fc6e2fc525",
    swapFee: "10000000000000000",
    swapEnabled: true,
    startTime: currentTime,
    endTime: currentTime + oneWeek
}



const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);
const factoryContract = require("../abi/LiquidityBootstrappingPoolFactory.json");
const poolContract = require("../abi/LiquidityBootstrappingPool.json");

const lbpFactoryContract = new web3.eth.Contract(factoryContract, LBP_FACTORY_CONTRACT_ADDRESS);

const params = [
    data.name,
    data.symbol,
    [
        data.veTokenAddress,
        data.ethAddress
    ],
    data.startWeights,
    data.swapFee,
    data.ownerAddress,
    data.swapFee
]

async function deploy() {

    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); // get latest nonce
    const gasEstimate = await lbpFactoryContract.methods.create(...params).estimateGas(); // estimate gas

    // Create the transaction
    const tx = {
        'from': PUBLIC_KEY,
        'to': LBP_FACTORY_CONTRACT_ADDRESS,
        'nonce': nonce,
        'gas': gasEstimate,
        'data': lbpFactoryContract.methods.create(...params).encodeABI()
    };

    let lbpPoolAddress = ''

    // Sign the transaction
    const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    signPromise.then((signedTx) => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (err, hash) {
            if (!err) {
                console.log("The hash of your transaction is: ", hash);
            } else {
                console.log("Something went wrong when submitting your transaction:", err)
            }
        }).then((receipt) => {
            lbpPoolAddress = receipt.logs[receipt.logs.length - 1].topics[1]
            if (lbpPoolAddress != '') {
                addLBPPoolWeights(lbpPoolAddress)
            }
        });
    }).catch((err) => {
        console.log("Promise failed:", err);
    });
    
    return lbpPoolAddress;

}

async function addLBPPoolWeights(lbpAddress) {
    const address = web3.eth.abi.decodeParameter('address', lbpAddress);

    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); // get latest nonce
    const lbpContract = new web3.eth.Contract(poolContract, address);
    const params = [
        data.startTime,
        data.endTime,
        data.endWeights
    ]
    const gasEstimate = await lbpContract.methods.updateWeightsGradually(...params).estimateGas({from: PUBLIC_KEY}); // estimate gas
    const tx = {
        'from': PUBLIC_KEY,
        'to': address,
        'nonce': nonce,
        'gas': gasEstimate,
        'data': lbpContract.methods.updateWeightsGradually(...params).encodeABI()
    };

    const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    signPromise.then((signedTx) => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (err, hash) {
        }).then(_ =>{
            console.log("LBP POOL ADDRESS = " + address)
        });
    }).catch((err) => {
        console.log("Promise failed:", err);
    });

}

deploy()


