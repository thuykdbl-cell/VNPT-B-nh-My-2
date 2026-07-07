/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sliders, CheckSquare, Square, Info, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PlanCalculatorProps {
  onSelectPlan: (planId: string, customPrice?: number, speed?: number, hasTv?: boolean, meshCount?: number) => void;
}

const SPEED_STEPS = [
  { speed: 100, price: 165000, label: '100 Mbps (Cơ bản)' },
  { speed: 150, price: 195000, label: '150 Mbps (Phổ biến)' },
  { speed: 200, price: 230000, label: '200 Mbps (Tải nhanh)' },
  { speed: 300, price: 270000, label: '300 Mbps (Mạnh mẽ)' },
  { speed: 500, price: 350000, label: '500 Mbps (Doanh nghiệp)' },
  { speed: 1000, price: 590000, label: '1 Gbps (Giga siêu cấp)' }
];

export default function PlanCalculator({ onSelectPlan }: PlanCalculatorProps) {
  const [speedIndex, setSpeedIndex] = useState(1); // Default to 150 Mbps
  const [hasTv, setHasTv] = useState(true);
  const [meshCount, setMeshCount] = useState(1);
  const [hasCamera, setHasCamera] = useState(false);
  const [totalPrice, setTotalPrice] = useState(210000);
  const [recommendedPlan, setRecommendedPlan] = useState({ id: 'mesh2', name: 'Home Mesh 2' });

  useEffect(() => {
    const basePrice = SPEED_STEPS[speedIndex].price;
    const tvCost = hasTv ? 30000 : 0;
    const meshCost = meshCount * 20000;
    const cameraCost = hasCamera ? 40000 : 0;
    
    const calculated = basePrice + tvCost + meshCost + cameraCost;
    setTotalPrice(calculated);

    // Dynamic standard package matching
    const speed = SPEED_STEPS[speedIndex].speed;
    if (speed <= 100 && !hasTv && meshCount === 0 && !hasCamera) {
      setRecommendedPlan({ id: 'home1', name: 'Home 1 (165.000đ/tháng)' });
    } else if (speed <= 150 && hasTv && meshCount === 1 && !hasCamera) {
      setRecommendedPlan({ id: 'mesh2', name: 'Home Mesh 2 (210.000đ/tháng)' });
    } else if (speed >= 300 || hasCamera || meshCount >= 2) {
      setRecommendedPlan({ id: 'tvvip', name: 'Home TV VIP (299.000đ/tháng)' });
    } else {
      setRecommendedPlan({ id: 'custom', name: 'Gói tùy chọn tối ưu riêng' });
    }
  }, [speedIndex, hasTv, meshCount, hasCamera]);

  const handleSelect = () => {
    const speed = SPEED_STEPS[speedIndex].speed;
    onSelectPlan(recommendedPlan.id, totalPrice, speed, hasTv, meshCount);
    // Smooth scroll to register section
    const registerSection = document.getElementById('register-form-section');
    if (registerSection) {
      registerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 max-w-lg mx-auto">
      <div className="flex items-center gap-2.5 mb-5 border-b border-slate-50 pb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Tự Thiết Kế Gói Cước</h3>
          <p className="text-xs text-slate-500">Kéo thanh trượt để chọn tốc độ và dịch vụ đi kèm</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Speed Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-700">Tốc độ Internet mong muốn:</span>
            <span className="font-bold text-[#006191] font-mono text-base">
              {SPEED_STEPS[speedIndex].speed} Mbps
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={SPEED_STEPS.length - 1}
            value={speedIndex}
            onChange={(e) => setSpeedIndex(Number(e.target.value))}
            className="w-full accent-[#006191] h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
            <span>100M</span>
            <span>150M</span>
            <span>200M</span>
            <span>300M</span>
            <span>500M</span>
            <span>1 Gbps</span>
          </div>
          <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2.5 rounded-xl">
            {SPEED_STEPS[speedIndex].label}
          </p>
        </div>

        {/* Addons Checklist */}
        <div className="space-y-3">
          <span className="text-sm font-semibold text-slate-700 block">Dịch vụ đi kèm thêm:</span>

          {/* TV */}
          <div 
            onClick={() => setHasTv(!hasTv)}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-sky-100 bg-slate-50/50 hover:bg-sky-50/20 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2.5 text-sm">
              {hasTv ? (
                <CheckSquare className="w-5 h-5 text-[#006191] fill-sky-100" />
              ) : (
                <Square className="w-5 h-5 text-slate-300" />
              )}
              <span className="font-semibold text-slate-700">Truyền hình MyTV (200 kênh đặc sắc)</span>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">+30k/tháng</span>
          </div>

          {/* Mesh Devices Slider/Buttons */}
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Thiết bị Mesh WiFi phụ (Kích sóng):</span>
              <span className="text-xs font-bold text-slate-500 font-mono">+{meshCount * 20}k/tháng</span>
            </div>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((count) => (
                <button
                  key={count}
                  onClick={() => setMeshCount(count)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    meshCount === count
                      ? 'bg-[#006191] text-white border-[#006191]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {count === 0 ? 'Không dùng' : `${count} Thiết bị`}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Camera AI */}
          <div 
            onClick={() => setHasCamera(!hasCamera)}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-sky-100 bg-slate-50/50 hover:bg-sky-50/20 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2.5 text-sm">
              {hasCamera ? (
                <CheckSquare className="w-5 h-5 text-[#006191] fill-sky-100" />
              ) : (
                <Square className="w-5 h-5 text-slate-300" />
              )}
              <span className="font-semibold text-slate-700">Smart Camera AI (Outdoor ngoài trời)</span>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">+40k/tháng</span>
          </div>
        </div>

        {/* Pricing Panel & Recommendation */}
        <div className="bg-[#006191]/5 border border-[#006191]/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#006191] tracking-wider block mb-0.5">
              Ước tính giá cước:
            </span>
            <span className="text-3xl font-extrabold text-[#006191] font-mono">
              {totalPrice.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-semibold text-slate-500 ml-1">đ/tháng</span>
            <div className="text-[10px] text-[#006191] font-semibold mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Khuyên dùng gói: <strong className="font-bold underline">{recommendedPlan.name}</strong>
            </div>
          </div>

          <button
            onClick={handleSelect}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-orange-100 transition-all text-sm shrink-0 cursor-pointer"
          >
            Đăng ký gói này <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
