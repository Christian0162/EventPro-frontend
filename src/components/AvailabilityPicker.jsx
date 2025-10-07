import { useState } from "react";
import { Calendar } from "lucide-react"; // ✅ icon only

export default function AvailabilityPicker({ onChange }) {
    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Convert "HH:mm" → "h:mm AM/PM"
    const formatTime = (timeStr) => {
        if (!timeStr) return "?";
        const [hours, minutes] = timeStr.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    };

    const handleChange = (newDays = selectedDays, start = startTime, end = endTime) => {
        const formatted = `${newDays.join(", ")}: ${formatTime(start)} - ${formatTime(end)}`;
        onChange(formatted);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Availability
            </label>

            <div className="flex flex-wrap gap-2 mb-3">
                {days.map((day) => (
                    <button
                        key={day}
                        type="button"
                        onClick={() => {
                            const newDays = selectedDays.includes(day)
                                ? selectedDays.filter((d) => d !== day)
                                : [...selectedDays, day];
                            setSelectedDays(newDays);
                            handleChange(newDays);
                        }}
                        className={`px-3 py-1 text-sm rounded-lg border transition ${selectedDays.includes(day)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div className="flex gap-3">
                <div className="flex flex-col flex-1">
                    <label className="text-sm text-gray-600 mb-1">Start Time</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => {
                            setStartTime(e.target.value);
                            handleChange(selectedDays, e.target.value, endTime);
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col flex-1">
                    <label className="text-sm text-gray-600 mb-1">End Time</label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => {
                            setEndTime(e.target.value);
                            handleChange(selectedDays, startTime, e.target.value);
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="mt-3 text-gray-700 text-sm">
                {selectedDays.length > 0 && startTime && endTime && (
                    <p>
                        <span className="font-semibold">Selected:</span>{" "}
                        {selectedDays.join(", ")} ({formatTime(startTime)} – {formatTime(endTime)})
                    </p>
                )}
            </div>
        </div>
    );
}
