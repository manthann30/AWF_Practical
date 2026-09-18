import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchRepos = () => {
    setLoading(true);
    setError(null);

    fetch("https://api.github.com/users/manthan205/repos")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch repositories");
        }
        return res.json();
      })
      .then((data) => setRepos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <h3>Loading repositories...</h3>;
  }

  if (error) {
    return (
      <section>
        <h3>Error: {error}</h3>
        <button onClick={fetchRepos}>Retry</button>
      </section>
    );
  }

  return (
    <section>
      <div className="p6-banner">
        <span>🚀 <strong>Practical 6:</strong> Full Stack Task Manager (React + Express + MongoDB) is ready!</span>
        <Link to="/tasks" className="p6-banner-btn">Go to Task Manager →</Link>
      </div>

      <h2>My GitHub Projects (Practical 3)</h2>

      <input
        type="text"
        placeholder="Search repositories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul>
        {filteredRepos.map((repo) => (
          <li key={repo.id}>
            <a href={repo.html_url} target="_blank" rel="noreferrer">
              {repo.name}
            </a>
            {" ⭐ "}{repo.stargazers_count}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Projects;