import React, { useState, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface TimeSelectProps {
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
  className?: string;
  leftIcon?: React.ReactNode;
  // For react-hook-form register
  [key: string]: any;
}

const TimeSelect: React.FC<TimeSelectProps> = ({
  name,
  value = '',
  onChange,
  error,
  label,
  className = '',
  leftIcon,
  ...rest
}) => {
  const [hours, setHours] = useState('12');
  const [minutes, setMinutes] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isMinutesOpen, setIsMinutesOpen] = useState(false);

  // Generate hours and minutes options
  const hoursOptions = Array.from({ length: 12 }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );
  
  const minutesOptions = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  // Parse initial value if provided
  useEffect(() => {
    if (value) {
      const [time, meridian] = value.split(' ');
      const [h, m] = time.split(':');
      setHours(h);
      setMinutes(m);
      setPeriod(meridian as 'AM' | 'PM');
    }
  }, [value]);

  // Update parent form when any part changes
  const handleChange = (newHours: string, newMinutes: string, newPeriod: 'AM' | 'PM') => {
    const formattedHours = newHours.padStart(2, '0');
    const formattedMinutes = newMinutes.padStart(2, '0');
    const timeString = `${formattedHours}:${formattedMinutes} ${newPeriod}`;
    if (onChange) {
      onChange({
        target: {
          value: timeString,
          name: name
        },
        type: 'change'
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleHourSelect = (hour: string) => {
    setHours(hour);
    setIsHoursOpen(false);
    handleChange(hour, minutes, period);
  };

  const handleMinuteSelect = (minute: string) => {
    setMinutes(minute);
    setIsMinutesOpen(false);
    handleChange(hours, minute, period);
  };

  const togglePeriod = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM';
    setPeriod(newPeriod);
    handleChange(hours, minutes, newPeriod);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-gray-500 dark:text-gray-400">
            {leftIcon}
          </div>
        )}
        <div className={`flex items-center w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${leftIcon ? 'pl-10' : ''}`}>
          {/* Hours Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsHoursOpen(!isHoursOpen);
                setIsMinutesOpen(false);
              }}
              className="w-16 text-center p-2 focus:outline-none text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {hours || 'HH'}
            </button>
            {isHoursOpen && (
              <div className="absolute top-full left-0 mt-1 w-16 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
                {hoursOptions.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourSelect(hour)}
                    className="w-full text-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {hour}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-gray-500 dark:text-gray-400">:</span>

          {/* Minutes Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsMinutesOpen(!isMinutesOpen);
                setIsHoursOpen(false);
              }}
              className="w-16 text-center p-2 focus:outline-none text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {minutes || 'MM'}
            </button>
            {isMinutesOpen && (
              <div className="absolute top-full left-0 mt-1 w-16 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
                {minutesOptions.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteSelect(minute)}
                    className="w-full text-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {minute}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AM/PM Toggle */}
          <button
            type="button"
            onClick={togglePeriod}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-md transition-colors"
          >
            {period}
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
    </div>
  );
};

export default TimeSelect; 