// can be used as template
//save as command as commandName.js

const helpString =
  "Pick a board: a, b, c, d, e, f, g, h, or a thematic board (NE, NW, East, West, SE, SW).";

module.exports = {
  name: "board",
  description: "Displays Boards",
  details:
    "Returns the map image for a board - core boards a-h, or a directional/thematic board (NE, NW, East, West, SE, SW). Run it without picking a board to see the full list.",
  public: true, //has to be true to show as a command
  options: [
    {
      name: "board",
      description: "Which board to show (blank lists the valid inputs)",
      type: "string",
      choices: [
        { name: "A", value: "a" },
        { name: "B", value: "b" },
        { name: "C", value: "c" },
        { name: "D", value: "d" },
        { name: "E", value: "e" },
        { name: "F", value: "f" },
        { name: "G", value: "g" },
        { name: "H", value: "h" },
        { name: "North East (thematic)", value: "ne" },
        { name: "North West (thematic)", value: "nw" },
        { name: "East (thematic)", value: "east" },
        { name: "West (thematic)", value: "west" },
        { name: "South East (thematic)", value: "se" },
        { name: "South West (thematic)", value: "sw" },
      ],
    },
  ],
  async execute(msg, args) {
    if (args[0] == "help" || args[0] == "") {
      await msg.channel.send(helpString);
    } else {
      await msg.channel.send(searchBoards(args[0]));
    }
  },
};

/**
 * TODO: modify this to use the boardNames constants
 * @param {*} b
 * @returns
 */
function searchBoards(b) {
  if (b) {
    searchTerm = b.toLowerCase();
  } else {
    return helpString;
  }
  console.log(b.toLowerCase());
  switch (searchTerm) {
    case "a":
      return "https://spiritislandwiki.com/images/e/e2/Piece_core_board_a.png";
      break;
    case "b":
      return "https://spiritislandwiki.com/images/7/7a/Piece_core_board_b.png";
      break;
    case "c":
      return "https://spiritislandwiki.com/images/8/82/Piece_core_board_c.png";
      break;
    case "d":
      return "https://spiritislandwiki.com/images/3/3a/Piece_core_board_d.png";
      break;
    case "e":
      return "https://spiritislandwiki.com/images/e/e5/Piece_je_board_e.png";
      break;
    case "f":
      return "https://spiritislandwiki.com/images/0/0b/Piece_je_board_f.png";
      break;
    case "g":
      return "https://spiritislandwiki.com/images/d/d4/Piece_horizons_board_g.png";
      break;
    case "h":
      return "https://spiritislandwiki.com/images/4/4a/Piece_horizons_board_h.png";

    //Thematic boards
    case "ne":
    case "northeast":
      return "https://spiritislandwiki.com/images/f/f9/Piece_core_board_north_east.png";
      break;
    case "nw":
    case "northwest":
      return "https://spiritislandwiki.com/index.php?title=File:Piece_core_board_east.png";
      break;
    case "east":
      return "https://spiritislandwiki.com/images/5/58/Piece_core_board_east.png";
      break;
    case "west":
    case "w":
      return "https://spiritislandwiki.com/images/2/26/Piece_core_board_west.png";
      break;
    case "se":
    case "southeast":
      return "https://spiritislandwiki.com/images/c/cc/Piece_je_board_south_east.png";
      break;
    case "sw":
    case "southwest":
      return "https://spiritislandwiki.com/images/6/64/Piece_je_board_south_west.png";
      break;
    default:
      return helpString;
  }
}
