
import React from "react";

export default function RequestWireframe() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">
        📝 نموذج الطلب – Wireframe
      </h1>
      <div className="grid grid-cols-1 gap-3">
        <WireframeField label="RequestID (Auto)" />
        <WireframeField label="RequestDate (Auto)" />
        <WireframeField label="PatientName" />
        <WireframeField label="PatientIDNo" />
        <WireframeField label="PatientContactNo" />
        <WireframeField label="PatientMRN" />
        <WireframeField label="CoverageType (Cash/Insurance)" />
        <WireframeField label="ReferredHospital (اختيار من قائمة)" />
        <WireframeField label="MyClinicBranch" />
        <WireframeField label="ExpectedSurgeryDate" />
        <WireframeField label="Specialty" />
        <WireframeField label="DoctorName (حسب التخصص)" />
        <WireframeField label="ServiceDescription" big />
        <WireframeField label="InstrumentsNeeded" big />
        <WireframeField label="History" big />
        <WireframeField label="Attachments (ملفات/صور)" />
        <WireframeField label="AdmissionType (Inpatient/DPU)" />
        <WireframeField label="Status (Submitted)" />
      </div>
      <div className="flex justify-center mt-8">
        <button className="px-8 py-3 rounded-md bg-gray-200 text-gray-700 font-semibold shadow">
          إرسال الطلب (تجريبي)
        </button>
      </div>
      <p className="mt-8 text-center text-xs text-gray-400">
        Wireframe تخطيطي فقط — لا توجد وظائف فعلية بعد.
      </p>
    </div>
  );
}

// حقل تخطيطي قابل لإعادة الاستخدام
function WireframeField({ label, big = false }: { label: string; big?: boolean }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div
        className={`border-2 border-dashed border-gray-300 rounded-md ${
          big
            ? "h-12"
            : "h-8"
        } bg-gray-50 flex items-center px-2 text-gray-400`}
      >
        {/* خانات الحقل فقط للعرض */}
      </div>
    </div>
  );
}
