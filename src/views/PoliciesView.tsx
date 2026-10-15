import React from 'react';
import { ShieldCheck, Download, RefreshCw, FileText, AlertCircle } from 'lucide-react';

export const PoliciesView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#70826E]">
          Trust & Terms
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2A26]">
          Store Policies & Licensing
        </h1>
        <p className="text-sm text-[#5C564E] leading-relaxed">
          Clear, honest, and straightforward policies for our digital goods.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Section 1: Instant Delivery Policy */}
        <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-6 sm:p-8 space-y-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EEF2ED] flex items-center justify-center text-[#70826E]">
              <Download className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#2D2A26]">
              1. Digital Delivery Policy
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-[#5C564E] space-y-2 leading-relaxed">
            <p>
              All products sold on EDSER are <strong>digital downloads</strong>. No physical package, disc, or printed paper will be shipped to your postal address.
            </p>
            <p>
              Immediately upon checkout completion, you will be redirected to an order confirmation screen featuring instant, one-click download buttons for each purchased product. Simultaneously, a confirmation email containing your permanent download links and license key will be sent to the email address provided during checkout.
            </p>
            <p>
              Your download links remain active indefinitely. If you ever switch devices or misplace your local files, you can re-access your download page at any time.
            </p>
          </div>
        </div>

        {/* Section 2: Refund & Replacement Policy */}
        <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-6 sm:p-8 space-y-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F7EAE7] flex items-center justify-center text-[#D48B80]">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#2D2A26]">
              2. Refund & Replacement Policy
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-[#5C564E] space-y-2 leading-relaxed">
            <p>
              Because digital files are irrevocably delivered upon purchase, standard physical retail returns do not apply. All sales are final once files have been accessed or downloaded.
            </p>
            <p>
              <strong>Replacement Guarantee:</strong> If you experience any technical corruption, broken links, or difficulty opening a template on a compatible system, we will replace your file package promptly or guide you through setup. If an accidental duplicate purchase occurs, contact our support team within 14 days for a prompt refund.
            </p>
          </div>
        </div>

        {/* Section 3: Household License Terms */}
        <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-6 sm:p-8 space-y-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EEF2ED] flex items-center justify-center text-[#70826E]">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#2D2A26]">
              3. Personal Household License
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-[#5C564E] space-y-2 leading-relaxed">
            <p>
              Every EDSER download purchase grants you a non-exclusive, non-transferable license for personal, household use:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>You may print as many copies as you need for yourself and your immediate family.</li>
              <li>You may save copies on personal computers, cloud drives, and tablets.</li>
              <li>You may NOT resell, distribute, share publicly, sublicense, or repackage EDSER files or modified derivatives for commercial sale.</li>
            </ul>
          </div>
        </div>

        {/* Store Owner Note on Custom Licensing */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-6 space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>Store Owner Note</span>
          </div>
          <p className="leading-relaxed">
            Commercial classroom, daycare, or corporate wellness licenses must be configured with specific seat limits prior to offering multi-seat enterprise discounts.
          </p>
        </div>

      </div>

    </div>
  );
};
