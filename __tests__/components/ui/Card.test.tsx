import { render } from '@testing-library/react-native'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Text } from 'react-native'

describe('Card', () => {
  it('renders with text', () => {
    const { getByText } = render(
      <Card>
        <Text>Content</Text>
      </Card>
    )
    expect(getByText('Content')).toBeTruthy()
  })

  it('renders Card composition', () => {
    const { getByText } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>
          <CardFooter>
            <Text>Footer</Text>
          </CardFooter>
        </CardContent>
      </Card>
    )
    expect(getByText('Title')).toBeTruthy()
    expect(getByText('Description')).toBeTruthy()
    expect(getByText('Footer')).toBeTruthy()
  })
})
