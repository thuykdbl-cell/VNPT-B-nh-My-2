/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Users, DollarSign, BarChart3, Search, Calendar, Phone, MapPin, 
  CheckCircle2, Clock, Eye, Trash2, ChevronRight, Ban, RefreshCw
} from 'lucide-react';
import { Registration } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/registrations');
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) => 
          prev.map((r) => r.id === id ? { ...r, status: newStatus as any } : r)
        );
        if (selectedReg && selectedReg.id === id) {
          setSelectedReg((prev) => prev ? { ...prev, status: newStatus as any } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Anh/Chị có chắc chắn muốn xóa đơn đăng ký này?')) return;
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
        setSelectedReg(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pricing helper
  const getPlanPrice = (planId: string) => {
    if (planId === 'home1') return 165000;
    if (planId === 'mesh2') return 210000;
    if (planId === 'tvvip') return 299000;
    return 210000; // default estimate
  };

  const getPlanName = (planId: string) => {
    if (planId === 'home1') return 'Home 1';
    if (planId === 'mesh2') return 'Home Mesh 2';
    if (planId === 'tvvip') return 'Home TV VIP';
    return 'Gói tùy chỉnh';
  };

  // Metrics calculators
  const activeRegistrations = registrations.filter(r => r.status !== 'cancelled');
  const mrrTotal = activeRegistrations.reduce((acc, curr) => {
    const planBase = getPlanPrice(curr.planId);
    const addons = (curr.extraMesh * 20000) + (curr.extraCamera ? 40000 : 0);
    return acc + planBase + addons;
  }, 0);

  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const surveyedCount = registrations.filter(r => r.status === 'surveyed').length;
  const installedCount = registrations.filter(r => r.status === 'installed').length;

  // Filters search
  const filteredRegs = registrations.filter((r) => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200/60">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#006191]" /> Hệ Thống Quản Trị Yêu Cầu
          </h2>
          <p className="text-xs text-slate-500">Giám sát khảo sát thực tế và quy trình thi công kỹ thuật</p>
        </div>
        <button 
          onClick={fetchRegistrations}
          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-[#006191] text-slate-600 hover:text-[#006191] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Cập nhật dữ liệu
        </button>
      </div>

      {/* High-level metrics blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total inquiries */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-[#006191] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Số Đơn</span>
            <span className="text-2xl font-extrabold text-slate-800 font-mono">{registrations.length}</span>
            <span className="text-[10px] text-slate-500 block">đăng ký từ web</span>
          </div>
        </div>

        {/* Total Estimated Revenue MRR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ước Tính Doanh Thu</span>
            <span className="text-xl font-extrabold text-[#006191] font-mono">
              {mrrTotal.toLocaleString('vi-VN')}
            </span>
            <span className="text-[10px] text-slate-500 block">đ/tháng cước</span>
          </div>
        </div>

        {/* Survey progress status bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Thi Công Hoàn Tất</span>
            <span className="text-2xl font-extrabold text-slate-800 font-mono">{installedCount}</span>
            <span className="text-[10px] text-slate-500 block">đã đấu nối trực tiếp</span>
          </div>
        </div>

        {/* Pending review */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Đang Chờ Khảo Sát</span>
            <span className="text-2xl font-extrabold text-slate-800 font-mono">{pendingCount}</span>
            <span className="text-[10px] text-slate-500 block">cần liên hệ ngay</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main List Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm khách hàng theo SĐT, Họ tên, Mã đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:border-[#006191] focus:ring-1 focus:ring-[#006191] outline-none rounded-xl text-sm bg-white"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 focus:border-[#006191] outline-none rounded-xl text-sm bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="surveyed">Đã khảo sát</option>
              <option value="installed">Đã hoàn tất</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Table list */}
          {loading ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <div className="w-8 h-8 rounded-full border-2 border-t-sky-500 border-slate-200 animate-spin mx-auto mb-2"></div>
              <p className="text-slate-500 text-xs">Đang tải danh sách đăng ký...</p>
            </div>
          ) : filteredRegs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-500">
              <p className="text-sm">Không tìm thấy yêu cầu nào tương thích.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRegs.map((reg) => (
                <div 
                  key={reg.id}
                  onClick={() => setSelectedReg(reg)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all bg-white flex items-center justify-between gap-4 ${
                    selectedReg?.id === reg.id 
                      ? 'border-[#006191] ring-1 ring-[#006191] shadow-md' 
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#006191] bg-sky-50 px-2 py-0.5 rounded-md">
                        {reg.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        reg.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                        reg.status === 'surveyed' ? 'bg-sky-50 text-sky-600 border border-sky-200' :
                        reg.status === 'installed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        'bg-red-50 text-red-500 border border-red-200'
                      }`}>
                        {reg.status === 'pending' ? 'Chờ khảo sát' :
                         reg.status === 'surveyed' ? 'Đã khảo sát' :
                         reg.status === 'installed' ? 'Đã lắp xong' : 'Đã hủy'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{reg.name}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {reg.phone}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Lắp ngày {reg.preferredDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      {getPlanName(reg.planId)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Inspection Panel Column */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-5">
          {selectedReg ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400 block">Chi tiết mã:</span>
                  <span className="font-mono font-bold text-sm text-[#006191]">{selectedReg.id}</span>
                </div>
                <button
                  onClick={() => handleDelete(selectedReg.id)}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                  title="Xóa yêu cầu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Client general info */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Khách hàng</span>
                  <p className="font-bold text-slate-800 text-base">{selectedReg.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Số điện thoại liên hệ</span>
                  <p className="font-semibold text-slate-700 font-mono">{selectedReg.phone}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Địa chỉ thi công lắp đặt</span>
                  <p className="text-sm text-slate-600 flex items-start gap-1">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    {selectedReg.address}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Gói dịch vụ đã chọn</span>
                  <p className="text-sm font-bold text-[#006191]">
                    {getPlanName(selectedReg.planId)} (Tốc độ {selectedReg.planId === 'home1' ? '100 Mbps' : selectedReg.planId === 'mesh2' ? '150 Mbps' : '300 Mbps'})
                  </p>
                  {selectedReg.extraMesh > 0 && (
                    <p className="text-xs text-slate-500 font-medium">+ Thêm {selectedReg.extraMesh} Thiết bị Mesh WiFi kích sóng</p>
                  )}
                  {selectedReg.extraCamera && (
                    <p className="text-xs text-slate-500 font-medium">+ Thêm camera an ninh AI bảo vệ ngoài trời</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ngày mong muốn lắp đặt</span>
                  <p className="text-sm font-semibold text-slate-700 font-mono">{selectedReg.preferredDate}</p>
                </div>
                {selectedReg.notes && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Ghi chú của khách</span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic leading-relaxed">
                      "{selectedReg.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Status Updater Buttons */}
              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cập nhật trạng thái thi công:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedReg.id, 'surveyed')}
                    disabled={selectedReg.status === 'surveyed'}
                    className="flex items-center justify-center gap-1 py-2 px-3 border border-sky-100 hover:bg-sky-50 text-sky-600 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Khảo sát xong
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReg.id, 'installed')}
                    disabled={selectedReg.status === 'installed'}
                    className="flex items-center justify-center gap-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Lắp đặt xong
                  </button>
                </div>
                <button
                  onClick={() => handleUpdateStatus(selectedReg.id, 'cancelled')}
                  disabled={selectedReg.status === 'cancelled'}
                  className="w-full flex items-center justify-center gap-1 py-2 px-3 border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" /> Hủy yêu cầu đăng ký
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Chọn một đơn đăng ký ở danh sách bên trái để xem chi tiết và cập nhật trạng thái.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
