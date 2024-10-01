/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from 'react'
import { parseUnits } from 'viem'
import { Pool } from '../../PoolProvider'
import { BPT_DECIMALS } from '../../pool.constants'
import { findFirstNonPreferentialStaking } from '../stake.helpers'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { ManagedTransactionButton } from '../../../transactions/transaction-steps/TransactionButton'
import { useTransactionState } from '../../../transactions/transaction-steps/TransactionStateProvider'
import { TransactionLabels, TransactionStep } from '../../../transactions/transaction-steps/lib'
import { useUserAccount } from '../../../web3/UserAccountProvider'
import { ManagedTransactionInput } from '../../../web3/contracts/useManagedTransaction'

const unstakeStepId = 'unstake-non-preferential-gauge'
/*
  Only used in the edge case of a user staked in a non-preferential gauge that is not claimable.
  In this case we run a single unstake transaction instead of unstake + claim multicall.
  See isClaimableGauge function for more details about non claimable gauges.
*/
export function useUnstakeFromNonPreferentialGaugeStep(
  pool: Pool,
  refetchPoolBalances: () => void
) {
  const { userAddress } = useUserAccount()
  const { getTransaction } = useTransactionState()
  const { chainId } = getNetworkConfig(pool.chain)

  const { nonPreferentialGaugeAddress, nonPreferentialStakedBalance } =
    findFirstNonPreferentialStaking(pool)

  const labels: TransactionLabels = {
    init: 'Unstake from deprecated gauge',
    title: 'Unstake LP tokens',
    description: 'Unstake LP tokens from deprecated gauge.',
    confirming: 'Confirming unstake...',
    confirmed: `Unstaked!`,
    tooltip: 'Unstake LP tokens from deprecated gauge.',
  }

  const amount = parseUnits(nonPreferentialStakedBalance, BPT_DECIMALS)

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Unstake from non preferential gauge transaction)',
    {
      poolId: pool.id,
      chainId,
      amount,
    }
  )

  const props: ManagedTransactionInput = {
    contractAddress: nonPreferentialGaugeAddress,
    contractId: 'balancer.gaugeV5',
    functionName: 'withdraw',
    labels,
    chainId,
    args: [amount],
    enabled: !!pool && !!userAddress,
    txSimulationMeta,
  }

  const transaction = getTransaction(unstakeStepId)

  const isComplete = () => transaction?.result.isSuccess || false

  const onSuccess = useCallback(() => {
    refetchPoolBalances()
  }, [])

  const step = useMemo(
    (): TransactionStep => ({
      id: unstakeStepId,
      stepType: 'unstake',
      labels,
      isComplete,
      onSuccess,
      renderAction: () => <ManagedTransactionButton id={unstakeStepId} {...props} />,
    }),
    [transaction, amount, props]
  )

  return {
    step,
  }
}
