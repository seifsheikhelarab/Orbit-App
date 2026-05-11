import { render, fireEvent } from '@testing-library/react-native'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders text children', () => {
    const { getByText } = render(<Button>Hello</Button>)
    expect(getByText('Hello')).toBeTruthy()
  })

  it('fires onPress when pressed', () => {
    const onPress = jest.fn()
    const { getByText } = render(<Button onPress={onPress}>Press</Button>)
    fireEvent.press(getByText('Press'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn()
    const { getByText } = render(<Button onPress={onPress} disabled>Press</Button>)
    fireEvent.press(getByText('Press'))
    expect(onPress).not.toHaveBeenCalled()
  })

  it('renders loading indicator', () => {
    const { getByText } = render(<Button loading>Submit</Button>)
    expect(getByText('...')).toBeTruthy()
  })
})
