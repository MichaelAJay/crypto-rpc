const SolRPC = require('./SolRpc');
const SolKit = require('@solana/kit');
const SolToken = require('@solana-program/token');

class SplRPC extends SolRPC {
  constructor(config) {
    super(config);
  }

  /**
   * Sends a specified amount of an SPL token to a given address, either through a versioned or legacy transaction.
   * 
   * @param {Object} params - The parameters for the transaction.
   * @param {string} params.address - The address of the SOL wallet for the recipient.
   * @param {number} params.amount - The amount of SPL tokens to send.
   * @param {SolKit.KeyPairSigner<string>} params.fromAccountKeypair - The keypair of the sender - used as fee payer.
   * @param {string} [params.nonceAddress] - The public key of the nonce account
   * @param {string} [params.nonceAuthorityAddress] - The public key of the nonce account's authority - if not included, nonceAddress
   * @param {'legacy' | 0} [params.txType='legacy'] - The type of transaction ('legacy' or '0' for versioned).
   * @param {boolean} [params.priority=false] - Whether to add a priority fee to the transaction.
   * @param {string} params.mintAddress
   * @param {string} params.decimals
   * @param {string} [params.destinationAta] - The address of the ATA associated with the 'address' wallet for the provided 'mint'. If not provided, is derived - fee payer pays for address creation
   * @param {string} [params.sourceAta] - The address of the ATA associated with the 'fromAccountKeypair.address' wallet for the provided mint. If not provided, is derived - fee payer pays for address creation
   * @returns {Promise<string>} The transaction hash.
   * @throws {Error} If the transaction confirmation returns an error.
   */
  async sendToAddress({ 
    address: addressStr,
    amount,
    fromAccountKeypair: fromAccountKeypairSigner,
    nonceAddress: nonceAddressStr,
    txType: version = 'legacy',
    priority,
    mintAddress,
    decimals,
    destinationAta,
    sourceAta
  }) {
    try {
      const VALID_TX_VERSIONS = ['legacy', 0];
      if (!VALID_TX_VERSIONS.includes(version)) {
        throw new Error('Invalid transaction version');
      }
      // To ensure sender's signature is in place
      const feePayerKeypairSigner = fromAccountKeypairSigner;

      const destinationAtaAddress = destinationAta ? SolKit.address(destinationAta) : await this.getOrCreateAta({ owner: SolKit.address(addressStr), mint: mintAddress, feePayer: feePayerKeypairSigner });
      const sourceAtaAddress = sourceAta ? SolKit.address(sourceAta) : await this.getOrCreateAta({ owner: fromAccountKeypairSigner.address, mint: mintAddress, feePayer: feePayerKeypairSigner });

      let transactionMessage = await this._createBaseTransactionMessage({ version, feePayerKeypairSigner, nonceAddressStr, priority });
      transactionMessage = SolKit.appendTransactionMessageInstructions(
        [
          SolToken.getTransferCheckedInstruction({
            source: sourceAtaAddress,
            authority: fromAccountKeypairSigner.address,
            mint: SolKit.address(mintAddress),
            destination: destinationAtaAddress,
            amount,
            decimals
          })
        ],
        transactionMessage
      );
      const txid = await this._sendAndConfirmTransaction({ transferTransactionMessage: transactionMessage, nonceAddressStr, commitment: 'confirmed' });
      return { txid, destinationAta: destinationAtaAddress, sourceAta: sourceAtaAddress };
    } catch (err) {
      this.emitter.emit(`Failure sending a type ${version} transaction to address ${addressStr}`, err);
      throw err;
    }
  }

  /**
   * Retrieves an ATA address for the specified owner if it exists, or creates it 
   * @param {Object} params
   * @param {SolKit.Address<string>} params.owner
   * @param {string} params.mint
   * @param {SolKit.KeyPairSigner<string>} params.feePayer
   */
  async getOrCreateAta({ owner, mint, feePayer }) {
    const createAtaResult = await this.createAta({ ownerAddress: owner, mintAddress: mint, feePayer });
    return createAtaResult.ataAddress;
  }
}

module.exports = SplRPC;