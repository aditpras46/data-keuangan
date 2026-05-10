import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Utensils, Sparkles, ChefHat, RefreshCw } from 'lucide-react';
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

interface MenuItem {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  estimatedCost: string;
}

export default function HistoryPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const generateMenu = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Buatkan tabel menu makanan harian (Sarapan, Makan Siang, Makan Malam) hemat untuk 7 hari ke depan di Indonesia.",
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: "Anda adalah Chef AI yang ahli menyusun menu hemat di bawah 50rb/hari. Berikan respon HANYA dalam format JSON array of objects dengan keys: day, breakfast, lunch, dinner, estimatedCost. Jangan berikan teks penjelasan lain.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                breakfast: { type: Type.STRING },
                lunch: { type: Type.STRING },
                dinner: { type: Type.STRING },
                estimatedCost: { type: Type.STRING }
              },
              required: ["day", "breakfast", "lunch", "dinner", "estimatedCost"]
            }
          }
        }
      });

      const text = response.text || "[]";
      // Clean text in case of glitchy output or thinking tokens leakage (rare but safe to handle)
      let cleanJson = text.trim();
      const firstBracket = cleanJson.indexOf('[');
      const lastBracket = cleanJson.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1) {
        cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
      }

      const data = JSON.parse(cleanJson);
      setMenu(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Menu Generation Error:', err);
      // Fallback data if AI fails
      setMenu([
        { day: 'Senin', breakfast: 'Bubur Ayam', lunch: 'Nasi Rames', dinner: 'Mie Goreng Tek-tek', estimatedCost: 'Rp 35.000' },
        { day: 'Selasa', breakfast: 'Nasi Uduk', lunch: 'Soto Ayam', dinner: 'Nasi Goreng', estimatedCost: 'Rp 40.000' },
        { day: 'Rabu', breakfast: 'Roti Bakar', lunch: 'Gado-gado', dinner: 'Sate Ayam', estimatedCost: 'Rp 45.000' },
        { day: 'Kamis', breakfast: 'Lontong Sayur', lunch: 'Ayam Penyet', dinner: 'Ketoprak', estimatedCost: 'Rp 38.000' },
        { day: 'Jumat', breakfast: 'Nasi Kuning', lunch: 'Nasi Padang (Hemat)', dinner: 'Bakso', estimatedCost: 'Rp 42.000' },
        { day: 'Sabtu', breakfast: 'Omelet Mie', lunch: 'Ikan Bakar', dinner: 'Martabak Telur', estimatedCost: 'Rp 48.000' },
        { day: 'Minggu', breakfast: 'Pancake', lunch: 'Rawon', dinner: 'Pecel Lele', estimatedCost: 'Rp 45.000' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateMenu();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-none h-10 w-10 border-4 border-primary border-r-transparent"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Meracik Menu AI...</p>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 bg-white min-h-screen pb-32">
      <div className="px-6 pt-10 pb-8 bg-[#0066A2] text-white rounded-none">
         <div className="flex justify-between items-start mb-6">
            <div>
               <h2 className="text-3xl font-black tracking-tighter italic">MENU AI</h2>
               <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em] mt-1">Saran Makan Hemat</p>
            </div>
            <button 
              onClick={generateMenu}
              className="w-10 h-10 bg-white/10 rounded-none flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <RefreshCw size={20} />
            </button>
         </div>

         <div className="bg-white/10 rounded-none p-4 backdrop-blur-md border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-white/20 flex items-center justify-center">
               <ChefHat size={24} />
            </div>
            <div className="flex-1">
               <p className="text-xs font-black italic">"Makan enak nggak harus mahal, yang penting porsinya pas!"</p>
               <p className="text-[9px] font-bold opacity-60 uppercase mt-1">- AI Chef Assistant</p>
            </div>
         </div>
      </div>

      <div className="px-6 mt-8 space-y-6">
        {menu.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * idx }}
            className="bg-slate-50 rounded-none p-6 border border-slate-100 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Utensils size={64} />
            </div>

            <div className="flex justify-between items-center mb-4 relative z-10">
               <span className="px-4 py-1 bg-primary text-white rounded-none text-[10px] font-black uppercase tracking-widest">{item.day}</span>
               <div className="flex items-center gap-1 text-emerald-500">
                  <Sparkles size={12} />
                  <span className="text-[10px] font-black uppercase">{item.estimatedCost}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-3 relative z-10">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-orange-100 flex items-center justify-center text-orange-600">
                     <span className="text-[10px] font-black">S</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">{item.breakfast}</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-blue-100 flex items-center justify-center text-blue-600">
                     <span className="text-[10px] font-black">M</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">{item.lunch}</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-purple-100 flex items-center justify-center text-purple-600">
                     <span className="text-[10px] font-black">M</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">{item.dinner}</p>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
