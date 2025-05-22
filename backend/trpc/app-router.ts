import { router } from './create-context';
import { hiProcedure } from './routes/example/hi/route';
import { transactionsRouter } from './routes/wallet/transactions';
import { usersRouter } from './routes/wallet/users';
import { currenciesRouter } from './routes/wallet/currencies';
import { notificationsRouter } from './routes/wallet/notifications';
import { supportRouter } from './routes/wallet/support';

export const appRouter = router({
  example: router({
    hi: hiProcedure,
  }),
  transactions: transactionsRouter,
  users: usersRouter,
  currencies: currenciesRouter,
  notifications: notificationsRouter,
  support: supportRouter,
});

export type AppRouter = typeof appRouter;