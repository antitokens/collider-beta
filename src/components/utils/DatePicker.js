import React from "react";

const UTCDateTimePicker = ({
  value,
  onChange,
  minDate,
  disabled,
  className = "",
  step = 1, // hours step
}) => {
  const date = value ? new Date(value) : null;
  const min = minDate ? new Date(minDate) : null;

  // Get next N days starting from min date or today
  const getAvailableDates = () => {
    const startDate = min || new Date();
    startDate.setUTCMinutes(0, 0, 0);

    const dates = [];
    for (let i = 0; i < 30; i++) {
      // Show next 30 days
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Get available hours based on selected date and min date
  const getAvailableHours = (selectedDate) => {
    const hours = [];
    if (!selectedDate) return hours;

    // If step is 24 (end time picker), use the hour from min date
    if (step === 24 && min) {
      hours.push(min.getUTCHours());
      return hours;
    }

    const startHour =
      selectedDate.toISOString().slice(0, 10) ===
      min?.toISOString().slice(0, 10)
        ? min.getUTCHours() + 1 // If same day as min, start from next hour
        : 0;

    for (let i = startHour; i < 24; i += step) {
      hours.push(i);
    }
    return hours;
  };

  const formatDateOption = (date) => {
    return (
      date.toISOString().slice(0, 10) +
      " (" +
      date.toUTCString().slice(0, 3) +
      ")"
    );
  };

  const formatHourOption = (hour) => {
    return hour.toString().padStart(2, "0") + ":00 UTC";
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    if (date) {
      // Keep existing hour if valid, otherwise use first available hour
      const availableHours = getAvailableHours(selectedDate);
      const hour = availableHours.includes(date.getUTCHours())
        ? date.getUTCHours()
        : availableHours[0];
      selectedDate.setUTCHours(hour, 0, 0, 0);
    } else {
      // Set to first available hour
      const availableHours = getAvailableHours(selectedDate);
      selectedDate.setUTCHours(availableHours[0], 0, 0, 0);
    }
    onChange(selectedDate.toISOString());
  };

  const handleHourChange = (e) => {
    const hourValue = parseInt(e.target.value);
    if (isNaN(hourValue) || hourValue < 0 || hourValue > 23) {
      return; // Invalid hour value, don't update
    }
    const newDate = new Date(date);
    newDate.setUTCHours(hourValue, 0, 0, 0);
    onChange(newDate.toISOString());
  };

  const availableDates = getAvailableDates();
  const availableHours = date ? getAvailableHours(date) : [];

  return (
    <div className={`flex gap-2 ${className}`}>
      <select
        className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-secondary text-gray-100 font-sfmono text-sm"
        value={date ? date.toISOString().slice(0, 10) : ""}
        onChange={handleDateChange}
        disabled={disabled}
      >
        <option value="">Select date</option>
        {availableDates.map((date) => (
          <option
            key={date.toISOString()}
            value={date.toISOString().slice(0, 10)}
          >
            {formatDateOption(date)}
          </option>
        ))}
      </select>

      <select
        className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-secondary text-gray-100 font-sfmono text-sm"
        value={date ? date.getUTCHours() : ""}
        onChange={handleHourChange}
        disabled={disabled || !date}
      >
        <option value="">Hour (UTC)</option>
        {availableHours.map((hour) => (
          <option key={hour} value={hour}>
            {formatHourOption(hour)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UTCDateTimePicker;
