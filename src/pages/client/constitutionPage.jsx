import { Link } from "react-router-dom";

export default function ConstitutionPage() {
  // Replace with the actual path or backend URL of your constitution PDF
  const pdfUrl = "/files/Constitution.pdf"; 

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="p-6 bg-blue-700 text-white text-center shadow">
        <h1 className="text-3xl font-bold">Association Constitution</h1>
      </header>

      {/* PDF Viewer */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-4 h-[80vh]">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            title="Constitution PDF"
            className="w-full h-full rounded-lg"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 bg-gray-100 flex justify-center">
        <Link
          to="/"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Home
        </Link>
      </footer>
    </div>
  );
}
