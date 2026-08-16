import { useEffect, useState } from 'react'
import { Users, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { getLeden, deleteLid, type Lid } from '@/lib/db/leden'
import { getYears, type Year } from '@/lib/db/years'
import { useRole } from '@/lib/RoleContext'

function yearLabel(y: Year): string {
  const start = /^\d{4}$/.test(y.startDate) ? y.startDate : String(y.yearId)
  const end = /^\d{4}$/.test(y.endDate) ? y.endDate : String(y.yearId + 1)
  return `${start}–${end}`
}

const cell = (v: string | undefined) => (v ? v : '—')

// CSV cell escaping: quote fields that contain a comma, quote or newline and
// double any embedded quotes (RFC 4180).
function csvCell(v: string | undefined): string {
  const s = v ?? ''
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function exportLedenCsv(leden: Lid[], yearSlug: string): void {
  const header = [
    'Name', 'Phone', 'KdG-student', 'Richting', 'Student nr', 'Language',
    'Birthdate', 'Sport event', 'Doop', 'Payment', 'E-mail',
  ]
  const rows = leden.map((l) => [
    l.name, l.phone, l.kdg_student, l.richting, l.student_number, l.language,
    l.birthdate, l.sport_event, l.student_doop, l.payment_method, l.email,
  ])
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
  // BOM so Excel opens the UTF-8 names/emails correctly.
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `leden-${yearSlug || 'all'}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function LedenPage() {
  const { can } = useRole()

  const [years, setYears] = useState<Year[]>([])
  const [selectedYearId, setSelectedYearId] = useState('')
  const [leden, setLeden] = useState<Lid[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = async (yearId?: string) => {
    setLoading(true)
    try {
      const ys = await getYears()
      setYears(ys)
      // Default to the current active year (newest `-yearId`), then to whatever
      // the admin picked. `yearId` (passed by the selector) always wins.
      const target = yearId || selectedYearId || ys[0]?.id || ''
      if (target !== selectedYearId) setSelectedYearId(target)
      setLeden(await getLeden(target || undefined))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedYear = years.find((y) => y.id === selectedYearId)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteLid(deleteId)
    } finally {
      setDeleteId(null)
      load(selectedYearId || undefined)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leden</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Members who signed up via the “Lid worden” form, grouped by club year.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Club year</span>
          <Select
            value={selectedYearId}
            onValueChange={(v) => {
              setSelectedYearId(v)
              load(v)
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y.id} value={y.id}>
                  {yearLabel(y)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={loading || leden.length === 0}
            onClick={() =>
              exportLedenCsv(
                leden,
                (selectedYear ? yearLabel(selectedYear) : 'all').replace(/[^a-z0-9-]+/gi, '-').toLowerCase(),
              )
            }
          >
            <Download className="size-4" /> Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Loading…
        </div>
      ) : leden.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
          <Users className="size-8 opacity-30" />
          <p className="text-sm">
            No members for {selectedYear ? yearLabel(selectedYear) : 'this year'} yet.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 font-normal">
              <Users className="size-3" />
              {leden.length}
            </Badge>
            <span className="text-sm text-muted-foreground">
              member{leden.length === 1 ? '' : 's'} · {selectedYear ? yearLabel(selectedYear) : ''}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>KdG-student</TableHead>
                  <TableHead>Richting</TableHead>
                  <TableHead>Student nr</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Birthdate</TableHead>
                  <TableHead>Sport event</TableHead>
                  <TableHead>Doop</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>E-mail</TableHead>
                  {can('delete') && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {leden.map((lid) => (
                  <TableRow key={lid.id}>
                    <TableCell className="font-semibold">{lid.name}</TableCell>
                    <TableCell>{cell(lid.phone)}</TableCell>
                    <TableCell>{cell(lid.kdg_student)}</TableCell>
                    <TableCell>{cell(lid.richting)}</TableCell>
                    <TableCell>{cell(lid.student_number)}</TableCell>
                    <TableCell>{cell(lid.language)}</TableCell>
                    <TableCell>{cell(lid.birthdate)}</TableCell>
                    <TableCell>{cell(lid.sport_event)}</TableCell>
                    <TableCell>{cell(lid.student_doop)}</TableCell>
                    <TableCell>{cell(lid.payment_method)}</TableCell>
                    <TableCell className="text-muted-foreground">{cell(lid.email)}</TableCell>
                    {can('delete') && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          title="Delete member"
                          onClick={() => setDeleteId(lid.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this member from the Leden table. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
