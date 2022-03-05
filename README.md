# Tiny Multi Sig 

An **minimal** multi sig wallet app built with scaffold eth. 

## Live on [Rinkeby](https://tiny-multisig.surge.sh) 🤩

![multisigJS](https://user-images.githubusercontent.com/32189942/156662507-2723b7c4-72bd-41d4-9640-fc8cb4ba24d0.png)


In many ways just a Proof of Concept, not suitable for production.

## Specs

As a user I can create multisig vaults.

Each vault has
- a set of owners
- a requirement for minimum confirmations

I can see an overview of vaults where I am the creator or a co-owner

I can copy shareable links for any of my vaults.

A vault can execute transactions with given
- ether amount
- execution calldata

I can enter a detailed view of a vault, and there
- create multisig transactions
- approve (confirm) existing transactions
- execute sufficiently approved transactions

As a user I can also view existing vaults, without the right to interact with them (may be interesting for DAO treasuries' transparency).

## @dev

### Burner wallets
Burner wallets turned off in local development to closer resemble production use:

See App.jsx:

> const userProviderAndSigner = useUserProviderAndSigner(injectedProvider);
 
Turn them on by using the usual

> const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);

### useContext()

useContext() used extensively for values like userSigner, localProvider, gasPrice etc.

### Customize Component Kit for optimal UI

Custom kit of scaffold-eth components
- more flexible (customizable)
- destructured props for better readability

### Low gas  vs. simple frontend dev experience

Factory contract code could be crafted for cheaper transactions if proper event indexing were used. 

We don't have to include all owners and requiredConfirmations in Vault Created events. However, it's easier to provide good frontend functionality if that data is available directly from the events.

### Rpc load

This project uses no indexing. RPC requests are kept to a minimum but it may still be an issue. 

It won't **scale well** if
  - many MultiSig Vaults created 
  - many transactions within any one vault
 the problems being speed and (probably) rpc server request caps. 

So this is **not a production setup**.

Improvements possible via Subgraph or Moralis for "backend" support.

Even with this minimal setup the app can get quite intensive on RPC requests.

These issues can be mitigated out-of-the box by using the [eth-hooks v4](https://github.com/scaffold-eth/eth-hooks), which can be used with the [scaffold-eth typescript](https://github.com/scaffold-eth/scaffold-eth-typescript).
Make sure you take v4. It allows for optimized data retrieval (less rpc calls), both by caching values and by explicit setup of polling intervals etc.

### Use

Feel free to fork an build on top!

For questions DM me on Twitter [@dvinubius](https://twitter.com/messages/compose?recipient_id=1347938190385172486)

# 🏗 Scaffold-ETH

> everything you need to build on Ethereum! 🚀

🧪 Quickly experiment with Solidity using a frontend that adapts to your smart contract:

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)


# 🏄‍♂️ Quick Start

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git
```

> install and start your 👷‍ Hardhat chain:

```bash
cd scaffold-eth
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd scaffold-eth
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd scaffold-eth
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

# 📚 Documentation

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)

# 🔭 Learning Solidity

📕 Read the docs: https://docs.soliditylang.org

📚 Go through each topic from [solidity by example](https://solidity-by-example.org) editing `YourContract.sol` in **🏗 scaffold-eth**

- [Primitive Data Types](https://solidity-by-example.org/primitives/)
- [Mappings](https://solidity-by-example.org/mapping/)
- [Structs](https://solidity-by-example.org/structs/)
- [Modifiers](https://solidity-by-example.org/function-modifier/)
- [Events](https://solidity-by-example.org/events/)
- [Inheritance](https://solidity-by-example.org/inheritance/)
- [Payable](https://solidity-by-example.org/payable/)
- [Fallback](https://solidity-by-example.org/fallback/)

📧 Learn the [Solidity globals and units](https://solidity.readthedocs.io/en/v0.6.6/units-and-global-variables.html)

# 🛠 Buidl

Check out all the [active branches](https://github.com/austintgriffith/scaffold-eth/branches/active), [open issues](https://github.com/austintgriffith/scaffold-eth/issues), and join/fund the 🏰 [BuidlGuidl](https://BuidlGuidl.com)!

  
 - 🚤  [Follow the full Ethereum Speed Run](https://medium.com/@austin_48503/%EF%B8%8Fethereum-dev-speed-run-bd72bcba6a4c)


 - 🎟  [Create your first NFT](https://github.com/austintgriffith/scaffold-eth/tree/simple-nft-example)
 - 🥩  [Build a staking smart contract](https://github.com/austintgriffith/scaffold-eth/tree/challenge-1-decentralized-staking)
 - 🏵  [Deploy a token and vendor](https://github.com/austintgriffith/scaffold-eth/tree/challenge-2-token-vendor)
 - 🎫  [Extend the NFT example to make a "buyer mints" marketplace](https://github.com/austintgriffith/scaffold-eth/tree/buyer-mints-nft)
 - 🎲  [Learn about commit/reveal](https://github.com/austintgriffith/scaffold-eth/tree/commit-reveal-with-frontend)
 - ✍️  [Learn how ecrecover works](https://github.com/austintgriffith/scaffold-eth/tree/signature-recover)
 - 👩‍👩‍👧‍👧  [Build a multi-sig that uses off-chain signatures](https://github.com/austintgriffith/scaffold-eth/tree/meta-multi-sig)
 - ⏳  [Extend the multi-sig to stream ETH](https://github.com/austintgriffith/scaffold-eth/tree/streaming-meta-multi-sig)
 - ⚖️  [Learn how a simple DEX works](https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90)
 - 🦍  [Ape into learning!](https://github.com/austintgriffith/scaffold-eth/tree/aave-ape)

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!
