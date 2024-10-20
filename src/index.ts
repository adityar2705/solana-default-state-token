//importing the necessary packages
import {
    AccountState,
    TOKEN_2022_PROGRAM_ID,
    getAccount,
    mintTo,
    thawAccount,
    transfer,
    createAccount,
} from "@solana/spl-token";

//import our default state mint function
import { createTokenExtensionMintWithDefaultState } from "./mint-helpers";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { initializeKeypair, makeKeypairs } from "@solana-developers/helpers";

//create a new connection
const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const payer = await initializeKeypair(connection);

//create the mint, our token account and other account addresses
const [mintKeypair, ourTokenAccountKeypair, otherTokenAccountKeypair] = makeKeypairs(3);
const mint = mintKeypair.publicKey;
const decimals = 2;
const defaultState = AccountState.Frozen;
const ourTokenAccount = ourTokenAccountKeypair.publicKey;
const otherTokenAccount = otherTokenAccountKeypair.publicKey;

//amount to mint and transfer
const amountToMint = 1000;
const amountToTransfer = 50;

//create the mint using our custom function
await createTokenExtensionMintWithDefaultState(connection, payer, mintKeypair, decimals, defaultState);

//create the test token accounts
//transferring from token account
await createAccount(connection, payer, mint, payer.publicKey, ourTokenAccountKeypair, undefined, TOKEN_2022_PROGRAM_ID);

//transferring to token account
await createAccount(connection, payer, mint, payer.publicKey, otherTokenAccountKeypair, undefined, TOKEN_2022_PROGRAM_ID);

//Test 1 : mint without thawing (unfreezing) 
try{
    await mintTo(connection, payer, mint, ourTokenAccount, payer.publicKey, amountToMint, undefined, undefined, TOKEN_2022_PROGRAM_ID);
}catch(error){
    console.log(
        "✅ - We expected this to fail because the account is still frozen.",
    );
}

//Test 2 : mint after thawing (unfreezing)
await thawAccount(connection, payer, ourTokenAccount, mint, payer.publicKey, undefined, undefined, TOKEN_2022_PROGRAM_ID);
await mintTo(connection, payer, mint, ourTokenAccount, payer.publicKey, amountToMint, undefined, undefined, TOKEN_2022_PROGRAM_ID);


const accountAfterMinting = await getAccount(connection,ourTokenAccount, undefined, TOKEN_2022_PROGRAM_ID);
console.log(`✅ - The new account balance is ${Number(accountAfterMinting.amount)} after thawing and minting.`,);

//Test 3 : Transferring after thawing the recipient's account
await thawAccount(connection, payer, otherTokenAccount, mint, payer.publicKey, undefined, undefined, TOKEN_2022_PROGRAM_ID);
await transfer(connection, payer, ourTokenAccount, otherTokenAccount, payer, amountToTransfer, undefined, undefined, TOKEN_2022_PROGRAM_ID);
const otherTokenAccountWithTokens = await getAccount(
    connection,
    otherTokenAccount,
    undefined,
    TOKEN_2022_PROGRAM_ID,
);
   
console.log(
    `✅ - The new account balance is ${Number(
    otherTokenAccountWithTokens.amount,
    )} after thawing and transferring.`,
);
