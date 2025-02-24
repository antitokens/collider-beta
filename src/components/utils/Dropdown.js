import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Dropdown = ({
  selected,
  onSelect,
  options,
  disabled,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full font-mono">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`text-sm w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg flex justify-between items-center text-gray-300 focus:outline-none focus:border-blue-500 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={disabled}
      >
        {options.find((opt) => opt.value === selected)?.label || placeholder}
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className="px-4 py-2 text-gray-100 hover:bg-gray-700 cursor-pointer text-sm"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
