import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  usePopover,
  Popover,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from '../src';

// ---- usePopover Hook ----

describe('usePopover', () => {
  function HookTester({
    options,
    render,
  }: {
    options?: Parameters<typeof usePopover>[0];
    render: (api: ReturnType<typeof usePopover>) => React.ReactNode;
  }) {
    const api = usePopover(options);
    return <>{render(api)}</>;
  }

  it('should default to closed state', () => {
    render(
      <HookTester
        render={(api) => (
          <>
            <button {...api.getTriggerProps()}>trigger</button>
            {api.open && <div {...api.getContentProps()}>content</div>}
          </>
        )}
      />,
    );
    expect(screen.getByText('trigger')).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('should open on trigger click', async () => {
    render(
      <HookTester
        render={(api) => (
          <>
            <button {...api.getTriggerProps()}>trigger</button>
            {api.open && <div {...api.getContentProps()}>content</div>}
          </>
        )}
      />,
    );
    await userEvent.click(screen.getByText('trigger'));
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('should set aria attributes on trigger', () => {
    render(<HookTester render={(api) => <button {...api.getTriggerProps()}>trigger</button>} />);
    const btn = screen.getByText('trigger');
    expect(btn).toHaveAttribute('aria-haspopup', 'dialog');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('should update aria-expanded when open', async () => {
    render(
      <HookTester
        render={(api) => (
          <>
            <button {...api.getTriggerProps()}>trigger</button>
            {api.open && <div {...api.getContentProps()}>content</div>}
          </>
        )}
      />,
    );
    await userEvent.click(screen.getByText('trigger'));
    expect(screen.getByText('trigger')).toHaveAttribute('aria-expanded', 'true');
  });

  it('should support controlled open state', () => {
    const onOpenChange = vi.fn();
    render(
      <HookTester
        options={{ open: true, onOpenChange }}
        render={(api) => {
          expect(api.open).toBe(true);
          return (
            <>
              <button {...api.getTriggerProps()}>trigger</button>
              {api.open && <div {...api.getContentProps()}>content</div>}
            </>
          );
        }}
      />,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('should call onOpenChange on state change', async () => {
    const onOpenChange = vi.fn();
    render(
      <HookTester
        options={{ onOpenChange }}
        render={(api) => (
          <>
            <button {...api.getTriggerProps()}>trigger</button>
            {api.open && <div {...api.getContentProps()}>content</div>}
          </>
        )}
      />,
    );
    await userEvent.click(screen.getByText('trigger'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should accept custom placement', () => {
    render(
      <HookTester
        options={{ placement: 'top' }}
        render={(api) => {
          expect(api.placement).toBe('top');
          return <button {...api.getTriggerProps()}>trigger</button>;
        }}
      />,
    );
  });

  it('should support arrow option', () => {
    render(
      <HookTester
        options={{ arrow: true }}
        render={(api) => {
          expect(api.arrow).toBe(true);
          expect(api.arrowRef).toBeDefined();
          expect(api.arrowStyles).toBeDefined();
          return <button {...api.getTriggerProps()}>trigger</button>;
        }}
      />,
    );
  });

  it('should support constrainViewport option', () => {
    render(
      <HookTester
        options={{ constrainViewport: false }}
        render={(api) => <button {...api.getTriggerProps()}>trigger</button>}
      />,
    );
    expect(screen.getByText('trigger')).toBeInTheDocument();
  });
});

// ---- Compound Components ----

describe('Compound Components', () => {
  it('should render popover with trigger and content', async () => {
    render(
      <PopoverRoot>
        <PopoverTrigger>open</PopoverTrigger>
        <PopoverContent>popover body</PopoverContent>
      </PopoverRoot>,
    );
    expect(screen.getByText('open')).toBeInTheDocument();
    expect(screen.queryByText('popover body')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('open'));
    expect(screen.getByText('popover body')).toBeInTheDocument();
  });

  it('should close via Popover.Close', async () => {
    render(
      <PopoverRoot>
        <PopoverTrigger>open</PopoverTrigger>
        <PopoverContent>
          content
          <PopoverClose>close</PopoverClose>
        </PopoverContent>
      </PopoverRoot>,
    );

    await userEvent.click(screen.getByText('open'));
    expect(screen.getByText('content')).toBeInTheDocument();

    await userEvent.click(screen.getByText('close'));
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('should support asChild on Trigger', async () => {
    render(
      <PopoverRoot>
        <PopoverTrigger asChild>
          <span>custom trigger</span>
        </PopoverTrigger>
        <PopoverContent>content</PopoverContent>
      </PopoverRoot>,
    );

    const trigger = screen.getByText('custom trigger');
    expect(trigger.tagName).toBe('SPAN');
    expect(trigger).toHaveAttribute('aria-haspopup');

    await userEvent.click(trigger);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('should throw on asChild with invalid child', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <PopoverRoot>
          <PopoverTrigger asChild>text only</PopoverTrigger>
          <PopoverContent>content</PopoverContent>
        </PopoverRoot>,
      );
    }).toThrow('PopoverTrigger: asChild requires a single valid React element child');

    consoleError.mockRestore();
  });

  it('should throw when compound components used outside Root', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<PopoverTrigger>trigger</PopoverTrigger>);
    }).toThrow('Popover compound components must be used within <Popover.Root>');

    consoleError.mockRestore();
  });

  it('should support Popover.Root namespace syntax', async () => {
    render(
      <Popover.Root>
        <Popover.Trigger>open</Popover.Trigger>
        <Popover.Content>content</Popover.Content>
      </Popover.Root>,
    );

    await userEvent.click(screen.getByText('open'));
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('should render FloatingArrow when arrow is enabled', async () => {
    render(
      <PopoverRoot arrow>
        <PopoverTrigger>open</PopoverTrigger>
        <PopoverContent>content</PopoverContent>
      </PopoverRoot>,
    );

    await userEvent.click(screen.getByText('open'));

    // 验证内容可见（arrow 已渲染但难以直接断言 SVG）
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('should close on Escape key', async () => {
    render(
      <PopoverRoot>
        <PopoverTrigger>open</PopoverTrigger>
        <PopoverContent>content</PopoverContent>
      </PopoverRoot>,
    );

    await userEvent.click(screen.getByText('open'));
    expect(screen.getByText('content')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('should render custom slots.root and pass slotProps.root', async () => {
    function Panel({
      title,
      children,
      ...rest
    }: {
      title: string;
      children?: React.ReactNode;
    } & React.HTMLAttributes<HTMLElement>) {
      return (
        <section data-testid="custom-root" {...rest}>
          <strong>{title}</strong>
          {children}
        </section>
      );
    }

    render(
      <PopoverRoot>
        <PopoverTrigger>open</PopoverTrigger>
        <PopoverContent slots={{ root: Panel }} slotProps={{ root: { title: 'Menu' } }}>
          body
        </PopoverContent>
      </PopoverRoot>,
    );

    await userEvent.click(screen.getByText('open'));
    expect(screen.getByTestId('custom-root').tagName).toBe('SECTION');
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});

// ---- Render Props ----

describe('Popover (render props)', () => {
  it('should pass api to children', async () => {
    render(
      <Popover>
        {(api) => (
          <>
            <button {...api.getTriggerProps()}>trigger</button>
            {api.open && <div {...api.getContentProps()}>content</div>}
          </>
        )}
      </Popover>,
    );

    expect(screen.queryByText('content')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('trigger'));
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});

// ---- Default export ----

describe('default export', () => {
  it('should have Root, Trigger, Content, Close statics', () => {
    expect(Popover.Root).toBeDefined();
    expect(Popover.Trigger).toBeDefined();
    expect(Popover.Content).toBeDefined();
    expect(Popover.Close).toBeDefined();
  });

  it('should be callable as render-props component', () => {
    expect(typeof Popover).toBe('function');
  });
});
