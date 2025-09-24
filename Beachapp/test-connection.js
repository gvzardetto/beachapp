// Test Supabase Connection
// Run this with: node test-connection.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://knxcstvysqwawfrabnty.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueGNzdHZ5c3F3YXdmcmFibnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjY0MTEsImV4cCI6MjA3NDI0MjQxMX0.Le2UDGNN9KjfmJop4MgjLyqx1khY2ye7omzsxADUHWs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey.substring(0, 20) + '...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('matches')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('📊 Data:', data)
    return true
    
  } catch (error) {
    console.error('❌ Connection error:', error.message)
    return false
  }
}

testConnection()

