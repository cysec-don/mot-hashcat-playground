"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  X,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Send,
  Download,
  Award,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "@/lib/store";
import { toast } from "sonner";

interface ShareCardProps {
  open: boolean;
  onClose: () => void;
  moduleName?: string;
  xpEarned?: number;
  rankName?: string;
}

export function ShareCard({ open, onClose, moduleName, xpEarned, rankName }: ShareCardProps) {
  const { student } = useSession();
  const [downloading, setDownloading] = useState(false);

  const shareText = `I just completed${moduleName ? ` the ${moduleName} Module` : " a module"} in MOT Hashcat Playground and earned ${xpEarned || 500} XP.${rankName ? ` Current rank: ${rankName}.` : ""}\n\n#Hashcat #CyberSecurity #MOTHashcatPlayground`;
  const shareUrl = "https://github.com/cysec-don/mot-hashcat-playground";

  const shareLinks = [
    { name: "LinkedIn", icon: Linkedin, color: "#0077B5", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}` },
    { name: "Facebook", icon: Facebook, color: "#1877F2", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}` },
    { name: "X (Twitter)", icon: Twitter, color: "#000000", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { name: "Instagram", icon: Instagram, color: "#E4405F", url: `https://www.instagram.com/` },
    { name: "WhatsApp", icon: MessageCircle, color: "#25D366", url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}` },
    { name: "Telegram", icon: Send, color: "#0088CC", url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
  ];

  const handleShare = (platform: typeof shareLinks[0]) => {
    if (platform.name === "Instagram") {
      navigator.clipboard.writeText(shareText);
      toast.success("Share text copied! Paste it in Instagram.");
      return;
    }
    window.open(platform.url, "_blank", "width=600,height=400");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    toast.success("Share text copied to clipboard!");
  };

  const handleDownloadCard = () => {
    setDownloading(true);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) { toast.error("Failed to generate card"); setDownloading(false); return; }

    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, "#0B0F19");
    grad.addColorStop(1, "#111827");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 630); ctx.stroke(); }
    for (let y = 0; y < 630; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke(); }

    ctx.strokeStyle = "#00E5FF"; ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 1160, 590);

    ctx.fillStyle = "#00E5FF"; ctx.font = "bold 28px Arial";
    ctx.fillText("MOT Hashcat Playground", 60, 70);

    ctx.fillStyle = "#F5F7FA"; ctx.font = "bold 48px Georgia";
    ctx.fillText(student?.fullName || "Student", 60, 180);

    ctx.fillStyle = "#8B95A7"; ctx.font = "24px Arial";
    ctx.fillText("has completed:", 60, 230);

    ctx.fillStyle = "#00FF88"; ctx.font = "bold 36px Arial";
    ctx.fillText(moduleName || "Module", 60, 280);

    ctx.fillStyle = "#00E5FF"; ctx.font = "bold 56px Arial";
    ctx.fillText(`+${xpEarned || 500} XP`, 60, 380);

    if (rankName) { ctx.fillStyle = "#FFC857"; ctx.font = "28px Arial"; ctx.fillText(`Rank: ${rankName}`, 60, 430); }

    ctx.fillStyle = "#8B95A7"; ctx.font = "20px Arial";
    ctx.fillText("#Hashcat  #CyberSecurity  #MOTHashcatPlayground", 60, 560);

    ctx.beginPath(); ctx.arc(950, 300, 100, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 200, 87, 0.15)"; ctx.fill();
    ctx.strokeStyle = "#FFC857"; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = "#FFC857"; ctx.font = "bold 60px Arial";
    ctx.textAlign = "center"; ctx.fillText("\u2605", 950, 320); ctx.textAlign = "left";

    canvas.toBlob((blob) => {
      if (!blob) { toast.error("Failed to generate card"); setDownloading(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `mot-hashcat-achievement-${Date.now()}.png`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Share card downloaded!");
      setDownloading(false);
    }, "image/png");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="cyber-card p-6 relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
              <div className="text-center mb-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 mb-3">
                  <Trophy className="h-7 w-7 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Congratulations!</h2>
                <p className="text-sm text-slate-400 mt-1">
                  You have completed: <span className="text-cyan-300 font-semibold">{moduleName || "Module"}</span>
                </p>
                <div className="mt-2 flex items-center justify-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-cyan-300"><Zap className="h-3 w-3" /> +{xpEarned || 500} XP</span>
                  {rankName && <span className="flex items-center gap-1 text-amber-300"><Award className="h-3 w-3" /> {rankName}</span>}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-3 text-center">Share your achievement:</p>
                <div className="grid grid-cols-3 gap-3">
                  {shareLinks.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <button key={platform.name} onClick={() => handleShare(platform)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-white/10 hover:border-cyan-400/30 hover:bg-white/5 transition group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full transition group-hover:scale-110"
                          style={{ background: `${platform.color}20`, border: `1px solid ${platform.color}40` }}>
                          <Icon className="h-5 w-5" style={{ color: platform.color }} />
                        </div>
                        <span className="text-[10px] text-slate-400">{platform.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Button onClick={handleDownloadCard} disabled={downloading}
                  className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-bold">
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? "Generating..." : "Download Share Card"}
                </Button>
                <Button onClick={handleCopyText} variant="outline"
                  className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">
                  <Share2 className="h-4 w-4 mr-2" /> Copy Share Text
                </Button>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-[#0B0F19] border border-cyan-500/15">
                <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line">{shareText}</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
