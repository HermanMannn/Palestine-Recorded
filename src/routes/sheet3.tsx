
import { createFileRoute } from '@tanstack/react-router'
import SheetMap from '../components/SheetMap'

export const Route = createFileRoute('/sheet3')({
  component: () => (
    <SheetMap
      url="/maps/sheet3.jpg"
      label="Sheet 3"
      imageWidth={13343}
      imageHeight={15074}
    />
  ),
})