import Header from "../components/header";
import About from "../components/about";
import Skills from "../components/skills";
import Footer from "../components/footer";

function Home() {

  const studentName = "Manthan Rangpariya";

  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "C++",
    "Python",
    "Machine Learning"
  ];


  return (
    <>

      <Header
        title="Student Portfolio"
        name={studentName}
        themeColor="darkblue"
      />

      <About
        name={studentName}
        bio="I am a Computer Engineering student interested in AI, Machine Learning, Web Development and Data Science."
      />

      <Skills skills={skills} />

      <Footer contact="manthanrangpariya300@gmail.com" />

    </>
  );

}

export default Home;