import Tile from "../tile/tile";
import { SETTING } from "../../global/global";
import "./row.scss";
import { IRowInterface } from "./row-interface";

const Row = (props: IRowInterface) => {
  const { states, letters } = props;
  var tiles: any[] = [];
  for (var i = 0; i < SETTING.LENGTH_OF_WORD; i++) {
    tiles.push(
      <Tile
        state={states !== null ? states[i] || "" : ""}
        content={letters[i] || ""}
      />
    );
  }
  return <div className="row">{tiles}</div>;
};
export default Row;
