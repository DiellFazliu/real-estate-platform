import { GoogleGenAI } from '@google/genai'
import { config } from 'dotenv'

// Ngarko .env
config({ path: '.env' })

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// Modelet për të testuar (nga më i re në më të vjetër)
const MODELS_TO_TEST = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
]

async function testModel(modelName: string) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🔍 Duke testuar: ${modelName}`)
  console.log('='.repeat(60))

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Shkruaj një përshkrim profesional në shqip për:
      - Apartament 3 dhoma
      - Prishtinë
      - Pishinë, parkim, kopsht
      
      Gjatësia: 100-150 fjalë.`,
    })

    console.log('✅ FUNKSIONON!')
    console.log('\n📝 Përgjigja:')
    console.log(response.text)
    return true
  } catch (error: any) {
    console.log('❌ DËSHTOI')
    console.log(`   Gabim: ${error.message}`)
    return false
  }
}

async function testAllModels() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   DUKE TESTUAR MODELE TË GEMINI                            ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  console.log('\n🔑 API Key:', process.env.GEMINI_API_KEY ? '✅ U gjet' : '❌ Mungon')

  if (!process.env.GEMINI_API_KEY) {
    console.error('\n⚠️  Shto GEMINI_API_KEY në .env')
    console.error('   Merr API key falas: https://aistudio.google.com/app/apikey')
    process.exit(1)
  }

  const results: { model: string; works: boolean }[] = []

  for (const model of MODELS_TO_TEST) {
    const works = await testModel(model)
    results.push({ model, works })

    // Nëse funksionon, ndal
    if (works) {
      console.log('\n' + '='.repeat(60))
      console.log(`✅ MODELI QË FUNKSIONON: ${model}`)
      console.log('='.repeat(60))
      break
    }
  }

  // Përmbledhje
  console.log('\n\n📊 PËRMBLEDHJE:\n')
  console.log('┌────────────────────────────────┬─────────────┐')
  console.log('│ Modeli                          │ Statusi     │')
  console.log('├────────────────────────────────┼─────────────┤')
  for (const { model, works } of results) {
    const status = works ? '✅ Punon' : '❌ Dështoi'
    const paddedModel = model.padEnd(30, ' ')
    const paddedStatus = status.padEnd(11, ' ')
    console.log(`│ ${paddedModel} │ ${paddedStatus} │`)
  }
  console.log('└────────────────────────────────┴─────────────┘')

  const workingModel = results.find((r) => r.works)
  if (workingModel) {
    console.log(`\n✅ Përdor në route-in tënd: '${workingModel.model}'`)
  } else {
    console.log('\n❌ Asnjë model nuk funksionoi.')
    console.log('\n📋 Zgjidhje të mundshme:')
    console.log('   1. Krijo projekt të re në Google Cloud Console')
    console.log('   2. Aktivizo Generative Language API')
    console.log('   3. Krijo API key të re')
    console.log('   4. Kaloj në Groq: https://console.groq.com/keys')
  }
}

testAllModels()