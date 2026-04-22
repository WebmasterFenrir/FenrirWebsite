import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarRange, Building2, Users, ArrowRight } from 'lucide-react'
import { getYears, getYearFuncties, type Year, type YearFunctie } from '@/lib/db/years'
import { getSponsors, type Sponsor } from '@/lib/db/sponsors'
import { getPeople } from '@/lib/db/people'

const CURRENT_YEAR = new Date().getFullYear()

function fmtDate(d: string) {
  if (!d) return '—'
  const parts = d.split('-')
  if (parts.length < 3) return d
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[Number(parts[1]) - 1]} ${parts[0]}`
}

export function OverviewPage() {
  const [loading, setLoading] = useState(true)
  const [yearCount, setYearCount] = useState(0)
  const [peopleCount, setPeopleCount] = useState(0)
  const [sponsorCount, setSponsorCount] = useState(0)
  const [latestYear, setLatestYear] = useState<Year | null>(null)
  const [functies, setFuncties] = useState<YearFunctie[]>([])
  const [activeSponsors, setActiveSponsors] = useState<Sponsor[]>([])

  useEffect(() => {
    Promise.all([getYears(), getSponsors(), getPeople()])
      .then(async ([years, sponsors, people]) => {
        setYearCount(years.length)
        setPeopleCount(people.length)
        setSponsorCount(sponsors.length)
        setActiveSponsors(sponsors.filter(s => s.endYear >= CURRENT_YEAR))

        if (years.length > 0) {
          const latest = years[0]
          setLatestYear(latest)
          const f = await getYearFuncties(latest.id)
          setFuncties(f)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Presidium Years', value: yearCount, icon: CalendarRange, to: '/years' },
    { label: 'People', value: peopleCount, icon: Users, to: '/people' },
    { label: 'Sponsors', value: sponsorCount, icon: Building2, to: '/sponsors' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage Fenrir's presidium data from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{loading ? '—' : value}</span>
                <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                  <Link to={to}>Manage <ArrowRight className="size-3" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Current Presidium</h2>
              <Link to="/years" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                View all <ArrowRight className="size-3" />
              </Link>
            </div>
            {latestYear ? (
              <div className="rounded-lg border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <div>
                    <p className="text-sm font-semibold">{latestYear.yearId}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(latestYear.startDate)} – {fmtDate(latestYear.endDate)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="gap-1 font-normal">
                    <Users className="size-3" />
                    {functies.length}
                  </Badge>
                </div>
                {functies.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No members yet.</p>
                ) : (
                  <div className="divide-y max-h-80 overflow-y-auto">
                    {functies.map(f => (
                      <div key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                          {f.personName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{f.personName}</p>
                          <p className="text-xs text-muted-foreground truncate">{f.roleName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border flex items-center justify-center py-10 text-sm text-muted-foreground">
                No years added yet.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Active Sponsors <span className="font-normal text-muted-foreground">({CURRENT_YEAR})</span>
              </h2>
              <Link to="/sponsors" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                View all <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="rounded-lg border overflow-hidden">
              {activeSponsors.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No active sponsors this year.</p>
              ) : (
                <div className="divide-y max-h-80 overflow-y-auto">
                  {activeSponsors.map(s => (
                    <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="size-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          {s.url && <p className="text-xs text-muted-foreground truncate">{s.url}</p>}
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs font-normal">
                        {s.startYear === s.endYear ? s.startYear : `${s.startYear}–${s.endYear}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
