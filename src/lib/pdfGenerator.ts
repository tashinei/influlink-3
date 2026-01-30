import { jsPDF } from "jspdf";
import influlinkLogo from "@/assets/influLink4.png";

const BRAND = {
    primary: { r: 30, g: 136, b: 229 },    // #1E88E5
    medium: { r: 110, g: 197, b: 233 },    // #6EC5E9
    light: { r: 144, g: 213, b: 243 },     // #90d5f3
    dark: { r: 24, g: 24, b: 27 },         // #18181b
    gray: { r: 113, g: 113, b: 122 },      // #71717a
    lightGray: { r: 161, g: 161, b: 170 }, // #a1a1aa
    border: { r: 228, g: 228, b: 231 },    // #e4e4e7
    bgLight: { r: 248, g: 250, b: 252 },   // #f8fafc
    white: { r: 255, g: 255, b: 255 },
};

const A4 = { width: 595, height: 842, margin: 45 };

export interface CampaignData {
    name: string;
    brand: string;
    date: string;
    reach: string;
    engagement: string;
    earnings: number;
    description?: string;
    deliverables?: string[];
    trafficData?: Array<{ label: string; value: number }>;
}

/** HELPER: Image Loader with Aspect Ratio */
async function loadImage(url: string): Promise<{ data: string; w: number; h: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject();
            ctx.drawImage(img, 0, 0);
            resolve({ data: canvas.toDataURL("image/png"), w: img.width, h: img.height });
        };
        img.onerror = reject;
        img.src = url;
    });
}

/** HELPER: Set PDF Colors quickly */
const setC = (pdf: jsPDF, c: { r: number; g: number; b: number }, type: 'text' | 'fill' | 'draw' = 'text') => {
    if (type === 'text') pdf.setTextColor(c.r, c.g, c.b);
    if (type === 'fill') pdf.setFillColor(c.r, c.g, c.b);
    if (type === 'draw') pdf.setDrawColor(c.r, c.g, c.b);
};

