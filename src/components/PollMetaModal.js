import React, { useState, useEffect } from "react";
import { TimeTicker } from "../utils/utils";
import UTCDateTimePicker from "./DatePicker";

const PollMetaModal = ({ wallet, isVisible, setIsVisible, onSubmit }) => {
  const emptyForm = {
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    signature: "",
    timestamp: "",
    wallet: wallet?.publicKey?.toString() || "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [formErrors, setFormErrors] = useState({
    title: "",
    description: "",
  });

  // Function to round date to next UTC hour
  const roundToNextUTCHour = (date) => {
    const newDate = new Date(date);
    newDate.setUTCMinutes(0);
    newDate.setUTCSeconds(0);
    newDate.setUTCMilliseconds(0);

    // If the time is in the past or current hour, move to next hour
    if (newDate <= new Date()) {
      newDate.setUTCHours(newDate.getUTCHours() + 1);
    }
    return newDate;
  };

  // Set minimum start time on component mount
  useEffect(() => {
    const minStartTime = roundToNextUTCHour(new Date());
    setFormData((prev) => ({
      ...prev,
      startTime: minStartTime.toISOString(),
    }));
  }, []);

  const handleOutsideClick = (event) => {
    if (event.target.id === "modal-background") {
      setIsVisible(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleTimeChange = (type, value) => {
    if (validateTimeInputs(type, value)) {
      if (type === "startTime") {
        // When start time changes, clear end time
        setFormData({
          ...formData,
          startTime: value,
          endTime: "",
        });
      } else if (type === "endTime") {
        // When setting end time, ensure it has the same UTC hour as start time
        const startDate = new Date(formData.startTime);
        const endDate = new Date(value);
        endDate.setUTCHours(startDate.getUTCHours(), 0, 0, 0);

        setFormData({
          ...formData,
          endTime: endDate.toISOString(),
        });
      }
    }
  };

  const validateTimeInputs = (name, value) => {
    const currentDate = new Date();
    const selectedDate = new Date(value);

    // Get dates for comparison
    const startDate =
      name === "startTime" ? selectedDate : new Date(formData.startTime);
    const endDate =
      name === "endTime"
        ? selectedDate
        : formData.endTime
        ? new Date(formData.endTime)
        : null;

    if (name === "startTime") {
      if (selectedDate <= currentDate) {
        setTimeError("Start time must be in the future");
        return false;
      }
    } else if (name === "endTime") {
      if (!formData.startTime) {
        setTimeError("Please select start time first");
        return false;
      }

      const hoursDiff = (endDate - startDate) / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        setTimeError("End time must be at least 24 hours after start time");
        return false;
      }
      if (hoursDiff % 24 !== 0) {
        setTimeError("End time must be in 24-hour increments from start time");
        return false;
      }
    }

    setTimeError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate title and description
    const newErrors = {
      title: !formData.title.trim() ? "Title is required" : "",
      description: !formData.description.trim()
        ? "Description is required"
        : "",
    };

    setFormErrors(newErrors);

    if (timeError || newErrors.title || newErrors.description) {
      return;
    }

    if (!wallet || !wallet.signMessage) {
      console.error("Wallet not connected or doesn't support signing");
      return;
    }

    try {
      setIsSubmitting(true);

      const message = `Requesting signature to create poll: "${
        formData.title
      }" at ${new Date().toISOString()} with account ${wallet.publicKey}`;

      const signatureUint8Array = await wallet.signMessage(
        new TextEncoder().encode(message)
      );
      const signature = btoa(String.fromCharCode(...signatureUint8Array));
      const timestamp = new Date().toISOString();

      const finalFormData = {
        ...formData,
        signature,
        timestamp,
        wallet: wallet.publicKey.toString(),
      };

      await onSubmit(finalFormData);
      setFormData(emptyForm);
      setIsVisible(false);
    } catch (error) {
      console.error("Error submitting poll:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ...emptyForm,
      startTime: roundToNextUTCHour(new Date()).toISOString(),
    });
    setTimeError("");
  };

  return (
    <>
      {isVisible && (
        <div
          id="modal-background"
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={handleOutsideClick}
        >
          <div className="relative bg-dark-card backdrop-blur-xl p-8 rounded-lg border border-black max-w-md w-full mx-4 sm:mx-6 md:mx-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-md font-medium text-gray-200 mb-1"
                  >
                    Title<span className="text-xs text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-secondary text-gray-100 font-sfmono text-sm"
                    placeholder="Enter poll title (required)"
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.title && (
                    <div className="text-red-500 text-sm mt-1">
                      {formErrors.title}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-md font-medium text-gray-200 mb-1"
                  >
                    Description<span className="text-xs text-red-400">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-secondary text-gray-100 h-24 font-sfmono text-sm"
                    placeholder="Enter poll description (required)"
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.description && (
                    <div className="text-red-500 text-sm mt-1">
                      {formErrors.description}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs text-gray-400 flex flex-row items-center animate-pulse">
                    <span className="text-[10px]">&#9432;</span>&nbsp;&nbsp;All
                    times are in UTC
                  </div>
                  <label
                    htmlFor="startTime"
                    className="flex flex-row justify-between items-center text-md font-medium text-gray-200 mb-0"
                  >
                    <div>
                      Start Time<span className="text-xs text-red-400">*</span>
                      <span className="relative group ml-1">
                        <span className="cursor-pointer text-xs text-gray-400">
                          &#9432;
                          <span className="font-normal absolute text-sm p-2 bg-gray-800 rounded-md w-72 -translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                            {`Must be a future hour in UTC (minutes will be set to 00)`}
                          </span>
                        </span>
                      </span>
                    </div>
                    <div className="-mr-2">
                      <TimeTicker isMobile={true} fontSize={12} />
                    </div>
                  </label>

                  <UTCDateTimePicker
                    value={formData.startTime}
                    onChange={(value) => handleTimeChange("startTime", value)}
                    minDate={roundToNextUTCHour(new Date())}
                    disabled={isSubmitting}
                    step={1}
                  />
                </div>

                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-md font-medium text-gray-200 mb-1"
                  >
                    Close Time<span className="text-xs text-red-400">*</span>
                    <span className="relative group ml-1">
                      <span className="cursor-pointer text-xs text-gray-400">
                        &#9432;
                        <span className="font-normal absolute text-sm p-2 bg-gray-800 rounded-md w-72 -translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                          {`Must be at least 24 hours after start time in UTC, in 24-hour increments`}
                        </span>
                      </span>
                    </span>
                  </label>
                  <UTCDateTimePicker
                    value={formData.endTime}
                    onChange={(value) => handleTimeChange("endTime", value)}
                    minDate={
                      formData.startTime ? new Date(formData.startTime) : null
                    }
                    disabled={isSubmitting || !formData.startTime}
                    step={24}
                  />
                </div>

                {timeError && (
                  <div className="text-red-500 text-sm">{timeError}</div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsVisible(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-transparent rounded-lg border border-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isSubmitting}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-accent-primary rounded-lg hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  disabled={
                    isSubmitting ||
                    !!timeError ||
                    formData.title === "" ||
                    formData.description === "" ||
                    formData.startTime === "" ||
                    formData.endTime === ""
                  }
                >
                  {isSubmitting ? "Creating Poll..." : "Create Poll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PollMetaModal;
