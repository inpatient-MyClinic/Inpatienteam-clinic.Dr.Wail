
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-gray-50 font-sans">
      <Header />
      <main className="flex flex-col items-center justify-center py-16 px-4 min-h-[60vh]">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4 text-center">
          Welcome
        </h2>
        <button
          className="mt-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow transition"
        >
          Login
        </button>
      </main>
    </div>
  );
};

export default Index;
