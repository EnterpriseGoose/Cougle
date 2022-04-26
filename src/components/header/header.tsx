import { useState } from "react";
import { APP_NAME, SVGICON } from "../../global/global";
import { IHeaderProps } from "./header-interface";
import "./header.scss";

function addClick(
  pawClicks: number,
  setPawClicks: React.Dispatch<React.SetStateAction<number>>
) {
  setPawClicks(pawClicks + 1);
  if (pawClicks >= 10) {
    (document.getElementsByClassName(
      "title"
    )[0] as HTMLDivElement).style.setProperty("color", "gold");
    (document.getElementsByClassName(
      "title"
    )[0] as HTMLDivElement).style.setProperty("font-family", "Brush Script MT");
  }
  if (pawClicks >= 20) {
    (document.getElementsByClassName(
      "title"
    )[0] as HTMLDivElement).style.setProperty("color", "white");
    (document.getElementsByClassName(
      "title"
    )[0] as HTMLDivElement).style.setProperty("font-family", "");
    setPawClicks(0);
  }
}

const Header = (props: IHeaderProps) => {
  let [pawClicks, setPawClicks] = useState<number>(0);

  function rotatePaw(e: any) {
    e.target.style.transform = "rotate(10deg)";
  }
  function otherRotate(e: any) {
    e.target.style.transform = "rotate(-10deg)";
  }
  return (
    <>
      <header>
        <img
          src={require("./left.png")}
          width="60"
          height="60"
          className="paw"
          onClick={() => {
            addClick(pawClicks, setPawClicks);
          }}
          onMouseOver={rotatePaw}
          onMouseLeave={otherRotate}
          alt="paw ;)"
        />
        <div className="menu"></div>
        <img
          src={require("./right.png")}
          width="60"
          height="60"
          className="paw"
          onMouseOver={otherRotate}
          onMouseLeave={rotatePaw}
          alt="paw ;)"
        />
        <div className="title">Cougle</div>
      </header>
    </>
  );
};
export default Header;
