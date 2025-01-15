import React, { useState } from "react";

const PollMetaModal = ({ isVisible, setIsVisible }) => {
  const emptyForm = {
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  const handleOutsideClick = (event) => {
    if (event.target.id === "modal-background") {
      setIsVisible(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle the form submission
    console.log("Form data:", formData);
    setIsVisible(false);
    return formData;
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
                    Title&nbsp;
                    <span className="relative group">
                      <span className="cursor-pointer text-xs text-gray-400">
                        &#9432;
                        <span className="font-normal absolute text-sm p-2 bg-gray-800 rounded-md w-36 -translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                          {`Title of your poll`}
                        </span>
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md  focus:outline-none focus:ring-2 focus:ring-accent-secondary text-gray-100 font-sfmono text-sm"
                    placeholder="Enter poll title"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-md font-medium text-gray-200 mb-1"
                  >
                    Description&nbsp;
                    <span className="relative group">
                      <span className="cursor-pointer text-xs text-gray-400">
                        &#9432;
                        <span className="font-normal absolute text-sm p-2 bg-gray-800 rounded-md w-56 -translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                          {`Short description of your poll`}
                        </span>
                      </span>
                    </span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md  focus:outline-none focus:ring-2 focus:ring-accent-secondary text-gray-100 h-24 font-sfmono text-sm"
                    placeholder="Enter poll description"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-md font-medium text-gray-200 mb-1"
                  >
                    Start Time&nbsp;
                    <span className="relative group">
                      <span className="cursor-pointer text-xs text-gray-400">
                        &#9432;
                        <span className="font-normal absolute text-sm p-2 bg-gray-800 rounded-md w-56 -translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                          {`Starting time of your poll`}
                        </span>
                      </span>
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-secondary text-gray-100 font-sfmono text-sm [color-scheme:dark]"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-md font-medium text-gray-200 mb-1"
                  >
                    Close Time&nbsp;
                    <span className="relative group">
                      <span className="cursor-pointer text-xs text-gray-400">
                        &#9432;
                        <span className="font-normal absolute text-sm p-2 bg-gray-800 rounded-md w-56 -translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                          {`Closing time of your poll`}
                        </span>
                      </span>
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md  focus:outline-none focus:ring-2 focus:ring-accent-secondary text-gray-100 font-sfmono text-sm [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsVisible(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(emptyForm)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-transparent rounded-lg border border-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-accent-primary rounded-lg hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Create Poll
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
