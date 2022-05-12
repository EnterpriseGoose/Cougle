import { ITileInterface } from "./tile-interface";
import "./tile.scss";

const Tile = (props: ITileInterface) => {
  const { state, content, onKeyPressed } = props;
  console.log("TIle");
  return (
    <div
      className="tile"
      data-state={state}
      //onKeyDown={onKeyPressed}
    >
      {content}
    </div>
  );
};
export default Tile;
