import React from "react";
import { Dropdown } from "./Dropdown";

const UTCDateTimePicker = ({
  value,
  onChange,
  minDate,
  disabled,
  className = "",
  step = 1,
}) => {
  const date = value ? new Date(value) : null;
  const min = minDate ? new Date(minDate) : null;

  const getAvailableDates = () => {
    const startDate = min || new Date();
    startDate.setUTCMinutes(0, 0, 0);
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(startDate);
      d.setUTCDate(startDate.getUTCDate() + i);
      return d;
    });
  };

  const getAvailableHours = (selectedDate) => {
    if (!selectedDate) return [];
    if (step === 24 && min) return [min.getUTCHours()];

    const startHour =
      selectedDate.toISOString().slice(0, 10) ===
      min?.toISOString().slice(0, 10)
        ? min.getUTCHours() + 1
        : 0;

    return Array.from(
      { length: Math.ceil((24 - startHour) / step) },
      (_, i) => startHour + i * step
    );
  };

  const formatDateOption = (date) =>
    `${date.toISOString().slice(0, 10)} (${date.toUTCString().slice(0, 3)})`;
  const formatHourOption = (hour) =>
    `${hour.toString().padStart(2, "0")}:00 UTC`;

  const handleDateChange = (selectedValue) => {
    const selectedDate = new Date(selectedValue);
    const availableHours = getAvailableHours(selectedDate);
    selectedDate.setUTCHours(
      availableHours.includes(date?.getUTCHours())
        ? date.getUTCHours()
        : availableHours[0],
      0,
      0,
      0
    );
    onChange(selectedDate.toISOString());
  };

  const handleHourChange = (selectedValue) => {
    const newDate = new Date(date);
    newDate.setUTCHours(parseInt(selectedValue), 0, 0, 0);
    onChange(newDate.toISOString());
  };

  const availableDates = getAvailableDates();
  const availableHours = date ? getAvailableHours(date) : [];

  return (
    <div className={`flex gap-2 ${className}`}>
      <Dropdown
        selected={date ? date.toISOString().slice(0, 10) : ""}
        onSelect={handleDateChange}
        disabled={disabled}
        placeholder="Select date"
        options={availableDates.map((d) => ({
          value: d.toISOString().slice(0, 10),
          label: formatDateOption(d),
        }))}
      />

      <Dropdown
        selected={date ? date.getUTCHours() : ""}
        onSelect={handleHourChange}
        disabled={disabled || !date}
        placeholder="Hour (UTC)"
        options={availableHours.map((h) => ({
          value: h,
          label: formatHourOption(h),
        }))}
      />
    </div>
  );
};

export default UTCDateTimePicker;
