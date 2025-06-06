
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Camera } from 'lucide-react';

interface MediaControlsProps {
  isMyTurn: boolean;
  autoMicControl?: boolean;
  onMicToggle?: (enabled: boolean) => void;
  onCameraToggle?: (enabled: boolean) => void;
}

const MediaControls: React.FC<MediaControlsProps> = ({
  isMyTurn,
  autoMicControl = true,
  onMicToggle,
  onCameraToggle
}) => {
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // التحكم التلقائي في الميكروفون حسب الدور
  useEffect(() => {
    if (autoMicControl) {
      setIsMicEnabled(isMyTurn);
      onMicToggle?.(isMyTurn);
    }
  }, [isMyTurn, autoMicControl, onMicToggle]);

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
    if (!autoMicControl || isMyTurn) {
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
    }
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

  // تنظيف الموارد عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  return (
    <div className="flex items-center justify-center space-x-reverse space-x-4">
      {/* زر الميكروفون */}
      <Button
        onClick={toggleMic}
        variant={isMicEnabled ? "default" : "destructive"}
        size="lg"
        className={`w-14 h-14 rounded-full ${
          !isMyTurn && autoMicControl 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:scale-110'
        } transition-all duration-200`}
        disabled={!isMyTurn && autoMicControl}
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
        <Camera className="h-6 w-6" />
      </Button>

      {/* معلومات الحالة */}
      <div className="text-xs text-center">
        <div className={`font-medium ${isMyTurn ? 'text-green-600' : 'text-orange-600'}`}>
          {isMyTurn ? 'دورك للحديث' : 'انتظر دورك'}
        </div>
        {autoMicControl && (
          <div className="text-muted-foreground mt-1">
            التحكم التلقائي مفعل
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaControls;
