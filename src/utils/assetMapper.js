const ASSET_ALIASES = {
  bitcoin: 'BTC',
  btc: 'BTC',
  ethereum: 'ETH',
  eth: 'ETH',
  litecoin: 'LTC',
  ltc: 'LTC',
  solana: 'SOL',
  sol: 'SOL',
  cardano: 'ADA',
  ada: 'ADA',
  ripple: 'XRP',
  xrp: 'XRP',
  dogecoin: 'DOGE',
  doge: 'DOGE',
};

function normalizeAsset(asset) {
  if (asset === null || asset === undefined || asset === '') {
    return '';
  }

  const trimmed = String(asset).trim();
  if (!trimmed) {
    return '';
  }

  const aliasKey = trimmed.toLowerCase();
  if (ASSET_ALIASES[aliasKey]) {
    return ASSET_ALIASES[aliasKey];
  }

  return trimmed.toUpperCase();
}

module.exports = { normalizeAsset, ASSET_ALIASES };
