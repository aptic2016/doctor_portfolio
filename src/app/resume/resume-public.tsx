"use client"

import { Download, FileText } from "lucide-react"
import { PhysicianResumeView } from "@/components/resume/physician-resume-view"

interface CvIdentity {
  firstName: string; lastName: string; postNominals: string; professionalTitle: string;
  specialty: string; email: string; phone: string; city: string; region: string;
  country: string; website: string; linkedin: string; profileImage: string | null;
  photoUrl: string | null; photoShape: string; showPhotoOnPublic: boolean;
  photoDisplayMode?: string;
}

interface CvItem {
  id: string; source: "website" | "override" | "cv_only";
  data: Record<string, unknown>; override?: Record<string, unknown>;
}

interface CvSectionData {
  sectionKey: string; isVisible: boolean; sourceMode: string; sortOrder: number;
  sortMode: string; publicEnabled: boolean; pdfEnabled: boolean; docxEnabled: boolean;
  customTitle: string | null; items: CvItem[];
}

interface CvData {
  settings: { pdfDownloadEnabled: boolean; wordDownloadEnabled: boolean; activePreset: string };
  identity: CvIdentity;
  sections: CvSectionData[];
  socialLinks: Array<{ platform: string; url: string }>;
  preset: string;
}

export function ResumePublic({ data }: { data: CvData }) {
  const hasDownloads = data.settings.pdfDownloadEnabled || data.settings.wordDownloadEnabled

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Print CSS: hide controls, show white paper */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .cv-paper, .cv-paper * { visibility: visible !important; }
          .cv-paper { position: absolute; left: 0; top: 0; width: 100%; background: white !important; box-shadow: none !important; border: none !important; }
          .cv-page-controls { display: none !important; }
          .print\\:hidden { display: none !important; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>

      {/* Page Controls — ABOVE CV, hidden in print */}
      {hasDownloads && (
        <div className="cv-page-controls max-w-[700px] mx-auto px-6 sm:px-10 pt-4 pb-2 flex items-center justify-between print:hidden">
          <div className="text-xs text-gray-500">Curriculum Vitae</div>
          <div className="flex items-center gap-2">
            {data.settings.pdfDownloadEnabled && (
              <a href="/api/cv/download/pdf" target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors text-black">
                <FileText className="h-3.5 w-3.5" />PDF
              </a>
            )}
            {data.settings.wordDownloadEnabled && (
              <a href="/api/cv/download/docx" target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors text-black">
                <Download className="h-3.5 w-3.5" />Word
              </a>
            )}
          </div>
        </div>
      )}

      {/* CV Document — White Paper */}
      <div className="pb-8">
        <div className="max-w-[700px] mx-auto bg-white border border-gray-200 shadow-sm print:border-0 print:shadow-none print:bg-white">
          <PhysicianResumeView data={data} mode="public" />
        </div>
      </div>
    </div>
  )
}
