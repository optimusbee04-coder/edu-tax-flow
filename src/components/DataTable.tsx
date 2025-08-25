import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { FiArrowUp, FiArrowDown, FiSearch } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useStore } from '../store/useStore';
import { StudentRecord } from '../types';

const columnHelper = createColumnHelper<StudentRecord>();

export const DataTable = () => {
  const { students, settings } = useStore();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <div className="font-medium text-card-foreground">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <div className="text-muted-foreground text-sm">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('state', {
        header: 'State',
        cell: (info) => (
          <div className="px-2 py-1 bg-muted rounded-md text-xs font-medium">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('course', {
        header: 'Course',
        cell: (info) => (
          <div className="text-card-foreground font-medium">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('totalIncome', {
        header: 'Total Income',
        cell: (info) => (
          <div className="text-success font-semibold">
            {settings.currencySymbol}{info.getValue().toLocaleString()}
          </div>
        ),
      }),
      columnHelper.accessor('calculatedTax', {
        header: 'Tax',
        cell: (info) => (
          <div className="text-warning font-semibold">
            {settings.currencySymbol}{info.getValue().toLocaleString()}
          </div>
        ),
      }),
      columnHelper.accessor('netIncome', {
        header: 'Net Income',
        cell: (info) => (
          <div className="text-primary font-semibold">
            {settings.currencySymbol}{info.getValue().toLocaleString()}
          </div>
        ),
      }),
    ],
    [settings.currencySymbol]
  );

  const table = useReactTable({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (students.length === 0) {
    return (
      <Card className="card-elevated">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            Upload a file to view student data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl gradient-text">Student Records</CardTitle>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search students..."
              value={table.getState().globalFilter ?? ''}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-card-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:bg-muted/80 transition-smooth"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center space-x-2">
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          <div className="text-xs">
                            {{
                              asc: <FiArrowUp className="h-3 w-3" />,
                              desc: <FiArrowDown className="h-3 w-3" />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-card-border">
                {table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`
                      hover:bg-muted/30 transition-smooth cursor-pointer
                      ${index % 2 === 0 ? 'bg-card' : 'bg-card/50'}
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {students.length} records
        </div>
      </CardContent>
    </Card>
  );
};