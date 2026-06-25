"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { deleteMcuRecord } from "@/lib/mcu/actions";
import { VERDICT_LABELS, type McuRow } from "@/lib/mcu/types";

function indexVariant(v: number | null): "success" | "warning" | "danger" {
  if (v == null) return "warning";
  return v >= 75 ? "success" : v >= 50 ? "warning" : "danger";
}

function levelVariant(l: string | null): "success" | "warning" | "danger" {
  if (l === "low") return "success";
  if (l === "moderate") return "warning";
  return "danger";
}

export function McuTable({ data }: { data: McuRow[] }) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "examDate", desc: true }]);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const columns = React.useMemo<ColumnDef<McuRow>[]>(
    () => [
      {
        accessorKey: "examDate",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Exam date <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => <span className="font-medium">{formatDate(row.original.examDate)}</span>,
      },
      { accessorKey: "provider", header: "Provider", cell: ({ row }) => row.original.provider ?? "—" },
      {
        accessorKey: "verdict",
        header: "Verdict",
        cell: ({ row }) => (
          <Badge variant="secondary">{VERDICT_LABELS[row.original.verdict] ?? row.original.verdict}</Badge>
        ),
      },
      {
        accessorKey: "bmi",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            BMI <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span title={row.original.bmiCategory ?? ""}>{row.original.bmi ?? "—"}</span>
        ),
      },
      {
        accessorKey: "healthIndex",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Health Index <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <Badge variant={indexVariant(row.original.healthIndex)}>
            {row.original.healthIndex ?? "—"}
          </Badge>
        ),
      },
      {
        accessorKey: "cardiovascularRisk",
        header: "CV risk",
        cell: ({ row }) =>
          row.original.cardiovascularRisk != null ? `${row.original.cardiovascularRisk}%` : "—",
      },
      {
        accessorKey: "diabetesRisk",
        header: "Diabetes",
        cell: ({ row }) =>
          row.original.diabetesRisk != null ? `${row.original.diabetesRisk}%` : "—",
      },
      {
        accessorKey: "metabolicRisk",
        header: "Metabolic",
        cell: ({ row }) => (
          <Badge variant={levelVariant(row.original.metabolicRisk as string)}>
            {row.original.metabolicRisk ?? "—"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const r = row.original;
          if (r.isSample) return null;
          return (
            <Button
              variant="ghost"
              size="icon"
              disabled={deletingId === r.id}
              onClick={async () => {
                setDeletingId(r.id);
                await deleteMcuRecord(r.id);
                router.refresh();
                setDeletingId(null);
              }}
              aria-label="Delete record"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          );
        },
      },
    ],
    [deletingId, router],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
            {hg.headers.map((h) => (
              <TableHead key={h.id}>
                {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
              No MCU records yet. Add your first to compute your health index.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
