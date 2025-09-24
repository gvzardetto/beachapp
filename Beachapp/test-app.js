// Quick test to verify Supabase connection
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://knxcstvysqwawfrabnty.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueGNzdHZ5c3F3YXdmcmFibnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjY0MTEsImV4cCI6MjA3NDI0MjQxMX0.Le2UDGNN9KjfmJop4MgjLyqx1khY2ye7omzsxADUHWs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testApp() {
  console.log('🎾 Testing Beach Tennis App Setup...')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Check if tables exist
    console.log('1️⃣ Testing table access...')
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .limit(1)
    
    if (matchesError) {
      console.error('❌ Matches table error:', matchesError.message)
      return
    }
    console.log('✅ Matches table accessible')
    
    // Test 2: Check players table
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .limit(1)
    
    if (playersError) {
      console.error('❌ Players table error:', playersError.message)
      return
    }
    console.log('✅ Players table accessible')
    
    // Test 3: Try inserting a test match
    console.log('2️⃣ Testing match insertion...')
    const { data: insertData, error: insertError } = await supabase
      .from('matches')
      .insert({
        player1_id: 1,
        player2_id: 2,
        score: 'Won',
        date: new Date().toISOString()
      })
      .select()
    
    if (insertError) {
      console.error('❌ Insert error:', insertError.message)
      return
    }
    console.log('✅ Match inserted successfully!')
    console.log('📊 Inserted match:', insertData[0])
    
    // Test 4: Verify the match was saved
    console.log('3️⃣ Verifying data...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (verifyError) {
      console.error('❌ Verification error:', verifyError.message)
      return
    }
    console.log('✅ Data verified!')
    console.log('📊 Latest match:', verifyData[0])
    
    console.log('=' .repeat(50))
    console.log('🎉 ALL TESTS PASSED! Your app is ready!')
    console.log('🌐 Open: http://localhost:3000')
    console.log('🎾 Try logging a match in your app!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testApp()

