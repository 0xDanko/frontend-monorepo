import { GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { Numberish } from '@/lib/shared/utils/numbers'
import { ChangeEvent } from 'react'

export function overflowProtected(value: Numberish, decimalLimit: number): string {
  const stringValue = value.toString()
  const [numberSegment, decimalSegment] = stringValue.split('.')

  if (decimalSegment && decimalSegment.length > decimalLimit) {
    const maxLength = numberSegment.length + decimalLimit + 1
    return stringValue.slice(0, maxLength)
  } else return stringValue
}

export function useTokenInput(
  token: GqlToken | undefined,
  parentOnChange?: (event: { currentTarget: { value: string } }) => void
) {
  function updateValue(value: string) {
    const safeValue = overflowProtected(value, token?.decimals || 18)
    parentOnChange && parentOnChange({ currentTarget: { value: safeValue } })
  }

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateValue(event.currentTarget.value)
  }

  return {
    handleOnChange,
    updateValue,
  }
}
