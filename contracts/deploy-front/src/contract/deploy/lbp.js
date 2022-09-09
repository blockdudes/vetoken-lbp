

const LBP_FACTORY_CONTRACT_ADDRESS = "0xb48Cc42C45d262534e46d5965a9Ac496F1B7a830" // GOERLI
const currentTime = parseInt(Date.now() / 1000)
const oneWeek = 60 * 60 * 24 * 7

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
    swapFee: "10000000000000000",
    swapEnabled: true,
    startTime: currentTime,
    endTime: currentTime + oneWeek
}


const factoryContract = require("../abi/LiquidityBootstrappingPoolFactory.json");
const poolContract = require("../abi/LiquidityBootstrappingPool.json");


export async function deploy(web3, selectedAccount, ownerAddress = "") {
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
        selectedAccount,
        data.swapFee
    ]
    // Create the transaction
    const transactionData = await lbpFactoryContract.methods.create(...params).send({from: selectedAccount})
    let lbpPoolAddress = transactionData.events['PoolCreated'].raw.topics[1];
    console.log(lbpPoolAddress)

    if (lbpPoolAddress != '') {
        return lbpPoolAddress;
    } else {
        return null;
    }
}

export async function addLBPPoolWeights(web3, lbpAddress, selectedAccount) {
    const address = web3.eth.abi.decodeParameter('address', lbpAddress);

    const lbpContract = new web3.eth.Contract(poolContract, address);
    const params = [
        data.startTime,
        data.endTime,
        data.endWeights
    ]
    await lbpContract.methods.updateWeightsGradually(...params).send({from: selectedAccount})
    return address
}



