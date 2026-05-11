import { render } from '@testing-library/react-native'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders text', () => {
    const { getByText } = render(<Badge>New</Badge>)
    expect(getByText('New')).toBeTruthy()
  })

  it('renders with different variants', () => {
    const { getByText, rerender } = render(<Badge variant="destructive">Error</Badge>)
    expect(getByText('Error')).toBeTruthy()
  })
})
