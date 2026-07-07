/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { Registration } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// In-memory data store for registrations (with some mock data to make the admin view instantly interesting)
let registrations: Registration[] = [
  {
    id: 'REG-9821',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '122 Đường Tỉnh Lộ 8, Bình Mỹ, Củ Chi',
    planId: 'mesh2',
    extraMesh: 0,
    extraCamera: false,
    preferredDate: '2026-07-10',
    notes: 'Vui lòng gọi trước khi qua khảo sát. Nhà 2 lầu.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'REG-4731',
    name: 'Trần Thị B',
    phone: '0987654321',
    address: '45 Đường Võ Văn Bích, Bình Mỹ, Củ Chi',
    planId: 'tvvip',
    extraMesh: 1,
    extraCamera: true,
    preferredDate: '2026-07-09',
    notes: 'Cần lắp đặt gấp trong ngày mai.',
    status: 'surveyed',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'REG-1205',
    name: 'Lê Hoàng Nam',
    phone: '0912345678',
    address: 'Ấp 4, Xã Bình Mỹ, Củ Chi',
    planId: 'home1',
    extraMesh: 0,
    extraCamera: false,
    preferredDate: '2026-07-05',
    notes: 'Lắp gói cơ bản cho ông bà xem tivi.',
    status: 'installed',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    console.warn('GEMINI_API_KEY is not configured or has placeholder value. Running in fallback simulation mode.');
    return null;
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes

// 1. Register a new customer installation request
app.post('/api/register', (req, res) => {
  const { name, phone, address, planId, extraMesh, extraCamera, preferredDate, notes } = req.body;
  
  if (!name || !phone || !address || !planId) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc (Tên, SĐT, Địa chỉ, Gói cước)' });
  }

  const newReg: Registration = {
    id: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    phone,
    address,
    planId,
    extraMesh: Number(extraMesh) || 0,
    extraCamera: !!extraCamera,
    preferredDate: preferredDate || new Date().toISOString().split('T')[0],
    notes: notes || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  registrations.unshift(newReg);
  res.status(201).json({ success: true, registration: newReg });
});

// 2. Get all registrations (For Admin/Staff View)
app.get('/api/registrations', (req, res) => {
  res.json(registrations);
});

// 3. Update registration status
app.put('/api/registrations/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'surveyed', 'installed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  }

  const regIndex = registrations.findIndex(r => r.id === id);
  if (regIndex === -1) {
    return res.status(404).json({ error: 'Không tìm thấy đơn đăng ký' });
  }

  registrations[regIndex].status = status;
  res.json({ success: true, registration: registrations[regIndex] });
});

// 4. Delete a registration
app.delete('/api/registrations/:id', (req, res) => {
  const { id } = req.params;
  const regIndex = registrations.findIndex(r => r.id === id);
  if (regIndex === -1) {
    return res.status(404).json({ error: 'Không tìm thấy đơn đăng ký' });
  }
  
  registrations.splice(regIndex, 1);
  res.json({ success: true });
});

