import { publicProcedure, router } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { Currency } from '@/types/wallet';

// Mock data
let currencies: Currency[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    color: '#F7931A',
    exchangeRate: 40000, // USD per 1 BTC
    logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    color: '#627EEA',
    exchangeRate: 2000, // USD per 1 ETH
    logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    decimals: 6,
    color: '#26A17B',
    exchangeRate: 1, // USD per 1 USDT
    logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
  }
];

export const currenciesRouter = router({
  getAll: publicProcedure.query(() => {
    return currencies;
  }),
  
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const currency = currencies.find(c => c.id === input.id);
      if (!currency) {
        throw new Error('Currency not found');
      }
      return currency;
    }),
  
  updateExchangeRate: publicProcedure
    .input(z.object({
      id: z.string(),
      exchangeRate: z.number().positive()
    }))
    .mutation(({ input }) => {
      const currencyIndex = currencies.findIndex(c => c.id === input.id);
      if (currencyIndex === -1) {
        throw new Error('Currency not found');
      }
      
      currencies[currencyIndex].exchangeRate = input.exchangeRate;
      return currencies[currencyIndex];
    })
});