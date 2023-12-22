import { Badge, HStack, Text, Tooltip } from '@chakra-ui/react'
import { usePool } from '../../usePool'
import { TokenIcon } from '@/lib/modules/tokens/TokenIcon'
import Image from 'next/image'
import { fNum } from '@/lib/shared/utils/numbers'

export default function PoolMetaBadges() {
  const { pool, chain } = usePool()

  console.log('lmao', pool)
  return (
    <HStack>
      <Badge
        py="2.5"
        px="3"
        rounded="full"
        background="lightBadge"
        _dark={{ background: 'background.card.level6' }}
      >
        <Image
          src={`/images/chains/${chain}.svg`}
          alt={`Chain icon for ${chain.toLowerCase()}`}
          width={20}
          height={20}
        />
      </Badge>
      {pool.displayTokens.map(token => {
        return (
          <Badge
            py="2"
            px="3"
            rounded="full"
            background="lightBadge"
            _dark={{ background: 'background.card.level6' }}
            key={`meta-badge-${token.address}`}
          >
            <HStack>
              <TokenIcon
                chain={chain}
                address={token.address}
                size={24}
                alt={token?.symbol || token.address}
              />
              <Text fontSize="1rem">{token.symbol}</Text>
              {token.weight && (
                <Text fontWeight="normal" fontSize="1rem">
                  {fNum('weight', token.weight || 0)}
                </Text>
              )}
            </HStack>
          </Badge>
        )
      })}
      <Tooltip label="Swap fee">
        <Badge
          fontWeight="normal"
          p="1"
          background="lightBadge"
          _dark={{ background: 'background.card.level6' }}
        >
          <Text>{fNum('feePercent', pool.dynamicData.swapFee)}</Text>
        </Badge>
      </Tooltip>
    </HStack>
  )
}