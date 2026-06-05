import { useEffect, useRef } from 'react';
import { useMigrationStore } from '../../store/migrationStore';
import { getQRKey, getQRCode, checkQR } from '../../services/api';
import { Button } from '../shared/Button';

export function QRLoginPanel() {
  const {
    selectedPlatform,
    qrKey,
    qrImage,
    qrStatus,
    setQrInfo,
    setQrStatus,
    setAuthCookie,
  } = useMigrationStore();
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!selectedPlatform) return;
    startLogin();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedPlatform?.id]);

  async function startLogin() {
    if (!selectedPlatform) return;
    try {
      setQrStatus('waiting');
      const key = await getQRKey(selectedPlatform.id);
      const { qrImage } = await getQRCode(selectedPlatform.id, key);
      setQrInfo(key, qrImage);
      startPolling(key);
    } catch {
      setQrStatus('expired');
    }
  }

  function startPolling(key: string) {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const result = await checkQR(selectedPlatform!.id, key);
        if (result.code === 803 && result.cookie) {
          clearInterval(pollRef.current);
          setAuthCookie(result.cookie);
        } else if (result.code === 802) {
          setQrStatus('scanned');
        } else if (result.code === 800) {
          clearInterval(pollRef.current);
          setQrStatus('expired');
        }
      } catch {
        // keep polling
      }
    }, 2000);
  }

  const statusText: Record<string, string> = {
    idle: '准备中...',
    waiting: '请用手机扫码登录',
    scanned: '已扫码，请在手机上确认',
    confirmed: '登录成功！',
    expired: '二维码已过期',
  };

  return (
    <div className="text-center py-4">
      <h2 className="text-lg font-semibold mb-1">
        登录{selectedPlatform?.nameZh}
      </h2>
      <p className="text-white/40 text-sm mb-4">
        使用{selectedPlatform?.nameZh} App 扫描二维码
      </p>

      {qrImage ? (
        <div className={`inline-block p-3 bg-white rounded-2xl mb-3 ${qrStatus === 'expired' ? 'opacity-30' : ''}`}>
          <img
            src={qrImage.startsWith('data:') ? qrImage : `data:image/png;base64,${qrImage}`}
            alt="QR Code"
            className="w-48 h-48"
          />
        </div>
      ) : (
        <div className="w-48 h-48 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      )}

      <p className={`text-sm ${
        qrStatus === 'confirmed' ? 'text-green-400' :
        qrStatus === 'expired' ? 'text-red-400' :
        qrStatus === 'scanned' ? 'text-blue-400' :
        'text-white/50'
      }`}>
        {statusText[qrStatus]}
      </p>

      {qrStatus === 'expired' && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={startLogin}>
          刷新二维码
        </Button>
      )}
    </div>
  );
}
