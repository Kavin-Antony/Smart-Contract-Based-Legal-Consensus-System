import Web3 from 'web3';
import LawConsensusArtifact from './LawConsensus.json';

const CONTRACT_ADDRESS = "0xf9b8962C78D058CAa95cb0D19AE58b4EDE438C7E"; // From how to run the code.txt? Wait, let's look at the actual address deployed in Ganache. Oh, in how to run the code.txt it says `admin = 0xf9b8962C78D058CAa95cb0D19AE58b4EDE438C7E`, not the contract address.
// Wait, to get the contract address dynamically in React, we can read it from the network ID if it deployed using Truffle.

let web3;
let lawConsensusContract;

export const initWeb3 = async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Get current network ID
            const networkId = await web3.eth.net.getId();
            // Truffle artifact stores deployed networks under networks[networkId]
            const deployedNetwork = LawConsensusArtifact.networks[networkId];

            if (deployedNetwork) {
                lawConsensusContract = new web3.eth.Contract(
                    LawConsensusArtifact.abi,
                    deployedNetwork.address
                );
                return { web3, contract: lawConsensusContract, success: true };
            } else {
                console.error("Smart contract not deployed to detected network.");
                return { success: false, error: "Contract not deployed to the current network. Please switch to Ganache." };
            }
        } catch (error) {
            console.error("User denied account access or error occurred");
            return { success: false, error: error.message };
        }
    }
    else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
        console.warn("Using injected web3 (legacy)");
        return { success: false, error: "Please update your MetaMask." };
    }
    else {
        console.error("Non-Ethereum browser detected. You should consider trying MetaMask!");
        return { success: false, error: "MetaMask not detected. Please install it." };
    }
};

export const getWeb3 = () => web3;
export const getContract = () => lawConsensusContract;
