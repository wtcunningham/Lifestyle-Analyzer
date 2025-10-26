import React, { useCallback, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, RotateCcw, FileSpreadsheet, Info, TrendingUp, Activity, AlertTriangle, CalendarDays, BarChart2, PieChart as PieIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip, Legend as RLegend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";

const PALETTE = ["#4C78A8","#F58518","#E45756","#72B7B2","#54A24B","#EECA3B","#B279A2","#FF9DA6","#9D755D","#BAB0AC"];
const getColor = (i: number) => PALETTE[i % PALETTE.length];

export type TaskRow = { Date: string | number | Date; "Day Of Week"?: string; "Task Category"?: string; Task?: string; Start?: string | number | Date; Duration?: string | number; End?: string | number | Date; Comments?: string; TaskID?: number; TaskKey?: string; };
export type ParsedTask = { date: Date; dayOfWeek: string; category: string; task: string; start?: Date | null; end?: Date | null; durationMinutes: number; comments?: string; };

const EXCEL_EPOCH = new Date(Date.UTC(1899, 11, 30));
function excelSerialToDate(serial: number): Date { const millis = serial * 24 * 60 * 60 * 1000; return new Date(EXCEL_EPOCH.getTime() + millis); }
function normalizeDate(v: TaskRow["Date"]): Date | null { if (v == null || v === "") return null; if (v instanceof Date) return v; if (typeof v === "number") return excelSerialToDate(v); const d = new Date(v); return isNaN(d.getTime()) ? null : d; }
function normalizeTimeToDate(base: Date, v: TaskRow["Start" | "End"]): Date | null { if (!base) return null; if (v == null || v === "") return null; if (v instanceof Date) return v; if (typeof v === "number") { const ms = Math.round(v * 24 * 60 * 60 * 1000); const d = new Date(base); d.setHours(0, 0, 0, 0); return new Date(d.getTime() + ms); } const str = String(v).trim(); const date = new Date(base); const m = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i); if (m) { let h = parseInt(m[1], 10); const min = parseInt(m[2], 10); const sec = m[3] ? parseInt(m[3], 10) : 0; const ampm = m[4]?.toUpperCase(); if (ampm) { if (ampm === "PM" && h < 12) h += 12; if (ampm === "AM" && h === 12) h = 0; } date.setHours(h, min, sec, 0); return date; } const d2 = new Date(str); return isNaN(d2.getTime()) ? null : d2; }
function normalizeDurationToMinutes(v: TaskRow["Duration"]): number { if (v == null || v === "") return 0; if (typeof v === "number") { return Math.max(0, Math.round(v * 24 * 60)); } const str = String(v).trim(); const m = str.match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/); if (m) { const h = m[1] ? parseInt(m[1], 10) : 0; const min = parseInt(m[2], 10); const sec = parseInt(m[3], 10); return h * 60 + min + Math.floor(sec / 60); } const m2 = str.match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/i); if (m2) { const h = m2[1] ? parseInt(m2[1], 10) : 0; const min = m2[2] ? parseInt(m2[2], 10) : 0; return h * 60 + min; } return 0; }
function getDowName(d: Date): string { return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()]; }
function isWeekend(d: Date): boolean { const day = d.getDay(); return day === 0 || day === 6; }

function parseSheet(rows: TaskRow[]): ParsedTask[] { const out: ParsedTask[] = []; for (const r of rows) { const nd = normalizeDate(r.Date); if (!nd) continue; const start = normalizeTimeToDate(nd, r.Start); const end = normalizeTimeToDate(nd, r.End); const durationMinutes = normalizeDurationToMinutes(r.Duration); out.push({ date: nd, dayOfWeek: r["Day Of Week"] || getDowName(nd), category: (r["Task Category"] || "Uncategorized").trim(), task: (r.Task || "").trim(), start: start ?? null, end: end ?? null, durationMinutes, comments: r.Comments || "", }); } return out.sort((a, b) => a.date.getTime() - b.date.getTime()); }

function minutesToHhMm(m: number): string { const sign = m < 0 ? "-" : ""; const abs = Math.abs(m); const h = Math.floor(abs / 60); const mm = abs % 60; return `${sign}${h}h ${mm.toString().padStart(2, "0")}m`; }
function sumBy(arr: any[], sel: (t: any) => number): number { return arr.reduce((acc, t) => acc + (sel(t) || 0), 0); }
function groupBy(arr: any[], key: (t: any) => any): Record<string, any[]> { return arr.reduce((acc: any, item: any) => { const k = key(item); (acc[k] ||= []).push(item); return acc; }, {} as Record<string, any[]>); }
function rollingStdDev(values: number[]): number { if (!values.length) return 0; const mean = values.reduce((a, b) => a + b, 0) / values.length; const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length; return Math.sqrt(variance); }
function pickNumber(obj: Record<string, number>, key: string, def = 0): number { return typeof obj[key] === "number" ? (obj[key] as number) : def; }

function toPieData(totals: Record<string, number>) { return Object.entries(totals).map(([k, v]) => ({ name: k, value: Math.round(v / 60) })).sort((a, b) => b.value - a.value).slice(0, 10); }
function toBarWeekWdWe(weekday: Record<string, number>, weekend: Record<string, number>) { const cats = Array.from(new Set([...Object.keys(weekday), ...Object.keys(weekend)])); return cats.map((c) => ({ category: c, WeekdayHrs: +(pickNumber(weekday, c, 0) / 60).toFixed(2), WeekendHrs: +(pickNumber(weekend, c, 0) / 60).toFixed(2), })); }

