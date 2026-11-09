import { BookOpen, Video, PlayCircle } from 'lucide-react'

export default function CoursesPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <BookOpen className="text-primary" /> Music Learning
      </h1>
      <p className="text-gray-400 mb-8">Pelajari teori musik, komposisi, dan instrumen.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Dasar Teori Musik', level: 'Pemula', color: 'bg-primary' },
          { title: 'Produksi Musik dengan AI', level: 'Menengah', color: 'bg-secondary' },
          { title: 'Mastering Guitar Tab', level: 'Menengah', color: 'bg-accent' },
        ].map((course, i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden group cursor-pointer">
            <div className={`h-32 ${course.color}/20 flex items-center justify-center relative`}>
              <PlayCircle size={48} className={`opacity-50 group-hover:opacity-100 transition text-white drop-shadow-md`} />
            </div>
            <div className="p-4">
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded mb-2 inline-block">{course.level}</span>
              <h3 className="font-bold text-lg mb-1">{course.title}</h3>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Video size={14} /> 12 Video Lessons
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
