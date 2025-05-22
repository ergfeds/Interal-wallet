import { Currency } from '@/types/wallet';

export const mockCurrencies: Currency[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    color: '#F7931A',
    exchangeRate: 40000,
    logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    color: '#627EEA',
    exchangeRate: 2500,
    logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    decimals: 6,
    color: '#26A17B',
    exchangeRate: 1,
    logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    color: '#2775CA',
    exchangeRate: 1,
    logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  },
  {
    id: 'bnb',
    name: 'Binance Coin',
    symbol: 'BNB',
    decimals: 18,
    color: '#F3BA2F',
    exchangeRate: 350,
    logoUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    color: '#00FFA3',
    exchangeRate: 100,
    logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png'
  },
  {
    id: 'ada',
    name: 'Cardano',
    symbol: 'ADA',
    decimals: 6,
    color: '#0033AD',
    exchangeRate: 0.5,
    logoUrl: 'https://cryptologos.cc/logos/cardano-ada-logo.png'
  },
  {
    id: 'xrp',
    name: 'XRP',
    symbol: 'XRP',
    decimals: 6,
    color: '#23292F',
    exchangeRate: 0.6,
    logoUrl: 'https://cryptologos.cc/logos/xrp-xrp-logo.png'
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    symbol: 'DOGE',
    decimals: 8,
    color: '#C2A633',
    exchangeRate: 0.1,
    logoUrl: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png'
  },
  {
    id: 'dot',
    name: 'Polkadot',
    symbol: 'DOT',
    decimals: 10,
    color: '#E6007A',
    exchangeRate: 7,
    logoUrl: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png'
  }
];