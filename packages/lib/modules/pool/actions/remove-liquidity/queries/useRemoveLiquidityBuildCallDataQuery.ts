'use client'

import { useQuery } from '@tanstack/react-query'
import { RemoveLiquidityParams, removeLiquidityKeys } from './remove-liquidity-keys'
import { ensureLastQueryResponse } from '../../LiquidityActionHelpers'
import { usePool } from '../../../PoolProvider'
import { HumanAmount } from '@balancer/sdk'
import { RemoveLiquidityHandler } from '../handlers/RemoveLiquidity.handler'
import { Address } from 'viem/accounts'
import { RemoveLiquiditySimulationQueryResult } from './useRemoveLiquiditySimulationQuery'
import { useDebounce } from 'use-debounce'
import { defaultDebounceMs, onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { sentryMetaForRemoveLiquidityHandler } from '@repo/lib/shared/utils/query-errors'
import { useRelayerSignature } from '../../../../relayer/RelayerSignatureProvider'
import { useUserSettings } from '../../../../user/settings/UserSettingsProvider'
import { useUserAccount } from '../../../../web3/UserAccountProvider'

export type RemoveLiquidityBuildQueryResponse = ReturnType<
  typeof useRemoveLiquidityBuildCallDataQuery
>

export type RemoveLiquidityBuildQueryParams = {
  humanBptIn: HumanAmount
  handler: RemoveLiquidityHandler
  simulationQuery: RemoveLiquiditySimulationQueryResult
  singleTokenOutAddress: Address
  wethIsEth: boolean
}

// Queries the SDK to create a transaction config to be used by wagmi's useManagedSendTransaction
export function useRemoveLiquidityBuildCallDataQuery({
  humanBptIn,
  handler,
  simulationQuery,
  singleTokenOutAddress,
  wethIsEth,
  enabled,
}: RemoveLiquidityBuildQueryParams & {
  enabled: boolean
}) {
  const { userAddress, isConnected } = useUserAccount()
  const { slippage } = useUserSettings()
  const { pool, chainId } = usePool()
  const { relayerApprovalSignature } = useRelayerSignature()
  const debouncedHumanBptIn = useDebounce(humanBptIn, defaultDebounceMs)[0]

  const params: RemoveLiquidityParams = {
    handler,
    userAddress,
    slippage,
    poolId: pool.id,
    humanBptIn: debouncedHumanBptIn,
    tokenOut: singleTokenOutAddress, // only required by SingleToken removal
    wethIsEth,
  }

  const queryKey = removeLiquidityKeys.buildCallData(params)

  const queryFn = async () => {
    const queryOutput = ensureLastQueryResponse('Remove liquidity query', simulationQuery.data)
    const res = await handler.buildCallData({
      account: userAddress,
      slippagePercent: slippage,
      queryOutput,
      relayerApprovalSignature,
      wethIsEth,
    })

    console.log('Call data built:', res)
    return res
  }

  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && isConnected && !!simulationQuery.data,
    gcTime: 0,
    meta: sentryMetaForRemoveLiquidityHandler('Error in remove liquidity buildCallData query', {
      ...params,
      chainId,
    }),
    ...onlyExplicitRefetch,
  })
}
