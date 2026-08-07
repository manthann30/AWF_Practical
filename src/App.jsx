import { Routes, Route } from "react-router-dom";

import NavBar from "./components/navbar";

import Home from "./pages/Home";
import Projects from "./pages/Project";
import Contact from "./pages/Contact";

function App() {

  return (
    <div>

      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

    </div>
  );
}

export default App;