const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    // Returns format: "Oct 24, 2023"
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export async function generateCampaignReportPDF(campaign: CampaignData): Promise<jsPDF> {
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const contentWidth = A4.width - A4.margin * 2;
    let y = A4.margin;

    // --- 1. HEADER & LOGO ---
    // --- 1. HEADER & LOGO ---
    let logoHeightOffset = 0; // To track how far down the logo goes
    try {
        const logo = await loadImage(influlinkLogo);
        const maxW = 90;
        const ratio = logo.w / logo.h;
        const finalW = maxW;
        const finalH = maxW / ratio;
        logoHeightOffset = finalH; // Store the height of the logo

        pdf.addImage(logo.data, "PNG", A4.width - A4.margin - finalW, y - 5, finalW, finalH);
    } catch {
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(16);
        setC(pdf, BRAND.primary); pdf.text("InfluLink", A4.width - A4.margin, y + 10, { align: 'right' });
        logoHeightOffset = 10;
    }

    setC(pdf, BRAND.primary);
    pdf.setFontSize(22); pdf.setFont("helvetica", "bold");
    pdf.text("Campaign Report", A4.margin, y + 15);

    // Sub-header details
    y += 45;
    setC(pdf, BRAND.dark); pdf.setFontSize(14);
    pdf.text(campaign.name, A4.margin, y);

    // BRAND NAME (Partner)
    setC(pdf, BRAND.gray); pdf.setFontSize(10); pdf.setFont("helvetica", "normal");
    pdf.text(`Partner: ${campaign.brand}`, A4.margin, y + 15);

    // DATE BADGE - Added +3pt vertical space here
    // We target y (which is the baseline for the campaign name) 
    // but you can also use 'y + logoHeightOffset + 3' if you want it pinned strictly to logo bottom.
    setC(pdf, BRAND.lightGray);
    pdf.text(`Issued: ${formatDate(new Date().toLocaleDateString())}`, A4.width - A4.margin, y + 3, { align: 'right' });

    // --- 2. STATS CARDS ---
    y += 40;
    const gap = 12;
    const cardW = (contentWidth - (gap * 2)) / 3;
    const cardH = 70;

    const stats = [
        { label: "TOTAL REACH", value: campaign.reach, color: BRAND.primary },
        { label: "ENGAGEMENT", value: campaign.engagement, color: BRAND.medium },
        { label: "EARNINGS", value: `$${campaign.earnings.toLocaleString()}`, color: BRAND.dark }
    ];

    stats.forEach((s, i) => {
        const x = A4.margin + (i * (cardW + gap));
        // Shadow/Background
        setC(pdf, BRAND.bgLight, 'fill');
        pdf.roundedRect(x, y, cardW, cardH, 8, 8, "F");
        // Label
        pdf.setFontSize(8); pdf.setFont("helvetica", "bold");
        setC(pdf, BRAND.gray);
        pdf.text(s.label, x + cardW / 2, y + 25, { align: "center" });
        // Value
        pdf.setFontSize(18);
        setC(pdf, s.color);
        pdf.text(s.value, x + cardW / 2, y + 50, { align: "center" });
    });

    // --- 3. DESCRIPTION SECTION ---
    y += cardH + 45;
    setC(pdf, BRAND.primary, 'fill');
    pdf.rect(A4.margin, y - 10, 2, 12, "F"); // Modern vertical accent

    setC(pdf, BRAND.dark); pdf.setFontSize(12); pdf.setFont("helvetica", "bold");
    pdf.text("Executive Summary", A4.margin + 8, y);

    y += 20;
    setC(pdf, BRAND.gray); pdf.setFontSize(10); pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(campaign.description || "No summary provided.", contentWidth);
    pdf.text(lines, A4.margin, y);
    y += (lines.length * 14) + 25;

    // --- 4. TRAFFIC CHART (Production Styled) ---
    setC(pdf, BRAND.dark); pdf.setFontSize(12); pdf.setFont("helvetica", "bold");
    pdf.text("Performance Insights", A4.margin, y);

    y += 20;
    const traffic = campaign.trafficData || [
        { label: "Engagement Rate", value: 75 },
        { label: "Click-Through", value: 45 },
        { label: "Retention", value: 90 }
    ];

    traffic.forEach((item) => {
        setC(pdf, BRAND.gray); pdf.setFontSize(9);
        pdf.text(item.label, A4.margin, y);
        pdf.text(`${item.value}%`, A4.width - A4.margin, y, { align: 'right' });

        y += 6;
        // Track
        setC(pdf, BRAND.border, 'fill');
        pdf.roundedRect(A4.margin, y, contentWidth, 5, 2.5, 2.5, "F");
        // Progress
        setC(pdf, BRAND.primary, 'fill');
        pdf.roundedRect(A4.margin, y, (contentWidth * (item.value / 100)), 5, 2.5, 2.5, "F");

        y += 20;
    });

    // --- 5. FOOTER ---
    const footerY = A4.height - 40;
    setC(pdf, BRAND.border, 'draw');
    pdf.setLineWidth(0.5);
    pdf.line(A4.margin, footerY - 10, A4.width - A4.margin, footerY - 10);

    setC(pdf, BRAND.lightGray); pdf.setFontSize(8);
    pdf.text("This report is generated by InfluLink Performance Analytics.", A4.margin, footerY);
    pdf.text("Page 1 of 1", A4.width - A4.margin, footerY, { align: 'right' });

    return pdf;
}

export async function downloadCampaignReportPDF(campaign: CampaignData): Promise<void> {
    try {
        const pdf = await generateCampaignReportPDF(campaign);
        const safeName = campaign.name.replace(/\s+/g, '_').toLowerCase();
        pdf.save(`influLink_${safeName}_report.pdf`);
    } catch (err) {
        console.error("PDF Export failed", err);
    }
}