'use client'

import { useState, useEffect } from 'react'
import { Users, Video, MessageCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ShoppingPartyPage() {
  const [activeParty, setActiveParty] = useState<any>(null)
  const [parties, setParties] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    fetchActiveParties()
  }, [])

  const fetchActiveParties = async () => {
    try {
      const res = await fetch('/api/collaborative/shopping-party')
      if (res.ok) {
        const data = await res.json()
        setParties(data.parties || [])
      }
    } catch (error) {
      console.error('Error fetching parties:', error)
    }
  }

  const createParty = async () => {
    try {
      const res = await fetch('/api/collaborative/shopping-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: 'My Shopping Party' })
      })

      if (res.ok) {
        const data = await res.json()
        setActiveParty(data.party)
        toast.success('Shopping party created!')
      }
    } catch (error) {
      toast.error('Failed to create party')
    }
  }

  const joinParty = async (partyId: string) => {
    try {
      const res = await fetch('/api/collaborative/shopping-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', partyId })
      })

      if (res.ok) {
        toast.success('Joined the party!')
        fetchPartyDetails(partyId)
      }
    } catch (error) {
      toast.error('Failed to join party')
    }
  }

  const fetchPartyDetails = async (partyId: string) => {
    try {
      const res = await fetch(`/api/collaborative/shopping-party?partyId=${partyId}`)
      if (res.ok) {
        const data = await res.json()
        setActiveParty(data.party)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-purple-500" />
          Shopping Party
        </h1>
        <p className="text-muted-foreground">
          Shop together with friends in real-time
        </p>
      </div>

      {!activeParty ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Party */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Start a Party
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create a shopping party and invite friends to browse and buy together.
              </p>
              <Button onClick={createParty} className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Create Shopping Party
              </Button>
            </CardContent>
          </Card>

          {/* Join Party */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Join a Party
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Enter a party code to join friends who are already shopping.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter party code"
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={() => joinParty('demo')}>
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Parties */}
          {parties.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Active Shopping Parties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parties.map((party) => (
                    <div
                      key={party.id}
                      className="p-4 border rounded-lg hover:border-purple-500 transition-all cursor-pointer"
                      onClick={() => joinParty(party.id)}
                    >
                      <h3 className="font-medium">{party.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {party.members} members shopping
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        Live
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Active Party View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{activeParty.name || 'Shopping Party'}</span>
                  <Badge className="bg-green-500">LIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Product browsing area</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Party Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeParty.members?.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {member.name?.[0]}
                      </div>
                      <span className="text-sm">{member.name}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View Shared Cart
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