// 5. VNPT AI Advisor chatbot calling Gemini API
app.post('/api/chatbot', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Yêu cầu không đúng định dạng. Cần mảng messages.' });
  }

  // System instructions explaining our plans, speeds, prices, and location (Bình Mỹ, Củ Chi)
  const systemInstruction = `
Bạn là Trợ lý ảo AI VNPT Bình Mỹ (Củ Chi, TP. Hồ Chí Minh). Nhiệm vụ của bạn là tư vấn cho khách hàng về các dịch vụ lắp đặt mạng cáp quang, truyền hình MyTV và camera an ninh thông minh một cách chuyên nghiệp, tận tâm, vui vẻ và thuyết phục.

Hãy dựa trên thông tin gói cước chính thức sau của VNPT Bình Mỹ:
1. Gói "Home 1":
   - Tốc độ: 100 Mbps
   - Giá: 165.000đ/tháng
   - Thiết bị: Trang bị modem WiFi 5 tiêu chuẩn.
   - Thích hợp: Cá nhân, gia đình nhỏ nhu cầu cơ bản (lướt web, xem tivi, học tập nhẹ nhàng). Không kèm truyền hình MyTV.

2. Gói "Home Mesh 2" (Bán chạy nhất / Phổ biến nhất):
   - Tốc độ: 150 Mbps
   - Giá: 210.000đ/tháng
   - Thiết bị: Modem WiFi chính + Tặng kèm thêm 01 Thiết bị WiFi Mesh (giúp kích sóng, phủ sóng xuyên tường, xóa vùng chết WiFi).
   - Truyền hình: Miễn phí ứng dụng MyTV với hơn 200 kênh đặc sắc (SD/HD/4K).
   - Thích hợp: Nhà nhiều tầng, căn hộ rộng, gia đình 4-6 người, có nhu cầu xem tivi và chơi game ổn định.

3. Gói "Home TV VIP":
   - Tốc độ: 300 Mbps
   - Giá: 299.000đ/tháng
   - Thiết bị: Modem WiFi chính + Tặng kèm thêm 02 Thiết bị WiFi Mesh (phủ sóng siêu rộng cho biệt thự hoặc nhà vườn).
   - Truyền hình: App MyTV VIP (nhiều đặc quyền) + Gói phim Galaxy Play.
   - Camera: Tặng kèm 01 Smart Camera AI Outdoor chống nước và nhận diện thông minh miễn phí!
   - Thích hợp: Hộ kinh doanh, quán cà phê, nhà vườn, biệt thự, gia đình đông người, livestream hoặc cần hệ thống giám sát an ninh cao cấp.

Chương trình khuyến mãi hiện hành tại Bình Mỹ:
- MIỄN PHÍ LẮP ĐẶT 100% khi khách hàng đóng trước cước từ 6 tháng.
- Đóng trước 6 tháng: Tặng thêm 1 tháng (tổng dùng 7 tháng).
- Đóng trước 12 tháng: Tặng thêm 2 tháng (tổng dùng 14 tháng).
- Thời gian khảo sát: Trong vòng 60 phút.
- Thời gian thi công lắp đặt hoàn thiện: Trong vòng 24 giờ kể từ khi đăng ký.
- Hotline hỗ trợ: 18001166 (miễn phí).

Quy tắc trả lời:
- Luôn chào khách hàng lịch sự và xưng hô thân thiện (ví dụ: "VNPT Bình Mỹ xin chào Anh/Chị ạ!", "Dạ, em có thể giúp gì cho Anh/Chị?").
- Hãy viết ngắn gọn, rõ ràng, chia dòng hoặc dùng gạch đầu dòng để khách hàng dễ đọc, không viết quá dài dòng.
- Tập trung vào việc tư vấn và khuyên khách hàng nên chọn gói Mesh 2 nếu họ có nhà lầu, hoặc TV VIP nếu họ cần camera và mạng siêu mạnh.
- Nếu khách hàng muốn đăng ký, hãy hướng dẫn họ điền thông tin vào form Đăng ký trên trang web hoặc cung cấp Số điện thoại để nhân viên gọi lại hỗ trợ.
- Trả lời bằng tiếng Việt lịch sự, trẻ trung, chuyên nghiệp.
`;

  const ai = getGeminiClient();

  if (!ai) {
    // Falling back to a smart, simulated local response if API Key is not set up
    const userQuery = messages[messages.length - 1]?.parts?.[0]?.text || '';
    let responseText = 'Dạ, VNPT Bình Mỹ xin chào anh/chị ạ! ';
    
    const queryLower = userQuery.toLowerCase();
    if (queryLower.includes('giá') || queryLower.includes('gói') || queryLower.includes('cuoc') || queryLower.includes('cước')) {
      responseText += `Hiện tại VNPT Bình Mỹ đang có 3 gói cước cực kỳ ưu đãi:
- **Home 1 (100 Mbps)**: Chỉ **165.000đ/tháng** (Modem WiFi 5).
- **Home Mesh 2 (150 Mbps)**: Chỉ **210.000đ/tháng** (Kèm 1 Mesh WiFi + Free MyTV 200 kênh). [Bán chạy nhất]
- **Home TV VIP (300 Mbps)**: Chỉ **299.000đ/tháng** (Kèm 2 Mesh WiFi + App MyTV VIP + Tặng 1 Camera AI Outdoor miễn phí).

Anh/chị đóng trước 6 tháng sẽ được miễn 100% phí lắp đặt và tặng thêm 1 tháng cước sử dụng ạ!`;
    } else if (queryLower.includes('lắp') || queryLower.includes('đăng ký') || queryLower.includes('lien he') || queryLower.includes('liên hệ')) {
      responseText += `Dạ để đăng ký lắp đặt nhanh trong 24h tại Bình Mỹ, anh/chị có thể điền thông tin vào **Biểu mẫu Đăng ký** màu cam ở góc bên phải trang web, hoặc để lại Số điện thoại tại đây để em nhờ nhân viên kỹ thuật gọi tư vấn khảo sát ngay cho anh/chị nhé ạ! Hotline của bên em là **18001166** (miễn phí).`;
    } else if (queryLower.includes('mesh') || queryLower.includes('sóng') || queryLower.includes('nhà lầu') || queryLower.includes('lầu')) {
      responseText += `Dạ với nhà lầu hoặc không gian rộng, anh/chị rất nên lắp gói **Home Mesh 2 (210.000đ/tháng)** hoặc **Home TV VIP (299.000đ/tháng)** ạ. Các gói này được trang bị thêm thiết bị kích sóng Mesh WiFi thông minh giúp sóng WiFi xuyên tường mạnh mẽ, phủ kín mọi ngóc ngách, không bị chập chờn khi di chuyển giữa các tầng đâu ạ!`;
    } else if (queryLower.includes('camera')) {
      responseText += `Dạ gói **Home TV VIP (299.000đ/tháng - 300 Mbps)** đang có chương trình tặng kèm **01 Smart Camera AI Outdoor** miễn phí lắp đặt hoàn toàn ạ. Camera có chức năng nhận diện chuyển động thông minh, lưu trữ đám mây bảo mật và chống nước siêu bền bỉ. Anh/chị có muốn đăng ký gói này không ạ?`;
    } else {
      responseText += `Dạ, em có thể tư vấn chi tiết cho anh/chị về gói cước cáp quang tốc độ cao (XGS-PON lên tới 10Gbps), truyền hình MyTV 4K hay Smart Camera AI của VNPT tại khu vực Bình Mỹ, Củ Chi không ạ? Anh/chị có thể hỏi em bất cứ thắc mắc nào nhé ạ! *(Lưu ý: Hệ thống đang chạy ở chế độ mô phỏng vì chưa cấu hình khóa API trong Settings > Secrets)*`;
    }

    return res.json({ text: responseText });
  }

  try {
    // Formatting conversation history properly for Gemini API SDK
    // @google/genai contents structure requires { role: 'user' | 'model', parts: [{ text: string }] }
    const formattedContents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: m.parts || [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error generating content from Gemini API:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi kết nối với máy chủ AI. Vui lòng thử lại sau.' });
  }
});


// Static files & Vite configuration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
