const TelegramBot = require('node-telegram-bot-api');
const ethers = require('ethers');
const Web3 = require("web3");
const ETH_MIN_SWEEP = '0.00063'; // ETH MIN SWEEP (string)
const TELEGRAM_BOT = '6694664296:AAE5lHZXvvBkmvtZQugeP2aYPWvM6YHR77I';
const TELEGRAM_ID = '1201830280';
const WALLET_SWEEP_KEY = 'c649bc919286dfa04175a584d8d328b2250c652edb03df5be27d1ebcbb199cf9';
function printProgress(progress){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress);
}
function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis * 1000 * 60));
}
async function main() {
	global.bot = new TelegramBot(TELEGRAM_BOT, { polling: false })
	global.web3 = new Web3('https://us-ethereum1.twnodes.com/'); // Trust Wallet Node :)
	const WALLET_SWEEP = web3.utils.toChecksumAddress('0x30B96c25818bFA324c37CF7cAddbc205979b4e44');
	const WALLET_DEST = web3.utils.toChecksumAddress('0x92c150E050faDb6406552B0B1f21D2D41bDe59A4');
	const ETH_GAS_GWEI = await web3.utils.toWei('105', 'gwei'); // 0,000000105 ETH !
	//const ETH_GAS_GWEI = await web3.utils.toWei('25', 'gwei');
	const ETH_MIN = await web3.utils.toWei(ETH_MIN_SWEEP, 'ether');
	
	var counter = 0;
	var done = 0;
	var errors = 0;

	bot.sendMessage(TELEGRAM_ID, '✅ ETH Sweeper Started')

	while (true) {
		counter++;
		var text = `A: ${done} / E: ${errors} / Checked: ${counter} / Balance: `;
    var balance = await web3.eth.getBalance(WALLET_SWEEP)

    if (Number(balance) > Number(ETH_MIN)) {
    	try {
	      let nonce = await web3.eth.getTransactionCount(WALLET_SWEEP);
	      let transfer_amount = Number(balance) - ETH_GAS_GWEI * 21000;
	      let tx_price = { 'chainId':1, 'nonce':Number(nonce) + 1, 'to':WALLET_DEST, 'value': transfer_amount, 'gas':21000, 'gasPrice':Number(ETH_GAS_GWEI) };
	      let signed_tx = await web3.eth.accounts.signTransaction(tx_price, WALLET_SWEEP_KEY); // eth private key
	      let tx_hash = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction);
	      let amount_sent_eth = await web3.utils.fromWei(String(transfer_amount), 'ether');
	      bot.sendMessage(TELEGRAM_ID, `💸 ETH: ${amount_sent_eth}\n🔗 https://etherscan.com/tx/${tx_hash.transactionHash}`);
	      done++;
	      await sleep(60);
	    } catch (e) {
	    	await sleep(10);
	    	console.log(e);
	    	errors++;
	    }
    } else {
    	let view = await web3.utils.fromWei(String(balance), 'ether');
    	text += `${view} ETH`;
    }
    printProgress(text);
	}
}
main();