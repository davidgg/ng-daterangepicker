import { Component, OnInit, HostListener, ElementRef, forwardRef, Input, OnChanges, SimpleChange } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as dateFns from 'date-fns';

export interface NgDateRangePickerOptions {
  theme?: 'default' | 'green' | 'teal' | 'cyan' | 'grape' | 'red' | 'gray';
  range?: 'tm' | 'lm' | 'lw' | 'tw' | 'ty' | 'ly';
  inline?: boolean;
  dayNames?: string[];
  monthNames?: string[];
  showPredefinedRanges?: boolean;
  untilDate?: Date;
  sinceDate?: Date;
}

const defaultOptions = {
  theme: 'default',
  range: 'tm',
  inline: false,
  dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  monthNames: [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ],
  showPredefinedRanges: true,
  untilDate: null,
  sinceDate: null
}

export interface IDay {
  date: Date;
  day: number;
  weekday: number;
  today: boolean;
  firstMonthDay: boolean;
  lastMonthDay: boolean;
  availableDay: boolean;
  visible: boolean;
  from: boolean;
  to: boolean;
  isWithinRange: boolean;
}

export let DATERANGEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgDateRangePickerComponent),
  multi: true
};

@Component({
  selector: 'ng-daterangepicker',
  templateUrl: 'ng-daterangepicker.component.html',
  styleUrls: ['ng-daterangepicker.sass'],
  providers: [DATERANGEPICKER_VALUE_ACCESSOR]
})
export class NgDateRangePickerComponent implements ControlValueAccessor, OnInit {
  @Input() options: NgDateRangePickerOptions;

  modelValue: string;
  opened: false | 'from' | 'to';
  date: Date;
  dateFrom: Date;
  dateTo: Date;
  days: IDay[];
  range: 'tm' | 'lm' | 'lw' | 'tw' | 'ty' | 'ly';

  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (_: any) => void = () => { };

  constructor(private elementRef: ElementRef) { }

  get value(): string {
    return this.modelValue;
  }

  set value(value: string) {
    if (!value) { return; }
    this.modelValue = value;
    this.onChangeCallback(value);
  }

  writeValue(value: string) {
    if (!value) { return; }
    this.modelValue = value;
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  ngOnInit() {
    this.date = dateFns.startOfDay(new Date());
    this.options = Object.assign({}, defaultOptions, this.options);
    this.opened = this.options.inline ? 'from' : false;
    this.selectRange(this.options.range);
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    this.options = Object.assign({}, defaultOptions, this.options);
  }

  generateCalendar(): void {
    this.days = [];
    let start: Date = dateFns.startOfMonth(this.date);
    let end: Date = dateFns.endOfMonth(this.date);

    let days: IDay[] = dateFns.eachDay(start, end).map(d => {
      return {
        date: d,
        day: dateFns.getDate(d),
        weekday: dateFns.getDay(d),
        today: dateFns.isToday(d),
        firstMonthDay: dateFns.isFirstDayOfMonth(d),
        lastMonthDay: dateFns.isLastDayOfMonth(d),
        availableDay: this.isAvailableday(d),
        visible: true,
        from: dateFns.isSameDay(this.dateFrom, d),
        to: dateFns.isSameDay(this.dateTo, d),
        isWithinRange: dateFns.isWithinRange(d, this.dateFrom, this.dateTo)
      };
    });

    let prevMonthDayNum = dateFns.getDay(start) - 1;
    let prevMonthDays: IDay[] = [];
    if (prevMonthDayNum > 0) {
      prevMonthDays = Array.from(Array(prevMonthDayNum).keys()).map(i => {
        let d = dateFns.subDays(start, prevMonthDayNum - i);
        return {
          date: d,
          day: dateFns.getDate(d),
          weekday: dateFns.getDay(d),
          firstMonthDay: dateFns.isFirstDayOfMonth(d),
          lastMonthDay: dateFns.isLastDayOfMonth(d),
          availableDay: this.isAvailableday(d),
          today: false,
          visible: false,
          from: false,
          to: false,
          isWithinRange: false
        };
      });
    }

    this.days = prevMonthDays.concat(days);
    this.value = `${dateFns.format(this.dateFrom, 'DD/MM/YYYY')}-${dateFns.format(this.dateTo, 'DD/MM/YYYY')}`;
  }

  toggleCalendar(e: MouseEvent, selection: 'from' | 'to'): void {
    if (this.opened && this.opened !== selection) {
      this.opened = selection;
    } else {
      this.opened = this.opened ? false : selection;
    }
  }

  closeCalendar(e: MouseEvent): void {
    this.opened = false;
  }

  selectDate(e: MouseEvent, index: number): void {
    e.preventDefault();
    let selectedDate: Date = this.days[index].date;
    if(!this.days[index].availableDay) return;

    if ((this.opened === 'from' && dateFns.isAfter(selectedDate, this.dateTo)) ||
      (this.opened === 'to' && dateFns.isBefore(selectedDate, this.dateFrom))) {
      return;
    }

    if (this.opened === 'from') {
      this.dateFrom = selectedDate;
      this.opened = 'to';
    } else if (this.opened === 'to') {
      this.dateTo = selectedDate;
      this.opened = 'from';
    }

    this.generateCalendar();
  }

  prevMonth(): void {
    this.date = dateFns.subMonths(this.date, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.date = dateFns.addMonths(this.date, 1);
    this.generateCalendar();
  }

  selectRange(range: 'tm' | 'lm' | 'lw' | 'tw' | 'ty' | 'ly'): void {
    let today = dateFns.startOfDay(new Date());

    switch (range) {
      case 'tm':
        this.dateFrom = dateFns.startOfMonth(today);
        this.dateTo = dateFns.endOfMonth(today);
        break;
      case 'lm':
        today = dateFns.subMonths(today, 1);
        this.dateFrom = dateFns.startOfMonth(today);
        this.dateTo = dateFns.endOfMonth(today);
        break;
      case 'lw':
        today = dateFns.subWeeks(today, 1);
        this.dateFrom = dateFns.startOfWeek(today);
        this.dateTo = dateFns.endOfWeek(today);
        break;
      case 'tw':
        this.dateFrom = dateFns.startOfWeek(today);
        this.dateTo = dateFns.endOfWeek(today);
        break;
      case 'ty':
        this.dateFrom = dateFns.startOfYear(today);
        this.dateTo = dateFns.endOfYear(today);
        break;
      case 'ly':
        today = dateFns.subYears(today, 1);
        this.dateFrom = dateFns.startOfYear(today);
        this.dateTo = dateFns.endOfYear(today);
        break;
    }

    this.range = range;
    this.generateCalendar();
  }

  isAvailableday(day: Date) {
    let validSinceDate = true;
    if (this.options.sinceDate){
      validSinceDate = dateFns.isEqual(day, this.options.sinceDate) || dateFns.isAfter(day, this.options.sinceDate);
    }

    let validUntilDate = true;
    if (this.options.untilDate) {
      validUntilDate = dateFns.isEqual(day, this.options.untilDate) || dateFns.isBefore(day, this.options.untilDate);
    }

    return validSinceDate && validUntilDate;
  }

  getMonthName(monthNumber: number){
    return this.options.monthNames[monthNumber - 1];
  }

  @HostListener('document:click', ['$event'])
  handleBlurClick(e: MouseEvent) {
    let target = e.srcElement || e.target;
    if (!this.options.inline && !this.elementRef.nativeElement.contains(e.target) && !(<Element>target).classList.contains('day-num')) {
      this.opened = false;
    }
  }
}
