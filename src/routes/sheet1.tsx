// src/routes/maps/sheet1.tsx
import { createFileRoute } from '@tanstack/react-router'
import SheetMap from '../components/SheetMap'

export const Route = createFileRoute('/sheet1')({
  component: () => (
    <SheetMap
      url="/maps/sheet1.jpg"
      label="Sheet 1"
      imageWidth={13315}
      imageHeight={13248}
    />
  ),
})