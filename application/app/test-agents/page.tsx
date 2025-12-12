'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

export default function TestAgentsPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('🔍 Fetching agents...')
        const response = await apiClient<{ success: boolean; data: any[] }>('/api/user/agents')
        console.log('✅ Response:', response)
        setData(response)
      } catch (err) {
        console.error('❌ Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Agent API Test Page</h1>
      
      {loading && <p>⏳ Loading...</p>}
      
      {error && (
        <div style={{ background: '#fee', padding: '10px', border: '1px solid red' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div>
          <h2>✅ API Response:</h2>
          <div style={{ background: '#efe', padding: '10px', border: '1px solid green' }}>
            <p><strong>Success:</strong> {String(data.success)}</p>
            <p><strong>Data Length:</strong> {data.data?.length || 0}</p>
          </div>
          
          <h3>📋 Agents:</h3>
          {data.data?.map((agent: any, i: number) => (
            <div key={agent.id || i} style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              margin: '10px 0',
              border: '1px solid #ccc'
            }}>
              <p><strong>#{i + 1}</strong></p>
              <p><strong>ID:</strong> {agent.id}</p>
              <p><strong>Name:</strong> {agent.name}</p>
              <p><strong>Type:</strong> {agent.type || agent.agent_type || 'N/A'}</p>
              <p><strong>Status:</strong> {agent.status}</p>
            </div>
          ))}
          
          <h3>🔍 Raw JSON:</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
