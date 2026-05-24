import { Mic } from "lucide-react";

/**
 * MicrophoneSelector Component
 * Dropdown component to select from list of available microphones
 */
export function MicrophoneSelector({ devices, selectedDevice, onChange, disabled = false }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Chọn thiết bị Microphone
      </label>
      <div className="relative">
        <select
          value={selectedDevice}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-700 text-sm focus:border-[#0ea5e9] focus:outline-none appearance-none cursor-pointer transition-colors disabled:opacity-60"
        >
          {devices.length === 0 ? (
            <option value="">Đang tải thiết bị...</option>
          ) : (
            devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
              </option>
            ))
          )}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <Mic className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
