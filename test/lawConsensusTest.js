const LawConsensus = artifacts.require("LawConsensus");

contract("LawConsensus", (accounts) => {
  let lawConsensus;

  before(async () => {
    lawConsensus = await LawConsensus.deployed();
  });

  it("should allow an admin to submit a case", async () => {
    await lawConsensus.submitCase("Test Case Description", { from: accounts[0] });
    const caseDetails = await lawConsensus.getCase(1);
    assert.equal(caseDetails.description, "Test Case Description", "Case description should match");
  });

  it("should allow an admin to add a judge and advocates", async () => {
    await lawConsensus.addJudge(accounts[1], 1, { from: accounts[0] });
    await lawConsensus.addAdvocate(accounts[2], 1, { from: accounts[0] });
    await lawConsensus.addAdvocate(accounts[3], 1, { from: accounts[0] });
    
    const caseDetails = await lawConsensus.getCase(1);
    assert.equal(caseDetails.judge, accounts[1], "Judge should be assigned correctly");
    assert.equal(caseDetails.advocate1, accounts[2], "First advocate should be assigned correctly");
    assert.equal(caseDetails.advocate2, accounts[3], "Second advocate should be assigned correctly");
  });

  it("should allow a judge to approve a case", async () => {
    await lawConsensus.judgeApprove(1, { from: accounts[1] });
    const caseDetails = await lawConsensus.getCase(1);
    assert.equal(caseDetails.isResolved, true, "Case should be resolved");
    assert.equal(caseDetails.resolution, "Approved by Judges", "Resolution should be 'Approved by Judges'");
  });

  it("should allow a judge to reject a case", async () => {
    // Reset case for testing rejection
    await lawConsensus.submitCase("Test Case Rejection", { from: accounts[0] });
    await lawConsensus.addJudge(accounts[1], 2, { from: accounts[0] });
    await lawConsensus.addAdvocate(accounts[2], 2, { from: accounts[0] });
    await lawConsensus.addAdvocate(accounts[3], 2, { from: accounts[0] });

    await lawConsensus.judgeReject(2, { from: accounts[1] });
    const caseDetails = await lawConsensus.getCase(2);
    assert.equal(caseDetails.isResolved, true, "Case should be resolved");
    assert.equal(caseDetails.resolution, "Rejected by Judges", "Resolution should be 'Rejected by Judges'");
  });

  it("should allow messages to be sent within the case", async () => {
    // Adding messages to the case
    await lawConsensus.submitCase("Test Case message", { from: accounts[0] });
    await lawConsensus.addJudge(accounts[1], 3, { from: accounts[0] });
    await lawConsensus.addAdvocate(accounts[2], 3, { from: accounts[0] });
    await lawConsensus.addAdvocate(accounts[3], 3, { from: accounts[0] });
    await lawConsensus.sendMessage(3, "Message from advocate 1", "evidenceHash1", { from: accounts[2] });
    await lawConsensus.sendMessage(3, "Message from advocate 2", "evidenceHash2", { from: accounts[3] });

    const messages = await lawConsensus.getMessages(3);
    assert.equal(messages.length, 3, "There should be two messages");
    assert.equal(messages[0].text, "Message from advocate 1", "First message text should match");
    assert.equal(messages[1].text, "Message from advocate 2", "Second message text should match");
  });

  it("should close a case if the time limit is exceeded", async () => {
    // Simulating case time expiry by fast forwarding
    await new Promise(resolve => setTimeout(resolve, 350000)); // Wait for time to expire (simulate)
    await lawConsensus.closeCase(1, { from: accounts[0] });

    const caseDetails = await lawConsensus.getCase(1);
    assert.equal(caseDetails.isResolved, true, "Case should be resolved after time limit is exceeded");
    assert.equal(caseDetails.resolution, "Closed due to time limit", "Resolution should be 'Closed due to time limit'");
  });
});
