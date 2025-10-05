export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold">Syllabus Buddy</h1>
        <p className="text-lg text-gray-600">
          Upload a syllabus and get instant summaries, deadlines, and an audio overview.
        </p>
        <a href="/upload">
          <button className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700">
            Get Started
          </button>
        </a>
      </div>
    </main>
  );
}
