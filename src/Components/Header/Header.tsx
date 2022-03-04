import React from "react";
import "./Header.scss";

interface HeaderProps {
  title: string;
}

function Header(props: HeaderProps) {
  return (
    <header id="appHeader" slot="header">
      <h1>{props.title}</h1>
    </header>
  );
}

export default Header;
