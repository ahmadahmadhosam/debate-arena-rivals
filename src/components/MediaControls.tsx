
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Mic, MicOff, Camera, CameraOff } from 'lucide-react';

interface MediaControlsProps {
  isMyTurn: boolean;
  autoMicControl?: boolean;
  currentPhase?: 'waiting' | 'preparation' | 'debate' | 'final' | 'ended';
  onMicToggle?: (enabled: boolean) => void;
  onCameraToggle?: (enabled: boolean) => void;
}

const MediaControls: React.FC<MediaControlsProps> = ({
  isMyTurn,
  autoMicControl = true,
  currentPhase = 'waiting',
  onMicToggle,
  onCameraToggle
}) => {
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isAutoMicEnabled, setIsAutoMicEnabled] = useState(true);
  const [isAutoCameraEnabled, setIsAutoCameraEnabled] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // التحكم التلقائي في الميكروفون
  useEffect(() => {
    if (isAutoMicEnabled) {
      if (currentPhase === 'preparation' || currentPhase === 'final') {
        setIsMicEnabled(true);
        onMicToggle?.(true);
      } else if (currentPhase === 'debate') {
        setIsMicEnabled(isMyTurn);
        onMicToggle?.(isMyTurn);
      } else {
        setIsMicEnabled(false);
        onMicToggle?.(false);
      }
    }
  }, [isMyTurn, currentPhase, isAutoMicEnabled, onMicToggle]);

  // طلب الوصول للميديا
  const requestMediaAccess = async (audio: boolean, video: boolean) => {
    try {
      setPermissionError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: audio ? { echoCancellation: true, noiseSuppression: true } : false, 
        video: video ? { width: 640, height: 480, facingMode: 'user' } : false 
      });
      
      setMediaStream(stream);
      setHasPermissions(true);
      
      // ربط الفيديو بالعنصر المرجعي
      if (video && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      console.log('تم الحصول على إذن الوصول للميديا');
      return stream;
    } catch (error) {
      console.error('خطأ في الوصول للميديا:', error);
      let errorMessage = 'لم يتم منح الإذن للوصول للميكروفون أو الكاميرا';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'تم رفض الإذن. يرجى السماح بالوصول للميكروفون والكاميرا';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'لم يتم العثور على الميكروفون أو الكاميرا';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'الميكروفون أو الكاميرا مستخدمة من تطبيق آخر';
        }
      }
      
      setPermissionError(errorMessage);
      setHasPermissions(false);
      return null;
    }
  };

  const toggleMic = async () => {
    if (isAutoMicEnabled && currentPhase === 'debate' && !isMyTurn) {
      return;
    }

    const newState = !isMicEnabled;
    
    if (newState && !mediaStream) {
      const stream = await requestMediaAccess(true, isCameraEnabled);
      if (!stream) return;
    }

    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = newState;
      });
    }

    setIsMicEnabled(newState);
    onMicToggle?.(newState);
    console.log(`الميكروفون ${newState ? 'مفعل' : 'معطل'}`);
  };

  const toggleCamera = async () => {
    const newState = !isCameraEnabled;
    
    if (newState && !mediaStream) {
      const stream = await requestMediaAccess(isMicEnabled, true);
      if (!stream) return;
    }

    if (mediaStream) {
      const videoTracks = mediaStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = newState;
      });
      
      // تحديث المرجع المرئي
      if (videoRef.current) {
        if (newState) {
          videoRef.current.srcObject = mediaStream;
        } else {
          videoRef.current.srcObject = null;
        }
      }
    }

    setIsCameraEnabled(newState);
    onCameraToggle?.(newState);
    console.log(`الكاميرا ${newState ? 'مفعلة' : 'معطلة'}`);
  };

  const toggleAutoMic = () => {
    setIsAutoMicEnabled(!isAutoMicEnabled);
  };

  const toggleAutoCamera = () => {
    setIsAutoCameraEnabled(!isAutoCameraEnabled);
    if (!isAutoCameraEnabled) {
      setIsCameraEnabled(true);
    } else {
      setIsCameraEnabled(false);
    }
  };

  // تنظيف الموارد عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const canToggleMic = !isAutoMicEnabled || 
    currentPhase === 'preparation' || 
    currentPhase === 'final' ||
    (currentPhase === 'debate' && isMyTurn);

  return (
    <div className="space-y-6">
      {/* معاينة الكاميرا */}
      {isCameraEnabled && (
        <div className="flex justify-center">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-32 h-24 bg-gray-200 rounded-lg object-cover border-2 border-islamic-gold-300"
            />
            <div className="absolute top-1 right-1 bg-green-500 w-2 h-2 rounded-full"></div>
          </div>
        </div>
      )}

      {/* أزرار التحكم الرئيسية */}
      <div className="flex items-center justify-center space-x-reverse space-x-4">
        <Button
          onClick={toggleMic}
          variant={isMicEnabled ? "default" : "destructive"}
          size="lg"
          className={`w-14 h-14 rounded-full ${
            !canToggleMic 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-110'
          } transition-all duration-200`}
          disabled={!canToggleMic}
        >
          {isMicEnabled ? (
            <Mic className="h-6 w-6" />
          ) : (
            <MicOff className="h-6 w-6" />
          )}
        </Button>

        <Button
          onClick={toggleCamera}
          variant={isCameraEnabled ? "default" : "outline"}
          size="lg"
          className="w-14 h-14 rounded-full hover:scale-110 transition-all duration-200"
        >
          {isCameraEnabled ? (
            <Camera className="h-6 w-6" />
          ) : (
            <CameraOff className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* رسائل الخطأ */}
      {permissionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs text-center">
          {permissionError}
        </div>
      )}

      {/* معلومات الحالة */}
      <div className="text-xs text-center space-y-2">
        <div className={`font-medium ${
          currentPhase === 'preparation' || currentPhase === 'final' 
            ? 'text-blue-600' 
            : isMyTurn 
              ? 'text-green-600' 
              : 'text-orange-600'
        }`}>
          {currentPhase === 'preparation' && 'وقت التحضير - الميكروفون مفتوح'}
          {currentPhase === 'final' && 'النقاش النهائي - الميكروفون مفتوح'}
          {currentPhase === 'debate' && (isMyTurn ? 'دورك للحديث' : 'انتظر دورك')}
          {currentPhase === 'waiting' && 'في الانتظار'}
          {currentPhase === 'ended' && 'انتهت المناظرة'}
        </div>
        
        {hasPermissions && (
          <div className="text-green-600">✓ تم منح الإذن للوصول للميديا</div>
        )}
      </div>

      {/* خيارات التحكم التلقائي */}
      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <h4 className="text-sm font-medium text-center">خيارات التحكم</h4>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">تحكم تلقائي في الميكروفون</span>
          <Switch
            checked={isAutoMicEnabled}
            onCheckedChange={toggleAutoMic}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs">تشغيل الكاميرا تلقائياً</span>
          <Switch
            checked={isAutoCameraEnabled}
            onCheckedChange={toggleAutoCamera}
          />
        </div>

        {isAutoMicEnabled && (
          <div className="text-xs text-muted-foreground text-center mt-2">
            الميكروفون مفتوح في وقت التحضير والنهاية، ومتحكم به حسب الدور في المناظرة
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaControls;
