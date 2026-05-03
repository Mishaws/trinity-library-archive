import { useState, useEffect } from 'react';

export default function App() {
  const logoPlaceholder = "https://i.pinimg.com/736x/24/80/9f/24809fa1d760ee3adb961cc29b757ffa.jpg";
  const kozekiImg = "https://static.wikitide.net/bluearchivewiki/thumb/8/8f/Memorial_Lobby_Ui.jpg/1280px-Memorial_Lobby_Ui.jpg";

  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isLoginView, setIsLoginView] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });

  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', category: 'Manga', status: 'Unread', cover_image: '', total_pages: '' });

  const API_BASE = '[https://trinity-backend.up.railway.app/api](https://trinity-backend.up.railway.app/api)';

  let librarianMessage = `Welcome to the Archive, ${username}. Ready to catalog?`;
  if (!newBook.title) librarianMessage = "Please fill in the Book Title before registering.";
  if (newBook.status === 'Finished') librarianMessage = "Ah, a finished book! Excellent dedication.";

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLoginView ? '/auth/login' : '/auth/register';
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await response.json();
      
      if (response.ok) {
        if (isLoginView) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          setToken(data.token);
          setUsername(data.username);
        } else {
          alert('Register sukses! Silakan login sebagai Student.');
          setIsLoginView(true);
          setAuthForm({ username: '', password: '' });
        }
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken('');
    setUsername('');
    setBooks([]); 
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_BASE}/books`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // PASTIKAN DATA ADALAH ARRAY SEBELUM DI-SET
        if (Array.isArray(data)) {
          setBooks(data);
        }
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (token) fetchBooks();
  }, [token]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/books`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: newBook.title,
          category: newBook.category,
          status: newBook.status,
          cover_image: newBook.cover_image || 'https://via.placeholder.com/300x400?text=No+Cover',
          current_page: 0,
          total_pages: newBook.total_pages ? parseInt(newBook.total_pages) : null
        })
      });
      if (response.ok) {
        setNewBook({ title: '', category: 'Manga', status: 'Unread', cover_image: '', total_pages: '' });
        fetchBooks();
      }
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/books/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleUpdateProgress = async (id, newStatus, newPage) => {
    try {
      const response = await fetch(`${API_BASE}/books/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          status: newStatus,
          current_page: newPage !== undefined ? parseInt(newPage) : undefined
        })
      });
      if (response.ok) fetchBooks();
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const categories = ['Light Novel', 'Manga', 'Reference', 'Others'];

  if (!token) {
    return (
      <div className="min-h-screen bg-[#3E2B20] flex items-center justify-center font-sans selection:bg-[#7CA1D8] selection:text-white" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')"}}>
        <div className="bg-[#FAF5EB] border-4 border-[#CDBE82] rounded-md p-8 shadow-2xl w-96">
          <div className="flex justify-center mb-4">
             <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-inner overflow-hidden border-2 border-[#7CA1D8]">
                <img src={logoPlaceholder} alt="Logo" className="w-full h-full object-cover" />
             </div>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#4A3525] mb-6 text-center border-b-2 border-[#CDBE82] pb-2 decoration-dotted">
            {isLoginView ? 'Student Login' : 'Register Student'}
          </h1>
          
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-[#6D5341] mb-1">Username</label>
              <input type="text" required value={authForm.username} onChange={(e) => setAuthForm({...authForm, username: e.target.value})} className="border border-[#CDBE82] bg-white p-2 text-sm focus:border-[#7CA1D8] outline-none rounded-sm shadow-inner" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-[#6D5341] mb-1">Password</label>
              <input type="password" required value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} className="border border-[#CDBE82] bg-white p-2 text-sm focus:border-[#7CA1D8] outline-none rounded-sm shadow-inner" />
            </div>
            <button type="submit" className="bg-[#7CA1D8] text-white font-bold py-2 mt-2 hover:bg-[#5B88C6] transition-colors rounded-sm shadow-md border-b-4 border-[#5B88C6] active:border-b-0 active:mt-3 mb-1">
              {isLoginView ? 'ENTER ARCHIVE' : 'REGISTER CREDENTIALS'}
            </button>
          </form>
          
          <p className="mt-6 text-sm text-center text-[#6D5341] cursor-pointer hover:text-[#7CA1D8] transition-colors font-medium border-t border-dashed border-[#CDBE82] pt-4" onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? "New Student? Request Access here." : "Already have credentials? Login."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#3E2B20] font-sans selection:bg-[#7CA1D8] selection:text-white" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')"}}>
      <nav className="bg-[#FAF5EB] text-[#2c2016] p-4 flex justify-between items-center shadow-lg border-b-4 border-[#CDBE82]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white overflow-hidden border-2 border-[#7CA1D8]">
             <img src={logoPlaceholder} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold tracking-wider font-serif text-[#4A3525]">TRINITY LIBRARY ARCHIVE</span>
        </div>
        <div className="text-sm font-medium flex items-center gap-4">
          <span className="text-[#6D5341] font-bold">Student: <span className="text-[#7CA1D8] uppercase">{username}</span></span>
          <span className="cursor-pointer bg-[#e8a39a] text-[#8c352a] px-3 py-1 rounded-sm border border-[#c4776e] hover:bg-[#d6857c] transition-colors" onClick={handleLogout}>Logout</span>
        </div>
      </nav>

      <div className="max-w-[90%] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          
          <div className="lg:w-1/4 flex flex-col gap-6 sticky top-8">
            <div className="bg-[#FAF5EB] border-4 border-[#CDBE82] rounded-md p-6 shadow-xl">
              <h2 className="font-bold text-[#4A3525] text-xl mb-4 border-b-2 border-[#CDBE82] pb-2 font-serif text-center decoration-dotted">ADD NEW RECORD</h2>
              <form onSubmit={handleAddBook} className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-[#6D5341] mb-1">Book Title</label>
                  <input type="text" required value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} className="border border-[#CDBE82] bg-white p-2 text-sm focus:border-[#7CA1D8] outline-none rounded-sm shadow-inner" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-[#6D5341] mb-1">Category</label>
                  <select value={newBook.category} onChange={(e) => setNewBook({...newBook, category: e.target.value})} className="border border-[#CDBE82] bg-white p-2 text-sm focus:border-[#7CA1D8] outline-none rounded-sm">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-[#6D5341] mb-1">Reading Status</label>
                  <select value={newBook.status} onChange={(e) => setNewBook({...newBook, status: e.target.value})} className="border border-[#CDBE82] bg-white p-2 text-sm focus:border-[#7CA1D8] outline-none rounded-sm">
                    <option value="Unread">Unread</option>
                    <option value="On Progress">On Progress</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-[#6D5341] mb-1">Total Pages (Optional)</label>
                  <input type="number" placeholder="e.g. 240" min="1" value={newBook.total_pages} onChange={(e) => setNewBook({...newBook, total_pages: e.target.value})} className="border border-[#CDBE82] bg-white p-2 text-sm focus:border-[#7CA1D8] outline-none rounded-sm shadow-inner" />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-[#6D5341] mb-1">Cover Image URL (Optional)</label>
                  <input type="url" placeholder="https://..." value={newBook.cover_image} onChange={(e) => setNewBook({...newBook, cover_image: e.target.value})} className="border border-[#CDBE82] bg-white p-2 text-sm focus:border-[#7CA1D8] outline-none rounded-sm shadow-inner" />
                </div>
                
                <button type="submit" className="bg-[#7CA1D8] text-white font-bold py-2 mt-4 hover:bg-[#5B88C6] transition-colors rounded-sm shadow-md border-b-4 border-[#5B88C6] active:border-b-0 active:mt-5 mb-1">REGISTER BOOK</button>
              </form>
            </div>

            <div className="bg-[#FAF5EB] border-4 border-[#CDBE82] rounded-md p-4 shadow-xl flex flex-col items-center text-center relative mt-4">
               <div className="bg-white border-2 border-[#7CA1D8] text-[#4A3525] text-xs font-bold p-3 rounded-xl mb-4 shadow-md relative w-full">
                  {librarianMessage}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-[#7CA1D8] rotate-45"></div>
               </div>
               
               <div className="w-full aspect-[3/4] bg-[#ECE5D3] rounded-sm overflow-hidden flex items-center justify-center border-2 border-[#CDBE82]">
                 <img src={kozekiImg} alt="Librarian Kozeki" className="w-full h-full object-cover object-top" />
               </div>
            </div>
          </div>

          <div className="lg:w-3/4 flex flex-col gap-10">
            {categories.map((category) => {
              const categoryBooks = books.filter(b => b.category === category);
              if (categoryBooks.length === 0) return null;
              
              return (
                <div key={category} className="bg-[#FAF5EB]/95 border-2 border-[#CDBE82] rounded-md p-6 shadow-2xl">
                  <h2 className="text-2xl font-bold font-serif text-[#4A3525] border-b-4 border-[#7CA1D8] pb-1 mb-6 inline-block pr-8 uppercase tracking-widest">{category}</h2>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {categoryBooks.map((book) => (
                      <div key={book.id} className="bg-white border text-center border-[#CDBE82] rounded-sm p-3 flex flex-col shadow-md hover:shadow-lg transition-shadow">
                        <div className="relative w-full h-48 mb-3 border-2 border-[#ECE5D3] overflow-hidden group">
                          <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                           <div className={`absolute top-0 right-0 text-white text-[10px] font-bold px-2 py-1 tracking-wider shadow-sm ${
                              book.status === 'Finished' ? 'bg-green-600' : 
                              book.status === 'On Progress' ? 'bg-yellow-500' : 
                              'bg-[#7CA1D8]'
                            }`}>
                            {book.status.toUpperCase()}
                          </div>
                          
                        </div>
                        
                        <div className="flex-grow flex flex-col items-center">
                          <h3 className="font-bold text-[#4A3525] text-sm leading-snug mb-2 line-clamp-2" title={book.title}>{book.title}</h3>
                          
                          <select 
                            value={book.status} 
                            onChange={(e) => handleUpdateProgress(book.id, e.target.value, book.current_page)}
                            className="bg-[#ECE5D3] border border-[#CDBE82] text-xs font-semibold text-[#6D5341] p-1 rounded-sm w-full mb-2 outline-none focus:border-[#7CA1D8]"
                          >
                            <option value="Unread">Unread</option>
                            <option value="On Progress">On Progress</option>
                            <option value="Finished">Finished</option>
                          </select>

                          {book.status === 'On Progress' && (
                            <div className="w-full flex items-center justify-center gap-1 mb-2 bg-[#F9F7F1] border border-[#E0D5B3] p-1 rounded-sm">
                              <span className="text-xs text-[#6D5341] font-bold">[</span>
                              <input 
                                type="number" 
                                min="0" 
                                max={book.total_pages || 9999}
                                value={book.current_page || 0}
                                onChange={(e) => handleUpdateProgress(book.id, book.status, e.target.value)}
                                className="w-12 text-center text-xs font-bold bg-transparent outline-none border-b border-dashed border-[#CDBE82] focus:border-[#7CA1D8]" 
                              />
                              {book.total_pages > 0 && <span className="text-xs text-[#a39487]">/ {book.total_pages}</span>}
                              <span className="text-xs text-[#6D5341] font-bold">]</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 w-full">
                          <button onClick={() => handleDelete(book.id)} className="w-full text-[10px] font-bold border border-red-300 text-red-500 py-1 rounded-sm hover:bg-red-500 hover:text-white transition-colors">DISCARD</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {books.length === 0 && (
              <div className="bg-[#FAF5EB]/95 border-2 border-[#CDBE82] rounded-md p-10 shadow-2xl flex flex-col items-center justify-center text-[#6D5341]">
                <p className="font-serif italic text-lg mb-2">"The shelves are empty..."</p>
                <p className="text-sm">Please catalog some books using the form on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}