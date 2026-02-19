import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  User, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  Image as ImageIcon,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  ClipboardList,
  History,
  Award,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type Role = 'teacher' | 'student';

interface User {
  id: number;
  username: string;
  role: Role;
}

interface Question {
  id?: number;
  text: string;
  image_url: string;
  options: string[];
  correct_index: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  teacher_id: number;
  questions?: Question[];
}

interface Result {
  id: number;
  quiz_id: number;
  quiz_title: string;
  student_id: number;
  student_name?: string;
  score: number;
  total: number;
  timestamp: string;
}

// --- Components ---

const NotificationToast = ({ message, onClose }: { message: string, onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -50, x: 50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-20 right-4 z-[100] bg-white border border-indigo-100 shadow-2xl shadow-indigo-200/50 rounded-2xl p-4 flex items-center gap-4 max-w-sm"
    >
      <div className="bg-indigo-600 p-2 rounded-xl">
        <Bell className="w-5 h-5 text-white animate-bounce" />
      </div>
      <div className="flex-grow">
        <h4 className="text-sm font-bold text-zinc-900">Kuis Baru Tersedia!</h4>
        <p className="text-xs text-zinc-500 font-medium line-clamp-1">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
      >
        <XCircle className="w-4 h-4 text-zinc-400" />
      </button>
    </motion.div>
  );
};

