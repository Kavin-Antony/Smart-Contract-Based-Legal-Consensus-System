// Assuming the Web3 instance is already connected to the Ethereum network (using MetaMask)
let web3;
let contract;
const contractAddress = '0x30f17f7FCE2debC096a1A7fD3a0Cd80d08d84621';
const abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "advocate",
          "type": "address"
        }
      ],
      "name": "AdvocateAssigned",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "resolution",
          "type": "string"
        }
      ],
      "name": "CaseResolved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "advocate",
          "type": "address"
        }
      ],
      "name": "CaseSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "judge",
          "type": "address"
        }
      ],
      "name": "JudgeApproval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "judge",
          "type": "address"
        }
      ],
      "name": "JudgeAssigned",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "judge",
          "type": "address"
        }
      ],
      "name": "JudgeRejection",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "text",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "evidenceHash",
          "type": "string"
        }
      ],
      "name": "MessageSent",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "caseCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "caseDuration",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "caseMessages",
      "outputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "text",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "evidenceHash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "cases",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "advocate1",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "advocate2",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "judge",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isResolved",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "resolution",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "judgeApprovals",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "judgeRejections",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "submissionTime",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "judges",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "judge",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        }
      ],
      "name": "addJudge",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "advocate",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        }
      ],
      "name": "addAdvocate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        }
      ],
      "name": "submitCase",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "text",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "evidenceHash",
          "type": "string"
        }
      ],
      "name": "sendMessage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        }
      ],
      "name": "judgeApprove",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        }
      ],
      "name": "judgeReject",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        }
      ],
      "name": "getCase",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "caseId_",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "advocate1",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "advocate2",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "judge",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isResolved",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "resolution",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "judgeApprovals",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "judgeRejections",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        }
      ],
      "name": "getMessages",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "text",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "evidenceHash",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct LawConsensus.Message[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "caseId",
          "type": "uint256"
        }
      ],
      "name": "closeCase",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
      web3 = new Web3(window.ethereum);
      await window.ethereum.enable(); // Request account access
      contract = new web3.eth.Contract(abi, contractAddress);
    } else {
      alert('Please install MetaMask!');
    }
  });
  
  function showCaseDetails() {
    document.getElementById('caseDetailsPage').style.display = 'block';
    document.getElementById('messagesPage').style.display = 'none';
  }
  
  function showMessages() {
    document.getElementById('caseDetailsPage').style.display = 'none';
    document.getElementById('messagesPage').style.display = 'block';
  }
  
  async function getCaseDetails() {
    const caseId = document.getElementById('caseId').value;
    if (!caseId) return alert('Please enter a case ID.');
  
    const caseDetails = await contract.methods.getCase(caseId).call();
    const caseDiv = document.getElementById('caseDetails');
    caseDiv.innerHTML = `
      <p><strong>Case ID:</strong> ${caseDetails.caseId_}</p>
      <p><strong>Description:</strong> ${caseDetails.description}</p>
      <p><strong>Advocate 1:</strong> ${caseDetails.advocate1}</p>
      <p><strong>Advocate 2:</strong> ${caseDetails.advocate2}</p>
      <p><strong>Judge:</strong> ${caseDetails.judge}</p>
      <p><strong>Is Resolved:</strong> ${caseDetails.isResolved}</p>
      <p><strong>Resolution:</strong> ${caseDetails.resolution}</p>
      <p><strong>Judge Approvals:</strong> ${caseDetails.judgeApprovals}</p>
      <p><strong>Judge Rejections:</strong> ${caseDetails.judgeRejections}</p>
    `;
  }
  
  async function getMessages() {
    const caseId = document.getElementById('caseIdMessages').value;
    if (!caseId) return alert('Please enter a case ID.');
  
    const messages = await contract.methods.getMessages(caseId).call();
    const messagesDiv = document.getElementById('caseMessages');
    messagesDiv.innerHTML = '';
  
    if (messages.length === 0) {
      messagesDiv.innerHTML = '<p>No messages available for this case.</p>';
      return;
    }
  
    messages.forEach(msg => {
      messagesDiv.innerHTML += `
        <p><strong>Sender:</strong> ${msg.sender}</p>
        <p><strong>Text:</strong> ${msg.text}</p>
        <p><strong>Evidence Hash:</strong> ${msg.evidenceHash}</p>
        <p><strong>Timestamp:</strong> ${new Date(msg.timestamp * 1000).toLocaleString()}</p>
        <hr>
      `;
    });
  }
