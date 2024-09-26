'use client'

import { AddLiquidityProvider } from '@/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { RemoveLiquidityProvider } from '@/lib/modules/pool/actions/remove-liquidity/RemoveLiquidityProvider'
import { BaseVariant } from '@/lib/modules/pool/pool.types'
import { PoolProvider } from '@/lib/modules/pool/PoolProvider'
import { RelayerSignatureProvider } from '@/lib/modules/relayer/RelayerSignatureProvider'
import {
  defaultGetTokenPricesQueryMock,
  defaultGetTokensQueryMock,
  defaultGetTokensQueryVariablesMock,
} from '@/lib/modules/tokens/__mocks__/token.builders'
import { TokenInputsValidationProvider } from '@/lib/modules/tokens/TokenInputsValidationProvider'
import { TokensProvider } from '@/lib/modules/tokens/TokensProvider'
import { RecentTransactionsProvider } from '@/lib/modules/transactions/RecentTransactionsProvider'
import { TransactionStateProvider } from '@/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { UserSettingsProvider } from '@/lib/modules/user/settings/UserSettingsProvider'
import { UserAccountProvider } from '@/lib/modules/web3/UserAccountProvider'
import { GqlPoolElement } from '@repo/api/graphql'
import { testWagmiConfig } from '@/test/anvil/testWagmiConfig'
import { ApolloProvider } from '@apollo/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RenderHookOptions, renderHook, waitFor } from '@testing-library/react'
import { PropsWithChildren, ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { aGqlPoolElementMock } from '../msw/builders/gqlPoolElement.builders'
import { apolloTestClient } from './apollo-test-client'
import { AppRouterContextProviderMock } from './app-router-context-provider-mock'
import { testQueryClient } from './react-query'

export type Wrapper = ({ children }: PropsWithChildren) => ReactNode

export function EmptyWrapper({ children }: PropsWithChildren) {
  return <>{children}</>
}

export function testHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps> | undefined
) {
  function MixedProviders({ children }: PropsWithChildren) {
    const LocalProviders = options?.wrapper || EmptyWrapper

    return (
      <GlobalProviders>
        <LocalProviders>{children}</LocalProviders>
      </GlobalProviders>
    )
  }

  const result = renderHook<TResult, TProps>(hook, {
    ...options,
    wrapper: MixedProviders as React.ComponentType<{ children: React.ReactNode }>,
  })

  return {
    ...result,
    waitForLoadedUseQuery,
  }
}

function GlobalProviders({ children }: PropsWithChildren) {
  const defaultRouterOptions = {}

  return (
    <WagmiProvider config={testWagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={testQueryClient}>
        <AppRouterContextProviderMock router={defaultRouterOptions}>
          <ApolloProvider client={apolloTestClient}>
            <UserAccountProvider>
              <TokensProvider
                tokenPricesData={defaultGetTokenPricesQueryMock}
                tokensData={defaultGetTokensQueryMock}
                variables={defaultGetTokensQueryVariablesMock}
              >
                <UserSettingsProvider
                  initAcceptedPolicies={undefined}
                  initCurrency="USD"
                  initEnableSignatures="yes"
                  initPoolListView="list"
                  initSlippage="0.2"
                >
                  <RecentTransactionsProvider>{children}</RecentTransactionsProvider>
                </UserSettingsProvider>
              </TokensProvider>
            </UserAccountProvider>
          </ApolloProvider>
        </AppRouterContextProviderMock>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

/**
 *
 * Helper to await for useQuery to finish loading when testing hooks
 *
 * @param hookResult is the result of calling renderHookWithDefaultProviders
 *
 *  Example:
 *    const { result, waitForLoadedUseQuery } = testHook(() => _useMyHookUnderTest())
 *    await waitForLoadedUseQuery(result)
 *
 */
export async function waitForLoadedUseQuery(hookResult: { current: { loading: boolean } }) {
  await waitFor(() => expect(hookResult.current.loading).toBeFalsy())
}

export function DefaultAddLiquidityTestProvider({ children }: PropsWithChildren) {
  return (
    <RelayerSignatureProvider>
      <TokenInputsValidationProvider>
        <AddLiquidityProvider>{children}</AddLiquidityProvider>
      </TokenInputsValidationProvider>
    </RelayerSignatureProvider>
  )
}

export function DefaultRemoveLiquidityTestProvider({ children }: PropsWithChildren) {
  return (
    <RelayerSignatureProvider>
      <RemoveLiquidityProvider>{children}</RemoveLiquidityProvider>
    </RelayerSignatureProvider>
  )
}

/* Builds a PoolProvider that injects the provided pool data*/
export const buildDefaultPoolTestProvider = (pool: GqlPoolElement = aGqlPoolElementMock()) =>
  // eslint-disable-next-line react/display-name
  function ({ children }: PropsWithChildren) {
    return (
      <TransactionStateProvider>
        <RelayerSignatureProvider>
          <PoolProvider
            chain={pool.chain}
            data={{
              __typename: 'Query',
              pool,
            }}
            id={pool.id}
            variant={BaseVariant.v2}
          >
            {children}
          </PoolProvider>
        </RelayerSignatureProvider>
      </TransactionStateProvider>
    )
  }

export const DefaultPoolTestProvider = buildDefaultPoolTestProvider(aGqlPoolElementMock())
