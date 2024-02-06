import { VaultActionsService } from './extensions/vault-actions.service'
import {
  EncodeExitPoolInput,
  EncodeGaugeClaimRewardsInput,
  EncodeGaugeDepositInput,
  EncodeGaugeMintInput,
  EncodeGaugeWithdrawInput,
} from './relayer-types'
import { isSameAddress } from '@/lib/shared/utils/addresses'
import { GaugeActionsService } from './extensions/gauge-actions.service'
import { balancerV2BatchRelayerLibraryABI } from '@/lib/modules/web3/contracts/abi/generated'
import { encodeFunctionData, zeroAddress } from 'viem'

export class BatchRelayerService {
  constructor(
    public readonly batchRelayerAddress: string,
    public readonly wethAddress: string,
    private readonly vaultActionsService: VaultActionsService,
    private readonly gaugeStakingService: GaugeActionsService
  ) {}

  public encodePeekChainedReferenceValue(reference: bigint): string {
    return encodeFunctionData({
      abi: balancerV2BatchRelayerLibraryABI,
      functionName: 'peekChainedReferenceValue',
      args: [reference],
    })
  }

  public vaultEncodeExitPool(params: EncodeExitPoolInput): string {
    return this.vaultActionsService.encodeExitPool(params)
  }

  public gaugeEncodeDeposit(params: EncodeGaugeDepositInput): string {
    return this.gaugeStakingService.encodeDeposit(params)
  }

  public gaugeEncodeWithdraw(params: EncodeGaugeWithdrawInput): string {
    return this.gaugeStakingService.encodeWithdraw(params)
  }

  public gaugeEncodeClaimRewards(params: EncodeGaugeClaimRewardsInput): string {
    return this.gaugeStakingService.encodeClaimRewards(params)
  }

  public gaugeEncodeMint(params: EncodeGaugeMintInput): string {
    return this.gaugeStakingService.encodeMint(params)
  }

  public replaceWethWithzeroAddress(address: string) {
    return isSameAddress(address, this.wethAddress) ? zeroAddress : address
  }
}
