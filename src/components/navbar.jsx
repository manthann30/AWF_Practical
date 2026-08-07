import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="navbar">

      <Link to="/">Home</Link>

      <Link to="/projects">Projects</Link>

      <Link to="/contact">Contact</Link>

    </nav>
  );
}

export default NavBar;