import React, { useState } from 'react';
import { MapPin, Navigation, X, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { PersonLocation } from '../../types';

interface LocationCaptureFieldProps {
  location?: PersonLocation | null;
  onChange: (location: PersonLocation | null) => void;
  disabled?: boolean;
}

export const LocationCaptureField: React.FC<LocationCaptureFieldProps> = ({
  location,
  onChange,
  disabled = false,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCaptureLocation = () => {
    if (disabled) return;

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setErrorMessage("Location isn't available on this device/browser.");
      return;
    }

    setErrorMessage(null);
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = position.coords;
        onChange({
          latitude,
          longitude,
          accuracy: accuracy ? Math.round(accuracy) : undefined,
        });
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage(
            'Location permission was denied. Allow location access in your device/browser settings to place this person on the map.'
          );
        } else if (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT) {
          setErrorMessage("Couldn't determine your location. Please check your signal and try again.");
        } else {
          setErrorMessage(error.message || 'Unable to retrieve location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleRemoveLocation = () => {
    if (disabled) return;
    onChange(null);
    setErrorMessage(null);
  };

  const hasLocation =
    location != null &&
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    isFinite(location.latitude) &&
    isFinite(location.longitude);

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#17201E]">
          Map Location <span className="text-[10px] text-[#68716D] font-normal">(optional)</span>
        </label>
        {hasLocation && (
          <span className="text-[10px] font-mono text-[#183A35] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#183A35]" />
            <span>Captured</span>
          </span>
        )}
      </div>

      {!hasLocation ? (
        <div className="p-3 bg-[#FCFBF8] border border-[#DCDDD5] rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#68716D]">
              <MapPin className="w-4 h-4 text-[#68716D] shrink-0" />
              <span>Location not set</span>
            </div>

            <button
              type="button"
              onClick={handleCaptureLocation}
              disabled={isLocating || disabled}
              className="h-8 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#183A35] bg-[#F5F3ED] hover:bg-[#EBE8DF] border border-[#DCDDD5] active:scale-95 rounded-lg transition-all disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#183A35]" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-[#183A35]" />
                  <span>Use current location</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-[#68716D] leading-relaxed">
            Optional — used to place this person on your territory map.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-[#F5F3ED] border border-[#DCDDD5] rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[#183A35] font-medium min-w-0">
              <Navigation className="w-3.5 h-3.5 text-[#183A35] shrink-0" />
              <span className="font-semibold text-xs text-[#183A35]">Location captured</span>
              {location.accuracy != null && (
                <span className="text-[11px] font-mono text-[#68716D] truncate">
                  · ±{location.accuracy} m
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleCaptureLocation}
                disabled={isLocating || disabled}
                className="h-7 px-2 text-[11px] font-semibold text-[#183A35] bg-white border border-[#DCDDD5] hover:border-[#183A35] rounded-md transition-colors flex items-center gap-1"
                title="Update with current GPS position"
              >
                {isLocating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3 text-[#183A35]" />
                )}
                <span>Update</span>
              </button>

              <button
                type="button"
                onClick={handleRemoveLocation}
                disabled={disabled}
                className="h-7 px-2 text-[11px] font-semibold text-[#B87545] hover:text-[#94552A] hover:bg-white/60 rounded-md transition-colors flex items-center gap-1"
                title="Remove saved coordinates"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 bg-[#B87545]/10 border border-[#B87545]/20 rounded-lg text-xs text-[#B87545] flex items-start gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B87545]" />
          <div className="flex-1 leading-relaxed text-[11px]">
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
};
