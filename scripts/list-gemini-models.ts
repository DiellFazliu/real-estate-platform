import { GoogleGenAI } from '@google/genai'
import { config } from 'dotenv'

config({ path: '.env' })

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

async function listModels() {
  console.log('📋 Duke listuar modelet e disponueshme...\n')

  try {
    const models = await ai.models.list()
    
    const flashModels: string[] = []
    
    for await (const model of models) {
      if (model.name) {
        console.log(`- ${model.name}`)
        
        // Filtro vetëm modelet flash
        if (model.name.includes('flash') && !model.name.includes('tts') && !model.name.includes('audio') && !model.name.includes('image') && !model.name.includes('live')) {
          flashModels.push(model.name.replace('models/', ''))
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📝 MODELET FLASH TË DISPONUESHME PËR TEKST:\n')
    for (const m of flashModels) {
      console.log(`   - ${m}`)
    }
  } catch (error: any) {
    console.error('❌ Gabim:', error.message)
  }
}

listModels()