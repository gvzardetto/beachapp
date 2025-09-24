// Test the fixed update functionality
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://knxcstvysqwawfrabnty.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueGNzdHZ5c3F3YXdmcmFibnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjY0MTEsImV4cCI6MjA3NDI0MjQxMX0.Le2UDGNN9KjfmJop4MgjLyqx1khY2ye7omzsxADUHWs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpdateFixed() {
  console.log('🔍 Testing fixed update functionality...')
  
  try {
    // First, get a match to update
    const { data: matches, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Failed to fetch matches:', fetchError.message)
      return
    }
    
    if (!matches || matches.length === 0) {
      console.log('⚠️ No matches found to update')
      return
    }
    
    const match = matches[0]
    console.log('📊 Found match to update:', match)
    
    // Test the fixed update approach
    console.log('🔄 Testing update without .single()...')
    
    const { data: updatedData, error: updateError } = await supabase
      .from('matches')
      .update({
        score: 'Fixed Test Update',
        date: new Date().toISOString()
      })
      .eq('id', match.id)
      .select()
    
    if (updateError) {
      console.error('❌ Update failed:', updateError.message)
      return
    }
    
    if (!updatedData || updatedData.length === 0) {
      console.error('❌ No data returned from update')
      return
    }
    
    console.log('✅ Update successful!')
    console.log('📊 Updated match:', updatedData[0])
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testUpdateFixed()
