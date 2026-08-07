function Header({ title, name, themeColor }) {

  return (
    <header
      style={{
        background: themeColor,
        color: "white",
        padding: "30px",
        textAlign: "center"
      }}
    >
      <h1>{title}</h1>

      <h2>{name}</h2>

    </header>
  );

}

export default Header;