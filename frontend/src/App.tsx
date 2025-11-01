
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";

import AuthPage from "./pages/Login";
import ModelDetails from "./pages/ModelDetails";
import ModelForm from "./pages/ModelForm";
function App() {
  return (
    <div className="min-h-screen bg-slate-300">
     <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/model/:name" element={<ModelDetails />} />
        <Route path="/create" element={<ModelForm />} />

      </Routes>
    </Router>
    </div>
  );
}

export default App;
