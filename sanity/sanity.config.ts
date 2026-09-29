import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

// ═══════════════════════════════════════════════════════════════
// KONFIGURIMI
// ═══════════════════════════════════════════════════════════════

export default defineConfig({
  name: 'default',
  title: '🏠 Real Estate CMS',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: '/studio',
  apiVersion: '2024-01-01',

  plugins: [
    // ─── Structure Tool ────────────────────────────────────────
    structureTool({
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
                  .apiVersion('2024-01-01')
              ),

            S.listItem()
              .title('Hero Slides')
              .child(S.documentTypeList('heroSlide').title('Hero Slides')),
          ]),
    }),

    // ─── Presentation Tool ─────────────────────────────────────
    presentationTool({
      previewUrl: {
        initial: '/',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },

      resolve: {
        locations: {
          heroSlide: {
            locations: [
              {
                title: 'Home Page',
                href: '/',
                // ⭐ NUK ka 'icon' — është hequr
              },
            ],
          },
        },
      },

      allowOrigins: ['http://localhost:3000'],
    }),

    // ─── Vision ────────────────────────────────────────────────
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})