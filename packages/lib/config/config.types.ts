import { Address } from 'viem'
import { GqlChain } from '../shared/services/api/generated/graphql'
import { chains } from '@repo/lib/modules/web3/ChainConfig'
import { PoolIssue } from '../modules/pool/alerts/pool-issues/PoolIssue.type'
import { SupportedWrapHandler } from '../modules/swap/swap.types'
import { PartnerVariant } from '../modules/pool/pool.types'

export interface TokensConfig {
  addresses: {
    bal: Address
    wNativeAsset: Address
    auraBal?: Address
    veBalBpt?: Address
  }
  nativeAsset: {
    name: string
    address: Address
    symbol: string
    decimals: number
  }
  supportedWrappers?: {
    baseToken: Address
    wrappedToken: Address
    swapHandler: SupportedWrapHandler
  }[]
  doubleApprovalRequired?: string[]
  defaultSwapTokens?: {
    tokenIn?: Address
    tokenOut?: Address
  }
  popularTokens?: Record<Address, string>
}

export interface ContractsConfig {
  multicall2: Address
  balancer: {
    vaultV2: Address
    // TODO: make it required when v3 is deployed in all networks
    vaultV3?: Address
    /*
      TODO: make it required when v3 is deployed in all networks
      IDEAL: remove this config completely and use the SDK build "to" to get the required router
      */
    router?: Address
    batchRouter?: Address
    compositeLiquidityRouter?: Address
    relayerV6: Address
    minter: Address
  }
  feeDistributor?: Address
  veDelegationProxy?: Address
  veBAL?: Address
  permit2?: Address
  omniVotingEscrow?: Address
  gaugeWorkingBalanceHelper?: Address
}
export interface PoolsConfig {
  issues: Partial<Record<PoolIssue, string[]>>
  allowNestedActions?: string[] // pool ids
}

export interface BlockExplorerConfig {
  baseUrl: string
  name: string
}

export type SupportedChainId = (typeof chains)[number]['id']

export interface NetworkConfig {
  chainId: SupportedChainId
  name: string
  shortName: string
  chain: GqlChain
  iconPath: string
  rpcUrl?: string
  blockExplorer: BlockExplorerConfig
  tokens: TokensConfig
  contracts: ContractsConfig
  minConfirmations?: number
  pools: PoolsConfig
  layerZeroChainId?: number
  supportsVeBalSync?: boolean
}

export interface Config {
  appEnv: 'dev' | 'test' | 'staging' | 'prod'
  apiUrl: string
  networks: {
    [key in GqlChain]: NetworkConfig
  }
}

export interface Banners {
  headerSrc: string
  footerSrc: string
}

type VariantConfig = {
  [key in PartnerVariant]: {
    banners?: Banners
  }
}

export interface ProjectConfig {
  projectId: 'beets' | 'balancer'
  projectName: string
  supportedNetworks: GqlChain[]
  corePoolId: string // this prop is used to adjust the color of the SparklesIcon
  variantConfig?: VariantConfig
  defaultNetwork: GqlChain
  ensNetwork: GqlChain
}
