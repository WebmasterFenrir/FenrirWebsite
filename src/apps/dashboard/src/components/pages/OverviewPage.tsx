import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarRange, Building2, Users, ArrowRight } from 'lucide-react'
import { getYears } from '@/lib/db/years'
import { getSponsors } from '@/lib/db/sponsors'
import { getPeople } from '@/lib/db/people'

interface Stats {
  years: number
  sponsors: number
  people: number
  loading: boolean
}

export function OverviewPage() {
  const [stats, setStats] = useState<Stats>({ years: 0, sponsors: 0, people: 0, loading: true })

  useEffect(() => {
    Promise.all([getYears(), getSponsors(), getPeople()])
      .then(([years, sponsors, people]) => {
        setStats({ years: years.length, sponsors: sponsors.length, people: people.length, loading: false })
      })
      .catch(() => setStats((s) => ({ ...s, loading: false })))
  }, [])

  const cards = [
    {
      label: 'Presidium Years',
      value: stats.years,
      icon: CalendarRange,
      to: '/years',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Sponsors',
      value: stats.sponsors,
      icon: Building2,
      to: '/sponsors',
      color: 'text-secondary-foreground',
      bg: 'bg-secondary/10',
    },
    {
      label: 'People',
      value: stats.people,
      icon: Users,
      to: '/people',
      color: 'text-accent-foreground',
      bg: 'bg-accent/10',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage Fenrir's presidium data from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <div className={`flex size-8 items-center justify-center rounded-lg ${card.bg}`}>
                    <Icon className={`size-4 ${card.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold">
                    {stats.loading ? '—' : card.value}
                  </span>
                  <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                    <Link to={card.to}>
                      Manage <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
