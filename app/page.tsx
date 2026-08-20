"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [selectedParticipant, setSelectedParticipant] = useState("הכל");

  // State עבור החלון הקופץ והטופס
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // שומר את ה-ID אם אנחנו בעריכה
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newParticipants, setNewParticipants] = useState("");
  const [newStatus, setNewStatus] = useState("עוד לא נוצר");

  // משיכת נתונים
  useEffect(() => {
    fetch("https://video-ideas-backend.onrender.com/ideas/")
      .then((res) => res.json())
      .then((data) => setIdeas(data))
      .catch((err) => console.log(err));
  }, []);

  const categories = ["הכל", ...Array.from(new Set(ideas.map((i) => i.category)))];
  const allParticipants = ideas.flatMap(i => i.participants ? i.participants.split(", ") : []);
  const participants = ["הכל", ...Array.from(new Set(allParticipants))];

  const filteredIdeas = ideas.filter((idea) => {
    const matchCategory = selectedCategory === "הכל" || idea.category === selectedCategory;
    const matchParticipant = selectedParticipant === "הכל" || (idea.participants && idea.participants.includes(selectedParticipant));
    return matchCategory && matchParticipant;
  });

  // פתיחת חלון ליצירת רעיון חדש (איפוס נתונים)
  const openCreateModal = () => {
    setEditingId(null);
    setNewTitle("");
    setNewDesc("");
    setNewCategory("");
    setNewParticipants("");
    setNewStatus("עוד לא נוצר");
    setIsModalOpen(true);
  };

  // פתיחת חלון לעריכת רעיון קיים (מילוי הטופס בנתונים הקיימים)
  const openEditModal = (idea: any) => {
    setEditingId(idea.id);
    setNewTitle(idea.title);
    setNewDesc(idea.description || "");
    setNewCategory(idea.category);
    setNewParticipants(idea.participants || "");
    setNewStatus(idea.status);
    setIsModalOpen(true);
  };

  // מחיקת רעיון
  const handleDeleteIdea = async (id: number) => {
    if (!window.confirm("בטוחה שאת רוצה למחוק את הרעיון הזה? 🗑️")) return;

    const res = await fetch(`https://video-ideas-backend.onrender.com/ideas/${id}`, { method: "DELETE" });
    if (res.ok) {
      setIdeas(ideas.filter((i) => i.id !== id));
    }
  };

  // שמירת רעיון (גם יצירה וגם עריכה)
  const handleSaveIdea = async (e: React.FormEvent) => {
    e.preventDefault();

    const ideaData = {
      title: newTitle,
      description: newDesc,
      category: newCategory,
      participants: newParticipants,
      status: newStatus
    };

    if (editingId) {
      // אם אנחנו במצב עריכה - נשלח PATCH לשרת
      const res = await fetch(`https://video-ideas-backend.onrender.com/ideas/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ideaData),
      });
      if (res.ok) {
        const updatedIdea = await res.json();
        setIdeas(ideas.map((i) => (i.id === editingId ? updatedIdea : i)));
        setIsModalOpen(false);
      }
    } else {
      // אם אנחנו ביצירה חדשה - נשלח POST לשרת
      const res = await fetch("https://video-ideas-backend.onrender.com/ideas/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ideaData),
      });
      if (res.ok) {
        const addedIdea = await res.json();
        setIdeas([...ideas, addedIdea]);
        setIsModalOpen(false);
      }
    }
  };

  return (
    // שיניתי פה את הרקע ל- bg-slate-200 שיהיה יותר בולט ונעים
    <div className="min-h-screen bg-slate-200 flex flex-col font-sans relative pb-24" dir="rtl">
      <header className="bg-white shadow-md py-6 mb-8 text-center border-b border-gray-200">
        <h1 className="text-4xl font-bold text-blue-700">רעיונות לסרטונים 🎬</h1>
      </header>

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full px-6 gap-8 pb-12">

        {/* תפריט סינון */}
        <aside className="w-full md:w-64 bg-white p-6 rounded-2xl shadow-md border border-gray-200 h-fit shrink-0">
          <div className="mb-8">
            <h3 className="font-bold text-xl mb-4 text-gray-900">קטגוריות 🏷️</h3>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-right px-4 py-2 rounded-xl transition-all ${selectedCategory === cat ? "bg-blue-600 text-white font-bold shadow-md" : "bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xl mb-4 text-gray-900">משתתפים 👥</h3>
            <div className="flex flex-col gap-2">
              {participants.map((part) => (
                <button
                  key={part}
                  onClick={() => setSelectedParticipant(part)}
                  className={`text-right px-4 py-2 rounded-xl transition-all ${selectedParticipant === part ? "bg-green-600 text-white font-bold shadow-md" : "bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium"
                    }`}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* רשימת הרעיונות */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 h-fit">
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className="bg-white p-6 rounded-2xl shadow-md border-r-8 border-blue-500 flex flex-col justify-between hover:shadow-lg transition-shadow">

              <div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900">{idea.title}</h2>
                {/* שיניתי את צבע הטקסט לכהה יותר (gray-800) */}
                <p className="text-gray-800 text-lg mb-6 leading-relaxed font-medium">{idea.description}</p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 text-sm font-bold mb-5">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg border border-purple-200">{idea.category}</span>
                  {idea.participants && (
                    <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg border border-green-200">{idea.participants}</span>
                  )}
                  <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 mt-auto">סטטוס: {idea.status}</span>
                </div>

                {/* כפתורי עריכה ומחיקה */}
                <div className="flex gap-4 border-t border-gray-100 pt-4 mt-2">
                  <button onClick={() => openEditModal(idea)} className="text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-4 py-2 rounded-lg transition-colors flex-1">
                    עריכה ✏️
                  </button>
                  <button onClick={() => handleDeleteIdea(idea.id)} className="text-red-600 hover:text-red-800 font-bold bg-red-50 px-4 py-2 rounded-lg transition-colors flex-1">
                    מחיקה 🗑️
                  </button>
                </div>
              </div>

            </div>
          ))}
        </main>
      </div>

      {/* כפתור יצירה מרחף */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-8 left-8 bg-blue-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-4xl hover:bg-blue-700 transition-transform hover:scale-110 z-40 border-4 border-white"
      >
        +
      </button>

      {/* חלון קופץ לעריכה/יצירה */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingId ? "עריכת רעיון ✏️" : "רעיון חדש לסרטון 💡"}
            </h2>

            <form onSubmit={handleSaveIdea} className="flex flex-col gap-4">
              <input required placeholder="כותרת הסרטון" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="p-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 font-medium text-gray-900 placeholder-gray-500 bg-gray-50" />
              <textarea placeholder="תיאור קצר או רעיון כללי" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="p-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 min-h-[100px] font-medium text-gray-900 placeholder-gray-500 bg-gray-50" />
              <input required placeholder="קטגוריה (למשל: מצחיק, לימוד)" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="p-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 font-medium text-gray-900 placeholder-gray-500 bg-gray-50" />
              <input placeholder="משתתפים (למשל: בן זוג, אמא)" value={newParticipants} onChange={(e) => setNewParticipants(e.target.value)} className="p-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 font-medium text-gray-900 placeholder-gray-500 bg-gray-50" />

              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="p-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 font-medium text-gray-900 bg-gray-50">
                <option value="עוד לא נוצר">עוד לא נוצר</option>
                <option value="בתהליך">בתהליך</option>
                <option value="בוצע">בוצע</option>
              </select>

              <div className="flex gap-4 mt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                  {editingId ? "שמור שינויים" : "הוסף רעיון"}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-300 text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-400 transition-colors">
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}