const Navbar = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => {
  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">EduAssess</span>
          </Link>
          
          {user && (
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-600">
                <User className="w-4 h-4" />
                <span className="font-medium">{user.username}</span>
                <span className="px-2 py-0.5 bg-zinc-100 rounded-full text-[10px] uppercase tracking-wider font-bold">
                  {user.role}
                </span>
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister ? { username, password, role } : { username, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      setError('Gagal menghubungi server');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-zinc-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-200 p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-zinc-900">{isRegister ? 'Daftar Akun' : 'Selamat Datang'}</h2>
          <p className="text-zinc-500 mt-2">
            {isRegister ? 'Buat akun untuk mulai belajar' : 'Masuk untuk mengakses penilaian'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Username</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Daftar Sebagai</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={cn(
                    "py-2 px-4 rounded-xl border-2 transition-all text-sm font-medium",
                    role === 'student' ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-zinc-100 text-zinc-500 hover:border-zinc-200"
                  )}
                >
                  Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={cn(
                    "py-2 px-4 rounded-xl border-2 transition-all text-sm font-medium",
                    role === 'teacher' ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-zinc-100 text-zinc-500 hover:border-zinc-200"
                  )}
                >
                  Guru
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
          >
            {isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-indigo-600 text-sm font-semibold hover:underline"
          >
            {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const TeacherDashboard = ({ user }: { user: User }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/quizzes')
      .then(res => res.json())
      .then(setQuizzes);
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Hapus kuis ini?')) {
      await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      setQuizzes(quizzes.filter(q => q.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Dashboard Guru</h1>
          <p className="text-zinc-500 mt-2">Kelola kuis dan lihat hasil penilaian siswa.</p>
        </div>
        <Link 
          to="/create-quiz"
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Buat Kuis Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <motion.div 
            key={quiz.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col hover:shadow-xl hover:shadow-zinc-200/50 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 p-3 rounded-xl">
                <ClipboardList className="w-6 h-6 text-indigo-600" />
              </div>
              <button 
                onClick={() => handleDelete(quiz.id)}
                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{quiz.title}</h3>
            <p className="text-zinc-500 text-sm mb-6 line-clamp-2 flex-grow">{quiz.description}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
              <Link 
                to={`/quiz-results/${quiz.id}`}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Lihat Hasil <ChevronRight className="w-4 h-4" />
              </Link>
              <span className="text-xs font-medium text-zinc-400">ID: {quiz.id}</span>
            </div>
          </motion.div>
        ))}
        {quizzes.length === 0 && (
          <div className="col-span-full py-20 text-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
            <ClipboardList className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">Belum ada kuis yang dibuat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateQuiz = ({ user }: { user: User }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', image_url: '', options: ['', '', '', ''], correct_index: 0 }
  ]);
  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, { text: '', image_url: '', options: ['', '', '', ''], correct_index: 0 }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, teacher_id: user.id, questions }),
    });
    if (res.ok) navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <h1 className="text-4xl font-extrabold text-zinc-900 mb-8 tracking-tight">Buat Kuis Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 space-y-6 shadow-sm">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">Judul Kuis</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg font-medium"
              placeholder="Contoh: Ujian Matematika Dasar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">Deskripsi</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px]"
              placeholder="Berikan instruksi singkat untuk siswa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            Pertanyaan <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg text-sm">{questions.length}</span>
          </h2>
          
          {questions.map((q, qIndex) => (
            <motion.div 
              key={qIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm relative group"
            >
              <button 
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="absolute top-6 right-6 p-2 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Pertanyaan {qIndex + 1}</label>
                  <textarea 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                    placeholder="Tuliskan soal di sini..."
                    value={q.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> URL Gambar (Opsional)
                  </label>
                  <input 
                    type="url" 
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    placeholder="https://example.com/image.jpg"
                    value={q.image_url}
                    onChange={(e) => updateQuestion(qIndex, 'image_url', e.target.value)}
                  />
                  {q.image_url && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-zinc-100 max-w-sm">
                      <img src={q.image_url} alt="Preview" className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="relative">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 ml-1">Opsi {String.fromCharCode(65 + oIndex)}</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          required
                          className={cn(
                            "w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-sm font-medium",
                            q.correct_index === oIndex ? "border-indigo-600 ring-1 ring-indigo-600" : "border-zinc-200 focus:border-zinc-400"
                          )}
                          placeholder={`Pilihan ${oIndex + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => updateQuestion(qIndex, 'correct_index', oIndex)}
                          className={cn(
                            "p-2.5 rounded-xl border transition-all",
                            q.correct_index === oIndex ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-zinc-200 text-zinc-300 hover:border-zinc-300"
                          )}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button 
            type="button"
            onClick={addQuestion}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-dashed border-zinc-200 text-zinc-600 py-4 rounded-2xl font-bold hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            <Plus className="w-5 h-5" /> Tambah Pertanyaan
          </button>
          <button 
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
          >
            Simpan Kuis
          </button>
        </div>
      </form>
    </div>
  );
};

const StudentDashboard = ({ user }: { user: User }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

  useEffect(() => {
    fetch('/api/quizzes').then(res => res.json()).then(setQuizzes);
    fetch(`/api/results/student/${user.id}`).then(res => res.json()).then(setResults);
  }, [user.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Halo, {user.username}!</h1>
        <p className="text-zinc-500 mt-2">Siap untuk menguji kemampuanmu hari ini?</p>
      </div>

      <div className="flex gap-1 p-1 bg-zinc-100 rounded-2xl w-fit mb-8">
        <button 
          onClick={() => setActiveTab('available')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'available' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          <BookOpen className="w-4 h-4" /> Kuis Tersedia
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'history' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          <History className="w-4 h-4" /> Riwayat Nilai
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'available' ? (
          <motion.div 
            key="available"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col hover:shadow-xl hover:shadow-zinc-200/50 transition-all group">
                <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">{quiz.title}</h3>
                <p className="text-zinc-500 text-sm mb-6 line-clamp-2 flex-grow">{quiz.description}</p>
                <Link 
                  to={`/take-quiz/${quiz.id}`}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-center hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                  Mulai Kuis
                </Link>
              </div>
            ))}
            {quizzes.length === 0 && (
              <div className="col-span-full py-20 text-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                <BookOpen className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">Belum ada kuis yang tersedia.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {results.map((res) => (
              <div key={res.id} className="bg-white rounded-2xl border border-zinc-200 p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 p-3 rounded-xl">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">{res.quiz_title}</h4>
                    <p className="text-xs text-zinc-400 font-medium">{new Date(res.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-600">{res.score} <span className="text-zinc-300 text-sm font-bold">/ {res.total}</span></div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Skor Akhir</div>
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <div className="py-20 text-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                <History className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">Kamu belum pernah mengerjakan kuis.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TakeQuiz = ({ user }: { user: User }) => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/quizzes/${id}`).then(res => res.json()).then(setQuiz);
  }, [id]);

  if (!quiz) return <div className="p-20 text-center font-bold text-zinc-400">Memuat kuis...</div>;

  const handleAnswer = (optIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optIdx;
    setAnswers(newAnswers);
  };

  const next = () => {
    if (currentIdx < quiz.questions!.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    let correctCount = 0;
    quiz.questions!.forEach((q, i) => {
      if (answers[i] === q.correct_index) correctCount++;
    });
    setScore(correctCount);
    setFinished(true);

    await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: quiz.id,
        student_id: user.id,
        score: correctCount,
        total: quiz.questions!.length
      }),
    });
  };

  if (finished) {
    const percentage = Math.round((score / quiz.questions!.length) * 100);
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl border border-zinc-200 p-12 shadow-2xl shadow-zinc-200"
        >
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Award className="w-12 h-12 text-indigo-600" />
          </div>
          <h2 className="text-4xl font-black text-zinc-900 mb-2">Selesai!</h2>
          <p className="text-zinc-500 mb-8 font-medium">Kamu telah menyelesaikan kuis <span className="text-zinc-900 font-bold">"{quiz.title}"</span></p>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
              <div className="text-4xl font-black text-indigo-600">{score} / {quiz.questions!.length}</div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Jawaban Benar</div>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
              <div className="text-4xl font-black text-indigo-600">{percentage}%</div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Skor Akhir</div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
          >
            Kembali ke Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const q = quiz.questions![currentIdx];
  const progress = ((currentIdx + 1) / quiz.questions!.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-black text-zinc-900">{quiz.title}</h2>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Pertanyaan {currentIdx + 1} dari {quiz.questions!.length}</p>
          </div>
          <div className="text-right">
            <span className="text-indigo-600 font-black text-xl">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-indigo-600"
          />
        </div>
      </div>

      <motion.div 
        key={currentIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-12 shadow-sm"
      >
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 leading-tight mb-6">{q.text}</h3>
          {q.image_url && (
            <div className="rounded-2xl overflow-hidden border border-zinc-100 mb-6 bg-zinc-50">
              <img src={q.image_url} alt="Soal" className="w-full max-h-[400px] object-contain mx-auto" referrerPolicy="no-referrer" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={cn(
                "group flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.99]",
                answers[currentIdx] === i 
                  ? "border-indigo-600 bg-indigo-50" 
                  : "border-zinc-100 hover:border-zinc-200 bg-white"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-all",
                answers[currentIdx] === i 
                  ? "bg-indigo-600 text-white" 
                  : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200"
              )}>
                {String.fromCharCode(65 + i)}
              </div>
              <span className={cn(
                "font-bold text-lg",
                answers[currentIdx] === i ? "text-indigo-900" : "text-zinc-700"
              )}>
                {opt}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-12 flex justify-end">
          <button 
            onClick={next}
            disabled={answers[currentIdx] === undefined}
            className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-200 active:scale-[0.98]"
          >
            {currentIdx === quiz.questions!.length - 1 ? 'Selesai' : 'Lanjut'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const QuizResults = () => {
  const { id } = useParams();
  const [results, setResults] = useState<Result[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/results/quiz/${id}`).then(res => res.json()).then(setResults);
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <h1 className="text-4xl font-extrabold text-zinc-900 mb-8 tracking-tight">Hasil Penilaian</h1>

      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nama Siswa</th>
                <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Waktu Pengerjaan</th>
                <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {results.map((res) => (
                <tr key={res.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {res.student_name?.[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-zinc-900">{res.student_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-zinc-500 font-medium">
                    {new Date(res.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-lg font-black text-indigo-600">{res.score}</span>
                    <span className="text-zinc-300 font-bold ml-1">/ {res.total}</span>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-zinc-400 font-medium">
                    Belum ada siswa yang mengerjakan kuis ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eduassess_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    let socket: WebSocket;

    const connect = () => {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_QUIZ') {
            setNotification(data.title);
            // Auto hide after 10 seconds
            setTimeout(() => setNotification(null), 10000);
          }
        } catch (e) {
          console.error('WS Error:', e);
        }
      };

      socket.onclose = () => {
        setTimeout(connect, 3000); // Reconnect after 3s
      };
    };

    connect();
    return () => socket?.close();
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('eduassess_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('eduassess_user');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar user={user} onLogout={handleLogout} />
        
        <AnimatePresence>
          {notification && (
            <NotificationToast 
              message={notification} 
              onClose={() => setNotification(null)} 
            />
          )}
        </AnimatePresence>

        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
          />
          
          <Route 
            path="/" 
            element={
              !user ? <Navigate to="/login" /> : 
              user.role === 'teacher' ? <TeacherDashboard user={user} /> : 
              <StudentDashboard user={user} />
            } 
          />

          <Route 
            path="/create-quiz" 
            element={user?.role === 'teacher' ? <CreateQuiz user={user} /> : <Navigate to="/" />} 
          />

          <Route 
            path="/quiz-results/:id" 
            element={user?.role === 'teacher' ? <QuizResults /> : <Navigate to="/" />} 
          />

          <Route 
            path="/take-quiz/:id" 
            element={user?.role === 'student' ? <TakeQuiz user={user} /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
