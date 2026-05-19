import { useCallback, useState } from 'react';

export type DatePickerMode = 'date' | 'time' | 'datetime';

export interface UseDatePickerOptions {
  /** Initial value when picker mounts. Defaults to `new Date()`. */
  initialValue?: Date;
  /** Earliest selectable date. */
  minimumDate?: Date;
  /** Latest selectable date. */
  maximumDate?: Date;
  /** Use 24-hour format on Android. Defaults to `true`. */
  is24Hour?: boolean;
}

export interface DatePickerState {
  /** Whether the picker is currently rendered. Use to gate JSX. */
  visible: boolean;
  /** The current value (latest user selection or initial value). */
  value: Date;
  /** Mode requested by the latest `open(mode)` call. */
  mode: DatePickerMode;
  /** Open the picker. Optionally override mode for this call. */
  open: (mode?: DatePickerMode) => void;
  /** Close without selecting (call from `onDismiss`). */
  dismiss: () => void;
  /**
   * Apply a user selection. Pass directly to `<DateTimePicker onValueChange={...} />`.
   * Closes the picker and fires the optional `onPick` callback with the new date.
   */
  handleChange: (event: unknown, date?: Date) => void;
  /**
   * Imperative-style helper for code that wants the same shape as the old
   * `DateTimePickerAndroid.open({ ... onChange })` API. Equivalent to calling
   * `setOnPick(cb)` then `open(mode)`.
   */
  openWithCallback: (mode: DatePickerMode, onPick: (date: Date) => void) => void;
}

/**
 * Bridge for the old imperative `DateTimePickerAndroid.open()` flow to the
 * declarative `@expo/ui` `<DateTimePicker presentation="dialog" />` model.
 *
 * Usage:
 *
 * ```tsx
 * const picker = useDatePicker({ maximumDate: new Date() });
 *
 * picker.openWithCallback('date', (d) => setDate(d));
 *
 * return (
 *   <>
 *     {picker.visible && (
 *       <DateTimePicker
 *         value={picker.value}
 *         mode={picker.mode}
 *         presentation="dialog"
 *         is24Hour
 *         maximumDate={new Date()}
 *         onValueChange={picker.handleChange}
 *         onDismiss={picker.dismiss}
 *       />
 *     )}
 *   </>
 * );
 * ```
 */
export function useDatePicker(options: UseDatePickerOptions = {}): DatePickerState {
  const { initialValue } = options;
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<DatePickerMode>('date');
  const [value, setValue] = useState<Date>(initialValue ?? new Date());
  const [onPick, setOnPick] = useState<((date: Date) => void) | null>(null);

  const open = useCallback((nextMode?: DatePickerMode) => {
    if (nextMode) setMode(nextMode);
    setVisible(true);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setOnPick(null);
  }, []);

  const handleChange = useCallback(
    (_event: unknown, date?: Date) => {
      setVisible(false);
      // `_event.type` carries 'set' | 'dismissed' but @expo/ui types it loosely.
      // Treat presence of a date as the "set" signal; dismiss flow goes through `dismiss`.
      if (date) {
        setValue(date);
        if (onPick) onPick(date);
      }
      setOnPick(null);
    },
    [onPick]
  );

  const openWithCallback = useCallback(
    (nextMode: DatePickerMode, cb: (date: Date) => void) => {
      setMode(nextMode);
      setOnPick(() => cb);
      setVisible(true);
    },
    []
  );

  return { visible, value, mode, open, dismiss, handleChange, openWithCallback };
}
