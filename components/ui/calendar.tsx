'use client';

import * as React from 'react';
import { DayPicker, SelectSingleEventHandler, DayPickerSingleProps } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { cn } from '@/lib/utils';

export type CalendarProps = Omit<DayPickerSingleProps, 'classNames' | 'className'> & {
  className?: string;
};

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <div className={cn('inline-block rounded-xl bg-custom-white shadow-lg border border-gray-200 p-4', className)}>
      <DayPicker
        {...props}
        classNames={{
          months: 'flex flex-col',
          month: 'space-y-2',
          caption: 'flex justify-between items-center mb-2',
          nav: 'flex gap-2',
          nav_button: 'rounded-full p-1 hover:bg-blue-100 text-gray-600',
          nav_button_previous: 'mr-1',
          nav_button_next: 'ml-1',
          table: 'w-full border-collapse',
          head_row: 'flex',
          head_cell: 'w-10 h-10 text-center text-xs font-semibold text-gray-400',
          row: 'flex w-full',
          cell: 'w-10 h-10 text-center p-0',
          day: 'w-10 h-10 mx-auto my-1 flex items-center justify-center rounded-full transition-colors duration-150 text-base font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400',
          day_selected: 'bg-blue-600 text-custom-white font-bold shadow',
          day_today: 'border-2 border-blue-400',
          day_outside: 'opacity-0 pointer-events-none',
          day_disabled: 'text-gray-300 cursor-not-allowed',
          day_hidden: 'invisible',
        }}
        style={{
          width: '100%',
          minWidth: 280,
          maxWidth: 340,
        }}
      />
    </div>
  );
}

Calendar.displayName = 'Calendar';
