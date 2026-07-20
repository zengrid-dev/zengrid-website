import { teamColumns, teamData } from '../data/datasets';
import type { Grid } from '@zengrid/core';

/** Data-column indices in teamColumns / teamData order. */
export const COL = {
  id: 0, name: 1, email: 2, department: 3, role: 4,
  status: 5, completion: 6, salary: 7, skills: 8, joined: 9, active: 10,
} as const;

export const FIELD = [
  'id', 'name', 'email', 'department', 'role',
  'status', 'completion', 'salary', 'skills', 'joined', 'active',
];

export const filterColumns = () => teamColumns();
export const filterData = (n: number) => teamData(n);

/** Live post-filter view count (recomputed from the pipeline output). */
export function viewCount(grid: Grid): number {
  return (grid.getStore().get('rows.viewCount') as number) ?? 0;
}

export function totalCount(grid: Grid): number {
  return (grid.getStore().get('rows.count') as number) ?? 0;
}

/** "123 of 1,000 rows match" — reads the live view count after filtering. */
export function matchLine(grid: Grid): string {
  return `${viewCount(grid).toLocaleString()} of ${totalCount(grid).toLocaleString()} rows match`;
}

/** Distinct raw values in a column, sorted — for building set/select controls. */
export function distinct(data: any[][], col: number): string[] {
  const seen = new Set<string>();
  for (const row of data) {
    const v = row[col];
    if (v != null && v !== '') seen.add(String(v));
  }
  return Array.from(seen).sort();
}
