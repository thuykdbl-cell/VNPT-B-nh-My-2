/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Play, RotateCcw, AlertCircle, TrendingUp, Zap, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SpeedTest() {
  const [testState, setTestState] = useState<'idle' | 'pinging' | 'downloading' | 'uploading' | 'complete'>('idle');
  const [ping, setPing] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number | null>(null);
  const [download, setDownload] = useState<number>(0);
  const [upload, setUpload] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0); // Driven needle speed in real-time

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (testState === 'pinging') {
      let duration = 0;
      interval = setInterval(() => {
        duration += 100;
        setPing(Math.floor(25 + Math.random() * 15));
        setJitter(Math.floor(2 + Math.random() * 4));
        setCurrentSpeed(Math.random() * 5); // slow movement for ping

        if (duration >= 2000) {
          clearInterval(interval);
          setTestState('downloading');
        }
      }, 100);
    } else if (testState === 'downloading') {
      let duration = 0;
      interval = setInterval(() => {
        duration += 100;
        // Simulating a standard 35-45 Mbps standard home speed
        const target = 38 + Math.sin(duration / 300) * 4 + Math.random() * 2;
        setDownload(parseFloat(target.toFixed(1)));
        setCurrentSpeed(target);

        if (duration >= 4000) {
          clearInterval(interval);
          setTestState('uploading');
        }
      }, 100);
    } else if (testState === 'uploading') {
      let duration = 0;
      interval = setInterval(() => {
        duration += 100;
        // Simulating standard upload 10-15 Mbps
        const target = 12 + Math.sin(duration / 400) * 2 + Math.random() * 1.5;
        setUpload(parseFloat(target.toFixed(1)));
        setCurrentSpeed(target);

        if (duration >= 4000) {
          clearInterval(interval);
          setTestState('complete');
          setCurrentSpeed(0);
        }
      }, 100);
    }

    return () => clearInterval(interval);
  }, [testState]);

  const startTest = () => {
    setPing(null);
    setJitter(null);
    setDownload(0);
    setUpload(0);
    setCurrentSpeed(0);
    setTestState('pinging');
  };

  // Convert current speed to needle rotation angle
  // max speed is 100 Mbps on the gauge dial for current home test, map it to 0-180 degrees
  const angle = Math.min((currentSpeed / 100) * 180 - 90, 90);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 max-w-lg mx-auto overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-orange-500 fill-orange-500" /> Kiểm Tra Tốc Độ Mạng
          </h3>
          <p className="text-xs text-slate-500">So sánh tốc độ hiện tại của bạn với Cáp quang VNPT</p>
        </div>
        <span className="text-[10px] bg-sky-50 text-[#006191] px-2 py-1 rounded-full font-semibold border border-sky-100 uppercase">
          Speed Sim v1.2
        </span>
      </div>

      <div className="relative flex flex-col items-center py-6">
        {/* Gauge Dial */}
        <div className="relative w-64 h-32 overflow-hidden mb-6">
          {/* Semicircular track */}
          <div className="absolute top-0 left-0 w-64 h-64 border-[16px] border-slate-100 rounded-full"></div>
          {/* Colored speed track */}
          <div className="absolute top-0 left-0 w-64 h-64 border-[16px] border-t-sky-500 border-r-sky-500 border-b-transparent border-l-transparent rounded-full rotate-[-45deg] opacity-70"></div>
          
          {/* Needle pin */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-800 rounded-full z-20 flex items-center justify-center border-4 border-white shadow"></div>
          
          {/* Needle pointer */}
          <div 
            className="absolute bottom-0 left-1/2 origin-bottom w-1 h-24 bg-orange-500 z-10"
            style={{ 
              transform: `translateX(-50%) rotate(${angle}deg)`, 
              transition: testState === 'idle' ? 'transform 1s' : 'transform 0.1s ease-out' 
            }}
          ></div>

          {/* Scale values */}
          <span className="absolute bottom-1 left-2 text-[10px] font-bold text-slate-400 font-mono">0</span>
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 font-mono">50 Mbps</span>
          <span className="absolute bottom-1 right-2 text-[10px] font-bold text-slate-400 font-mono">100+</span>
        </div>

        {/* Dynamic speedometer readout */}
        <div className="text-center mb-8">
          <span className="text-5xl font-extrabold text-slate-800 font-mono tracking-tight">
            {testState === 'downloading' ? download : testState === 'uploading' ? upload : currentSpeed.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-slate-500 ml-1.5 uppercase font-sans">Mbps</span>
          <p className="text-xs font-semibold text-orange-500 uppercase mt-1 tracking-wider">
            {testState === 'idle' && 'Sẵn sàng kiểm tra'}
            {testState === 'pinging' && 'Đang đo độ trễ (Ping)...'}
            {testState === 'downloading' && 'Đang đo tốc độ tải xuống (Download)...'}
            {testState === 'uploading' && 'Đang đo tốc độ tải lên (Upload)...'}
            {testState === 'complete' && 'Hoàn thành bài test!'}
          </p>
        </div>

        {/* Mini stats table */}
        <div className="grid grid-cols-4 gap-4 w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Ping</span>
            <p className="font-mono font-bold text-slate-700 mt-0.5">
              {ping !== null ? `${ping} ms` : '—'}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Jitter</span>
            <p className="font-mono font-bold text-slate-700 mt-0.5">
              {jitter !== null ? `${jitter} ms` : '—'}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Download</span>
            <p className="font-mono font-bold text-[#006191] mt-0.5">
              {download > 0 ? `${download} Mb` : '—'}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Upload</span>
            <p className="font-mono font-bold text-orange-500 mt-0.5">
              {upload > 0 ? `${upload} Mb` : '—'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full">
          {testState === 'idle' || testState === 'complete' ? (
            <button
              onClick={startTest}
              className="w-full flex items-center justify-center gap-2 bg-[#006191] text-white py-3 px-6 rounded-2xl font-bold shadow-lg shadow-sky-100 hover:bg-[#0b5eaf] transition-all cursor-pointer"
            >
              {testState === 'complete' ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              {testState === 'complete' ? 'Kiểm tra lại' : 'Bắt đầu kiểm tra tốc độ'}
            </button>
          ) : (
            <button
              onClick={() => { setTestState('idle'); setCurrentSpeed(0); }}
              className="w-full bg-slate-100 text-slate-500 hover:bg-slate-200 py-3 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertCircle className="w-5 h-5" /> Hủy kiểm tra
            </button>
          )}
        </div>
      </div>

      {/* Comparison Drawer */}
      <AnimatePresence>
        {testState === 'complete' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100 pt-6 mt-4 space-y-4"
          >
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
              <h4 className="text-sm font-bold text-orange-800 flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-4 h-4" /> Kết Quả So Sánh Thực Tế
              </h4>
              <p className="text-xs text-orange-700 leading-relaxed">
                Tốc độ tải xuống hiện tại của bạn là <strong className="font-bold">{download} Mbps</strong>. Khi chuyển sang cáp quang thế hệ mới của VNPT, tốc độ sẽ nhanh hơn tối thiểu <strong className="font-bold">{(150 / download).toFixed(1)} lần</strong> (đối với gói Mesh 2) và lên tới <strong className="font-bold">{(10000 / download).toFixed(0)} lần</strong> (đối với công nghệ XGS-PON 10Gbps)!
              </p>
            </div>

            {/* Visual comparison bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Mạng hiện tại của bạn</span>
                  <span className="text-slate-700 font-mono">{download} Mbps</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((download / 300) * 100, 100)}%` }}
                    transition={{ duration: 1 }}
                    className="bg-slate-400 h-full rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#006191]">Gói VNPT Home Mesh 2</span>
                  <span className="text-[#006191] font-mono">150 Mbps</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '50%' }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="bg-sky-500 h-full rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-600 flex items-center gap-1">
                    Gói VNPT Home TV VIP <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
                  </span>
                  <span className="text-emerald-600 font-mono">300 Mbps</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="bg-emerald-500 h-full rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
