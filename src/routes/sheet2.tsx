// src/routes/maps/sheet2.tsx
import { createFileRoute } from '@tanstack/react-router'
import SheetMap from '../components/SheetMap'

export const Route = createFileRoute('/sheet2')({
  component: () => (
    <SheetMap
      url="/maps/sheet2.jpg"
      label="Sheet 2"
      imageWidth={13777}
      imageHeight={12283}
    />
  ),
})