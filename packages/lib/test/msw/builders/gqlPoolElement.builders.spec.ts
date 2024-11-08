import { aNested50Weth503Pool } from './gqlPoolElement.builders'
import { NestedPoolState, PoolGetPool, mapPoolToNestedPoolStateV2 } from '@balancer/sdk'
import { daiAddress, usdcAddress, usdtAddress, wETHAddress } from '@repo/lib/debug-helpers'

test('aNested50Weth503Pool builds a proper nested pool mock', () => {
  const nestedPoolState: NestedPoolState = mapPoolToNestedPoolStateV2(
    aNested50Weth503Pool() as unknown as PoolGetPool
  )

  expect(nestedPoolState.pools).toMatchInlineSnapshot(`
    [
      {
        "address": "0x08775ccb6674d6bdceb0797c364c2653ed84f384",
        "id": "0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0",
        "level": 1,
        "tokens": [
          {
            "address": "0x79c58f70905f734641735bc61e45c19dd9ad60bc",
            "decimals": 18,
            "index": undefined,
            "underlyingToken": {
              "index": undefined,
            },
          },
          {
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "decimals": 18,
            "index": undefined,
            "underlyingToken": {
              "index": undefined,
            },
          },
        ],
        "type": "Weighted",
      },
    ]
  `)

  expect(nestedPoolState.mainTokens.map(t => t.address)).toEqual([
    wETHAddress,
    daiAddress,
    usdcAddress,
    usdtAddress,
  ])
})
