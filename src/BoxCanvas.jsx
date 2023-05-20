import React, { useState, useRef, useEffect } from "react";
import "./BoxCanvas.css";
import "./components/TxtWallet.css";
import defaultchar from "./character/default.png";
import upchar from "./character/up.png";
import downchar from "./character/down.png";
import leftchar from "./character/left.png";
import rightchar from "./character/right.png";
import backchar from "./character/back.png";
import ball from "./character/pokeball.png";
import mon1 from "./monster/1.gif";
import mon2 from "./monster/2.gif";
import mon3 from "./monster/3.gif";
import mon4 from "./monster/4.gif";
import mon5 from "./monster/5.gif";
import grasveld from "./maps/grasveld.gif";
import Progress from "@ramonak/react-progress-bar";
import SyncLoader from "react-spinners/SyncLoader";

function BoxCanvas({
  stats,
  onTodoAction,
  isInBattle,
  isButtonDisabled,
  isCaught,
  isBattleOver,
  isGameOver,
}) {
  const canvasRef = useRef(null);
  const [position, setPosition] = useState({ x: 75, y: 90 });
  const [randomNumber, setRandomNumber] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);

  const playerHp = stats.find((_) => _.key === "player_hp")?.value;
  const enemyHp = stats.find((_) => _.key === "mons_hp")?.value;

  const [isLoading, setIsLoading] = useState(false);

  const monsterImages = {
    1: mon1,
    2: mon2,
    3: mon3,
    4: mon4,
    5: mon5,

    // ... add all other monster images
  };

  const monsterNames = {
    1: `Pikachu`,
    2: `Exeggcute`,
    3: `Seedot`,
    4: `Pidgeotto`,
    5: `Tangela`,

    // ... add all other monster images
  };

  const monsterImageSrc = monsterImages[randomNumber];
  const monsterNameSrc = monsterNames[randomNumber];

  useEffect(() => {
    function handleKeyDown(event) {
      if (isButtonDisabled) return; // don't handle key events when button is disabled
      const { key } = event;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      switch (key) {
        case "ArrowLeft":
          setBackgroundImage(leftchar);
          setPosition((prevPosition) => ({
            ...prevPosition,
            x: Math.max(prevPosition.x - 35, 5),
          }));
          break;
        case "ArrowRight":
          setBackgroundImage(rightchar);
          setPosition((prevPosition) => ({
            ...prevPosition,
            x: Math.min(prevPosition.x + 35, 460),
          }));
          break;
        case "ArrowUp":
          setBackgroundImage(upchar);
          setPosition((prevPosition) => ({
            ...prevPosition,
            y: Math.max(prevPosition.y - 35, 20),
          }));
          break;
        case "ArrowDown":
          setBackgroundImage(downchar);
          setPosition((prevPosition) => ({
            ...prevPosition,
            y: Math.min(prevPosition.y + 35, 440),
          }));
          break;
        default:
          break;
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isButtonDisabled]);

  useEffect(() => {
    setRandomNumber(Math.floor(Math.random() * 20) + 1);
  }, [position]);

  useEffect(() => {
    if (randomNumber == 1) {
      setShowButton(randomNumber === 1);
    }
    if (randomNumber >= 2) {
      setShowButton(randomNumber <= 5);
    }
  }, [randomNumber]);

  function handleClick() {
    onTodoAction("proceed");
    console.log("Battle!");
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    console.log(canvasRef.current);

    context.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = backgroundImage || defaultchar; // use default image if backgroundImage is null
    img.onload = () => {
      if (!backgroundImage) {
        context.drawImage(img, position.x, position.y, 35, 50);
      }
    };
    context.drawImage(img, position.x, position.y, 35, 50);
    console.log(position);
  }, [position, backgroundImage, defaultchar]);

  function caught() {
    onTodoAction("captured");
  }

  const Player = ({ health }) => (
    <div className="player-ui">
      <img src={backchar} alt="defaultchar" className="image" />
      <div className="player-bar">
        <p>Player</p>
        <div>
          <p>Health: {health}</p>
          <Progress
            completed={health}
            maxCompleted={100}
            bgColor="#1b9a2b"
            borderRadius="0"
            isLabelVisible={false}
            height="10px"
          />
        </div>
      </div>
    </div>
  );

  const Enemy = ({ health }) => (
    <div className="enemy-ui">
      <img src={monsterImageSrc} alt="monster" className="image" />
      <div className="enemy-bar">
        <p>{monsterNameSrc}</p>
        <div>
          <p>Health: {health}</p>
          <Progress
            completed={health}
            maxCompleted={50}
            bgColor="#1b9a2b"
            borderRadius="0"
            isLabelVisible={false}
            height="10px"
          />
        </div>
      </div>
    </div>
  );
  console.log(monsterImageSrc);

  const Battle = ({ playerHp, enemyHp, onAttack, onRun }) => {
    if (randomNumber === 0 || randomNumber > 5) {
      return (
        <div className="center-container txt-shadow">
          <h1>Monster has Fled</h1>
          <button onClick={onRun}>Back to Map</button>
        </div>
      );
    }

    return (
      <div className="game">
        <div className="game-header">
          <p className="battle-header txt-shadow">Battle</p>
          <p style={{ paddingBottom: "5px" }} className="txt-shadow">
            You Captured: {stats.find((_) => _.key === "capturedScore")?.value}{" "}
            Creatures
          </p>
        </div>
        <div className="game-ui">
          <Enemy health={enemyHp} />
          <Player health={playerHp} />
        </div>
        <div className="choices">
          <button
            className="txt-shadow"
            onClick={() => onTodoAction("attack_mons")}
          >
            Attack
          </button>
          <button className="txt-shadow" onClick={onRun}>
            Run
          </button>
          <button
            className="txt-shadow tooltip"
            onClick={() => caught()}
            disabled={!(enemyHp <= 20)}
          >
            Capture The Creature!
            <span class="tooltiptext">
              Weaken the monster before capturing it.
            </span>
          </button>
        </div>
        <div className="waiting">
          <SyncLoader color={"lightgreen"} size={25} loading={isLoading} />
        </div>
      </div>
    );
  };

  const handleRun = () => {
    onTodoAction("run");
    setShowButton(false);
  };

  console.log(stats.find((_) => _.key === "mons_hp")?.value);

  console.log(stats.find((_) => _.key === "player_hp")?.value);

  console.log(stats.find((_) => _.key === "globalScore")?.value);

  if (isBattleOver) {
    return (
      <div className="center-container txt-shadow">
        <h1>Monster has been killed, unable to capture.</h1>
        <button onClick={handleRun}>Back to the Map</button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="center-container txt-shadow">
        <h1>Game Over</h1>
        <button
          onClick={() => {
            onTodoAction("revive");
            showButton(false);
          }}
        >
          Revive Character
        </button>
      </div>
    );
  }

  if (isInBattle) {
    return (
      <Battle
        playerHp={stats.find((_) => _.key === "player_hp")?.value}
        enemyHp={stats.find((_) => _.key === "mons_hp")?.value}
        onRun={handleRun}
      />
    );
  }

  if (isCaught) {
    return (
      <div className="center-container txt-shadow">
        <h1>Monster Caught!</h1>
        <img src={ball} className="vibrate"></img>
        <button onClick={handleRun}>Back to the Map</button>
      </div>
    );
  }

  const textcolor = { color: "white" };

  return (
    <div className="page-container">
      <div
        className="canvas-container"
        style={{ backgroundImage: `url(${grasveld})`, backgroundSize: "cover" }}
      >
        <canvas ref={canvasRef} width={500} height={500} />
        <p className="txt-shadow sticky" style={{}}>
          move the character using arrow keys
        </p>
        <div className="button-container">
          {showButton && (
            <div className="button-content">
              <img
                src={monsterImageSrc}
                alt="monster"
                className="image"
                width="40%"
                height="40%"
              />
              <h4 className="txt-shadow" style={textcolor}>
                Wild {monsterNameSrc} Appears!!
              </h4>
              <button
                className="battle-button txt-shadow"
                onClick={handleClick}
                disabled={isButtonDisabled}
              >
                Catch!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BoxCanvas;