export default function LifestyleAnalyzer() {
  const [tasks, setTasks] = useState<ParsedTask[] | null>(null);
  const [insights, setInsights] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onReset = useCallback(() => { setTasks(null); setInsights(null); setError(null); if (inputRef.current) inputRef.current.value = ""; }, []);
  const onFile = useCallback(async (file: File) => { try { setError(null); const ab = await file.arrayBuffer(); const wb = XLSX.read(ab, { type: "array" }); const ws = wb.Sheets["Daily Tasks"]; if (!ws) throw new Error("Couldn't find a sheet named 'Daily Tasks'."); const json = XLSX.utils.sheet_to_json<TaskRow>(ws, { defval: "" }); if (!json.length) throw new Error("The 'Daily Tasks' sheet is empty."); const parsed = parseSheet(json); setTasks(parsed); setInsights(computeInsights(parsed)); } catch (e: any) { console.error(e); setError(e?.message || "Failed to read the Excel file."); setTasks(null); setInsights(null); } }, []);
  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) onFile(file); }, [onFile]);
  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) onFile(file); }, [onFile]);
  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); }, []);

  const pieDataWeekday = useMemo(() => insights ? toPieData(insights.weekday.totalsByCategory) : [], [insights]);
  const pieDataWeekend = useMemo(() => insights ? toPieData(insights.weekend.totalsByCategory) : [], [insights]);
  const barWdWe = useMemo(() => insights ? toBarWeekWdWe(insights.weekday.totalsByCategory, insights.weekend.totalsByCategory) : [], [insights]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 bg-gradient-to-b from-white to-slate-50">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent"><FileSpreadsheet className="h-6 w-6"/> Lifestyle Analyzer</h1>
          <p className="text-sm text-muted-foreground">Upload an Excel file with a sheet named <span className="font-medium">“Daily Tasks”</span> to get a smart lifestyle summary.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onReset} className="rounded-2xl"><RotateCcw className="h-4 w-4 mr-2"/>Reset</Button>
        </div>
      </div>

      {!tasks && (
        <Card className="mb-6 border-dashed bg-gradient-to-r from-sky-50/50 to-fuchsia-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5"/> Upload Excel</CardTitle>
            <CardDescription>Drag & drop your .xlsx/.xls file here, or use the button.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Use label + htmlFor so clicking anywhere triggers the file chooser. Also keep a direct button click. */}
            <label htmlFor="file-upload" onDrop={onDrop} onDragOver={onDragOver} className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer hover:bg-muted/50 transition">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Sheet name must be <Badge variant="secondary">Daily Tasks</Badge></div>
                <Input id="file-upload" ref={inputRef} type="file" accept=".xlsx,.xls" onChange={onInputChange} className="hidden" />
                <Button type="button" size="lg" className="rounded-2xl" onClick={() => inputRef.current?.click()}>
                  <Upload className="inline-block h-4 w-4 mr-2" /> Choose file
                </Button>
              </div>
            </label>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert className="mb-6">
          <AlertTitle>Upload error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tasks && insights && (
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Summary</CardTitle>
              <CardDescription>High-level takeaways tailored from your recent days.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* KPI strip could be added back here if desired later */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <Card className="shadow-none border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PieIcon className="h-5 w-5"/> Time by Category (Weekdays)</CardTitle>
                  </CardHeader>
                  <CardContent style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie dataKey="value" data={pieDataWeekday} outerRadius={100}>
                          {pieDataWeekday.map((slice, i) => (<Cell key={i} fill={getColor(i)} />))}
                        </Pie>
                        <RTooltip formatter={(v:any, n:any) => [`${v}h`, n]} />
                        <RLegend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="shadow-none border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PieIcon className="h-5 w-5"/> Time by Category (Weekends)</CardTitle>
                  </CardHeader>
                  <CardContent style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie dataKey="value" data={pieDataWeekend} outerRadius={100}>
                          {pieDataWeekend.map((slice, i) => (<Cell key={i} fill={getColor(i)} />))}
                        </Pie>
                        <RTooltip formatter={(v:any, n:any) => [`${v}h`, n]} />
                        <RLegend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-none border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5"/> Weekday vs Weekend by Category</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barWdWe}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" hide={false} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis />
                      <RTooltip />
                      <RLegend />
                      <Bar dataKey="WeekdayHrs" name="Weekday (hrs)" fill="#6366F1" />
                      <Bar dataKey="WeekendHrs" name="Weekend (hrs)" fill="#06B6D4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-none border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Sleep Over Time</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={insights.sleepSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(v) => `${Math.round((v as number)/60)}h`} />
                      <RTooltip formatter={(v:any) => `${minutesToHhMm(v as number)}`} />
                      <Line type="monotone" dataKey="minutes" name="Sleep (min)" dot={false} stroke="#10B981" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/> Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {insights.strengths?.length ? insights.strengths.map((s: string, i: number) => <li key={i}>{s}</li>) : <li>We’ll highlight strengths once there’s enough data.</li>}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5"/> Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {insights.opportunities?.length ? insights.opportunities.map((s: string, i: number) => <li key={i}>{s}</li>) : <li>Opportunities for improvement will appear here.</li>}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> Red Flags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {insights.redFlags?.length ? insights.redFlags.map((s: string, i: number) => <li key={i}>{s}</li>) : <li>No red flags detected so far.</li>}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6 text-xs text-muted-foreground">
        <p>Tip: Categories like <em>Sleep</em>, <em>Exercise</em>, and <em>Work</em> unlock the most insights.</p>
      </div>
    </div>
  );
}
