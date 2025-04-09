const SOL_ERROR_MESSAGES = {
  ATA_NOT_INITIALIZED: 'ATA not initialized on mint for provided account. Initialize ATA first.',
  INVALID_MINT_PARAMETER: 'SolanaError: Invalid parameter (mint)',
  UNSPECIFIED_INVALID_PARAMETER: 'SolanaError: Invalid parameter (unspecified)',
  NON_BASE58_PARAM: 'SolanaError: Provided parameters includes non-base58 string.',
  TOKEN_ACCOUNT_NOT_FOUND: 'SolanaError: Account could not be found corresponding to provided address',
  PROVIDED_TOKEN_ADDRESS_IS_SOL: 'SolanaError: Provided address is a SOL address but should be a token address'
};

module.exports = SOL_ERROR_MESSAGES;