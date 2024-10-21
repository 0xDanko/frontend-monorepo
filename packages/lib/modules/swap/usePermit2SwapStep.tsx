import { PublicWalletClient, SwapKind } from '@balancer/sdk'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import { signPermit2Swap } from '../tokens/approvals/permit2/signPermit2Swap'
import { NoncesByTokenAddress } from '../tokens/approvals/permit2/usePermit2Allowance'
import { SignPermit2Callback, TokenAmountIn } from '../tokens/approvals/permit2/useSignPermit2'
import { useSignPermit2Step } from '../transactions/transaction-steps/useSignPermit2Step'
import { SwapSimulationQueryResult } from './queries/useSimulateSwapQuery'
import { SdkSimulateSwapResponse } from './swap.types'

type Props = {
  wethIsEth: boolean,
  simulationQuery: SwapSimulationQueryResult
  tokenInInfo?: GqlToken
  chainId: number
  isPermit2: boolean
}

export function useSignPermit2SwapStep({ chainId, wethIsEth, tokenInInfo, simulationQuery, isPermit2 }: Props) {
  const { userAddress } = useUserAccount()
  const { slippage } = useUserSettings()

  const tokenInAddress = tokenInInfo?.address as Address

  const queryData = simulationQuery.data as SdkSimulateSwapResponse

  function getTokenInAmount(simulationQuery: SwapSimulationQueryResult): bigint {
    if (!simulationQuery.data) return 0n
    const queryData = simulationQuery.data as SdkSimulateSwapResponse
    if (queryData.queryOutput.swapKind === SwapKind.GivenIn) return queryData.queryOutput.amountIn.amount
    if (queryData.queryOutput.swapKind === SwapKind.GivenOut) return queryData.queryOutput.expectedAmountIn.amount
    return 0n
  }

  const tokenIn: TokenAmountIn = {
    address: tokenInAddress,
    amount: getTokenInAmount(simulationQuery),
  }

  const signPermit2Callback: SignPermit2Callback = (sdkClient: PublicWalletClient, nonces: NoncesByTokenAddress) => {
    return signPermit2Swap({
      sdkClient,
      wethIsEth,
      account: userAddress,
      queryOutput: queryData.queryOutput,
      slippagePercent: slippage,
      nonces,
      tokenIn
    })
  }

  return useSignPermit2Step({
    chainId,
    signPermit2Callback,
    wethIsEth,
    tokenAmountsIn: [tokenIn],
    isPermit2,
    isSimulationReady: !!simulationQuery.data,
  })
}