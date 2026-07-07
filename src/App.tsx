/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { 
  Phone, HelpCircle, ArrowRight, Zap, CheckCircle2, Sliders, CheckSquare, 
  Square, ShieldCheck, MapPin, Search, Calendar, Play, RotateCcw, AlertCircle, 
  RefreshCw, Eye, Trash2, Ban, Navigation, Menu, X, Check, Laptop, Router, 
  Tv, Video, Shield, Headphones, Award, Sparkles, ClipboardList, Info, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AIAdvisor from './components/AIAdvisor';
import SpeedTest from './components/SpeedTest';
import PlanCalculator from './components/PlanCalculator';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Navigation / View modes
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Custom plan calculator output connected to form
  const [selectedPlanId, setSelectedPlanId] = useState<string>('mesh2');
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [customSpeed, setCustomSpeed] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    extraMesh: 0,
    extraCamera: false,
    preferredDate: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // FAQ Accordion states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getPlanName = (planId: string) => {
    if (planId === 'home1') return 'Home 1';
    if (planId === 'mesh2') return 'Home Mesh 2';
    if (planId === 'tvvip') return 'Home TV VIP';
    return 'Gói tùy chỉnh';
  };

  const handleSelectPlan = (planId: string, price?: number, speed?: number) => {
    setSelectedPlanId(planId);
    if (planId === 'custom' && price && speed) {
      setCustomPrice(price);
      setCustomSpeed(speed);
    } else {
      setCustomPrice(null);
      setCustomSpeed(null);
    }
    
    // Automatically pre-fill fields based on plan selection
    if (planId === 'mesh2') {
      setFormData(prev => ({ ...prev, extraMesh: 1, extraCamera: false }));
    } else if (planId === 'tvvip') {
      setFormData(prev => ({ ...prev, extraMesh: 2, extraCamera: true }));
    } else if (planId === 'home1') {
      setFormData(prev => ({ ...prev, extraMesh: 0, extraCamera: false }));
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, SĐT, Địa chỉ).');
      return;
    }
    
    setSubmitting(true);
    setErrorMessage('');
    
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        planId: selectedPlanId,
        extraMesh: formData.extraMesh,
        extraCamera: formData.extraCamera,
        preferredDate: formData.preferredDate || new Date().toISOString().split('T')[0],
        notes: formData.notes
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(data.registration);
        // reset form
        setFormData({
          name: '',
          phone: '',
          address: '',
          extraMesh: 0,
          extraCamera: false,
          preferredDate: '',
          notes: ''
        });
      } else {
        setErrorMessage(data.error || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
      }
    } catch (err) {
      setErrorMessage('Đã xảy ra sự cố kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans">
      
      {/* Navigation bar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/90 border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006191] to-[#0b5eaf] flex items-center justify-center text-white font-black shadow-md shadow-sky-100">
              VN
            </div>
            <a href="#hero" className="font-extrabold text-lg uppercase tracking-wider text-[#006191] flex items-center gap-1 cursor-pointer">
              VNPT <span className="text-orange-500 font-medium text-xs">Bình Mỹ</span>
            </a>
          </div>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#dich-vu" className="text-sm font-semibold text-slate-600 hover:text-[#006191] transition-colors">Dịch vụ</a>
            <a href="#tu-thiet-ke" className="text-sm font-semibold text-slate-600 hover:text-[#006191] transition-colors">Bento Suite</a>
            <a href="#goi-cuoc" className="text-sm font-semibold text-slate-600 hover:text-[#006191] transition-colors">Gói cước</a>
            <a href="#quy-trinh" className="text-sm font-semibold text-slate-600 hover:text-[#006191] transition-colors">Quy trình</a>
            <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-[#006191] transition-colors">Hỏi đáp</a>
          </div>

          {/* Actions & Admin switch */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                isAdminMode 
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#006191] hover:text-[#006191]'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              {isAdminMode ? 'Trang Chủ' : 'Bảng Quản Trị'}
            </button>

            <a href="tel:18001166" className="flex items-center gap-1.5 text-xs font-bold text-[#006191] hover:underline bg-sky-50 px-3.5 py-2 rounded-full">
              <Phone className="w-4 h-4 text-[#006191]" /> 1800 1166
            </a>
            
            <a 
              href="#register-form-section" 
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all cursor-pointer"
            >
              ĐĂNG KÝ LẮP ĐẶT
            </a>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="p-2 text-slate-500 hover:text-[#006191]"
              title="Toggle admin mode"
            >
              <ClipboardList className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-[#006191]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 bg-white"
            >
              <div className="px-6 py-4 space-y-4 flex flex-col font-semibold">
                <a onClick={() => setMobileMenuOpen(false)} href="#dich-vu" className="text-slate-600 hover:text-[#006191]">Dịch vụ</a>
                <a onClick={() => setMobileMenuOpen(false)} href="#tu-thiet-ke" className="text-slate-600 hover:text-[#006191]">Bento Suite</a>
                <a onClick={() => setMobileMenuOpen(false)} href="#goi-cuoc" className="text-slate-600 hover:text-[#006191]">Gói cước</a>
                <a onClick={() => setMobileMenuOpen(false)} href="#quy-trinh" className="text-slate-600 hover:text-[#006191]">Quy trình</a>
                <a onClick={() => setMobileMenuOpen(false)} href="#faq" className="text-slate-600 hover:text-[#006191]">Hỏi đáp</a>
                
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <a href="tel:18001166" className="flex items-center justify-center gap-1.5 bg-sky-50 text-[#006191] py-2.5 rounded-xl text-sm font-bold">
                    <Phone className="w-4 h-4" /> Gọi 1800 1166
                  </a>
                  <a 
                    onClick={() => setMobileMenuOpen(false)} 
                    href="#register-form-section" 
                    className="bg-orange-500 text-white py-2.5 rounded-xl text-sm font-bold text-center block shadow-lg shadow-orange-100"
                  >
                    Đăng Ký Thi Công
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <div className="flex-grow pt-20">
        
        {isAdminMode ? (
          /* Staff/Admin Console mode */
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
              <div className="flex justify-between items-center bg-[#006191]/5 p-4 rounded-2xl border border-[#006191]/10">
                <div className="flex items-center gap-2 text-[#006191]">
                  <Sparkles className="w-5 h-5 text-orange-500 fill-orange-500" />
                  <p className="text-xs font-semibold">Anh/Chị đang ở **Bảng Quản Trị Nhân Viên**. Nhấp vào nút "Thoát chế độ quản trị" để quay lại trang đăng ký khách hàng.</p>
                </div>
                <button
                  onClick={() => setIsAdminMode(false)}
                  className="bg-white text-slate-700 border border-slate-200 hover:border-red-500 hover:text-red-500 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Thoát chế độ quản trị
                </button>
              </div>
              <AdminDashboard />
            </div>
          </div>
        ) : (
          /* Standard Customer Landing Page Mode */
          <>
            {/* Hero Banner Section */}
            <header id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div 
                  className="w-full h-full bg-cover bg-center scale-105" 
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDdIq024PGLDqNKZx6GzXNlUjfu5oB5vSy7nMe_whCF7pAe4iV_SIVwMC32VBDZh_DBaurAw0C65S00ftaolqQGvQn1uUzLxd5GcJ3SLwwNdXCdnALogQyeVXh5APvb-44pmzPtvex-NqpFxDVeDewWdQcg25YMy2ov9L1X4j9JmRvFOghJEh6meFjHERA-C5kUuA3f_R2KeKeePkqHzFbFcHRbWcdqyMIRfo8qXNIk3BgoCDRgzzVM7Q')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/40 to-transparent"></div>
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-8 w-full py-16">
                <div className="max-w-2xl text-white space-y-6">
                  
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-orange-500/10 text-orange-400 font-bold text-xs border border-orange-500/20 tracking-wide uppercase"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Đột Phá Cáp Quang XGS-PON 10Gbps
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-6xl font-black leading-[1.15] tracking-tight text-white"
                  >
                    Kết nối tốc độ cao - <br/>
                    <span className="text-orange-400 underline decoration-sky-400 decoration-wavy">Cuộc sống thông minh</span> <br/>
                    cùng VNPT Bình Mỹ
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg"
                  >
                    Trải nghiệm kỷ nguyên số vượt trội với Internet cáp quang thế hệ mới, MyTV 4K đa kênh, Camera an ninh thông minh AI và hệ thống WiFi Mesh phủ sóng xuyên tường.
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 pt-4"
                  >
                    <a 
                      href="#register-form-section" 
                      className="shimmer-btn bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 text-center transition-all cursor-pointer"
                    >
                      ĐĂNG KÝ LẮP ĐẶT NGAY
                    </a>
                    <a 
                      href="#tu-thiet-ke" 
                      className="bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/20 px-8 py-4 rounded-2xl text-base font-bold text-center transition-all cursor-pointer"
                    >
                      Tự thiết kế gói cước
                    </a>
                  </motion.div>
                </div>
              </div>
            </header>

            {/* Core Services Section */}
            <section id="dich-vu" className="py-20 px-6 bg-white">
              <div className="max-w-7xl mx-auto">
                
                {/* Title */}
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                  <span className="text-[10px] font-bold text-[#006191] tracking-wider uppercase bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                    Sản phẩm & Giải pháp
                  </span>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tại sao nên chọn VNPT?</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Hạ tầng mạng viễn thông hiện đại hàng đầu Việt Nam mang lại trải nghiệm truy cập thông suốt, ổn định và bảo mật tối đa.
                  </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Card 1 */}
                  <div className="p-6 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-sky-100 hover:shadow-xl transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#006191]/10 flex items-center justify-center text-[#006191] mb-6 group-hover:bg-[#006191] group-hover:text-white transition-all">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Công nghệ XGS-PON</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tiên phong hạ tầng cáp quang thế hệ mới, đáp ứng mọi nhu cầu băng thông cực lớn cho stream, chơi game, gửi dữ liệu dung lượng cao.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="p-6 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-sky-100 hover:shadow-xl transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#006191]/10 flex items-center justify-center text-[#006191] mb-6 group-hover:bg-[#006191] group-hover:text-white transition-all">
                      <Laptop className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Băng Thông Siêu Rộng</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Download và Upload đối xứng mượt mà trong chớp mắt, dẹp bỏ hoàn toàn hiện tượng lag nghẽn mạng giờ cao điểm tại gia đình.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="p-6 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-sky-100 hover:shadow-xl transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#006191]/10 flex items-center justify-center text-[#006191] mb-6 group-hover:bg-[#006191] group-hover:text-white transition-all">
                      <Router className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Hệ Thống WiFi Mesh</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Xóa bỏ hoàn toàn "vùng chết" sóng WiFi trong nhà. Chuyển vùng liền mạch (Seamless Roaming) khi di chuyển giữa các phòng, các tầng lầu.
                    </p>
                  </div>

                  {/* Card 4 */}
                  <div className="p-6 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-sky-100 hover:shadow-xl transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#006191]/10 flex items-center justify-center text-[#006191] mb-6 group-hover:bg-[#006191] group-hover:text-white transition-all">
                      <Video className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Smart Camera AI</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Hệ thống camera giám sát ngoài trời thông minh, nhận diện chuyển động, lưu trữ đám mây bảo mật tuyệt đối, an tâm ngày đêm.
                    </p>
                  </div>

                  {/* Card 5 */}
                  <div className="p-6 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-sky-100 hover:shadow-xl transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#006191]/10 flex items-center justify-center text-[#006191] mb-6 group-hover:bg-[#006191] group-hover:text-white transition-all">
                      <Tv className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Truyền Hình MyTV 4K</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sở hữu kho nội dung cực kỳ phong phú trên 200 kênh đặc sắc trong nước và quốc tế, phim bom tấn 4K bản quyền sắc nét.
                    </p>
                  </div>

                  {/* Card 6 */}
                  <div className="p-6 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-sky-100 hover:shadow-xl transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#006191]/10 flex items-center justify-center text-[#006191] mb-6 group-hover:bg-[#006191] group-hover:text-white transition-all">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Hỗ Trợ Kỹ Thuật 24/7</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Khảo sát nhanh trong 60 phút, thi công lắp đặt nhanh gọn trong vòng 24 giờ. Đội ngũ kỹ thuật viên địa bàn Bình Mỹ thân thiện.
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* Interactive Suite Section (Bento Grid) */}
            <section id="tu-thiet-ke" className="py-20 px-6 bg-slate-100/50 border-y border-slate-200/30">
              <div className="max-w-7xl mx-auto">
                
                {/* Title */}
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                  <span className="text-[10px] font-bold text-orange-500 tracking-wider uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                    Bento Suite Trải Nghiệm
                  </span>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Cá Nhân Hóa Trải Nghiệm Công Nghệ</h2>
                  <p className="text-sm text-slate-500">
                    Đo thử tốc độ hiện tại của bạn và sử dụng thanh trượt thiết kế gói cước lý tưởng cho gia đình.
                  </p>
                </div>

                {/* Bento Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                  
                  {/* Speed Test Column */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-tr from-[#006191] to-[#0b5eaf] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-48">
                      <div className="absolute right-0 bottom-0 opacity-10">
                        <Zap className="w-48 h-48 text-white shrink-0" />
                      </div>
                      <div className="z-10">
                        <span className="text-[10px] font-bold bg-white/10 text-white px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block border border-white/10">
                          Công nghệ dẫn đầu
                        </span>
                        <h3 className="text-xl font-bold">Kiểm Tra Trực Quan</h3>
                        <p className="text-xs text-sky-100 mt-2 max-w-md">
                          Hãy kiểm tra tốc độ internet thực tế nhà bạn ngay lập tức thông qua simulator thông minh của VNPT để nhìn thấy sự cải thiện rõ rệt nhất.
                        </p>
                      </div>
                    </div>
                    <SpeedTest />
                  </div>

                  {/* Plan Calculator Column */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-tr from-orange-500 to-red-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-48">
                      <div className="absolute right-0 bottom-0 opacity-10">
                        <Sliders className="w-48 h-48 text-white shrink-0" />
                      </div>
                      <div className="z-10">
                        <span className="text-[10px] font-bold bg-white/10 text-white px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block border border-white/10">
                          Cá nhân hóa tối đa
                        </span>
                        <h3 className="text-xl font-bold">Thiết Kế Cước Theo Ý</h3>
                        <p className="text-xs text-orange-100 mt-2 max-w-md">
                          Kéo thanh trượt để chọn tốc độ mạng phù hợp nhất với gia đình mình và thêm bớt các dịch vụ đi kèm như Mesh WiFi hay Camera AI để có mức giá tốt nhất.
                        </p>
                      </div>
                    </div>
                    <PlanCalculator onSelectPlan={handleSelectPlan} />
                  </div>

                </div>
              </div>
            </section>

            {/* Standard Pricing Section */}
            <section id="goi-cuoc" className="py-20 px-6 bg-white">
              <div className="max-w-7xl mx-auto">
                
                {/* Title */}
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                  <span className="text-[10px] font-bold text-[#006191] tracking-wider uppercase bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                    Bảng giá chính thức
                  </span>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gói Cước Ưu Đãi Mới Nhất</h2>
                  <p className="text-sm text-slate-500">
                    Chọn một trong ba gói cước tiêu chuẩn để đăng ký lắp đặt ngay hôm nay. Khảo sát thực tế trong 60 phút.
                  </p>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                  
                  {/* Package 1 */}
                  <div className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                    selectedPlanId === 'home1' 
                      ? 'border-[#006191] ring-2 ring-[#006191]/40 shadow-xl bg-sky-50/10' 
                      : 'border-slate-100 shadow-sm hover:shadow-lg bg-white'
                  }`}>
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">Home 1</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Nhu cầu cơ bản của gia đình</p>
                        </div>
                        <span className="text-[10px] bg-slate-100 font-bold px-2.5 py-1 rounded-full text-slate-600 border border-slate-200">
                          Cơ Bản
                        </span>
                      </div>
                      
                      <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-extrabold text-[#006191] font-mono">165.000</span>
                        <span className="text-xs font-semibold text-slate-500 ml-1.5">đ/tháng</span>
                      </div>

                      <ul className="space-y-4 text-xs text-slate-600 mb-10">
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-[#006191] shrink-0" />
                          <span>Tốc độ: <strong className="font-bold text-slate-800">100 Mbps</strong></span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-[#006191] shrink-0" />
                          <span>Thiết bị: Modem WiFi 5 tốc độ cao</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-[#006191] shrink-0" />
                          <span>Ưu tiên băng thông truy cập nội dung 4K</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-slate-300 line-through decoration-slate-300">
                          <X className="w-4.5 h-4.5 text-slate-300 shrink-0" />
                          <span>Chưa bao gồm thiết bị Mesh WiFi kích sóng</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-slate-300 line-through decoration-slate-300">
                          <X className="w-4.5 h-4.5 text-slate-300 shrink-0" />
                          <span>Chưa kèm truyền hình MyTV</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan('home1')}
                      className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedPlanId === 'home1'
                          ? 'bg-[#006191] text-white shadow-lg shadow-sky-100'
                          : 'bg-slate-50 text-slate-700 hover:bg-[#006191] hover:text-white border border-slate-200'
                      }`}
                    >
                      {selectedPlanId === 'home1' ? 'Đã Chọn Gói Này' : 'Chọn Gói Này'}
                    </button>
                  </div>

                  {/* Package 2 (Featured) */}
                  <div className={`rounded-3xl p-6 border-2 flex flex-col justify-between relative transition-all duration-300 ${
                    selectedPlanId === 'mesh2'
                      ? 'border-[#006191] ring-2 ring-[#006191]/40 shadow-xl bg-sky-50/10 scale-105 z-10'
                      : 'border-orange-500 shadow-xl bg-white scale-105 z-10'
                  }`}>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-extrabold text-[10px] tracking-widest px-4 py-1.5 rounded-full uppercase shadow shadow-orange-100">
                      ĐƯỢC CHỌN NHIỀU NHẤT
                    </div>

                    <div className="mt-2">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">Home Mesh 2</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Nhà lầu rộng rãi, sóng phủ kín</p>
                        </div>
                        <span className="text-[10px] bg-orange-50 text-orange-500 font-bold px-2.5 py-1 rounded-full border border-orange-100">
                          BÁN CHẠY
                        </span>
                      </div>
                      
                      <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-extrabold text-[#006191] font-mono">210.000</span>
                        <span className="text-xs font-semibold text-slate-500 ml-1.5">đ/tháng</span>
                      </div>

                      <ul className="space-y-4 text-xs text-slate-600 mb-10">
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-orange-500 shrink-0" />
                          <span>Tốc độ: <strong className="font-bold text-slate-800">150 Mbps</strong></span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-orange-500 shrink-0" />
                          <span>Kèm thêm <strong className="font-bold text-slate-800">01 Thiết bị Mesh WiFi</strong> kích sóng</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-orange-500 shrink-0" />
                          <span>Miễn phí ứng dụng MyTV với 200 kênh đặc sắc</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-orange-500 shrink-0" />
                          <span>Tặng thêm 01 tháng cước khi đóng trước 6 tháng</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-slate-300 line-through decoration-slate-300">
                          <X className="w-4.5 h-4.5 text-slate-300 shrink-0" />
                          <span>Chưa kèm camera an ninh giám sát AI ngoài trời</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan('mesh2')}
                      className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedPlanId === 'mesh2'
                          ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-100'
                          : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg'
                      }`}
                    >
                      {selectedPlanId === 'mesh2' ? 'Đã Chọn Gói Này' : 'Chọn Gói Này'}
                    </button>
                  </div>

                  {/* Package 3 */}
                  <div className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                    selectedPlanId === 'tvvip' 
                      ? 'border-[#006191] ring-2 ring-[#006191]/40 shadow-xl bg-sky-50/10' 
                      : 'border-slate-100 shadow-sm hover:shadow-lg bg-white'
                  }`}>
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">Home TV VIP</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Trải nghiệm cao cấp & An ninh toàn diện</p>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                          VIP PREMIUM
                        </span>
                      </div>
                      
                      <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-extrabold text-[#006191] font-mono">299.000</span>
                        <span className="text-xs font-semibold text-slate-500 ml-1.5">đ/tháng</span>
                      </div>

                      <ul className="space-y-4 text-xs text-slate-600 mb-10">
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span>Tốc độ: <strong className="font-bold text-slate-800">300 Mbps</strong> cực khủng</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span>Kèm thêm <strong className="font-bold text-slate-800">02 Thiết bị Mesh WiFi</strong> phủ sóng biệt thự</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span>Tặng <strong className="font-bold text-slate-800">01 Smart Camera AI Outdoor</strong> ngoài trời miễn phí</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span>Tài khoản MyTV VIP đặc quyền phim Galaxy Play</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span>Cam kết xử lý kỹ thuật ưu tiên tối đa trong 2 giờ</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan('tvvip')}
                      className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedPlanId === 'tvvip'
                          ? 'bg-[#006191] text-white shadow-lg shadow-sky-100'
                          : 'bg-slate-50 text-slate-700 hover:bg-[#006191] hover:text-white border border-slate-200'
                      }`}
                    >
                      {selectedPlanId === 'tvvip' ? 'Đã Chọn Gói Này' : 'Chọn Gói Này'}
                    </button>
                  </div>

                </div>
              </div>
            </section>

            {/* Feature Comparison Matrix */}
            <section className="py-20 px-6 bg-slate-100/50">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">So Sánh Gói Cước Chi Tiết</h3>
                  <p className="text-xs text-slate-500">Giúp Anh/Chị đưa ra lựa chọn tối ưu, minh bạch và phù hợp kinh tế nhất.</p>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-slate-200/60 bg-white shadow-sm">
                  <table className="w-full text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200/60 font-bold text-slate-800">
                      <tr>
                        <th className="p-4 text-left">Tính năng dịch vụ</th>
                        <th className="p-4 text-center">Home 1</th>
                        <th className="p-4 text-center text-orange-500">Home Mesh 2</th>
                        <th className="p-4 text-center">Home TV VIP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-4 font-semibold">Tốc độ Internet</td>
                        <td className="p-4 text-center font-mono">100 Mbps</td>
                        <td className="p-4 text-center font-mono text-orange-500 font-semibold">150 Mbps</td>
                        <td className="p-4 text-center font-mono">300 Mbps</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold">Thiết bị Mesh WiFi kích sóng</td>
                        <td className="p-4 text-center text-slate-300">—</td>
                        <td className="p-4 text-center font-semibold">01 Thiết bị</td>
                        <td className="p-4 text-center font-semibold">02 Thiết bị</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold">Truyền hình MyTV đặc sắc</td>
                        <td className="p-4 text-center text-slate-300">—</td>
                        <td className="p-4 text-center text-slate-600">Ứng dụng App</td>
                        <td className="p-4 text-center text-[#006191] font-semibold">App VIP + Galaxy</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold">Smart Camera AI giám sát</td>
                        <td className="p-4 text-center text-slate-300">—</td>
                        <td className="p-4 text-center text-slate-400">Mua thêm</td>
                        <td className="p-4 text-center text-emerald-600 font-semibold">Đã có (01 ngoài trời)</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold">Khảo sát & Lắp đặt 24h</td>
                        <td className="p-4 text-center text-slate-600">Đã bao gồm</td>
                        <td className="p-4 text-center text-slate-600">Đã bao gồm</td>
                        <td className="p-4 text-center text-emerald-600 font-semibold">Xử lý ưu tiên tối đa</td>
                      </tr>
                      <tr className="bg-[#006191]/5 font-bold text-slate-800 border-t-2 border-slate-200">
                        <td className="p-4">Giá cước (VND/tháng)</td>
                        <td className="p-4 text-center font-mono text-[#006191]">165.000</td>
                        <td className="p-4 text-center font-mono text-orange-500 text-base">210.000</td>
                        <td className="p-4 text-center font-mono text-[#006191]">299.000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* High Conversion Banner Promo */}
            <section className="py-12 px-6">
              <div className="max-w-7xl mx-auto bg-gradient-to-r from-[#006191] to-[#0b5eaf] rounded-[40px] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
                  <svg className="h-full w-full fill-white" viewBox="0 0 100 100">
                    <circle cx="80" cy="20" r="40" />
                    <circle cx="100" cy="80" r="30" />
                  </svg>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      Khuyến Mãi Lắp Đặt Vàng!
                    </h2>
                    <p className="text-sky-100 text-sm max-w-xl leading-relaxed">
                      Đăng ký ngay trong hôm nay để nhận ưu đãi tuyệt vời: Miễn phí hòa mạng 100%, trang bị modem WiFi đời mới và tặng thêm tới 02 tháng cước sử dụng hoàn toàn miễn phí khi đóng trước cước.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-1">
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3.5 py-1.5 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-orange-300" /> Miễn phí thi công
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3.5 py-1.5 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-orange-300" /> Tặng thêm tháng cước
                      </span>
                    </div>
                  </div>
                  <a 
                    href="#register-form-section" 
                    className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-lg px-8 py-4.5 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform text-center shrink-0 cursor-pointer"
                  >
                    NHẬN ƯU ĐÃI NGAY
                  </a>
                </div>
              </div>
            </section>

            {/* Timeline Process Section */}
            <section id="quy-trinh" className="py-20 px-6 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
                  <span className="text-[10px] font-bold text-[#006191] tracking-wider uppercase bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                    Quy trình thi công
                  </span>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Quy Trình Lắp Đặt Siêu Tốc</h2>
                  <p className="text-sm text-slate-500">
                    Chuyên nghiệp - Nhanh gọn - Tận tâm. Đảm bảo sóng mạnh, gọn đẹp thẩm mỹ cho ngôi nhà bạn.
                  </p>
                </div>

                <div className="relative">
                  {/* Timeline vector line connecting cards */}
                  <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 z-0"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
                    
                    {/* Step 1 */}
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-[#006191] text-white rounded-full flex items-center justify-center mx-auto shadow-lg relative">
                        <Sparkles className="w-6 h-6" />
                        <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">Đăng ký dịch vụ</h4>
                      <p className="text-xs text-slate-500 leading-relaxed px-4">
                        Khách hàng điền form đăng ký trực tuyến hoặc gọi hotline 18001166 hỗ trợ miễn phí.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-white text-[#006191] border-2 border-[#006191] rounded-full flex items-center justify-center mx-auto shadow-md relative">
                        <Headphones className="w-6 h-6" />
                        <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">Liên hệ tư vấn</h4>
                      <p className="text-xs text-slate-500 leading-relaxed px-4">
                        Chuyên viên CSKH gọi điện xác nhận cước và chốt lịch thi công khảo sát thực địa.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-white text-[#006191] border-2 border-[#006191] rounded-full flex items-center justify-center mx-auto shadow-md relative">
                        <MapPin className="w-6 h-6" />
                        <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">Khảo sát hạ tầng</h4>
                      <p className="text-xs text-slate-500 leading-relaxed px-4">
                        Kỹ thuật viên địa bàn Bình Mỹ di chuyển khảo sát hộp cáp trong 60 phút tiện lợi.
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-white text-[#006191] border-2 border-[#006191] rounded-full flex items-center justify-center mx-auto shadow-md relative">
                        <Router className="w-6 h-6" />
                        <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">Kéo cáp lắp đặt</h4>
                      <p className="text-xs text-slate-500 leading-relaxed px-4">
                        Tiến hành kéo đường cáp quang, đấu nối modem, cài đặt hệ thống kích sóng Mesh và Camera.
                      </p>
                    </div>

                    {/* Step 5 */}
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-[#006191] text-white rounded-full flex items-center justify-center mx-auto shadow-lg relative">
                        <Award className="w-6 h-6" />
                        <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">Bàn giao nghiệm thu</h4>
                      <p className="text-xs text-slate-500 leading-relaxed px-4">
                        Kỹ thuật test đạt tốc độ cam kết, hướng dẫn khách sử dụng và ghi phiếu bảo hành vàng.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </section>

            {/* Registration Form & Success State Section */}
            <section id="register-form-section" className="py-20 px-6 bg-slate-50 border-t border-slate-100">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                  
                  {/* Left explanation column */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-orange-500 tracking-wider uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                        Đăng ký nhanh
                      </span>
                      <h3 className="text-2xl font-black text-slate-800 leading-snug">Đăng Ký Tư Vấn Miễn Phí Tại Bình Mỹ</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Hãy điền thông tin liên hệ của Anh/Chị. Kỹ thuật viên của chúng tôi sẽ gọi lại xác nhận và sắp xếp khảo sát tận nhà trong vòng 30 phút!
                      </p>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 bg-white p-4.5 rounded-2xl border border-slate-100">
                      <div className="flex gap-2.5 items-start">
                        <CheckCircle2 className="w-4 h-4 text-[#006191] shrink-0 mt-0.5" />
                        <span>Kỹ thuật khảo sát thực tế và kéo cáp cực nhanh kể cả ngoài giờ hành chính, thứ bảy, chủ nhật.</span>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <CheckCircle2 className="w-4 h-4 text-[#006191] shrink-0 mt-0.5" />
                        <span>Sóng mạnh phủ rộng, đường cáp chắc chắn chống đứt do thời tiết giông bão.</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Form Card / Success Card */}
                  <div className="md:col-span-3 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
                    <AnimatePresence mode="wait">
                      {submitSuccess ? (
                        /* Success state Card */
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="text-center py-6 space-y-5"
                        >
                          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-lg">
                            <Check className="w-8 h-8" />
                          </div>
                          
                          <div className="space-y-1.5">
                            <h4 className="text-xl font-bold text-slate-800">Đăng Ký Lắp Đặt Thành Công!</h4>
                            <p className="text-xs text-slate-500 px-4">
                              Hệ thống đã tiếp nhận yêu cầu của Anh/Chị. VNPT Bình Mỹ sẽ liên hệ theo SĐT của Anh/Chị trong 30 phút tới.
                            </p>
                          </div>

                          {/* Order Details card */}
                          <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 text-left space-y-2.5 max-w-sm mx-auto text-xs">
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                              <span className="text-slate-400 font-medium">Mã đơn đặt hàng:</span>
                              <span className="font-mono font-bold text-[#006191]">{submitSuccess.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">Họ tên:</span>
                              <span className="font-bold text-slate-700">{submitSuccess.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">Số điện thoại:</span>
                              <span className="font-bold text-slate-700 font-mono">{submitSuccess.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">Địa chỉ thi công:</span>
                              <span className="font-bold text-slate-700 truncate max-w-[180px]">{submitSuccess.address}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">Gói đã đăng ký:</span>
                              <span className="font-bold text-orange-500">{getPlanName(submitSuccess.planId)}</span>
                            </div>
                            {submitSuccess.extraMesh > 0 && (
                              <div className="flex justify-between text-[11px] text-[#006191]">
                                <span>+ Thiết bị Mesh WiFi phụ:</span>
                                <span>{submitSuccess.extraMesh} thiết bị</span>
                              </div>
                            )}
                            {submitSuccess.extraCamera && (
                              <div className="flex justify-between text-[11px] text-emerald-600">
                                <span>+ Smart Camera AI:</span>
                                <span>Có lắp đặt</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">Lịch khảo sát:</span>
                              <span className="font-bold text-slate-700 font-mono">{submitSuccess.preferredDate}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setSubmitSuccess(null)}
                            className="bg-[#006191] hover:bg-[#0b5eaf] text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Đăng ký đơn mới
                          </button>
                        </motion.div>
                      ) : (
                        /* Standard Input Form */
                        <motion.form
                          key="form"
                          onSubmit={handleFormSubmit}
                          className="space-y-4"
                        >
                          <h4 className="text-base font-bold text-[#006191] flex items-center gap-1.5 border-b border-slate-50 pb-3">
                            <Sliders className="w-5 h-5 text-[#006191]" /> Phiếu Đăng Ký Trực Tuyến
                          </h4>

                          {errorMessage && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-xl border border-red-200 text-xs font-semibold">
                              {errorMessage}
                            </div>
                          )}

                          {/* Client Name */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                              Họ tên khách hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Nhập họ tên của Anh/Chị..."
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#006191] focus:bg-white focus:ring-1 focus:ring-[#006191] outline-none text-sm transition-colors"
                            />
                          </div>

                          {/* Phone */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                              Số điện thoại di động <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="Nhập số điện thoại di động liên hệ..."
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#006191] focus:bg-white focus:ring-1 focus:ring-[#006191] outline-none text-sm transition-colors font-mono"
                            />
                          </div>

                          {/* Address */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                              Địa chỉ lắp đặt (Bình Mỹ, Củ Chi) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              placeholder="VD: 124 Ấp 4A, Đường Võ Văn Bích, Bình Mỹ..."
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#006191] focus:bg-white focus:ring-1 focus:ring-[#006191] outline-none text-sm transition-colors"
                            />
                          </div>

                          {/* Active Chosen package summary inside form */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Gói cước đang chọn:</span>
                              <span className="font-bold text-[#006191]">
                                {getPlanName(selectedPlanId)} ({selectedPlanId === 'home1' ? '100 Mbps' : selectedPlanId === 'mesh2' ? '150 Mbps' : selectedPlanId === 'custom' ? `${customSpeed || 150} Mbps` : '300 Mbps'})
                              </span>
                            </div>
                            <a href="#goi-cuoc" className="text-xs font-bold text-orange-500 hover:underline">
                              Thay đổi gói
                            </a>
                          </div>

                          {/* Extra Options: Mesh Nodes & Camera checkboxes */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-1.5 text-xs">
                              <span className="font-bold text-slate-600">Thêm Mesh WiFi:</span>
                              <div className="flex gap-1.5">
                                {[0, 1, 2].map((m) => (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, extraMesh: m })}
                                    className={`flex-1 py-1 rounded-md text-xs font-semibold border ${
                                      formData.extraMesh === m
                                        ? 'bg-[#006191] text-white border-[#006191]'
                                        : 'bg-white text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {m === 0 ? 'K dùng' : `${m}`}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, extraCamera: !formData.extraCamera })}
                              className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 text-xs transition-colors ${
                                formData.extraCamera 
                                  ? 'bg-[#006191]/5 border-[#006191]/20' 
                                  : 'border-slate-100 bg-slate-50/50'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-600 block">Lắp Camera AI:</span>
                                <span className="text-[10px] text-slate-400">Giám sát ngoài trời</span>
                              </div>
                              {formData.extraCamera ? (
                                <CheckSquare className="w-5 h-5 text-[#006191] fill-sky-100 shrink-0" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-300 shrink-0" />
                              )}
                            </button>
                          </div>

                          {/* Preferred Date & Notes */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-600">Lịch khảo sát mong muốn</label>
                              <input
                                type="date"
                                value={formData.preferredDate}
                                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#006191] focus:ring-1 focus:ring-[#006191] outline-none text-sm transition-colors font-mono"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-600">Ghi chú yêu cầu thêm</label>
                              <input
                                type="text"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="VD: Gọi trước khi qua khảo sát..."
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#006191] focus:ring-1 focus:ring-[#006191] outline-none text-sm transition-colors"
                              />
                            </div>
                          </div>

                          {/* Submit button */}
                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                          >
                            {submitting ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" /> Đang ghi nhận đăng ký...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4.5 h-4.5" /> GỬI YÊU CẦU LẮP ĐẶT
                              </>
                            )}
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </div>
            </section>

            {/* Accordion FAQ Section */}
            <section id="faq" className="py-20 px-6 bg-white">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16 space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">Câu Hỏi Thường Gặp (FAQ)</h3>
                  <p className="text-xs text-slate-500">Giải đáp nhanh các thắc mắc phổ biến về dịch vụ, hạ tầng mạng của VNPT.</p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      q: 'Quy trình khảo sát và thi công lắp đặt tại Bình Mỹ mất bao lâu?',
                      a: 'Sau khi Anh/Chị điền form đăng ký, nhân viên tổng đài sẽ gọi lại xác nhận trong 30 phút. Đội ngũ kỹ thuật viên địa bàn Bình Mỹ sẽ tiến hành khảo sát hộp cáp quang trong 60 phút và hoàn thiện đấu nối, kéo cáp lắp ráp chỉ trong vòng tối đa 24 giờ.'
                    },
                    {
                      q: 'Khách hàng đăng ký mới có được miễn phí lắp đặt hoàn toàn không?',
                      a: 'Dạ có ạ! Hiện tại VNPT Bình Mỹ áp dụng ưu đãi MIỄN PHÍ LẮP ĐẶT 100% kèm trang bị modem WiFi đời mới, bộ định tuyến kích sóng Mesh WiFi và Camera AI miễn phí khi khách hàng đóng trước cước từ 6 tháng. Đồng thời khách hàng đóng trước 6 tháng được tặng thêm 1 tháng, đóng trước 12 tháng được tặng thêm 2 tháng cước miễn phí sử dụng.'
                    },
                    {
                      q: 'Bộ định tuyến WiFi Mesh đi kèm có tác dụng gì và nhà tôi có cần lắp không?',
                      a: 'WiFi Mesh là hệ thống các điểm truy cập sóng thông minh kết nối không dây với nhau, tạo ra một mạng WiFi đồng nhất phủ khắp. Mesh WiFi vô cùng thích hợp cho nhà nhiều lầu, chung cư rộng hoặc văn phòng biệt thự giúp tăng khả năng đâm xuyên tường mạnh mẽ, tự động chuyển vùng thiết bị không lo mất sóng khi di chuyển.'
                    },
                    {
                      q: 'Đăng ký MyTV VIP có thể đăng nhập xem trên bao nhiêu thiết bị?',
                      a: 'Ứng dụng MyTV của VNPT hỗ trợ đăng nhập sử dụng trên hầu hết các dòng Smart TV, Smartphone, Máy tính bảng hoặc đầu thu Android Box. Một tài khoản MyTV VIP có thể thiết lập xem đồng thời trên nhiều thiết bị cực kỳ tiện lợi cho cả gia đình giải trí.'
                    }
                  ].map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div 
                        key={index}
                        className="border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          className="w-full text-left p-5 flex items-center justify-between font-bold text-sm text-slate-800 cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              <div className="p-5 pt-0 text-xs text-slate-500 leading-relaxed border-t border-slate-100/50">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}

      </div>

      {/* Floating AI chat widget */}
      <AIAdvisor />

      {/* Footer legalities */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <span className="font-extrabold text-lg uppercase tracking-wider text-white">VNPT Bình Mỹ</span>
            <p className="text-xs text-slate-400 italic">"Kết nối giá trị - Khơi dậy tiềm năng số."</p>
            <p className="text-xs">
              Văn phòng đại diện khu vực Bình Mỹ, Củ Chi, TP. Hồ Chí Minh.<br/>
              Hotline hỗ trợ kỹ thuật: 1800 1166 (miễn phí cước cuộc gọi).
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm mb-4">Nhóm dịch vụ</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#goi-cuoc" className="hover:text-white transition-colors">Internet Cáp Quang FTTH</a></li>
              <li><a href="#goi-cuoc" className="hover:text-white transition-colors">Truyền hình MyTV 4K</a></li>
              <li><a href="#goi-cuoc" className="hover:text-white transition-colors">Smart Camera AI</a></li>
              <li><a href="#goi-cuoc" className="hover:text-white transition-colors">Hệ thống WiFi Mesh</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm mb-4">Chính sách chung</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#faq" className="hover:text-white transition-colors">Hỏi đáp lắp đặt</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo trì thiết bị</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản hợp đồng mẫu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật thông tin</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm mb-4">Đơn vị chủ quản</h5>
            <p className="text-xs leading-relaxed">
              Tập đoàn Bưu chính Viễn thông Việt Nam (VNPT).<br/>
              Bản quyền thuộc về VNPT Bình Mỹ © 2026. Bảo lưu mọi quyền pháp lý.
            </p>
            <div className="flex gap-4 pt-4">
              <span className="text-[10px] uppercase font-bold text-[#006191] bg-white/5 py-1 px-3 rounded-full border border-white/5">
                ISO 9001:2015
              </span>
              <span className="text-[10px] uppercase font-bold text-orange-500 bg-white/5 py-1 px-3 rounded-full border border-white/5">
                An toàn tuyệt đối
              </span>
            </div>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          <p>© 2026 VNPT Bình Mỹ. Thiết kế và phát triển với đầy đủ chức năng Full-stack.</p>
        </div>
      </footer>

    </div>
  );
}
