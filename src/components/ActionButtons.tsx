import { Apple, Droplets, Bed, PlayCircle, BookOpen } from "lucide-react";

interface ActionButtonsProps {
  onAddItem: (item: string) => void;
  isLoading: boolean;
}

export default function ActionButtons({ onAddItem, isLoading }: ActionButtonsProps) {
  const items = [
    { id: "maçã", label: "Maçã", icon: <Apple size={16} />, color: "bg-[#e74c3c] hover:bg-[#c0392b] border-[#c0392b]" },
    { id: "água", label: "Água", icon: <Droplets size={16} />, color: "bg-[#3498db] hover:bg-[#2980b9] border-[#2980b9]" },
    { id: "cama", label: "Cama", icon: <Bed size={16} />, color: "bg-[#2c3e50] hover:bg-[#1a252f] border-[#1a252f]" },
    { id: "bola", label: "Bola", icon: <PlayCircle size={16} />, color: "bg-[#f1c40f] hover:bg-[#f39c12] border-[#f39c12]" },
    { id: "livro", label: "Livro", icon: <BookOpen size={16} />, color: "bg-[#9b59b6] hover:bg-[#8e44ad] border-[#8e44ad]" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-2">
      {items.map((item) => (
        <button
          key={item.id}
          disabled={isLoading}
          onClick={() => onAddItem(item.id)}
          className={`flex items-center gap-2 px-4 py-3 text-white border-b-4 rounded-md transition-all active:translate-y-1 active:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pixel shadow-lg ${item.color}`}
        >
          <span className="pixelated">{item.icon}</span>
          <span className="font-retro text-[10px] tracking-tighter uppercase">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
