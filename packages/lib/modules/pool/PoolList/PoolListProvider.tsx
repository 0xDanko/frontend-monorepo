/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { createContext, PropsWithChildren, useEffect } from 'react'
import { GetPoolsDocument, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'
import { usePoolListQueryState } from './usePoolListQueryState'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { isAddress } from 'viem'
import { PoolListDisplayType } from '../pool.types'

export function _usePoolList({
  fixedPoolTypes,
  displayType = PoolListDisplayType.TokenPills,
  hideProtocolVersion = [],
  hidePoolTypes = [],
  hidePoolTags = [],
}: {
  fixedPoolTypes?: GqlPoolType[]
  displayType?: PoolListDisplayType
  hideProtocolVersion?: string[]
  hidePoolTypes?: GqlPoolType[]
  hidePoolTags?: string[]
} = {}) {
  const queryState = usePoolListQueryState()
  const { userAddress } = useUserAccount()

  const { queryVariables, toggleUserAddress } = queryState

  const variables = {
    ...queryVariables,
    where: {
      ...queryVariables.where,
      poolTypeIn: fixedPoolTypes || queryVariables.where.poolTypeIn,
    },
  }

  const { data, loading, previousData, refetch, networkStatus, error } = useQuery(
    GetPoolsDocument,
    {
      variables,
    }
  )

  const pools = loading && previousData ? previousData.pools : data?.pools || []

  const isFixedPoolType = !!fixedPoolTypes && fixedPoolTypes.length > 0

  // If the user has previously selected to filter by their liquidity and then
  // changes their connected wallet, we want to automatically update the filter.
  useEffect(() => {
    if (isAddress(userAddress) && isAddress(queryVariables.where.userAddress || '')) {
      toggleUserAddress(true, userAddress)
    }
  }, [userAddress])

  return {
    pools,
    count: data?.count || previousData?.count,
    queryState,
    loading,
    error,
    networkStatus,
    isFixedPoolType,
    refetch,
    displayType,
    hideProtocolVersion,
    hidePoolTypes,
    hidePoolTags,
  }
}

export const PoolListContext = createContext<ReturnType<typeof _usePoolList> | null>(null)

export function PoolListProvider({
  fixedPoolTypes,
  displayType,
  hideProtocolVersion,
  hidePoolTypes,
  hidePoolTags,
  children,
}: PropsWithChildren<{
  fixedPoolTypes?: GqlPoolType[]
  displayType: PoolListDisplayType
  hideProtocolVersion: string[]
  hidePoolTypes: GqlPoolType[]
  hidePoolTags: string[]
}>) {
  const hook = _usePoolList({
    fixedPoolTypes,
    displayType,
    hideProtocolVersion,
    hidePoolTypes,
    hidePoolTags,
  })

  return <PoolListContext.Provider value={hook}>{children}</PoolListContext.Provider>
}

export function usePoolList() {
  return useMandatoryContext(PoolListContext, 'PoolList')
}
