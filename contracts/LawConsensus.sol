// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LawConsensus {
    struct Case {
        uint256 caseId;
        string description;
        address advocate1;
        address advocate2;
        address judge;
        bool isResolved;
        string resolution;
        uint256 judgeApprovals;
        uint256 judgeRejections;
        uint256 submissionTime;
    }

    struct Message {
        address sender;
        string text;
        string evidenceHash;
        uint256 timestamp;
    }

    address public admin;
    mapping(address => bool) public judges;
    mapping(uint256 => Case) public cases;
    mapping(uint256 => Message[]) public caseMessages;
    uint256 public caseCounter;
    uint256 public caseDuration = 1000; // Time limit for case resolution

    event CaseSubmitted(uint256 caseId, string description, address advocate);
    event CaseResolved(uint256 caseId, string resolution);
    event JudgeApproval(uint256 caseId, address judge);
    event JudgeRejection(uint256 caseId, address judge);
    event MessageSent(uint256 caseId, address sender, string text, string evidenceHash);
    event JudgeAssigned(uint256 caseId, address judge);
    event AdvocateAssigned(uint256 caseId, address advocate);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyJudge() {
        require(judges[msg.sender], "Only judges can perform this action");
        _;
    }

    modifier caseExists(uint256 caseId) {
        require(cases[caseId].caseId != 0, "Case does not exist");
        _;
    }

    modifier hasJudge(uint256 caseId) {
        require(cases[caseId].judge != address(0), "Judge is not assigned");
        _;
    }

    modifier hasTwoAdvocates(uint256 caseId) {
        require(cases[caseId].advocate1 != address(0) && cases[caseId].advocate2 != address(0), "Two advocates are not assigned");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addJudge(address judge, uint256 caseId) public onlyAdmin caseExists(caseId) {
    require(cases[caseId].judge == address(0), "Judge already assigned");
    cases[caseId].judge = judge;
    judges[judge] = true;  // Add the judge to the judges mapping
    emit JudgeAssigned(caseId, judge);
}


    function addAdvocate(address advocate, uint256 caseId) public onlyAdmin caseExists(caseId) {
        require(cases[caseId].advocate1 == address(0) || cases[caseId].advocate2 == address(0), "Both advocates already assigned");

        if (cases[caseId].advocate1 == address(0)) {
            cases[caseId].advocate1 = advocate;
        } else {
            cases[caseId].advocate2 = advocate;
        }

        emit AdvocateAssigned(caseId, advocate);
    }

    function submitCase(string memory description) public {
        caseCounter++;
        cases[caseCounter] = Case(caseCounter, description, address(0), address(0), address(0), false, "", 0, 0, block.timestamp); 
        emit CaseSubmitted(caseCounter, description, msg.sender);
    }

    function sendMessage(uint256 caseId, string memory text, string memory evidenceHash) public caseExists(caseId) hasJudge(caseId) hasTwoAdvocates(caseId) {
        require(!cases[caseId].isResolved, "Case already resolved");
        require(block.timestamp <= cases[caseId].submissionTime + caseDuration, "Case time expired for messages");
        caseMessages[caseId].push(Message(msg.sender, text, evidenceHash, block.timestamp));
        emit MessageSent(caseId, msg.sender, text, evidenceHash);
    }

    function judgeApprove(uint256 caseId) public onlyJudge caseExists(caseId) hasJudge(caseId) {
        require(!cases[caseId].isResolved, "Case already resolved");

        cases[caseId].judgeApprovals++;
        emit JudgeApproval(caseId, msg.sender);

        if (cases[caseId].judgeApprovals == 1) {
            cases[caseId].isResolved = true;
            cases[caseId].resolution = "Approved by Judges";
            emit CaseResolved(caseId, "Approved by Judges");
        }
    }

    function judgeReject(uint256 caseId) public onlyJudge caseExists(caseId) hasJudge(caseId) {
        require(!cases[caseId].isResolved, "Case already resolved");

        cases[caseId].judgeRejections++;
        emit JudgeRejection(caseId, msg.sender);

        if (cases[caseId].judgeRejections == 1) {
            cases[caseId].isResolved = true;
            cases[caseId].resolution = "Rejected by Judges";
            emit CaseResolved(caseId, "Rejected by Judges");
        }
    }

    function getCase(uint256 caseId)
        public
        view
        caseExists(caseId)
        returns (
            uint256 caseId_,
            string memory description,
            address advocate1,
            address advocate2,
            address judge,
            bool isResolved,
            string memory resolution,
            uint256 judgeApprovals,
            uint256 judgeRejections
        )
    {
        Case memory c = cases[caseId];
        return (c.caseId, c.description, c.advocate1, c.advocate2, c.judge, c.isResolved, c.resolution, c.judgeApprovals, c.judgeRejections);
    }

    function getMessages(uint256 caseId) public view caseExists(caseId) returns (Message[] memory) {
        return caseMessages[caseId];
    }

    function closeCase(uint256 caseId) public onlyAdmin caseExists(caseId) {
        require(block.timestamp > cases[caseId].submissionTime + caseDuration, "Time limit not yet exceeded");
        require(!cases[caseId].isResolved, "Case already resolved");

        cases[caseId].isResolved = true;
        cases[caseId].resolution = "Closed due to time limit";
        emit CaseResolved(caseId, "Closed due to time limit");
    }
}
