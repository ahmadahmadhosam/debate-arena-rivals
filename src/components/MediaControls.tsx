
import React, { useState, useEffect } from 'react';
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

  // التحكم التلقائي في الميكروفون
  useEffect(() => {
    if (isAutoMicEnabled) {
      // في الأوقات المفتوحة (التحضير والنهاية) يكون الميكروفون مفتوح دائماً
      if (currentPhase === 'preparation' || currentPhase === 'final') {
        setIsMicEnabled(true);
        onMicToggle?.(true);
      } 
      // في جولات المناظرة يعتمد على الدور
      else if (currentPhase === 'debate') {
        setIsMicEnabled(isMyTurn);
        onMicToggle?.(isMyTurn);
      }
      // في الحالات الأخرى يكون مغلق
      else {
        setIsMicEnabled(false);
        onMicToggle?.(false);
      }
    }
  }, [isMyTurn, currentPhase, isAutoMicEnabled, onMicToggle]);

  // طلب الوصول للميديا
  const requestMediaAccess = async (audio: boolean, video: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
      setMediaStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('لم يتم منح الإذن للوصول للميكروفون أو الكاميرا');
      return null;
    }
  };

  const toggleMic = async () => {
    // إذا كان التحكم التلقائي مفعل والمستخدم ليس في دوره في جولة مناظرة، لا يمكن التغيير
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
    }

    setIsCameraEnabled(newState);
    onCameraToggle?.(newState);
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

  const canToggleMic = !isAutoMicEnabled || currentPhase !== 'debate' || isMyTurn || currentPhase === 'preparation' || currentPhase === 'final';

  return (
    <div className="space-y-6">
      {/* أزرار التحكم الرئيسية */}
      <div className="flex items-center justify-center space-x-reverse space-x-4">
        {/* زر الميكروفون */}
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

        {/* زر الكاميرا */}
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
      </div>

      {/* خيارات التحكم التلقائي */}
      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <h4 className="text-sm font-medium text-center">خيارات التحكم</h4>
        
        {/* التحكم التلقائي في الميكروفون */}
        <div className="flex items-center justify-between">
          <span className="text-xs">تحكم تلقائي في الميكروفون</span>
          <Switch
            checked={isAutoMicEnabled}
            onCheckedChange={toggleAutoMic}
          />
        </div>

        {/* التحكم التلقائي في الكاميرا */}
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
