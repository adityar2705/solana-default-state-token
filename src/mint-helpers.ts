//import the necessary packages
import {
    AccountState,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeDefaultAccountStateInstruction,
    createInitializeMintInstruction,
    getMintLen,
} from "@solana/spl-token";

import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    TransactionSignature,
    sendAndConfirmTransaction,
} from "@solana/web3.js";

//function to create the default state mint account
export async function createTokenExtensionMintWithDefaultState(
    connection : Connection,
    payer : Keypair,
    mintKeypair : Keypair,
    decimals : number = 2,
    defaultState : AccountState
): Promise<TransactionSignature>{
    const mintLen = getMintLen([ExtensionType.DefaultAccountState]);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    //create new transaction with all the instructions
    const transaction = new Transaction().add(
        //create the mint account
        SystemProgram.createAccount({
            fromPubkey : payer.publicKey,
            newAccountPubkey : mintKeypair.publicKey,
            space : mintLen,
            lamports,
            programId : TOKEN_2022_PROGRAM_ID
        }),

        //initialize the default state mint extensions
        createInitializeDefaultAccountStateInstruction(
            mintKeypair.publicKey,
            defaultState,
            TOKEN_2022_PROGRAM_ID
        ),

        //initialize the mint formally
        createInitializeMintInstruction(
            mintKeypair.publicKey,
            decimals,
            payer.publicKey, //designated mint authority
            payer.publicKey, //designated freeze authority
            TOKEN_2022_PROGRAM_ID
        )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair]);
    return signature;
}