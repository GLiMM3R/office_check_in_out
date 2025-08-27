import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Clock,
  User,
  MapPin,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface CheckInOutData {
  employeeName: string;
  action: "check-in" | "check-out";
  latitude: number | null;
  longitude: number | null;
  locationName: string;
  notes: string;
  ipAddress?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  timestamp?: string;
  action?: string;
}

// Replace this with your actual Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

// Office location coordinates (replace with your actual office coordinates)
const OFFICE_LATITUDE = import.meta.env.VITE_OFFICE_LATITUDE;
const OFFICE_LONGITUDE = import.meta.env.VITE_OFFICE_LONGITUDE;
const OFFICE_RADIUS_METERS = import.meta.env.VITE_OFFICE_RADIUS_METERS;

// Function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export default function CheckInOutForm() {
  const [formData, setFormData] = useState<CheckInOutData>({
    employeeName: "",
    action: "check-in",
    latitude: null,
    longitude: null,
    locationName: "ກຳລັງຊອກຫາສະຖານທີ່...",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userIP, setUserIP] = useState<string>("");
  const [distanceFromOffice, setDistanceFromOffice] = useState<number | null>(
    null
  );
  const [isWithinOfficeRadius, setIsWithinOfficeRadius] =
    useState<boolean>(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get user's IP address
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => setUserIP(data.ip))
      .catch(() => setUserIP("ບໍ່ຮູ້"));
  }, []);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Calculate distance from office
          const distance = calculateDistance(
            latitude,
            longitude,
            OFFICE_LATITUDE,
            OFFICE_LONGITUDE
          );
          const withinRadius = distance <= OFFICE_RADIUS_METERS;

          setDistanceFromOffice(distance);
          setIsWithinOfficeRadius(withinRadius);

          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
            locationName: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }));

          // Try to get address from coordinates
          getAddressFromCoordinates(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setFormData((prev) => ({
            ...prev,
            latitude: null,
            longitude: null,
            locationName: "ບໍ່ສາມາດຊອກຫາສະຖານທີ່ໄດ້",
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        locationName: "ບຣາວເຊີບໍ່ສະຫນັບສະຫນູນ GPS",
      }));
    }
  }, []);

  // Function to get address from coordinates (optional, requires API key)
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Using a free geocoding service (you can replace with Google Maps API if you have a key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        const address = data.display_name.split(",").slice(0, 3).join(", ");
        setFormData((prev) => ({
          ...prev,
          locationName: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        }));
      }
    } catch (error) {
      console.error("Error getting address:", error);
      // Keep the coordinates as fallback
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e, "check-in");
  };

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e, "check-out");
  };

  const handleSubmit = async (
    e: React.FormEvent,
    action: "check-in" | "check-out"
  ) => {
    e.preventDefault();

    if (!formData.employeeName) {
      setResponse({
        success: false,
        message: "ກະລຸນາໃສ່ຊື່ຂອງທ່ານ",
      });
      return;
    }

    // Check if user is within office radius
    if (!isWithinOfficeRadius) {
      setResponse({
        success: false,
        message: `ທ່ານຢູ່ຫ່າງຈາກຫ້ອງການ ${
          distanceFromOffice ? Math.round(distanceFromOffice) : "?"
        } ແມັດ. ກະລຸນາເຂົ້າໃກ້ຫ້ອງການ (ພາຍໃນ ${OFFICE_RADIUS_METERS} ແມັດ)`,
      });
      return;
    }

    if (
      !GOOGLE_APPS_SCRIPT_URL ||
      GOOGLE_APPS_SCRIPT_URL.includes("YOUR_DEPLOYMENT_ID")
    ) {
      setResponse({
        success: false,
        message: "ກະລຸນາຕັ້ງຄ່າ URL ຂອງ Google Apps Script ໃນໄຟລ໌ .env",
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const submitData = {
        ...formData,
        action,
        ipAddress: userIP,
      };

      // Use JSONP to bypass CORS issues
      await submitDataViaJSONP(submitData);
    } catch {
      setResponse({
        success: false,
        message: "ບໍ່ສາມາດສົ່ງຂໍ້ມູນໄດ້. ກະລຸນາລອງໃຫມ່.",
      });
      setIsLoading(false);
    }
  };

  // JSONP implementation to bypass CORS
  const submitDataViaJSONP = (data: CheckInOutData & { ipAddress: string }) => {
    return new Promise<void>((resolve, reject) => {
      const callbackName = `callback_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create callback function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)[callbackName] = (response: ApiResponse) => {
        setResponse(response);

        if (response.success) {
          // Clear notes after successful submission
          setFormData((prev) => ({
            ...prev,
            notes: "",
          }));
        }

        // Cleanup
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any)[callbackName];
        document.head.removeChild(script);
        setIsLoading(false);
        resolve();
      };

      // Create script element for JSONP
      const script = document.createElement("script");

      // Build query parameters
      const params = new URLSearchParams({
        callback: callbackName,
        employeeName: data.employeeName,
        action: data.action,
        latitude: data.latitude?.toString() || "",
        longitude: data.longitude?.toString() || "",
        locationName: data.locationName,
        notes: data.notes,
        ipAddress: data.ipAddress,
      });

      script.src = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;

      script.onerror = () => {
        setResponse({
          success: false,
          message:
            "ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບ Google Apps Script ໄດ້. ກະລຸນາກວດສອບ URL.",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any)[callbackName];
        document.head.removeChild(script);
        setIsLoading(false);
        reject(new Error("Script load failed"));
      };

      script.onload = () => {
        // Timeout in case callback never gets called
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((window as any)[callbackName]) {
            setResponse({
              success: false,
              message: "ຄຳຂໍໝົດເວລາ. ກະລຸນາລອງໃຫມ່.",
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any)[callbackName];
            document.head.removeChild(script);
            setIsLoading(false);
            reject(new Error("Request timeout"));
          }
        }, 10000); // 10 second timeout
      };

      document.head.appendChild(script);
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Clock className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ລະບົບເຂົ້າ-ອອກວຽກ
          </h1>
          <p className="text-gray-600 text-sm">ຕິດຕາມເວລາການເຮັດວຽກຂອງທ່ານ</p>
        </div>

        {/* Current Time Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-lg font-semibold text-gray-800">
            {formatTime(currentTime)}
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6">
          {/* Employee Name */}
          <div>
            <label
              htmlFor="employeeName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <User className="inline w-4 h-4 mr-2" />
              ຊື່ເຕັມ
            </label>
            <input
              type="text"
              id="employeeName"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="ໃສ່ຊື່ເຕັມຂອງທ່ານ"
              required
            />
          </div>

          {/* Location Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-2" />
              ສະຖານທີ່
            </label>
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
              {formData.locationName}
            </div>
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-gray-500 mt-1">
                ພິກັດ: {formData.latitude.toFixed(6)},{" "}
                {formData.longitude.toFixed(6)}
              </p>
            )}
            {distanceFromOffice !== null && (
              <div
                className={`mt-2 p-2 rounded-lg text-sm ${
                  isWithinOfficeRadius
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-center">
                  {isWithinOfficeRadius ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  <span>
                    {isWithinOfficeRadius
                      ? `ຢູ່ໃນເຂດຫ້ອງການ (${Math.round(
                          distanceFromOffice
                        )}m ຈາກຫ້ອງການ)`
                      : `ຢູ່ນອກເຂດຫ້ອງການ (${Math.round(
                          distanceFromOffice
                        )}m ຈາກຫ້ອງການ)`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <MessageSquare className="inline w-4 h-4 mr-2" />
              ບັນທຶກເພີ່ມເຕີມ (ບໍ່ບັງຄັບ)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="ບັນທຶກເພີ່ມເຕີມ..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleCheckIn}
              disabled={isLoading || !isWithinOfficeRadius}
              className={`w-full py-3 text-lg font-semibold transition-all ${
                isWithinOfficeRadius
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ກຳລັງປະມວນຜົນ...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  ເຂົ້າວຽກ
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleCheckOut}
              disabled={isLoading || !isWithinOfficeRadius}
              className={`w-full py-3 text-lg font-semibold transition-all ${
                isWithinOfficeRadius
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ກຳລັງປະມວນຜົນ...
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 mr-2" />
                  ອອກວຽກ
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Response Message */}
        {response && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              response.success
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {response.success ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 text-red-600" />
              )}
              <p className="font-medium">{response.message}</p>
            </div>
            {response.success && response.timestamp && (
              <p className="text-sm mt-2 opacity-75">
                ບັນທຶກໃນເວລາ: {new Date(response.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        {(!GOOGLE_APPS_SCRIPT_URL ||
          GOOGLE_APPS_SCRIPT_URL.includes("YOUR_DEPLOYMENT_ID")) && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>ຕ້ອງການການຕັ້ງຄ່າ:</strong> ກະລຸນາຕັ້ງຄ່າ URL ຂອງ Google
              Apps Script ໃນໄຟລ໌ .env. ເບິ່ງ SETUP.md ສຳລັບຄຳແນະນຳລາຍລະອຽດ.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
