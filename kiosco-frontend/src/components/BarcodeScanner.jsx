import { useState, useEffect, useRef } from 'react';
import { Camera, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose, isOpen }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);

  //Verificar si estamos en un contexto seguro
  const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  const hasCameraAPI = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

  useEffect(() => {
    if (isOpen) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setError(null);
      setScanning(true);

      //verificar si la API esta disponible
      if (!hasCameraAPI) {
        throw new Error('Tu navegador no soporta acceso a la cámara o necesitas HTTPS');
      }

      

      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Importar dinámicamente la librería de escaneo
      // Usamos @zxing/library que es ligera y funciona bien
      const { BrowserMultiFormatReader } = await import('@zxing/library');
      const codeReader = new BrowserMultiFormatReader();
      scannerRef.current = codeReader;

      // Iniciar escaneo continuo
      codeReader.decodeFromVideoDevice(
        undefined, // undefined = usa la cámara por defecto
        videoRef.current,
        (result, err) => {
          if (result) {
            const code = result.getText();
            
            // Evitar escaneos duplicados rápidos
            if (code !== lastScanned) {
              setLastScanned(code);
              handleBarcodeDetected(code);
            }
          }
          
          if (err && !(err.name === 'NotFoundException')) {
            console.error('Error escaneando:', err);
          }
        }
      );

    } catch (err) {
      console.error('Error al iniciar escáner:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    // Detener el escáner
    if (scannerRef.current) {
      scannerRef.current.reset();
      scannerRef.current = null;
    }

    // Detener el stream de video
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setScanning(false);
  };

  const handleBarcodeDetected = (code) => {
    // Vibrar el dispositivo si está disponible
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Llamar al callback con el código escaneado
    onScan(code);

    // Cerrar el escáner automáticamente después de escanear
    setTimeout(() => {
      stopScanner();
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black to-transparent">
          <div className="flex justify-between items-center text-white">
            <div>
              <h2 className="text-xl font-bold">Escanear Código de Barras</h2>
              <p className="text-sm opacity-80">Apunta la cámara al código</p>
            </div>
            <button
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Video Preview */}
        <div className="flex-1 flex items-center justify-center relative">
          {scanning && !error && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              
              {/* Overlay de escaneo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Marco de escaneo */}
                  <div className="w-64 h-64 border-4 border-primary-500 rounded-lg relative">
                    {/* Esquinas animadas */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                    
                    {/* Línea de escaneo animada */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-scan"></div>
                    </div>
                  </div>
                  
                  {/* Texto de ayuda */}
                  <p className="text-white text-center mt-4 font-semibold text-lg drop-shadow-lg">
                    Posiciona el código en el marco
                  </p>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="text-center text-white p-8">
              <AlertCircle size={64} className="mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-bold mb-2">Error</h3>
              <p className="mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  startScanner();
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {!scanning && !error && (
            <div className="text-center text-white p-8">
              <Loader size={64} className="mx-auto mb-4 animate-spin" />
              <p>Iniciando cámara...</p>
            </div>
          )}
        </div>

        {/* Footer con instrucciones */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black to-transparent">
          <div className="text-white text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Camera size={16} />
              <span>Asegúrate de tener buena iluminación</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(256px); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}