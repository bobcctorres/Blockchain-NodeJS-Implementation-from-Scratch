// Global configuration set up

const DIFFICULTY = 4; // Reset accordingly on miner
const MINE_RATE = 3000; //milliseconds
// It's a implementation set up, give each wallet 500 coins to start with to get the economy going
const INITIAL_BALANCE = 500;
const MINING_REWARD = 50;  // miner reward

module.exports = { DIFFICULTY, MINE_RATE, INITIAL_BALANCE, MINING_REWARD };
