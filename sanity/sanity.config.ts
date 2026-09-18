import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: '🏠 Real Estate CMS',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: '/studio',
  apiVersion: '2026-01-01',
  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Properties')
              .child(S.documentTypeList('property').title('All Properties')),
            S.listItem()
              .title('Pending Review')
              .child(
                S.documentTypeList('property')
                  .title('Pending Review')
                  .filter(
                    '_type == "property" && reviewStatus == "PENDING_REVIEW"'
                  )
              ),
            S.listItem()
              .title('Hero Slides')
              .child(S.documentTypeList('heroSlide').title('Hero Slides')),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})