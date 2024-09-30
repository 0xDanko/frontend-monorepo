/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react'
import { usePool } from '../../PoolProvider'
import { LiquidityActionHelpers } from '../LiquidityActionHelpers'
import { AddLiquidityStepParams, useAddLiquidityStep } from './useAddLiquidityStep'
import { getVaultConfig } from '../../pool.helpers'
import { Address } from 'viem'
import { isCowAmmPool } from '../../pool.helpers'
import { useShouldSignRelayerApproval } from '../../../relayer/signRelayerApproval.hooks'
import { useApproveRelayerStep } from '../../../relayer/useApproveRelayerStep'
import { useRelayerMode } from '../../../relayer/useRelayerMode'
import { useTokenApprovalSteps } from '../../../tokens/approvals/useTokenApprovalSteps'
import { useSignRelayerStep } from '../../../transactions/transaction-steps/useSignRelayerStep'

type AddLiquidityStepsParams = AddLiquidityStepParams & {
  helpers: LiquidityActionHelpers
}
export function useAddLiquiditySteps({
  helpers,
  handler,
  humanAmountsIn,
  simulationQuery,
}: AddLiquidityStepsParams) {
  const { pool, chainId, chain } = usePool()
  const { vaultAddress } = getVaultConfig(pool)
  const relayerMode = useRelayerMode(pool)
  const shouldSignRelayerApproval = useShouldSignRelayerApproval(chainId, relayerMode)

  const { step: approveRelayerStep, isLoading: isLoadingRelayerApproval } =
    useApproveRelayerStep(chainId)
  const signRelayerStep = useSignRelayerStep(chain)

  const inputAmounts = useMemo(
    () => helpers.toInputAmounts(humanAmountsIn),
    [humanAmountsIn, helpers],
  )

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: isCowAmmPool(pool.type) ? (pool.address as Address) : vaultAddress,
      chain: pool.chain,
      approvalAmounts: inputAmounts,
      actionType: 'AddLiquidity',
    })

  const addLiquidityStep = useAddLiquidityStep({
    handler,
    humanAmountsIn,
    simulationQuery,
  })

  const steps = useMemo(() => {
    if (relayerMode === 'approveRelayer') {
      return [approveRelayerStep, ...tokenApprovalSteps, addLiquidityStep]
    } else if (shouldSignRelayerApproval) {
      return [signRelayerStep, ...tokenApprovalSteps, addLiquidityStep]
    }

    return [...tokenApprovalSteps, addLiquidityStep]
  }, [
    relayerMode,
    shouldSignRelayerApproval,
    tokenApprovalSteps,
    addLiquidityStep,
    approveRelayerStep,
    signRelayerStep,
    humanAmountsIn,
  ])

  return {
    isLoadingSteps: isLoadingTokenApprovalSteps || isLoadingRelayerApproval,
    steps,
  }
}
