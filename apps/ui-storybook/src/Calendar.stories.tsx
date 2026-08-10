import type { Meta, StoryObj } from '@storybook/react-vite';
import { Calendar } from '@uikit-react/calendar-base';

const meta = {
  title: 'Calendar',
  parameters: {
    docs: {
      description: {
        component:
          'Workspace `@uikit-react/calendar-base` — unstyled calendar grid with `data-*` hooks.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const CalendarBasic: Story = {
  render: () => (
    <>
      <style>{`
        [role="grid"] button {
          width: 2.25rem;
          height: 2.25rem;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        [data-selected] { background: #1976d2; color: #fff; border-radius: 4px; }
        [data-today] { outline: 2px solid #1976d2; border-radius: 4px; }
        [data-outside-month] { opacity: 0.35; }
        [data-disabled] { opacity: 0.3; cursor: not-allowed; }
      `}</style>
      <Calendar defaultValue="2026-08-10" defaultMonth="2026-08" />
    </>
  ),
};
